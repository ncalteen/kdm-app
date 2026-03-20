import { createClient } from '@/lib/supabase/client'

/**
 * Get Philosophy Shared Users
 *
 * Retrieves all users a philosophy is shared with.
 *
 * @param philosophyId Philosophy ID
 * @returns Shared User IDs
 */
export async function getPhilosophySharedUsers(
  philosophyId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('philosophy_shared_user')
    .select('shared_user_id')
    .eq('philosophy_id', philosophyId)

  if (error)
    throw new Error(`Error Fetching Philosophy Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Philosophy Shared User
 *
 * Shares a philosophy with another user.
 *
 * @param philosophyId Philosophy ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addPhilosophySharedUser(
  philosophyId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('philosophy_shared_user').insert({
    philosophy_id: philosophyId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Philosophy Shared User: ${error.message}`)
}

/**
 * Remove Philosophy Shared User
 *
 * Revokes sharing of a philosophy with a user.
 *
 * @param philosophyId Philosophy ID
 * @param sharedUserId Shared User ID
 */
export async function removePhilosophySharedUser(
  philosophyId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('philosophy_shared_user')
    .delete()
    .eq('philosophy_id', philosophyId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Philosophy Shared User: ${error.message}`)
}
