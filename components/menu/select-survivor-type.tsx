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
import { SurvivorType } from '@/lib/enums'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Select Survivor Type Component Properties
 */
export interface SelectSurvivorTypeProps {
  /** Disabled State */
  disabled?: boolean
  /** Survivor Type ID */
  id?: string
  /** OnChange Handler */
  onChange?: (value: SurvivorType) => void
  /** Survivor Type Value */
  value?: SurvivorType
}

/**
 * Select Survivor Type Component
 *
 * @param props Component Properties
 * @returns Select Survivor Type Component
 */
export function SelectSurvivorType({
  onChange,
  value: propValue,
  disabled = false,
  id
}: SelectSurvivorTypeProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(propValue ?? '')

  const survivorTypeOptions = Object.values(SurvivorType).map(
    (survivorType) => ({
      value: survivorType,
      label: survivorType
    })
  )

  /**
   * Handle Survivor Type Selection
   *
   * @param currentValue Selected Survivor Value
   */
  const handleSelect = (currentValue: string) => {
    // Don't allow changes if disabled
    if (disabled) return

    // Do not allow clearing the selection
    if (!currentValue) return
    if (currentValue === value) return setOpen(false)

    setValue(currentValue)
    setOpen(false)

    if (onChange && currentValue) onChange(currentValue as SurvivorType)
  }

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(isOpen) => !disabled && setOpen(isOpen)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          id={id}
          className="w-full max-w-[250px] justify-between">
          {value
            ? survivorTypeOptions.find((option) => option.value === value)
                ?.label
            : 'Survivor type...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full max-w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search survivor type..." />
          <CommandList>
            <CommandEmpty>No survivor type found.</CommandEmpty>
            <CommandGroup>
              {survivorTypeOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}>
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
