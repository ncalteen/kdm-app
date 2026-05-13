'use client'

import {
  CustomItemDisplay,
  CustomRulesText
} from '@/components/custom/custom-rules-sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { SettlementDetail } from '@/lib/types'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Location Item Component Properties
 */
export interface LocationItemProps {
  /** Custom Rules Sheet Display */
  customDetail?: CustomItemDisplay | null
  /** Index */
  index: number
  /** Location Row */
  location: SettlementDetail['locations'][0]
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** On Toggle Unlocked Handler */
  onToggleUnlocked: (index: number, unlocked: boolean) => void
}

/**
 * Location Item Component
 *
 * Displays a single location linked to a settlement with its unlocked state,
 * name, and a remove button.
 *
 * @param props Location Item Component Properties
 * @returns Location Item Component
 */
export const LocationItem = memo(function LocationItem({
  customDetail,
  index,
  location,
  onRemove,
  onToggleUnlocked
}: LocationItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Unlocked Checkbox */}
      <Checkbox
        id={`location-unlocked-${index}`}
        name={`location-unlocked-${index}`}
        checked={location.unlocked}
        onCheckedChange={(checked) => onToggleUnlocked(index, !!checked)}
      />

      {/* Location Name */}
      <CustomRulesText
        className="truncate ml-1"
        custom={location.custom}
        description={customDetail?.description}
        label={location.location_name}
        sections={
          customDetail?.sections ?? [
            { label: 'Rules', content: location.rules }
          ]
        }
        title={customDetail?.title ?? location.location_name}
        showCustomBadge
        authorUserId={location.author_user_id}
        authorUsername={location.author_username}
      />

      {/* Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          aria-label="Remove location"
          title="Remove location">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
