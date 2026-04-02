import { createClient } from '@/lib/supabase/client'

/**
 * Get Character Shared Users
 *
 * Retrieves all users a character is shared with, including their usernames
 * from the user_settings table.
 *
 * @param characterId Character ID
 * @returns Shared User IDs and Usernames
 */
export async function getCharacterSharedUsers(
  characterId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('character_shared_user')
    .select('shared_user_id')
    .eq('character_id', characterId)

  if (error)
    throw new Error(`Error Fetching Character Shared Users: ${error.message}`)

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
 * Add Character Shared Users
 *
 * Shares a character with user(s).
 *
 * @param characterId Character ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addCharacterSharedUsers(
  characterId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('character_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      character_id: characterId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Character Shared Users: ${error.message}`)
}

/**
 * Remove Character Shared Users
 *
 * Revokes sharing of a character with user(s).
 *
 * @param characterId Character ID
 * @param sharedUserId Shared User IDs
 */
export async function removeCharacterSharedUsers(
  characterId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('character_shared_user')
    .delete()
    .eq('character_id', characterId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Character Shared Users: ${error.message}`)
}
