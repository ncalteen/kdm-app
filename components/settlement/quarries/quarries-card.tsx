'use client'

import {
  NewQuarryItem,
  QuarryItem
} from '@/components/settlement/quarries/quarry-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuarries } from '@/lib/dal/quarry'
import {
  addSettlementQuarries,
  removeSettlementQuarry,
  updateSettlementQuarry
} from '@/lib/dal/settlement-quarry'
import {
  ERROR_MESSAGE,
  QUARRY_ADDED_MESSAGE,
  QUARRY_REMOVED_MESSAGE,
  QUARRY_UNLOCKED_MESSAGE
} from '@/lib/messages'
import { QuarryDetail, SettlementDetail } from '@/lib/types'
import { PlusIcon, SwordIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Quarries Card Properties
 */
interface QuarriesCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Quarries Card Component
 *
 * Displays the quarries linked to a settlement and allows users to add, remove,
 * and toggle the unlocked state of each quarry. All mutations are applied
 * optimistically so the UI updates before the database transaction completes.
 *
 * @param props Quarries Card Properties
 * @returns Quarries Card Component
 */
export function QuarriesCard({
  selectedSettlement,
  setSelectedSettlement
}: QuarriesCardProps): ReactElement {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  // Available quarries for the select dropdown (fetched once per settlement).
  const [availableQuarries, setAvailableQuarries] = useState<{
    [key: string]: QuarryDetail
  }>({})

  // Track the previous settlement ID to reset state on settlement change.
  const [prevSettlementId, setPrevSettlementId] = useState<string | null>(
    selectedSettlement?.id ?? null
  )

  if (selectedSettlement?.id !== prevSettlementId) {
    setPrevSettlementId(selectedSettlement?.id ?? null)
    setIsAddingNew(false)
    setHasFetched(false)
  }

  // Fetch settlement quarries and available quarry options when settlement
  // changes.
  useEffect(() => {
    if (!selectedSettlement?.id || hasFetched) return

    let cancelled = false

    Promise.all([getQuarries()])
      .then(([quarries]) => {
        if (cancelled) return

        setAvailableQuarries(quarries)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        setAvailableQuarries({})
        setHasFetched(true)

        console.error('Settlement Quarries Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched])

  /**
   * Available Quarries Not Yet Added
   *
   * Filters the full list of available quarries to only those not already
   * linked to the settlement, preventing duplicates in the add dropdown.
   */
  const selectableQuarries = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.quarries ?? []).map((q) => q.quarry_id)
    )
    return Object.values(availableQuarries).filter((q) => !linkedIds.has(q.id))
  }, [availableQuarries, selectedSettlement?.quarries])

  /**
   * Handle Add Quarry
   *
   * Optimistically adds a quarry to the settlement, then persists to the DB.
   *
   * @param quarryId Quarry ID
   */
  const handleAdd = useCallback(
    (quarryId: string | undefined) => {
      if (!quarryId || !selectedSettlement) return setIsAddingNew(false)

      const quarryInfo = Object.values(availableQuarries).find(
        (q) => q.id === quarryId
      )
      if (!quarryInfo) return setIsAddingNew(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementDetail['quarries'][0] = {
        collective_cognition_level_1: false,
        collective_cognition_level_2: [false, false],
        collective_cognition_level_3: [false, false, false],
        collective_cognition_prologue: false,
        id: tempId,
        quarry_id: quarryId,
        monster_name: quarryInfo.monster_name,
        node: '',
        unlocked: false
      }

      setSelectedSettlement({
        ...selectedSettlement,
        quarries: [...selectedSettlement.quarries, optimisticRow]
      })
      setIsAddingNew(false)

      addSettlementQuarries([quarryId], selectedSettlement?.id)
        .then((row) => {
          // Replace the placeholder with the real row from the DB.
          setSelectedSettlement({
            ...selectedSettlement,
            quarries: selectedSettlement.quarries.map((q) =>
              q.id === tempId
                ? {
                    ...q,
                    id: row[0].id,
                    node: quarryInfo.node,
                    prologue: quarryInfo.prologue
                  }
                : q
            )
          })

          toast.success(QUARRY_ADDED_MESSAGE())
        })
        .catch((err: unknown) => {
          // Revert the optimistic insert.
          setSelectedSettlement({
            ...selectedSettlement,
            quarries: selectedSettlement.quarries.filter((q) => q.id !== tempId)
          })

          console.error('Quarry Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availableQuarries, setSelectedSettlement]
  )

  /**
   * Handle Remove Quarry
   *
   * Optimistically removes a quarry from the settlement, then persists to the
   * DB.
   *
   * @param index Settlement Quarry Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.quarries[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        quarries: selectedSettlement.quarries.filter((n) => n.id !== removed.id)
      })

      removeSettlementQuarry(removed.id)
        .then(() => toast.success(QUARRY_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          // Revert the optimistic removal.
          setSelectedSettlement({
            ...selectedSettlement,
            quarries: [
              ...selectedSettlement.quarries.slice(0, index),
              removed,
              ...selectedSettlement.quarries.slice(index)
            ]
          })

          console.error('Quarry Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  /**
   * Handle Toggle Unlocked
   *
   * Optimistically toggles the unlocked state of a quarry, then persists to
   * the DB.
   *
   * @param index Quarry Index
   * @param unlocked New Unlocked State
   */
  const handleToggleUnlocked = useCallback(
    (index: number, unlocked: boolean) => {
      if (!selectedSettlement) return

      const target = selectedSettlement?.quarries[index]
      if (!target) return

      setSelectedSettlement({
        ...selectedSettlement,
        quarries: selectedSettlement.quarries.map((n, i) =>
          i === index ? { ...n, unlocked } : n
        )
      })

      updateSettlementQuarry(target.id, { unlocked })
        .then(() =>
          toast.success(QUARRY_UNLOCKED_MESSAGE(target.monster_name, unlocked))
        )
        .catch((err: unknown) => {
          // Revert the optimistic toggle.
          setSelectedSettlement({
            ...selectedSettlement,
            quarries: selectedSettlement.quarries.map((n, i) =>
              i === index ? { ...n, unlocked: !unlocked } : n
            )
          })

          console.error('Quarry Toggle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <SwordIcon className="h-4 w-4" />
          Quarries
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew || selectableQuarries.length === 0}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {/* Quarries List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[240px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement ||
              selectedSettlement?.quarries.length === 0) &&
              !isAddingNew &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No quarries yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading quarries...
              </p>
            )}

            {selectedSettlement?.quarries.map((quarry, index) => (
              <QuarryItem
                key={quarry.id}
                index={index}
                monsterName={quarry.monster_name}
                node={quarry.node}
                onRemove={handleRemove}
                onToggleUnlocked={handleToggleUnlocked}
                unlocked={quarry.unlocked}
              />
            ))}

            {isAddingNew && (
              <NewQuarryItem
                availableQuarries={selectableQuarries}
                onCancel={() => setIsAddingNew(false)}
                onSave={handleAdd}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
