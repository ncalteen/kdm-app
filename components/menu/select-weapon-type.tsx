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
import { getWeaponTypes } from '@/lib/dal/weapon-type'
import { Tables } from '@/lib/database.types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useEffect, useState } from 'react'

/**
 * Select Weapon Type Component Properties
 */
export interface SelectWeaponTypeProps {
  /** Disabled State */
  disabled?: boolean
  /** OnChange Handler */
  onChange?: (value: string) => void
  /** Value */
  value?: string | null
}

/**
 * Select Weapon Type Component
 *
 * @param props Component Properties
 * @returns Select Weapon Type Component
 */
export function SelectWeaponType({
  disabled,
  onChange,
  value
}: SelectWeaponTypeProps): ReactElement {
  const [weaponTypes, setWeaponTypes] = useState<{
    [key: string]: Omit<
      Tables<'weapon_type'>,
      'created_at' | 'updated_at' | 'custom' | 'user_id'
    >
  }>({})

  useEffect(() => {
    getWeaponTypes()
      .then((types) => setWeaponTypes(types))
      .catch((error) => {
        console.error('Weapon Types Fetch Error:', error)
      })
  }, [])

  const [open, setOpen] = useState(false)

  /**
   * Handle Type Select
   *
   * @param type Selected Weapon Type
   */
  const handleTypeSelect = (type: string) => {
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
          className="justify-between text-sm min-w-[180px]"
          disabled={disabled}>
          {value ?? 'Select Type'}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search weapon type..." />
          <CommandList>
            <CommandEmpty>No weapon types found.</CommandEmpty>
            <CommandGroup>
              {Object.values(weaponTypes).map((type) => (
                <CommandItem
                  key={type.id}
                  value={type.id}
                  onSelect={() => handleTypeSelect(type.id)}>
                  <Check
                    className={cn(
                      'h-4 w-4',
                      value === type.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {type.weapon_type_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
