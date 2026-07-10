import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SeedPatternResourceCostDetail } from '@/lib/types'

const SEED_PATTERN_RESOURCE_COST_SELECT = `
  seed_pattern_id,
  quantity,
  resource_id,
  resource(*)
`

type SeedPatternResourceCostKey = Pick<
  TablesInsert<'seed_pattern_resource_cost'>,
  'resource_id' | 'seed_pattern_id'
>

/**
 * Get Seed Pattern Resource Costs
 *
 * Retrieves all seed pattern resource cost rows.
 *
 * @returns Seed Pattern Resource Costs
 */
export async function getSeedPatternResourceCosts(): Promise<
  SeedPatternResourceCostDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern_resource_cost')
    .select(SEED_PATTERN_RESOURCE_COST_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Seed Pattern Resource Costs: ${error.message}`
    )

  return (data ?? []) as SeedPatternResourceCostDetail[]
}

/**
 * Get Seed Pattern Resource Cost
 *
 * Retrieves a single seed pattern resource cost row by key.
 *
 * @param key Seed Pattern Resource Cost Key
 * @returns Seed Pattern Resource Cost or null
 */
export async function getSeedPatternResourceCost(
  key: SeedPatternResourceCostKey
): Promise<SeedPatternResourceCostDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern_resource_cost')
    .select(SEED_PATTERN_RESOURCE_COST_SELECT)
    .eq('resource_id', key.resource_id)
    .eq('seed_pattern_id', key.seed_pattern_id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Seed Pattern Resource Cost: ${error.message}`
    )

  return data as SeedPatternResourceCostDetail | null
}

/**
 * Add Seed Pattern Resource Cost
 *
 * Adds a new seed pattern resource cost record to the database.
 *
 * @param seedPatternResourceCost Seed Pattern Resource Cost Data
 * @returns Inserted Seed Pattern Resource Cost
 */
export async function addSeedPatternResourceCost(
  seedPatternResourceCost: TablesInsert<'seed_pattern_resource_cost'>
): Promise<SeedPatternResourceCostDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'seed_pattern_resource_cost'> = {
    ...seedPatternResourceCost
  }

  const { data, error } = await supabase
    .from('seed_pattern_resource_cost')
    .insert(insertData)
    .select(SEED_PATTERN_RESOURCE_COST_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Seed Pattern Resource Cost: ${error.message}`)

  return data as SeedPatternResourceCostDetail
}

/**
 * Update Seed Pattern Resource Cost
 *
 * Updates an existing seed pattern resource cost record.
 *
 * @param key Seed Pattern Resource Cost Key
 * @param seedPatternResourceCost Seed Pattern Resource Cost Data
 */
export async function updateSeedPatternResourceCost(
  key: SeedPatternResourceCostKey,
  seedPatternResourceCost: Omit<
    TablesUpdate<'seed_pattern_resource_cost'>,
    keyof SeedPatternResourceCostKey
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'seed_pattern_resource_cost'> = {
    ...seedPatternResourceCost
  }

  delete updateData.resource_id
  delete updateData.seed_pattern_id

  const { error } = await supabase
    .from('seed_pattern_resource_cost')
    .update(updateData)
    .eq('resource_id', key.resource_id)
    .eq('seed_pattern_id', key.seed_pattern_id)

  if (error)
    throw new Error(
      `Error Updating Seed Pattern Resource Cost: ${error.message}`
    )
}

/**
 * Remove Seed Pattern Resource Cost
 *
 * Deletes a seed pattern resource cost record from the database.
 *
 * @param key Seed Pattern Resource Cost Key
 */
export async function removeSeedPatternResourceCost(
  key: SeedPatternResourceCostKey
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('seed_pattern_resource_cost')
    .delete()
    .eq('resource_id', key.resource_id)
    .eq('seed_pattern_id', key.seed_pattern_id)

  if (error)
    throw new Error(
      `Error Removing Seed Pattern Resource Cost: ${error.message}`
    )
}
