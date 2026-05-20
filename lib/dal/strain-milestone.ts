import { removeCatalogRow } from '@/lib/dal/catalog-archive'
import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { StrainMilestoneDetail } from '@/lib/types'

/**
 * Get Strain Milestones
 *
 * Retrieves all strain milestones visible to the authenticated user. RLS
 * surfaces:
 *
 * - Built-in (non-custom) strain milestones
 * - Custom strain milestones owned by the user
 *
 * @returns Strain Milestones
 */
export async function getStrainMilestones(): Promise<{
  [key: string]: StrainMilestoneDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('strain_milestone')
    .select(
      'id, custom, strain_milestone_name, milestone_condition, permanent_effect'
    )

  if (error)
    throw new Error(`Error Fetching Strain Milestones: ${error.message}`)

  const strainMilestoneMap: { [key: string]: StrainMilestoneDetail } = {}
  for (const s of data ?? []) strainMilestoneMap[s.id] = s

  return strainMilestoneMap
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
    .select(
      'id, custom, strain_milestone_name, milestone_condition, permanent_effect, archived_at'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Strain Milestones: ${error.message}`)

  const strainMilestoneMap: { [key: string]: StrainMilestoneDetail } = {}
  for (const s of data ?? []) if (!s.archived_at) strainMilestoneMap[s.id] = s

  return strainMilestoneMap
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
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<StrainMilestoneDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (strainMilestone.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('strain_milestone')
    .insert({
      ...strainMilestone,
      ...(strainMilestone.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, custom, strain_milestone_name, milestone_condition, permanent_effect'
    )
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
 * @returns Updated Strain Milestone
 */
export async function updateStrainMilestone(
  id: string,
  strainMilestone: Omit<
    TablesUpdate<'strain_milestone'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('strain_milestone')
    .update(strainMilestone)
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
  await removeCatalogRow('strain_milestone', id, 'Strain Milestone')
}
