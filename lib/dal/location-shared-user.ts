import { createClient } from '@/lib/supabase/client'

/**
 * Get Location Shared Users
 *
 * Retrieves all users a location is shared with.
 *
 * @param locationId Location ID
 * @returns Shared User IDs
 */
export async function getLocationSharedUsers(
  locationId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('location_shared_user')
    .select('shared_user_id')
    .eq('location_id', locationId)

  if (error)
    throw new Error(`Error Fetching Location Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Location Shared User
 *
 * Shares a location with another user.
 *
 * @param locationId Location ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addLocationSharedUser(
  locationId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('location_shared_user').insert({
    location_id: locationId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Location Shared User: ${error.message}`)
}

/**
 * Remove Location Shared User
 *
 * Revokes sharing of a location with a user.
 *
 * @param locationId Location ID
 * @param sharedUserId Shared User ID
 */
export async function removeLocationSharedUser(
  locationId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('location_shared_user')
    .delete()
    .eq('location_id', locationId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Location Shared User: ${error.message}`)
}
