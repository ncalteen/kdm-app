'use client'

import {
  CustomItemDisplay,
  CustomRulesText
} from '@/components/custom/custom-rules-sheet'
import { AuthoredByChip } from '@/components/generic/authored-by-chip'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { SettlementDetail } from '@/lib/types'
import { HammerIcon, TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Seed Pattern Item Component Properties
 */
export interface SeedPatternItemProps {
  /** Custom Rules Sheet Display */
  customDetail?: CustomItemDisplay | null
  /** Index */
  index: number
  /** Seed Pattern Row */
  seedPattern: SettlementDetail['seed_patterns'][0]
  /** On Remove Handler */
  onRemove: (index: number) => void
  /**
   * On Craft Handler
   *
   * Invoked when the craft (hammer) button is pressed. When omitted, the craft
   * button is hidden (e.g. catalog row has no `crafted_gear_id`).
   */
  onCraft?: (index: number) => void
  /** Whether the Craft Button Should Be Disabled */
  craftDisabled?: boolean
  /**
   * Reason the Craft Button Is Disabled
   *
   * Rendered as a tooltip
   */
  craftDisabledReason?: string
}

/**
 * Seed Pattern Item Component
 *
 * Displays a single seed pattern linked to a settlement with its name, an
 * optional craft button (when the seed pattern produces gear), and a remove
 * button.
 *
 * @param props Seed Pattern Item Component Properties
 * @returns Seed Pattern Item Component
 */
export const SeedPatternItem = memo(function SeedPatternItem({
  customDetail,
  index,
  seedPattern,
  onRemove,
  onCraft,
  craftDisabled,
  craftDisabledReason
}: SeedPatternItemProps): ReactElement {
  const craftButton = onCraft ? (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={() => onCraft(index)}
      disabled={craftDisabled}
      aria-label="Craft from seed pattern"
      title="Craft from seed pattern">
      <HammerIcon className="h-4 w-4" />
    </Button>
  ) : null

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Seed Pattern Name */}
      <CustomRulesText
        className="truncate ml-1"
        custom={seedPattern.custom}
        description={customDetail?.description}
        label={seedPattern.seed_pattern_name}
        sections={customDetail?.sections ?? []}
        title={customDetail?.title ?? seedPattern.seed_pattern_name}
        showCustomBadge
      />

      <AuthoredByChip
        authorUserId={seedPattern.author_user_id}
        authorUsername={seedPattern.author_username}
        authorAvatarUrl={seedPattern.author_avatar_url}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        {craftButton &&
          (craftDisabled && craftDisabledReason ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{craftButton}</span>
              </TooltipTrigger>
              <TooltipContent>{craftDisabledReason}</TooltipContent>
            </Tooltip>
          ) : (
            craftButton
          ))}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          aria-label="Remove seed pattern"
          title="Remove seed pattern">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
