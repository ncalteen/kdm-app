'use client'

import { SelectCollectiveCognitionReward } from '@/components/menu/select-collective-cognition-reward'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CollectiveCognitionRewardDetail, SettlementDetail } from '@/lib/types'
import { BrainIcon, CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/** Settlement collective cognition reward row from SettlementDetail */
type RewardRow = SettlementDetail['collective_cognition_rewards'][0]

/**
 * Reward Item Component Properties
 */
export interface RewardItemProps {
  /** Index */
  index: number
  /** Reward Row */
  reward: RewardRow
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** On Toggle Unlocked Handler */
  onToggleUnlocked: (index: number, unlocked: boolean) => void
}

/**
 * New Reward Item Component Properties
 */
export interface NewRewardItemProps {
  /** Available Rewards */
  availableRewards: CollectiveCognitionRewardDetail[]
  /** Available Rewards Map */
  availableRewardsMap: { [key: string]: CollectiveCognitionRewardDetail }
  /** Exclude IDs */
  excludeIds: string[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (rewardId: string | undefined) => void
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
  onRemove,
  onToggleUnlocked
}: RewardItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Unlocked Checkbox */}
      <Checkbox
        id={`reward-unlocked-${index}`}
        name={`reward-unlocked-${index}`}
        checked={reward.unlocked}
        onCheckedChange={(checked) => onToggleUnlocked(index, !!checked)}
      />

      {/* Reward Name */}
      <Label
        className="text-sm truncate ml-1"
        htmlFor={`reward-unlocked-${index}`}>
        {reward.reward_name}
      </Label>

      {/* Collective Cognition Badge and Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Badge variant="secondary" className="h-8 w-16">
          <BrainIcon className="h-4 w-4" />
          <span className="text-xs">{reward.collective_cognition}</span>
        </Badge>
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

/**
 * New Reward Item Component
 *
 * Renders a select dropdown for choosing a collective cognition reward to add
 * to the settlement.
 *
 * @param props New Reward Item Component Properties
 * @returns New Reward Item Component
 */
export const NewRewardItem = memo(function NewRewardItem({
  availableRewardsMap,
  excludeIds,
  onCancel,
  onSave
}: NewRewardItemProps): ReactElement {
  const [selectedRewardId, setSelectedRewardId] = useState<string | undefined>(
    undefined
  )

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Unlocked Checkbox (Disabled) */}
      <Checkbox disabled />

      {/* Reward Select */}
      <SelectCollectiveCognitionReward
        rewards={availableRewardsMap}
        excludeIds={excludeIds}
        onChange={setSelectedRewardId}
        value={selectedRewardId}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onSave(selectedRewardId)}
          disabled={!selectedRewardId}
          title="Save reward">
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onCancel}
          title="Cancel">
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
