import { createClient } from '@/lib/supabase/client'

/**
 * Get Nemesis Shared Users
 *
 * Retrieves all users a nemesis is shared with.
 *
 * @param nemesisId Nemesis ID
 * @returns Shared User IDs
 */
export async function getNemesisSharedUsers(
  nemesisId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_shared_user')
    .select('shared_user_id')
    .eq('nemesis_id', nemesisId)

  if (error)
    throw new Error(`Error Fetching Nemesis Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Nemesis Shared User
 *
 * Shares a nemesis with another user.
 *
 * @param nemesisId Nemesis ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addNemesisSharedUser(
  nemesisId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('nemesis_shared_user').insert({
    nemesis_id: nemesisId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Nemesis Shared User: ${error.message}`)
}

/**
 * Remove Nemesis Shared User
 *
 * Revokes sharing of a nemesis with a user.
 *
 * @param nemesisId Nemesis ID
 * @param sharedUserId Shared User ID
 */
export async function removeNemesisSharedUser(
  nemesisId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('nemesis_shared_user')
    .delete()
    .eq('nemesis_id', nemesisId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Nemesis Shared User: ${error.message}`)
}
