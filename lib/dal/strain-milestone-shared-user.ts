import { createClient } from '@/lib/supabase/client'

/**
 * Get Strain Milestone Shared Users
 *
 * Retrieves all users a strain milestone is shared with, including their
 * usernames from the user_settings table.
 *
 * @param strainMilestoneId Strain Milestone ID
 * @returns Shared User IDs and Usernames
 */
export async function getStrainMilestoneSharedUsers(
  strainMilestoneId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('strain_milestone_shared_user')
    .select('shared_user_id')
    .eq('strain_milestone_id', strainMilestoneId)

  if (error)
    throw new Error(
      `Error Fetching Strain Milestone Shared Users: ${error.message}`
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
 * Add Strain Milestone Shared Users
 *
 * Shares a strain milestone with other users.
 *
 * @param strainMilestoneId Strain Milestone ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addStrainMilestoneSharedUsers(
  strainMilestoneId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('strain_milestone_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      strain_milestone_id: strainMilestoneId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(
      `Error Adding Strain Milestone Shared Users: ${error.message}`
    )
}

/**
 * Remove Strain Milestone Shared Users
 *
 * Revokes sharing of a strain milestone with users.
 *
 * @param strainMilestoneId Strain Milestone ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeStrainMilestoneSharedUsers(
  strainMilestoneId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('strain_milestone_shared_user')
    .delete()
    .eq('strain_milestone_id', strainMilestoneId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(
      `Error Removing Strain Milestone Shared Users: ${error.message}`
    )
}
