import { TablesInsert } from '@/lib/database.types'
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
