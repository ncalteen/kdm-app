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
    .select('shared_user_id')
    .eq('principle_id', principleId)

  if (error)
    throw new Error(`Error Fetching Principle Shared Users: ${error.message}`)

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
 * Revokes sharing of a principle with users.
 *
 * @param principleId Principle ID
 * @param sharedUserIds Shared User IDs
 */
export async function removePrincipleSharedUsers(
  principleId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('principle_shared_user')
    .delete()
    .eq('principle_id', principleId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Principle Shared Users: ${error.message}`)
}
