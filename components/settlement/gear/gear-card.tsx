'use client'

import { CreateCustomGearDialog } from '@/components/settlement/gear/create-custom-gear-dialog'
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
import { addGear, getGear } from '@/lib/dal/gear'
import {
  addSettlementGear,
  removeSettlementGear,
  updateSettlementGear
} from '@/lib/dal/settlement-gear'
import {
  ERROR_MESSAGE,
  GEAR_CREATED_MESSAGE,
  GEAR_REMOVED_MESSAGE,
  GEAR_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  GearDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { Plus, PlusIcon, WrenchIcon } from 'lucide-react'
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  const {
    data: availableGear,
    isLoaded: hasFetched,
    setData: setAvailableGear
  } = useCatalogFetch<{
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
        quantity: 1
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

  /** Check if an exact match for the search term already exists. */
  const exactMatchExists = Object.values(availableGear).some(
    (g) => g.gear_name.toLowerCase() === search.trim().toLowerCase()
  )

  /**
   * Handle Create Custom Gear
   *
   * Opens the create dialog, and on submit creates the custom gear item via
   * DAL then adds it to the settlement.
   */
  const handleCreate = useCallback(
    async (data: { gear_name: string; location_id: string | null }) => {
      if (creating || !selectedSettlement) return

      setCreating(true)

      try {
        const newGear = await addGear({
          custom: true,
          gear_name: data.gear_name,
          location_id: data.location_id
        })

        setAvailableGear((prev) => ({ ...prev, [newGear.id]: newGear }))
        setCreateDialogOpen(false)
        setSearch('')
        setAddOpen(false)
        toast.success(GEAR_CREATED_MESSAGE())

        // Add to settlement immediately
        const tempId = `temp-${crypto.randomUUID()}`
        const optimisticRow: SettlementDetail['gear'][0] = {
          gear_id: newGear.id,
          gear_name: newGear.gear_name,
          id: tempId,
          quantity: 1
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
              gear_id: newGear.id,
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
      } catch (error) {
        console.error('Gear Create Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setCreating(false)
      }
    },
    [
      creating,
      selectedSettlement,
      setSelectedSettlement,
      toast,
      mutate,
      setAvailableGear
    ]
  )

  /** Open the create dialog with the current search term pre-filled */
  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

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
                  <CommandEmpty>
                    {search.trim() ? (
                      <button
                        type="button"
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm justify-center"
                        onClick={openCreateDialog}>
                        <Plus className="h-4 w-4" />
                        Create &quot;{search.trim()}&quot;
                      </button>
                    ) : (
                      'No gear found.'
                    )}
                  </CommandEmpty>
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
                    {search.trim() && !exactMatchExists && (
                      <CommandItem
                        value={`__create__${search.trim()}`}
                        onSelect={openCreateDialog}>
                        <Plus className="h-4 w-4" />
                        Create &quot;{search.trim()}&quot;
                      </CommandItem>
                    )}
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
              sortedGear.map(({ item, originalIndex }) => (
                <GearItem
                  key={item.id}
                  index={originalIndex}
                  gear={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
          </div>
        </div>
      </CardContent>

      <CreateCustomGearDialog
        key={dialogKey}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreate}
        creating={creating}
        initialName={search.trim()}
      />
    </Card>
  )
}
