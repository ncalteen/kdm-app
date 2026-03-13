import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Disorders
 *
 * Retrieves all disorders available to the authenticated user:
 * - Built-in (non-custom) disorders
 * - Custom disorders owned by the user
 * - Custom disorders shared with the user
 *
 * @returns Disorders
 */
export async function getDisorders(): Promise<
  Omit<Tables<'disorder'>, 'created_at' | 'updated_at' | 'custom' | 'user_id'>[]
> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const selectFields = 'id, disorder_name'

  // Built-in disorders
  const { data: builtIn, error: builtInError } = await supabase
    .from('disorder')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Disorders: ${builtInError.message}`
    )

  // Custom disorders owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('disorder')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Disorders: ${ownedError.message}`)

  // Custom disorders shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('disorder_shared_user')
    .select(`disorder(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Disorders: ${sharedError.message}`)

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.disorder)
      ? row.disorder
      : row.disorder
        ? [row.disorder]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
