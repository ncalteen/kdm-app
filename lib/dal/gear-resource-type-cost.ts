import { ensureGearCanBeUpdated } from '@/lib/dal/utils'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { GearResourceTypeCostDetail } from '@/lib/types'

const GEAR_RESOURCE_TYPE_COST_SELECT = `
  gear_id,
  resource_type,
  quantity
`

/**
 * Get Gear Resource Type Costs
 *
 * Retrieves all resource-type gear costs visible to the authenticated user.
 *
 * @returns Gear Resource Type Costs Keyed by Gear ID and Resource Type
 */
export async function getGearResourceTypeCosts(): Promise<{
  [key: string]: GearResourceTypeCostDetail
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear_resource_type_cost')
    .select(GEAR_RESOURCE_TYPE_COST_SELECT)

  if (error)
    throw new Error(`Error Fetching Gear Resource Type Costs: ${error.message}`)

  const gearResourceTypeCostMap: {
    [key: string]: GearResourceTypeCostDetail
  } = {}
  for (const gearResourceTypeCost of data ?? [])
    gearResourceTypeCostMap[
      `${gearResourceTypeCost.gear_id}:${gearResourceTypeCost.resource_type}`
    ] = gearResourceTypeCost

  return gearResourceTypeCostMap
}

/**
 * Add Gear Resource Type Cost
 *
 * Adds a new gear resource type cost record to the database.
 *
 * @param gearResourceTypeCost Gear Resource Type Cost Data
 * @returns Inserted Gear Resource Type Cost
 */
export async function addGearResourceTypeCost(
  gearResourceTypeCost: TablesInsert<'gear_resource_type_cost'>
): Promise<GearResourceTypeCostDetail> {
  await ensureGearCanBeUpdated(gearResourceTypeCost.gear_id)
  const supabase = createClient()
  const insertData: TablesInsert<'gear_resource_type_cost'> = {
    ...gearResourceTypeCost
  }

  const { data, error } = await supabase
    .from('gear_resource_type_cost')
    .insert(insertData)
    .select(GEAR_RESOURCE_TYPE_COST_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Gear Resource Type Cost: ${error.message}`)

  return data
}

/**
 * Update Gear Resource Type Cost
 *
 * Updates an existing gear resource type cost record in the database.
 *
 * @param id Gear ID
 * @param resourceType Resource Type
 * @param gearResourceTypeCost Gear Resource Type Cost Data
 */
export async function updateGearResourceTypeCost(
  id: string,
  resourceType: TablesInsert<'gear_resource_type_cost'>['resource_type'],
  gearResourceTypeCost: Omit<
    TablesUpdate<'gear_resource_type_cost'>,
    'gear_id' | 'resource_type'
  >
): Promise<void> {
  await ensureGearCanBeUpdated(id)
  const supabase = createClient()
  const updateData: TablesUpdate<'gear_resource_type_cost'> = {
    ...gearResourceTypeCost
  }

  delete updateData.gear_id
  delete updateData.resource_type

  const { error } = await supabase
    .from('gear_resource_type_cost')
    .update(updateData)
    .eq('gear_id', id)
    .eq('resource_type', resourceType)

  if (error)
    throw new Error(`Error Updating Gear Resource Type Cost: ${error.message}`)
}

/**
 * Remove Gear Resource Type Cost
 *
 * Deletes a gear resource type cost record from the database.
 *
 * @param id Gear ID
 * @param resourceType Resource Type
 */
export async function removeGearResourceTypeCost(
  id: string,
  resourceType: TablesInsert<'gear_resource_type_cost'>['resource_type']
): Promise<void> {
  await ensureGearCanBeUpdated(id)
  const supabase = createClient()

  const { error } = await supabase
    .from('gear_resource_type_cost')
    .delete()
    .eq('gear_id', id)
    .eq('resource_type', resourceType)

  if (error)
    throw new Error(`Error Removing Gear Resource Type Cost: ${error.message}`)
}
