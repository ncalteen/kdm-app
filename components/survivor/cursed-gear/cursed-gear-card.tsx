'use client'

import { CursedGearItem } from '@/components/survivor/cursed-gear/cursed-gear-item'
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
import { useToast } from '@/hooks/use-toast'
import {
  addSurvivorCursedGear,
  removeSurvivorCursedGear
} from '@/lib/dal/survivor-cursed-gear'
import {
  ERROR_MESSAGE,
  SURVIVOR_CURSED_GEAR_REMOVED_MESSAGE,
  SURVIVOR_CURSED_GEAR_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  SettlementDetail,
  SurvivorDetail,
  SurvivorsStateSetter
} from '@/lib/types'
import { PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/** Cursed gear item shape matching SurvivorDetail['cursed_gear'][0] */
type CursedGearRow = SurvivorDetail['cursed_gear'][number]

/**
 * Cursed Gear Card Properties
 */
interface CursedGearCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
}

/**
 * Cursed Gear Card Component
 *
 * Displays the cursed gear linked to a survivor and allows users to add and
 * remove items. The selectable list is derived from the settlement's current
 * gear. All mutations are applied optimistically so the UI updates before the
 * database transaction completes.
 *
 * @param props Cursed Gear Card Properties
 * @returns Cursed Gear Card Component
 */
export function CursedGearCard({
  local,
  selectedSettlement,
  selectedSurvivor,
  setSurvivors
}: CursedGearCardProps): ReactElement {
  const { toast } = useToast(local)

  const [prevSurvivor, setPrevSurvivor] = useState(selectedSurvivor)

  const [cursedGear, setCursedGear] = useState<CursedGearRow[]>(
    selectedSurvivor?.cursed_gear ?? []
  )
  const [addOpen, setAddOpen] = useState<boolean>(false)

  // Reset local state when the selected survivor changes.
  if (prevSurvivor !== selectedSurvivor) {
    setPrevSurvivor(selectedSurvivor)
    setCursedGear(selectedSurvivor?.cursed_gear ?? [])
    setAddOpen(false)
  }

  /**
   * Sorted Cursed Gear
   *
   * Alphabetically sorted view of the survivor's cursed gear, preserving
   * original indices so handlers operate on the correct source array element.
   */
  const sortedCursedGear = useMemo(
    () =>
      cursedGear
        .map((item, originalIndex) => ({ item, originalIndex }))
        .sort((a, b) => a.item.gear_name.localeCompare(b.item.gear_name)),
    [cursedGear]
  )

  /**
   * Selectable Gear
   *
   * Filters the settlement's gear to only those items not already marked as
   * cursed on this survivor, sorted alphabetically.
   */
  const selectableGear = useMemo(() => {
    const cursedIds = new Set(cursedGear.map((c) => c.id))
    return (selectedSettlement?.gear ?? [])
      .filter((g) => !cursedIds.has(g.gear_id))
      .sort((a, b) => a.gear_name.localeCompare(b.gear_name))
  }, [selectedSettlement?.gear, cursedGear])

  /**
   * Handle Add Cursed Gear
   *
   * Optimistically adds a cursed gear item to the survivor, then persists to
   * the DB.
   *
   * @param gearId Gear ID
   */
  const handleAdd = useCallback(
    (gearId: string | undefined) => {
      if (!gearId || !selectedSurvivor) return

      const gearDetail = selectedSettlement?.gear.find(
        (g) => g.gear_id === gearId
      )
      if (!gearDetail) return

      setAddOpen(false)

      const optimisticItem: CursedGearRow = {
        id: gearId,
        gear_name: gearDetail.gear_name,
        // Optimistic placeholders for the catalog flags. The realtime
        // refetch backfills the true values from the catalog row.
        custom: gearDetail.custom ?? false,
        author_username: gearDetail.author_username ?? null
      }
      const oldCursedGear = [...cursedGear]
      const updatedCursedGear = [...cursedGear, optimisticItem]

      setCursedGear(updatedCursedGear)
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor.id
            ? { ...s, cursed_gear: updatedCursedGear }
            : s
        )
      )

      addSurvivorCursedGear(selectedSurvivor.id, gearId)
        .then(() =>
          toast.success(
            SURVIVOR_CURSED_GEAR_UPDATED_MESSAGE(
              selectedSurvivor.survivor_name ?? 'Survivor',
              true
            )
          )
        )
        .catch((error: unknown) => {
          setCursedGear(oldCursedGear)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, cursed_gear: oldCursedGear }
                : s
            )
          )

          console.error('Cursed Gear Add Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [cursedGear, selectedSettlement, selectedSurvivor, setSurvivors, toast]
  )

  /**
   * Handle Remove Cursed Gear
   *
   * Optimistically removes a cursed gear item from the survivor, then persists
   * to the DB.
   *
   * @param index Cursed Gear Index (in the original unsorted array)
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSurvivor) return

      const removed = cursedGear[index]
      if (!removed) return

      const oldCursedGear = [...cursedGear]
      const updatedCursedGear = cursedGear.filter((_, i) => i !== index)

      setCursedGear(updatedCursedGear)
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor.id
            ? { ...s, cursed_gear: updatedCursedGear }
            : s
        )
      )

      removeSurvivorCursedGear(selectedSurvivor.id, removed.id)
        .then(() =>
          toast.success(
            SURVIVOR_CURSED_GEAR_REMOVED_MESSAGE(
              selectedSurvivor.survivor_name ?? 'Survivor'
            )
          )
        )
        .catch((error: unknown) => {
          setCursedGear(oldCursedGear)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, cursed_gear: oldCursedGear }
                : s
            )
          )

          console.error('Cursed Gear Remove Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [cursedGear, selectedSurvivor, setSurvivors, toast]
  )

  return (
    <Card className="p-2 border-0 gap-0">
      <CardHeader className="p-0">
        <CardTitle className="p-0 text-sm flex flex-row items-center justify-between h-8">
          Cursed Gear
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-6 w-6"
                disabled={selectableGear.length === 0}>
                <PlusIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search gear..." />
                <CommandList>
                  <CommandEmpty>No gear found.</CommandEmpty>
                  <CommandGroup>
                    {selectableGear.map((gear) => (
                      <CommandItem
                        key={gear.gear_id}
                        value={gear.gear_name}
                        onSelect={() => handleAdd(gear.gear_id)}>
                        {gear.gear_name}
                        {gear.custom && (
                          <Badge variant="outline" className="ml-auto">
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

      <CardContent className="p-0">
        <div className="flex flex-col">
          {sortedCursedGear.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No cursed gear yet
            </p>
          )}

          {sortedCursedGear.map(({ item, originalIndex }) => {
            const settlementGear = selectedSettlement?.gear.find(
              (g) => g.gear_id === item.id
            )

            return (
              <CursedGearItem
                key={item.id}
                custom={settlementGear?.custom ?? false}
                gearId={item.id}
                gearName={item.gear_name}
                onRemove={() => handleRemove(originalIndex)}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
