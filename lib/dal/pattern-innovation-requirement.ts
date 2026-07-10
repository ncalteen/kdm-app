import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { PatternInnovationRequirementDetail } from '@/lib/types'

const PATTERN_INNOVATION_REQUIREMENT_SELECT = `
  pattern_id,
  innovation_id,
  innovation(*)
`

type PatternInnovationRequirementKey = Pick<
  TablesInsert<'pattern_innovation_requirement'>,
  'innovation_id' | 'pattern_id'
>

/**
 * Get Pattern Innovation Requirements
 *
 * Retrieves all pattern innovation requirement rows.
 *
 * @returns Pattern Innovation Requirements
 */
export async function getPatternInnovationRequirements(): Promise<
  PatternInnovationRequirementDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern_innovation_requirement')
    .select(PATTERN_INNOVATION_REQUIREMENT_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Pattern Innovation Requirements: ${error.message}`
    )

  return (data ?? []) as PatternInnovationRequirementDetail[]
}

/**
 * Get Pattern Innovation Requirement
 *
 * Retrieves a single pattern innovation requirement row by key.
 *
 * @param key Pattern Innovation Requirement Key
 * @returns Pattern Innovation Requirement or null
 */
export async function getPatternInnovationRequirement(
  key: PatternInnovationRequirementKey
): Promise<PatternInnovationRequirementDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pattern_innovation_requirement')
    .select(PATTERN_INNOVATION_REQUIREMENT_SELECT)
    .eq('innovation_id', key.innovation_id)
    .eq('pattern_id', key.pattern_id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Pattern Innovation Requirement: ${error.message}`
    )

  return data as PatternInnovationRequirementDetail | null
}

/**
 * Add Pattern Innovation Requirement
 *
 * Adds a new pattern innovation requirement record to the database.
 *
 * @param patternInnovationRequirement Pattern Innovation Requirement Data
 * @returns Inserted Pattern Innovation Requirement
 */
export async function addPatternInnovationRequirement(
  patternInnovationRequirement: TablesInsert<'pattern_innovation_requirement'>
): Promise<PatternInnovationRequirementDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'pattern_innovation_requirement'> = {
    ...patternInnovationRequirement
  }

  const { data, error } = await supabase
    .from('pattern_innovation_requirement')
    .insert(insertData)
    .select(PATTERN_INNOVATION_REQUIREMENT_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Pattern Innovation Requirement: ${error.message}`
    )

  return data as PatternInnovationRequirementDetail
}

/**
 * Update Pattern Innovation Requirement
 *
 * Updates an existing pattern innovation requirement record.
 *
 * @param key Pattern Innovation Requirement Key
 * @param patternInnovationRequirement Pattern Innovation Requirement Data
 */
export async function updatePatternInnovationRequirement(
  key: PatternInnovationRequirementKey,
  patternInnovationRequirement: Omit<
    TablesUpdate<'pattern_innovation_requirement'>,
    keyof PatternInnovationRequirementKey
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'pattern_innovation_requirement'> = {
    ...patternInnovationRequirement
  }

  delete updateData.innovation_id
  delete updateData.pattern_id

  const { error } = await supabase
    .from('pattern_innovation_requirement')
    .update(updateData)
    .eq('innovation_id', key.innovation_id)
    .eq('pattern_id', key.pattern_id)

  if (error)
    throw new Error(
      `Error Updating Pattern Innovation Requirement: ${error.message}`
    )
}

/**
 * Remove Pattern Innovation Requirement
 *
 * Deletes a pattern innovation requirement record from the database.
 *
 * @param key Pattern Innovation Requirement Key
 */
export async function removePatternInnovationRequirement(
  key: PatternInnovationRequirementKey
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pattern_innovation_requirement')
    .delete()
    .eq('innovation_id', key.innovation_id)
    .eq('pattern_id', key.pattern_id)

  if (error)
    throw new Error(
      `Error Removing Pattern Innovation Requirement: ${error.message}`
    )
}
