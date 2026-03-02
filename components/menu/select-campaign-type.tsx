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
import { CampaignType } from '@/lib/enums'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { type ReactElement, useState } from 'react'

/**
 * Select Campaign Type Component Properties
 */
export interface SelectCampaignTypeProps {
  /** Component ID */
  id?: string
  /** OnChange Callback */
  onChange?: (value: CampaignType) => void
  /** Selected Value */
  value?: CampaignType
}

/**
 * Select Campaign Type Component
 *
 * This component allows the user to select a campaign type from a dropdown
 * list. It uses a popover to display the options and allows for searching
 * through them.
 *
 * @param props Component Properties
 * @returns Select Campaign Type Component
 */
export function SelectCampaignType({
  id,
  onChange,
  value: propValue
}: SelectCampaignTypeProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(propValue ?? '')

  const campaignOptions = Object.values(CampaignType).map((campaign) => ({
    value: campaign,
    label: campaign
  }))

  /**
   * Select Campaign Option
   *
   * @param currentValue Selected Campaign Value
   */
  const handleSelect = (currentValue: string) => {
    // Do not allow clearing the selection
    if (!currentValue) return
    if (currentValue === value) return setOpen(false)

    setValue(currentValue)
    setOpen(false)

    if (onChange && currentValue) onChange(currentValue as CampaignType)
  }

  return (
    <Popover open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          id={id}
          className="w-full max-w-[250px] justify-between">
          {value
            ? campaignOptions.find((campaign) => campaign.value === value)
                ?.label
            : 'Campaign type...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full max-w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Seek your path..." />
          <CommandList>
            <CommandEmpty>No campaigns found.</CommandEmpty>
            <CommandGroup>
              {campaignOptions.map((campaign) => (
                <CommandItem
                  key={campaign.value}
                  value={campaign.value}
                  onSelect={handleSelect}>
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === campaign.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {campaign.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
