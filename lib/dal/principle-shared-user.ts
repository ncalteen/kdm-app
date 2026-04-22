import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Principle Shared Users
 *
 * Retrieves all users a principle is shared with, including their usernames
 * from the user_settings table.
 *
 * @param principleId Principle ID
 * @returns Shared User IDs and Usernames
 */
export async function getPrincipleSharedUsers(
  principleId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('principle_shared_user')
    .select('shared_user_id, user_settings!shared_user_id(username)')
    .eq('principle_id', principleId)

  if (error)
    throw new Error(`Error Fetching Principle Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  return data.map((row) => ({
    shared_user_id: row.shared_user_id,
    username: (row.user_settings as unknown as { username: string })?.username
  }))
}

/**
 * Add Principle Shared Users
 *
 * Shares a principle with other users.
 *
 * @param principleId Principle ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addPrincipleSharedUsers(
  principleId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('principle_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      principle_id: principleId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Principle Shared Users: ${error.message}`)
}

/**
 * Remove Principle Shared Users
 *
 * Revokes sharing of a principle with users. Only allows the owner of the
 * resource to revoke sharing.
 *
 * @param principleId Principle ID
 * @param sharedUserIds Shared User IDs
 */
export async function removePrincipleSharedUsers(
  principleId: string,
  sharedUserIds: string[]
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const userId = await getUserId()
  const supabase = createClient()

  const { error } = await supabase
    .from('principle_shared_user')
    .delete()
    .eq('principle_id', principleId)
    .in('shared_user_id', sharedUserIds)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Removing Principle Shared Users: ${error.message}`)
}
