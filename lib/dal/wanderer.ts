import { ABILITY_IMPAIRMENT_SELECT } from '@/lib/dal/ability-impairment'
import { FIGHTING_ART_SELECT } from '@/lib/dal/fighting-art'
import { GEAR_SELECT } from '@/lib/dal/gear'
import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { WANDERER_TIMELINE_YEAR_SELECT } from '@/lib/dal/wanderer-timeline-year'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { WandererDetail } from '@/lib/types'

export const WANDERER_SELECT = `
  id,
  custom,
  accuracy,
  arc,
  courage,
  disposition,
  evasion,
  gender, 
  hunt_xp, 
  hunt_xp_rank_up, 
  insanity, 
  luck, 
  lumi, 
  movement, 
  wanderer_name, 
  permanent_injuries, 
  speed, 
  strength, 
  survival, 
  systemic_pressure, 
  torment, 
  understanding, 
  abilities_impairments:wanderer_ability_impairment(
    id,
    wanderer_id,
    ability_impairment_id,
    ability_impairment(${ABILITY_IMPAIRMENT_SELECT})
  ),
  fighting_arts:wanderer_fighting_art(
    id,
    wanderer_id,
    fighting_art_id,
    fighting_art(${FIGHTING_ART_SELECT})
  ),
  rare_gear:wanderer_rare_gear(
    id,
    wanderer_id,
    rare_gear_id,
    gear(${GEAR_SELECT})
  ),
  timeline_years:wanderer_timeline_year(${WANDERER_TIMELINE_YEAR_SELECT})
`

/**
 * Get Wanderers
 *
 * Retrieves the wanderers visible to the authenticated user. RLS surfaces:
 *
 * - Non-custom wanderers
 * - Custom wanderers created by the user
 *
 * `wanderer` has no settlement/survivor junction and no transitive SELECT
 * policy, so custom rows are author-only.
 *
 * @returns Wanderer Data
 */
export async function getWanderers(): Promise<{
  [key: string]: WandererDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('wanderer')
    .select(WANDERER_SELECT)

  if (error) throw new Error(`Error Fetching Wanderers: ${error.message}`)

  const map: { [key: string]: WandererDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Get User Custom Wanderers
 *
 * Retrieves only custom wanderers authored by the current user. Used by the
 * user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Wanderers Data Map
 */
export async function getUserCustomWanderers(): Promise<{
  [key: string]: WandererDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('wanderer')
    .select(WANDERER_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error)
    throw new Error(`Error Fetching Custom Wanderers: ${error.message}`)

  const map: { [key: string]: WandererDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Add Wanderer
 *
 * Adds a new wanderer record to the database.
 *
 * @param wanderer Wanderer Data
 * @returns Inserted Wanderer
 */
export async function addWanderer(
  wanderer: Omit<
    TablesInsert<'wanderer'>,
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<WandererDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'wanderer'> = { ...wanderer }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('wanderer')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(WANDERER_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Wanderer: ${error.message}`)

  return data
}

/**
 * Update Wanderer
 *
 * Updates an existing wanderer record in the database.
 *
 * @param id Wanderer ID
 * @param wanderer Wanderer Data
 */
export async function updateWanderer(
  id: string,
  wanderer: Omit<
    TablesUpdate<'wanderer'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'wanderer'> = { ...wanderer }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('wanderer')
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Wanderer: ${error.message}`)
}

/**
 * Remove Wanderer
 *
 * Deletes a wanderer record from the database.
 *
 * @param id Wanderer ID
 */
export async function removeWanderer(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('wanderer').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Wanderer: ${error.message}`)
}

/**
 * Get Wanderer IDs
 *
 * Retrieves the IDs of wanderers. This depends on if they are custom wanderers
 * (requires the user ID if so). This is used to populate new settlements
 * created from templates.
 *
 * @param wandererNames Wanderer Names
 * @param custom Custom
 * @param userId User ID
 * @returns Wanderer IDs
 */
export async function getWandererIds(
  wandererNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('wanderer')
        .select('id')
        .in('wanderer_name', wandererNames)
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('wanderer')
        .select('id')
        .in('wanderer_name', wandererNames)
        .eq('custom', custom)

  if (error) throw new Error(`Error Fetching Wanderer ID(s): ${error.message}`)
  if (!data) throw new Error('Wanderer(s) Not Found')

  return data.map((wanderer) => wanderer.id)
}
