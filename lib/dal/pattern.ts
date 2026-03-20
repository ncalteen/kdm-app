import { TablesInsert, TablesUpdate } from '@/lib/database.types'
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
    supabase.from('pattern').select('id, pattern_name').eq('custom', false),
    supabase
      .from('pattern')
      .select('id, pattern_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('pattern_shared_user')
      .select('pattern(id, pattern_name)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Patterns: ${result.error.message}`)

  const patternMap: { [key: string]: PatternDetail } = {}

  for (const p of nonCustomResult.data ?? []) patternMap[p.id] = p
  for (const p of userCustomResult.data ?? []) patternMap[p.id] = p
  for (const row of sharedResult.data ?? [])
    patternMap[row.pattern[0].id] = row.pattern[0]

  return patternMap
}

/**
 * Add Pattern
 *
 * Adds a new pattern record to the database.
 *
 * @param pattern Pattern Data
 * @returns Inserted Pattern
 */
export async function addPattern(
  pattern: Omit<TablesInsert<'pattern'>, 'id' | 'created_at' | 'updated_at'>
): Promise<PatternDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern')
    .insert(pattern)
    .select('id, pattern_name')
    .single()

  if (error) throw new Error(`Error Adding Pattern: ${error.message}`)

  return data
}

/**
 * Update Pattern
 *
 * Updates an existing pattern record in the database.
 *
 * @param id Pattern ID
 * @param pattern Pattern Data
 * @returns Updated Pattern
 */
export async function updatePattern(
  id: string,
  pattern: Omit<TablesUpdate<'pattern'>, 'id' | 'created_at' | 'updated_at'>
): Promise<PatternDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern')
    .update(pattern)
    .eq('id', id)
    .select('id, pattern_name')
    .single()

  if (error) throw new Error(`Error Updating Pattern: ${error.message}`)
  if (!data) throw new Error('Pattern Not Found')

  return data
}

/**
 * Remove Pattern
 *
 * Deletes a pattern record from the database.
 *
 * @param id Pattern ID
 */
export async function removePattern(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('pattern').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Pattern: ${error.message}`)
}
