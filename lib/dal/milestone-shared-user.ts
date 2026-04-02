import { createClient } from '@/lib/supabase/client'

/**
 * Get Milestone Shared Users
 *
 * Retrieves all users a milestone is shared with, including their usernames
 * from the user_settings table.
 *
 * @param milestoneId Milestone ID
 * @returns Shared User IDs and Usernames
 */
export async function getMilestoneSharedUsers(
  milestoneId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('milestone_shared_user')
    .select('shared_user_id')
    .eq('milestone_id', milestoneId)

  if (error)
    throw new Error(`Error Fetching Milestone Shared Users: ${error.message}`)

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
 * Add Milestone Shared Users
 *
 * Shares a milestone with other users.
 *
 * @param milestoneId Milestone ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addMilestoneSharedUsers(
  milestoneId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('milestone_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      milestone_id: milestoneId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Milestone Shared Users: ${error.message}`)
}

/**
 * Remove Milestone Shared Users
 *
 * Revokes sharing of a milestone with users.
 *
 * @param milestoneId Milestone ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeMilestoneSharedUsers(
  milestoneId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('milestone_shared_user')
    .delete()
    .eq('milestone_id', milestoneId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Milestone Shared Users: ${error.message}`)
}
