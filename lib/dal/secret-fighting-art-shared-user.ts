import { createClient } from '@/lib/supabase/client'

/**
 * Get Secret Fighting Art Shared Users
 *
 * Retrieves all users a secret fighting art is shared with.
 *
 * @param secretFightingArtId Secret Fighting Art ID
 * @returns Shared User IDs
 */
export async function getSecretFightingArtSharedUsers(
  secretFightingArtId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('secret_fighting_art_shared_user')
    .select('shared_user_id')
    .eq('secret_fighting_art_id', secretFightingArtId)

  if (error)
    throw new Error(
      `Error Fetching Secret Fighting Art Shared Users: ${error.message}`
    )

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Secret Fighting Art Shared User
 *
 * Shares a secret fighting art with another user.
 *
 * @param secretFightingArtId Secret Fighting Art ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addSecretFightingArtSharedUser(
  secretFightingArtId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('secret_fighting_art_shared_user')
    .insert({
      secret_fighting_art_id: secretFightingArtId,
      shared_user_id: sharedUserId,
      user_id: userId
    })

  if (error)
    throw new Error(
      `Error Adding Secret Fighting Art Shared User: ${error.message}`
    )
}

/**
 * Remove Secret Fighting Art Shared User
 *
 * Revokes sharing of a secret fighting art with a user.
 *
 * @param secretFightingArtId Secret Fighting Art ID
 * @param sharedUserId Shared User ID
 */
export async function removeSecretFightingArtSharedUser(
  secretFightingArtId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('secret_fighting_art_shared_user')
    .delete()
    .eq('secret_fighting_art_id', secretFightingArtId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(
      `Error Removing Secret Fighting Art Shared User: ${error.message}`
    )
}
