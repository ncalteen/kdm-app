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
import { SettlementDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Select Neurosis Component Properties
 */
export interface SelectNeurosisProps {
  /** OnChange Handler */
  onChange?: (value: string) => void
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Value */
  value?: string
}

/**
 * Select Neurosis Component
 *
 * Searchable combobox for selecting a neurosis.
 *
 * @param props Component Properties
 * @returns Select Neurosis Component
 */
export function SelectNeurosis({
  onChange,
  value: propValue,
  selectedSettlement
}: SelectNeurosisProps): ReactElement {
  const [open, setOpen] = useState(false)

  /**
   * Handle Neurosis Selection
   *
   * @param neurosisId Neurosis ID (or empty string to clear)
   */
  const handleSelect = (neurosisId: string) => {
    setOpen(false)
    onChange?.(neurosisId)
  }

  const neurosisOptions = (selectedSettlement?.neuroses ?? []).map((n) => ({
    value: n.id,
    label: n.neurosis_name
  }))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between border-0 border-b rounded-none focus:ring-0 px-2 text-sm">
          {propValue
            ? neurosisOptions.find((n) => n.value === propValue)?.label
            : 'Select neurosis...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search neurosis..." />
          <CommandList>
            <CommandEmpty>No neurosis found.</CommandEmpty>
            <CommandGroup>
              {neurosisOptions.map((n) => (
                <CommandItem
                  key={n.value ?? 'none'}
                  value={n.label}
                  onSelect={() =>
                    handleSelect(n.value === propValue ? '' : n.value)
                  }>
                  <Check
                    className={cn(
                      'mr-1 h-4 w-4',
                      propValue === n.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {n.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
