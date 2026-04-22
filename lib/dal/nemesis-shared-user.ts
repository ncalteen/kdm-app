import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Nemesis Shared Users
 *
 * Retrieves all users a nemesis is shared with, including their usernames
 * from the user_settings table.
 *
 * @param nemesisId Nemesis ID
 * @returns Shared User IDs and Usernames
 */
export async function getNemesisSharedUsers(
  nemesisId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_shared_user')
    .select('shared_user_id, user_settings!shared_user_id(username)')
    .eq('nemesis_id', nemesisId)

  if (error)
    throw new Error(`Error Fetching Nemesis Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  return data.map((row) => ({
    shared_user_id: row.shared_user_id,
    username: (row.user_settings as unknown as { username: string })?.username
  }))
}

/**
 * Add Nemesis Shared Users
 *
 * Shares a nemesis with other users.
 *
 * @param nemesisId Nemesis ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addNemesisSharedUsers(
  nemesisId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const supabase = createClient()

  if (sharedUserIds.length === 0) return

  const { error } = await supabase.from('nemesis_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      nemesis_id: nemesisId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Nemesis Shared Users: ${error.message}`)
}

/**
 * Remove Nemesis Shared Users
 *
 * Revokes sharing of a nemesis with users. Only allows the owner of the
 * resource to revoke sharing.
 *
 * @param nemesisId Nemesis ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeNemesisSharedUsers(
  nemesisId: string,
  sharedUserIds: string[]
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const userId = await getUserId()
  const supabase = createClient()

  const { error } = await supabase
    .from('nemesis_shared_user')
    .delete()
    .eq('nemesis_id', nemesisId)
    .in('shared_user_id', sharedUserIds)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Removing Nemesis Shared Users: ${error.message}`)
}
