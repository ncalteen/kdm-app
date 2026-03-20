import { createClient } from '@/lib/supabase/client'

/**
 * Get Quarry Shared Users
 *
 * Retrieves all users a quarry is shared with.
 *
 * @param quarryId Quarry ID
 * @returns Shared User IDs
 */
export async function getQuarrySharedUsers(
  quarryId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_shared_user')
    .select('shared_user_id')
    .eq('quarry_id', quarryId)

  if (error)
    throw new Error(`Error Fetching Quarry Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Quarry Shared User
 *
 * Shares a quarry with another user.
 *
 * @param quarryId Quarry ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addQuarrySharedUser(
  quarryId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('quarry_shared_user').insert({
    quarry_id: quarryId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Quarry Shared User: ${error.message}`)
}

/**
 * Remove Quarry Shared User
 *
 * Revokes sharing of a quarry with a user.
 *
 * @param quarryId Quarry ID
 * @param sharedUserId Shared User ID
 */
export async function removeQuarrySharedUser(
  quarryId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_shared_user')
    .delete()
    .eq('quarry_id', quarryId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Quarry Shared User: ${error.message}`)
}
