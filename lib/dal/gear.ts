import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { GearDetail } from '@/lib/types'

const GEAR_SELECT = `
  id,
  custom,
  gear_name,
  location_id,
  accessory,
  accuracy,
  affinity_top,
  affinity_left,
  affinity_right,
  affinity_bottom,
  affinity_bonus,
  affinity_bonus_requirements,
  armor_points,
  armor_location,
  keywords,
  rules,
  speed,
  strength,
  weapon_type_id
`

/**
 * Get Gear
 *
 * Retrieves all gear visible to the authenticated user. RLS surfaces:
 *
 * - Built-in (non-custom) gear
 * - Custom gear owned by the user
 * - Custom gear on settlements the user collaborates on (via the transitive
 *   SELECT policy on `gear`)
 *
 * @returns Gear Keyed by ID
 */
export async function getGear(): Promise<{
  [key: string]: GearDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase.from('gear').select(GEAR_SELECT)

  if (error) throw new Error(`Error Fetching Gear: ${error.message}`)

  const gearMap: { [key: string]: GearDetail } = {}
  for (const gear of data) gearMap[gear.id] = gear

  return gearMap
}

/**
 * Get User Custom Gear
 *
 * Retrieves only custom gear authored by the current user. Used by the
 * user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Gear Data Map
 */
export async function getUserCustomGear(): Promise<{
  [key: string]: GearDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear')
    .select(GEAR_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error) throw new Error(`Error Fetching Custom Gear: ${error.message}`)

  const gearMap: { [key: string]: GearDetail } = {}
  for (const gear of data) gearMap[gear.id] = gear

  return gearMap
}

/**
 * Add Gear
 *
 * Adds a new gear record to the database. Junction rows (gear, resource, and
 * resource type costs) are persisted separately via the `replaceGear*`
 * helpers.
 *
 * @param gear Gear Data
 * @returns Inserted Gear (with empty junction arrays)
 */
export async function addGear(
  gear: Omit<
    TablesInsert<'gear'>,
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<GearDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'gear'> = { ...gear }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('gear')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(GEAR_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Gear: ${error.message}`)

  return data
}

/**
 * Update Gear
 *
 * Updates an existing gear record in the database.
 *
 * @param id Gear ID
 * @param gear Gear Data
 */
export async function updateGear(
  id: string,
  gear: Omit<
    TablesUpdate<'gear'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'gear'> = { ...gear }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase.from('gear').update(updateData).eq('id', id)

  if (error) throw new Error(`Error Updating Gear: ${error.message}`)
}

/**
 * Remove Gear
 *
 * Deletes a gear record from the database.
 *
 * @param id Gear ID
 */
export async function removeGear(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('gear').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Gear: ${error.message}`)
}
