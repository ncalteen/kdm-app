import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { LocationDetail } from '@/lib/types'

/**
 * Get Locations
 *
 * Retrieves all locations visible to the authenticated user. RLS surfaces:
 * - Built-in (non-custom) locations
 * - Custom locations owned by the user
 * - Custom locations on settlements the user collaborates on (via the
 *   transitive SELECT policy on `location`)
 *
 * @returns Locations
 */
export async function getLocations(): Promise<{
  [key: string]: LocationDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('location')
    .select('id, custom, location_name, rules')

  if (error) throw new Error(`Error Fetching Locations: ${error.message}`)

  const locationMap: { [key: string]: LocationDetail } = {}
  for (const l of data ?? []) locationMap[l.id] = l

  return locationMap
}

/**
 * Get User Custom Locations
 *
 * Retrieves only custom locations authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Location Data Map
 */
export async function getUserCustomLocations(): Promise<{
  [key: string]: LocationDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('location')
    .select('id, custom, location_name, rules')
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Locations: ${error.message}`)

  const locationMap: { [key: string]: LocationDetail } = {}
  for (const l of data ?? []) locationMap[l.id] = l

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

/**
 * Add Location
 *
 * Adds a new location record to the database.
 *
 * @param location Location Data
 * @returns Inserted Location
 */
export async function addLocation(
  location: Omit<
    TablesInsert<'location'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<LocationDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (location.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('location')
    .insert({
      ...location,
      ...(location.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, location_name, rules')
    .single()

  if (error) throw new Error(`Error Adding Location: ${error.message}`)

  return data
}

/**
 * Update Location
 *
 * Updates an existing location record in the database.
 *
 * @param id Location ID
 * @param location Location Data
 * @returns Updated Location
 */
export async function updateLocation(
  id: string,
  location: Omit<TablesUpdate<'location'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('location')
    .update(location)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Location: ${error.message}`)
}

/**
 * Remove Location
 *
 * Deletes a location record from the database.
 *
 * @param id Location ID
 */
export async function removeLocation(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('location').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Location: ${error.message}`)
}
