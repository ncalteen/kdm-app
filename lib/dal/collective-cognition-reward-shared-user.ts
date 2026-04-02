import { createClient } from '@/lib/supabase/client'

/**
 * Get Collective Cognition Reward Shared Users
 *
 * Retrieves all users a collective cognition reward is shared with, including
 * their usernames from the user_settings table.
 *
 * @param collectiveCognitionRewardId Collective Cognition Reward ID
 * @returns Shared User IDs and Usernames
 */
export async function getCollectiveCognitionRewardSharedUsers(
  collectiveCognitionRewardId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('collective_cognition_reward_shared_user')
    .select('shared_user_id')
    .eq('collective_cognition_reward_id', collectiveCognitionRewardId)

  if (error)
    throw new Error(
      `Error Fetching Collective Cognition Reward Shared Users: ${error.message}`
    )

  if (!data || data.length === 0) return []

  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('user_id, username')
    .in(
      'user_id',
      data.map((row) => row.shared_user_id)
    )

  if (settingsError)
    throw new Error(
      `Error Fetching Shared User Settings: ${settingsError.message}`
    )

  return settings.map((row) => ({
    shared_user_id: row.user_id,
    username: row.username
  }))
}

/**
 * Add Collective Cognition Reward Shared Users
 *
 * Shares a collective cognition reward with other users.
 *
 * @param collectiveCognitionRewardId Collective Cognition Reward ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addCollectiveCognitionRewardSharedUsers(
  collectiveCognitionRewardId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('collective_cognition_reward_shared_user')
    .insert(
      sharedUserIds.map((sharedUserId) => ({
        collective_cognition_reward_id: collectiveCognitionRewardId,
        shared_user_id: sharedUserId,
        user_id: userId
      }))
    )

  if (error)
    throw new Error(
      `Error Adding Collective Cognition Reward Shared Users: ${error.message}`
    )
}

/**
 * Remove Collective Cognition Reward Shared Users
 *
 * Revokes sharing of a collective cognition reward with users.
 *
 * @param collectiveCognitionRewardId Collective Cognition Reward ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeCollectiveCognitionRewardSharedUsers(
  collectiveCognitionRewardId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('collective_cognition_reward_shared_user')
    .delete()
    .eq('collective_cognition_reward_id', collectiveCognitionRewardId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(
      `Error Removing Collective Cognition Reward Shared Users: ${error.message}`
    )
}
