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
import { DisorderDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Select Disorder Component Properties
 */
export interface SelectDisorderProps {
  /** Disabled State */
  disabled?: boolean
  /** Disorders */
  disorders: { [key: string]: DisorderDetail }
  /** Disorder IDs to Exclude from Selection */
  excludeIds?: string[]
  /** OnChange Handler */
  onChange?: (value: string) => void
  /** Value */
  value?: string | null
}

/**
 * Select Disorder Component
 *
 * @param props Component Properties
 * @returns Select Disorder Component
 */
export function SelectDisorder({
  disabled,
  disorders,
  excludeIds,
  onChange,
  value
}: SelectDisorderProps): ReactElement {
  const [open, setOpen] = useState(false)

  /**
   * Handle Disorder Select
   *
   * @param type Selected Disorder
   */
  const handleSelect = (type: string) => {
    onChange?.(type)
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
          {value && disorders[value]
            ? disorders[value].disorder_name
            : 'Select Disorder'}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search disorders..." />
          <CommandList>
            <CommandEmpty>No disorders found.</CommandEmpty>
            <CommandGroup>
              {Object.values(disorders)
                .filter((d) => !excludeIds?.includes(d.id))
                .map((disorder) => (
                  <CommandItem
                    key={disorder.id}
                    value={disorder.id}
                    onSelect={() => handleSelect(disorder.id)}>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === disorder.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {disorder.disorder_name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
