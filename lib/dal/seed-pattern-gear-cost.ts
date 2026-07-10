import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SeedPatternGearCostDetail } from '@/lib/types'

const SEED_PATTERN_GEAR_COST_SELECT = `
  seed_pattern_id,
  cost_gear_id,
  quantity,
  cost_gear:gear!cost_gear_id(*)
`

type SeedPatternGearCostKey = Pick<
  TablesInsert<'seed_pattern_gear_cost'>,
  'cost_gear_id' | 'seed_pattern_id'
>

/**
 * Get Seed Pattern Gear Costs
 *
 * Retrieves all seed pattern gear cost rows.
 *
 * @returns Seed Pattern Gear Costs
 */
export async function getSeedPatternGearCosts(): Promise<
  SeedPatternGearCostDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern_gear_cost')
    .select(SEED_PATTERN_GEAR_COST_SELECT)

  if (error)
    throw new Error(`Error Fetching Seed Pattern Gear Costs: ${error.message}`)

  return (data ?? []) as SeedPatternGearCostDetail[]
}

/**
 * Get Seed Pattern Gear Cost
 *
 * Retrieves a single seed pattern gear cost row by key.
 *
 * @param key Seed Pattern Gear Cost Key
 * @returns Seed Pattern Gear Cost or null
 */
export async function getSeedPatternGearCost(
  key: SeedPatternGearCostKey
): Promise<SeedPatternGearCostDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern_gear_cost')
    .select(SEED_PATTERN_GEAR_COST_SELECT)
    .eq('cost_gear_id', key.cost_gear_id)
    .eq('seed_pattern_id', key.seed_pattern_id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Seed Pattern Gear Cost: ${error.message}`)

  return data as SeedPatternGearCostDetail | null
}

/**
 * Add Seed Pattern Gear Cost
 *
 * Adds a new seed pattern gear cost record to the database.
 *
 * @param seedPatternGearCost Seed Pattern Gear Cost Data
 * @returns Inserted Seed Pattern Gear Cost
 */
export async function addSeedPatternGearCost(
  seedPatternGearCost: TablesInsert<'seed_pattern_gear_cost'>
): Promise<SeedPatternGearCostDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'seed_pattern_gear_cost'> = {
    ...seedPatternGearCost
  }

  const { data, error } = await supabase
    .from('seed_pattern_gear_cost')
    .insert(insertData)
    .select(SEED_PATTERN_GEAR_COST_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Seed Pattern Gear Cost: ${error.message}`)

  return data as SeedPatternGearCostDetail
}

/**
 * Update Seed Pattern Gear Cost
 *
 * Updates an existing seed pattern gear cost record.
 *
 * @param key Seed Pattern Gear Cost Key
 * @param seedPatternGearCost Seed Pattern Gear Cost Data
 */
export async function updateSeedPatternGearCost(
  key: SeedPatternGearCostKey,
  seedPatternGearCost: Omit<
    TablesUpdate<'seed_pattern_gear_cost'>,
    keyof SeedPatternGearCostKey
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'seed_pattern_gear_cost'> = {
    ...seedPatternGearCost
  }

  delete updateData.cost_gear_id
  delete updateData.seed_pattern_id

  const { error } = await supabase
    .from('seed_pattern_gear_cost')
    .update(updateData)
    .eq('cost_gear_id', key.cost_gear_id)
    .eq('seed_pattern_id', key.seed_pattern_id)

  if (error)
    throw new Error(`Error Updating Seed Pattern Gear Cost: ${error.message}`)
}

/**
 * Remove Seed Pattern Gear Cost
 *
 * Deletes a seed pattern gear cost record from the database.
 *
 * @param key Seed Pattern Gear Cost Key
 */
export async function removeSeedPatternGearCost(
  key: SeedPatternGearCostKey
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('seed_pattern_gear_cost')
    .delete()
    .eq('cost_gear_id', key.cost_gear_id)
    .eq('seed_pattern_id', key.seed_pattern_id)

  if (error)
    throw new Error(`Error Removing Seed Pattern Gear Cost: ${error.message}`)
}
