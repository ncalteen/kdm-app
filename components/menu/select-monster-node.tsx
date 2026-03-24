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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { getNemeses } from '@/lib/dal/nemesis'
import { getQuarries } from '@/lib/dal/quarry'
import { MonsterNode } from '@/lib/enums'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { type ReactElement, useEffect, useMemo, useState } from 'react'

/**
 * Select Monster Node Component Properties
 */
export interface SelectMonsterNodeProps {
  /** Component ID */
  id?: string
  /** Monster Node Type */
  nodeType: MonsterNode
  /** OnChange Callback */
  onChange?: (value: string[]) => void
  /** Selected Monsters */
  value?: string[]
  /** Whether the input is disabled */
  disabled?: boolean
}

/**
 * Select Monster Node Component
 *
 * Allows the user to select one or more monsters for a specific node type.
 * Uses a popover with search to display options. Multiple monsters can be
 * selected.
 *
 * @param props Component Properties
 * @returns Select Monster Node Component
 */
export function SelectMonsterNode({
  id,
  nodeType,
  onChange,
  value: propValue = [],
  disabled = false
}: SelectMonsterNodeProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [monsters, setMonsters] = useState<
    { id: string; monster_name: string }[]
  >([])

  useEffect(() => {
    let isCancelled = false

    const fetchMonsters = async () => {
      try {
        if (nodeType.startsWith('NQ')) {
          const quarries = await getQuarries([nodeType])
          if (isCancelled) return
          setMonsters(
            Object.values(quarries).map((q) => ({
              id: q.id,
              monster_name: q.monster_name
            }))
          )
        } else {
          const nemeses = await getNemeses([nodeType])
          if (isCancelled) return
          setMonsters(
            Object.values(nemeses).map((n) => ({
              id: n.id,
              monster_name: n.monster_name
            }))
          )
        }
      } catch (error: unknown) {
        if (isCancelled) return
        console.error('Monster Node Fetch Error:', error)
      }
    }

    fetchMonsters()

    return () => {
      isCancelled = true
    }
  }, [nodeType])

  /**
   * Toggle Monster Selection
   *
   * @param monsterId Monster ID to Toggle
   */
  const handleToggle = (monsterId: string) => {
    if (!onChange) return

    if (propValue.some((monster) => monster === monsterId))
      return onChange(propValue.filter((monster) => monster !== monsterId))

    const monsterData = monsters.find((monster) => monster.id === monsterId)
    if (monsterData) onChange([...propValue, monsterData.id])
  }

  /**
   * Remove Monster from Selection
   *
   * @param monsterId Monster ID to Remove
   */
  const handleRemove = (monsterId: string) =>
    onChange?.(propValue.filter((monster) => monster !== monsterId))

  const selectedMonsters = useMemo(() => {
    return propValue
      .map((monster) => monsters.find((m) => m.id === monster))
      .filter((m) => m !== undefined)
  }, [propValue, monsters])

  return (
    <div className="flex flex-col gap-2 w-full">
      <Popover
        open={open}
        onOpenChange={(isOpen) => !disabled && setOpen(isOpen)}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            id={id}
            disabled={disabled}
            className="w-full justify-between h-auto min-h-[2.5rem] px-3">
            <span className="truncate">
              {propValue.length > 0
                ? `${propValue.length} selected`
                : 'Select...'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Search monsters..." />
            <CommandList>
              <CommandEmpty>No monsters found for {nodeType}.</CommandEmpty>
              <CommandGroup>
                {monsters.map((monster) => (
                  <CommandItem
                    key={monster.id}
                    value={monster.monster_name}
                    onSelect={() => handleToggle(monster.id)}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        propValue.some((m) => m === monster.id)
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {monster.monster_name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedMonsters.length > 0 && (
        <div className="flex flex-col gap-1">
          {selectedMonsters.map((monster) => (
            <div
              key={monster.id}
              className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
              <span className="truncate flex-1">{monster.monster_name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(monster.id)}
                  className="hover:bg-secondary-foreground/20 rounded-sm p-0.5 shrink-0"
                  aria-label={`Remove ${monster.monster_name}`}>
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
