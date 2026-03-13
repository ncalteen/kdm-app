import { Tables } from '@/lib/database.types'
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
export async function getCollectiveCognitionRewards(): Promise<
  Omit<
    Tables<'collective_cognition_reward'>,
    'created_at' | 'updated_at' | 'custom' | 'user_id'
  >[]
> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Built-in collective cognition rewards
  const { data: builtIn, error: builtInError } = await supabase
    .from('collective_cognition_reward')
    .select('id, reward_name, collective_cognition')
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Collective Cognition Rewards: ${builtInError.message}`
    )

  // Custom rewards owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('collective_cognition_reward')
    .select('id, reward_name, collective_cognition')
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(
      `Error Fetching Owned Collective Cognition Rewards: ${ownedError.message}`
    )

  // Custom rewards shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('collective_cognition_reward_shared_user')
    .select(
      'collective_cognition_reward(id, reward_name, collective_cognition)'
    )
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(
      `Error Fetching Shared Collective Cognition Rewards: ${sharedError.message}`
    )

  const sharedRewards = (shared ?? []).flatMap((row) => {
    const r = Array.isArray(row.collective_cognition_reward)
      ? row.collective_cognition_reward
      : row.collective_cognition_reward
        ? [row.collective_cognition_reward]
        : []
    return r
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedRewards]
}
