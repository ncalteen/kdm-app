import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import {
  PatternDetail,
  PatternGearCostDetail,
  PatternResourceCostDetail,
  PatternResourceTypeCostDetail
} from '@/lib/types'

/**
 * Normalize a Supabase pattern row (with junction relations joined) into a
 * {@link PatternDetail}. Strips the relation arrays into their flatter
 * equivalents on the returned object.
 *
 * @param row Raw pattern row including the junction relations.
 * @returns Normalized PatternDetail.
 */
function toPatternDetail(
  row: Omit<
    PatternDetail,
    | 'gear_costs'
    | 'resource_costs'
    | 'resource_type_costs'
    | 'innovation_requirement_ids'
  > & {
    pattern_gear_cost?: PatternGearCostDetail[] | null
    pattern_resource_cost?: PatternResourceCostDetail[] | null
    pattern_resource_type_cost?: PatternResourceTypeCostDetail[] | null
    pattern_innovation_requirement?: { innovation_id: string }[] | null
  }
): PatternDetail {
  const {
    pattern_gear_cost,
    pattern_resource_cost,
    pattern_resource_type_cost,
    pattern_innovation_requirement,
    ...rest
  } = row
  return {
    ...rest,
    gear_costs: pattern_gear_cost ?? [],
    resource_costs: pattern_resource_cost ?? [],
    resource_type_costs: pattern_resource_type_cost ?? [],
    innovation_requirement_ids:
      pattern_innovation_requirement?.map((r) => r.innovation_id) ?? []
  }
}

/**
 * Get Patterns
 *
 * Retrieves all patterns available to the authenticated user:
 *
 * - Built-in (non-custom) patterns
 * - Custom patterns owned by the user
 * - Custom patterns shared with the user
 *
 * @returns Patterns
 */
export async function getPatterns(): Promise<{
  [key: string]: PatternDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase
      .from('pattern')
      .select(
        'id, custom, pattern_name, crafting_limit, endeavor_cost, crafted_gear_id, pattern_gear_cost(cost_gear_id, quantity), pattern_resource_cost(resource_id, quantity), pattern_resource_type_cost(resource_type, quantity), pattern_innovation_requirement(innovation_id)'
      )
      .eq('custom', false),
    supabase
      .from('pattern')
      .select(
        'id, custom, pattern_name, crafting_limit, endeavor_cost, crafted_gear_id, pattern_gear_cost(cost_gear_id, quantity), pattern_resource_cost(resource_id, quantity), pattern_resource_type_cost(resource_type, quantity), pattern_innovation_requirement(innovation_id)'
      )
      .eq('custom', true)
      .eq('user_id', userId),
    supabase
      .from('pattern_shared_user')
      .select(
        'pattern(id, custom, pattern_name, crafting_limit, endeavor_cost, crafted_gear_id, pattern_gear_cost(cost_gear_id, quantity), pattern_resource_cost(resource_id, quantity), pattern_resource_type_cost(resource_type, quantity), pattern_innovation_requirement(innovation_id))'
      )
      .eq('shared_user_id', userId)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Patterns: ${result.error.message}`)

  const patternMap: { [key: string]: PatternDetail } = {}

  for (const p of nonCustomResult.data ?? [])
    patternMap[p.id] = toPatternDetail(p)
  for (const p of userCustomResult.data ?? [])
    patternMap[p.id] = toPatternDetail(p)
  for (const row of sharedResult.data ?? []) {
    const p = row.pattern?.[0]
    if (p?.id) patternMap[p.id] = toPatternDetail(p)
  }

  return patternMap
}

/**
 * Add Pattern
 *
 * Adds a new pattern record to the database. Junction rows (gear, resource,
 * resource type costs, innovation requirements) are persisted separately via
 * the `replacePattern*` helpers.
 *
 * @param pattern Pattern Data
 * @returns Inserted Pattern (with empty junction arrays)
 */
export async function addPattern(
  pattern: Omit<
    TablesInsert<'pattern'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<PatternDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (pattern.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('pattern')
    .insert({
      ...pattern,
      ...(pattern.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, custom, pattern_name, crafting_limit, endeavor_cost, crafted_gear_id'
    )
    .single()

  if (error) throw new Error(`Error Adding Pattern: ${error.message}`)

  return {
    ...data,
    gear_costs: [],
    resource_costs: [],
    resource_type_costs: [],
    innovation_requirement_ids: []
  }
}

/**
 * Update Pattern
 *
 * Updates an existing pattern record in the database. Junction rows are
 * persisted separately via the `replacePattern*` helpers.
 *
 * @param id Pattern ID
 * @param pattern Pattern Data
 */
export async function updatePattern(
  id: string,
  pattern: Omit<TablesUpdate<'pattern'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('pattern').update(pattern).eq('id', id)

  if (error) throw new Error(`Error Updating Pattern: ${error.message}`)
}

/**
 * Remove Pattern
 *
 * Deletes a pattern record from the database.
 *
 * @param id Pattern ID
 */
export async function removePattern(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('pattern').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Pattern: ${error.message}`)
}

/**
 * Replace Pattern Gear Costs
 *
 * Replaces all gear cost rows for a pattern with the provided list.
 *
 * @param patternId Pattern ID
 * @param costs Gear Cost Entries
 */
export async function replacePatternGearCosts(
  patternId: string,
  costs: PatternGearCostDetail[]
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('pattern_gear_cost')
    .delete()
    .eq('pattern_id', patternId)

  if (deleteError)
    throw new Error(`Error Clearing Pattern Gear Costs: ${deleteError.message}`)

  const seen = new Set<string>()
  const rows = costs
    .filter((c) => {
      if (!c.cost_gear_id || c.quantity < 1) return false
      if (seen.has(c.cost_gear_id)) return false
      seen.add(c.cost_gear_id)
      return true
    })
    .map((c) => ({
      pattern_id: patternId,
      cost_gear_id: c.cost_gear_id,
      quantity: c.quantity
    }))

  if (rows.length === 0) return

  const { error: insertError } = await supabase
    .from('pattern_gear_cost')
    .insert(rows)

  if (insertError)
    throw new Error(`Error Saving Pattern Gear Costs: ${insertError.message}`)
}

/**
 * Replace Pattern Resource Costs
 *
 * Replaces all resource cost rows for a pattern with the provided list.
 *
 * @param patternId Pattern ID
 * @param costs Resource Cost Entries
 */
export async function replacePatternResourceCosts(
  patternId: string,
  costs: PatternResourceCostDetail[]
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('pattern_resource_cost')
    .delete()
    .eq('pattern_id', patternId)

  if (deleteError)
    throw new Error(
      `Error Clearing Pattern Resource Costs: ${deleteError.message}`
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
      pattern_id: patternId,
      resource_id: c.resource_id,
      quantity: c.quantity
    }))

  if (rows.length === 0) return

  const { error: insertError } = await supabase
    .from('pattern_resource_cost')
    .insert(rows)

  if (insertError)
    throw new Error(
      `Error Saving Pattern Resource Costs: ${insertError.message}`
    )
}

/**
 * Replace Pattern Resource Type Costs
 *
 * Replaces all resource type cost rows for a pattern with the provided list.
 *
 * @param patternId Pattern ID
 * @param costs Resource Type Cost Entries
 */
export async function replacePatternResourceTypeCosts(
  patternId: string,
  costs: PatternResourceTypeCostDetail[]
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('pattern_resource_type_cost')
    .delete()
    .eq('pattern_id', patternId)

  if (deleteError)
    throw new Error(
      `Error Clearing Pattern Resource Type Costs: ${deleteError.message}`
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
      pattern_id: patternId,
      resource_type: c.resource_type,
      quantity: c.quantity
    }))

  if (rows.length === 0) return

  const { error: insertError } = await supabase
    .from('pattern_resource_type_cost')
    .insert(rows)

  if (insertError)
    throw new Error(
      `Error Saving Pattern Resource Type Costs: ${insertError.message}`
    )
}

/**
 * Replace Pattern Innovation Requirements
 *
 * Replaces all innovation requirement rows for a pattern with the provided
 * list.
 *
 * @param patternId Pattern ID
 * @param innovationIds Innovation IDs the settlement must have to craft this
 *  pattern.
 */
export async function replacePatternInnovationRequirements(
  patternId: string,
  innovationIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('pattern_innovation_requirement')
    .delete()
    .eq('pattern_id', patternId)

  if (deleteError)
    throw new Error(
      `Error Clearing Pattern Innovation Requirements: ${deleteError.message}`
    )

  const unique = [...new Set(innovationIds.filter((id) => id))]
  if (unique.length === 0) return

  const rows = unique.map((innovation_id) => ({
    pattern_id: patternId,
    innovation_id
  }))

  const { error: insertError } = await supabase
    .from('pattern_innovation_requirement')
    .insert(rows)

  if (insertError)
    throw new Error(
      `Error Saving Pattern Innovation Requirements: ${insertError.message}`
    )
}
