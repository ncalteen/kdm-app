'use client'

import { CustomRulesIconButton } from '@/components/custom/custom-rules-sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { getMoods } from '@/lib/dal/mood'
import { getSurvivorStatuses } from '@/lib/dal/survivor-status'
import { getTraits } from '@/lib/dal/trait'
import {
  HuntMonsterDetail,
  MoodDetail,
  ShowdownMonsterDetail,
  SurvivorStatusDetail,
  TraitDetail
} from '@/lib/types'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useEffect, useState } from 'react'

/**
 * Monster Traits Moods Component Properties
 */
interface TraitsMoodsProps {
  /** Monster data */
  monster: HuntMonsterDetail | ShowdownMonsterDetail
  /** Called when the traits list should change */
  onTraitsChange: (traits: TraitDetail[]) => void
  /** Called when the moods list should change */
  onMoodsChange: (moods: MoodDetail[]) => void
  /** Called when the survivor statuses list should change */
  onSurvivorStatusesChange: (statuses: SurvivorStatusDetail[]) => void
}

/**
 * Monster Traits Moods Component
 *
 * Displays and manages the monster's traits, moods, and survivor statuses
 * using catalog pickers (popover + `Command`), matching the pattern used by
 * `MonsterForm`. New entries are not authored here — users select from their
 * available catalog (built-in + owned + shared) entries. Removal is
 * instantaneous.
 *
 * @param props Monster Traits Moods Properties
 * @returns Monster Traits Moods Component
 */
export function TraitsMoods({
  monster,
  onTraitsChange,
  onMoodsChange,
  onSurvivorStatusesChange
}: TraitsMoodsProps): ReactElement {
  const [availableTraits, setAvailableTraits] = useState<{
    [key: string]: TraitDetail
  }>({})
  const [availableMoods, setAvailableMoods] = useState<{
    [key: string]: MoodDetail
  }>({})
  const [availableStatuses, setAvailableStatuses] = useState<{
    [key: string]: SurvivorStatusDetail
  }>({})
  const [openTraitPicker, setOpenTraitPicker] = useState(false)
  const [openMoodPicker, setOpenMoodPicker] = useState(false)
  const [openStatusPicker, setOpenStatusPicker] = useState(false)

  // Load catalogs once. Catalog entries (built-in + owned + shared) are
  // stable across the session, so no refresh is needed after mount.
  useEffect(() => {
    let cancelled = false
    Promise.all([getTraits(), getMoods(), getSurvivorStatuses()])
      .then(([traits, moods, statuses]) => {
        if (cancelled) return
        setAvailableTraits(traits)
        setAvailableMoods(moods)
        setAvailableStatuses(statuses)
      })
      .catch((err: unknown) => {
        console.error('Monster Traits/Moods/Statuses Catalog Fetch Error:', err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selectableTraits = Object.values(availableTraits)
    .filter((t) => !monster.traits.some((mt) => mt.id === t.id))
    .sort((a, b) => a.trait_name.localeCompare(b.trait_name))

  const selectableMoods = Object.values(availableMoods)
    .filter((m) => !monster.moods.some((mm) => mm.id === m.id))
    .sort((a, b) => a.mood_name.localeCompare(b.mood_name))

  const selectableStatuses = Object.values(availableStatuses)
    .filter((s) => !monster.survivor_statuses.some((ms) => ms.id === s.id))
    .sort((a, b) =>
      a.survivor_status_name.localeCompare(b.survivor_status_name)
    )

  return (
    <>
      {/* Traits */}
      <div className="mb-2 lg:mt-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-muted-foreground flex-1 text-center">
            Traits
          </Label>
          <Popover open={openTraitPicker} onOpenChange={setOpenTraitPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-0 h-6 w-6"
                disabled={selectableTraits.length === 0}
                title="Add a trait">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
              <Command>
                <CommandInput placeholder="Search traits..." />
                <CommandList>
                  <CommandEmpty>No traits found.</CommandEmpty>
                  <CommandGroup>
                    {selectableTraits.map((trait) => (
                      <CommandItem
                        key={trait.id}
                        value={trait.trait_name}
                        onSelect={() => {
                          onTraitsChange([...monster.traits, trait])
                          setOpenTraitPicker(false)
                        }}>
                        {trait.trait_name}
                        {trait.custom && (
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
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {monster.traits.map((trait) => (
          <div key={trait.id} className="flex items-center gap-1">
            <Input value={trait.trait_name} disabled />
            <CustomRulesIconButton
              custom={trait.custom}
              title={trait.trait_name}
              sections={[{ label: 'Rules', content: trait.rules }]}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                onTraitsChange(monster.traits.filter((t) => t.id !== trait.id))
              }
              title="Remove trait">
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Separator className="my-2" />

      {/* Moods */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-muted-foreground flex-1 text-center">
            Moods
          </Label>
          <Popover open={openMoodPicker} onOpenChange={setOpenMoodPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-0 h-6 w-6"
                disabled={selectableMoods.length === 0}
                title="Add a mood">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
              <Command>
                <CommandInput placeholder="Search moods..." />
                <CommandList>
                  <CommandEmpty>No moods found.</CommandEmpty>
                  <CommandGroup>
                    {selectableMoods.map((mood) => (
                      <CommandItem
                        key={mood.id}
                        value={mood.mood_name}
                        onSelect={() => {
                          onMoodsChange([...monster.moods, mood])
                          setOpenMoodPicker(false)
                        }}>
                        {mood.mood_name}
                        {mood.custom && (
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
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {monster.moods.map((mood) => (
          <div key={mood.id} className="flex items-center gap-1">
            <Input value={mood.mood_name} disabled />
            <CustomRulesIconButton
              custom={mood.custom}
              title={mood.mood_name}
              sections={[{ label: 'Rules', content: mood.rules }]}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                onMoodsChange(monster.moods.filter((m) => m.id !== mood.id))
              }
              title="Remove mood">
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Separator className="my-2" />

      {/* Survivor Statuses */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-muted-foreground flex-1 text-center">
            Survivor Statuses
          </Label>
          <Popover open={openStatusPicker} onOpenChange={setOpenStatusPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-0 h-6 w-6"
                disabled={selectableStatuses.length === 0}
                title="Add a survivor status">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
              <Command>
                <CommandInput placeholder="Search survivor statuses..." />
                <CommandList>
                  <CommandEmpty>No survivor statuses found.</CommandEmpty>
                  <CommandGroup>
                    {selectableStatuses.map((status) => (
                      <CommandItem
                        key={status.id}
                        value={status.survivor_status_name}
                        onSelect={() => {
                          onSurvivorStatusesChange([
                            ...monster.survivor_statuses,
                            status
                          ])
                          setOpenStatusPicker(false)
                        }}>
                        {status.survivor_status_name}
                        {status.custom && (
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
        </div>
      </div>

      <div className="flex flex-col gap-1 pb-2">
        {monster.survivor_statuses.map((status) => (
          <div key={status.id} className="flex items-center gap-1">
            <Input value={status.survivor_status_name} disabled />
            <CustomRulesIconButton
              custom={status.custom}
              title={status.survivor_status_name}
              sections={[{ label: 'Rules', content: status.rules }]}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                onSurvivorStatusesChange(
                  monster.survivor_statuses.filter((s) => s.id !== status.id)
                )
              }
              title="Remove survivor status">
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </>
  )
}
