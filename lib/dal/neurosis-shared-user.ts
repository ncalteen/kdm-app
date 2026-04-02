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
    .select('shared_user_id')
    .eq('neurosis_id', neurosisId)

  if (error)
    throw new Error(`Error Fetching Neurosis Shared Users: ${error.message}`)

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
