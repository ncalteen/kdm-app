import { createClient } from '@/lib/supabase/client'

/**
 * Get Wanderer Shared Users
 *
 * Retrieves all users a wanderer is shared with.
 *
 * @param wandererId Wanderer ID
 * @returns Shared User IDs
 */
export async function getWandererSharedUsers(
  wandererId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('wanderer_shared_user')
    .select('shared_user_id')
    .eq('wanderer_id', wandererId)

  if (error)
    throw new Error(`Error Fetching Wanderer Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Wanderer Shared User
 *
 * Shares a wanderer with another user.
 *
 * @param wandererId Wanderer ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addWandererSharedUser(
  wandererId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('wanderer_shared_user').insert({
    wanderer_id: wandererId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Wanderer Shared User: ${error.message}`)
}

/**
 * Remove Wanderer Shared User
 *
 * Revokes sharing of a wanderer with a user.
 *
 * @param wandererId Wanderer ID
 * @param sharedUserId Shared User ID
 */
export async function removeWandererSharedUser(
  wandererId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('wanderer_shared_user')
    .delete()
    .eq('wanderer_id', wandererId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Wanderer Shared User: ${error.message}`)
}
