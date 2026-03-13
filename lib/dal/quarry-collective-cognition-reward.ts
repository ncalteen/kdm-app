import { createClient } from '@/lib/supabase/client'

/**
 * Get Quarry Collective Cognition Reward IDs
 *
 * Fetches collective cognition reward IDs associated with a specific quarry
 * from the quarry_collective_cognition_reward table.
 *
 * @param quarryId Quarry ID
 * @returns Quarry Collective Cognition Rewards
 */
export async function getQuarryCollectiveCognitionRewardIds(
  quarryId: string | null | undefined
): Promise<string[]> {
  if (!quarryId) throw new Error('Required: Quarry ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_collective_cognition_reward')
    .select('collective_cognition_reward_id')
    .eq('quarry_id', quarryId)

  if (error)
    throw new Error(
      `Error Fetching Quarry Collective Cognition Rewards: ${error.message}`
    )

  if (!data) throw new Error('Quarry Collective Cognition Reward(s) Not Found')

  return data.map((reward) => reward.collective_cognition_reward_id)
}
