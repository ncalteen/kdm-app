import { createClient } from '@/lib/supabase/client'

/**
 * Get Secret Fighting Art Shared Users
 *
 * Retrieves all users a secret fighting art is shared with, including their
 * usernames from the user_settings table.
 *
 * @param secretFightingArtId Secret Fighting Art ID
 * @returns Shared User IDs and Usernames
 */
export async function getSecretFightingArtSharedUsers(
  secretFightingArtId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('secret_fighting_art_shared_user')
    .select('shared_user_id')
    .eq('secret_fighting_art_id', secretFightingArtId)

  if (error)
    throw new Error(
      `Error Fetching Secret Fighting Art Shared Users: ${error.message}`
    )

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
 * Add Secret Fighting Art Shared Users
 *
 * Shares a secret fighting art with other users.
 *
 * @param secretFightingArtId Secret Fighting Art ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addSecretFightingArtSharedUsers(
  secretFightingArtId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('secret_fighting_art_shared_user')
    .insert(
      sharedUserIds.map((sharedUserId) => ({
        secret_fighting_art_id: secretFightingArtId,
        shared_user_id: sharedUserId,
        user_id: userId
      }))
    )

  if (error)
    throw new Error(
      `Error Adding Secret Fighting Art Shared Users: ${error.message}`
    )
}

/**
 * Remove Secret Fighting Art Shared Users
 *
 * Revokes sharing of a secret fighting art with users.
 *
 * @param secretFightingArtId Secret Fighting Art ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeSecretFightingArtSharedUsers(
  secretFightingArtId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('secret_fighting_art_shared_user')
    .delete()
    .eq('secret_fighting_art_id', secretFightingArtId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(
      `Error Removing Secret Fighting Art Shared Users: ${error.message}`
    )
}
