import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

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
 * Remove Quarry Location
 *
 * Deletes a quarry location record from the database.
 *
 * @param id Quarry Location ID
 */
export async function removeQuarryLocation(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('quarry_location').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Quarry Location: ${error.message}`)
}
