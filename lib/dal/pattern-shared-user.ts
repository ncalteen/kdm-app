import { createClient } from '@/lib/supabase/client'

/**
 * Get Pattern Shared Users
 *
 * Retrieves all users a pattern is shared with, including their usernames
 * from the user_settings table.
 *
 * @param patternId Pattern ID
 * @returns Shared User IDs and Usernames
 */
export async function getPatternSharedUsers(
  patternId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern_shared_user')
    .select('shared_user_id')
    .eq('pattern_id', patternId)

  if (error)
    throw new Error(`Error Fetching Pattern Shared Users: ${error.message}`)

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
 * Add Pattern Shared Users
 *
 * Shares a pattern with other users.
 *
 * @param patternId Pattern ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addPatternSharedUsers(
  patternId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('pattern_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      pattern_id: patternId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Pattern Shared Users: ${error.message}`)
}

/**
 * Remove Pattern Shared Users
 *
 * Revokes sharing of a pattern with users.
 *
 * @param patternId Pattern ID
 * @param sharedUserIds Shared User IDs
 */
export async function removePatternSharedUsers(
  patternId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pattern_shared_user')
    .delete()
    .eq('pattern_id', patternId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Pattern Shared Users: ${error.message}`)
}
