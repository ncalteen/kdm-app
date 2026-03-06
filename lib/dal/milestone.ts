import { CampaignType, DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'

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
