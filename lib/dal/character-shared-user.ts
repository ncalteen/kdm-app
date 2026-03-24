import { createClient } from '@/lib/supabase/client'

/**
 * Get Character Shared Users
 *
 * Retrieves all users a character is shared with.
 *
 * @param characterId Character ID
 * @returns Shared User IDs
 */
export async function getCharacterSharedUsers(
  characterId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('character_shared_user')
    .select('shared_user_id')
    .eq('character_id', characterId)

  if (error)
    throw new Error(`Error Fetching Character Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Character Shared User
 *
 * Shares a character with another user.
 *
 * @param characterId Character ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addCharacterSharedUser(
  characterId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('character_shared_user').insert({
    character_id: characterId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Character Shared User: ${error.message}`)
}

/**
 * Remove Character Shared User
 *
 * Revokes sharing of a character with a user.
 *
 * @param characterId Character ID
 * @param sharedUserId Shared User ID
 */
export async function removeCharacterSharedUser(
  characterId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('character_shared_user')
    .delete()
    .eq('character_id', characterId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Character Shared User: ${error.message}`)
}
