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
import { getWanderers } from '@/lib/dal/wanderer'
import { WandererDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { type ReactElement, useEffect, useMemo, useState } from 'react'

/**
 * Select Wanderers Component Properties
 */
export interface SelectWanderersProps {
  /** Whether the input is disabled */
  disabled?: boolean
  /** Component ID */
  id?: string
  /** OnChange Callback */
  onChange?: (value: string[]) => void
  /** Selected Wanderers */
  value?: string[]
}

/**
 * Select Wanderers Component
 *
 * This component allows the user to select zero or more wanderers to add to
 * their settlement. It uses a popover to display the options and allows for
 * searching through them.
 *
 * @param props Component Properties
 * @returns Select Wanderers Component
 */
export function SelectWanderers({
  disabled = false,
  id,
  onChange,
  value: propValue = []
}: SelectWanderersProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [wanderers, setWanderers] = useState<{ [key: string]: WandererDetail }>(
    {}
  )

  useEffect(() => {
    getWanderers().then((wanderers) => setWanderers(wanderers))
  }, [])

  /**
   * Toggle Wanderer Selection
   *
   * @param wandererId Wanderer ID to Toggle
   */
  const handleToggle = (wandererId: string) => {
    if (!onChange) return

    if (propValue.some((wanderer) => wanderer === wandererId))
      return onChange(propValue.filter((wanderer) => wanderer !== wandererId))

    const wandererData = wanderers[wandererId]
    if (wandererData) onChange([...propValue, wandererData.id])
  }

  /**
   * Remove Wanderer Selection
   *
   * @param wandererId Wanderer ID to Remove
   */
  const handleRemove = (wandererId: string) => {
    onChange?.(propValue.filter((wanderer) => wanderer !== wandererId))
  }

  const selectedWanderers = useMemo(
    () =>
      propValue
        .map((wanderer) => Object.keys(wanderers).find((w) => w === wanderer))
        .filter((w) => w !== undefined),
    [propValue, wanderers]
  )

  return (
    <div className="flex flex-col gap-2 w-full max-w-[250px]">
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
            <CommandInput placeholder="Search wanderers..." />
            <CommandList>
              <CommandEmpty>No wanderers found.</CommandEmpty>
              <CommandGroup>
                {Object.values(wanderers).map((wanderer) => (
                  <CommandItem
                    key={wanderer.id}
                    value={wanderer.wanderer_name}
                    onSelect={() => handleToggle(wanderer.id)}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        propValue.some((w) => w === wanderer.id)
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {wanderer.wanderer_name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedWanderers.length > 0 && (
        <div className="flex flex-col gap-1">
          {selectedWanderers.map((wandererId) => (
            <div
              key={wandererId}
              className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
              <span className="truncate flex-1">
                {wanderers[wandererId].wanderer_name}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(wandererId)}
                  className="hover:bg-secondary-foreground/20 rounded-sm p-0.5 shrink-0">
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
