import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Wanderer Shared Users
 *
 * Retrieves all users a wanderer is shared with, including their usernames
 * from the user_settings table.
 *
 * @param wandererId Wanderer ID
 * @returns Shared User IDs and Usernames
 */
export async function getWandererSharedUsers(
  wandererId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('wanderer_shared_user')
    .select('shared_user_id, user_settings!shared_user_id(username)')
    .eq('wanderer_id', wandererId)

  if (error)
    throw new Error(`Error Fetching Wanderer Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  return data.map((row) => ({
    shared_user_id: row.shared_user_id,
    username: (row.user_settings as unknown as { username: string })?.username
  }))
}

/**
 * Add Wanderer Shared Users
 *
 * Shares a wanderer with other users.
 *
 * @param wandererId Wanderer ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addWandererSharedUsers(
  wandererId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('wanderer_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      wanderer_id: wandererId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Wanderer Shared Users: ${error.message}`)
}

/**
 * Remove Wanderer Shared Users
 *
 * Revokes sharing of a wanderer with users. Only allows the owner of the
 * resource to revoke sharing.
 *
 * @param wandererId Wanderer ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeWandererSharedUsers(
  wandererId: string,
  sharedUserIds: string[]
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const userId = await getUserId()
  const supabase = createClient()

  const { error } = await supabase
    .from('wanderer_shared_user')
    .delete()
    .eq('wanderer_id', wandererId)
    .in('shared_user_id', sharedUserIds)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Removing Wanderer Shared Users: ${error.message}`)
}
