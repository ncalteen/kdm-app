import { createClient } from '@/lib/supabase/client'

/**
 * Get Seed Pattern Shared Users
 *
 * Retrieves all users a seed pattern is shared with.
 *
 * @param seedPatternId Seed Pattern ID
 * @returns Shared User IDs
 */
export async function getSeedPatternSharedUsers(
  seedPatternId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern_shared_user')
    .select('shared_user_id')
    .eq('seed_pattern_id', seedPatternId)

  if (error)
    throw new Error(
      `Error Fetching Seed Pattern Shared Users: ${error.message}`
    )

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Seed Pattern Shared User
 *
 * Shares a seed pattern with another user.
 *
 * @param seedPatternId Seed Pattern ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addSeedPatternSharedUser(
  seedPatternId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('seed_pattern_shared_user').insert({
    seed_pattern_id: seedPatternId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Seed Pattern Shared User: ${error.message}`)
}

/**
 * Remove Seed Pattern Shared User
 *
 * Revokes sharing of a seed pattern with a user.
 *
 * @param seedPatternId Seed Pattern ID
 * @param sharedUserId Shared User ID
 */
export async function removeSeedPatternSharedUser(
  seedPatternId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('seed_pattern_shared_user')
    .delete()
    .eq('seed_pattern_id', seedPatternId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Seed Pattern Shared User: ${error.message}`)
}
