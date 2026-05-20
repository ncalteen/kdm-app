'use client'

import { CustomItemDialog } from '@/components/custom/dialogs/custom-item-dialog'
import { LocationItem } from '@/components/settlement/locations/location-item'
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
import { addLocation, getLocations } from '@/lib/dal/location'
import {
  addSettlementLocations,
  removeSettlementLocation,
  updateSettlementLocation
} from '@/lib/dal/settlement-location'
import { ERROR_MESSAGE } from '@/lib/messages'
import {
  LocationDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { HouseIcon, Plus, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Locations Card Properties
 */
interface LocationsCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
}

/**
 * Locations Card Component
 *
 * Displays the locations linked to a settlement and allows users to add,
 * remove, and toggle the unlocked state. All mutations are applied
 * optimistically so the UI updates before the database transaction completes.
 *
 * @param props Locations Card Properties
 * @returns Locations Card Component
 */
export function LocationsCard({
  local,
  selectedSettlement,
  setSelectedSettlement
}: LocationsCardProps): ReactElement {
  const mutate = useOptimisticMutation()

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createDialogName, setCreateDialogName] = useState('')
  const [createDialogKey, setCreateDialogKey] = useState(0)

  // Available locations for the select dropdown (fetched once per settlement).
  const {
    data: availableLocations,
    isLoaded: hasFetched,
    setData: setAvailableLocations
  } = useCatalogFetch<{
    [key: string]: LocationDetail
  }>(selectedSettlement?.id, () => getLocations(), {
    initial: {},
    errorContext: 'Settlement Locations Fetch Error',
    onReset: () => setAddOpen(false),
    onError: () => toast.error(ERROR_MESSAGE())
  })

  /**
   * Available Locations Not Yet Added
   *
   * Filters the full list of available locations to only those not already
   * linked to the settlement, preventing duplicates in the add dropdown.
   */
  const selectableLocations = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.locations ?? []).map((l) => l.location_id)
    )
    return Object.values(availableLocations)
      .filter((l) => !linkedIds.has(l.id))
      .sort((a, b) => a.location_name.localeCompare(b.location_name))
  }, [availableLocations, selectedSettlement?.locations])

  /**
   * Sorted Locations
   *
   * Alphabetically sorted view of the settlement's locations, preserving
   * original indices so handlers operate on the correct source array element.
   */
  const sortedLocations = useMemo(
    () =>
      (selectedSettlement?.locations ?? [])
        .map((item, originalIndex) => ({
          item,
          originalIndex
        }))
        .sort((a, b) =>
          a.item.location_name.localeCompare(b.item.location_name)
        ),
    [selectedSettlement?.locations]
  )

  /**
   * Handle Add Location
   *
   * Optimistically adds a location to the settlement, then persists to the DB.
   *
   * @param locationId Location ID
   */
  const handleAdd = useCallback(
    (locationId: string | undefined) => {
      if (!locationId || !selectedSettlement) return

      const locationInfo = availableLocations[locationId]
      if (!locationInfo) return

      setAddOpen(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['locations'][0] = {
        id: tempId,
        location_id: locationId,
        location_name: locationInfo.location_name,
        rules: locationInfo.rules ?? null,
        unlocked: false,
        custom: locationInfo.custom,
        // Optimistic placeholder; the realtime/refetch reconciles
        // `author_username` from the catalog row's `user_id` (E2.8).
        author_user_id: null,
        author_username: null,
        author_avatar_url: null
      }

      // Capture the updated locations list so async callbacks reference it
      // instead of the stale pre-update closure value.
      const updatedLocations = [...selectedSettlement.locations, optimisticRow]

      setSelectedSettlement({
        ...selectedSettlement,
        locations: updatedLocations
      })

      void mutate({
        context: 'Location Add',
        persist: () =>
          addSettlementLocations([locationId], selectedSettlement.id),
        onSuccess: (row) => {
          // Replace the placeholder with the real row from the DB.
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  locations: prev.locations.map((l) =>
                    l.id === tempId ? { ...l, id: row[0].id } : l
                  )
                }
              : null
          )
        },
        rollback: () => {
          // Remove the optimistic placeholder.
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  locations: prev.locations.filter((l) => l.id !== tempId)
                }
              : null
          )
        }
      })
    },
    [selectedSettlement, availableLocations, setSelectedSettlement, mutate]
  )

  /**
   * Handle Remove Location
   *
   * Optimistically removes a location from the settlement, then persists to
   * the DB.
   *
   * @param index Settlement Location Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.locations[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        locations: selectedSettlement.locations.filter(
          (l) => l.id !== removed.id
        )
      })

      void mutate({
        context: 'Location Remove',
        persist: () => removeSettlementLocation(removed.id),
        rollback: () => {
          // Re-add the removed item if it's not already present.
          setSelectedSettlement((prev) => {
            if (!prev || prev.locations.some((l) => l.id === removed.id))
              return prev
            return { ...prev, locations: [...prev.locations, removed] }
          })
        }
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /**
   * Handle Toggle Unlocked
   *
   * Optimistically toggles the unlocked state of a location, then persists to
   * the DB.
   *
   * @param index Location Index
   * @param unlocked New Unlocked State
   */
  const handleToggleUnlocked = useCallback(
    (index: number, unlocked: boolean) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.locations[index]
      if (!target) return

      setSelectedSettlement({
        ...selectedSettlement,
        locations: selectedSettlement.locations.map((l, i) =>
          i === index ? { ...l, unlocked } : l
        )
      })

      void mutate({
        context: 'Location Toggle',
        persist: () => updateSettlementLocation(target.id, { unlocked }),
        rollback: () => {
          // Revert the optimistic toggle.
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  locations: prev.locations.map((l) =>
                    l.id === target.id ? { ...l, unlocked: !unlocked } : l
                  )
                }
              : null
          )
        }
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /** Check if an exact match for the search term already exists. */
  const exactMatchExists = Object.values(availableLocations).some(
    (l) => l.location_name.toLowerCase() === search.trim().toLowerCase()
  )

  /**
   * Open Create Dialog
   *
   * Closes the add popover and opens the custom item dialog with the current
   * search term pre-filled as the name.
   */
  const openCreateDialog = useCallback(() => {
    const name = search.trim()
    if (!name || !selectedSettlement) return

    setCreateDialogName(name)
    setCreateDialogKey((k) => k + 1)
    setAddOpen(false)
    setCreateDialogOpen(true)
  }, [search, selectedSettlement])

  /**
   * Handle Create Custom Location
   *
   * Creates a new custom location with the provided name and rules, adds it
   * to available locations, then links it to the settlement.
   */
  const handleCreate = useCallback(
    async (data: { name: string; rules: string }) => {
      const name = data.name.trim()
      if (!name || creating || !selectedSettlement) return

      setCreating(true)

      try {
        const newLocation = await addLocation({
          custom: true,
          location_name: name,
          rules: data.rules || null
        })

        setAvailableLocations((prev) => ({
          ...prev,
          [newLocation.id]: newLocation
        }))

        setSearch('')
        setCreateDialogOpen(false)

        // Add to settlement immediately
        const tempId = `temp-${crypto.randomUUID()}`
        const optimisticRow: SettlementDetail['locations'][0] = {
          id: tempId,
          location_id: newLocation.id,
          location_name: newLocation.location_name,
          rules: newLocation.rules ?? null,
          unlocked: false,
          custom: true,
          // Optimistic placeholder; the realtime/refetch reconciles
          // `author_username` from the catalog row's `user_id` (E2.8).
          author_user_id: null,
          author_username: null,
          author_avatar_url: null
        }
        const updatedLocations = [
          ...selectedSettlement.locations,
          optimisticRow
        ]

        setSelectedSettlement({
          ...selectedSettlement,
          locations: updatedLocations
        })

        void mutate({
          context: 'Location Add',
          persist: () =>
            addSettlementLocations([newLocation.id], selectedSettlement.id),
          onSuccess: (row) => {
            setSelectedSettlement((prev) =>
              prev
                ? {
                    ...prev,
                    locations: prev.locations.map((l) =>
                      l.id === tempId ? { ...l, id: row[0].id } : l
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
                    locations: prev.locations.filter((l) => l.id !== tempId)
                  }
                : null
            )
          }
        })
      } catch (error) {
        console.error('Location Create Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setCreating(false)
      }
    },
    [
      creating,
      selectedSettlement,
      setSelectedSettlement,
      mutate,
      setAvailableLocations
    ]
  )

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <HouseIcon className="h-4 w-4" />
          Locations
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-0 h-8 w-8"
                disabled={selectableLocations.length === 0}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search locations..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {search.trim() ? (
                      <button
                        type="button"
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm justify-center"
                        disabled={creating}
                        onClick={openCreateDialog}>
                        <Plus className="h-4 w-4" />
                        {creating ? 'Creating...' : `Create "${search.trim()}"`}
                      </button>
                    ) : (
                      'No locations found.'
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {selectableLocations.map((location) => (
                      <CommandItem
                        key={location.id}
                        value={location.id}
                        keywords={[location.location_name]}
                        onSelect={() => handleAdd(location.id)}>
                        {location.location_name}
                        {location.custom && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Custom
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                    {search.trim() && !exactMatchExists && (
                      <CommandItem
                        value={`__create__${search.trim()}`}
                        onSelect={openCreateDialog}
                        disabled={creating}>
                        <Plus className="h-4 w-4" />
                        {creating ? 'Creating...' : `Create "${search.trim()}"`}
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>

      {/* Locations List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-100">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.locations ||
              selectedSettlement.locations.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No locations have been raised yet.
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Surveying the settlement...
              </p>
            )}

            {hasFetched &&
              sortedLocations.map(({ item, originalIndex }) => {
                const detail = availableLocations[item.location_id]

                return (
                  <LocationItem
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
                    location={item}
                    onRemove={handleRemove}
                    onToggleUnlocked={handleToggleUnlocked}
                  />
                )
              })}
          </div>
        </div>
      </CardContent>

      <CustomItemDialog
        key={`create-location-${createDialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={creating}
        initialName={createDialogName}
        title="Create Custom Location"
        description="A new refuge emerges from the darkness."
        nameLabel="Location Name"
        namePlaceholder="Enter location name"
        saveLabel="Create"
        savingLabel="Creating..."
      />
    </Card>
  )
}
