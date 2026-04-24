import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { LocationDetail } from '@/lib/types'

/**
 * Get Quarry Location Junction IDs
 *
 * Fetches the quarry_location junction table row IDs for a specific quarry.
 *
 * @param quarryId Quarry ID
 * @returns Junction Row IDs
 */
export async function getQuarryLocationJunctionIds(
  quarryId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_location')
    .select('id')
    .eq('quarry_id', quarryId)

  if (error)
    throw new Error(
      `Error Fetching Quarry Location Junction IDs: ${error.message}`
    )

  return (data ?? []).map((item) => item.id)
}

/**
 * Get Quarry Location IDs
 *
 * Fetches location IDs associated with a specific quarry from the
 * quarry_location table.
 *
 * @param quarryId Quarry ID
 * @returns Quarry Location IDs
 */
export async function getQuarryLocationIds(
  quarryId: string | null | undefined
): Promise<string[]> {
  if (!quarryId) throw new Error('Required: Quarry ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_location')
    .select('location_id')
    .eq('quarry_id', quarryId)

  if (error)
    throw new Error(`Error Fetching Quarry Location IDs: ${error.message}`)

  if (!data) throw new Error('Quarry Location ID(s) Not Found')

  return data.map((item) => item.location_id)
}

/**
 * Get Quarry Location Data
 *
 * Fetches location data associated with a specific quarry by joining the
 * quarry_location and location tables.
 *
 * @param quarryId Quarry ID
 * @returns Quarry Location Data
 */
export async function getQuarryLocations(
  quarryId: string | null | undefined
): Promise<LocationDetail[]> {
  if (!quarryId) throw new Error('Required: Quarry ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_location')
    .select('location(custom, id, location_name, rules)')
    .eq('quarry_id', quarryId)

  if (error)
    throw new Error(`Error Fetching Quarry Location Data: ${error.message}`)

  if (!data) throw new Error('Quarry Location Data Not Found')

  return (
    data as unknown as {
      location: {
        custom: boolean
        id: string
        location_name: string
        rules: string | null
      }
    }[]
  ).map((item) => ({
    ...item.location
  }))
}

/**
 * Add Quarry Location
 *
 * Links a location to a quarry.
 *
 * @param quarryLocation Quarry Location Data
 * @returns Inserted Quarry Location ID
 */
export async function addQuarryLocation(
  quarryLocation: Omit<
    TablesInsert<'quarry_location'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_location')
    .insert(quarryLocation)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Quarry Location: ${error.message}`)

  return data.id
}

/**
 * Update Quarry Location
 *
 * Updates an existing quarry location record.
 *
 * @param id Quarry Location ID
 * @param quarryLocation Quarry Location Data
 */
export async function updateQuarryLocation(
  id: string,
  quarryLocation: Omit<
    TablesUpdate<'quarry_location'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_location')
    .update(quarryLocation)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Quarry Location: ${error.message}`)
}

/**
 * Remove Quarry Locations
 *
 * @param ids Quarry Location IDs
 */
export async function removeQuarryLocations(ids: string[]): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_location')
    .delete()
    .in('id', ids)

  if (error)
    throw new Error(`Error Removing Quarry Locations: ${error.message}`)
}
