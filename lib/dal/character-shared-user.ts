import { getUserId } from '@/lib/dal/user'
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
    .select('shared_user_id, user_settings!shared_user_id(username)')
    .eq('character_id', characterId)

  if (error)
    throw new Error(`Error Fetching Character Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  return data.map((row) => ({
    shared_user_id: row.shared_user_id,
    username: (row.user_settings as unknown as { username: string })?.username
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
  if (sharedUserIds.length === 0) return

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
 * Revokes sharing of a character with user(s). Only allows the owner of the
 * resource to revoke sharing.
 *
 * @param characterId Character ID
 * @param sharedUserId Shared User IDs
 */
export async function removeCharacterSharedUsers(
  characterId: string,
  sharedUserIds: string[]
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const userId = await getUserId()
  const supabase = createClient()

  const { error } = await supabase
    .from('character_shared_user')
    .delete()
    .eq('character_id', characterId)
    .in('shared_user_id', sharedUserIds)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Removing Character Shared Users: ${error.message}`)
}
