import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Nemesis Location IDs
 *
 * Fetches location IDs associated with a specific nemesis from the
 * nemesis_location table.
 *
 * @param nemesisId Nemesis ID
 * @returns Nemesis Location IDs
 */
export async function getNemesisLocationIds(
  nemesisId: string | null | undefined
): Promise<string[]> {
  if (!nemesisId) throw new Error('Required: Nemesis ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_location')
    .select('location_id')
    .eq('nemesis_id', nemesisId)

  if (error)
    throw new Error(`Error Fetching Nemesis Location IDs: ${error.message}`)

  if (!data) throw new Error('Nemesis Location ID(s) Not Found')

  return data.map((item) => item.location_id)
}

/**
 * Add Nemesis Location
 *
 * Links a location to a nemesis.
 *
 * @param nemesisLocation Nemesis Location Data
 * @returns Inserted Nemesis Location ID
 */
export async function addNemesisLocation(
  nemesisLocation: Omit<
    TablesInsert<'nemesis_location'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_location')
    .insert(nemesisLocation)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Nemesis Location: ${error.message}`)

  return data.id
}

/**
 * Update Nemesis Location
 *
 * Updates an existing nemesis location record.
 *
 * @param id Nemesis Location ID
 * @param nemesisLocation Nemesis Location Data
 */
export async function updateNemesisLocation(
  id: string,
  nemesisLocation: Omit<
    TablesUpdate<'nemesis_location'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('nemesis_location')
    .update(nemesisLocation)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Nemesis Location: ${error.message}`)
}

/**
 * Remove Nemesis Location
 *
 * Deletes a nemesis location record from the database.
 *
 * @param id Nemesis Location ID
 */
export async function removeNemesisLocation(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('nemesis_location')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Nemesis Location: ${error.message}`)
}
