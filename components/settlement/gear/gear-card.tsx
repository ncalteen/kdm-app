'use client'

import { CraftItemDialog } from '@/components/crafting/craft-item-dialog'
import { GearItem } from '@/components/settlement/gear/gear-item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useCatalogFetch } from '@/hooks/use-catalog-fetch'
import { useCraftGearPersistence } from '@/hooks/use-craft-gear-persistence'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import {
  CraftingAllocation,
  CraftingCostsSpec,
  emptyCraftingCosts,
  gearToCraftingCostsSpec,
  hasCraftingCosts
} from '@/lib/crafting'
import { getGear } from '@/lib/dal/gear'
import { getResources } from '@/lib/dal/resource'
import {
  removeSettlementGear,
  updateSettlementGear
} from '@/lib/dal/settlement-gear'
import { ERROR_MESSAGE } from '@/lib/messages'
import {
  GearDetail,
  ResourceDetail,
  SettlementDetail,
  SettlementPhaseDetail,
  SettlementStateSetter
} from '@/lib/types'
import { PlusIcon, WrenchIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Gear Card Properties
 */
interface GearCardProps {
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
 * Gear Card Component
 *
 * Displays the gear linked to a settlement and allows users to add, remove,
 * and adjust quantity. All mutations are applied optimistically so the UI
 * updates before the database transaction completes.
 *
 * @param props Gear Card Properties
 * @returns Gear Card Component
 */
export function GearCard({
  selectedSettlement,
  setSelectedSettlement,
  selectedSettlementPhase,
  setSelectedSettlementPhase
}: GearCardProps): ReactElement {
  const mutate = useOptimisticMutation()

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')

  const [craftDialogOpen, setCraftDialogOpen] = useState<boolean>(false)
  const [pendingCraftGear, setPendingCraftGear] = useState<GearDetail | null>(
    null
  )
  const [pendingCraftCosts, setPendingCraftCosts] =
    useState<CraftingCostsSpec>(emptyCraftingCosts())

  const { data: availableGear, isLoaded: hasFetched } = useCatalogFetch<{
    [key: string]: GearDetail
  }>(selectedSettlement?.id, () => getGear(), {
    initial: {},
    errorContext: 'Settlement Gear Fetch Error',
    onReset: () => setAddOpen(false),
    onError: () => toast.error(ERROR_MESSAGE())
  })

  const { data: availableResources } = useCatalogFetch<{
    [key: string]: ResourceDetail
  }>(selectedSettlement?.id, () => getResources(), {
    initial: {},
    errorContext: 'Settlement Resource Fetch Error',
    onError: () => toast.error(ERROR_MESSAGE())
  })

  const selectableGear = useMemo(
    () =>
      Object.values(availableGear).sort((a, b) =>
        a.gear_name.localeCompare(b.gear_name)
      ),
    [availableGear]
  )

  const sortedGear = useMemo(
    () =>
      (selectedSettlement?.gear ?? [])
        .map((item, originalIndex) => ({ item, originalIndex }))
        .sort((a, b) => a.item.gear_name.localeCompare(b.item.gear_name)),
    [selectedSettlement?.gear]
  )

  /**
   * Persist Gear Addition
   *
   * Performs the optimistic insert of a settlement_gear row plus any
   * concurrent settlement gear/resource quantity deductions corresponding to
   * the supplied crafting allocation. State is rolled back on failure.
   */
  const { persistGearAddition } = useCraftGearPersistence({
    selectedSettlement,
    setSelectedSettlement,
    selectedSettlementPhase,
    setSelectedSettlementPhase
  })

  /**
   * Handle Add Gear
   *
   * Picks the gear from the popover. When the gear has crafting costs, the
   * craft dialog is opened so the user can choose whether (and how) to spend
   * settlement gear/resources. Gear with no costs is added immediately.
   *
   * @param gearId Gear ID
   */
  const handleAdd = useCallback(
    (gearId: string | undefined) => {
      if (!gearId || !selectedSettlement) return

      const gearInfo = availableGear[gearId]
      if (!gearInfo) return

      setAddOpen(false)

      const costs = gearToCraftingCostsSpec(gearInfo)

      if (hasCraftingCosts(costs)) {
        setPendingCraftGear(gearInfo)
        setPendingCraftCosts(costs)
        setCraftDialogOpen(true)
        return
      }

      persistGearAddition(gearInfo, {
        gearDeductions: [],
        resourceDeductions: [],
        endeavorDeduction: 0
      })
    },
    [selectedSettlement, availableGear, persistGearAddition]
  )

  /**
   * Handle Craft Confirm
   *
   * Invoked when the user confirms the crafting dialog. Closes the dialog
   * and completes the gear addition (with or without deductions).
   */
  const handleCraftConfirm = useCallback(
    ({
      allocation
    }: {
      deductCosts: boolean
      allocation: CraftingAllocation
    }) => {
      if (!pendingCraftGear) return
      setCraftDialogOpen(false)
      persistGearAddition(pendingCraftGear, allocation)
      setPendingCraftGear(null)
      setPendingCraftCosts(emptyCraftingCosts())
    },
    [pendingCraftGear, persistGearAddition]
  )

  /**
   * Handle Remove Gear
   *
   * Optimistically removes a gear item from the settlement, then persists to
   * the DB.
   *
   * @param index Settlement Gear Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.gear[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        gear: selectedSettlement.gear.filter((g) => g.id !== removed.id)
      })

      void mutate({
        context: 'Gear Remove',
        persist: () => removeSettlementGear(removed.id),
        rollback: () => {
          setSelectedSettlement((prev) => {
            if (!prev || prev.gear.some((g) => g.id === removed.id)) return prev
            return { ...prev, gear: [...prev.gear, removed] }
          })
        }
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /**
   * Handle Quantity Change
   *
   * Optimistically updates the quantity of a gear item, then persists to the
   * DB.
   *
   * @param index Gear Index
   * @param quantity New Quantity
   */
  const handleQuantityChange = useCallback(
    (index: number, quantity: number) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.gear[index]
      if (!target) return

      const oldQuantity = target.quantity

      setSelectedSettlement({
        ...selectedSettlement,
        gear: selectedSettlement.gear.map((g, i) =>
          i === index ? { ...g, quantity } : g
        )
      })

      void mutate({
        context: 'Gear Quantity',
        persist: () => updateSettlementGear(target.id, { quantity }),
        rollback: () => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  gear: prev.gear.map((g) =>
                    g.id === target.id ? { ...g, quantity: oldQuantity } : g
                  )
                }
              : null
          )
        }
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <WrenchIcon className="h-4 w-4" />
          Gear Storage
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-0 h-8 w-8"
                disabled={selectableGear.length === 0}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search gear..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>No gear found.</CommandEmpty>
                  <CommandGroup>
                    {selectableGear.map((gear) => (
                      <CommandItem
                        key={gear.id}
                        value={gear.id}
                        keywords={[gear.gear_name]}
                        onSelect={() => handleAdd(gear.id)}>
                        {gear.gear_name}
                        {gear.custom && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Custom
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-60">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.gear ||
              selectedSettlement.gear.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No gear yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading gear...
              </p>
            )}

            {hasFetched &&
              sortedGear.map(({ item, originalIndex }) => {
                const detail = availableGear[item.gear_id]

                return (
                  <GearItem
                    key={item.id}
                    custom={detail?.custom}
                    index={originalIndex}
                    gear={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                )
              })}
          </div>
        </div>
      </CardContent>

      <CraftItemDialog
        key={pendingCraftGear?.id ?? 'craft-dialog-empty'}
        open={craftDialogOpen}
        onOpenChange={(next) => {
          setCraftDialogOpen(next)
          if (!next) {
            setPendingCraftGear(null)
            setPendingCraftCosts(emptyCraftingCosts())
          }
        }}
        title={
          pendingCraftGear
            ? `Craft ${pendingCraftGear.gear_name}`
            : 'Craft Gear'
        }
        targetGear={pendingCraftGear}
        costs={pendingCraftCosts}
        gearCatalog={availableGear}
        resourceCatalog={availableResources}
        settlementGear={selectedSettlement?.gear ?? []}
        settlementResources={selectedSettlement?.resources ?? []}
        settlementPhase={selectedSettlementPhase}
        onConfirm={handleCraftConfirm}
      />
    </Card>
  )
}
