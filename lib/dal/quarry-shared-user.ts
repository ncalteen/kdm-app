import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Quarry Shared Users
 *
 * Retrieves all users a quarry is shared with, including their usernames
 * from the user_settings table.
 *
 * @param quarryId Quarry ID
 * @returns Shared User IDs and Usernames
 */
export async function getQuarrySharedUsers(
  quarryId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_shared_user')
    .select('shared_user_id, user_settings!shared_user_id(username)')
    .eq('quarry_id', quarryId)

  if (error)
    throw new Error(`Error Fetching Quarry Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  return data.map((row) => ({
    shared_user_id: row.shared_user_id,
    username: (row.user_settings as unknown as { username: string })?.username
  }))
}

/**
 * Add Quarry Shared Users
 *
 * Shares a quarry with other users.
 *
 * @param quarryId Quarry ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addQuarrySharedUsers(
  quarryId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('quarry_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      quarry_id: quarryId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Quarry Shared Users: ${error.message}`)
}

/**
 * Remove Quarry Shared Users
 *
 * Revokes sharing of a quarry with users. Only allows the owner of the
 * resource to revoke sharing.
 *
 * @param quarryId Quarry ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeQuarrySharedUsers(
  quarryId: string,
  sharedUserIds: string[]
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const userId = await getUserId()
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_shared_user')
    .delete()
    .eq('quarry_id', quarryId)
    .in('shared_user_id', sharedUserIds)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Removing Quarry Shared Users: ${error.message}`)
}
