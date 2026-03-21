'use client'

import {
  NewRewardItem,
  RewardItem
} from '@/components/settlement/arc/collective-cognition-reward-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCollectiveCognitionRewards } from '@/lib/dal/collective-cognition-reward'
import {
  addSettlementCollectiveCognitionRewards,
  removeSettlementCollectiveCognitionReward,
  updateSettlementCollectiveCognitionReward
} from '@/lib/dal/settlement-collective-cognition-reward'
import {
  COLLECTIVE_COGNITION_REWARD_REMOVED_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_SAVED_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_UPDATED_MESSAGE,
  ERROR_MESSAGE
} from '@/lib/messages'
import { CollectiveCognitionRewardDetail, SettlementDetail } from '@/lib/types'
import { BrainIcon, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Collective Cognition Rewards Card Properties
 */
interface CollectiveCognitionRewardsCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Collective Cognition Rewards Card Component
 *
 * Displays the collective cognition rewards linked to a settlement and allows
 * users to add, remove, and toggle the unlocked state. All mutations are
 * applied optimistically so the UI updates before the database transaction
 * completes. Items are sorted by collective cognition value.
 *
 * @param props Collective Cognition Rewards Card Properties
 * @returns Collective Cognition Rewards Card Component
 */
export function CollectiveCognitionRewardsCard({
  selectedSettlement,
  setSelectedSettlement
}: CollectiveCognitionRewardsCardProps): ReactElement {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  // Available rewards for the select dropdown (fetched once per settlement).
  const [availableRewards, setAvailableRewards] = useState<{
    [key: string]: CollectiveCognitionRewardDetail
  }>({})

  // Track the previous settlement ID to reset state on settlement change.
  const [prevSettlementId, setPrevSettlementId] = useState<string | null>(
    selectedSettlement?.id ?? null
  )

  if (selectedSettlement?.id !== prevSettlementId) {
    setPrevSettlementId(selectedSettlement?.id ?? null)
    setIsAddingNew(false)
    setHasFetched(false)
  }

  // Fetch available reward options when settlement changes.
  useEffect(() => {
    if (!selectedSettlement?.id || hasFetched) return

    let cancelled = false

    getCollectiveCognitionRewards()
      .then((rewards) => {
        if (cancelled) return

        setAvailableRewards(rewards)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        setAvailableRewards({})
        setHasFetched(true)

        console.error('Collective Cognition Rewards Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched])

  /**
   * Sorted Rewards
   *
   * Sort rewards by collective cognition value (ascending), preserving
   * original indices so handlers operate on the correct source element.
   */
  const sortedRewards = useMemo(() => {
    const rewards = selectedSettlement?.collective_cognition_rewards ?? []

    return rewards
      .map((reward, originalIndex) => ({ reward, originalIndex }))
      .sort(
        (a, b) =>
          Number(a.reward.collective_cognition) -
          Number(b.reward.collective_cognition)
      )
  }, [selectedSettlement?.collective_cognition_rewards])

  /**
   * Handle Add Reward
   *
   * Optimistically adds a reward to the settlement, then persists to the DB.
   *
   * @param rewardId Collective Cognition Reward ID
   */
  const handleAdd = useCallback(
    (rewardId: string | undefined) => {
      if (!rewardId || !selectedSettlement) return setIsAddingNew(false)

      const rewardInfo = availableRewards[rewardId]
      if (!rewardInfo) return setIsAddingNew(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementDetail['collective_cognition_rewards'][0] =
        {
          collective_cognition: String(rewardInfo.collective_cognition),
          collective_cognition_reward_id: rewardId,
          id: tempId,
          reward_name: rewardInfo.reward_name,
          unlocked: false
        }

      const updatedRewards = [
        ...(selectedSettlement.collective_cognition_rewards ?? []),
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        collective_cognition_rewards: updatedRewards
      })
      setIsAddingNew(false)

      addSettlementCollectiveCognitionRewards([rewardId], selectedSettlement.id)
        .then((rows) => {
          // Replace the placeholder with the real row from the DB.
          setSelectedSettlement({
            ...selectedSettlement,
            collective_cognition_rewards: updatedRewards.map((r) =>
              r.id === tempId ? { ...r, id: rows[0].id } : r
            )
          })

          toast.success(COLLECTIVE_COGNITION_REWARD_UPDATED_MESSAGE())
        })
        .catch((err: unknown) => {
          // Revert to the original rewards (before the optimistic add).
          setSelectedSettlement({
            ...selectedSettlement,
            collective_cognition_rewards:
              selectedSettlement.collective_cognition_rewards
          })

          console.error('Collective Cognition Reward Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availableRewards, setSelectedSettlement]
  )

  /**
   * Handle Remove Reward
   *
   * Optimistically removes a reward from the settlement, then persists to the
   * DB.
   *
   * @param index Settlement Reward Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = (selectedSettlement.collective_cognition_rewards ?? [])[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        collective_cognition_rewards:
          (selectedSettlement.collective_cognition_rewards ?? []).filter(
            (r) => r.id !== removed.id
          )
      })

      removeSettlementCollectiveCognitionReward(removed.id)
        .then(() =>
          toast.success(COLLECTIVE_COGNITION_REWARD_REMOVED_MESSAGE())
        )
        .catch((err: unknown) => {
          // Revert the optimistic removal.
          setSelectedSettlement({
            ...selectedSettlement,
            collective_cognition_rewards: [
              ...(selectedSettlement.collective_cognition_rewards ?? []).slice(
                0,
                index
              ),
              removed,
              ...(selectedSettlement.collective_cognition_rewards ?? []).slice(index)
            ]
          })

          console.error('Collective Cognition Reward Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  /**
   * Handle Toggle Unlocked
   *
   * Optimistically toggles the unlocked state of a reward, then persists to
   * the DB.
   *
   * @param index Reward Index
   * @param unlocked New Unlocked State
   */
  const handleToggleUnlocked = useCallback(
    (index: number, unlocked: boolean) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.collective_cognition_rewards[index]
      if (!target) return

      setSelectedSettlement({
        ...selectedSettlement,
        collective_cognition_rewards:
          selectedSettlement.collective_cognition_rewards.map((r, i) =>
            i === index ? { ...r, unlocked } : r
          )
      })

      updateSettlementCollectiveCognitionReward(target.id, { unlocked })
        .then(() =>
          toast.success(COLLECTIVE_COGNITION_REWARD_SAVED_MESSAGE(unlocked))
        )
        .catch((err: unknown) => {
          // Revert the optimistic toggle.
          setSelectedSettlement({
            ...selectedSettlement,
            collective_cognition_rewards:
              selectedSettlement.collective_cognition_rewards.map((r, i) =>
                i === index ? { ...r, unlocked: !unlocked } : r
              )
          })

          console.error('Collective Cognition Reward Toggle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <BrainIcon className="h-4 w-4" />
          Collective Cognition Rewards
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {/* Rewards List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.collective_cognition_rewards ||
              selectedSettlement.collective_cognition_rewards.length === 0) &&
              !isAddingNew &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No rewards yet
                </p>
              )}

            {!hasFetched && !selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading rewards...
              </p>
            )}

            {hasFetched &&
              sortedRewards.map(({ reward, originalIndex }) => (
                <RewardItem
                  key={reward.id}
                  index={originalIndex}
                  reward={reward}
                  onRemove={handleRemove}
                  onToggleUnlocked={handleToggleUnlocked}
                />
              ))}

            {isAddingNew && (
              <NewRewardItem
                availableRewards={Object.values(availableRewards)}
                availableRewardsMap={availableRewards}
                excludeIds={(
                  selectedSettlement?.collective_cognition_rewards ?? []
                ).map((r) => r.collective_cognition_reward_id)}
                onCancel={() => setIsAddingNew(false)}
                onSave={handleAdd}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
