import { SquiresOfTheCitadelSurvivors } from '@/lib/campaigns/squires'
import { Tables } from '@/lib/database.types'
import {
  SURVIVOR_ON_HUNT_ERROR_MESSAGE,
  SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE
} from '@/lib/messages'
import { createClient } from '@/lib/supabase/client'
import {
  AbilityImpairmentDetail,
  DisorderDetail,
  FightingArtDetail,
  GearDetail,
  SecretFightingArtDetail,
  SurvivorDetail
} from '@/lib/types'
import { NewSurvivorInput } from '@/schemas/new-survivor-input'

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
 * (disorders, fighting arts, etc.) resolved to their display names.
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
    .select('*')
    .eq('id', survivorId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Survivor: ${error.message}`)
  if (!data) return null

  // Batch all junction-table and FK lookups in parallel.
  const [
    abilityImpairmentResult,
    cursedGearResult,
    disorderResult,
    fightingArtResult,
    secretFightingArtResult,
    huntResult,
    showdownResult,
    knowledge1Result,
    knowledge2Result,
    neurosisResult,
    philosophyResult,
    tenetKnowledgeResult
  ] = await Promise.all([
    // Abilities and Impairments
    supabase
      .from('survivor_ability_impairment')
      .select('ability_impairment_id')
      .eq('survivor_id', survivorId),
    // Cursed Gear
    supabase
      .from('survivor_cursed_gear')
      .select('gear_id')
      .eq('survivor_id', survivorId),
    // Disorders
    supabase
      .from('survivor_disorder')
      .select('disorder_id')
      .eq('survivor_id', survivorId),
    // Fighting Arts
    supabase
      .from('survivor_fighting_art')
      .select('fighting_art_id')
      .eq('survivor_id', survivorId),
    // Secret Fighting Arts
    supabase
      .from('survivor_secret_fighting_art')
      .select('secret_fighting_art_id')
      .eq('survivor_id', survivorId),
    // Hunt Survivor
    supabase
      .from('hunt_survivor')
      .select('survivor_id')
      .eq('survivor_id', survivorId)
      .limit(1),
    // Showdown Survivor
    supabase
      .from('showdown_survivor')
      .select('survivor_id')
      .eq('survivor_id', survivorId)
      .limit(1),
    // Knowledge 1
    data.knowledge_1_id
      ? supabase
          .from('knowledge')
          .select(
            'id, knowledge_name, rules, observation_conditions, observation_rank_up_milestone'
          )
          .eq('id', data.knowledge_1_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    // Knowledge 2
    data.knowledge_2_id
      ? supabase
          .from('knowledge')
          .select(
            'id, knowledge_name, rules, observation_conditions, observation_rank_up_milestone'
          )
          .eq('id', data.knowledge_2_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    // Neurosis
    data.neurosis_id
      ? supabase
          .from('neurosis')
          .select('id, neurosis_name, rules')
          .eq('id', data.neurosis_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    // Philosophy
    data.philosophy_id
      ? supabase
          .from('philosophy')
          .select(
            'id, philosophy_name, hunt_xp_milestones, tenet_knowledge_id, tier'
          )
          .eq('id', data.philosophy_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    // Tenet Knowledge
    data.tenet_knowledge_id
      ? supabase
          .from('knowledge')
          .select(
            'id, knowledge_name, rules, observation_conditions, observation_rank_up_milestone'
          )
          .eq('id', data.tenet_knowledge_id)
          .single()
      : Promise.resolve({ data: null, error: null })
  ])

  // Validate all results.
  const results = [
    { name: 'Abilities & Impairments', result: abilityImpairmentResult },
    { name: 'Cursed Gear', result: cursedGearResult },
    { name: 'Disorders', result: disorderResult },
    { name: 'Fighting Arts', result: fightingArtResult },
    { name: 'Secret Fighting Arts', result: secretFightingArtResult },
    { name: 'Hunt Survivor', result: huntResult },
    { name: 'Showdown Survivor', result: showdownResult },
    { name: 'Knowledge 1', result: knowledge1Result },
    { name: 'Knowledge 2', result: knowledge2Result },
    { name: 'Neurosis', result: neurosisResult },
    { name: 'Philosophy', result: philosophyResult },
    { name: 'Tenet Knowledge', result: tenetKnowledgeResult }
  ]

  for (const { name, result } of results)
    if (result.error)
      throw new Error(`Error Fetching ${name}: ${result.error.message}`)

  // Resolve junction-table FK IDs to display names.
  const abilityImpairmentIds = (abilityImpairmentResult.data ?? []).map(
    (x) => x.ability_impairment_id
  )
  const cursedGearIds = (cursedGearResult.data ?? []).map((x) => x.gear_id)
  const disorderIds = (disorderResult.data ?? []).map((x) => x.disorder_id)
  const fightingArtIds = (fightingArtResult.data ?? []).map(
    (x) => x.fighting_art_id
  )
  const secretFightingArtIds = (secretFightingArtResult.data ?? []).map(
    (x) => x.secret_fighting_art_id
  )

  const [
    abilityImpairmentDataResult,
    gearDataResult,
    disorderDataResult,
    fightingArtDataResult,
    secretFightingArtDataResult
  ] = await Promise.all([
    abilityImpairmentIds.length > 0
      ? supabase
          .from('ability_impairment')
          .select('id, custom, ability_impairment_name, rules')
          .in('id', abilityImpairmentIds)
      : Promise.resolve({
          data: [],
          error: null
        }),
    cursedGearIds.length > 0
      ? supabase.from('gear').select('id, gear_name').in('id', cursedGearIds)
      : Promise.resolve({
          data: [],
          error: null
        }),
    disorderIds.length > 0
      ? supabase
          .from('disorder')
          .select('id, custom, disorder_name, rules')
          .in('id', disorderIds)
      : Promise.resolve({
          data: [],
          error: null
        }),
    fightingArtIds.length > 0
      ? supabase
          .from('fighting_art')
          .select('id, custom, fighting_art_name, rules')
          .in('id', fightingArtIds)
      : Promise.resolve({
          data: [],
          error: null
        }),
    secretFightingArtIds.length > 0
      ? supabase
          .from('secret_fighting_art')
          .select('id, custom, secret_fighting_art_name, rules')
          .in('id', secretFightingArtIds)
      : Promise.resolve({
          data: [],
          error: null
        })
  ])

  for (const { name, result } of [
    { name: 'Ability & Impairment Data', result: abilityImpairmentDataResult },
    { name: 'Gear Data', result: gearDataResult },
    { name: 'Disorder Data', result: disorderDataResult },
    { name: 'Fighting Art Data', result: fightingArtDataResult },
    { name: 'Secret Fighting Art Data', result: secretFightingArtDataResult }
  ])
    if (result.error)
      throw new Error(`Error Fetching ${name}: ${result.error.message}`)

  return {
    ...data,
    abilities_impairments: abilityImpairmentDataResult.data ?? [],
    cursed_gear: gearDataResult.data ?? [],
    disorders: disorderDataResult.data ?? [],
    embarked:
      (huntResult.data?.length ?? 0) > 0 ||
      (showdownResult.data?.length ?? 0) > 0,
    fighting_arts: fightingArtDataResult.data ?? [],
    knowledge_1: knowledge1Result.data ?? null,
    knowledge_2: knowledge2Result.data ?? null,
    neurosis: neurosisResult.data ?? null,
    philosophy: philosophyResult.data ?? null,
    secret_fighting_arts: secretFightingArtDataResult.data ?? [],
    tenet_knowledge: tenetKnowledgeResult.data ?? null
  }
}

/**
 * Get Survivors
 *
 * Includes all survivors for a settlement with their related entity names.
 * Uses batch lookups to avoid N+1 query patterns.
 *
 * @param settlementId Settlement ID
 * @returns List of Survivors with Embarked Status
 */
export async function getSurvivors(
  settlementId: string | null
): Promise<SurvivorDetail[] | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data: survivors, error: survivorsError } = await supabase
    .from('survivor')
    .select('*')
    .eq('settlement_id', settlementId)
    .order('id', { ascending: true })

  if (survivorsError)
    throw new Error(`Error Fetching Survivors: ${survivorsError.message}`)

  if (!survivors?.length) return null

  const survivorIds = survivors.map((s) => s.id)

  // Batch all junction-table lookups in parallel.
  const [
    abilityImpairmentResult,
    cursedGearResult,
    disorderResult,
    fightingArtResult,
    secretFightingArtResult,
    huntResult,
    showdownResult
  ] = await Promise.all([
    // Abilities & Impairments
    supabase
      .from('survivor_ability_impairment')
      .select('survivor_id, ability_impairment_id')
      .in('survivor_id', survivorIds),
    // Cursed Gear
    supabase
      .from('survivor_cursed_gear')
      .select('survivor_id, gear_id')
      .in('survivor_id', survivorIds),
    // Disorders
    supabase
      .from('survivor_disorder')
      .select('survivor_id, disorder_id')
      .in('survivor_id', survivorIds),
    // Fighting Arts
    supabase
      .from('survivor_fighting_art')
      .select('survivor_id, fighting_art_id')
      .in('survivor_id', survivorIds),
    // Secret Fighting Arts
    supabase
      .from('survivor_secret_fighting_art')
      .select('survivor_id, secret_fighting_art_id')
      .in('survivor_id', survivorIds),
    // Hunt Survivor
    supabase
      .from('hunt_survivor')
      .select('survivor_id')
      .in('survivor_id', survivorIds),
    // Showdown Survivor
    supabase
      .from('showdown_survivor')
      .select('survivor_id')
      .in('survivor_id', survivorIds)
  ])

  for (const { name, result } of [
    { name: 'Abilities & Impairments', result: abilityImpairmentResult },
    { name: 'Cursed Gear', result: cursedGearResult },
    { name: 'Disorders', result: disorderResult },
    { name: 'Fighting Arts', result: fightingArtResult },
    { name: 'Secret Fighting Arts', result: secretFightingArtResult },
    { name: 'Hunt Survivors', result: huntResult },
    { name: 'Showdown Survivors', result: showdownResult }
  ])
    if (result.error)
      throw new Error(`Error Fetching ${name}: ${result.error.message}`)

  // Collect unique FK IDs across all survivors for batch name lookups.
  const allAbilityImpairmentIds = [
    ...new Set(
      (abilityImpairmentResult.data ?? []).map((r) => r.ability_impairment_id)
    )
  ]
  const allGearIds = [
    ...new Set((cursedGearResult.data ?? []).map((r) => r.gear_id))
  ]
  const allDisorderIds = [
    ...new Set((disorderResult.data ?? []).map((r) => r.disorder_id))
  ]
  const allFightingArtIds = [
    ...new Set((fightingArtResult.data ?? []).map((r) => r.fighting_art_id))
  ]
  const allSecretFightingArtIds = [
    ...new Set(
      (secretFightingArtResult.data ?? []).map((r) => r.secret_fighting_art_id)
    )
  ]
  const allKnowledgeIds = [
    ...new Set(
      survivors
        .flatMap((s) => [
          s.knowledge_1_id,
          s.knowledge_2_id,
          s.tenet_knowledge_id
        ])
        .filter((id): id is string => id != null)
    )
  ]
  const allNeurosisIds = [
    ...new Set(
      survivors
        .map((s) => s.neurosis_id)
        .filter((id): id is string => id != null)
    )
  ]
  const allPhilosophyIds = [
    ...new Set(
      survivors
        .map((s) => s.philosophy_id)
        .filter((id): id is string => id != null)
    )
  ]

  // Batch-fetch all name lookups in parallel.
  const [
    abilityImpairmentDataResult,
    gearDataResult,
    disorderDataResult,
    fightingArtDataResult,
    secretFightingArtDataResult,
    knowledgeDataResult,
    neurosisDataResult,
    philosophyDataResult
  ] = await Promise.all([
    allAbilityImpairmentIds.length > 0
      ? supabase
          .from('ability_impairment')
          .select('id, custom, ability_impairment_name, rules')
          .in('id', allAbilityImpairmentIds)
      : Promise.resolve({
          data: [],
          error: null
        }),
    allGearIds.length > 0
      ? supabase
          .from('gear')
          .select('id, custom, gear_name, location_id')
          .in('id', allGearIds)
      : Promise.resolve({
          data: [],
          error: null
        }),
    allDisorderIds.length > 0
      ? supabase
          .from('disorder')
          .select('id, custom, disorder_name, rules')
          .in('id', allDisorderIds)
      : Promise.resolve({
          data: [],
          error: null
        }),
    allFightingArtIds.length > 0
      ? supabase
          .from('fighting_art')
          .select('id, custom, fighting_art_name, rules')
          .in('id', allFightingArtIds)
      : Promise.resolve({
          data: [],
          error: null
        }),
    allSecretFightingArtIds.length > 0
      ? supabase
          .from('secret_fighting_art')
          .select('id, custom, secret_fighting_art_name, rules')
          .in('id', allSecretFightingArtIds)
      : Promise.resolve({
          data: [],
          error: null
        }),
    allKnowledgeIds.length > 0
      ? supabase
          .from('knowledge')
          .select(
            'id, knowledge_name, rules, observation_conditions, observation_rank_up_milestone'
          )
          .in('id', allKnowledgeIds)
      : Promise.resolve({
          data: [],
          error: null
        }),
    allNeurosisIds.length > 0
      ? supabase
          .from('neurosis')
          .select('id, neurosis_name, rules')
          .in('id', allNeurosisIds)
      : Promise.resolve({
          data: [],
          error: null
        }),
    allPhilosophyIds.length > 0
      ? supabase
          .from('philosophy')
          .select(
            'id, philosophy_name, hunt_xp_milestones, tenet_knowledge_id, tier'
          )
          .in('id', allPhilosophyIds)
      : Promise.resolve({
          data: [],
          error: null
        })
  ])

  for (const { name, result } of [
    { name: 'Ability & Impairment Data', result: abilityImpairmentDataResult },
    { name: 'Gear Data', result: gearDataResult },
    { name: 'Disorder Data', result: disorderDataResult },
    { name: 'Fighting Art Data', result: fightingArtDataResult },
    { name: 'Secret Fighting Art Data', result: secretFightingArtDataResult },
    { name: 'Knowledge Data', result: knowledgeDataResult },
    { name: 'Neurosis Data', result: neurosisDataResult },
    { name: 'Philosophy Data', result: philosophyDataResult }
  ])
    if (result.error)
      throw new Error(`Error Fetching ${name}: ${result.error.message}`)

  // Build lookup maps for name resolution.
  const abilityImpairmentDataMap = new Map(
    (abilityImpairmentDataResult.data ?? []).map((a) => [
      a.id,
      a.ability_impairment_name
    ])
  )
  const gearDataMap = new Map((gearDataResult.data ?? []).map((g) => [g.id, g]))
  const disorderDataMap = new Map(
    (disorderDataResult.data ?? []).map((d) => [d.id, d])
  )
  const fightingArtDataMap = new Map(
    (fightingArtDataResult.data ?? []).map((f) => [f.id, f])
  )
  const secretFightingArtDataMap = new Map(
    (secretFightingArtDataResult.data ?? []).map((s) => [s.id, s])
  )
  const knowledgeDataMap = new Map(
    (knowledgeDataResult.data ?? []).map((k) => [k.id, k])
  )
  const neurosisDataMap = new Map(
    (neurosisDataResult.data ?? []).map((n) => [n.id, n])
  )
  const philosophyDataMap = new Map(
    (philosophyDataResult.data ?? []).map((p) => [p.id, p])
  )

  // Group junction table results by survivor_id.
  const abilityImpairmentBySurvivor = new Map<
    string,
    { id: string; ability_impairment: AbilityImpairmentDetail }[]
  >()
  for (const r of abilityImpairmentResult.data ?? []) {
    const items = abilityImpairmentBySurvivor.get(r.survivor_id) ?? []
    const ability_impairment = abilityImpairmentDataMap.get(
      r.ability_impairment_id
    )
    if (ability_impairment)
      items.push({ id: r.ability_impairment_id, ability_impairment })
    abilityImpairmentBySurvivor.set(r.survivor_id, items)
  }

  const cursedGearBySurvivor = new Map<
    string,
    { id: string; gear: GearDetail }[]
  >()
  for (const r of cursedGearResult.data ?? []) {
    const items = cursedGearBySurvivor.get(r.survivor_id) ?? []
    const gear = gearDataMap.get(r.gear_id)
    if (gear) items.push({ id: r.gear_id, gear })
    cursedGearBySurvivor.set(r.survivor_id, items)
  }

  const disordersBySurvivor = new Map<
    string,
    { id: string; disorder: DisorderDetail }[]
  >()
  for (const r of disorderResult.data ?? []) {
    const items = disordersBySurvivor.get(r.survivor_id) ?? []
    const disorder = disorderDataMap.get(r.disorder_id)
    if (disorder) items.push({ id: r.disorder_id, disorder })
    disordersBySurvivor.set(r.survivor_id, items)
  }

  const fightingArtsBySurvivor = new Map<
    string,
    { id: string; fighting_art: FightingArtDetail }[]
  >()
  for (const r of fightingArtResult.data ?? []) {
    const items = fightingArtsBySurvivor.get(r.survivor_id) ?? []
    const fighting_art = fightingArtDataMap.get(r.fighting_art_id)
    if (fighting_art) items.push({ id: r.fighting_art_id, fighting_art })
    fightingArtsBySurvivor.set(r.survivor_id, items)
  }

  const secretFightingArtsBySurvivor = new Map<
    string,
    { id: string; secret_fighting_art: SecretFightingArtDetail }[]
  >()
  for (const r of secretFightingArtResult.data ?? []) {
    const items = secretFightingArtsBySurvivor.get(r.survivor_id) ?? []
    const secret_fighting_art = secretFightingArtDataMap.get(
      r.secret_fighting_art_id
    )
    if (secret_fighting_art)
      items.push({ id: r.secret_fighting_art_id, secret_fighting_art })
    secretFightingArtsBySurvivor.set(r.survivor_id, items)
  }

  const embarkedIds = new Set([
    ...(huntResult.data ?? []).map((r) => r.survivor_id),
    ...(showdownResult.data ?? []).map((r) => r.survivor_id)
  ])

  return survivors.map((survivor) => ({
    ...survivor,
    cursed_gear: cursedGearBySurvivor.get(survivor.id) ?? [],
    disorders: disordersBySurvivor.get(survivor.id) ?? [],
    embarked: embarkedIds.has(survivor.id),
    fighting_arts: fightingArtsBySurvivor.get(survivor.id) ?? [],
    knowledge_1: survivor.knowledge_1_id
      ? knowledgeDataMap.get(survivor.knowledge_1_id)
      : null,
    knowledge_2: survivor.knowledge_2_id
      ? knowledgeDataMap.get(survivor.knowledge_2_id)
      : null,
    neurosis: survivor.neurosis_id
      ? neurosisDataMap.get(survivor.neurosis_id)
      : null,
    philosophy: survivor.philosophy_id
      ? philosophyDataMap.get(survivor.philosophy_id)
      : null,
    secret_fighting_arts: secretFightingArtsBySurvivor.get(survivor.id) ?? [],
    tenet_knowledge: survivor.tenet_knowledge_id
      ? knowledgeDataMap.get(survivor.tenet_knowledge_id)
      : null
  }))
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
