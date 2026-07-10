import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SeedPatternResourceTypeCostDetail } from '@/lib/types'

const SEED_PATTERN_RESOURCE_TYPE_COST_SELECT = `
  seed_pattern_id,
  quantity,
  resource_type
`

type SeedPatternResourceTypeCostKey = Pick<
  TablesInsert<'seed_pattern_resource_type_cost'>,
  'resource_type' | 'seed_pattern_id'
>

/**
 * Get Seed Pattern Resource Type Costs
 *
 * Retrieves all seed pattern resource type cost rows.
 *
 * @returns Seed Pattern Resource Type Costs
 */
export async function getSeedPatternResourceTypeCosts(): Promise<
  SeedPatternResourceTypeCostDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern_resource_type_cost')
    .select(SEED_PATTERN_RESOURCE_TYPE_COST_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Seed Pattern Resource Type Costs: ${error.message}`
    )

  return (data ?? []) as SeedPatternResourceTypeCostDetail[]
}

/**
 * Get Seed Pattern Resource Type Cost
 *
 * Retrieves a single seed pattern resource type cost row by key.
 *
 * @param key Seed Pattern Resource Type Cost Key
 * @returns Seed Pattern Resource Type Cost or null
 */
export async function getSeedPatternResourceTypeCost(
  key: SeedPatternResourceTypeCostKey
): Promise<SeedPatternResourceTypeCostDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern_resource_type_cost')
    .select(SEED_PATTERN_RESOURCE_TYPE_COST_SELECT)
    .eq('resource_type', key.resource_type)
    .eq('seed_pattern_id', key.seed_pattern_id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Seed Pattern Resource Type Cost: ${error.message}`
    )

  return data as SeedPatternResourceTypeCostDetail | null
}

/**
 * Add Seed Pattern Resource Type Cost
 *
 * Adds a new seed pattern resource type cost record to the database.
 *
 * @param seedPatternResourceTypeCost Seed Pattern Resource Type Cost Data
 * @returns Inserted Seed Pattern Resource Type Cost
 */
export async function addSeedPatternResourceTypeCost(
  seedPatternResourceTypeCost: TablesInsert<'seed_pattern_resource_type_cost'>
): Promise<SeedPatternResourceTypeCostDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'seed_pattern_resource_type_cost'> = {
    ...seedPatternResourceTypeCost
  }

  const { data, error } = await supabase
    .from('seed_pattern_resource_type_cost')
    .insert(insertData)
    .select(SEED_PATTERN_RESOURCE_TYPE_COST_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Seed Pattern Resource Type Cost: ${error.message}`
    )

  return data as SeedPatternResourceTypeCostDetail
}

/**
 * Update Seed Pattern Resource Type Cost
 *
 * Updates an existing seed pattern resource type cost record.
 *
 * @param key Seed Pattern Resource Type Cost Key
 * @param seedPatternResourceTypeCost Seed Pattern Resource Type Cost Data
 */
export async function updateSeedPatternResourceTypeCost(
  key: SeedPatternResourceTypeCostKey,
  seedPatternResourceTypeCost: Omit<
    TablesUpdate<'seed_pattern_resource_type_cost'>,
    keyof SeedPatternResourceTypeCostKey
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'seed_pattern_resource_type_cost'> = {
    ...seedPatternResourceTypeCost
  }

  delete updateData.resource_type
  delete updateData.seed_pattern_id

  const { error } = await supabase
    .from('seed_pattern_resource_type_cost')
    .update(updateData)
    .eq('resource_type', key.resource_type)
    .eq('seed_pattern_id', key.seed_pattern_id)

  if (error)
    throw new Error(
      `Error Updating Seed Pattern Resource Type Cost: ${error.message}`
    )
}

/**
 * Remove Seed Pattern Resource Type Cost
 *
 * Deletes a seed pattern resource type cost record from the database.
 *
 * @param key Seed Pattern Resource Type Cost Key
 */
export async function removeSeedPatternResourceTypeCost(
  key: SeedPatternResourceTypeCostKey
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('seed_pattern_resource_type_cost')
    .delete()
    .eq('resource_type', key.resource_type)
    .eq('seed_pattern_id', key.seed_pattern_id)

  if (error)
    throw new Error(
      `Error Removing Seed Pattern Resource Type Cost: ${error.message}`
    )
}
