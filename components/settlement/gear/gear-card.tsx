'use client'

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
import { LocalStateType } from '@/contexts/local-context'
import { useCatalogFetch } from '@/hooks/use-catalog-fetch'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { useToast } from '@/hooks/use-toast'
import { getGear } from '@/lib/dal/gear'
import {
  addSettlementGear,
  removeSettlementGear,
  updateSettlementGear
} from '@/lib/dal/settlement-gear'
import {
  ERROR_MESSAGE,
  GEAR_REMOVED_MESSAGE,
  GEAR_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  GearDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { PlusIcon, WrenchIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Gear Card Properties
 */
interface GearCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
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
  local,
  selectedSettlement,
  setSelectedSettlement
}: GearCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')

  const { data: availableGear, isLoaded: hasFetched } = useCatalogFetch<{
    [key: string]: GearDetail
  }>(selectedSettlement?.id, () => getGear(), {
    initial: {},
    errorContext: 'Settlement Gear Fetch Error',
    onReset: () => setAddOpen(false),
    onError: () => toast.error(ERROR_MESSAGE())
  })

  const selectableGear = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.gear ?? []).map((g) => g.gear_id)
    )
    return Object.values(availableGear)
      .filter((g) => !linkedIds.has(g.id))
      .sort((a, b) => a.gear_name.localeCompare(b.gear_name))
  }, [availableGear, selectedSettlement?.gear])

  const sortedGear = useMemo(
    () =>
      (selectedSettlement?.gear ?? [])
        .map((item, originalIndex) => ({ item, originalIndex }))
        .sort((a, b) => a.item.gear_name.localeCompare(b.item.gear_name)),
    [selectedSettlement?.gear]
  )

  /**
   * Handle Add Gear
   *
   * Optimistically adds a gear item to the settlement, then persists to the
   * DB.
   *
   * @param gearId Gear ID
   */
  const handleAdd = useCallback(
    (gearId: string | undefined) => {
      if (!gearId || !selectedSettlement) return

      const gearInfo = availableGear[gearId]
      if (!gearInfo) return

      setAddOpen(false)

      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['gear'][0] = {
        gear_id: gearId,
        gear_name: gearInfo.gear_name,
        id: tempId,
        quantity: 1,
        custom: gearInfo.custom ?? false
      }

      const updatedGear = [...selectedSettlement.gear, optimisticRow]

      setSelectedSettlement({
        ...selectedSettlement,
        gear: updatedGear
      })

      void mutate({
        context: 'Gear Add',
        persist: () =>
          addSettlementGear({
            gear_id: gearId,
            quantity: 1,
            settlement_id: selectedSettlement.id
          }),
        onSuccess: (id) => {
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
                  gear: prev.gear.filter((g) => g.id !== tempId)
                }
              : null
          )
        },
        successMessage: GEAR_UPDATED_MESSAGE()
      })
    },
    [selectedSettlement, availableGear, setSelectedSettlement, mutate]
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
        },
        successMessage: GEAR_REMOVED_MESSAGE()
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
        },
        successMessage: GEAR_UPDATED_MESSAGE(index)
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  return (
    <Card className="p-0 border-1 gap-0">
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
                        value={gear.gear_name}
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
        <div className="flex flex-col h-[240px]">
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
                    customDetail={
                      detail
                        ? {
                            custom: detail.custom,
                            sections: [
                              { label: 'Rules', content: detail.rules }
                            ]
                          }
                        : null
                    }
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
    </Card>
  )
}
