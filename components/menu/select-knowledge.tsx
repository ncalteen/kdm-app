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
import { KnowledgeDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Select Knowledge Component Properties
 */
export interface SelectKnowledgeProps {
  /** Disabled State */
  disabled?: boolean
  /** Knowledge IDs to Exclude from Selection */
  excludeIds?: string[]
  /** Knowledges */
  knowledges: { [key: string]: KnowledgeDetail }
  /** OnChange Handler */
  onChange?: (value: string) => void
  /** Value */
  value?: string | null
}

/**
 * Select Knowledge Component
 *
 * @param props Component Properties
 * @returns Select Knowledge Component
 */
export function SelectKnowledge({
  disabled,
  excludeIds,
  knowledges,
  onChange,
  value
}: SelectKnowledgeProps): ReactElement {
  const [open, setOpen] = useState(false)

  /**
   * Handle Knowledge Select
   *
   * @param id Selected Knowledge ID
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
          {value && knowledges[value]
            ? knowledges[value].knowledge_name
            : 'Select Knowledge'}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search knowledges..." />
          <CommandList>
            <CommandEmpty>No knowledges found.</CommandEmpty>
            <CommandGroup>
              {Object.values(knowledges)
                .filter((k) => !excludeIds?.includes(k.id))
                .sort((a, b) =>
                  a.knowledge_name.localeCompare(b.knowledge_name)
                )
                .map((knowledge) => (
                  <CommandItem
                    key={knowledge.id}
                    value={knowledge.knowledge_name}
                    onSelect={() => handleSelect(knowledge.id)}>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === knowledge.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {knowledge.knowledge_name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
