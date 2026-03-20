import { createClient } from '@/lib/supabase/client'
import { PatternDetail } from '@/lib/types'

/**
 * Get Patterns
 *
 * Retrieves all patterns available to the authenticated user:
 *
 * - Built-in (non-custom) patterns
 * - Custom patterns owned by the user
 * - Custom patterns shared with the user
 *
 * @returns Patterns
 */
export async function getPatterns(): Promise<{
  [key: string]: PatternDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase
      .from('pattern')
      .select('id, pattern_name, seed_pattern')
      .eq('custom', false),
    supabase
      .from('pattern')
      .select('id, pattern_name, seed_pattern')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('pattern_shared_user')
      .select('pattern(id, pattern_name, seed_pattern)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Patterns: ${result.error.message}`)

  const patternMap: { [key: string]: PatternDetail } = {}

  for (const p of nonCustomResult.data ?? []) patternMap[p.id] = p
  for (const p of userCustomResult.data ?? []) patternMap[p.id] = p
  for (const row of sharedResult.data ?? []) {
    const p = row.pattern as unknown as PatternDetail | null

    if (p) patternMap[p.id] = p
  }

  return patternMap
}
