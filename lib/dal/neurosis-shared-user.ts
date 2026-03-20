import { createClient } from '@/lib/supabase/client'

/**
 * Get Neurosis Shared Users
 *
 * Retrieves all users a neurosis is shared with.
 *
 * @param neurosisId Neurosis ID
 * @returns Shared User IDs
 */
export async function getNeurosisSharedUsers(
  neurosisId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('neurosis_shared_user')
    .select('shared_user_id')
    .eq('neurosis_id', neurosisId)

  if (error)
    throw new Error(`Error Fetching Neurosis Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Neurosis Shared User
 *
 * Shares a neurosis with another user.
 *
 * @param neurosisId Neurosis ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addNeurosisSharedUser(
  neurosisId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('neurosis_shared_user').insert({
    neurosis_id: neurosisId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Neurosis Shared User: ${error.message}`)
}

/**
 * Remove Neurosis Shared User
 *
 * Revokes sharing of a neurosis with a user.
 *
 * @param neurosisId Neurosis ID
 * @param sharedUserId Shared User ID
 */
export async function removeNeurosisSharedUser(
  neurosisId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('neurosis_shared_user')
    .delete()
    .eq('neurosis_id', neurosisId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Neurosis Shared User: ${error.message}`)
}
