'use client'

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
import { getTraits } from '@/lib/dal/trait'
import {
  HuntMonsterDetail,
  MoodDetail,
  ShowdownMonsterDetail,
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
}

/**
 * Monster Traits Moods Component
 *
 * Displays and manages the monster's traits and moods using catalog pickers
 * (popover + `Command`), matching the pattern used by `MonsterForm`. New
 * traits/moods are not authored here — users select from their available
 * catalog (built-in + owned + shared) entries. Removal is instantaneous.
 *
 * @param props Monster Traits Moods Properties
 * @returns Monster Traits Moods Component
 */
export function TraitsMoods({
  monster,
  onTraitsChange,
  onMoodsChange
}: TraitsMoodsProps): ReactElement {
  const [availableTraits, setAvailableTraits] = useState<{
    [key: string]: TraitDetail
  }>({})
  const [availableMoods, setAvailableMoods] = useState<{
    [key: string]: MoodDetail
  }>({})
  const [openTraitPicker, setOpenTraitPicker] = useState(false)
  const [openMoodPicker, setOpenMoodPicker] = useState(false)

  // Load catalogs once. Catalog entries (built-in + owned + shared) are
  // stable across the session, so no refresh is needed after mount.
  useEffect(() => {
    let cancelled = false
    Promise.all([getTraits(), getMoods()])
      .then(([traits, moods]) => {
        if (cancelled) return
        setAvailableTraits(traits)
        setAvailableMoods(moods)
      })
      .catch((err: unknown) => {
        console.error('Monster Traits/Moods Catalog Fetch Error:', err)
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
        {monster.moods.map((mood) => (
          <div key={mood.id} className="flex items-center gap-1">
            <Input value={mood.mood_name} disabled />
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
    </>
  )
}
