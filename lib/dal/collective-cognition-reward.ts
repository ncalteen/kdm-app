import { removeCatalogRow } from '@/lib/dal/catalog-archive'
import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { CollectiveCognitionRewardDetail } from '@/lib/types'

/**
 * Get Collective Cognition Rewards
 *
 * Retrieves all collective cognition rewards visible to the authenticated
 * user. RLS surfaces:
 * - Built-in (non-custom) rewards
 * - Custom rewards owned by the user
 * - Custom rewards on settlements the user collaborates on (via the
 *   transitive SELECT policy on `collective_cognition_reward`)
 *
 * @returns Collective Cognition Rewards
 */
export async function getCollectiveCognitionRewards(): Promise<{
  [key: string]: CollectiveCognitionRewardDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('collective_cognition_reward')
    .select('id, custom, reward_name, collective_cognition, rules')

  if (error)
    throw new Error(
      `Error Fetching Collective Cognition Rewards: ${error.message}`
    )

  const rewardMap: { [key: string]: CollectiveCognitionRewardDetail } = {}
  for (const r of data ?? []) rewardMap[r.id] = r

  return rewardMap
}

/**
 * Get User Custom Collective Cognition Rewards
 *
 * Retrieves only custom rewards authored by the current user. Used by the
 * user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Collective Cognition Reward Data Map
 */
export async function getUserCustomCollectiveCognitionRewards(): Promise<{
  [key: string]: CollectiveCognitionRewardDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('collective_cognition_reward')
    .select('id, custom, reward_name, collective_cognition, rules, archived_at')
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(
      `Error Fetching Custom Collective Cognition Rewards: ${error.message}`
    )

  const rewardMap: { [key: string]: CollectiveCognitionRewardDetail } = {}
  for (const r of data ?? []) if (!r.archived_at) rewardMap[r.id] = r

  return rewardMap
}

/**
 * Get Collective Cognition Reward IDs
 *
 * Retrieves the IDs of collective cognition rewards. This depends on if they
 * are custom rewards (requires the user ID if so). This is used to populate
 * new settlements created from templates.
 *
 * @param rewardNames Reward Names
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
 * Add Collective Cognition Reward
 *
 * Adds a new collective cognition reward record to the database.
 *
 * @param reward Collective Cognition Reward Data
 * @returns Inserted Collective Cognition Reward
 */
export async function addCollectiveCognitionReward(
  reward: Omit<
    TablesInsert<'collective_cognition_reward'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<CollectiveCognitionRewardDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (reward.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('collective_cognition_reward')
    .insert({
      ...reward,
      ...(reward.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, collective_cognition, reward_name, rules')
    .single()

  if (error)
    throw new Error(
      `Error Adding Collective Cognition Reward: ${error.message}`
    )

  return data
}

/**
 * Update Collective Cognition Reward
 *
 * Updates an existing collective cognition reward record in the database.
 *
 * @param id Collective Cognition Reward ID
 * @param reward Collective Cognition Reward Data
 * @returns Updated Collective Cognition Reward
 */
export async function updateCollectiveCognitionReward(
  id: string,
  reward: Omit<
    TablesUpdate<'collective_cognition_reward'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('collective_cognition_reward')
    .update(reward)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Collective Cognition Reward: ${error.message}`
    )
}

/**
 * Remove Collective Cognition Reward
 *
 * Deletes a collective cognition reward record from the database.
 *
 * @param id Collective Cognition Reward ID
 */
export async function removeCollectiveCognitionReward(
  id: string
): Promise<void> {
  await removeCatalogRow(
    'collective_cognition_reward',
    id,
    'Collective Cognition Reward'
  )
}
