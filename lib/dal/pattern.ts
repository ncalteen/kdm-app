import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Patterns
 *
 * Retrieves all patterns available to the authenticated user:
 * - Built-in (non-custom) patterns
 * - Custom patterns owned by the user
 * - Custom patterns shared with the user
 *
 * @returns Patterns
 */
export async function getPatterns(): Promise<
  Omit<Tables<'pattern'>, 'created_at' | 'updated_at' | 'custom' | 'user_id'>[]
> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const selectFields = 'id, pattern_name, seed_pattern'

  // Built-in patterns
  const { data: builtIn, error: builtInError } = await supabase
    .from('pattern')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(`Error Fetching Built-in Patterns: ${builtInError.message}`)

  // Custom patterns owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('pattern')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Patterns: ${ownedError.message}`)

  // Custom patterns shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('pattern_shared_user')
    .select(`pattern(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Patterns: ${sharedError.message}`)

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.pattern)
      ? row.pattern
      : row.pattern
        ? [row.pattern]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
