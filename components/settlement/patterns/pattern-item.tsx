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
 * Pattern Item Component Properties
 */
export interface PatternItemProps {
  /** Custom Rules Sheet Display */
  customDetail?: CustomItemDisplay | null
  /** Index */
  index: number
  /** Pattern Row */
  pattern: SettlementDetail['patterns'][0]
  /** On Remove Handler */
  onRemove: (index: number) => void
  /**
   * On Craft Handler
   *
   * Invoked when the craft (hammer) button is pressed. When omitted, the craft
   * button is hidden (e.g. catalog row has no `crafted_gear_id`).
   */
  onCraft?: (index: number) => void
  /**
   * Whether the Craft Button Should Be Disabled
   *
   * Set when crafting is currently impossible (e.g. crafted gear missing,
   * required innovations missing, costs unmet, or crafting limit reached). The
   * reason is surfaced via {@link craftDisabledReason}.
   */
  craftDisabled?: boolean
  /**
   * Reason the Craft Button Is Disabled
   *
   * Rendered as a tooltip
   */
  craftDisabledReason?: string
}

/**
 * Pattern Item Component
 *
 * Displays a single pattern linked to a settlement with its name, an optional
 * craft button (when the pattern produces gear), and a remove button.
 *
 * @param props Pattern Item Component Properties
 * @returns Pattern Item Component
 */
export const PatternItem = memo(function PatternItem({
  customDetail,
  index,
  pattern,
  onRemove,
  onCraft,
  craftDisabled,
  craftDisabledReason
}: PatternItemProps): ReactElement {
  const craftButton = onCraft ? (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={() => onCraft(index)}
      disabled={craftDisabled}
      aria-label="Craft from pattern"
      title="Craft from pattern">
      <HammerIcon className="h-4 w-4" />
    </Button>
  ) : null

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Pattern Name */}
      <CustomRulesText
        className="truncate ml-1"
        custom={pattern.custom}
        description={customDetail?.description}
        label={pattern.pattern_name}
        sections={customDetail?.sections ?? []}
        title={customDetail?.title ?? pattern.pattern_name}
        showCustomBadge
      />

      <AuthoredByChip
        authorUserId={pattern.author_user_id}
        authorUsername={pattern.author_username}
        authorAvatarUrl={pattern.author_avatar_url}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        {craftButton &&
          (craftDisabled && craftDisabledReason ? (
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Wrap in span so the tooltip still triggers on a disabled button. */}
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
          aria-label="Remove pattern"
          title="Remove pattern">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
