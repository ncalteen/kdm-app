import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { CampaignType, DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { MilestoneDetail } from '@/lib/types'

/**
 * Get Milestones
 *
 * Retrieves all milestones visible to the authenticated user. RLS surfaces:
 * - Built-in (non-custom) milestones
 * - Custom milestones owned by the user
 * - Custom milestones on settlements the user collaborates on (via the
 *   transitive SELECT policy on `milestone`)
 *
 * @returns Milestones
 */
export async function getMilestones(): Promise<{
  [key: string]: MilestoneDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('milestone')
    .select(
      'id, custom, milestone_name, event_name, campaign_types, requirements, rules'
    )

  if (error) throw new Error(`Error Fetching Milestones: ${error.message}`)

  const milestoneMap: { [key: string]: MilestoneDetail } = {}
  for (const m of data ?? []) milestoneMap[m.id] = m

  return milestoneMap
}

/**
 * Get User Custom Milestones
 *
 * Retrieves only custom milestones authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Milestone Data Map
 */
export async function getUserCustomMilestones(): Promise<{
  [key: string]: MilestoneDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('milestone')
    .select(
      'id, custom, milestone_name, event_name, campaign_types, requirements, rules'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Milestones: ${error.message}`)

  const milestoneMap: { [key: string]: MilestoneDetail } = {}
  for (const m of data ?? []) milestoneMap[m.id] = m

  return milestoneMap
}

/**
 * Get Milestone IDs
 *
 * Retrieves the IDs of milestones. This depends on if they are custom
 * milestones (requires the user ID if so).
 *
 * @param milestoneNames Milestone Names
 * @param campaignType Campaign Type
 * @param custom Custom
 * @param userId User ID
 * @returns Milestone IDs
 */
export async function getMilestoneIds(
  milestoneNames: string[],
  campaignType: CampaignType,
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('milestone')
        .select('id')
        .in('milestone_name', milestoneNames)
        .or(
          `campaign_types.eq.{},campaign_types.cs.{${DatabaseCampaignType[campaignType]}}`
        )
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('milestone')
        .select('id')
        .in('milestone_name', milestoneNames)
        .or(
          `campaign_types.eq.{},campaign_types.cs.{${DatabaseCampaignType[campaignType]}}`
        )
        .eq('custom', custom)

  if (error) throw new Error(`Error Fetching Milestone ID(s): ${error.message}`)

  if (!data) throw new Error('Milestone(s) Not Found')

  return data.map((milestone) => milestone.id)
}

/**
 * Add Milestone
 *
 * Adds a new milestone record to the database.
 *
 * @param milestone Milestone Data
 * @returns Inserted Milestone
 */
export async function addMilestone(
  milestone: Omit<
    TablesInsert<'milestone'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<MilestoneDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (milestone.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('milestone')
    .insert({
      ...milestone,
      ...(milestone.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, custom, campaign_types, event_name, milestone_name, requirements, rules'
    )
    .single()

  if (error) throw new Error(`Error Adding Milestone: ${error.message}`)

  return data
}

/**
 * Update Milestone
 *
 * Updates an existing milestone record in the database.
 *
 * @param id Milestone ID
 * @param milestone Milestone Data
 * @returns Updated Milestone
 */
export async function updateMilestone(
  id: string,
  milestone: Omit<TablesUpdate<'milestone'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('milestone')
    .update(milestone)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Milestone: ${error.message}`)
}

/**
 * Remove Milestone
 *
 * Deletes a milestone record from the database.
 *
 * @param id Milestone ID
 */
export async function removeMilestone(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('milestone').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Milestone: ${error.message}`)
}
