import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { CollectiveCognitionRewardDetail } from '@/lib/types'

export const COLLECTIVE_COGNITION_REWARD_SELECT = `
  id,
  custom,
  reward_name,
  collective_cognition,
  rules
`

/**
 * Get Collective Cognition Rewards
 *
 * Retrieves all collective cognition rewards visible to the authenticated
 * user. RLS surfaces:
 *
 * - Built-in (non-custom) rewards
 * - Custom rewards owned by the user
 * - Custom rewards on settlements the user collaborates on (via the
 *   transitive SELECT policy on `collective_cognition_reward`)
 *
 * @returns Collective Cognition Rewards by ID
 */
export async function getCollectiveCognitionRewards(): Promise<{
  [key: string]: CollectiveCognitionRewardDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('collective_cognition_reward')
    .select(COLLECTIVE_COGNITION_REWARD_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Collective Cognition Rewards: ${error.message}`
    )

  const map: { [key: string]: CollectiveCognitionRewardDetail } = {}
  for (const item of data) map[item.id] = item

  return map
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
    .select(COLLECTIVE_COGNITION_REWARD_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error)
    throw new Error(
      `Error Fetching Custom Collective Cognition Rewards: ${error.message}`
    )

  const map: { [key: string]: CollectiveCognitionRewardDetail } = {}
  for (const item of data) map[item.id] = item

  return map
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
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<CollectiveCognitionRewardDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'collective_cognition_reward'> = { ...reward }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('collective_cognition_reward')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(COLLECTIVE_COGNITION_REWARD_SELECT)
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
 */
export async function updateCollectiveCognitionReward(
  id: string,
  reward: Omit<
    TablesUpdate<'collective_cognition_reward'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'collective_cognition_reward'> = { ...reward }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('collective_cognition_reward')
    .update(updateData)
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
  const supabase = createClient()

  const { error } = await supabase
    .from('collective_cognition_reward')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Collective Cognition Reward: ${error.message}`
    )
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
