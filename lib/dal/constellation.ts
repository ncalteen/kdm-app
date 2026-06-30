import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { ConstellationDetail } from '@/lib/types'

export const CONSTELLATION_SELECT = `
  id,
  custom,
  constellation_name,
  rules
`

/**
 * Get Constellations
 *
 * Retrieves all constellations visible to the authenticated user. RLS surfaces:
 *
 * - Built-in (non-custom) constellations
 * - Custom constellations owned by the user
 *
 * @returns Constellations by ID
 */
export async function getConstellations(): Promise<{
  [key: string]: ConstellationDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('constellation')
    .select(CONSTELLATION_SELECT)

  if (error) throw new Error(`Error Fetching Constellations: ${error.message}`)

  const map: { [key: string]: ConstellationDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Get User Custom Constellations
 *
 * Retrieves user user custom constellations data.
 *
 * @returns User Custom Constellations
 */
export async function getUserCustomConstellations(): Promise<{
  [key: string]: ConstellationDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('constellation')
    .select(CONSTELLATION_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error)
    throw new Error(`Error Fetching Custom Constellations: ${error.message}`)

  const map: { [key: string]: ConstellationDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Add Constellation
 *
 * Adds a new constellation record to the database.
 *
 * @param constellation Constellation Data
 * @returns Inserted Constellation
 */
export async function addConstellation(
  constellation: Omit<
    TablesInsert<'constellation'>,
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<ConstellationDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'constellation'> = { ...constellation }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('constellation')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(CONSTELLATION_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Constellation: ${error.message}`)

  return data
}

/**
 * Update Constellation
 *
 * Updates an existing constellation record.
 *
 * @param id Constellation ID
 * @param constellation Constellation Data
 */
export async function updateConstellation(
  id: string,
  constellation: Omit<
    TablesUpdate<'constellation'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'constellation'> = { ...constellation }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('constellation')
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Constellation: ${error.message}`)
}

/**
 * Remove Constellation
 *
 * Deletes a constellation record from the database.
 *
 * @param id Constellation ID
 */
export async function removeConstellation(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('constellation').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Constellation: ${error.message}`)
}
