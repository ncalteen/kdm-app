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
import { PhilosophyDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Select Available Philosophy Component Properties
 *
 * Used for adding philosophies to a settlement from the full list of available
 * philosophies. Distinct from SelectPhilosophy, which selects from a
 * settlement's already-linked philosophies.
 */
export interface SelectAvailablePhilosophyProps {
  /** Disabled State */
  disabled?: boolean
  /** Philosophy IDs to Exclude from Selection */
  excludeIds?: string[]
  /** OnChange Handler */
  onChange?: (value: string) => void
  /** Philosophies */
  philosophies: { [key: string]: PhilosophyDetail }
  /** Value */
  value?: string | null
}

/**
 * Select Available Philosophy Component
 *
 * @param props Component Properties
 * @returns Select Available Philosophy Component
 */
export function SelectAvailablePhilosophy({
  disabled,
  excludeIds,
  onChange,
  philosophies,
  value
}: SelectAvailablePhilosophyProps): ReactElement {
  const [open, setOpen] = useState(false)

  /**
   * Handle Philosophy Select
   *
   * @param id Selected Philosophy ID
   */
  const handleSelect = (id: string) => {
    onChange?.(id)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between text-sm min-w-[280px]"
          disabled={disabled}>
          {value && philosophies[value]
            ? philosophies[value].philosophy_name
            : 'Select Philosophy'}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search philosophies..." />
          <CommandList>
            <CommandEmpty>No philosophies found.</CommandEmpty>
            <CommandGroup>
              {Object.values(philosophies)
                .filter((p) => !excludeIds?.includes(p.id))
                .sort((a, b) =>
                  a.philosophy_name.localeCompare(b.philosophy_name)
                )
                .map((philosophy) => (
                  <CommandItem
                    key={philosophy.id}
                    value={philosophy.philosophy_name}
                    onSelect={() => handleSelect(philosophy.id)}>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === philosophy.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {philosophy.philosophy_name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
