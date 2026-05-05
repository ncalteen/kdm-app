import { SquiresOfTheCitadelSurvivors } from '@/lib/campaigns/squires'
import { Tables } from '@/lib/database.types'
import {
  SURVIVOR_ON_HUNT_ERROR_MESSAGE,
  SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE
} from '@/lib/messages'
import { createClient } from '@/lib/supabase/client'
import { SurvivorDetail } from '@/lib/types'
import { NewSurvivorInput } from '@/schemas/new-survivor-input'

/**
 * Survivor Select Projection
 *
 * Single PostgREST projection used by both `getSurvivor` and `getSurvivors`.
 * Embeds every related entity in one round-trip via foreign-key joins,
 * avoiding the prior ~17 sequential lookups per survivor.
 *
 * - Junction tables expose the related row directly (e.g. `disorder(...)`)
 *   so the result mapping can flatten them.
 * - The `knowledge` table appears three times via FK aliases
 *   (`survivor_knowledge_1_id_fkey` etc.) — PostgREST requires the explicit
 *   constraint name to disambiguate.
 */
const SURVIVOR_SELECT = `
  *,
  abilities_impairments:survivor_ability_impairment(
    ability_impairment(id, custom, ability_impairment_name, rules)
  ),
  cursed_gear:survivor_cursed_gear(
    gear(id, gear_name)
  ),
  disorders:survivor_disorder(
    disorder(id, custom, disorder_name, rules)
  ),
  fighting_arts:survivor_fighting_art(
    fighting_art(id, custom, fighting_art_name, rules)
  ),
  secret_fighting_arts:survivor_secret_fighting_art(
    secret_fighting_art(id, custom, secret_fighting_art_name, rules)
  ),
  gear_grid(id, pos_top_left, pos_top_center, pos_top_right, pos_mid_left, pos_mid_center, pos_mid_right, pos_bottom_left, pos_bottom_center, pos_bottom_right, selected_armor_set_id),
  hunt_survivor(survivor_id),
  showdown_survivor(survivor_id),
  knowledge_1:knowledge!survivor_knowledge_1_id_fkey(id, knowledge_name, rules, observation_conditions, observation_rank_up_milestone),
  knowledge_2:knowledge!survivor_knowledge_2_id_fkey(id, knowledge_name, rules, observation_conditions, observation_rank_up_milestone),
  neurosis(id, neurosis_name, rules),
  philosophy(id, philosophy_name, hunt_xp_milestones, tenet_knowledge_id, tier),
  tenet_knowledge:knowledge!survivor_tenet_knowledge_id_fkey(id, knowledge_name, rules, observation_conditions, observation_rank_up_milestone)
`

/**
 * Raw Survivor Row Shape
 *
 * Captures the runtime shape returned by Supabase for `SURVIVOR_SELECT`.
 * Generated types can't express the FK-aliased projections precisely, so a
 * focused interface keeps the mapper type-safe without `as unknown` casts.
 */
type SurvivorRow = Tables<'survivor'> & {
  abilities_impairments: {
    ability_impairment: SurvivorDetail['abilities_impairments'][number] | null
  }[]
  cursed_gear: { gear: SurvivorDetail['cursed_gear'][number] | null }[]
  disorders: { disorder: SurvivorDetail['disorders'][number] | null }[]
  fighting_arts: {
    fighting_art: SurvivorDetail['fighting_arts'][number] | null
  }[]
  secret_fighting_arts: {
    secret_fighting_art: SurvivorDetail['secret_fighting_arts'][number] | null
  }[]
  gear_grid: SurvivorDetail['gear_grid'] | SurvivorDetail['gear_grid'][] | null
  hunt_survivor: { survivor_id: string }[]
  showdown_survivor: { survivor_id: string }[]
  knowledge_1: SurvivorDetail['knowledge_1']
  knowledge_2: SurvivorDetail['knowledge_2']
  neurosis: SurvivorDetail['neurosis']
  philosophy: SurvivorDetail['philosophy']
  tenet_knowledge: SurvivorDetail['tenet_knowledge']
}

/**
 * Map Survivor Row to SurvivorDetail
 *
 * Flattens the junction-table embeds (`[{ disorder: {...} }]` →
 * `[{...}]`) and derives the `embarked` flag from hunt/showdown membership.
 *
 * @param row Survivor Row
 * @returns Survivor Detail
 */
function mapSurvivorRow(row: SurvivorRow): SurvivorDetail {
  const {
    abilities_impairments,
    cursed_gear,
    disorders,
    fighting_arts,
    secret_fighting_arts,
    gear_grid,
    hunt_survivor,
    showdown_survivor,
    ...survivor
  } = row

  // PostgREST returns embedded one-to-one relations as a single object when a
  // matching row exists, but as an array (or null) when the relation is
  // optional. Normalise both shapes to a single GearGridDetail (or null).
  const gridRow = Array.isArray(gear_grid)
    ? (gear_grid[0] ?? null)
    : (gear_grid ?? null)

  return {
    ...survivor,
    abilities_impairments: abilities_impairments
      .map((r) => r.ability_impairment)
      .filter((x): x is SurvivorDetail['abilities_impairments'][number] =>
        Boolean(x)
      ),
    cursed_gear: cursed_gear
      .map((r) => r.gear)
      .filter((x): x is SurvivorDetail['cursed_gear'][number] => Boolean(x)),
    disorders: disorders
      .map((r) => r.disorder)
      .filter((x): x is SurvivorDetail['disorders'][number] => Boolean(x)),
    embarked: hunt_survivor.length > 0 || showdown_survivor.length > 0,
    fighting_arts: fighting_arts
      .map((r) => r.fighting_art)
      .filter((x): x is SurvivorDetail['fighting_arts'][number] => Boolean(x)),
    gear_grid: gridRow,
    secret_fighting_arts: secret_fighting_arts
      .map((r) => r.secret_fighting_art)
      .filter((x): x is SurvivorDetail['secret_fighting_arts'][number] =>
        Boolean(x)
      )
  }
}

/**
 * Add Squires of the Citadel Survivors
 *
 * Squires of the Citadel campaigns require specific survivors to be added to
 * the settlement.
 *
 * @param settlementId Settlement ID
 */
export async function addSquiresOfTheCitadelSurvivors(
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { error } = await supabase.from('survivor').insert(
    SquiresOfTheCitadelSurvivors.map((squire) => ({
      gender: squire.gender,
      settlement_id: settlementId,
      survivor_name: squire.name
    }))
  )

  if (error)
    throw new Error(`Error Adding Squires to Settlement: ${error.message}`)
}

/**
 * Get Survivor
 *
 * Includes all details for the survivor, including junction-table data
 * (disorders, fighting arts, etc.) resolved to their display names. Issues
 * a single PostgREST request that joins every related entity in one call.
 *
 * @param survivorId Survivor ID
 * @returns Survivor Data with Embarked Status
 */
export async function getSurvivor(
  survivorId: string | null | undefined
): Promise<SurvivorDetail | null> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor')
    .select(SURVIVOR_SELECT)
    .eq('id', survivorId)
    .maybeSingle<SurvivorRow>()

  if (error) throw new Error(`Error Fetching Survivor: ${error.message}`)
  if (!data) return null

  return mapSurvivorRow(data)
}

/**
 * Get Survivors
 *
 * Includes all survivors for a settlement with their related entity names.
 * Issues a single PostgREST request that joins every related entity in one
 * call.
 *
 * @param settlementId Settlement ID
 * @returns List of Survivors with Embarked Status
 */
export async function getSurvivors(
  settlementId: string | null
): Promise<SurvivorDetail[] | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor')
    .select(SURVIVOR_SELECT)
    .eq('settlement_id', settlementId)
    .order('id', { ascending: true })
    .returns<SurvivorRow[]>()

  if (error) throw new Error(`Error Fetching Survivors: ${error.message}`)
  if (!data?.length) return null

  return data.map(mapSurvivorRow)
}

/**
 * Update Survivor
 *
 * @param survivorId Survivor ID
 * @param updates Survivor Updates
 */
export async function updateSurvivor(
  survivorId: string | null | undefined,
  updates: Partial<Tables<'survivor'>>
): Promise<void> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('survivor')
    .update(updates)
    .eq('id', survivorId)

  if (error) throw new Error(`Error Updating Survivor: ${error.message}`)
}

/**
 * Delete Survivor
 *
 * Checks if a survivor can be deleted (not on a hunt or showdown) before
 * removing them from the database. Returns the updated list of survivors.
 *
 * This is a pure data operation — UI state management (clearing selected
 * survivor) should be handled by the caller.
 *
 * @param settlementId Settlement ID
 * @param survivorId Survivor ID to delete
 * @returns Updated list of survivors for the settlement
 */
export async function deleteSurvivor(
  settlementId: string | null | undefined,
  survivorId: string
): Promise<Tables<'survivor'>[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  // Check hunt and showdown participation in parallel.
  const [huntResult, showdownResult] = await Promise.all([
    supabase
      .from('hunt_survivor')
      .select('id')
      .eq('survivor_id', survivorId)
      .maybeSingle(),
    supabase
      .from('showdown_survivor')
      .select('id')
      .eq('survivor_id', survivorId)
      .maybeSingle()
  ])

  if (huntResult.error)
    throw new Error(
      `Error Checking Survivor Hunts: ${huntResult.error.message}`
    )
  if (huntResult.data) throw new Error(SURVIVOR_ON_HUNT_ERROR_MESSAGE())

  if (showdownResult.error)
    throw new Error(
      `Error Checking Survivor Showdowns: ${showdownResult.error.message}`
    )
  if (showdownResult.data) throw new Error(SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE())

  const { error: deleteError } = await supabase
    .from('survivor')
    .delete()
    .eq('id', survivorId)

  if (deleteError)
    throw new Error(`Error Deleting Survivor: ${deleteError.message}`)

  const { data: survivorsData, error: survivorsError } = await supabase
    .from('survivor')
    .select('*')
    .eq('settlement_id', settlementId)
    .order('id', { ascending: true })

  if (survivorsError)
    throw new Error(`Error Fetching Survivors: ${survivorsError.message}`)

  return survivorsData ?? []
}

/**
 * Create a Survivor
 *
 * @param options Input Options
 * @returns Created Survivor
 */
export async function createSurvivor(
  options: NewSurvivorInput
): Promise<SurvivorDetail> {
  if (!options.settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const survivor: Partial<Tables<'survivor'>> = {
    accuracy: options.accuracy,
    can_dash: options.canDash,
    can_dodge: options.canDodge,
    can_fist_pump: options.canFistPump,
    can_encourage: options.canEncourage,
    can_surge: options.canSurge,
    courage: options.courage,
    disposition: options.disposition ?? null,
    evasion: options.evasion,
    gender: options.gender === 'M' ? 'MALE' : 'FEMALE',
    hunt_xp: options.huntXP,
    hunt_xp_rank_up: options.huntXPRankUp,
    insanity: options.insanity,
    luck: options.luck,
    movement: options.movement,
    parent_1_id: options.parent1Id ?? null,
    parent_2_id: options.parent2Id ?? null,
    settlement_id: options.settlementId,
    speed: options.speed,
    aenas_state: options.aenasState ?? null,
    strength: options.strength,
    survival: options.survival,
    survivor_name: options.survivorName ?? null,
    understanding: options.understanding,
    wanderer: options.wanderer,
    arm_broken: options.armBroken,
    arm_contracture: options.armContracture,
    arm_dismembered: options.armDismembered,
    arm_ruptured_muscle: options.armRupturedMuscle,
    body_broken_rib: options.bodyBrokenRib,
    body_destroyed_back: options.bodyDestroyedBack,
    body_gaping_chest_wound: options.bodyGapingChestWound,
    head_blind: options.headBlind,
    head_deaf: options.headDeaf,
    head_intracranial_hemorrhage: options.headIntracranialHemorrhage,
    head_shattered_jaw: options.headShatteredJaw,
    leg_broken: options.legBroken,
    leg_dismembered: options.legDismembered,
    leg_hamstrung: options.legHamstrung,
    waist_broken_hip: options.waistBrokenHip,
    waist_destroyed_genitals: options.waistDestroyedGenitals,
    waist_intestinal_prolapse: options.waistIntestinalProlapse,
    waist_warped_pelvis: options.waistWarpedPelvis,
    can_endure: options.canEndure,
    lumi: options.lumi,
    systemic_pressure: options.systemicPressure,
    torment: options.torment
  }

  const { data, error } = await supabase
    .from('survivor')
    .insert(survivor)
    .select('id')
    .single()

  if (error) throw new Error(`Error Creating Survivor: ${error.message}`)

  // Add fighting arts via junction table if provided. This is usually only done
  // for wanderers.
  if (options.fightingArtIds?.length) {
    const { error: junctionError } = await supabase
      .from('survivor_fighting_art')
      .insert(
        options.fightingArtIds.map((fightingArtId) => ({
          survivor_id: data.id,
          fighting_art_id: fightingArtId
        }))
      )

    if (junctionError)
      throw new Error(
        `Error Adding Fighting Arts to Survivor: ${junctionError.message}`
      )
  }

  // Add abilities/impairments via junction table if provided. This is usually
  // only done for wanderers.
  if (options.abilityImpairmentIds?.length) {
    const { error: junctionError } = await supabase
      .from('survivor_ability_impairment')
      .insert(
        options.abilityImpairmentIds.map((abilityImpairmentId) => ({
          survivor_id: data.id,
          ability_impairment_id: abilityImpairmentId
        }))
      )

    if (junctionError)
      throw new Error(
        `Error Adding Ability/Impairment to Survivor: ${junctionError.message}`
      )
  }

  return (await getSurvivor(data.id)) as SurvivorDetail
}
