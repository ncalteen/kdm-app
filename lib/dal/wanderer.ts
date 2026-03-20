import { createClient } from '@/lib/supabase/client'
import { WandererDetail } from '@/lib/types'

/**
 * Get Wanderers
 *
 * Retrieves the wanderers a user has access to. This includes:
 *
 * - Non-custom wanderers
 * - Custom wanderers created by the user
 * - Custom wanderers shared with the user (via the wanderer_shared_user table)
 *
 * @returns Wanderer Data
 */
export async function getWanderers(): Promise<{
  [key: string]: WandererDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Fetch all three categories of wanderers in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom wanderers (available to all users)
    supabase.from('wanderer').select('*').eq('custom', false),
    // Custom wanderers created by the user
    supabase
      .from('wanderer')
      .select('*')
      .eq('custom', true)
      .eq('user_id', user.id),
    // Custom wanderers shared with the user
    supabase
      .from('wanderer_shared_user')
      .select('wanderer(*)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Wanderers: ${result.error.message}`)

  // Collect wanderers from all sources, deduplicating by ID
  const wandererMap: { [key: string]: WandererDetail } = {}

  for (const w of nonCustomResult.data ?? []) wandererMap[w.id] = w
  for (const w of userCustomResult.data ?? []) wandererMap[w.id] = w
  for (const row of sharedResult.data ?? [])
    wandererMap[row.wanderer[0].id] = row.wanderer[0]

  return wandererMap
}

/**
 * Get Wanderer ID
 *
 * Retrieves the ID of a wanderer. This depends on if they are custom
 * wanderers (requires the user ID if so). This is used to populate new
 * settlements created from templates.
 *
 * @param wandererNames Wanderer Names
 * @param custom Custom
 * @param userId User ID
 * @returns Wanderer IDs
 */
export async function getWandererIds(
  wandererNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const { data, error } = userId
    ? await supabase
        .from('wanderer')
        .select('id')
        .in('wanderer_name', wandererNames)
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('wanderer')
        .select('id')
        .in('wanderer_name', wandererNames)
        .eq('custom', custom)

  if (error) throw new Error(`Error Fetching Wanderer ID(s): ${error.message}`)
  if (!data) throw new Error('Wanderer(s) Not Found')

  return data.map((wanderer) => wanderer.id)
}
