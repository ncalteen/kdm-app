import { createClient } from '@/lib/supabase/client'

/**
 * Get Location Shared Users
 *
 * Retrieves all users a location is shared with, including their usernames
 * from the user_settings table.
 *
 * @param locationId Location ID
 * @returns Shared User IDs and Usernames
 */
export async function getLocationSharedUsers(
  locationId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('location_shared_user')
    .select('shared_user_id')
    .eq('location_id', locationId)

  if (error)
    throw new Error(`Error Fetching Location Shared Users: ${error.message}`)

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
 * Add Location Shared Users
 *
 * Shares a location with other users.
 *
 * @param locationId Location ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addLocationSharedUsers(
  locationId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('location_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      location_id: locationId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Location Shared Users: ${error.message}`)
}

/**
 * Remove Location Shared Users
 *
 * Revokes sharing of a location with users.
 *
 * @param locationId Location ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeLocationSharedUsers(
  locationId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('location_shared_user')
    .delete()
    .eq('location_id', locationId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Location Shared Users: ${error.message}`)
}
