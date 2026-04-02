import { createClient } from '@/lib/supabase/client'

/**
 * Get Fighting Art Shared Users
 *
 * Retrieves all users a fighting art is shared with, including their usernames
 * from the user_settings table.
 *
 * @param fightingArtId Fighting Art ID
 * @returns Shared User IDs and Usernames
 */
export async function getFightingArtSharedUsers(
  fightingArtId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('fighting_art_shared_user')
    .select('shared_user_id')
    .eq('fighting_art_id', fightingArtId)

  if (error)
    throw new Error(
      `Error Fetching Fighting Art Shared Users: ${error.message}`
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
 * Add Fighting Art Shared Users
 *
 * Shares a fighting art with other users.
 *
 * @param fightingArtId Fighting Art ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addFightingArtSharedUsers(
  fightingArtId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('fighting_art_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      fighting_art_id: fightingArtId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Fighting Art Shared Users: ${error.message}`)
}

/**
 * Remove Fighting Art Shared Users
 *
 * Revokes sharing of a fighting art with users.
 *
 * @param fightingArtId Fighting Art ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeFightingArtSharedUsers(
  fightingArtId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('fighting_art_shared_user')
    .delete()
    .eq('fighting_art_id', fightingArtId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(
      `Error Removing Fighting Art Shared Users: ${error.message}`
    )
}
