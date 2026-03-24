import { createClient } from '@/lib/supabase/client'

/**
 * Get Fighting Art Shared Users
 *
 * Retrieves all users a fighting art is shared with.
 *
 * @param fightingArtId Fighting Art ID
 * @returns Shared User IDs
 */
export async function getFightingArtSharedUsers(
  fightingArtId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('fighting_art_shared_user')
    .select('shared_user_id')
    .eq('fighting_art_id', fightingArtId)

  if (error)
    throw new Error(
      `Error Fetching Fighting Art Shared Users: ${error.message}`
    )

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Fighting Art Shared User
 *
 * Shares a fighting art with another user.
 *
 * @param fightingArtId Fighting Art ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addFightingArtSharedUser(
  fightingArtId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('fighting_art_shared_user').insert({
    fighting_art_id: fightingArtId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Fighting Art Shared User: ${error.message}`)
}

/**
 * Remove Fighting Art Shared User
 *
 * Revokes sharing of a fighting art with a user.
 *
 * @param fightingArtId Fighting Art ID
 * @param sharedUserId Shared User ID
 */
export async function removeFightingArtSharedUser(
  fightingArtId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('fighting_art_shared_user')
    .delete()
    .eq('fighting_art_id', fightingArtId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Fighting Art Shared User: ${error.message}`)
}
