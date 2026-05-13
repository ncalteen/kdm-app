import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { Json, TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import {
  GearAffinityRequirementDetail,
  GearDetail,
  GearGearCostDetail,
  GearResourceCostDetail,
  GearResourceTypeCostDetail
} from '@/lib/types'

/**
 * Normalize a Supabase gear row (with junction relations joined) into a
 * {@link GearDetail}. Strips the relation arrays into their flatter
 * equivalents on the returned object.
 *
 * @param row Raw gear row including the junction relations.
 * @returns Normalized GearDetail.
 */
function toGearDetail(
  row: Omit<
    GearDetail,
    | 'gear_costs'
    | 'resource_costs'
    | 'resource_type_costs'
    | 'affinity_bonus_requirements'
  > & {
    affinity_bonus_requirements?: Json | null
    gear_gear_cost?: GearGearCostDetail[] | null
    gear_resource_cost?: GearResourceCostDetail[] | null
    gear_resource_type_cost?: GearResourceTypeCostDetail[] | null
  }
): GearDetail {
  const {
    affinity_bonus_requirements,
    gear_gear_cost,
    gear_resource_cost,
    gear_resource_type_cost,
    ...rest
  } = row

  return {
    ...rest,
    affinity_bonus_requirements: Array.isArray(affinity_bonus_requirements)
      ? (affinity_bonus_requirements as GearAffinityRequirementDetail[])
      : [],
    gear_costs: gear_gear_cost ?? [],
    resource_costs: gear_resource_cost ?? [],
    resource_type_costs: gear_resource_type_cost ?? []
  }
}

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
 * @returns Gear keyed by ID
 */
export async function getGear(): Promise<{
  [key: string]: GearDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear')
    .select(
      'id, custom, gear_name, location_id, accessory, accuracy, affinity_top, affinity_left, affinity_right, affinity_bottom, affinity_bonus, affinity_bonus_requirements, armor_points, armor_location, keywords, rules, speed, strength, weapon_type_id, gear_gear_cost!gear_gear_cost_gear_id_fkey(cost_gear_id, quantity), gear_resource_cost(resource_id, quantity), gear_resource_type_cost(resource_type, quantity)'
    )

  if (error) throw new Error(`Error Fetching Gear: ${error.message}`)

  const gearMap: { [key: string]: GearDetail } = {}
  for (const g of data ?? []) gearMap[g.id] = toGearDetail(g)

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
    .select(
      'id, custom, gear_name, location_id, accessory, accuracy, affinity_top, affinity_left, affinity_right, affinity_bottom, affinity_bonus, affinity_bonus_requirements, armor_points, armor_location, keywords, rules, speed, strength, weapon_type_id, gear_gear_cost!gear_gear_cost_gear_id_fkey(cost_gear_id, quantity), gear_resource_cost(resource_id, quantity), gear_resource_type_cost(resource_type, quantity)'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error) throw new Error(`Error Fetching Custom Gear: ${error.message}`)

  const gearMap: { [key: string]: GearDetail } = {}
  for (const g of data ?? []) gearMap[g.id] = toGearDetail(g)

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
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<GearDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (gear.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('gear')
    .insert({
      ...gear,
      ...(gear.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, custom, gear_name, location_id, accessory, accuracy, affinity_top, affinity_left, affinity_right, affinity_bottom, affinity_bonus, affinity_bonus_requirements, armor_points, armor_location, keywords, rules, speed, strength, weapon_type_id'
    )
    .single()

  if (error) throw new Error(`Error Adding Gear: ${error.message}`)

  return toGearDetail(data)
}

/**
 * Update Gear
 *
 * Updates an existing gear record in the database. Junction rows are
 * persisted separately via the `replaceGear*` helpers.
 *
 * @param id Gear ID
 * @param gear Gear Data
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

/**
 * Get Custom Gear
 *
 * Gets only the custom gear that the user has created.
 *
 * @returns Custom Gear keyed by ID
 */
export async function getCustomGear(): Promise<{
  [key: string]: GearDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear')
    .select(
      'id, custom, gear_name, location_id, accessory, accuracy, affinity_top, affinity_left, affinity_right, affinity_bottom, affinity_bonus, affinity_bonus_requirements, armor_points, armor_location, keywords, rules, speed, strength, weapon_type_id, gear_gear_cost!gear_gear_cost_gear_id_fkey(cost_gear_id, quantity), gear_resource_cost(resource_id, quantity), gear_resource_type_cost(resource_type, quantity)'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error) throw new Error(`Error Fetching Custom Gear: ${error.message}`)

  const gearMap: { [key: string]: GearDetail } = {}
  for (const g of data ?? []) gearMap[g.id] = toGearDetail(g)

  return gearMap
}

/**
 * Replace Gear Gear Costs
 *
 * Replaces all gear-cost rows for a gear item with the provided list.
 *
 * @param gearId Gear ID
 * @param costs Gear Cost Entries
 */
export async function replaceGearGearCosts(
  gearId: string,
  costs: GearGearCostDetail[]
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('gear_gear_cost')
    .delete()
    .eq('gear_id', gearId)

  if (deleteError)
    throw new Error(`Error Clearing Gear Gear Costs: ${deleteError.message}`)

  const seen = new Set<string>()
  const rows = costs
    .filter((c) => {
      if (!c.cost_gear_id || c.quantity < 1) return false
      if (c.cost_gear_id === gearId) return false
      if (seen.has(c.cost_gear_id)) return false
      seen.add(c.cost_gear_id)
      return true
    })
    .map((c) => ({
      gear_id: gearId,
      cost_gear_id: c.cost_gear_id,
      quantity: c.quantity
    }))

  if (rows.length === 0) return

  const { error: insertError } = await supabase
    .from('gear_gear_cost')
    .insert(rows)

  if (insertError)
    throw new Error(`Error Saving Gear Gear Costs: ${insertError.message}`)
}

/**
 * Replace Gear Resource Costs
 *
 * Replaces all resource-cost rows for a gear item with the provided list.
 *
 * @param gearId Gear ID
 * @param costs Resource Cost Entries
 */
export async function replaceGearResourceCosts(
  gearId: string,
  costs: GearResourceCostDetail[]
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('gear_resource_cost')
    .delete()
    .eq('gear_id', gearId)

  if (deleteError)
    throw new Error(
      `Error Clearing Gear Resource Costs: ${deleteError.message}`
    )

  const seen = new Set<string>()
  const rows = costs
    .filter((c) => {
      if (!c.resource_id || c.quantity < 1) return false
      if (seen.has(c.resource_id)) return false
      seen.add(c.resource_id)
      return true
    })
    .map((c) => ({
      gear_id: gearId,
      resource_id: c.resource_id,
      quantity: c.quantity
    }))

  if (rows.length === 0) return

  const { error: insertError } = await supabase
    .from('gear_resource_cost')
    .insert(rows)

  if (insertError)
    throw new Error(`Error Saving Gear Resource Costs: ${insertError.message}`)
}

/**
 * Replace Gear Resource Type Costs
 *
 * Replaces all resource-type-cost rows for a gear item with the provided
 * list.
 *
 * @param gearId Gear ID
 * @param costs Resource Type Cost Entries
 */
export async function replaceGearResourceTypeCosts(
  gearId: string,
  costs: GearResourceTypeCostDetail[]
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('gear_resource_type_cost')
    .delete()
    .eq('gear_id', gearId)

  if (deleteError)
    throw new Error(
      `Error Clearing Gear Resource Type Costs: ${deleteError.message}`
    )

  const seen = new Set<string>()
  const rows = costs
    .filter((c) => {
      if (!c.resource_type || c.quantity < 1) return false
      if (seen.has(c.resource_type)) return false
      seen.add(c.resource_type)
      return true
    })
    .map((c) => ({
      gear_id: gearId,
      resource_type: c.resource_type,
      quantity: c.quantity
    }))

  if (rows.length === 0) return

  const { error: insertError } = await supabase
    .from('gear_resource_type_cost')
    .insert(rows)

  if (insertError)
    throw new Error(
      `Error Saving Gear Resource Type Costs: ${insertError.message}`
    )
}
