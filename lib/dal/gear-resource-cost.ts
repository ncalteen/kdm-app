import { ensureGearCanBeUpdated } from '@/lib/dal/utils'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { GearResourceCostDetail } from '@/lib/types'

const GEAR_RESOURCE_COST_SELECT = `
  gear_id,
  resource_id,
  quantity,
  resource(
    id,
    custom,
    resource_name,
    category,
    resource_types,
    quarry_id,
    nemesis_id,
    pattern_id,
    rules
  )
`

/**
 * Get Gear Resource Costs
 *
 * Retrieves all resource gear costs visible to the authenticated user.
 *
 * @returns Gear Resource Costs Keyed by Gear and Resource ID
 */
export async function getGearResourceCosts(): Promise<{
  [key: string]: GearResourceCostDetail
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear_resource_cost')
    .select(GEAR_RESOURCE_COST_SELECT)

  if (error)
    throw new Error(`Error Fetching Gear Resource Costs: ${error.message}`)

  const gearResourceCostMap: { [key: string]: GearResourceCostDetail } = {}
  for (const gearResourceCost of data ?? [])
    gearResourceCostMap[
      `${gearResourceCost.gear_id}:${gearResourceCost.resource_id}`
    ] = gearResourceCost as unknown as GearResourceCostDetail

  return gearResourceCostMap
}

/**
 * Add Gear Resource Cost
 *
 * Adds a new gear resource cost record to the database.
 *
 * @param gearResourceCost Gear Resource Cost Data
 * @returns Inserted Gear Resource Cost
 */
export async function addGearResourceCost(
  gearResourceCost: TablesInsert<'gear_resource_cost'>
): Promise<GearResourceCostDetail> {
  await ensureGearCanBeUpdated(gearResourceCost.gear_id)
  const supabase = createClient()
  const insertData: TablesInsert<'gear_resource_cost'> = { ...gearResourceCost }

  const { data, error } = await supabase
    .from('gear_resource_cost')
    .insert(insertData)
    .select(GEAR_RESOURCE_COST_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Gear Resource Cost: ${error.message}`)

  return data as unknown as GearResourceCostDetail
}

/**
 * Update Gear Resource Cost
 *
 * Updates an existing gear resource cost record in the database.
 *
 * @param id Gear ID
 * @param resourceId Resource ID
 * @param gearResourceCost Gear Resource Cost Data
 */
export async function updateGearResourceCost(
  id: string,
  resourceId: string,
  gearResourceCost: Omit<
    TablesUpdate<'gear_resource_cost'>,
    'gear_id' | 'resource_id'
  >
): Promise<void> {
  await ensureGearCanBeUpdated(id)
  const supabase = createClient()
  const updateData: TablesUpdate<'gear_resource_cost'> = { ...gearResourceCost }

  delete updateData.gear_id
  delete updateData.resource_id

  const { error } = await supabase
    .from('gear_resource_cost')
    .update(updateData)
    .eq('gear_id', id)
    .eq('resource_id', resourceId)

  if (error)
    throw new Error(`Error Updating Gear Resource Cost: ${error.message}`)
}

/**
 * Remove Gear Resource Cost
 *
 * Deletes a gear resource cost record from the database.
 *
 * @param id Gear ID
 * @param resourceId Resource ID
 */
export async function removeGearResourceCost(
  id: string,
  resourceId: string
): Promise<void> {
  await ensureGearCanBeUpdated(id)
  const supabase = createClient()

  const { error } = await supabase
    .from('gear_resource_cost')
    .delete()
    .eq('gear_id', id)
    .eq('resource_id', resourceId)

  if (error)
    throw new Error(`Error Removing Gear Resource Cost: ${error.message}`)
}
