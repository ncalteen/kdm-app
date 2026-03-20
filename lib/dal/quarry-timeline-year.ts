import { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types'
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

/**
 * Add Quarry Timeline Year
 *
 * Adds a new timeline year to a quarry.
 *
 * @param quarryTimelineYear Quarry Timeline Year Data
 * @returns Inserted Quarry Timeline Year ID
 */
export async function addQuarryTimelineYear(
  quarryTimelineYear: Omit<
    TablesInsert<'quarry_timeline_year'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_timeline_year')
    .insert(quarryTimelineYear)
    .select('id')
    .single()

  if (error)
    throw new Error(`Error Adding Quarry Timeline Year: ${error.message}`)

  return data.id
}

/**
 * Update Quarry Timeline Year
 *
 * Updates an existing quarry timeline year record.
 *
 * @param id Quarry Timeline Year ID
 * @param quarryTimelineYear Quarry Timeline Year Data
 */
export async function updateQuarryTimelineYear(
  id: string,
  quarryTimelineYear: Omit<
    TablesUpdate<'quarry_timeline_year'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_timeline_year')
    .update(quarryTimelineYear)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Quarry Timeline Year: ${error.message}`)
}

/**
 * Remove Quarry Timeline Year
 *
 * Deletes a quarry timeline year record from the database.
 *
 * @param id Quarry Timeline Year ID
 */
export async function removeQuarryTimelineYear(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_timeline_year')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Quarry Timeline Year: ${error.message}`)
}
