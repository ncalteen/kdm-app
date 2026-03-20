import { Tables, TablesInsert } from '@/lib/database.types'
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
  nemesisId: string | null | undefined,
  campaignType: CampaignType
): Promise<
  Omit<
    Tables<'nemesis_timeline_year'>,
    'created_at' | 'id' | 'updated_at' | 'campaign_types' | 'nemesis_id'
  >[]
> {
  if (!nemesisId) throw new Error('Required: Nemesis ID')

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

/**
 * Add Nemesis Timeline Year
 *
 * Adds a new timeline year to a nemesis.
 *
 * @param nemesisTimelineYear Nemesis Timeline Year Data
 * @returns Inserted Nemesis Timeline Year ID
 */
export async function addNemesisTimelineYear(
  nemesisTimelineYear: Omit<
    TablesInsert<'nemesis_timeline_year'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_timeline_year')
    .insert(nemesisTimelineYear)
    .select('id')
    .single()

  if (error)
    throw new Error(`Error Adding Nemesis Timeline Year: ${error.message}`)

  return data.id
}
