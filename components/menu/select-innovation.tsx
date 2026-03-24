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
import { InnovationDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Select Innovation Component Properties
 */
export interface SelectInnovationProps {
  /** Disabled State */
  disabled?: boolean
  /** Innovation IDs to Exclude from Selection */
  excludeIds?: string[]
  /** Innovations */
  innovations: { [key: string]: InnovationDetail }
  /** OnChange Handler */
  onChange?: (value: string) => void
  /** Value */
  value?: string | null
}

/**
 * Select Innovation Component
 *
 * @param props Component Properties
 * @returns Select Innovation Component
 */
export function SelectInnovation({
  disabled,
  excludeIds,
  innovations,
  onChange,
  value
}: SelectInnovationProps): ReactElement {
  const [open, setOpen] = useState(false)

  /**
   * Handle Innovation Select
   *
   * @param id Selected Innovation ID
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
          {value && innovations[value]
            ? innovations[value].innovation_name
            : 'Select Innovation'}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search innovations..." />
          <CommandList>
            <CommandEmpty>No innovations found.</CommandEmpty>
            <CommandGroup>
              {Object.values(innovations)
                .filter((i) => !excludeIds?.includes(i.id))
                .map((innovation) => (
                  <CommandItem
                    key={innovation.id}
                    value={innovation.innovation_name}
                    onSelect={() => handleSelect(innovation.id)}>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === innovation.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {innovation.innovation_name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
