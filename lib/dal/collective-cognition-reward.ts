import { createClient } from '@/lib/supabase/client'

/**
 * Get Collective Cognition Reward IDs
 *
 * Retrieves the IDs of collective cognition rewards. This depends on if they
 * are custom rewards (requires the user ID if so).
 *
 * @param rewardName Reward Name
 * @param custom Custom
 * @param userId User ID
 * @returns Collective Cognition Reward IDs
 */
export async function getCollectiveCognitionRewardIds(
  rewardNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('collective_cognition_reward')
        .select('id')
        .in('reward_name', rewardNames)
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('collective_cognition_reward')
        .select('id')
        .in('reward_name', rewardNames)
        .eq('custom', custom)

  if (error)
    throw new Error(
      `Error Fetching Collective Cognition Reward ID(s): ${error.message}`
    )

  if (!data) throw new Error('Collective Cognition Reward(s) Not Found')

  return data.map((reward) => reward.id)
}
