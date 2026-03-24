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
import { CollectiveCognitionRewardDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Select Collective Cognition Reward Component Properties
 */
export interface SelectCollectiveCognitionRewardProps {
  /** Disabled State */
  disabled?: boolean
  /** Reward IDs to Exclude from Selection */
  excludeIds?: string[]
  /** OnChange Handler */
  onChange?: (value: string) => void
  /** Rewards */
  rewards: { [key: string]: CollectiveCognitionRewardDetail }
  /** Value */
  value?: string | null
}

/**
 * Select Collective Cognition Reward Component
 *
 * @param props Component Properties
 * @returns Select Collective Cognition Reward Component
 */
export function SelectCollectiveCognitionReward({
  disabled,
  excludeIds,
  onChange,
  rewards,
  value
}: SelectCollectiveCognitionRewardProps): ReactElement {
  const [open, setOpen] = useState(false)

  /**
   * Handle Reward Select
   *
   * @param id Selected Reward ID
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
          {value && rewards[value]
            ? rewards[value].reward_name
            : 'Select Reward'}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search rewards..." />
          <CommandList>
            <CommandEmpty>No rewards found.</CommandEmpty>
            <CommandGroup>
              {Object.values(rewards)
                .filter((r) => !excludeIds?.includes(r.id))
                .sort((a, b) => a.reward_name.localeCompare(b.reward_name))
                .map((reward) => (
                  <CommandItem
                    key={reward.id}
                    value={reward.reward_name}
                    onSelect={() => handleSelect(reward.id)}>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === reward.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {reward.reward_name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
