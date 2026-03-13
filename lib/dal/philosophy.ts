import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Philosophies
 *
 * Retrieves all philosophies available to the authenticated user:
 * - Built-in (non-custom) philosophies
 * - Custom philosophies owned by the user
 * - Custom philosophies shared with the user
 *
 * @returns Philosophies
 */
export async function getPhilosophies(): Promise<
  Omit<
    Tables<'philosophy'>,
    'created_at' | 'updated_at' | 'custom' | 'user_id'
  >[]
> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const selectFields = 'id, philosophy_name, neurosis_name'

  // Built-in philosophies
  const { data: builtIn, error: builtInError } = await supabase
    .from('philosophy')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Philosophies: ${builtInError.message}`
    )

  // Custom philosophies owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('philosophy')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Philosophies: ${ownedError.message}`)

  // Custom philosophies shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('philosophy_shared_user')
    .select(`philosophy(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(
      `Error Fetching Shared Philosophies: ${sharedError.message}`
    )

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.philosophy)
      ? row.philosophy
      : row.philosophy
        ? [row.philosophy]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
