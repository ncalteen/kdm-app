import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Seed Pattern Shared Users
 *
 * Retrieves all users a seed pattern is shared with, including their usernames
 * from the user_settings table.
 *
 * @param seedPatternId Seed Pattern ID
 * @returns Shared User IDs and Usernames
 */
export async function getSeedPatternSharedUsers(
  seedPatternId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern_shared_user')
    .select('shared_user_id, user_settings!shared_user_id(username)')
    .eq('seed_pattern_id', seedPatternId)

  if (error)
    throw new Error(
      `Error Fetching Seed Pattern Shared Users: ${error.message}`
    )

  if (!data || data.length === 0) return []

  return data.map((row) => ({
    shared_user_id: row.shared_user_id,
    username: (row.user_settings as unknown as { username: string })?.username
  }))
}

/**
 * Add Seed Pattern Shared Users
 *
 * Shares a seed pattern with other users.
 *
 * @param seedPatternId Seed Pattern ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addSeedPatternSharedUsers(
  seedPatternId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('seed_pattern_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      seed_pattern_id: seedPatternId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Seed Pattern Shared Users: ${error.message}`)
}

/**
 * Remove Seed Pattern Shared Users
 *
 * Revokes sharing of a seed pattern with users. Only allows the owner of the
 * resource to revoke sharing.
 *
 * @param seedPatternId Seed Pattern ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeSeedPatternSharedUsers(
  seedPatternId: string,
  sharedUserIds: string[]
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const userId = await getUserId()
  const supabase = createClient()

  const { error } = await supabase
    .from('seed_pattern_shared_user')
    .delete()
    .eq('seed_pattern_id', seedPatternId)
    .in('shared_user_id', sharedUserIds)
    .eq('user_id', userId)

  if (error)
    throw new Error(
      `Error Removing Seed Pattern Shared Users: ${error.message}`
    )
}
