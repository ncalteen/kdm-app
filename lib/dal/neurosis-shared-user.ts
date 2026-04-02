import { createClient } from '@/lib/supabase/client'

/**
 * Get Neurosis Shared Users
 *
 * Retrieves all users a neurosis is shared with, including their usernames
 * from the user_settings table.
 *
 * @param neurosisId Neurosis ID
 * @returns Shared User IDs and Usernames
 */
export async function getNeurosisSharedUsers(
  neurosisId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('neurosis_shared_user')
    .select('shared_user_id, user_settings!shared_user_id(username)')
    .eq('neurosis_id', neurosisId)

  if (error)
    throw new Error(`Error Fetching Neurosis Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  return data.map((row) => ({
    shared_user_id: row.shared_user_id,
    username:
      (row.user_settings as unknown as { username: string })?.username ?? ''
  }))
}

/**
 * Add Neurosis Shared Users
 *
 * Shares a neurosis with other users.
 *
 * @param neurosisId Neurosis ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addNeurosisSharedUsers(
  neurosisId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('neurosis_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      neurosis_id: neurosisId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Neurosis Shared Users: ${error.message}`)
}

/**
 * Remove Neurosis Shared Users
 *
 * Revokes sharing of a neurosis with users.
 *
 * @param neurosisId Neurosis ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeNeurosisSharedUsers(
  neurosisId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('neurosis_shared_user')
    .delete()
    .eq('neurosis_id', neurosisId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Neurosis Shared Users: ${error.message}`)
}
