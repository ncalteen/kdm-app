import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { PatternResourceTypeCostDetail } from '@/lib/types'

const PATTERN_RESOURCE_TYPE_COST_SELECT = `
  pattern_id,
  quantity,
  resource_type
`

type PatternResourceTypeCostKey = Pick<
  TablesInsert<'pattern_resource_type_cost'>,
  'pattern_id' | 'resource_type'
>

/**
 * Get Pattern Resource Type Costs
 *
 * Retrieves all pattern resource type cost rows.
 *
 * @returns Pattern Resource Type Costs
 */
export async function getPatternResourceTypeCosts(): Promise<
  PatternResourceTypeCostDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern_resource_type_cost')
    .select(PATTERN_RESOURCE_TYPE_COST_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Pattern Resource Type Costs: ${error.message}`
    )

  return (data ?? []) as PatternResourceTypeCostDetail[]
}

/**
 * Get Pattern Resource Type Cost
 *
 * Retrieves a single pattern resource type cost row by key.
 *
 * @param key Pattern Resource Type Cost Key
 * @returns Pattern Resource Type Cost or null
 */
export async function getPatternResourceTypeCost(
  key: PatternResourceTypeCostKey
): Promise<PatternResourceTypeCostDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern_resource_type_cost')
    .select(PATTERN_RESOURCE_TYPE_COST_SELECT)
    .eq('pattern_id', key.pattern_id)
    .eq('resource_type', key.resource_type)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Pattern Resource Type Cost: ${error.message}`
    )

  return data as PatternResourceTypeCostDetail | null
}

/**
 * Add Pattern Resource Type Cost
 *
 * Adds a new pattern resource type cost record to the database.
 *
 * @param patternResourceTypeCost Pattern Resource Type Cost Data
 * @returns Inserted Pattern Resource Type Cost
 */
export async function addPatternResourceTypeCost(
  patternResourceTypeCost: TablesInsert<'pattern_resource_type_cost'>
): Promise<PatternResourceTypeCostDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'pattern_resource_type_cost'> = {
    ...patternResourceTypeCost
  }

  const { data, error } = await supabase
    .from('pattern_resource_type_cost')
    .insert(insertData)
    .select(PATTERN_RESOURCE_TYPE_COST_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Pattern Resource Type Cost: ${error.message}`)

  return data as PatternResourceTypeCostDetail
}

/**
 * Update Pattern Resource Type Cost
 *
 * Updates an existing pattern resource type cost record.
 *
 * @param key Pattern Resource Type Cost Key
 * @param patternResourceTypeCost Pattern Resource Type Cost Data
 */
export async function updatePatternResourceTypeCost(
  key: PatternResourceTypeCostKey,
  patternResourceTypeCost: Omit<
    TablesUpdate<'pattern_resource_type_cost'>,
    keyof PatternResourceTypeCostKey
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'pattern_resource_type_cost'> = {
    ...patternResourceTypeCost
  }

  delete updateData.pattern_id
  delete updateData.resource_type

  const { error } = await supabase
    .from('pattern_resource_type_cost')
    .update(updateData)
    .eq('pattern_id', key.pattern_id)
    .eq('resource_type', key.resource_type)

  if (error)
    throw new Error(
      `Error Updating Pattern Resource Type Cost: ${error.message}`
    )
}

/**
 * Remove Pattern Resource Type Cost
 *
 * Deletes a pattern resource type cost record from the database.
 *
 * @param key Pattern Resource Type Cost Key
 */
export async function removePatternResourceTypeCost(
  key: PatternResourceTypeCostKey
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pattern_resource_type_cost')
    .delete()
    .eq('pattern_id', key.pattern_id)
    .eq('resource_type', key.resource_type)

  if (error)
    throw new Error(
      `Error Removing Pattern Resource Type Cost: ${error.message}`
    )
}
