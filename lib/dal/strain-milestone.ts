import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { StrainMilestoneDetail } from '@/lib/types'

export const STRAIN_MILESTONE_SELECT = `
  id,
  custom,
  strain_milestone_name,
  milestone_condition,
  permanent_effect
`

/**
 * Get Strain Milestones
 *
 * Retrieves all strain milestones visible to the authenticated user. RLS
 * surfaces:
 *
 * - Built-in (non-custom) strain milestones
 * - Custom strain milestones owned by the user
 *
 * @returns Strain Milestones by ID
 */
export async function getStrainMilestones(): Promise<{
  [key: string]: StrainMilestoneDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('strain_milestone')
    .select(STRAIN_MILESTONE_SELECT)

  if (error)
    throw new Error(`Error Fetching Strain Milestones: ${error.message}`)

  const map: { [key: string]: StrainMilestoneDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Get User Custom Strain Milestones
 *
 * Retrieves only custom strain milestones authored by the current user.
 * Used by the user-content library so collaborator-authored customs visible
 * via the transitive SELECT policy don't pollute the caller's personal
 * catalog.
 *
 * @returns Custom Strain Milestone Data Map
 */
export async function getUserCustomStrainMilestones(): Promise<{
  [key: string]: StrainMilestoneDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('strain_milestone')
    .select(STRAIN_MILESTONE_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error)
    throw new Error(`Error Fetching Custom Strain Milestones: ${error.message}`)

  const map: { [key: string]: StrainMilestoneDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Add Strain Milestone
 *
 * Adds a new strain milestone record to the database.
 *
 * @param strainMilestone Strain Milestone Data
 * @returns Inserted Strain Milestone
 */
export async function addStrainMilestone(
  strainMilestone: Omit<
    TablesInsert<'strain_milestone'>,
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<StrainMilestoneDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'strain_milestone'> = { ...strainMilestone }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('strain_milestone')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(STRAIN_MILESTONE_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Strain Milestone: ${error.message}`)

  return data
}

/**
 * Update Strain Milestone
 *
 * Updates an existing strain milestone record in the database.
 *
 * @param id Strain Milestone ID
 * @param strainMilestone Strain Milestone Data
 */
export async function updateStrainMilestone(
  id: string,
  strainMilestone: Omit<
    TablesUpdate<'strain_milestone'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'strain_milestone'> = { ...strainMilestone }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('strain_milestone')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Strain Milestone: ${error.message}`)
}

/**
 * Remove Strain Milestone
 *
 * Deletes a strain milestone record from the database.
 *
 * @param id Strain Milestone ID
 */
export async function removeStrainMilestone(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('strain_milestone')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Strain Milestone: ${error.message}`)
}
