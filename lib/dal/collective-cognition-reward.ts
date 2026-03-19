import { createClient } from '@/lib/supabase/client'
import { CollectiveCognitionRewardDetail } from '@/lib/types'

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

/**
 * Get Collective Cognition Rewards
 *
 * Retrieves all collective cognition rewards available to the authenticated
 * user:
 * - Built-in (non-custom) rewards
 * - Custom rewards owned by the user
 * - Custom rewards shared with the user
 *
 * @returns Collective Cognition Rewards
 */
export async function getCollectiveCognitionRewards(): Promise<{
  [key: string]: CollectiveCognitionRewardDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Fetch all three categories of rewards in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom rewards (available to all users)
    supabase
      .from('collective_cognition_reward')
      .select('id, reward_name, collective_cognition')
      .eq('custom', false),
    // Custom rewards created by the user
    supabase
      .from('collective_cognition_reward')
      .select('id, reward_name, collective_cognition')
      .eq('custom', true)
      .eq('user_id', user.id),
    // Custom rewards shared with the user
    supabase
      .from('collective_cognition_reward_shared_user')
      .select(
        'collective_cognition_reward(id, reward_name, collective_cognition)'
      )
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(
        `Error Fetching Collective Cognition Rewards: ${result.error.message}`
      )

  // Collect rewards from all sources, deduplicating by ID
  const rewardMap: { [key: string]: CollectiveCognitionRewardDetail } = {}

  for (const r of nonCustomResult.data ?? []) rewardMap[r.id] = r
  for (const r of userCustomResult.data ?? []) rewardMap[r.id] = r
  for (const row of sharedResult.data ?? []) {
    const r =
      row.collective_cognition_reward as unknown as CollectiveCognitionRewardDetail | null

    if (r) rewardMap[r.id] = r
  }

  return rewardMap
}
