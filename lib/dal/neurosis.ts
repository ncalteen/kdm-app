import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Neuroses
 *
 * Retrieves all neuroses available to the authenticated user:
 * - Built-in (non-custom) neuroses
 * - Custom neuroses owned by the user
 * - Custom neuroses shared with the user
 *
 * @returns Neuroses
 */
export async function getNeuroses(): Promise<
  Omit<Tables<'neurosis'>, 'created_at' | 'updated_at' | 'custom' | 'user_id'>[]
> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const selectFields = 'id, neurosis_name, philosophy_id'

  // Built-in neuroses
  const { data: builtIn, error: builtInError } = await supabase
    .from('neurosis')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(`Error Fetching Built-in Neuroses: ${builtInError.message}`)

  // Custom neuroses owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('neurosis')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Neuroses: ${ownedError.message}`)

  // Custom neuroses shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('neurosis_shared_user')
    .select(`neurosis(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Neuroses: ${sharedError.message}`)

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.neurosis)
      ? row.neurosis
      : row.neurosis
        ? [row.neurosis]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
