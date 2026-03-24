import { createClient } from '@/lib/supabase/client'

/**
 * Get Principle Shared Users
 *
 * Retrieves all users a principle is shared with.
 *
 * @param principleId Principle ID
 * @returns Shared User IDs
 */
export async function getPrincipleSharedUsers(
  principleId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('principle_shared_user')
    .select('shared_user_id')
    .eq('principle_id', principleId)

  if (error)
    throw new Error(`Error Fetching Principle Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Principle Shared User
 *
 * Shares a principle with another user.
 *
 * @param principleId Principle ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addPrincipleSharedUser(
  principleId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('principle_shared_user').insert({
    principle_id: principleId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Principle Shared User: ${error.message}`)
}

/**
 * Remove Principle Shared User
 *
 * Revokes sharing of a principle with a user.
 *
 * @param principleId Principle ID
 * @param sharedUserId Shared User ID
 */
export async function removePrincipleSharedUser(
  principleId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('principle_shared_user')
    .delete()
    .eq('principle_id', principleId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Principle Shared User: ${error.message}`)
}
