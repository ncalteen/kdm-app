import { ColorChoice, MonsterNode, SurvivorType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { saveToLocalStorage } from '@/lib/utils'
import { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

/**
 * Link Level Survivor Statuses
 *
 * Resolves a list of survivor status names for a freshly inserted
 * `nemesis_level` or `quarry_level` row and inserts the corresponding
 * junction rows. Any status name that is not already present in the catalog
 * (non-custom) or owned by the user is created as a custom, user-owned
 * `survivor_status` row.
 *
 * Matching is case-insensitive and whitespace-trimmed; duplicates in the
 * input are collapsed.
 *
 * @param supabase Supabase Client
 * @param userId User ID (owner of any newly created custom statuses)
 * @param kind Parent level kind: `'nemesis'` or `'quarry'`
 * @param levelId Parent level row ID
 * @param names Desired survivor status names (may be empty)
 */
async function linkLevelSurvivorStatuses(
  supabase: SupabaseClient,
  userId: string,
  kind: 'nemesis' | 'quarry',
  levelId: string,
  names: string[]
): Promise<void> {
  // Normalise: trim, drop empties, dedupe case-insensitively.
  const seen = new Set<string>()
  const normalized: { raw: string; key: string }[] = []
  for (const n of names) {
    const trimmed = n?.trim() ?? ''
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push({ raw: trimmed, key })
  }
  if (normalized.length === 0) return

  // Look up existing rows visible to this user (non-custom or owned).
  const { data: existing, error: fetchError } = await supabase
    .from('survivor_status')
    .select('id, survivor_status_name, custom, user_id')
    .or(`custom.eq.false,and(custom.eq.true,user_id.eq.${userId})`)

  if (fetchError) throw fetchError

  const byKey = new Map<string, string>()
  for (const row of (existing ?? []) as {
    id: string
    survivor_status_name: string
  }[])
    byKey.set(row.survivor_status_name.trim().toLowerCase(), row.id)

  const statusIds: string[] = []
  for (const entry of normalized) {
    const existingId = byKey.get(entry.key)
    if (existingId) {
      statusIds.push(existingId)
      continue
    }
    const { data: inserted, error: insertError } = await supabase
      .from('survivor_status')
      .insert({
        custom: true,
        user_id: userId,
        survivor_status_name: entry.raw
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    byKey.set(entry.key, inserted.id)
    statusIds.push(inserted.id)
  }

  const junctionTable =
    kind === 'nemesis'
      ? 'nemesis_level_survivor_status'
      : 'quarry_level_survivor_status'
  const parentColumn =
    kind === 'nemesis' ? 'nemesis_level_id' : 'quarry_level_id'

  const { error: junctionError } = await supabase.from(junctionTable).insert(
    statusIds.map((statusId) => ({
      [parentColumn]: levelId,
      survivor_status_id: statusId
    }))
  )

  if (junctionError) throw junctionError
}

/**
 * Link Catalog Mood and Trait to a Nemesis Level or Quarry Level
 *
 * Inserts at most one mood and one trait into the appropriate
 * `*_level_mood` / `*_level_trait` junction tables for the given level id. Used
 * to exercise these junctions when seeding custom nemeses/quarries. Missing
 * catalog entries are skipped silently.
 *
 * @param supabase Supabase Client
 * @param kind Parent level kind: `'nemesis'` or `'quarry'`
 * @param levelId Parent level row ID
 */
async function linkLevelMoodAndTrait(
  supabase: SupabaseClient,
  kind: 'nemesis' | 'quarry',
  levelId: string
): Promise<void> {
  const levelColumn =
    kind === 'nemesis' ? 'nemesis_level_id' : 'quarry_level_id'
  const moodTable = `${kind}_level_mood`
  const traitTable = `${kind}_level_trait`

  const [moodRes, traitRes] = await Promise.all([
    supabase
      .from('mood')
      .select('id')
      .eq('custom', false)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('trait')
      .select('id')
      .eq('custom', false)
      .limit(1)
      .maybeSingle()
  ])

  if (moodRes.data?.id) {
    const { error } = await supabase
      .from(moodTable)
      .insert({ [levelColumn]: levelId, mood_id: moodRes.data.id })
    if (error) throw error
  }

  if (traitRes.data?.id) {
    const { error } = await supabase
      .from(traitTable)
      .insert({ [levelColumn]: levelId, trait_id: traitRes.data.id })
    if (error) throw error
  }
}

/**
 * Link Catalog Mood / Trait / Survivor Status to a Hunt or Showdown Monster
 *
 * Inserts at most one mood, one trait, and one survivor status into the
 * appropriate `*_monster_*` junction tables for the given monster id. Used to
 * exercise these junctions in seed data. Missing catalog entries are skipped.
 *
 * @param supabase Supabase Client
 * @param phase Either 'hunt' or 'showdown'
 * @param monsterId Hunt Monster ID or Showdown Monster ID
 */
async function linkMonsterCatalog(
  supabase: SupabaseClient,
  phase: 'hunt' | 'showdown',
  monsterId: string
): Promise<void> {
  const monsterColumn =
    phase === 'hunt' ? 'hunt_monster_id' : 'showdown_monster_id'
  const moodTable = `${phase}_monster_mood`
  const traitTable = `${phase}_monster_trait`
  const statusTable = `${phase}_monster_survivor_status`

  // Pick the first available non-custom mood/trait/status. Each lookup is
  // independent so partial coverage still produces partial linking.
  const [moodRes, traitRes, statusRes] = await Promise.all([
    supabase
      .from('mood')
      .select('id')
      .eq('custom', false)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('trait')
      .select('id')
      .eq('custom', false)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('survivor_status')
      .select('id')
      .eq('custom', false)
      .limit(1)
      .maybeSingle()
  ])

  if (moodRes.data?.id) {
    const { error } = await supabase
      .from(moodTable)
      .insert({ [monsterColumn]: monsterId, mood_id: moodRes.data.id })
    if (error) throw error
  }

  if (traitRes.data?.id) {
    const { error } = await supabase
      .from(traitTable)
      .insert({ [monsterColumn]: monsterId, trait_id: traitRes.data.id })
    if (error) throw error
  }

  if (statusRes.data?.id) {
    const { error } = await supabase.from(statusTable).insert({
      [monsterColumn]: monsterId,
      survivor_status_id: statusRes.data.id
    })
    if (error) throw error
  }
}

/**
 * Link Catalog Mood / Trait / Survivor Status to a Hunt Monster
 *
 * @param supabase Supabase Client
 * @param huntMonsterId Hunt Monster ID
 */
async function linkHuntMonsterCatalog(
  supabase: SupabaseClient,
  huntMonsterId: string
): Promise<void> {
  await linkMonsterCatalog(supabase, 'hunt', huntMonsterId)
}

/**
 * Link Catalog Mood / Trait / Survivor Status to a Showdown Monster
 *
 * @param supabase Supabase Client
 * @param showdownMonsterId Showdown Monster ID
 */
async function linkShowdownMonsterCatalog(
  supabase: SupabaseClient,
  showdownMonsterId: string
): Promise<void> {
  await linkMonsterCatalog(supabase, 'showdown', showdownMonsterId)
}

/**
 * Generate Seed Data
 *
 * Creates comprehensive test data including multiple settlements of each type
 * with survivors, hunts, showdowns, and settlement phases in various states.
 * This needs to be done as part of the application instead of a SQL script,
 * because the user must exist in the database before we can create the other
 * resources.
 *
 * @returns Resolves once seed data is created (or a toast is shown on error)
 */
export async function generateSeedData() {
  // Only generating seed data in development mode
  if (process.env.NODE_ENV !== 'development')
    return toast.error('Development Mode Only')

  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  // Throw any authentication errors
  if (error) {
    console.error('Error Fetching User:', error)
    throw error
  }

  // Only allow authenticated users with user_settings.app_role = 'admin'
  // if (!data.user || userSettings?.app_role !== 'admin')
  //   return toast.error('Unauthorized')

  // Delete all existing resources for the user to start with a clean slate
  await deleteUserData(supabase, data.user.id)

  for (let i = 1; i < 11; i++) {
    const campaignType =
      i === 1 || i === 2
        ? 'PEOPLE_OF_THE_LANTERN'
        : i === 3 || i === 4
          ? 'PEOPLE_OF_THE_SUN'
          : i === 5 || i === 6
            ? 'PEOPLE_OF_THE_STARS'
            : i === 7 || i === 8
              ? 'PEOPLE_OF_THE_DREAM_KEEPER'
              : 'SQUIRES_OF_THE_CITADEL'

    const usesScouts = i % 2 === 0

    console.log(
      `Creating Settlement ${i} (${campaignType} | ${usesScouts ? 'Scouts' : 'No Scouts'})...`
    )

    // Create settlement
    const settlement = await createSettlement(
      supabase,
      data.user.id,
      campaignType,
      i
    )

    // Add survivors to the settlement
    await createSurvivorsForSettlement(
      supabase,
      data.user.id,
      settlement.id,
      settlement.survivor_type,
      settlement.philosophies
    )

    // Add hunt to some settlements
    if (i % 3 === 0) await createHunt(supabase, settlement.id, usesScouts)

    // Add showdown to some settlements (different ones than the hunts)
    if (i % 3 === 1) await createShowdown(supabase, settlement.id, usesScouts)

    // Add settlement phases to some settlements (different ones than the hunts
    // and showdowns)
    if (i % 3 === 2)
      await createSettlementPhase(supabase, settlement.id, usesScouts)
  }

  // Create the custom quarries and nemeses
  await createCustomNemeses(supabase, data.user.id)
  await createCustomQuarries(supabase, data.user.id)

  // Seed a custom armor set so the slot/junction tables are exercised.
  await createCustomArmorSets(supabase, data.user.id)

  // Create local object
  const local = {
    selectedHuntId: null,
    selectedHuntMonsterIndex: 0,
    selectedSettlementId: null,
    selectedSettlementPhaseId: null,
    selectedShowdownId: null,
    selectedShowdownMonsterIndex: 0,
    selectedSurvivorId: null,
    selectedTab: null
  }

  // Save to localStorage
  saveToLocalStorage(local)

  toast.success('Seed Data Generated Successfully')
}

/**
 * Delete User Data
 *
 * Deletes ALL user data! Use with caution.
 *
 * @param supabase Supabase Client
 * @param userId User ID
 */
async function deleteUserData(supabase: SupabaseClient, userId: string) {
  console.log(`Deleting Data for User ${userId}...`)

  for (const table of [
    'wanderer',
    'neurosis',
    'disorder',
    'fighting_art',
    'character',
    'philosophy',
    'knowledge',
    'strain_milestone',
    'location',
    'collective_cognition_reward',
    'gear',
    'innovation',
    'pattern',
    'milestone',
    'principle',
    'resource',
    'nemesis',
    'weapon_type',
    'quarry',
    'armor_set',
    'constellation',
    'mood',
    'trait',
    'ability_impairment',
    'survivor_status'
  ]) {
    console.log(`Deleting From ${table}...`)

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId)
      .eq('custom', true)

    if (error) throw error
  }

  // Settlements need to be deleted separately because there is no 'custom'
  // column in the table.
  console.log('Deleting From settlement...')

  const { error } = await supabase
    .from('settlement')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Add Settlement Arc Items
 *
 * - Philosophies
 * - Knowledges
 * - Collective Cognition Rewards
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 * @returns Array of Philosophies Added to the Settlement Arc
 */
async function addSettlementArc(
  supabase: SupabaseClient,
  settlementId: string
): Promise<{ id: string; philosophy_name: string }[]> {
  console.log(`Adding Arc Items for Settlement ${settlementId}...`)

  const { data: allPhilosophies, error: getPhilosophiesError } = await supabase
    .from('philosophy')
    .select('id, philosophy_name')

  if (getPhilosophiesError) throw getPhilosophiesError

  // Pick 4 philosophies at random
  const philosophies = allPhilosophies
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)

  for (const philosophy of philosophies) {
    const { error } = await supabase.from('settlement_philosophy').insert({
      settlement_id: settlementId,
      philosophy_id: philosophy.id
    })

    if (error) throw error
  }

  // Pick 12 knowledges from the associated philosophies
  const { data: allKnowledges, error: getKnowledgesError } = await supabase
    .from('knowledge')
    .select('id, knowledge_name, philosophy_id')
    .in(
      'philosophy_id',
      philosophies.map((p) => p.id)
    )

  if (getKnowledgesError) throw getKnowledgesError

  const knowledges = allKnowledges.sort(() => Math.random() - 0.5).slice(0, 12)

  for (const knowledge of knowledges) {
    const { error } = await supabase.from('settlement_knowledge').insert({
      settlement_id: settlementId,
      knowledge_id: knowledge.id
    })

    if (error) throw error
  }

  // Add collective cognition rewards
  const {
    data: allCollectiveCognitionRewards,
    error: getCollectiveCognitionRewardsError
  } = await supabase.from('collective_cognition_reward').select('id')

  if (getCollectiveCognitionRewardsError)
    throw getCollectiveCognitionRewardsError

  const collectiveCognitionRewards = allCollectiveCognitionRewards
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)

  for (const reward of collectiveCognitionRewards) {
    const { error } = await supabase
      .from('settlement_collective_cognition_reward')
      .insert({
        settlement_id: settlementId,
        collective_cognition_reward_id: reward.id,
        unlocked: Math.random() < 0.5
      })

    if (error) throw error
  }

  return philosophies
}

/**
 * Add Settlement Locations and Gear
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 */
async function addSettlementLocationsAndGear(
  supabase: SupabaseClient,
  settlementId: string
) {
  console.log(`Adding Locations and Gear for Settlement ${settlementId}...`)

  // Add 10 random locations
  const { data: allLocations, error: getLocationsError } = await supabase
    .from('location')
    .select('id, location_name')

  if (getLocationsError) throw getLocationsError

  const locations = allLocations.sort(() => Math.random() - 0.5).slice(0, 10)

  for (const location of locations) {
    const { error: createSettlementLocationError } = await supabase
      .from('settlement_location')
      .insert({
        settlement_id: settlementId,
        location_id: location.id,
        unlocked: Math.random() < 0.5
      })

    if (createSettlementLocationError) throw createSettlementLocationError

    // Add 5 random gear items from each location (if the location has gear)
    const { data: allLocationGear, error: getLocationGearError } =
      await supabase.from('gear').select('id').eq('location_id', location.id)

    if (getLocationGearError) throw getLocationGearError

    const locationGear = allLocationGear
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)

    for (const gear of locationGear) {
      const { error: createSettlementGearError } = await supabase
        .from('settlement_gear')
        .insert({
          settlement_id: settlementId,
          gear_id: gear.id,
          quantity: 1
        })

      if (createSettlementGearError) throw createSettlementGearError
    }
  }
}

/**
 * Add Non-Location Settlement Gear
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 */
async function addSettlementGear(
  supabase: SupabaseClient,
  settlementId: string
) {
  console.log(`Adding Non-Location Gear for Settlement ${settlementId}...`)

  // Add 10 gear items not associated with a location
  const { data: allGear, error: getGearError } = await supabase
    .from('gear')
    .select('id')
    .is('location_id', null)

  if (getGearError) throw getGearError

  const gear = allGear.sort(() => Math.random() - 0.5).slice(0, 10)

  for (const gearItem of gear) {
    const { error: createSettlementGearError } = await supabase
      .from('settlement_gear')
      .insert({
        settlement_id: settlementId,
        gear_id: gearItem.id,
        quantity: 1
      })

    if (createSettlementGearError) throw createSettlementGearError
  }
}

/**
 * Add Settlement Innovations
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 */
async function addSettlementInnovations(
  supabase: SupabaseClient,
  settlementId: string
) {
  console.log(`Adding Innovations for Settlement ${settlementId}...`)

  const { data: allInnovations, error: getInnovationsError } = await supabase
    .from('innovation')
    .select('id, innovation_name')

  if (getInnovationsError) throw getInnovationsError

  const innovations = allInnovations
    .sort(() => Math.random() - 0.5)
    .slice(0, 15)

  for (const innovation of innovations) {
    const { error: createSettlementInnovationError } = await supabase
      .from('settlement_innovation')
      .insert({
        settlement_id: settlementId,
        innovation_id: innovation.id
      })

    if (createSettlementInnovationError) throw createSettlementInnovationError
  }
}

/**
 * Add Settlement Patterns
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 */
async function addSettlementPatterns(
  supabase: SupabaseClient,
  settlementId: string
) {
  console.log(`Adding Patterns for Settlement ${settlementId}...`)

  const { data: allPatterns, error: getPatternsError } = await supabase
    .from('pattern')
    .select('id, pattern_name')

  if (getPatternsError) throw getPatternsError

  const patterns = allPatterns.sort(() => Math.random() - 0.5).slice(0, 20)

  for (const pattern of patterns) {
    const { error: createSettlementPatternError } = await supabase
      .from('settlement_pattern')
      .insert({
        settlement_id: settlementId,
        pattern_id: pattern.id
      })

    if (createSettlementPatternError) throw createSettlementPatternError
  }
}

/**
 * Add Settlement Milestones
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 * @param campaignType Campaign Type
 */
async function addSettlementMilestones(
  supabase: SupabaseClient,
  settlementId: string,
  campaignType:
    | 'PEOPLE_OF_THE_LANTERN'
    | 'PEOPLE_OF_THE_SUN'
    | 'PEOPLE_OF_THE_STARS'
    | 'PEOPLE_OF_THE_DREAM_KEEPER'
    | 'SQUIRES_OF_THE_CITADEL'
) {
  console.log(`Adding Milestones for Settlement ${settlementId}...`)

  // Add all milestones where campaign_types is empty (universal) or includes
  // this campaign type.
  const { data: milestones, error: getMilestonesError } = await supabase
    .from('milestone')
    .select('id')
    .or(`campaign_types.eq.{},campaign_types.cs.{${campaignType}}`)

  if (getMilestonesError) throw getMilestonesError

  for (const milestone of milestones) {
    const { error: createSettlementMilestoneError } = await supabase
      .from('settlement_milestone')
      .insert({
        settlement_id: settlementId,
        milestone_id: milestone.id,
        complete: Math.random() < 0.5
      })

    if (createSettlementMilestoneError) throw createSettlementMilestoneError
  }
}

/**
 * Add Settlement Principles
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 * @param campaignType Campaign Type
 */
async function addSettlementPrinciples(
  supabase: SupabaseClient,
  settlementId: string,
  campaignType:
    | 'PEOPLE_OF_THE_LANTERN'
    | 'PEOPLE_OF_THE_SUN'
    | 'PEOPLE_OF_THE_STARS'
    | 'PEOPLE_OF_THE_DREAM_KEEPER'
    | 'SQUIRES_OF_THE_CITADEL'
) {
  console.log(`Adding Principles for Settlement ${settlementId}...`)

  // Add all principles where campaign_types is empty (universal) or includes
  // this campaign type.
  const { data: principles, error: getPrinciplesError } = await supabase
    .from('principle')
    .select('id')
    .or(`campaign_types.eq.{},campaign_types.cs.{${campaignType}}`)

  if (getPrinciplesError) throw getPrinciplesError

  for (const principle of principles) {
    const option1Selected = Math.random() < 0.5

    const { error: createSettlementPrincipleError } = await supabase
      .from('settlement_principle')
      .insert({
        settlement_id: settlementId,
        principle_id: principle.id,
        option_1_selected: option1Selected,
        option_2_selected: !option1Selected
      })

    if (createSettlementPrincipleError) throw createSettlementPrincipleError
  }
}

/**
 * Add Settlement Resources
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 */
async function addSettlementResources(
  supabase: SupabaseClient,
  settlementId: string
) {
  console.log(`Adding Resources for Settlement ${settlementId}...`)

  const { data: allResources, error: getResourceError } = await supabase
    .from('resource')
    .select('id')

  if (getResourceError) throw getResourceError

  const resources = allResources.sort(() => Math.random() - 0.5).slice(0, 15)

  for (const resource of resources) {
    const { error: createSettlementResourceError } = await supabase
      .from('settlement_resource')
      .insert({
        settlement_id: settlementId,
        resource_id: resource.id,
        quantity: Math.floor(Math.random() * 20) + 1
      })

    if (createSettlementResourceError) throw createSettlementResourceError
  }
}

/**
 * Add Settlement Nemeses
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 */
async function addSettlementNemeses(
  supabase: SupabaseClient,
  settlementId: string
) {
  console.log(`Adding Nemeses for Settlement ${settlementId}...`)

  // Add a random nemesis from each node
  const nodes = ['NN1', 'NN2', 'NN3', 'CO', 'FI']

  for (const node of nodes) {
    const { data: allNemeses, error: getNemesisError } = await supabase
      .from('nemesis')
      .select('id')
      .eq('node', node)

    if (getNemesisError) throw getNemesisError

    // Best-effort dev tooling: if the catalog has no nemesis for this node
    // (typically because the DB was reset with `--no-seed`), log and skip
    // rather than crashing the whole seed run on `undefined.id`.
    const nemesis = (allNemeses ?? []).sort(() => Math.random() - 0.5)[0]
    if (!nemesis) {
      console.warn(
        `addSettlementNemeses: no nemesis catalog row found for node ${node}; skipping. ` +
          `Run \`npx supabase db reset\` (without --no-seed) to repopulate.`
      )
      continue
    }

    const { error: createSettlementNemesisError } = await supabase
      .from('settlement_nemesis')
      .insert({
        collective_cognition_level_1: false,
        collective_cognition_level_2: false,
        collective_cognition_level_3: false,
        level_1_defeated: false,
        level_2_defeated: false,
        level_3_defeated: false,
        level_4_defeated: false,
        nemesis_id: nemesis.id,
        settlement_id: settlementId,
        unlocked: false
      })

    if (createSettlementNemesisError) throw createSettlementNemesisError
  }
}

/**
 * Add Settlement Quarries
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 */
async function addSettlementQuarries(
  supabase: SupabaseClient,
  settlementId: string
) {
  console.log(`Adding Quarries for Settlement ${settlementId}...`)

  // Add a random quarry from each node
  const nodes = ['NQ1', 'NQ2', 'NQ3', 'NQ4']

  for (const node of nodes) {
    const { data: allQuarries, error: getQuarryError } = await supabase
      .from('quarry')
      .select('id')
      .eq('node', node)

    if (getQuarryError) throw getQuarryError

    // Best-effort dev tooling: skip-and-warn if the catalog is empty for
    // this node so the rest of the seed run still completes.
    const quarry = (allQuarries ?? []).sort(() => Math.random() - 0.5)[0]
    if (!quarry) {
      console.warn(
        `addSettlementQuarries: no quarry catalog row found for node ${node}; skipping. ` +
          `Run \`npx supabase db reset\` (without --no-seed) to repopulate.`
      )
      continue
    }

    const { error: createSettlementQuarryError } = await supabase
      .from('settlement_quarry')
      .insert({
        collective_cognition_level_1: false,
        collective_cognition_level_2: [false, false],
        collective_cognition_level_3: [false, false, false],
        collective_cognition_prologue: false,
        quarry_id: quarry.id,
        settlement_id: settlementId,
        unlocked: false
      })

    if (createSettlementQuarryError) throw createSettlementQuarryError
  }
}

/**
 * Add Settlement Timeline Entries
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 * @param variant Variant Number
 */
async function addSettlementTimelineEntries(
  supabase: SupabaseClient,
  settlementId: string,
  variant: number
) {
  console.log(`Adding Timeline Entries for Settlement ${settlementId}...`)

  for (let year = 0; year <= 40; year++) {
    const { error: createTimelineYearError } = await supabase
      .from('settlement_timeline_year')
      .insert({
        completed: Math.random() < 0.5,
        entries:
          variant === 1
            ? []
            : variant === 2
              ? [`Timeline entry for year ${year}`]
              : [
                  `Timeline entry for year ${year}`,
                  `Another timeline entry for year ${year}`
                ],
        settlement_id: settlementId,
        year_number: year
      })

    if (createTimelineYearError) throw createTimelineYearError
  }
}

/**
 * Create Randomized Settlement for Testing
 *
 * @param supabase Supabase Client
 * @param userId User ID
 * @param campaignType Campaign Type
 * @param variant Variant Number
 * @returns Settlement
 */
async function createSettlement(
  supabase: SupabaseClient,
  userId: string,
  campaignType:
    | 'PEOPLE_OF_THE_LANTERN'
    | 'PEOPLE_OF_THE_SUN'
    | 'PEOPLE_OF_THE_STARS'
    | 'PEOPLE_OF_THE_DREAM_KEEPER'
    | 'SQUIRES_OF_THE_CITADEL',
  variant: number
): Promise<{
  id: string
  survivor_type: SurvivorType
  philosophies: { id: string; philosophy_name: string }[]
}> {
  const survivorType = Math.random() < 0.5 ? 'CORE' : 'ARC'

  const { data: settlement, error: createSettlementError } = await supabase
    .from('settlement')
    .insert({
      user_id: userId,
      arrival_bonuses:
        variant === 1
          ? []
          : variant === 2
            ? ['+1 Survival']
            : ['+1 Survival', '+2 Insanity'],
      campaign_type: campaignType,
      current_year: variant === 1 ? 0 : variant === 2 ? 6 : 12,
      departing_bonuses:
        variant === 1
          ? []
          : variant === 2
            ? ['+3 Insanity']
            : ['+3 Insanity', '+1 Understanding'],
      notes:
        variant === 1 ? 'Early Game' : variant === 2 ? 'Mid Game' : 'Late Game',
      settlement_name: `PotL ${variant}`,
      survival_limit: variant * 2,
      survivor_type: survivorType,
      uses_scouts: variant === 1 ? false : variant === 2 ? true : false,
      lantern_research: variant === 1 ? 0 : variant === 2 ? 1 : 2,
      monster_volumes:
        variant === 1
          ? []
          : variant === 2
            ? ['White Lion']
            : ['Screaming Antelope']
    })
    .select('id, survivor_type')
    .single()

  if (createSettlementError) throw createSettlementError

  // If this is an Arc settlement, add philosophies and knowledges.
  const updatedSettlement = {
    ...settlement,
    philosophies:
      survivorType === 'ARC'
        ? await addSettlementArc(supabase, settlement.id)
        : []
  }

  // Add locations and gear
  await addSettlementLocationsAndGear(supabase, updatedSettlement.id)

  // Add non-location settlement gear
  await addSettlementGear(supabase, updatedSettlement.id)

  // Add innovations
  await addSettlementInnovations(supabase, updatedSettlement.id)

  // Add patterns
  await addSettlementPatterns(supabase, updatedSettlement.id)

  // Add milestones
  await addSettlementMilestones(supabase, updatedSettlement.id, campaignType)

  // Add principles
  await addSettlementPrinciples(supabase, updatedSettlement.id, campaignType)

  // Add resources
  await addSettlementResources(supabase, updatedSettlement.id)

  // Add nemeses
  await addSettlementNemeses(supabase, updatedSettlement.id)

  // Add quarries
  await addSettlementQuarries(supabase, updatedSettlement.id)

  // Link a representative seed pattern to the settlement to exercise the
  // settlement_seed_pattern junction.
  const { data: seedPattern } = await supabase
    .from('seed_pattern')
    .select('id')
    .eq('custom', false)
    .limit(1)
    .maybeSingle()

  if (seedPattern?.id) {
    const { error: linkSeedPatternError } = await supabase
      .from('settlement_seed_pattern')
      .insert({
        settlement_id: updatedSettlement.id,
        seed_pattern_id: seedPattern.id
      })

    if (linkSeedPatternError) throw linkSeedPatternError
  }

  // Add timeline entries
  await addSettlementTimelineEntries(supabase, updatedSettlement.id, variant)

  return updatedSettlement
}

/**
 * Create Survivors for Settlement
 *
 * @param supabase Supabase Client
 * @param userId User ID (owner of the settlement)
 * @param settlementId Settlement ID
 * @param survivorType Survivor Type
 * @param philosophies Settlement Philosophies
 * @returns Array of Survivors
 */
async function createSurvivorsForSettlement(
  supabase: SupabaseClient,
  userId: string,
  settlementId: string,
  survivorType: SurvivorType,
  philosophies: { id: string; philosophy_name: string }[]
): Promise<void> {
  const names = [
    'Theron',
    'Lyra',
    'Kael',
    'Myra',
    'Drake',
    'Sable',
    'Finn',
    'Nova',
    'Rex',
    'Zara',
    'Ash',
    'Luna',
    'Orion',
    'Jade',
    'Raven',
    'Storm',
    'Phoenix',
    'Echo',
    'Atlas',
    'Sage',
    'Ember',
    'Blaze',
    'Vex',
    'Nyx',
    'Zephyr',
    'Onyx',
    'Cypher',
    'Sol'
  ]

  const { data: weaponTypes, error: getWeaponTypesError } = await supabase
    .from('weapon_type')
    .select('id, weapon_type_name')

  if (getWeaponTypesError) throw getWeaponTypesError

  // Track every survivor we create so we can wire up family lineage and a
  // sample gear grid after the full roster exists.
  const createdSurvivors: { id: string; isExperienced: boolean }[] = []

  for (let i = 0; i < 20; i++) {
    const isExperienced = i % 3 === 0
    const hasInjuries = i % 4 === 0
    const isRetired = Math.random() < 0.1
    const isDead = Math.random() < 0.1

    console.log(`Creating Survivor ${i} for Settlement ${settlementId}...`)

    const { data: createSurvivorData, error: createSurvivorError } =
      await supabase
        .from('survivor')
        .insert({
          accuracy: isExperienced ? 2 : 0,
          arc: survivorType === SurvivorType.ARC,
          can_dash: isExperienced,
          can_dodge: true,
          can_fist_pump: false,
          can_encourage: isExperienced,
          can_spend_survival: true,
          can_surge: false,
          can_use_fighting_arts_knowledges: true,
          color: isExperienced ? ColorChoice.BLUE : ColorChoice.SLATE,
          courage: isExperienced ? 3 : 0,
          dead: isDead,
          evasion: isExperienced ? 1 : 0,

          gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          has_analyze: false,
          has_explore: isExperienced,
          has_matchmaker: false,
          has_prepared: isExperienced,
          has_stalwart: false,
          has_tinker: false,
          hunt_xp: isExperienced ? 8 : i % 16,
          hunt_xp_rank_up: isExperienced ? [2, 6] : [],
          insanity: isExperienced ? 3 : 0,
          luck: isExperienced ? 1 : 0,
          movement: 5,
          next_departure: isExperienced ? ['Next Departure Bonus'] : [],
          notes: isExperienced
            ? 'Veteran survivor with extensive experience'
            : isDead
              ? 'Fell in battle against overwhelming darkness'
              : isRetired
                ? 'Retired to support the settlement'
                : undefined,
          once_per_lifetime: isExperienced ? ['Once Per Lifetime Bonus'] : [],
          reroll_used: false,
          retired: isRetired,
          settlement_id: settlementId,
          skip_next_hunt: i % 7 === 0 && !isDead && !isRetired,
          speed: isExperienced ? 1 : 0,
          strength: isExperienced ? 2 : 0,
          survival: 1 + (isExperienced ? 2 : 0),
          survivor_name: names[i % names.length],
          understanding: isExperienced ? 2 : 0,
          wanderer: false,
          weapon_proficiency: isExperienced ? 5 : Math.min(i, 3),
          weapon_type_id: isExperienced
            ? i % 5 === 0
              ? weaponTypes.find((wt) => wt.weapon_type_name === 'SWORD')?.id
              : i % 5 === 1
                ? weaponTypes.find((wt) => wt.weapon_type_name === 'AXE')?.id
                : i % 5 === 2
                  ? weaponTypes.find((wt) => wt.weapon_type_name === 'SPEAR')
                      ?.id
                  : i % 5 === 3
                    ? weaponTypes.find((wt) => wt.weapon_type_name === 'BOW')
                        ?.id
                    : weaponTypes.find((wt) => wt.weapon_type_name === 'KATANA')
                        ?.id
            : undefined,
          arm_armor: 0,
          arm_light_damage: false,
          arm_heavy_damage: false,
          body_armor: 0,
          body_light_damage: false,
          body_heavy_damage: false,
          brain_light_damage: false,
          head_armor: 0,
          head_heavy_damage: false,
          leg_armor: 0,
          leg_light_damage: false,
          leg_heavy_damage: false,
          waist_armor: 0,
          waist_light_damage: false,
          waist_heavy_damage: false,
          arm_broken: hasInjuries ? 1 : 0,
          arm_contracture: hasInjuries ? 3 : 0,
          arm_dismembered: hasInjuries ? 1 : 0,
          arm_ruptured_muscle: false,
          body_broken_rib: hasInjuries ? 2 : 0,
          body_destroyed_back: false,
          body_gaping_chest_wound: hasInjuries ? 3 : 0,
          head_blind: hasInjuries ? 1 : 0,
          head_deaf: false,
          head_intracranial_hemorrhage: false,
          head_shattered_jaw: false,
          leg_broken: hasInjuries ? 1 : 0,
          leg_dismembered: 0,
          leg_hamstrung: false,
          waist_broken_hip: false,
          waist_destroyed_genitals: false,
          waist_intestinal_prolapse: false,
          waist_warped_pelvis: hasInjuries ? 3 : 0,
          can_endure: isExperienced,
          knowledge_1_id:
            isExperienced && survivorType === SurvivorType.ARC
              ? await supabase
                  .from('knowledge')
                  .select('id')
                  .eq('philosophy_id', philosophies[0].id)
                  .limit(1)
                  .maybeSingle()
                  .then((res) => res.data?.id)
              : undefined,
          knowledge_1_observation_conditions:
            isExperienced && survivorType === SurvivorType.ARC
              ? 'Observe during showdown'
              : undefined,
          knowledge_1_observation_rank:
            isExperienced && survivorType === SurvivorType.ARC ? 3 : 0,
          knowledge_1_rank_up:
            isExperienced && survivorType === SurvivorType.ARC ? 2 : undefined,
          knowledge_1_rules:
            isExperienced && survivorType === SurvivorType.ARC
              ? 'Understanding of anatomy'
              : undefined,
          knowledge_2_id:
            isExperienced && survivorType === SurvivorType.ARC
              ? await supabase
                  .from('knowledge')
                  .select('id')
                  .eq('philosophy_id', philosophies[0].id)
                  .limit(1)
                  .maybeSingle()
                  .then((res) => res.data?.id)
              : undefined,
          knowledge_2_observation_conditions:
            isExperienced && survivorType === SurvivorType.ARC
              ? 'Study texts'
              : undefined,
          knowledge_2_observation_rank:
            isExperienced && survivorType === SurvivorType.ARC ? 2 : 0,
          knowledge_2_rank_up:
            isExperienced && survivorType === SurvivorType.ARC ? 1 : undefined,
          knowledge_2_rules:
            isExperienced && survivorType === SurvivorType.ARC
              ? 'Philosophical insights'
              : undefined,
          lumi: isExperienced && survivorType === SurvivorType.ARC ? 5 : 0,
          neurosis_id:
            isExperienced && survivorType === SurvivorType.ARC
              ? await supabase
                  .from('philosophy')
                  .select('neurosis_id')
                  .eq('id', philosophies[0].id)
                  .maybeSingle()
                  .then((res) => res.data?.neurosis_id ?? undefined)
              : undefined,
          philosophy_id:
            isExperienced && survivorType === SurvivorType.ARC
              ? philosophies[0].id
              : null,
          philosophy_rank:
            isExperienced && survivorType === SurvivorType.ARC ? 2 : 0,
          systemic_pressure:
            isExperienced && survivorType === SurvivorType.ARC ? 2 : 0,
          tenet_knowledge_id:
            isExperienced && survivorType === SurvivorType.ARC
              ? await supabase
                  .from('knowledge')
                  .select('id')
                  .eq('philosophy_id', philosophies[0].id)
                  .limit(1)
                  .maybeSingle()
                  .then((res) => res.data?.id)
              : undefined,
          tenet_knowledge_observation_conditions:
            isExperienced && survivorType === SurvivorType.ARC
              ? 'During hunts'
              : undefined,
          tenet_knowledge_observation_rank:
            isExperienced && survivorType === SurvivorType.ARC ? 1 : 0,
          tenet_knowledge_rank_up:
            isExperienced && survivorType === SurvivorType.ARC ? 1 : undefined,
          tenet_knowledge_rules:
            isExperienced && survivorType === SurvivorType.ARC
              ? 'Insights into tenets'
              : undefined,
          torment: isExperienced && survivorType === SurvivorType.ARC ? 1 : 0,
          absolute_reaper: i % 2 === 0,
          absolute_rust: i % 3 === 0,
          absolute_storm: i % 4 === 0,
          absolute_witch: i % 5 === 0,
          gambler_reaper: i % 2 === 0,
          gambler_rust: i % 3 === 0,
          gambler_storm: i % 4 === 0,
          gambler_witch: i % 5 === 0,
          goblin_reaper: i % 2 === 0,
          goblin_rust: i % 3 === 0,
          goblin_storm: i % 4 === 0,
          goblin_witch: i % 5 === 0,
          sculptor_reaper: i % 2 === 0,
          sculptor_rust: i % 3 === 0,
          sculptor_storm: i % 4 === 0,
          sculptor_witch: i % 5 === 0
        })
        .select('id')
        .single()

    if (createSurvivorError) throw createSurvivorError

    createdSurvivors.push({ id: createSurvivorData.id, isExperienced })

    if (isExperienced) {
      // Add disorders, fighting arts, cursed gear, secret fighting arts, and an
      // ability/impairment for experienced survivors.
      await supabase.from('survivor_disorder').insert({
        survivor_id: createSurvivorData.id,
        disorder_id: (
          await supabase.from('disorder').select('id').limit(1).single()
        ).data?.id
      })

      await supabase.from('survivor_fighting_art').insert({
        survivor_id: createSurvivorData.id,
        fighting_art_id: (
          await supabase.from('fighting_art').select('id').limit(1).single()
        ).data?.id
      })

      await supabase.from('survivor_secret_fighting_art').insert({
        survivor_id: createSurvivorData.id,
        secret_fighting_art_id: (
          await supabase
            .from('secret_fighting_art')
            .select('id')
            .limit(1)
            .single()
        ).data?.id
      })

      await supabase.from('survivor_cursed_gear').insert({
        survivor_id: createSurvivorData.id,
        gear_id: (await supabase.from('gear').select('id').limit(1).single())
          .data?.id
      })

      // Link a representative ability/impairment so the
      // survivor_ability_impairment junction is exercised.
      const { data: abilityImpairment } = await supabase
        .from('ability_impairment')
        .select('id')
        .eq('custom', false)
        .limit(1)
        .maybeSingle()

      if (abilityImpairment?.id) {
        const { error: linkAbilityImpairmentError } = await supabase
          .from('survivor_ability_impairment')
          .insert({
            survivor_id: createSurvivorData.id,
            ability_impairment_id: abilityImpairment.id
          })

        if (linkAbilityImpairmentError) throw linkAbilityImpairmentError
      }
    }
  }

  // Establish lineage on a portion of the roster. Skip the first two survivors
  // so we always have parent candidates available, and keep assignments
  // deterministic so re-runs are reproducible.
  for (let i = 2; i < createdSurvivors.length; i++) {
    if (i % 4 !== 0) continue

    const child = createdSurvivors[i]
    // Pick two distinct earlier survivors as parents.
    const parent1 = createdSurvivors[i - 1]
    const parent2 = createdSurvivors[i - 2]
    if (!parent1 || !parent2 || parent1.id === parent2.id) continue

    const { error: linkParentsError } = await supabase
      .from('survivor')
      .update({
        parent_1_id: parent1.id,
        parent_2_id: parent2.id
      })
      .eq('id', child.id)

    if (linkParentsError) throw linkParentsError
  }

  // Build a sample gear_grid for the first experienced survivor using gear
  // already in the settlement's storage. Equipping items the settlement doesn't
  // own would fail the validate_gear_grid_positions trigger.
  const gridSurvivor = createdSurvivors.find((s) => s.isExperienced)

  if (gridSurvivor) {
    const { data: settlementGear, error: settlementGearError } = await supabase
      .from('settlement_gear')
      .select('gear_id, quantity')
      .eq('settlement_id', settlementId)
      .gt('quantity', 0)
      .limit(9)

    if (settlementGearError) throw settlementGearError

    const gearIds = (settlementGear ?? []).map((g) => g.gear_id)

    const slot = (idx: number): string | null => gearIds[idx] ?? null

    const { error: createGearGridError } = await supabase
      .from('gear_grid')
      .insert({
        survivor_id: gridSurvivor.id,
        pos_top_left: slot(0),
        pos_top_center: slot(1),
        pos_top_right: slot(2),
        pos_mid_left: slot(3),
        pos_mid_center: slot(4),
        pos_mid_right: slot(5),
        pos_bottom_left: slot(6),
        pos_bottom_center: slot(7),
        pos_bottom_right: slot(8)
      })

    if (createGearGridError) throw createGearGridError
  }
}

/**
 * Create Hunt
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 * @param usesScouts Whether Scouts are Used
 */
async function createHunt(
  supabase: SupabaseClient,
  settlementId: string,
  usesScouts: boolean
): Promise<void> {
  console.log(`Creating Hunt for Settlement ${settlementId}...`)

  // Get 5 random survivor IDs from the settlement
  const { data: allHuntSurvivors, error: getSurvivorsError } = await supabase
    .from('survivor')
    .select('id')
    .eq('settlement_id', settlementId)

  if (getSurvivorsError) throw getSurvivorsError

  const survivors = allHuntSurvivors
    .sort(() => Math.random() - 0.5)
    .slice(0, usesScouts ? 5 : 4)

  // Create the hunt
  const { data: hunt, error: createHuntError } = await supabase
    .from('hunt')
    .insert({
      monster_level: 1,
      monster_position: 8,
      settlement_id: settlementId,
      survivor_position: 0
    })
    .select('id')
    .single()

  if (createHuntError) throw createHuntError

  // Create the hunt board
  const { error: createHuntBoardError } = await supabase
    .from('hunt_hunt_board')
    .insert({
      pos_1: Math.random() < 0.5 ? 'BASIC' : 'MONSTER',
      pos_2: Math.random() < 0.5 ? 'BASIC' : 'MONSTER',
      pos_3: Math.random() < 0.5 ? 'BASIC' : 'MONSTER',
      pos_4: Math.random() < 0.5 ? 'BASIC' : 'MONSTER',
      pos_5: Math.random() < 0.5 ? 'BASIC' : 'MONSTER',
      pos_7: Math.random() < 0.5 ? 'BASIC' : 'MONSTER',
      pos_8: Math.random() < 0.5 ? 'BASIC' : 'MONSTER',
      pos_9: Math.random() < 0.5 ? 'BASIC' : 'MONSTER',
      pos_10: Math.random() < 0.5 ? 'BASIC' : 'MONSTER',
      pos_11: Math.random() < 0.5 ? 'BASIC' : 'MONSTER',
      hunt_id: hunt.id,
      settlement_id: settlementId
    })

  if (createHuntBoardError) throw createHuntBoardError

  // Create the hunt monster and its AI deck.
  // Some hunts will have multiple monsters with separate decks.
  const monsterCount = Math.random() < 0.5 ? 1 : 3

  for (let i = 0; i < monsterCount; i++) {
    const { data: huntAIDeck, error: createHuntAIDeckError } = await supabase
      .from('hunt_ai_deck')
      .insert({
        basic_cards: 10,
        advanced_cards: 5,
        legendary_cards: 2,
        overtone_cards: 0,
        hunt_id: hunt.id,
        settlement_id: settlementId
      })
      .select('id')
      .single()

    if (createHuntAIDeckError) throw createHuntAIDeckError

    const { data: huntMonster, error: createHuntMonsterError } = await supabase
      .from('hunt_monster')
      .insert({
        accuracy: 1,
        accuracy_tokens: 0,
        ai_deck_id: huntAIDeck.id,
        damage: 2,
        damage_tokens: 0,
        evasion: 0,
        evasion_tokens: 0,
        hunt_id: hunt.id,
        knocked_down: false,
        luck: 0,
        luck_tokens: 0,
        monster_name: `Monster ${i + 1}`,
        movement: 6,
        movement_tokens: 0,
        notes: `Monster ${i + 1} ready for battle`,
        settlement_id: settlementId,
        speed: 2,
        speed_tokens: 0,
        strength: 0,
        strength_tokens: 0,
        toughness: 8,
        wounds: 0
      })
      .select('id')
      .single()

    if (createHuntMonsterError) throw createHuntMonsterError

    // Link a representative mood, trait, and survivor status to the hunt
    // monster so the *_monster_* junctions get exercised. Failures here are
    // ignored if no catalog entries exist yet.
    await linkHuntMonsterCatalog(supabase, huntMonster.id)
  }

  // Create the hunt survivors. If the settlement uses scouts, one survivor will
  // be the scout.
  for (let i = 0; i < survivors.length; i++) {
    const { error: createHuntSurvivorError } = await supabase
      .from('hunt_survivor')
      .insert({
        accuracy_tokens: 0,
        evasion_tokens: 0,
        hunt_id: hunt.id,
        insanity_tokens: 0,
        luck_tokens: 0,
        movement_tokens: 0,
        notes: `Survivor ${survivors[i].id} ready for battle`,
        scout: usesScouts && i === survivors.length - 1,
        settlement_id: settlementId,
        speed_tokens: 0,
        strength_tokens: 0,
        survival_tokens: 0,
        survivor_id: survivors[i].id
      })

    if (createHuntSurvivorError) throw createHuntSurvivorError
  }
}

/**
 * Create Showdown
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 * @param usesScouts Whether Scouts are used
 */
async function createShowdown(
  supabase: SupabaseClient,
  settlementId: string,
  usesScouts: boolean
): Promise<void> {
  console.log(`Creating Showdown for Settlement ${settlementId}...`)

  // Get 5 random survivor IDs from the settlement
  const { data: allShowdownSurvivors, error: getSurvivorsError } =
    await supabase
      .from('survivor')
      .select('id')
      .eq('settlement_id', settlementId)

  if (getSurvivorsError) throw getSurvivorsError

  const survivors = allShowdownSurvivors
    .sort(() => Math.random() - 0.5)
    .slice(0, usesScouts ? 5 : 4)

  // Create the showdown
  const { data: showdown, error: createShowdownError } = await supabase
    .from('showdown')
    .insert({
      ambush: Math.random() < 0.5 ? 'SURVIVORS' : 'NONE',
      monster_level: 1,
      settlement_id: settlementId,
      showdown_type: Math.random() < 0.5 ? 'REGULAR' : 'SPECIAL',
      turn: 'MONSTER'
    })
    .select('id')
    .single()

  if (createShowdownError) throw createShowdownError

  // Create the showdown monster and its AI deck.
  // Some showdowns will have multiple monsters with separate decks.
  const monsterCount = Math.random() < 0.5 ? 1 : 3

  for (let i = 0; i < monsterCount; i++) {
    const { data: showdownAIDeck, error: createShowdownAIDeckError } =
      await supabase
        .from('showdown_ai_deck')
        .insert({
          basic_cards: 10,
          advanced_cards: 5,
          legendary_cards: 2,
          overtone_cards: 0,
          settlement_id: settlementId,
          showdown_id: showdown.id
        })
        .select('id')
        .single()

    if (createShowdownAIDeckError) throw createShowdownAIDeckError

    const { data: showdownMonster, error: createShowdownMonsterError } =
      await supabase
        .from('showdown_monster')
        .insert({
          accuracy: 1,
          accuracy_tokens: 0,
          ai_card_drawn: false,
          ai_deck_id: showdownAIDeck.id,
          ai_deck_remaining: 17,
          damage: 2,
          damage_tokens: 0,
          evasion: 0,
          evasion_tokens: 0,
          knocked_down: false,
          luck: 0,
          luck_tokens: 0,
          monster_name: `Monster ${i + 1}`,
          movement: 6,
          movement_tokens: 0,
          notes: `Monster ${i + 1} ready for battle`,
          settlement_id: settlementId,
          showdown_id: showdown.id,
          speed: 2,
          speed_tokens: 0,
          strength: 0,
          strength_tokens: 0,
          toughness: 8,
          wounds: 0
        })
        .select('id')
        .single()

    if (createShowdownMonsterError) throw createShowdownMonsterError

    // Link a representative mood, trait, and survivor status to the showdown
    // monster so the *_monster_* junctions get exercised.
    await linkShowdownMonsterCatalog(supabase, showdownMonster.id)
  }

  // Create the showdown survivors. If the settlement uses scouts, one survivor
  // will be the scout.
  for (let i = 0; i < survivors.length; i++) {
    const { error: createShowdownSurvivorError } = await supabase
      .from('showdown_survivor')
      .insert({
        activation_used: false,
        accuracy_tokens: 0,
        bleeding_tokens: 0,
        block_tokens: 0,
        deflect_tokens: 0,
        evasion_tokens: 0,
        insanity_tokens: 0,
        knocked_down: false,
        luck_tokens: 0,
        movement_tokens: 0,
        movement_used: false,
        notes: `Survivor ${survivors[i].id} ready for battle`,
        priority_target: Math.random() < 0.01,
        scout: usesScouts && i === survivors.length - 1,
        settlement_id: settlementId,
        showdown_id: showdown.id,
        speed_tokens: 0,
        strength_tokens: 0,
        survival_tokens: 0,
        survivor_id: survivors[i].id
      })

    if (createShowdownSurvivorError) throw createShowdownSurvivorError
  }
}

/**
 * Create Custom Nemeses
 *
 * Creates sample custom nemeses for testing.
 *
 * @param supabase Supabase Client
 * @param userId User ID
 */
async function createCustomNemeses(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  console.log(`Creating Custom Nemeses for User ${userId}...`)

  // Custom Nemesis: Shadow Weaver (single monster, 3 levels)
  const { data: shadowWeaver, error: createShadowWeaverError } = await supabase
    .from('nemesis')
    .insert({
      custom: true,
      user_id: userId,
      alternate_id: null,
      monster_name: 'Shadow Weaver',
      multi_monster: false,
      node: MonsterNode.NN1,
      vignette_id: null
    })
    .select('id')
    .single()

  if (createShadowWeaverError) throw createShadowWeaverError

  const { data: shadowWeaverLocation, error: createShadowWeaverLocationError } =
    await supabase
      .from('location')
      .insert({
        custom: true,
        user_id: userId,
        location_name: 'Shadow Loom'
      })
      .select('id')
      .single()

  if (createShadowWeaverLocationError) throw createShadowWeaverLocationError

  const { error: createShadowWeaverNemesisLocationError } = await supabase
    .from('nemesis_location')
    .insert({
      location_id: shadowWeaverLocation.id,
      nemesis_id: shadowWeaver.id
    })

  if (createShadowWeaverNemesisLocationError)
    throw createShadowWeaverNemesisLocationError

  const { data: shadowWeaverLevel1, error: createShadowWeaverLevel1Error } =
    await supabase
      .from('nemesis_level')
      .insert({
        ai_deck_remaining: 8,
        basic_cards: 5,
        advanced_cards: 3,
        legendary_cards: 0,
        overtone_cards: 0,
        accuracy: 1,
        accuracy_tokens: 0,
        damage: 2,
        damage_tokens: 0,
        evasion: 0,
        evasion_tokens: 0,
        level_number: 1,
        life: 10,
        luck: 0,
        luck_tokens: 0,
        movement: 6,
        movement_tokens: 0,
        nemesis_id: shadowWeaver.id,
        sub_monster_name: null,
        speed: 2,
        speed_tokens: 0,
        strength: 0,
        strength_tokens: 0,
        toughness: 8,
        toughness_tokens: 0
      })
      .select('id')
      .single()

  if (createShadowWeaverLevel1Error) throw createShadowWeaverLevel1Error

  await linkLevelSurvivorStatuses(
    supabase,
    userId,
    'nemesis',
    shadowWeaverLevel1.id,
    ['Darkness']
  )

  await linkLevelMoodAndTrait(supabase, 'nemesis', shadowWeaverLevel1.id)

  const { data: shadowWeaverLevel2, error: createShadowWeaverLevel2Error } =
    await supabase
      .from('nemesis_level')
      .insert({
        ai_deck_remaining: 10,
        basic_cards: 4,
        advanced_cards: 4,
        legendary_cards: 2,
        overtone_cards: 0,
        accuracy: 2,
        accuracy_tokens: 0,
        damage: 3,
        damage_tokens: 0,
        evasion: 1,
        evasion_tokens: 0,
        level_number: 2,
        life: 15,
        luck: 0,
        luck_tokens: 0,
        movement: 7,
        movement_tokens: 0,
        nemesis_id: shadowWeaver.id,
        sub_monster_name: null,
        speed: 3,
        speed_tokens: 0,
        strength: 1,
        strength_tokens: 0,
        toughness: 10,
        toughness_tokens: 0
      })
      .select('id')
      .single()

  if (createShadowWeaverLevel2Error) throw createShadowWeaverLevel2Error

  await linkLevelSurvivorStatuses(
    supabase,
    userId,
    'nemesis',
    shadowWeaverLevel2.id,
    ['Darkness', 'Nightmare']
  )

  await linkLevelMoodAndTrait(supabase, 'nemesis', shadowWeaverLevel2.id)

  const { data: shadowWeaverLevel3, error: createShadowWeaverLevel3Error } =
    await supabase
      .from('nemesis_level')
      .insert({
        ai_deck_remaining: 11,
        basic_cards: 3,
        advanced_cards: 5,
        legendary_cards: 3,
        overtone_cards: 0,
        accuracy: 3,
        accuracy_tokens: 0,
        damage: 4,
        damage_tokens: 0,
        evasion: 2,
        evasion_tokens: 0,
        level_number: 3,
        life: 20,
        luck: 1,
        luck_tokens: 0,
        movement: 8,
        movement_tokens: 0,
        nemesis_id: shadowWeaver.id,
        sub_monster_name: null,
        speed: 4,
        speed_tokens: 0,
        strength: 2,
        strength_tokens: 0,
        toughness: 12,
        toughness_tokens: 0
      })
      .select('id')
      .single()

  if (createShadowWeaverLevel3Error) throw createShadowWeaverLevel3Error

  await linkLevelSurvivorStatuses(
    supabase,
    userId,
    'nemesis',
    shadowWeaverLevel3.id,
    ['Darkness', 'Nightmare', 'Doomed']
  )

  await linkLevelMoodAndTrait(supabase, 'nemesis', shadowWeaverLevel3.id)

  const { error: createShadowWeaverTimelineError } = await supabase
    .from('nemesis_timeline_year')
    .insert([
      {
        campaign_types: [
          'PEOPLE_OF_THE_LANTERN',
          'PEOPLE_OF_THE_SUN',
          'PEOPLE_OF_THE_STARS',
          'PEOPLE_OF_THE_DREAM_KEEPER',
          'SQUIRES_OF_THE_CITADEL',
          'CUSTOM'
        ],
        nemesis_id: shadowWeaver.id,
        entries: ['Nemesis Encounter - Shadow Weaver Lvl 1'],
        year_number: 8
      },
      {
        campaign_types: [
          'PEOPLE_OF_THE_LANTERN',
          'PEOPLE_OF_THE_SUN',
          'PEOPLE_OF_THE_STARS',
          'PEOPLE_OF_THE_DREAM_KEEPER',
          'SQUIRES_OF_THE_CITADEL',
          'CUSTOM'
        ],
        nemesis_id: shadowWeaver.id,
        entries: ['Nemesis Encounter - Shadow Weaver Lvl 2'],
        year_number: 16
      },
      {
        campaign_types: [
          'PEOPLE_OF_THE_LANTERN',
          'PEOPLE_OF_THE_SUN',
          'PEOPLE_OF_THE_STARS',
          'PEOPLE_OF_THE_DREAM_KEEPER',
          'SQUIRES_OF_THE_CITADEL',
          'CUSTOM'
        ],
        nemesis_id: shadowWeaver.id,
        entries: ['Nemesis Encounter - Shadow Weaver Lvl 3'],
        year_number: 24
      }
    ])

  if (createShadowWeaverTimelineError) throw createShadowWeaverTimelineError

  // Custom Nemesis: Void Caller (single monster, 2 levels)
  const { data: voidCaller, error: createVoidCallerError } = await supabase
    .from('nemesis')
    .insert({
      custom: true,
      user_id: userId,
      alternate_id: null,
      monster_name: 'Void Caller',
      multi_monster: false,
      node: MonsterNode.NN2,
      vignette_id: null
    })
    .select('id')
    .single()

  if (createVoidCallerError) throw createVoidCallerError

  const { data: voidCallerLocation, error: createVoidCallerLocationError } =
    await supabase
      .from('location')
      .insert({
        custom: true,
        user_id: userId,
        location_name: 'Void Sanctum'
      })
      .select('id')
      .single()

  if (createVoidCallerLocationError) throw createVoidCallerLocationError

  const { error: createVoidCallerNemesisLocationError } = await supabase
    .from('nemesis_location')
    .insert({
      location_id: voidCallerLocation.id,
      nemesis_id: voidCaller.id
    })

  if (createVoidCallerNemesisLocationError)
    throw createVoidCallerNemesisLocationError

  const { error: createVoidCallerLevel1Error } = await supabase
    .from('nemesis_level')
    .insert({
      ai_deck_remaining: 8,
      basic_cards: 6,
      advanced_cards: 2,
      legendary_cards: 0,
      overtone_cards: 0,
      accuracy: 0,
      accuracy_tokens: 0,
      damage: 1,
      damage_tokens: 0,
      evasion: 0,
      evasion_tokens: 0,
      level_number: 1,
      life: 12,
      luck: 0,
      luck_tokens: 0,
      movement: 5,
      movement_tokens: 0,
      nemesis_id: voidCaller.id,
      sub_monster_name: null,
      speed: 1,
      speed_tokens: 0,
      strength: 0,
      strength_tokens: 0,
      toughness: 6,
      toughness_tokens: 0
    })

  if (createVoidCallerLevel1Error) throw createVoidCallerLevel1Error

  const { data: voidCallerLevel2, error: createVoidCallerLevel2Error } =
    await supabase
      .from('nemesis_level')
      .insert({
        ai_deck_remaining: 10,
        basic_cards: 5,
        advanced_cards: 4,
        legendary_cards: 1,
        overtone_cards: 0,
        accuracy: 1,
        accuracy_tokens: 0,
        damage: 2,
        damage_tokens: 0,
        evasion: 1,
        evasion_tokens: 0,
        level_number: 2,
        life: 18,
        luck: 0,
        luck_tokens: 0,
        movement: 6,
        movement_tokens: 0,
        nemesis_id: voidCaller.id,
        sub_monster_name: null,
        speed: 2,
        speed_tokens: 0,
        strength: 1,
        strength_tokens: 0,
        toughness: 8,
        toughness_tokens: 0
      })
      .select('id')
      .single()

  if (createVoidCallerLevel2Error) throw createVoidCallerLevel2Error

  await linkLevelSurvivorStatuses(
    supabase,
    userId,
    'nemesis',
    voidCallerLevel2.id,
    ['Void Touched']
  )

  await linkLevelMoodAndTrait(supabase, 'nemesis', voidCallerLevel2.id)

  const { error: createVoidCallerTimelineError } = await supabase
    .from('nemesis_timeline_year')
    .insert([
      {
        campaign_types: [
          'PEOPLE_OF_THE_LANTERN',
          'PEOPLE_OF_THE_SUN',
          'PEOPLE_OF_THE_STARS',
          'PEOPLE_OF_THE_DREAM_KEEPER',
          'SQUIRES_OF_THE_CITADEL',
          'CUSTOM'
        ],
        nemesis_id: voidCaller.id,
        entries: ['Nemesis Encounter - Void Caller Lvl 1'],
        year_number: 10
      },
      {
        campaign_types: [
          'PEOPLE_OF_THE_LANTERN',
          'PEOPLE_OF_THE_SUN',
          'PEOPLE_OF_THE_STARS',
          'PEOPLE_OF_THE_DREAM_KEEPER',
          'SQUIRES_OF_THE_CITADEL',
          'CUSTOM'
        ],
        nemesis_id: voidCaller.id,
        entries: ['Nemesis Encounter - Void Caller Lvl 2'],
        year_number: 20
      }
    ])

  if (createVoidCallerTimelineError) throw createVoidCallerTimelineError
}

/**
 * Create Custom Quarries
 *
 * Creates sample custom quarries for testing.
 *
 * @param supabase Supabase Client
 * @param userId User ID
 */
async function createCustomQuarries(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  console.log(`Creating Custom Quarries for User ${userId}...`)

  // Custom Quarry: Iron Wyrm
  const { data: ironWyrm, error: createIronWyrmError } = await supabase
    .from('quarry')
    .insert({
      custom: true,
      user_id: userId,
      alternate_id: null,
      monster_name: 'Iron Wyrm',
      multi_monster: false,
      node: MonsterNode.NQ1,
      prologue: true,
      vignette_id: null
    })
    .select('id')
    .single()

  if (createIronWyrmError) throw createIronWyrmError

  const { error: createIronWyrmHuntBoardError } = await supabase
    .from('quarry_hunt_board')
    .insert({
      pos_1: 'BASIC',
      pos_2: 'BASIC',
      pos_3: 'MONSTER',
      pos_4: 'BASIC',
      pos_5: 'BASIC',
      pos_7: 'BASIC',
      pos_8: 'BASIC',
      pos_9: 'BASIC',
      pos_10: 'MONSTER',
      pos_11: 'BASIC',
      quarry_id: ironWyrm.id
    })

  if (createIronWyrmHuntBoardError) throw createIronWyrmHuntBoardError

  const { data: ironWyrmLocation, error: createIronWyrmLocationError } =
    await supabase
      .from('location')
      .insert({
        custom: true,
        user_id: userId,
        location_name: 'Forge'
      })
      .select('id')
      .single()

  if (createIronWyrmLocationError) throw createIronWyrmLocationError

  const { error: createIronWyrmQuarryLocationError } = await supabase
    .from('quarry_location')
    .insert({
      location_id: ironWyrmLocation.id,
      quarry_id: ironWyrm.id
    })

  if (createIronWyrmQuarryLocationError) throw createIronWyrmQuarryLocationError

  const { error: createIronWyrmLevel1Error } = await supabase
    .from('quarry_level')
    .insert({
      ai_deck_remaining: 8,
      basic_cards: 8,
      advanced_cards: 0,
      legendary_cards: 0,
      overtone_cards: 0,
      accuracy: 0,
      accuracy_tokens: 0,
      damage: 2,
      damage_tokens: 0,
      evasion: -1,
      evasion_tokens: 0,
      level_number: 1,
      luck: 0,
      luck_tokens: 0,
      movement: 4,
      movement_tokens: 0,
      quarry_id: ironWyrm.id,
      sub_monster_name: null,
      speed: 1,
      speed_tokens: 0,
      strength: 2,
      strength_tokens: 0,
      toughness: 10,
      toughness_tokens: 0
    })
    .select('id')
    .single()

  if (createIronWyrmLevel1Error) throw createIronWyrmLevel1Error

  const { data: ironWyrmLevel2, error: createIronWyrmLevel2Error } =
    await supabase
      .from('quarry_level')
      .insert({
        ai_deck_remaining: 9,
        basic_cards: 6,
        advanced_cards: 3,
        legendary_cards: 0,
        overtone_cards: 0,
        accuracy: 1,
        accuracy_tokens: 0,
        damage: 3,
        damage_tokens: 0,
        evasion: 0,
        evasion_tokens: 0,
        level_number: 2,
        luck: 0,
        luck_tokens: 0,
        movement: 5,
        movement_tokens: 0,
        quarry_id: ironWyrm.id,
        sub_monster_name: null,
        speed: 2,
        speed_tokens: 0,
        strength: 3,
        strength_tokens: 0,
        toughness: 12,
        toughness_tokens: 0
      })
      .select('id')
      .single()

  if (createIronWyrmLevel2Error) throw createIronWyrmLevel2Error

  await linkLevelSurvivorStatuses(
    supabase,
    userId,
    'quarry',
    ironWyrmLevel2.id,
    ['Bleeding']
  )

  await linkLevelMoodAndTrait(supabase, 'quarry', ironWyrmLevel2.id)

  const { error: createIronWyrmLevelPositionsError } = await supabase
    .from('quarry_hunt_board_position')
    .insert([
      {
        quarry_id: ironWyrm.id,
        level_number: 1,
        monster_hunt_pos: 10,
        survivor_hunt_pos: 0
      },
      {
        quarry_id: ironWyrm.id,
        level_number: 2,
        monster_hunt_pos: 12,
        survivor_hunt_pos: 0
      }
    ])

  if (createIronWyrmLevelPositionsError) throw createIronWyrmLevelPositionsError

  const {
    data: ironWyrmCollectiveCognitionReward,
    error: createIronWyrmCollectiveCognitionRewardError
  } = await supabase
    .from('collective_cognition_reward')
    .insert({
      custom: true,
      user_id: userId,
      collective_cognition: 0,
      reward_name: 'Metalworking'
    })
    .select('id')
    .single()

  if (createIronWyrmCollectiveCognitionRewardError)
    throw createIronWyrmCollectiveCognitionRewardError

  const { error: createIronWyrmQuarryCollectiveCognitionRewardError } =
    await supabase.from('quarry_collective_cognition_reward').insert({
      collective_cognition_reward_id: ironWyrmCollectiveCognitionReward.id,
      quarry_id: ironWyrm.id
    })

  if (createIronWyrmQuarryCollectiveCognitionRewardError)
    throw createIronWyrmQuarryCollectiveCognitionRewardError

  const { error: createIronWyrmTimelineError } = await supabase
    .from('quarry_timeline_year')
    .insert([
      {
        campaign_types: [
          'PEOPLE_OF_THE_LANTERN',
          'PEOPLE_OF_THE_SUN',
          'PEOPLE_OF_THE_STARS',
          'PEOPLE_OF_THE_DREAM_KEEPER',
          'SQUIRES_OF_THE_CITADEL',
          'CUSTOM'
        ],
        quarry_id: ironWyrm.id,
        entries: ['Iron Wyrm Prologue'],
        year_number: 0
      },
      {
        campaign_types: [
          'PEOPLE_OF_THE_LANTERN',
          'PEOPLE_OF_THE_SUN',
          'PEOPLE_OF_THE_STARS',
          'PEOPLE_OF_THE_DREAM_KEEPER',
          'SQUIRES_OF_THE_CITADEL',
          'CUSTOM'
        ],
        quarry_id: ironWyrm.id,
        entries: ['Iron Wyrm Lvl 1'],
        year_number: 6
      },
      {
        campaign_types: [
          'PEOPLE_OF_THE_LANTERN',
          'PEOPLE_OF_THE_SUN',
          'PEOPLE_OF_THE_STARS',
          'PEOPLE_OF_THE_DREAM_KEEPER',
          'SQUIRES_OF_THE_CITADEL',
          'CUSTOM'
        ],
        quarry_id: ironWyrm.id,
        entries: ['Iron Wyrm Lvl 2'],
        year_number: 14
      }
    ])

  if (createIronWyrmTimelineError) throw createIronWyrmTimelineError

  // Custom Quarry: Dark Horses
  const { data: darkHorses, error: createDarkHorsesError } = await supabase
    .from('quarry')
    .insert({
      custom: true,
      user_id: userId,
      alternate_id: null,
      monster_name: 'Dark Horses',
      multi_monster: true,
      node: MonsterNode.NQ4,
      prologue: false,
      vignette_id: null
    })
    .select('id')
    .single()

  if (createDarkHorsesError) throw createDarkHorsesError

  const { error: createDarkHorsesHuntBoardError } = await supabase
    .from('quarry_hunt_board')
    .insert({
      pos_1: 'BASIC',
      pos_2: 'BASIC',
      pos_3: 'MONSTER',
      pos_4: 'BASIC',
      pos_5: 'BASIC',
      pos_7: 'BASIC',
      pos_8: 'BASIC',
      pos_9: 'BASIC',
      pos_10: 'MONSTER',
      pos_11: 'BASIC',
      quarry_id: darkHorses.id
    })

  if (createDarkHorsesHuntBoardError) throw createDarkHorsesHuntBoardError

  const { data: darkHorsesLocation, error: createDarkHorsesLocationError } =
    await supabase
      .from('location')
      .insert([
        {
          custom: true,
          user_id: userId,
          location_name: 'Serpent Den'
        },
        {
          custom: true,
          user_id: userId,
          location_name: 'Twilight Grove'
        }
      ])
      .select('id')

  if (createDarkHorsesLocationError) throw createDarkHorsesLocationError

  const { error: createDarkHorsesQuarryLocationError } = await supabase
    .from('quarry_location')
    .insert([
      {
        location_id: darkHorsesLocation[0].id,
        quarry_id: darkHorses.id
      },
      {
        location_id: darkHorsesLocation[1].id,
        quarry_id: darkHorses.id
      }
    ])

  if (createDarkHorsesQuarryLocationError)
    throw createDarkHorsesQuarryLocationError

  const { error: createDarkHorsesLevel1Error } = await supabase
    .from('quarry_level')
    .insert({
      ai_deck_remaining: 7,
      basic_cards: 7,
      advanced_cards: 0,
      legendary_cards: 0,
      overtone_cards: 0,
      accuracy: 0,
      accuracy_tokens: 0,
      damage: 1,
      damage_tokens: 0,
      evasion: 1,
      evasion_tokens: 0,
      level_number: 1,
      luck: 0,
      luck_tokens: 0,
      movement: 4,
      movement_tokens: 0,
      quarry_id: darkHorses.id,
      sub_monster_name: 'Dark Horse Alpha',
      speed: 1,
      speed_tokens: 0,
      strength: 2,
      strength_tokens: 0,
      toughness: 10,
      toughness_tokens: 0
    })
    .select('id')
    .single()

  if (createDarkHorsesLevel1Error) throw createDarkHorsesLevel1Error

  const { error: createDarkHorsesLevel2Error } = await supabase
    .from('quarry_level')
    .insert([
      {
        ai_deck_remaining: 7,
        basic_cards: 7,
        advanced_cards: 0,
        legendary_cards: 0,
        overtone_cards: 0,
        accuracy: 0,
        accuracy_tokens: 0,
        damage: 1,
        damage_tokens: 0,
        evasion: 1,
        evasion_tokens: 0,
        level_number: 2,
        luck: 0,
        luck_tokens: 0,
        movement: 4,
        movement_tokens: 0,
        quarry_id: darkHorses.id,
        sub_monster_name: 'Dark Horse Alpha',
        speed: 1,
        speed_tokens: 0,
        strength: 2,
        strength_tokens: 0,
        toughness: 10,
        toughness_tokens: 0
      },
      {
        ai_deck_remaining: 7,
        basic_cards: 7,
        advanced_cards: 0,
        legendary_cards: 0,
        overtone_cards: 0,
        accuracy: 0,
        accuracy_tokens: 0,
        damage: 1,
        damage_tokens: 0,
        evasion: 1,
        evasion_tokens: 0,
        level_number: 2,
        luck: 0,
        luck_tokens: 0,
        movement: 4,
        movement_tokens: 0,
        quarry_id: darkHorses.id,
        sub_monster_name: 'Dark Horse Beta',
        speed: 1,
        speed_tokens: 0,
        strength: 2,
        strength_tokens: 0,
        toughness: 10,
        toughness_tokens: 0
      }
    ])
    .select('id')

  if (createDarkHorsesLevel2Error) throw createDarkHorsesLevel2Error

  const { error: createDarkHorsesLevel3Error } = await supabase
    .from('quarry_level')
    .insert([
      {
        ai_deck_remaining: 7,
        basic_cards: 7,
        advanced_cards: 0,
        legendary_cards: 0,
        overtone_cards: 0,
        accuracy: 0,
        accuracy_tokens: 0,
        damage: 1,
        damage_tokens: 0,
        evasion: 1,
        evasion_tokens: 0,
        level_number: 3,
        luck: 0,
        luck_tokens: 0,
        movement: 4,
        movement_tokens: 0,
        quarry_id: darkHorses.id,
        sub_monster_name: 'Dark Horse Alpha',
        speed: 1,
        speed_tokens: 0,
        strength: 2,
        strength_tokens: 0,
        toughness: 10,
        toughness_tokens: 0
      },
      {
        ai_deck_remaining: 7,
        basic_cards: 7,
        advanced_cards: 0,
        legendary_cards: 0,
        overtone_cards: 0,
        accuracy: 0,
        accuracy_tokens: 0,
        damage: 1,
        damage_tokens: 0,
        evasion: 1,
        evasion_tokens: 0,
        level_number: 3,
        luck: 0,
        luck_tokens: 0,
        movement: 4,
        movement_tokens: 0,
        quarry_id: darkHorses.id,
        sub_monster_name: 'Dark Horse Beta',
        speed: 1,
        speed_tokens: 0,
        strength: 2,
        strength_tokens: 0,
        toughness: 10,
        toughness_tokens: 0
      },
      {
        ai_deck_remaining: 7,
        basic_cards: 7,
        advanced_cards: 0,
        legendary_cards: 0,
        overtone_cards: 0,
        accuracy: 0,
        accuracy_tokens: 0,
        damage: 1,
        damage_tokens: 0,
        evasion: 1,
        evasion_tokens: 0,
        level_number: 3,
        luck: 0,
        luck_tokens: 0,
        movement: 4,
        movement_tokens: 0,
        quarry_id: darkHorses.id,
        sub_monster_name: 'Dark Horse Gamma',
        speed: 1,
        speed_tokens: 0,
        strength: 2,
        strength_tokens: 0,
        toughness: 10,
        toughness_tokens: 0
      }
    ])
    .select('id')

  if (createDarkHorsesLevel3Error) throw createDarkHorsesLevel3Error

  const { error: createDarkHorsesLevelPositionsError } = await supabase
    .from('quarry_hunt_board_position')
    .insert([
      {
        quarry_id: darkHorses.id,
        level_number: 1,
        monster_hunt_pos: 11,
        survivor_hunt_pos: 0
      },
      {
        quarry_id: darkHorses.id,
        level_number: 2,
        monster_hunt_pos: 11,
        survivor_hunt_pos: 0
      },
      {
        quarry_id: darkHorses.id,
        level_number: 3,
        monster_hunt_pos: 11,
        survivor_hunt_pos: 0
      }
    ])

  if (createDarkHorsesLevelPositionsError)
    throw createDarkHorsesLevelPositionsError

  const {
    data: darkHorsesCollectiveCognitionReward,
    error: createDarkHorsesCollectiveCognitionRewardError
  } = await supabase
    .from('collective_cognition_reward')
    .insert([
      {
        custom: true,
        user_id: userId,
        collective_cognition: 0,
        reward_name: 'Venom Study'
      },
      {
        custom: true,
        user_id: userId,
        collective_cognition: 0,
        reward_name: 'Herd Tactics'
      },
      {
        custom: true,
        user_id: userId,
        collective_cognition: 0,
        reward_name: 'Equine Empathy'
      }
    ])
    .select('id')

  if (createDarkHorsesCollectiveCognitionRewardError)
    throw createDarkHorsesCollectiveCognitionRewardError

  const { error: createDarkHorsesQuarryCollectiveCognitionRewardError } =
    await supabase.from('quarry_collective_cognition_reward').insert([
      {
        collective_cognition_reward_id:
          darkHorsesCollectiveCognitionReward[0].id,
        quarry_id: darkHorses.id
      },
      {
        collective_cognition_reward_id:
          darkHorsesCollectiveCognitionReward[1].id,
        quarry_id: darkHorses.id
      },
      {
        collective_cognition_reward_id:
          darkHorsesCollectiveCognitionReward[2].id,
        quarry_id: darkHorses.id
      }
    ])

  if (createDarkHorsesQuarryCollectiveCognitionRewardError)
    throw createDarkHorsesQuarryCollectiveCognitionRewardError
}

/**
 * Create Custom Armor Sets
 *
 * Creates a sample custom armor set with two slots and gear candidates so the
 * `armor_set`, `armor_set_slot`, and `armor_set_slot_gear` tables are exercised
 * in seeded data.
 *
 * @param supabase Supabase Client
 * @param userId User ID
 * @returns void
 */
async function createCustomArmorSets(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  console.log(`Creating Custom Armor Sets for User ${userId}...`)

  // Pick a small handful of catalog gear pieces to act as slot candidates. The
  // set seeds even when the catalog only returns a single piece — we simply
  // skip the second slot in that case.
  const { data: candidateGear, error: gearLookupError } = await supabase
    .from('gear')
    .select('id, gear_name')
    .eq('custom', false)
    .limit(4)

  if (gearLookupError) throw gearLookupError
  if (!candidateGear || candidateGear.length === 0)
    return console.warn(
      'No catalog gear available — skipping custom armor set seeding.'
    )

  const { data: armorSet, error: createArmorSetError } = await supabase
    .from('armor_set')
    .insert({
      armor_set_name: 'Lantern Vigil',
      bonuses:
        'Each survivor wearing a complete Lantern Vigil set gains +1 light radius.',
      custom: true,
      user_id: userId
    })
    .select('id')
    .single()

  if (createArmorSetError) throw createArmorSetError

  // Build up to two slots (Head, Chest) using the available gear pool.
  const slotDefinitions = [
    { slot_name: 'Head', slot_order: 1, required: true },
    { slot_name: 'Chest', slot_order: 2, required: true }
  ].slice(0, Math.max(1, Math.min(2, candidateGear.length)))

  for (const [index, slot] of slotDefinitions.entries()) {
    const { data: slotRow, error: createSlotError } = await supabase
      .from('armor_set_slot')
      .insert({
        armor_set_id: armorSet.id,
        ...slot
      })
      .select('id')
      .single()

    if (createSlotError) throw createSlotError

    // Each slot gets up to two gear candidates so the alternates path is
    // covered. Slots cycle through the candidate pool to avoid duplicates.
    const slotCandidates = [
      candidateGear[index],
      candidateGear[(index + slotDefinitions.length) % candidateGear.length]
    ].filter((g, i, arr) => g && arr.findIndex((x) => x?.id === g.id) === i)

    if (slotCandidates.length === 0) continue

    const { error: linkSlotGearError } = await supabase
      .from('armor_set_slot_gear')
      .insert(
        slotCandidates.map((gear) => ({
          armor_set_slot_id: slotRow.id,
          gear_id: gear!.id
        }))
      )

    if (linkSlotGearError) throw linkSlotGearError
  }
}

/**
 * Create Settlement Phase
 *
 * Creates a sample settlement phase with a hunt and showdown for testing.
 *
 * @param supabase Supabase Client
 * @param settlementId Settlement ID
 * @param usesScouts Settlement Uses Scouts
 */
async function createSettlementPhase(
  supabase: SupabaseClient,
  settlementId: string,
  usesScouts: boolean
): Promise<void> {
  console.log(
    `Creating Settlement Phase for Settlement ${settlementId} (Scouts: ${usesScouts})...`
  )

  // Pull a few survivors from the settlement to mark as returning. The phase
  // requires at least one returning survivor to exercise the junction table.
  const { data: settlementSurvivors, error: getSurvivorsError } = await supabase
    .from('survivor')
    .select('id')
    .eq('settlement_id', settlementId)
    .limit(3)

  if (getSurvivorsError) throw getSurvivorsError

  const returningSurvivors = settlementSurvivors ?? []
  // If scouts are enabled, designate the last returning survivor as the scout.
  const returningScoutId =
    usesScouts && returningSurvivors.length > 0
      ? returningSurvivors[returningSurvivors.length - 1].id
      : null

  // Create the settlement_phase record itself.
  const { data: phase, error: createPhaseError } = await supabase
    .from('settlement_phase')
    .insert({
      settlement_id: settlementId,
      step: 'SURVIVORS_RETURN',
      endeavors: 2,
      returning_scout_id: returningScoutId
    })
    .select('id')
    .single()

  if (createPhaseError) throw createPhaseError

  // Link returning survivors via the junction table. The scout (if any) is
  // recorded directly on the phase row above and is intentionally omitted here.
  for (const survivor of returningSurvivors) {
    if (survivor.id === returningScoutId) continue

    const { error: linkSurvivorError } = await supabase
      .from('settlement_phase_returning_survivor')
      .insert({
        settlement_id: settlementId,
        settlement_phase_id: phase.id,
        survivor_id: survivor.id
      })

    if (linkSurvivorError) throw linkSurvivorError
  }
}
