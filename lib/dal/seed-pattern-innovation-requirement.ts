import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SeedPatternInnovationRequirementDetail } from '@/lib/types'

const SEED_PATTERN_INNOVATION_REQUIREMENT_SELECT = `
  seed_pattern_id,
  innovation_id,
  innovation(*)
`

type SeedPatternInnovationRequirementKey = Pick<
  TablesInsert<'seed_pattern_innovation_requirement'>,
  'innovation_id' | 'seed_pattern_id'
>

/**
 * Get Seed Pattern Innovation Requirements
 *
 * Retrieves all seed pattern innovation requirement rows.
 *
 * @returns Seed Pattern Innovation Requirements
 */
export async function getSeedPatternInnovationRequirements(): Promise<
  SeedPatternInnovationRequirementDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern_innovation_requirement')
    .select(SEED_PATTERN_INNOVATION_REQUIREMENT_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Seed Pattern Innovation Requirements: ${error.message}`
    )

  return (data ?? []) as SeedPatternInnovationRequirementDetail[]
}

/**
 * Get Seed Pattern Innovation Requirement
 *
 * Retrieves a single seed pattern innovation requirement row by key.
 *
 * @param key Seed Pattern Innovation Requirement Key
 * @returns Seed Pattern Innovation Requirement or null
 */
export async function getSeedPatternInnovationRequirement(
  key: SeedPatternInnovationRequirementKey
): Promise<SeedPatternInnovationRequirementDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seed_pattern_innovation_requirement')
    .select(SEED_PATTERN_INNOVATION_REQUIREMENT_SELECT)
    .eq('innovation_id', key.innovation_id)
    .eq('seed_pattern_id', key.seed_pattern_id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Seed Pattern Innovation Requirement: ${error.message}`
    )

  return data as SeedPatternInnovationRequirementDetail | null
}

/**
 * Add Seed Pattern Innovation Requirement
 *
 * Adds a new seed pattern innovation requirement record to the database.
 *
 * @param seedPatternInnovationRequirement Seed Pattern Innovation Requirement Data
 * @returns Inserted Seed Pattern Innovation Requirement
 */
export async function addSeedPatternInnovationRequirement(
  seedPatternInnovationRequirement: TablesInsert<'seed_pattern_innovation_requirement'>
): Promise<SeedPatternInnovationRequirementDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'seed_pattern_innovation_requirement'> = {
    ...seedPatternInnovationRequirement
  }

  const { data, error } = await supabase
    .from('seed_pattern_innovation_requirement')
    .insert(insertData)
    .select(SEED_PATTERN_INNOVATION_REQUIREMENT_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Seed Pattern Innovation Requirement: ${error.message}`
    )

  return data as SeedPatternInnovationRequirementDetail
}

/**
 * Update Seed Pattern Innovation Requirement
 *
 * Updates an existing seed pattern innovation requirement record.
 *
 * @param key Seed Pattern Innovation Requirement Key
 * @param seedPatternInnovationRequirement Seed Pattern Innovation Requirement Data
 */
export async function updateSeedPatternInnovationRequirement(
  key: SeedPatternInnovationRequirementKey,
  seedPatternInnovationRequirement: Omit<
    TablesUpdate<'seed_pattern_innovation_requirement'>,
    keyof SeedPatternInnovationRequirementKey
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'seed_pattern_innovation_requirement'> = {
    ...seedPatternInnovationRequirement
  }

  delete updateData.innovation_id
  delete updateData.seed_pattern_id

  const { error } = await supabase
    .from('seed_pattern_innovation_requirement')
    .update(updateData)
    .eq('innovation_id', key.innovation_id)
    .eq('seed_pattern_id', key.seed_pattern_id)

  if (error)
    throw new Error(
      `Error Updating Seed Pattern Innovation Requirement: ${error.message}`
    )
}

/**
 * Remove Seed Pattern Innovation Requirement
 *
 * Deletes a seed pattern innovation requirement record from the database.
 *
 * @param key Seed Pattern Innovation Requirement Key
 */
export async function removeSeedPatternInnovationRequirement(
  key: SeedPatternInnovationRequirementKey
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('seed_pattern_innovation_requirement')
    .delete()
    .eq('innovation_id', key.innovation_id)
    .eq('seed_pattern_id', key.seed_pattern_id)

  if (error)
    throw new Error(
      `Error Removing Seed Pattern Innovation Requirement: ${error.message}`
    )
}
