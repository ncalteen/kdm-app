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
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Multi-Select Dropdown Component Properties
 */
interface MultiSelectDropdownProps {
  /** Items */
  items: { id: string; name: string }[]
  /** Selected Item IDs */
  selectedIds: string[]
  /** Toggle Item Selection */
  onToggle: (id: string) => void
  /** Placeholder Text */
  placeholder: string
  /** Empty State Message */
  emptyMessage: string
  /** Trigger Button Label */
  triggerLabel: string
}

/**
 * Multi-Select Dropdown Component
 *
 * A reusable multi-select dropdown component using Radix UI's Popover and
 * Command components. Allows users to select multiple items from a list, with a
 * search input and an empty state message. The trigger button displays the
 * provided label and indicates the number of selected items.
 *
 * @param props Multi-Select Dropdown Component Properties
 * @returns Multi-Select Dropdown Component
 */
export function MultiSelectDropdown({
  items,
  selectedIds,
  onToggle,
  placeholder,
  emptyMessage,
  triggerLabel
}: MultiSelectDropdownProps): ReactElement {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[2.5rem] px-3">
          <span className="truncate">{triggerLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => onToggle(item.id)}>
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedIds.includes(item.id)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
