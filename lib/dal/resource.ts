import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Resources
 *
 * Retrieves all resources available to the authenticated user:
 * - Built-in (non-custom) resources
 * - Custom resources owned by the user
 * - Custom resources shared with the user
 *
 * @returns Resources
 */
export async function getResources(): Promise<
  Omit<Tables<'resource'>, 'created_at' | 'updated_at' | 'custom' | 'user_id'>[]
> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const selectFields = 'id, resource_name, category, quarry_id, resource_types'

  // Built-in resources
  const { data: builtIn, error: builtInError } = await supabase
    .from('resource')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Resources: ${builtInError.message}`
    )

  // Custom resources owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('resource')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Resources: ${ownedError.message}`)

  // Custom resources shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('resource_shared_user')
    .select(`resource(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Resources: ${sharedError.message}`)

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.resource)
      ? row.resource
      : row.resource
        ? [row.resource]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
