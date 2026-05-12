'use client'

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { SettlementDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { KeyboardEvent, ReactElement, Ref, useState } from 'react'

/**
 * Select Philosophy Component Properties
 */
export interface SelectPhilosophyProps {
  /** Disabled State */
  disabled?: boolean
  /** OnChange Handler */
  onChange?: (value: string) => void
  /** OnKeyDown Handler */
  onKeyDown?: (e: KeyboardEvent) => void
  /** Ref */
  ref?: Ref<HTMLButtonElement>
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Value */
  value?: string
}

/**
 * Select Philosophy Component
 *
 * @param props Component Properties
 * @returns Select Philosophy Component
 */
export function SelectPhilosophy({
  onChange,
  onKeyDown,
  value: propValue,
  disabled,
  selectedSettlement,
  ref
}: SelectPhilosophyProps): ReactElement {
  const [open, setOpen] = useState(false)

  /**
   * Handle Philosophy Selection
   *
   * @param currentValue Selected Philosophy Value
   * @returns Void; closes the popover and notifies the parent
   */
  const handleSelect = (currentValue: string) => {
    setOpen(false)
    onChange?.(currentValue)
  }

  const handleKeyDown = (e: KeyboardEvent) => onKeyDown?.(e)

  const philosophyOptions = [
    ...(selectedSettlement?.philosophies ?? []).map((p) => ({
      value: p.philosophy_id,
      label: p.philosophy_name,
      custom: p.custom
    }))
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-50 justify-between"
          disabled={disabled}
          onKeyDown={handleKeyDown}>
          {propValue
            ? philosophyOptions.find((p) => p.value === propValue)?.label
            : 'Select philosophy...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search philosophy..." />
          <CommandList>
            <CommandEmpty>No philosophy found.</CommandEmpty>
            <CommandGroup>
              {philosophyOptions.map((p) => (
                <CommandItem
                  key={p.value ?? 'none'}
                  value={p.value}
                  onSelect={handleSelect}>
                  <Check
                    className={cn(
                      'mr-1 h-4 w-4',
                      propValue === p.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {p.label}
                  {p.custom && (
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
  )
}
