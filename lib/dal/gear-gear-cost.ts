import { getUserId } from '@/lib/dal/user'
import { ensureGearCanBeUpdated } from '@/lib/dal/utils'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { GearGearCostDetail } from '@/lib/types'

const GEAR_GEAR_COST_SELECT = `
  gear_id,
  cost_gear_id,
  quantity,
  cost_gear:gear!cost_gear_id(
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
 * Get Gear Gear Costs
 *
 * Retrieves all gear gear costs visible to the authenticated user. RLS
 * surfaces:
 *
 * - Built-in (non-custom) gear
 * - Custom gear owned by the user
 * - Custom gear on settlements the user collaborates on (via the transitive
 *   SELECT policy on `gear`)
 *
 * @returns Gear Gear Costs Keyed by ID
 */
export async function getGearGearCosts(): Promise<{
  [key: string]: GearGearCostDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear_gear_cost')
    .select(GEAR_GEAR_COST_SELECT)

  if (error) throw new Error(`Error Fetching Gear Gear Costs: ${error.message}`)

  const gearGearCostMap: { [key: string]: GearGearCostDetail } = {}
  for (const gearGearCost of data)
    gearGearCostMap[gearGearCost.gear_id] = gearGearCost

  return gearGearCostMap
}

/**
 * Add Gear Gear Cost
 *
 * Adds a new gear gear cost record to the database.
 *
 * @param gearGearCost Gear Gear Cost Data
 * @returns Inserted Gear Gear Cost (with empty junction arrays)
 */
export async function addGearGearCost(
  gearGearCost: TablesInsert<'gear_gear_cost'>
): Promise<GearGearCostDetail> {
  await ensureGearCanBeUpdated(gearGearCost.gear_id)
  const supabase = createClient()
  const insertData: TablesInsert<'gear_gear_cost'> = { ...gearGearCost }

  const { data, error } = await supabase
    .from('gear_gear_cost')
    .insert(insertData)
    .select(GEAR_GEAR_COST_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Gear Gear Cost: ${error.message}`)

  return data
}

/**
 * Update Gear Gear Cost
 *
 * Updates an existing gear gear cost record in the database.
 *
 * @param id Gear ID
 * @param costGearId Cost Gear ID
 * @param gearGearCost Gear Gear Cost Data
 */
export async function updateGearGearCost(
  id: string,
  costGearId: string,
  gearGearCost: Omit<TablesUpdate<'gear_gear_cost'>, 'gear_id' | 'cost_gear_id'>
): Promise<void> {
  await ensureGearCanBeUpdated(id)
  const supabase = createClient()
  const updateData: TablesUpdate<'gear_gear_cost'> = { ...gearGearCost }

  delete updateData.gear_id
  delete updateData.cost_gear_id

  const { error } = await supabase
    .from('gear_gear_cost')
    .update(updateData)
    .eq('gear_id', id)
    .eq('cost_gear_id', costGearId)

  if (error) throw new Error(`Error Updating Gear Gear Cost: ${error.message}`)
}

/**
 * Remove Gear Gear Cost
 *
 * Deletes a gear gear cost record from the database.
 *
 * @param id Gear ID
 * @param costGearId Cost Gear ID
 */
export async function removeGearGearCost(
  id: string,
  costGearId: string
): Promise<void> {
  await ensureGearCanBeUpdated(id)
  const supabase = createClient()

  const { error } = await supabase
    .from('gear_gear_cost')
    .delete()
    .eq('gear_id', id)
    .eq('cost_gear_id', costGearId)

  if (error) throw new Error(`Error Removing Gear Gear Cost: ${error.message}`)
}
