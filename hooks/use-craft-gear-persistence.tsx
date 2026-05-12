'use client'

import { LocalStateType } from '@/contexts/local-context'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import {
  applyCraftingAllocationToSettlementState,
  CraftingAllocation
} from '@/lib/crafting'
import {
  addSettlementGear,
  updateSettlementGear
} from '@/lib/dal/settlement-gear'
import { updateSettlementPhase } from '@/lib/dal/settlement-phase'
import { updateSettlementResource } from '@/lib/dal/settlement-resource'
import {
  GearDetail,
  SettlementDetail,
  SettlementPhaseDetail,
  SettlementStateSetter
} from '@/lib/types'
import { useCallback } from 'react'

/**
 * Persist Crafted Gear Properties
 */
export interface UseCraftGearPersistenceProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (
    settlementPhase: SettlementPhaseDetail | null
  ) => void
}

/**
 * Use Craft Gear Persistence
 *
 * Returns a `persistGearAddition` callback that performs the optimistic insert
 * of a settlement_gear row plus any concurrent settlement gear/resource
 * quantity deductions and endeavor deductions corresponding to the supplied
 * crafting allocation. State is rolled back on failure.
 *
 * The same flow drives gear added directly, gear crafted from a pattern, and
 * gear crafted from a seed pattern: the only difference between callers is the
 * source of `gearInfo` and the success message.
 *
 * @param props Use Craft Gear Persistence Properties
 * @returns Persist Gear Addition Callback
 */
export function useCraftGearPersistence({
  local,
  selectedSettlement,
  setSelectedSettlement,
  selectedSettlementPhase,
  setSelectedSettlementPhase
}: UseCraftGearPersistenceProps): {
  persistGearAddition: (
    gearInfo: GearDetail,
    allocation: CraftingAllocation,
    successMessage: string
  ) => void
} {
  const mutate = useOptimisticMutation(local)

  /**
   * Persist Gear Addition
   *
   * Performs the optimistic insert of a settlement_gear row plus any concurrent
   * settlement gear/resource quantity deductions and endeavor deductions
   * corresponding to the supplied crafting allocation. Rolls back state on
   * failure.
   */
  const persistGearAddition = useCallback(
    (
      gearInfo: GearDetail,
      allocation: CraftingAllocation,
      successMessage: string
    ) => {
      if (!selectedSettlement) return

      // Pre-deduction snapshot for rollback.
      const previousGear = selectedSettlement.gear
      const previousResources = selectedSettlement.resources
      const previousPhase = selectedSettlementPhase

      const { gear: deductedGear, resources: deductedResources } =
        applyCraftingAllocationToSettlementState(
          allocation,
          previousGear,
          previousResources
        )

      // Endeavors live on the settlement phase, not the settlement, so they
      // are deducted separately. The dialog blocks confirmation when the
      // settlement phase is missing while there is an endeavor cost, so by
      // the time we reach this point, a phase is guaranteed when
      // endeavorDeduction > 0.
      const endeavorDeduction = allocation.endeavorDeduction ?? 0

      // If the settlement already has a row for this gear, stack onto it
      // instead of creating a duplicate row.
      const existingRow = previousGear.find((g) => g.gear_id === gearInfo.id)

      let tempId: string | null = null
      let nextGear: SettlementDetail['gear']

      if (existingRow) {
        nextGear = deductedGear.map((g) =>
          g.id === existingRow.id ? { ...g, quantity: g.quantity + 1 } : g
        )
      } else {
        tempId = `temp-${crypto.randomUUID()}`

        const optimisticRow: SettlementDetail['gear'][0] = {
          gear_id: gearInfo.id,
          gear_name: gearInfo.gear_name,
          id: tempId,
          quantity: 1,
          custom: gearInfo.custom ?? false,
          // Optimistic placeholder; the realtime/refetch reconciles
          // `author_username` from the catalog row's `user_id` (E2.8).
          author_user_id: null,
          author_username: null,
          author_avatar_url: null
        }

        nextGear = [...deductedGear, optimisticRow]
      }

      setSelectedSettlement({
        ...selectedSettlement,
        gear: nextGear,
        resources: deductedResources
      })

      if (
        endeavorDeduction > 0 &&
        previousPhase &&
        previousPhase.endeavors >= endeavorDeduction
      )
        setSelectedSettlementPhase({
          ...previousPhase,
          endeavors: previousPhase.endeavors - endeavorDeduction
        })

      void mutate({
        context: 'Gear Add',
        persist: async () => {
          // Persist the gear deductions first so any failure rolls back the
          // local settlement before we create the new row.
          for (const d of allocation.gearDeductions) {
            const row = previousGear.find((g) => g.id === d.settlementGearId)
            if (!row) continue

            await updateSettlementGear(d.settlementGearId, {
              quantity: Math.max(0, row.quantity - d.quantity)
            })
          }

          // Aggregate per-resource deductions in case multiple type-cost
          // allocations target the same settlement_resource row.
          const aggregatedResource = new Map<string, number>()
          for (const d of allocation.resourceDeductions)
            aggregatedResource.set(
              d.settlementResourceId,
              (aggregatedResource.get(d.settlementResourceId) ?? 0) + d.quantity
            )

          for (const [id, qty] of aggregatedResource) {
            const row = previousResources.find((r) => r.id === id)
            if (!row) continue

            await updateSettlementResource(id, {
              quantity: Math.max(0, row.quantity - qty)
            })
          }

          // Persist the endeavor deduction against the active settlement phase.
          // The dialog ensures a phase exists with sufficient endeavors before
          // we get here.
          if (endeavorDeduction > 0 && previousPhase)
            await updateSettlementPhase(previousPhase.id, {
              endeavors: Math.max(
                0,
                previousPhase.endeavors - endeavorDeduction
              )
            })

          if (existingRow) {
            // Increment the existing row's quantity rather than inserting a
            // duplicate gear row.
            await updateSettlementGear(existingRow.id, {
              quantity: existingRow.quantity + 1
            })

            return existingRow.id
          }

          return addSettlementGear({
            gear_id: gearInfo.id,
            quantity: 1,
            settlement_id: selectedSettlement.id
          })
        },
        onSuccess: (id) => {
          if (!tempId) return

          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  gear: prev.gear.map((g) =>
                    g.id === tempId ? { ...g, id } : g
                  )
                }
              : null
          )
        },
        rollback: () => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  gear: previousGear,
                  resources: previousResources
                }
              : null
          )

          if (endeavorDeduction > 0 && previousPhase)
            setSelectedSettlementPhase(previousPhase)
        },
        successMessage
      })
    },
    [
      selectedSettlement,
      setSelectedSettlement,
      selectedSettlementPhase,
      setSelectedSettlementPhase,
      mutate
    ]
  )

  return { persistGearAddition }
}
