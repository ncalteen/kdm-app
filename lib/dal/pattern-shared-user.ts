import { createClient } from '@/lib/supabase/client'

/**
 * Get Pattern Shared Users
 *
 * Retrieves all users a pattern is shared with.
 *
 * @param patternId Pattern ID
 * @returns Shared User IDs
 */
export async function getPatternSharedUsers(
  patternId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern_shared_user')
    .select('shared_user_id')
    .eq('pattern_id', patternId)

  if (error)
    throw new Error(`Error Fetching Pattern Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Pattern Shared User
 *
 * Shares a pattern with another user.
 *
 * @param patternId Pattern ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addPatternSharedUser(
  patternId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('pattern_shared_user').insert({
    pattern_id: patternId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Pattern Shared User: ${error.message}`)
}

/**
 * Remove Pattern Shared User
 *
 * Revokes sharing of a pattern with a user.
 *
 * @param patternId Pattern ID
 * @param sharedUserId Shared User ID
 */
export async function removePatternSharedUser(
  patternId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pattern_shared_user')
    .delete()
    .eq('pattern_id', patternId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Pattern Shared User: ${error.message}`)
}
