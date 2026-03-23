import { createClient } from '@/lib/supabase/client'

/**
 * Get Strain Milestone Shared Users
 *
 * Retrieves all users a strain milestone is shared with.
 *
 * @param strainMilestoneId Strain Milestone ID
 * @returns Shared User IDs
 */
export async function getStrainMilestoneSharedUsers(
  strainMilestoneId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('strain_milestone_shared_user')
    .select('shared_user_id')
    .eq('strain_milestone_id', strainMilestoneId)

  if (error)
    throw new Error(
      `Error Fetching Strain Milestone Shared Users: ${error.message}`
    )

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Strain Milestone Shared User
 *
 * Shares a strain milestone with another user.
 *
 * @param strainMilestoneId Strain Milestone ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addStrainMilestoneSharedUser(
  strainMilestoneId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('strain_milestone_shared_user').insert({
    strain_milestone_id: strainMilestoneId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(
      `Error Adding Strain Milestone Shared User: ${error.message}`
    )
}

/**
 * Remove Strain Milestone Shared User
 *
 * Revokes sharing of a strain milestone with a user.
 *
 * @param strainMilestoneId Strain Milestone ID
 * @param sharedUserId Shared User ID
 */
export async function removeStrainMilestoneSharedUser(
  strainMilestoneId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('strain_milestone_shared_user')
    .delete()
    .eq('strain_milestone_id', strainMilestoneId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(
      `Error Removing Strain Milestone Shared User: ${error.message}`
    )
}
