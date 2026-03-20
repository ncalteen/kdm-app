import { TablesInsert } from '@/lib/database.types'
import { CampaignType, DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { MilestoneDetail } from '@/lib/types'

/**
 * Get Milestones
 *
 * Retrieves all milestones available to the authenticated user:
 * - Built-in (non-custom) milestones
 * - Custom milestones owned by the user
 * - Custom milestones shared with the user
 *
 * @returns Milestones
 */
export async function getMilestones(): Promise<{
  [key: string]: MilestoneDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase
      .from('milestone')
      .select('id, milestone_name, event_name, campaign_types')
      .eq('custom', false),
    supabase
      .from('milestone')
      .select('id, milestone_name, event_name, campaign_types')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('milestone_shared_user')
      .select('milestone(id, milestone_name, event_name, campaign_types)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Milestones: ${result.error.message}`)

  const milestoneMap: { [key: string]: MilestoneDetail } = {}

  for (const m of nonCustomResult.data ?? []) milestoneMap[m.id] = m
  for (const m of userCustomResult.data ?? []) milestoneMap[m.id] = m
  for (const row of sharedResult.data ?? [])
    milestoneMap[row.milestone[0].id] = row.milestone[0]

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
        .contains('campaign_types', [DatabaseCampaignType[campaignType]])
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('milestone')
        .select('id')
        .in('milestone_name', milestoneNames)
        .contains('campaign_types', [DatabaseCampaignType[campaignType]])
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
  milestone: Omit<TablesInsert<'milestone'>, 'id' | 'created_at' | 'updated_at'>
): Promise<MilestoneDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('milestone')
    .insert(milestone)
    .select('id, campaign_types, event_name, milestone_name')
    .single()

  if (error) throw new Error(`Error Adding Milestone: ${error.message}`)

  return data
}
