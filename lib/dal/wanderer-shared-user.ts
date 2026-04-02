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
    .select('shared_user_id')
    .eq('wanderer_id', wandererId)

  if (error)
    throw new Error(`Error Fetching Wanderer Shared Users: ${error.message}`)

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
 * Revokes sharing of a wanderer with users.
 *
 * @param wandererId Wanderer ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeWandererSharedUsers(
  wandererId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('wanderer_shared_user')
    .delete()
    .eq('wanderer_id', wandererId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Wanderer Shared Users: ${error.message}`)
}
