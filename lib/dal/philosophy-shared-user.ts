import { createClient } from '@/lib/supabase/client'

/**
 * Get Philosophy Shared Users
 *
 * Retrieves all users a philosophy is shared with, including their usernames
 * from the user_settings table.
 *
 * @param philosophyId Philosophy ID
 * @returns Shared User IDs and Usernames
 */
export async function getPhilosophySharedUsers(
  philosophyId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('philosophy_shared_user')
    .select('shared_user_id')
    .eq('philosophy_id', philosophyId)

  if (error)
    throw new Error(`Error Fetching Philosophy Shared Users: ${error.message}`)

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
 * Add Philosophy Shared Users
 *
 * Shares a philosophy with other users.
 *
 * @param philosophyId Philosophy ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addPhilosophySharedUsers(
  philosophyId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('philosophy_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      philosophy_id: philosophyId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Philosophy Shared Users: ${error.message}`)
}

/**
 * Remove Philosophy Shared Users
 *
 * Revokes sharing of a philosophy with users.
 *
 * @param philosophyId Philosophy ID
 * @param sharedUserIds Shared User IDs
 */
export async function removePhilosophySharedUsers(
  philosophyId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('philosophy_shared_user')
    .delete()
    .eq('philosophy_id', philosophyId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Philosophy Shared Users: ${error.message}`)
}
