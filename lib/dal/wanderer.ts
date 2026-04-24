import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { WandererAbilityImpairmentDetail, WandererDetail } from '@/lib/types'

/**
 * Raw wanderer row shape as returned by PostgREST for the shared select
 * projection. The generated types can't express the embedded-junction
 * projection precisely, so a focused interface keeps the mapper type-safe.
 */
type RawWandererRow = Omit<WandererDetail, 'abilities_impairments'> & {
  abilities_impairments: {
    ability_impairment: WandererAbilityImpairmentDetail | null
  }[]
}

/**
 * Flattens the `abilities_impairments:wanderer_ability_impairment(ability_impairment(...))`
 * embed returned by PostgREST into a plain `WandererAbilityImpairmentDetail[]`.
 *
 * @param row Raw Wanderer Row
 * @returns Wanderer Detail
 */
function flattenWanderer(row: RawWandererRow): WandererDetail {
  const { abilities_impairments, ...wanderer } = row

  return {
    ...wanderer,
    abilities_impairments: abilities_impairments
      .map((r) => r.ability_impairment)
      .filter((x): x is WandererAbilityImpairmentDetail => Boolean(x))
  }
}

/**
 * Get Wanderers
 *
 * Retrieves the wanderers a user has access to. This includes:
 *
 * - Non-custom wanderers
 * - Custom wanderers created by the user
 * - Custom wanderers shared with the user (via the wanderer_shared_user table)
 *
 * @returns Wanderer Data
 */
export async function getWanderers(): Promise<{
  [key: string]: WandererDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  // Fetch all three categories of wanderers in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom wanderers (available to all users)
    supabase
      .from('wanderer')
      .select(
        'id, custom, accuracy, arc, courage, disposition, evasion, fighting_art_ids, gender, hunt_xp, hunt_xp_rank_up, insanity, luck, lumi, movement, wanderer_name, permanent_injuries, rare_gear_ids, speed, strength, survival, systemic_pressure, torment, understanding, abilities_impairments:wanderer_ability_impairment(ability_impairment(id, custom, ability_impairment_name, rules))'
      )
      .eq('custom', false),
    // Custom wanderers created by the user
    supabase
      .from('wanderer')
      .select(
        'id, custom, accuracy, arc, courage, disposition, evasion, fighting_art_ids, gender, hunt_xp, hunt_xp_rank_up, insanity, luck, lumi, movement, wanderer_name, permanent_injuries, rare_gear_ids, speed, strength, survival, systemic_pressure, torment, understanding, abilities_impairments:wanderer_ability_impairment(ability_impairment(id, custom, ability_impairment_name, rules))'
      )
      .eq('custom', true)
      .eq('user_id', userId),
    // Custom wanderers shared with the user
    supabase
      .from('wanderer_shared_user')
      .select(
        'wanderer(id, custom, accuracy, arc, courage, disposition, evasion, fighting_art_ids, gender, hunt_xp, hunt_xp_rank_up, insanity, luck, lumi, movement, wanderer_name, permanent_injuries, rare_gear_ids, speed, strength, survival, systemic_pressure, torment, understanding, abilities_impairments:wanderer_ability_impairment(ability_impairment(id, custom, ability_impairment_name, rules)))'
      )
      .eq('shared_user_id', userId)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Wanderers: ${result.error.message}`)

  // Collect wanderers from all sources, deduplicating by ID
  const wandererMap: { [key: string]: WandererDetail } = {}

  for (const w of nonCustomResult.data ?? [])
    wandererMap[w.id] = flattenWanderer(w as unknown as RawWandererRow)
  for (const w of userCustomResult.data ?? [])
    wandererMap[w.id] = flattenWanderer(w as unknown as RawWandererRow)
  for (const row of sharedResult.data ?? []) {
    const w = Array.isArray(row.wanderer) ? row.wanderer[0] : row.wanderer
    if (w) wandererMap[w.id] = flattenWanderer(w as unknown as RawWandererRow)
  }

  return wandererMap
}

/**
 * Get Wanderer ID
 *
 * Retrieves the ID of a wanderer. This depends on if they are custom
 * wanderers (requires the user ID if so). This is used to populate new
 * settlements created from templates.
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
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<WandererDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (wanderer.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('wanderer')
    .insert({
      ...wanderer,
      ...(wanderer.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, custom, accuracy, arc, courage, disposition, evasion, fighting_art_ids, gender, hunt_xp, hunt_xp_rank_up, insanity, luck, lumi, movement, wanderer_name, permanent_injuries, rare_gear_ids, speed, strength, survival, systemic_pressure, torment, understanding, abilities_impairments:wanderer_ability_impairment(ability_impairment(id, custom, ability_impairment_name, rules))'
    )
    .single()

  if (error) throw new Error(`Error Adding Wanderer: ${error.message}`)

  return flattenWanderer(data as unknown as RawWandererRow)
}

/**
 * Update Wanderer
 *
 * Updates an existing wanderer record in the database.
 *
 * @param id Wanderer ID
 * @param wanderer Wanderer Data
 * @returns Updated Wanderer
 */
export async function updateWanderer(
  id: string,
  wanderer: Omit<TablesUpdate<'wanderer'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('wanderer')
    .update(wanderer)
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
 * Get Custom Wanderers
 *
 * Gets only the custom wanderers that the user has created.
 *
 * @returns Custom Wanderers
 */
export async function getCustomWanderers(): Promise<{
  [key: string]: WandererDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('wanderer')
    .select(
      'id, custom, accuracy, arc, courage, disposition, evasion, fighting_art_ids, gender, hunt_xp, hunt_xp_rank_up, insanity, luck, lumi, movement, wanderer_name, permanent_injuries, rare_gear_ids, speed, strength, survival, systemic_pressure, torment, understanding, abilities_impairments:wanderer_ability_impairment(ability_impairment(id, custom, ability_impairment_name, rules))'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Wanderers: ${error.message}`)

  const wandererMap: { [key: string]: WandererDetail } = {}
  for (const w of data ?? [])
    wandererMap[w.id] = flattenWanderer(w as unknown as RawWandererRow)

  return wandererMap
}
