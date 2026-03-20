import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Collective Cognition Rewards
 *
 * Retrieves the collective cognition rewards associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Collective Cognition Reward Data
 */
export async function getSettlementCollectiveCognitionRewards(
  settlementId: string | null | undefined
): Promise<SettlementDetail['collective_cognition_rewards']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_collective_cognition_reward')
    .select(
      'collective_cognition_reward_id, id, unlocked, collective_cognition_reward(collective_cognition, reward_name)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(
      `Error Fetching Settlement Collective Cognition Rewards: ${error.message}`
    )

  return (
    data?.map((item) => ({
      collective_cognition_reward_id: item.collective_cognition_reward_id,
      id: item.id,
      unlocked: item.unlocked,
      reward_name: (
        item.collective_cognition_reward as unknown as {
          reward_name: string
        }
      ).reward_name,
      collective_cognition: (
        item.collective_cognition_reward as unknown as {
          collective_cognition: string
        }
      ).collective_cognition
    })) ?? []
  )
}

/**
 * Add Collective Cognition Rewards to Settlement
 *
 * @param rewardIds Collective Cognition Reward IDs
 * @param settlementId Settlement ID
 */
export async function addSettlementCollectiveCognitionRewards(
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

/**
 * Update Settlement Collective Cognition Reward
 *
 * Updates an existing settlement collective cognition reward record.
 *
 * @param id Settlement Collective Cognition Reward ID
 * @param data Settlement Collective Cognition Reward Data
 */
export async function updateSettlementCollectiveCognitionReward(
  id: string,
  data: Omit<
    TablesUpdate<'settlement_collective_cognition_reward'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_collective_cognition_reward')
    .update(data)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Settlement Collective Cognition Reward: ${error.message}`
    )
}

/**
 * Remove Settlement Collective Cognition Reward
 *
 * Deletes a settlement collective cognition reward record from the database.
 *
 * @param id Settlement Collective Cognition Reward ID
 */
export async function removeSettlementCollectiveCognitionReward(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_collective_cognition_reward')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Settlement Collective Cognition Reward: ${error.message}`
    )
}
