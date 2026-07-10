import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { PatternResourceCostDetail } from '@/lib/types'

const PATTERN_RESOURCE_COST_SELECT = `
  pattern_id,
  quantity,
  resource_id,
  resource(*)
`

type PatternResourceCostKey = Pick<
  TablesInsert<'pattern_resource_cost'>,
  'pattern_id' | 'resource_id'
>

/**
 * Get Pattern Resource Costs
 *
 * Retrieves all pattern resource cost rows.
 *
 * @returns Pattern Resource Costs
 */
export async function getPatternResourceCosts(): Promise<
  PatternResourceCostDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern_resource_cost')
    .select(PATTERN_RESOURCE_COST_SELECT)

  if (error)
    throw new Error(`Error Fetching Pattern Resource Costs: ${error.message}`)

  return (data ?? []) as PatternResourceCostDetail[]
}

/**
 * Get Pattern Resource Cost
 *
 * Retrieves a single pattern resource cost row by key.
 *
 * @param key Pattern Resource Cost Key
 * @returns Pattern Resource Cost or null
 */
export async function getPatternResourceCost(
  key: PatternResourceCostKey
): Promise<PatternResourceCostDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern_resource_cost')
    .select(PATTERN_RESOURCE_COST_SELECT)
    .eq('pattern_id', key.pattern_id)
    .eq('resource_id', key.resource_id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Pattern Resource Cost: ${error.message}`)

  return data as PatternResourceCostDetail | null
}

/**
 * Add Pattern Resource Cost
 *
 * Adds a new pattern resource cost record to the database.
 *
 * @param patternResourceCost Pattern Resource Cost Data
 * @returns Inserted Pattern Resource Cost
 */
export async function addPatternResourceCost(
  patternResourceCost: TablesInsert<'pattern_resource_cost'>
): Promise<PatternResourceCostDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'pattern_resource_cost'> = {
    ...patternResourceCost
  }

  const { data, error } = await supabase
    .from('pattern_resource_cost')
    .insert(insertData)
    .select(PATTERN_RESOURCE_COST_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Pattern Resource Cost: ${error.message}`)

  return data as PatternResourceCostDetail
}

/**
 * Update Pattern Resource Cost
 *
 * Updates an existing pattern resource cost record.
 *
 * @param key Pattern Resource Cost Key
 * @param patternResourceCost Pattern Resource Cost Data
 */
export async function updatePatternResourceCost(
  key: PatternResourceCostKey,
  patternResourceCost: Omit<
    TablesUpdate<'pattern_resource_cost'>,
    keyof PatternResourceCostKey
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'pattern_resource_cost'> = {
    ...patternResourceCost
  }

  delete updateData.pattern_id
  delete updateData.resource_id

  const { error } = await supabase
    .from('pattern_resource_cost')
    .update(updateData)
    .eq('pattern_id', key.pattern_id)
    .eq('resource_id', key.resource_id)

  if (error)
    throw new Error(`Error Updating Pattern Resource Cost: ${error.message}`)
}

/**
 * Remove Pattern Resource Cost
 *
 * Deletes a pattern resource cost record from the database.
 *
 * @param key Pattern Resource Cost Key
 */
export async function removePatternResourceCost(
  key: PatternResourceCostKey
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pattern_resource_cost')
    .delete()
    .eq('pattern_id', key.pattern_id)
    .eq('resource_id', key.resource_id)

  if (error)
    throw new Error(`Error Removing Pattern Resource Cost: ${error.message}`)
}
