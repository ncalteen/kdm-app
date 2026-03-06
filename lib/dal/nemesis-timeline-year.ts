import { Tables } from '@/lib/database.types'
import { CampaignType, DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Nemesis Timeline Years
 *
 * Fetches timeline year entries for a specific nemesis and campaign type from
 * the nemesis_timeline_year table.
 *
 * @param nemesisId Nemesis ID
 * @returns Nemesis Timeline Years
 */
export async function getNemesisTimelineYears(
  nemesisId: string,
  campaignType: CampaignType
): Promise<
  Omit<
    Tables<'nemesis_timeline_year'>,
    'created_at' | 'id' | 'updated_at' | 'campaign_types' | 'nemesis_id'
  >[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_timeline_year')
    .select('entries, year_number')
    .eq('nemesis_id', nemesisId)
    .contains('campaign_types', [DatabaseCampaignType[campaignType]])

  if (error)
    throw new Error(`Error Fetching Nemesis Timeline Years: ${error.message}`)

  if (!data) throw new Error('Nemesis Timeline Year(s) Not Found')

  return data
}
