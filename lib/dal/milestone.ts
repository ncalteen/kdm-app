import { Tables } from '@/lib/database.types'
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
export async function getMilestones(): Promise<
  Omit<
    Tables<'milestone'>,
    'created_at' | 'updated_at' | 'custom' | 'user_id'
  >[]
> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const selectFields = 'id, milestone_name, event_name, campaign_types'

  // Built-in milestones
  const { data: builtIn, error: builtInError } = await supabase
    .from('milestone')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Milestones: ${builtInError.message}`
    )

  // Custom milestones owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('milestone')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Milestones: ${ownedError.message}`)

  // Custom milestones shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('milestone_shared_user')
    .select(`milestone(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Milestones: ${sharedError.message}`)

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.milestone)
      ? row.milestone
      : row.milestone
        ? [row.milestone]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
