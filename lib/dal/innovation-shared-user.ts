import { createClient } from '@/lib/supabase/client'

/**
 * Get Innovation Shared Users
 *
 * Retrieves all users an innovation is shared with, including their usernames
 * from the user_settings table.
 *
 * @param innovationId Innovation ID
 * @returns Shared User IDs and Usernames
 */
export async function getInnovationSharedUsers(
  innovationId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('innovation_shared_user')
    .select('shared_user_id, user_settings!shared_user_id(username)')
    .eq('innovation_id', innovationId)

  if (error)
    throw new Error(`Error Fetching Innovation Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  return data.map((row) => ({
    shared_user_id: row.shared_user_id,
    username: (row.user_settings as unknown as { username: string })?.username
  }))
}

/**
 * Add Innovation Shared Users
 *
 * Shares an innovation with other users.
 *
 * @param innovationId Innovation ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addInnovationSharedUsers(
  innovationId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('innovation_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      innovation_id: innovationId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Innovation Shared Users: ${error.message}`)
}

/**
 * Remove Innovation Shared Users
 *
 * Revokes sharing of an innovation with users.
 *
 * @param innovationId Innovation ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeInnovationSharedUsers(
  innovationId: string,
  sharedUserIds: string[]
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase
    .from('innovation_shared_user')
    .delete()
    .eq('innovation_id', innovationId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Innovation Shared Users: ${error.message}`)
}
