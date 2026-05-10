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
      'collective_cognition_reward_id, id, unlocked, collective_cognition_reward(custom, collective_cognition, reward_name, rules)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(
      `Error Fetching Settlement Collective Cognition Rewards: ${error.message}`
    )

  // Skip rows whose embedded catalog row is invisible under RLS (see EC-6 in
  // local/sharing-architecture.md — transitive visibility gap).
  return (
    data?.flatMap((item) => {
      const embeddedReward = item.collective_cognition_reward as unknown as
        | {
            custom: boolean
            reward_name: string
            collective_cognition: number
            rules: string | null
          }
        | {
            custom: boolean
            reward_name: string
            collective_cognition: number
            rules: string | null
          }[]
        | null

      const reward = Array.isArray(embeddedReward)
        ? (embeddedReward[0] ?? null)
        : embeddedReward

      if (!reward) return []

      return [
        {
          collective_cognition_reward_id: item.collective_cognition_reward_id,
          id: item.id,
          unlocked: item.unlocked,
          reward_name: reward.reward_name,
          collective_cognition: reward.collective_cognition,
          rules: reward.rules,
          custom: reward.custom
        }
      ]
    }) ?? []
  )
}

/**
 * Add Collective Cognition Rewards to Settlement
 *
 * @param rewardIds Collective Cognition Reward IDs
 * @param settlementId Settlement ID
 * @returns Inserted Settlement Collective Cognition Reward Rows
 */
export async function addSettlementCollectiveCognitionRewards(
  rewardIds: string[],
  settlementId: string | null | undefined
): Promise<
  {
    id: string
    collective_cognition: number
    reward_name: string
    rules: string | null
    custom: boolean
  }[]
> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  if (rewardIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_collective_cognition_reward')
    .insert(
      rewardIds.map((rewardId) => ({
        collective_cognition_reward_id: rewardId,
        settlement_id: settlementId,
        unlocked: false
      }))
    )
    .select(
      'id, collective_cognition_reward(custom, collective_cognition, reward_name, rules)'
    )

  if (error)
    throw new Error(
      `Error Adding Collective Cognition Rewards to Settlement: ${error.message}`
    )

  return (
    data as unknown as {
      id: string
      collective_cognition_reward: {
        custom: boolean
        collective_cognition: number
        reward_name: string
        rules: string | null
      }
    }[]
  ).map((item) => ({
    id: item.id,
    collective_cognition: item.collective_cognition_reward.collective_cognition,
    reward_name: item.collective_cognition_reward.reward_name,
    rules: item.collective_cognition_reward.rules,
    custom: item.collective_cognition_reward.custom
  }))
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
