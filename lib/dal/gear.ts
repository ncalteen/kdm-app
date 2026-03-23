import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { GearDetail } from '@/lib/types'

/**
 * Get Gear
 *
 * Retrieves all gear available to the authenticated user:
 * - Built-in (non-custom) gear
 * - Custom gear owned by the user
 * - Custom gear shared with the user
 *
 * @returns Gear
 */
export async function getGear(): Promise<{
  [key: string]: GearDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase
      .from('gear')
      .select('id, gear_name, location_id')
      .eq('custom', false),
    supabase
      .from('gear')
      .select('id, gear_name, location_id')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('gear_shared_user')
      .select('gear(id, gear_name, location_id)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Gear: ${result.error.message}`)

  const gearMap: { [key: string]: GearDetail } = {}

  for (const g of nonCustomResult.data ?? []) gearMap[g.id] = g
  for (const g of userCustomResult.data ?? []) gearMap[g.id] = g
  for (const row of sharedResult.data ?? [])
    gearMap[row.gear[0].id] = row.gear[0]

  return gearMap
}

/**
 * Add Gear
 *
 * Adds a new gear record to the database.
 *
 * @param gear Gear Data
 * @returns Inserted Gear
 */
export async function addGear(
  gear: Omit<TablesInsert<'gear'>, 'id' | 'created_at' | 'updated_at'>
): Promise<GearDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear')
    .insert(gear)
    .select('id, gear_name, location_id')
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
 * @returns Updated Gear
 */
export async function updateGear(
  id: string,
  gear: Omit<TablesUpdate<'gear'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('gear').update(gear).eq('id', id)

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
