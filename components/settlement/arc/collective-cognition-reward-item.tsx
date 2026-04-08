'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { SettlementDetail } from '@/lib/types'
import { BrainIcon, TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Reward Item Component Properties
 */
export interface RewardItemProps {
  /** Index */
  index: number
  /** Reward Row */
  reward: SettlementDetail['collective_cognition_rewards'][0]
  /** Highlight reward as eligible to unlock */
  shouldHighlight?: boolean
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** On Toggle Unlocked Handler */
  onToggleUnlocked: (index: number, unlocked: boolean) => void
}

/**
 * Reward Item Component
 *
 * Displays a single collective cognition reward linked to a settlement with
 * its unlocked state, collective cognition value badge, name, and a remove
 * button.
 *
 * @param props Reward Item Component Properties
 * @returns Reward Item Component
 */
export const RewardItem = memo(function RewardItem({
  index,
  reward,
  shouldHighlight = false,
  onRemove,
  onToggleUnlocked
}: RewardItemProps): ReactElement {
  return (
    <div
      className={`flex items-center gap-2 pl-2 mt-1 rounded-sm border ${
        shouldHighlight
          ? 'border-amber-300/70 bg-amber-50/70 dark:border-amber-700/70 dark:bg-amber-950/30'
          : 'border-transparent'
      }`}>
      {/* Unlocked Checkbox */}
      <Checkbox
        id={`reward-unlocked-${index}`}
        name={`reward-unlocked-${index}`}
        checked={reward.unlocked}
        onCheckedChange={(checked) => onToggleUnlocked(index, !!checked)}
      />

      {/* Collective Cognition Badge */}
      <Badge variant="secondary" className="h-8 w-16">
        <BrainIcon className="h-4 w-4" />
        <span className="text-xs">{reward.collective_cognition}</span>
      </Badge>

      {/* Reward Name */}
      <Label
        className="text-sm truncate ml-1"
        htmlFor={`reward-unlocked-${index}`}>
        {reward.reward_name}
      </Label>

      {/* Collective Cognition Badge and Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          title="Remove reward">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
