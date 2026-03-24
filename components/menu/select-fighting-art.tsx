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
import { FightingArtDetail, SecretFightingArtDetail } from '@/lib/types'
import { ChevronsUpDown } from 'lucide-react'
import { ReactElement, useMemo, useState } from 'react'

/**
 * Unified Fighting Art Option
 *
 * Represents either a regular or secret fighting art in the combined dropdown.
 */
interface FightingArtOption {
  /** Fighting Art ID */
  id: string
  /** Display Name */
  name: string
  /** Whether this is a secret fighting art */
  isSecret: boolean
}

/**
 * Select Fighting Art Component Properties
 */
export interface SelectFightingArtProps {
  /** Disabled State */
  disabled?: boolean
  /** Available Regular Fighting Arts */
  fightingArts: FightingArtDetail[]
  /** Available Secret Fighting Arts */
  secretFightingArts: SecretFightingArtDetail[]
  /** Whether regular fighting arts are at their limit */
  regularAtLimit?: boolean
  /** Whether secret fighting arts are at their limit */
  secretAtLimit?: boolean
  /** OnChange Handler */
  onChange?: (id: string, isSecret: boolean) => void
}

/**
 * Select Fighting Art Component
 *
 * Displays a searchable dropdown combining both regular and secret fighting
 * arts. Each option includes a Badge indicating whether it is a regular or
 * secret fighting art. Options that have reached their type-specific limit are
 * excluded from the list.
 *
 * @param props Component Properties
 * @returns Select Fighting Art Component
 */
export function SelectFightingArt({
  disabled,
  fightingArts,
  secretFightingArts,
  regularAtLimit,
  secretAtLimit,
  onChange
}: SelectFightingArtProps): ReactElement {
  const [open, setOpen] = useState(false)

  /** Combined list of available fighting art options */
  const options = useMemo<FightingArtOption[]>(() => {
    const regular: FightingArtOption[] = regularAtLimit
      ? []
      : fightingArts.map((f) => ({
          id: f.id,
          name: f.fighting_art_name,
          isSecret: false
        }))

    const secret: FightingArtOption[] = secretAtLimit
      ? []
      : secretFightingArts.map((f) => ({
          id: f.id,
          name: f.secret_fighting_art_name,
          isSecret: true
        }))

    return [...regular, ...secret]
  }, [fightingArts, secretFightingArts, regularAtLimit, secretAtLimit])

  /**
   * Handle Option Select
   *
   * @param option Selected Fighting Art Option
   */
  const handleSelect = (option: FightingArtOption) => {
    onChange?.(option.id, option.isSecret)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between text-sm flex-grow"
          disabled={disabled || options.length === 0}>
          Select fighting art...
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search fighting arts..." />
          <CommandList>
            <CommandEmpty>No fighting arts found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={`${option.isSecret ? 'secret' : 'regular'}-${option.id}`}
                  value={option.name}
                  onSelect={() => handleSelect(option)}>
                  <Badge
                    variant={option.isSecret ? 'secondary' : 'default'}
                    className="w-[60px] text-center">
                    {option.isSecret ? 'Secret' : 'Fighting'}
                  </Badge>
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
