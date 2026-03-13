import { createClient } from '@/lib/supabase/client'

/**
 * Add Collective Cognition Rewards to Settlement
 *
 * @param rewardIds Collective Cognition Reward IDs
 * @param settlementId Settlement ID
 */
export async function addCollectiveCognitionRewardsToSettlement(
  rewardIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  if (rewardIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_collective_cognition_reward')
    .insert(
      rewardIds.map((rewardId) => ({
        collective_cognition_reward_id: rewardId,
        settlement_id: settlementId,
        unlocked: false
      }))
    )

  if (error)
    throw new Error(
      `Error Adding Collective Cognition Rewards to Settlement: ${error.message}`
    )
}
