import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { PatternGearCostDetail } from '@/lib/types'

const PATTERN_GEAR_COST_SELECT = `
  pattern_id,
  cost_gear_id,
  quantity,
  cost_gear:gear!cost_gear_id(*)
`

type PatternGearCostKey = Pick<
  TablesInsert<'pattern_gear_cost'>,
  'cost_gear_id' | 'pattern_id'
>

/**
 * Get Pattern Gear Costs
 *
 * Retrieves all pattern gear cost rows.
 *
 * @returns Pattern Gear Costs
 */
export async function getPatternGearCosts(): Promise<PatternGearCostDetail[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern_gear_cost')
    .select(PATTERN_GEAR_COST_SELECT)

  if (error)
    throw new Error(`Error Fetching Pattern Gear Costs: ${error.message}`)

  return (data ?? []) as PatternGearCostDetail[]
}

/**
 * Get Pattern Gear Cost
 *
 * Retrieves a single pattern gear cost row by key.
 *
 * @param key Pattern Gear Cost Key
 * @returns Pattern Gear Cost or null
 */
export async function getPatternGearCost(
  key: PatternGearCostKey
): Promise<PatternGearCostDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern_gear_cost')
    .select(PATTERN_GEAR_COST_SELECT)
    .eq('cost_gear_id', key.cost_gear_id)
    .eq('pattern_id', key.pattern_id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Pattern Gear Cost: ${error.message}`)

  return data as PatternGearCostDetail | null
}

/**
 * Add Pattern Gear Cost
 *
 * Adds a new pattern gear cost record to the database.
 *
 * @param patternGearCost Pattern Gear Cost Data
 * @returns Inserted Pattern Gear Cost
 */
export async function addPatternGearCost(
  patternGearCost: TablesInsert<'pattern_gear_cost'>
): Promise<PatternGearCostDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'pattern_gear_cost'> = { ...patternGearCost }

  const { data, error } = await supabase
    .from('pattern_gear_cost')
    .insert(insertData)
    .select(PATTERN_GEAR_COST_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Pattern Gear Cost: ${error.message}`)

  return data as PatternGearCostDetail
}

/**
 * Update Pattern Gear Cost
 *
 * Updates an existing pattern gear cost record.
 *
 * @param key Pattern Gear Cost Key
 * @param patternGearCost Pattern Gear Cost Data
 */
export async function updatePatternGearCost(
  key: PatternGearCostKey,
  patternGearCost: Omit<
    TablesUpdate<'pattern_gear_cost'>,
    keyof PatternGearCostKey
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'pattern_gear_cost'> = { ...patternGearCost }

  delete updateData.cost_gear_id
  delete updateData.pattern_id

  const { error } = await supabase
    .from('pattern_gear_cost')
    .update(updateData)
    .eq('cost_gear_id', key.cost_gear_id)
    .eq('pattern_id', key.pattern_id)

  if (error)
    throw new Error(`Error Updating Pattern Gear Cost: ${error.message}`)
}

/**
 * Remove Pattern Gear Cost
 *
 * Deletes a pattern gear cost record from the database.
 *
 * @param key Pattern Gear Cost Key
 */
export async function removePatternGearCost(
  key: PatternGearCostKey
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pattern_gear_cost')
    .delete()
    .eq('cost_gear_id', key.cost_gear_id)
    .eq('pattern_id', key.pattern_id)

  if (error)
    throw new Error(`Error Removing Pattern Gear Cost: ${error.message}`)
}
