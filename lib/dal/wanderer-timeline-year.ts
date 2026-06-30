import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { WandererTimelineYearDetail } from '@/lib/types'

export const WANDERER_TIMELINE_YEAR_SELECT = `
  id,
  wanderer_id,
  entries,
  year_number
`

/**
 * Get Wanderer Timeline Years
 *
 * @param wandererId Wanderer ID
 * @returns Wanderer Timeline Years
 */
export async function getWandererTimelineYears(
  wandererId: string | null | undefined
): Promise<{ [key: string]: WandererTimelineYearDetail }> {
  if (!wandererId) throw new Error('Required: Wanderer ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('wanderer_timeline_year')
    .select(WANDERER_TIMELINE_YEAR_SELECT)
    .eq('wanderer_id', wandererId)

  if (error)
    throw new Error(`Error Fetching Wanderer Timeline Years: ${error.message}`)

  const map: { [key: string]: WandererTimelineYearDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Add Wanderer Timeline Year
 *
 * Adds a new timeline year to a wanderer.
 *
 * @param wandererTimelineYear Wanderer Timeline Year Data
 * @returns Inserted Wanderer Timeline Year
 */
export async function addWandererTimelineYear(
  wandererTimelineYear: Omit<
    TablesInsert<'wanderer_timeline_year'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<WandererTimelineYearDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('wanderer_timeline_year')
    .insert(wandererTimelineYear)
    .select(WANDERER_TIMELINE_YEAR_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Wanderer Timeline Year: ${error.message}`)

  return data
}

/**
 * Update Wanderer Timeline Year
 *
 * Updates an existing wanderer timeline year record.
 *
 * @param id Wanderer Timeline Year ID
 * @param wandererTimelineYear Wanderer Timeline Year Data
 */
export async function updateWandererTimelineYear(
  id: string,
  wandererTimelineYear: Omit<
    TablesUpdate<'wanderer_timeline_year'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'wanderer_timeline_year'> = {
    ...wandererTimelineYear
  }

  delete updateData.id
  delete updateData.wanderer_id

  const { error } = await supabase
    .from('wanderer_timeline_year')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Wanderer Timeline Year: ${error.message}`)
}

/**
 * Remove Wanderer Timeline Year
 *
 * Deletes a wanderer timeline year record from the database.
 *
 * @param id Wanderer Timeline Year ID
 */
export async function removeWandererTimelineYear(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('wanderer_timeline_year')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Wanderer Timeline Year: ${error.message}`)
}
