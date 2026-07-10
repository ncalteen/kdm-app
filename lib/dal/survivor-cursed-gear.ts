import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SurvivorCursedGearDetail } from '@/lib/types'

const SURVIVOR_CURSED_GEAR_SELECT = `
  id,
  gear_id,
  settlement_id,
  survivor_id,
  cursed_gear:gear(
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
  )
`

/**
 * Get Survivor Cursed Gear
 *
 * Retrieves all cursed gear items for a survivor.
 *
 * @param survivorId Survivor ID
 * @returns Survivor Cursed Gear
 */
export async function getSurvivorCursedGear(
  survivorId: string | null | undefined
): Promise<SurvivorCursedGearDetail[]> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_cursed_gear')
    .select(SURVIVOR_CURSED_GEAR_SELECT)
    .eq('survivor_id', survivorId)

  if (error)
    throw new Error(`Error Fetching Survivor Cursed Gear: ${error.message}`)

  return (data ?? []) as SurvivorCursedGearDetail[]
}

/**
 * Add Survivor Cursed Gear
 *
 * Adds a cursed gear item to a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param gearId Gear ID
 * @returns Junction Table Row ID
 */
export async function addSurvivorCursedGear(
  survivorId: string,
  gearId: string
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_cursed_gear')
    .insert({ survivor_id: survivorId, gear_id: gearId })
    .select('id')
    .single()

  if (error)
    throw new Error(`Error Adding Survivor Cursed Gear: ${error.message}`)

  return data.id
}

/**
 * Remove Survivor Cursed Gear
 *
 * Removes a cursed gear item from a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param gearId Gear ID
 */
export async function removeSurvivorCursedGear(
  survivorId: string,
  gearId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('survivor_cursed_gear')
    .delete()
    .eq('survivor_id', survivorId)
    .eq('gear_id', gearId)

  if (error)
    throw new Error(`Error Removing Survivor Cursed Gear: ${error.message}`)
}

/**
 * Update Survivor Cursed Gear
 *
 * Updates an existing survivor cursed gear record.
 *
 * @param id Survivor Cursed Gear ID
 * @param survivorCursedGear Survivor Cursed Gear Data
 */
export async function updateSurvivorCursedGear(
  id: string,
  survivorCursedGear: Omit<
    TablesUpdate<'survivor_cursed_gear'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'survivor_cursed_gear'> = {
    ...survivorCursedGear
  }

  delete updateData.id

  const { error } = await supabase
    .from('survivor_cursed_gear')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Survivor Cursed Gear: ${error.message}`)
}
