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
 * Get Survivor for Settlement
 *
 * Includes an `embarked` boolean indicating whether the survivor is currently
 * assigned to a hunt or showdown.
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

  const [
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
          .select('id, knowledge_name')
          .eq('id', data.knowledge_1_id)
          .limit(1)
      : { data: [], error: null },
    // Knowledge 2
    data.knowledge_2_id
      ? supabase
          .from('knowledge')
          .select('id, knowledge_name')
          .eq('id', data.knowledge_2_id)
          .limit(1)
      : { data: [], error: null },
    // Neurosis
    data.neurosis_id
      ? supabase
          .from('neurosis')
          .select('id, neurosis_name')
          .eq('id', data.neurosis_id)
          .limit(1)
      : { data: [], error: null },
    // Philosophy
    data.philosophy_id
      ? supabase
          .from('philosophy')
          .select('id, philosophy_name')
          .eq('id', data.philosophy_id)
          .limit(1)
      : { data: [], error: null },
    // Tenet Knowledge
    data.tenet_knowledge_id
      ? supabase
          .from('knowledge')
          .select('id, knowledge_name')
          .eq('id', data.tenet_knowledge_id)
          .limit(1)
      : { data: [], error: null }
  ])

  if (cursedGearResult.error)
    throw new Error(
      `Error Fetching Cursed Gear: ${cursedGearResult.error.message}`
    )
  if (disorderResult.error)
    throw new Error(`Error Fetching Disorders: ${disorderResult.error.message}`)
  if (fightingArtResult.error)
    throw new Error(
      `Error Fetching Fighting Arts: ${fightingArtResult.error.message}`
    )
  if (secretFightingArtResult.error)
    throw new Error(
      `Error Fetching Secret Fighting Arts: ${secretFightingArtResult.error.message}`
    )
  if (huntResult.error)
    throw new Error(`Error Checking Hunt Survivor: ${huntResult.error.message}`)
  if (showdownResult.error)
    throw new Error(
      `Error Checking Showdown Survivor: ${showdownResult.error.message}`
    )
  if (knowledge1Result.error)
    throw new Error(
      `Error Fetching Knowledge 1: ${knowledge1Result.error.message}`
    )
  if (knowledge2Result.error)
    throw new Error(
      `Error Fetching Knowledge 2: ${knowledge2Result.error.message}`
    )
  if (neurosisResult.error)
    throw new Error(`Error Fetching Neurosis: ${neurosisResult.error.message}`)
  if (philosophyResult.error)
    throw new Error(
      `Error Fetching Philosophy: ${philosophyResult.error.message}`
    )
  if (tenetKnowledgeResult.error)
    throw new Error(
      `Error Fetching Tenet Knowledge: ${tenetKnowledgeResult.error.message}`
    )

  // Fetch names for junction table references in parallel.
  const cursedGearIds = (cursedGearResult.data ?? []).map((x) => x.gear_id)
  const disorderIds = (disorderResult.data ?? []).map((x) => x.disorder_id)
  const fightingArtIds = (fightingArtResult.data ?? []).map(
    (x) => x.fighting_art_id
  )
  const secretFightingArtIds = (secretFightingArtResult.data ?? []).map(
    (x) => x.secret_fighting_art_id
  )

  const [
    gearNamesResult,
    disorderNamesResult,
    fightingArtNamesResult,
    secretFightingArtNamesResult
  ] = await Promise.all([
    cursedGearIds.length > 0
      ? supabase.from('gear').select('id, gear_name').in('id', cursedGearIds)
      : { data: [], error: null },
    disorderIds.length > 0
      ? supabase
          .from('disorder')
          .select('id, disorder_name')
          .in('id', disorderIds)
      : { data: [], error: null },
    fightingArtIds.length > 0
      ? supabase
          .from('fighting_art')
          .select('id, fighting_art_name')
          .in('id', fightingArtIds)
      : { data: [], error: null },
    secretFightingArtIds.length > 0
      ? supabase
          .from('secret_fighting_art')
          .select('id, secret_fighting_art_name')
          .in('id', secretFightingArtIds)
      : { data: [], error: null }
  ])

  if (gearNamesResult.error)
    throw new Error(
      `Error Fetching Gear Names: ${gearNamesResult.error.message}`
    )
  if (disorderNamesResult.error)
    throw new Error(
      `Error Fetching Disorder Names: ${disorderNamesResult.error.message}`
    )
  if (fightingArtNamesResult.error)
    throw new Error(
      `Error Fetching Fighting Art Names: ${fightingArtNamesResult.error.message}`
    )
  if (secretFightingArtNamesResult.error)
    throw new Error(
      `Error Fetching Secret Fighting Art Names: ${secretFightingArtNamesResult.error.message}`
    )

  return {
    ...data,
    cursed_gear: gearNamesResult.data ?? [],
    disorders: disorderNamesResult.data ?? [],
    embarked:
      (huntResult.data?.length ?? 0) > 0 ||
      (showdownResult.data?.length ?? 0) > 0,
    fighting_arts: (fightingArtNamesResult.data ?? []).map((x) => ({
      id: x.id,
      name: x.fighting_art_name
    })),
    knowledge_1: knowledge1Result.data?.[0] ?? null,
    knowledge_2: knowledge2Result.data?.[0] ?? null,
    neurosis: neurosisResult.data?.[0] ?? null,
    philosophy: philosophyResult.data?.[0] ?? null,
    secret_fighting_arts: secretFightingArtNamesResult.data ?? [],
    tenet_knowledge: tenetKnowledgeResult.data?.[0] ?? null
  }
}

/**
 * Get Survivors for Settlement
 *
 * Includes an `embarked` boolean indicating whether the survivor is currently
 * assigned to a hunt or showdown.
 *
 * @param settlementId Settlement ID
 * @returns List of Survivors with Embarked Status
 */
export async function getSurvivors(
  settlementId: string | null
): Promise<SurvivorDetail[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data: survivors, error: survivorsError } = await supabase
    .from('survivor')
    .select('*')
    .eq('settlement_id', settlementId)
    .order('id', { ascending: true })

  if (survivorsError)
    throw new Error(`Error Fetching Survivors: ${survivorsError.message}`)

  if (!survivors?.length) return []

  const survivorIds = survivors.map((s) => s.id)

  const [
    cursedGearResult,
    disorderResult,
    fightingArtResult,
    secretFightingArtResult,
    huntResult,
    showdownResult
  ] = await Promise.all([
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

  if (cursedGearResult.error)
    throw new Error(
      `Error Fetching Cursed Gear: ${cursedGearResult.error.message}`
    )
  if (disorderResult.error)
    throw new Error(`Error Fetching Disorders: ${disorderResult.error.message}`)
  if (fightingArtResult.error)
    throw new Error(
      `Error Fetching Fighting Arts: ${fightingArtResult.error.message}`
    )
  if (secretFightingArtResult.error)
    throw new Error(
      `Error Fetching Secret Fighting Arts: ${secretFightingArtResult.error.message}`
    )
  if (huntResult.error)
    throw new Error(
      `Error Checking Hunt Survivors: ${huntResult.error.message}`
    )
  if (showdownResult.error)
    throw new Error(
      `Error Checking Showdown Survivors: ${showdownResult.error.message}`
    )

  // Collect unique FK IDs across all survivors for batch lookups.
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
    gearNamesResult,
    disorderNamesResult,
    fightingArtNamesResult,
    secretFightingArtNamesResult,
    knowledgeNamesResult,
    neurosisNamesResult,
    philosophyNamesResult
  ] = await Promise.all([
    allGearIds.length > 0
      ? supabase.from('gear').select('id, gear_name').in('id', allGearIds)
      : { data: [], error: null },
    allDisorderIds.length > 0
      ? supabase
          .from('disorder')
          .select('id, disorder_name')
          .in('id', allDisorderIds)
      : { data: [], error: null },
    allFightingArtIds.length > 0
      ? supabase
          .from('fighting_art')
          .select('id, fighting_art_name')
          .in('id', allFightingArtIds)
      : { data: [], error: null },
    allSecretFightingArtIds.length > 0
      ? supabase
          .from('secret_fighting_art')
          .select('id, secret_fighting_art_name')
          .in('id', allSecretFightingArtIds)
      : { data: [], error: null },
    allKnowledgeIds.length > 0
      ? supabase
          .from('knowledge')
          .select('id, knowledge_name')
          .in('id', allKnowledgeIds)
      : { data: [], error: null },
    allNeurosisIds.length > 0
      ? supabase
          .from('neurosis')
          .select('id, neurosis_name')
          .in('id', allNeurosisIds)
      : { data: [], error: null },
    allPhilosophyIds.length > 0
      ? supabase
          .from('philosophy')
          .select('id, philosophy_name')
          .in('id', allPhilosophyIds)
      : { data: [], error: null }
  ])

  if (gearNamesResult.error)
    throw new Error(
      `Error Fetching Gear Names: ${gearNamesResult.error.message}`
    )
  if (disorderNamesResult.error)
    throw new Error(
      `Error Fetching Disorder Names: ${disorderNamesResult.error.message}`
    )
  if (fightingArtNamesResult.error)
    throw new Error(
      `Error Fetching Fighting Art Names: ${fightingArtNamesResult.error.message}`
    )
  if (secretFightingArtNamesResult.error)
    throw new Error(
      `Error Fetching Secret Fighting Art Names: ${secretFightingArtNamesResult.error.message}`
    )
  if (knowledgeNamesResult.error)
    throw new Error(
      `Error Fetching Knowledge Names: ${knowledgeNamesResult.error.message}`
    )
  if (neurosisNamesResult.error)
    throw new Error(
      `Error Fetching Neurosis Names: ${neurosisNamesResult.error.message}`
    )
  if (philosophyNamesResult.error)
    throw new Error(
      `Error Fetching Philosophy Names: ${philosophyNamesResult.error.message}`
    )

  // Build lookup maps for name resolution.
  const gearNameMap = new Map(
    (gearNamesResult.data ?? []).map((g) => [g.id, g.gear_name])
  )
  const disorderNameMap = new Map(
    (disorderNamesResult.data ?? []).map((d) => [d.id, d.disorder_name])
  )
  const fightingArtNameMap = new Map(
    (fightingArtNamesResult.data ?? []).map((f) => [f.id, f.fighting_art_name])
  )
  const secretFightingArtNameMap = new Map(
    (secretFightingArtNamesResult.data ?? []).map((s) => [
      s.id,
      s.secret_fighting_art_name
    ])
  )
  const knowledgeNameMap = new Map(
    (knowledgeNamesResult.data ?? []).map((k) => [k.id, k.knowledge_name])
  )
  const neurosisNameMap = new Map(
    (neurosisNamesResult.data ?? []).map((n) => [n.id, n.neurosis_name])
  )
  const philosophyNameMap = new Map(
    (philosophyNamesResult.data ?? []).map((p) => [p.id, p.philosophy_name])
  )

  // Group junction table results by survivor_id.
  type NameId = { id: string; name: string }

  const cursedGearBySurvivor = new Map<string, NameId[]>()
  for (const r of cursedGearResult.data ?? []) {
    const items = cursedGearBySurvivor.get(r.survivor_id) ?? []
    const name = gearNameMap.get(r.gear_id)
    if (name) items.push({ id: r.gear_id, name })
    cursedGearBySurvivor.set(r.survivor_id, items)
  }

  const disordersBySurvivor = new Map<string, NameId[]>()
  for (const r of disorderResult.data ?? []) {
    const items = disordersBySurvivor.get(r.survivor_id) ?? []
    const name = disorderNameMap.get(r.disorder_id)
    if (name) items.push({ id: r.disorder_id, name })
    disordersBySurvivor.set(r.survivor_id, items)
  }

  const fightingArtsBySurvivor = new Map<string, NameId[]>()
  for (const r of fightingArtResult.data ?? []) {
    const items = fightingArtsBySurvivor.get(r.survivor_id) ?? []
    const name = fightingArtNameMap.get(r.fighting_art_id)
    if (name) items.push({ id: r.fighting_art_id, name })
    fightingArtsBySurvivor.set(r.survivor_id, items)
  }

  const secretFightingArtsBySurvivor = new Map<string, NameId[]>()
  for (const r of secretFightingArtResult.data ?? []) {
    const items = secretFightingArtsBySurvivor.get(r.survivor_id) ?? []
    const name = secretFightingArtNameMap.get(r.secret_fighting_art_id)
    if (name) items.push({ id: r.secret_fighting_art_id, name })
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
      ? {
          id: survivor.knowledge_1_id,
          knowledge_name: knowledgeNameMap.get(survivor.knowledge_1_id) ?? ''
        }
      : null,
    knowledge_2: survivor.knowledge_2_id
      ? {
          id: survivor.knowledge_2_id,
          knowledge_name: knowledgeNameMap.get(survivor.knowledge_2_id) ?? ''
        }
      : null,
    neurosis: survivor.neurosis_id
      ? {
          id: survivor.neurosis_id,
          neurosis_name: neurosisNameMap.get(survivor.neurosis_id) ?? ''
        }
      : null,
    philosophy: survivor.philosophy_id
      ? {
          id: survivor.philosophy_id,
          philosophy_name: philosophyNameMap.get(survivor.philosophy_id) ?? ''
        }
      : null,
    secret_fighting_arts: secretFightingArtsBySurvivor.get(survivor.id) ?? [],
    tenet_knowledge: survivor.tenet_knowledge_id
      ? {
          id: survivor.tenet_knowledge_id,
          knowledge_name:
            knowledgeNameMap.get(survivor.tenet_knowledge_id) ?? ''
        }
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
 * removing them from the database. Also handles any necessary cleanup, such as
 * removing the survivor from the selected state if they are currently selected.
 *
 * @param settlementId Settlement ID
 * @param selectedSurvivorId Currently Selected Survivor ID
 * @param setSelectedSurvivorId Function to Update Selected Survivor ID State
 * @param survivorId Survivor ID
 */
export async function deleteSurvivor(
  settlementId: string | null | undefined,
  selectedSurvivorId: string | null | undefined,
  setSelectedSurvivor: (survivor: SurvivorDetail | null) => void,
  survivorId: string
): Promise<Tables<'survivor'>[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  // Check if there is a record in the hunt_survivor table with this survivor_id
  const { data: huntData, error: huntError } = await supabase
    .from('hunt_survivor')
    .select('id')
    .eq('survivor_id', survivorId)
    .maybeSingle()

  if (huntError)
    throw new Error(`Error Checking Survivor Hunts: ${huntError.message}`)
  if (huntData) throw new Error(SURVIVOR_ON_HUNT_ERROR_MESSAGE())

  // Check if there is a record in the showdown_survivor table with this
  // survivor_id
  const { data: showdownData, error: showdownError } = await supabase
    .from('showdown_survivor')
    .select('id')
    .eq('survivor_id', survivorId)
    .maybeSingle()

  if (showdownError)
    throw new Error(
      `Error Checking Survivor Showdowns: ${showdownError.message}`
    )
  if (showdownData) throw new Error(SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE())

  // If the survivor is currently selected, clear the selected survivor state
  if (selectedSurvivorId === survivorId) setSelectedSurvivor(null)

  // Proceed with deletion if the survivor is not on a hunt or showdown and
  // return the updated list of survivors for this settlement
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
    abilities_impairments: options.abilitiesAndImpairments,
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
    .select('*')
    .single()

  if (error) throw new Error(`Error Creating Survivor: ${error.message}`)

  // If options.fightingArtIds is present, add the entries to the survivor_fighting_art table after inserting the survivor and getting the survivor ID. This is necessary because fighting arts are stored in a junction table and require the survivor ID as a foreign key.
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

  return { ...data, embarked: false }
}
