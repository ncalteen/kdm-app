import { CampaignType, DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Principle IDs
 *
 * Retrieves the IDs of principles. This depends on if they are custom
 * principles (requires the user ID if so).
 *
 * @param principleNames Principle Names
 * @param campaignType Campaign Type
 * @param custom Custom
 * @param userId User ID
 * @returns Principle IDs
 */
export async function getPrincipleIds(
  principleNames: string[],
  campaignType: CampaignType,
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('principle')
    .select('id')
    .in('principle_name', principleNames)
    .contains('campaign_types', DatabaseCampaignType[campaignType])
    .eq('custom', custom)
    .eq('user_id', custom ? userId : null)

  if (error) throw new Error(`Error Fetching Principle IDs: ${error.message}`)

  if (!data) throw new Error('Principle(s) Not Found')

  return data.map((principle) => principle.id)
}
