import { Tables } from '@/lib/database.types'
import { CampaignType, DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Quarry Timeline Years
 *
 * Fetches timeline year entries for a specific quarry and campaign type from
 * the quarry_timeline_year table.
 *
 * @param quarryId Quarry ID
 * @returns Quarry Timeline Years
 */
export async function getQuarryTimelineYears(
  quarryId: string | null | undefined,
  campaignType: CampaignType
): Promise<
  Omit<
    Tables<'quarry_timeline_year'>,
    'created_at' | 'id' | 'updated_at' | 'campaign_types' | 'quarry_id'
  >[]
> {
  if (!quarryId) throw new Error('Required: Quarry ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_timeline_year')
    .select('entries, year_number')
    .eq('quarry_id', quarryId)
    .contains('campaign_types', [DatabaseCampaignType[campaignType]])

  if (error)
    throw new Error(`Error Fetching Quarry Timeline Years: ${error.message}`)

  if (!data) throw new Error('Quarry Timeline Year(s) Not Found')

  return data
}
