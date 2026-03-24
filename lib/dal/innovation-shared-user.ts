import { createClient } from '@/lib/supabase/client'

/**
 * Get Innovation Shared Users
 *
 * Retrieves all users a innovation is shared with.
 *
 * @param innovationId Innovation ID
 * @returns Shared User IDs
 */
export async function getInnovationSharedUsers(
  innovationId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('innovation_shared_user')
    .select('shared_user_id')
    .eq('innovation_id', innovationId)

  if (error)
    throw new Error(`Error Fetching Innovation Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Innovation Shared User
 *
 * Shares a innovation with another user.
 *
 * @param innovationId Innovation ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addInnovationSharedUser(
  innovationId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('innovation_shared_user').insert({
    innovation_id: innovationId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Innovation Shared User: ${error.message}`)
}

/**
 * Remove Innovation Shared User
 *
 * Revokes sharing of a innovation with a user.
 *
 * @param innovationId Innovation ID
 * @param sharedUserId Shared User ID
 */
export async function removeInnovationSharedUser(
  innovationId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('innovation_shared_user')
    .delete()
    .eq('innovation_id', innovationId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Innovation Shared User: ${error.message}`)
}
