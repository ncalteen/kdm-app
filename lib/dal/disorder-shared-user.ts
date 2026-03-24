import { createClient } from '@/lib/supabase/client'

/**
 * Get Disorder Shared Users
 *
 * Retrieves all users a disorder is shared with.
 *
 * @param disorderId Disorder ID
 * @returns Shared User IDs
 */
export async function getDisorderSharedUsers(
  disorderId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('disorder_shared_user')
    .select('shared_user_id')
    .eq('disorder_id', disorderId)

  if (error)
    throw new Error(`Error Fetching Disorder Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Disorder Shared User
 *
 * Shares a disorder with another user.
 *
 * @param disorderId Disorder ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addDisorderSharedUser(
  disorderId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('disorder_shared_user').insert({
    disorder_id: disorderId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Disorder Shared User: ${error.message}`)
}

/**
 * Remove Disorder Shared User
 *
 * Revokes sharing of a disorder with a user.
 *
 * @param disorderId Disorder ID
 * @param sharedUserId Shared User ID
 */
export async function removeDisorderSharedUser(
  disorderId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('disorder_shared_user')
    .delete()
    .eq('disorder_id', disorderId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Disorder Shared User: ${error.message}`)
}
