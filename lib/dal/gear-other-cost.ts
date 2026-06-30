import { ensureGearCanBeUpdated } from '@/lib/dal/utils'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { GearOtherCostDetail } from '@/lib/types'

const GEAR_OTHER_COST_SELECT = `
  id,
  gear_id,
  cost_name,
  quantity
`

/**
 * Get Gear Other Costs
 *
 * Retrieves all other gear costs visible to the authenticated user.
 *
 * @returns Gear Other Costs Keyed by ID
 */
export async function getGearOtherCosts(): Promise<{
  [key: string]: GearOtherCostDetail
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear_other_cost')
    .select(GEAR_OTHER_COST_SELECT)

  if (error)
    throw new Error(`Error Fetching Gear Other Costs: ${error.message}`)

  const gearOtherCostMap: { [key: string]: GearOtherCostDetail } = {}
  for (const gearOtherCost of data ?? [])
    gearOtherCostMap[gearOtherCost.id] = gearOtherCost

  return gearOtherCostMap
}

/**
 * Add Gear Other Cost
 *
 * Adds a new gear other cost record to the database.
 *
 * @param gearOtherCost Gear Other Cost Data
 * @returns Inserted Gear Other Cost
 */
export async function addGearOtherCost(
  gearOtherCost: TablesInsert<'gear_other_cost'>
): Promise<GearOtherCostDetail> {
  await ensureGearCanBeUpdated(gearOtherCost.gear_id)
  const supabase = createClient()
  const insertData: TablesInsert<'gear_other_cost'> = { ...gearOtherCost }

  const { data, error } = await supabase
    .from('gear_other_cost')
    .insert(insertData)
    .select(GEAR_OTHER_COST_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Gear Other Cost: ${error.message}`)

  return data
}

/**
 * Update Gear Other Cost
 *
 * Updates an existing gear other cost record in the database.
 *
 * @param id Gear Other Cost ID
 * @param gearId Gear ID
 * @param gearOtherCost Gear Other Cost Data
 */
export async function updateGearOtherCost(
  id: string,
  gearId: string,
  gearOtherCost: Omit<TablesUpdate<'gear_other_cost'>, 'id' | 'gear_id'>
): Promise<void> {
  await ensureGearCanBeUpdated(gearId)
  const supabase = createClient()
  const updateData: TablesUpdate<'gear_other_cost'> = { ...gearOtherCost }

  delete updateData.id
  delete updateData.gear_id

  const { error } = await supabase
    .from('gear_other_cost')
    .update(updateData)
    .eq('id', id)
    .eq('gear_id', gearId)

  if (error) throw new Error(`Error Updating Gear Other Cost: ${error.message}`)
}

/**
 * Remove Gear Other Cost
 *
 * Deletes a gear other cost record from the database.
 *
 * @param id Gear Other Cost ID
 * @param gearId Gear ID
 */
export async function removeGearOtherCost(
  id: string,
  gearId: string
): Promise<void> {
  await ensureGearCanBeUpdated(gearId)
  const supabase = createClient()

  const { error } = await supabase
    .from('gear_other_cost')
    .delete()
    .eq('id', id)
    .eq('gear_id', gearId)

  if (error) throw new Error(`Error Removing Gear Other Cost: ${error.message}`)
}
