import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Location IDs
 *
 * Retrieves the IDs of locations. This depends on if they are custom locations
 * (requires the user ID if so).
 *
 * @param locationNames Location Names
 * @param custom Custom
 * @param userId User ID
 * @returns Location IDs
 */
export async function getLocationIds(
  locationNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('location')
        .select('id')
        .in('location_name', locationNames)
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('location')
        .select('id')
        .in('location_name', locationNames)
        .eq('custom', custom)

  if (error) throw new Error(`Error Fetching Location ID(s): ${error.message}`)

  if (!data) throw new Error('Location(s) Not Found')

  return data.map((location) => location.id)
}

/**
 * Get Locations
 *
 * Retrieves all locations available to the authenticated user:
 * - Built-in (non-custom) locations
 * - Custom locations owned by the user
 * - Custom locations shared with the user
 *
 * @returns Locations
 */
export async function getLocations(): Promise<
  Omit<Tables<'location'>, 'created_at' | 'updated_at' | 'custom' | 'user_id'>[]
> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const selectFields = 'id, location_name'

  // Built-in locations
  const { data: builtIn, error: builtInError } = await supabase
    .from('location')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Locations: ${builtInError.message}`
    )

  // Custom locations owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('location')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Locations: ${ownedError.message}`)

  // Custom locations shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('location_shared_user')
    .select(`location(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Locations: ${sharedError.message}`)

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.location)
      ? row.location
      : row.location
        ? [row.location]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
