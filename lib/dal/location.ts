import { createClient } from '@/lib/supabase/client'
import { LocationDetail } from '@/lib/types'

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
export async function getLocations(): Promise<{
  [key: string]: LocationDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase.from('location').select('id, location_name').eq('custom', false),
    supabase
      .from('location')
      .select('id, location_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('location_shared_user')
      .select('location(id, location_name)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Locations: ${result.error.message}`)

  const locationMap: { [key: string]: LocationDetail } = {}

  for (const l of nonCustomResult.data ?? []) locationMap[l.id] = l
  for (const l of userCustomResult.data ?? []) locationMap[l.id] = l
  for (const row of sharedResult.data ?? [])
    locationMap[row.location[0].id] = row.location[0]

  return locationMap
}

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
