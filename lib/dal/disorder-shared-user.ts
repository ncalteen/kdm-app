import { createClient } from '@/lib/supabase/client'

/**
 * Get Disorder Shared Users
 *
 * Retrieves all users a disorder is shared with, including their usernames
 * from the user_settings table.
 *
 * @param disorderId Disorder ID
 * @returns Shared User IDs and Usernames
 */
export async function getDisorderSharedUsers(
  disorderId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('disorder_shared_user')
    .select('shared_user_id')
    .eq('disorder_id', disorderId)

  if (error)
    throw new Error(`Error Fetching Disorder Shared Users: ${error.message}`)

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
 * Add Disorder Shared Users
 *
 * Shares a disorder with other users.
 *
 * @param disorderId Disorder ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addDisorderSharedUsers(
  disorderId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('disorder_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      disorder_id: disorderId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Disorder Shared Users: ${error.message}`)
}

/**
 * Remove Disorder Shared Users
 *
 * Revokes sharing of a disorder with users.
 *
 * @param disorderId Disorder ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeDisorderSharedUsers(
  disorderId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('disorder_shared_user')
    .delete()
    .eq('disorder_id', disorderId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Disorder Shared Users: ${error.message}`)
}
