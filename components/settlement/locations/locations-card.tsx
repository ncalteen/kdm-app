'use client'

import {
  LocationItem,
  NewLocationItem
} from '@/components/settlement/locations/location-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLocations } from '@/lib/dal/location'
import {
  addSettlementLocations,
  removeSettlementLocation,
  updateSettlementLocation
} from '@/lib/dal/settlement-location'
import {
  ERROR_MESSAGE,
  LOCATION_REMOVED_MESSAGE,
  LOCATION_UNLOCKED_MESSAGE,
  LOCATION_UPDATED_MESSAGE
} from '@/lib/messages'
import { LocationDetail, SettlementDetail } from '@/lib/types'
import { HouseIcon, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Locations Card Properties
 */
interface LocationsCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
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
  selectedSettlement,
  setSelectedSettlement
}: LocationsCardProps): ReactElement {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  // Available locations for the select dropdown (fetched once per settlement).
  const [availableLocations, setAvailableLocations] = useState<{
    [key: string]: LocationDetail
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

  // Fetch available location options when settlement changes.
  useEffect(() => {
    if (!selectedSettlement?.id || hasFetched) return

    let cancelled = false

    getLocations()
      .then((locations) => {
        if (cancelled) return

        setAvailableLocations(locations)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        setAvailableLocations({})
        setHasFetched(true)

        console.error('Settlement Locations Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched])

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
    return Object.values(availableLocations).filter((l) => !linkedIds.has(l.id))
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
      if (!locationId || !selectedSettlement) return setIsAddingNew(false)

      const locationInfo = availableLocations[locationId]
      if (!locationInfo) return setIsAddingNew(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementDetail['locations'][0] = {
        id: tempId,
        location_id: locationId,
        location_name: locationInfo.location_name,
        unlocked: false
      }

      // Capture the updated locations list so async callbacks reference it
      // instead of the stale pre-update closure value.
      const updatedLocations = [...selectedSettlement.locations, optimisticRow]

      setSelectedSettlement({
        ...selectedSettlement,
        locations: updatedLocations
      })
      setIsAddingNew(false)

      addSettlementLocations([locationId], selectedSettlement.id)
        .then((row) => {
          // Replace the placeholder with the real row from the DB.
          setSelectedSettlement({
            ...selectedSettlement,
            locations: updatedLocations.map((l) =>
              l.id === tempId ? { ...l, id: row[0].id } : l
            )
          })

          toast.success(LOCATION_UPDATED_MESSAGE())
        })
        .catch((err: unknown) => {
          // Revert to the original locations (before the optimistic add).
          setSelectedSettlement({
            ...selectedSettlement,
            locations: selectedSettlement.locations
          })

          console.error('Location Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availableLocations, setSelectedSettlement]
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

      removeSettlementLocation(removed.id)
        .then(() => toast.success(LOCATION_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          // Revert the optimistic removal.
          setSelectedSettlement({
            ...selectedSettlement,
            locations: [
              ...selectedSettlement.locations.slice(0, index),
              removed,
              ...selectedSettlement.locations.slice(index)
            ]
          })

          console.error('Location Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
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

      updateSettlementLocation(target.id, { unlocked })
        .then(() => toast.success(LOCATION_UNLOCKED_MESSAGE(unlocked)))
        .catch((err: unknown) => {
          // Revert the optimistic toggle.
          setSelectedSettlement({
            ...selectedSettlement,
            locations: selectedSettlement.locations.map((l, i) =>
              i === index ? { ...l, unlocked: !unlocked } : l
            )
          })

          console.error('Location Toggle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <HouseIcon className="h-4 w-4" />
          Locations
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew || selectableLocations.length === 0}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {/* Locations List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.locations ||
              selectedSettlement.locations.length === 0) &&
              !isAddingNew &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No locations yet
                </p>
              )}

            {!hasFetched && !selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading locations...
              </p>
            )}

            {hasFetched &&
              sortedLocations.map(({ item, originalIndex }) => (
                <LocationItem
                  key={item.id}
                  index={originalIndex}
                  location={item}
                  onRemove={handleRemove}
                  onToggleUnlocked={handleToggleUnlocked}
                />
              ))}

            {isAddingNew && (
              <NewLocationItem
                availableLocations={selectableLocations}
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
