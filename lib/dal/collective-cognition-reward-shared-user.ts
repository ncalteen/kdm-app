import { createClient } from '@/lib/supabase/client'

/**
 * Get Collective Cognition Reward Shared Users
 *
 * Retrieves all users a collective cognition reward is shared with.
 *
 * @param collectiveCognitionRewardId Collective Cognition Reward ID
 * @returns Shared User IDs
 */
export async function getCollectiveCognitionRewardSharedUsers(
  collectiveCognitionRewardId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('collective_cognition_reward_shared_user')
    .select('shared_user_id')
    .eq('collective_cognition_reward_id', collectiveCognitionRewardId)

  if (error)
    throw new Error(
      `Error Fetching Collective Cognition Reward Shared Users: ${error.message}`
    )

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Collective Cognition Reward Shared User
 *
 * Shares a collective cognition reward with another user.
 *
 * @param collectiveCognitionRewardId Collective Cognition Reward ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addCollectiveCognitionRewardSharedUser(
  collectiveCognitionRewardId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('collective_cognition_reward_shared_user')
    .insert({
      collective_cognition_reward_id: collectiveCognitionRewardId,
      shared_user_id: sharedUserId,
      user_id: userId
    })

  if (error)
    throw new Error(
      `Error Adding Collective Cognition Reward Shared User: ${error.message}`
    )
}

/**
 * Remove Collective Cognition Reward Shared User
 *
 * Revokes sharing of a collective cognition reward with a user.
 *
 * @param collectiveCognitionRewardId Collective Cognition Reward ID
 * @param sharedUserId Shared User ID
 */
export async function removeCollectiveCognitionRewardSharedUser(
  collectiveCognitionRewardId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('collective_cognition_reward_shared_user')
    .delete()
    .eq('collective_cognition_reward_id', collectiveCognitionRewardId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(
      `Error Removing Collective Cognition Reward Shared User: ${error.message}`
    )
}
