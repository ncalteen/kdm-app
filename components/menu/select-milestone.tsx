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
import { MilestoneDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Select Milestone Component Properties
 */
export interface SelectMilestoneProps {
  /** Disabled State */
  disabled?: boolean
  /** Milestone IDs to Exclude from Selection */
  excludeIds?: string[]
  /** Milestones */
  milestones: { [key: string]: MilestoneDetail }
  /** OnChange Handler */
  onChange?: (value: string) => void
  /** Value */
  value?: string | null
}

/**
 * Select Milestone Component
 *
 * @param props Component Properties
 * @returns Select Milestone Component
 */
export function SelectMilestone({
  disabled,
  excludeIds,
  milestones,
  onChange,
  value
}: SelectMilestoneProps): ReactElement {
  const [open, setOpen] = useState(false)

  /**
   * Handle Milestone Select
   *
   * @param id Selected Milestone ID
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
          {value && milestones[value]
            ? milestones[value].milestone_name
            : 'Select Milestone'}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search milestones..." />
          <CommandList>
            <CommandEmpty>No milestones found.</CommandEmpty>
            <CommandGroup>
              {Object.values(milestones)
                .filter((m) => !excludeIds?.includes(m.id))
                .map((milestone) => (
                  <CommandItem
                    key={milestone.id}
                    value={milestone.milestone_name}
                    onSelect={() => handleSelect(milestone.id)}>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === milestone.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {milestone.milestone_name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
