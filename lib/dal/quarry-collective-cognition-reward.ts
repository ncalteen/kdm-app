import { TablesInsert, TablesUpdate } from '@/lib/database.types'
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

/**
 * Add Quarry Collective Cognition Reward
 *
 * Links a collective cognition reward to a quarry.
 *
 * @param quarryCollectiveCognitionReward Quarry Collective Cognition Reward Data
 * @returns Inserted ID
 */
export async function addQuarryCollectiveCognitionReward(
  quarryCollectiveCognitionReward: Omit<
    TablesInsert<'quarry_collective_cognition_reward'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_collective_cognition_reward')
    .insert(quarryCollectiveCognitionReward)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Quarry Collective Cognition Reward: ${error.message}`
    )

  return data.id
}

/**
 * Update Quarry Collective Cognition Reward
 *
 * Updates an existing quarry collective cognition reward record.
 *
 * @param id Quarry Collective Cognition Reward ID
 * @param quarryCollectiveCognitionReward Quarry Collective Cognition Reward Data
 */
export async function updateQuarryCollectiveCognitionReward(
  id: string,
  quarryCollectiveCognitionReward: Omit<
    TablesUpdate<'quarry_collective_cognition_reward'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_collective_cognition_reward')
    .update(quarryCollectiveCognitionReward)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Quarry Collective Cognition Reward: ${error.message}`
    )
}

/**
 * Remove Quarry Collective Cognition Reward
 *
 * Deletes a quarry collective cognition reward record from the database.
 *
 * @param id Quarry Collective Cognition Reward ID
 */
export async function removeQuarryCollectiveCognitionReward(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_collective_cognition_reward')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Quarry Collective Cognition Reward: ${error.message}`
    )
}
