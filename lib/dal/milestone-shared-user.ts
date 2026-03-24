import { createClient } from '@/lib/supabase/client'

/**
 * Get Milestone Shared Users
 *
 * Retrieves all users a milestone is shared with.
 *
 * @param milestoneId Milestone ID
 * @returns Shared User IDs
 */
export async function getMilestoneSharedUsers(
  milestoneId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('milestone_shared_user')
    .select('shared_user_id')
    .eq('milestone_id', milestoneId)

  if (error)
    throw new Error(`Error Fetching Milestone Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Milestone Shared User
 *
 * Shares a milestone with another user.
 *
 * @param milestoneId Milestone ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addMilestoneSharedUser(
  milestoneId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('milestone_shared_user').insert({
    milestone_id: milestoneId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Milestone Shared User: ${error.message}`)
}

/**
 * Remove Milestone Shared User
 *
 * Revokes sharing of a milestone with a user.
 *
 * @param milestoneId Milestone ID
 * @param sharedUserId Shared User ID
 */
export async function removeMilestoneSharedUser(
  milestoneId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('milestone_shared_user')
    .delete()
    .eq('milestone_id', milestoneId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Milestone Shared User: ${error.message}`)
}
