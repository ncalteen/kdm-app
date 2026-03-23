import { getCustomCampaignTemplate } from '@/lib/campaigns/custom'
import { getPeopleOfTheDreamKeeperTemplate } from '@/lib/campaigns/potdk'
import { getPeopleOfTheLanternTemplate } from '@/lib/campaigns/potl'
import { getPeopleOfTheStarsTemplate } from '@/lib/campaigns/potstars'
import { getPeopleOfTheSunTemplate } from '@/lib/campaigns/potsun'
import { getSquiresOfTheCitadelTemplate } from '@/lib/campaigns/squires'
import { getLocationIds } from '@/lib/dal/location'
import { getNemesisLocationIds } from '@/lib/dal/nemesis-location'
import { getNemesisTimelineYears } from '@/lib/dal/nemesis-timeline-year'
import { getQuarryCollectiveCognitionRewardIds } from '@/lib/dal/quarry-collective-cognition-reward'
import { getQuarryLocationIds } from '@/lib/dal/quarry-location'
import { getQuarryTimelineYears } from '@/lib/dal/quarry-timeline-year'
import {
  addSettlementCollectiveCognitionRewards,
  getSettlementCollectiveCognitionRewards
} from '@/lib/dal/settlement-collective-cognition-reward'
import { getSettlementGear } from '@/lib/dal/settlement-gear'
import {
  addSettlementInnovations,
  getSettlementInnovations
} from '@/lib/dal/settlement-innovation'
import { getSettlementKnowledges } from '@/lib/dal/settlement-knowledge'
import {
  addSettlementLocations,
  getSettlementLocations
} from '@/lib/dal/settlement-location'
import {
  addSettlementMilestones,
  getSettlementMilestones
} from '@/lib/dal/settlement-milestone'
import {
  addSettlementNemeses,
  getSettlementNemeses
} from '@/lib/dal/settlement-nemesis'
import { getSettlementPatterns } from '@/lib/dal/settlement-pattern'
import { getSettlementPhilosophies } from '@/lib/dal/settlement-philosophy'
import {
  addSettlementPrinciples,
  getSettlementPrinciples
} from '@/lib/dal/settlement-principle'
import {
  addSettlementQuarries,
  getSettlementQuarries
} from '@/lib/dal/settlement-quarry'
import { getSettlementResources } from '@/lib/dal/settlement-resource'
import { getSettlementSeedPatterns } from '@/lib/dal/settlement-seed-pattern'
import {
  addSettlementTimelineYears,
  getSettlementTimelineYears
} from '@/lib/dal/settlement-timeline-year'
import { addSettlementWanderers } from '@/lib/dal/settlement-wanderer'
import { addSquiresOfTheCitadelSurvivors } from '@/lib/dal/survivor'
import { getUserId } from '@/lib/dal/user'
import { getWandererTimelineYears } from '@/lib/dal/wanderer-timeline-year'
import { Tables } from '@/lib/database.types'
import {
  CampaignType,
  DatabaseCampaignType,
  DatabaseSurvivorType,
  SurvivorType
} from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'
import {
  canDash,
  canEncourage,
  canEndure,
  canFistPump,
  canSurge,
  survivorsBornWithUnderstanding
} from '@/lib/utils'
import { NewSettlementInput } from '@/schemas/new-settlement-input'

/**
 * Create Settlement
 *
 * Takes either the preselected campaign or custom campaign data and uses it to
 * create a new settlement. Parallelizes independent data lookups for nemesis,
 * quarry, and wanderer timeline/location data to reduce latency.
 *
 * @param options Settlement Input Data
 * @returns Settlement ID
 */
export async function createSettlement(
  options: NewSettlementInput
): Promise<string> {
  const userId = await getUserId()
  const supabase = createClient()

  const template = await {
    [CampaignType.CUSTOM]: getCustomCampaignTemplate,
    [CampaignType.PEOPLE_OF_THE_DREAM_KEEPER]:
      getPeopleOfTheDreamKeeperTemplate,
    [CampaignType.PEOPLE_OF_THE_LANTERN]: getPeopleOfTheLanternTemplate,
    [CampaignType.PEOPLE_OF_THE_STARS]: getPeopleOfTheStarsTemplate,
    [CampaignType.PEOPLE_OF_THE_SUN]: getPeopleOfTheSunTemplate,
    [CampaignType.SQUIRES_OF_THE_CITADEL]: getSquiresOfTheCitadelTemplate
  }[options.campaignType]()

  // Create the settlement record first to generate the settlement ID.
  const settlement: Omit<
    Tables<'settlement'>,
    'created_at' | 'id' | 'updated_at'
  > = {
    arrival_bonuses: [],
    campaign_type: DatabaseCampaignType[options.campaignType],
    current_year: 0,
    departing_bonuses: [],
    notes: '',
    settlement_name: options.settlementName,
    survival_limit: 1,
    survivor_type: DatabaseSurvivorType[options.survivorType],
    uses_scouts: options.usesScouts,
    lantern_research: 0,
    monster_volumes: [],
    user_id: userId
  }

  const { data: settlementData, error: settlementError } = await supabase
    .from('settlement')
    .insert(settlement)
    .select('id')
    .maybeSingle()

  if (settlementError)
    throw new Error(`Error Creating Settlement: ${settlementError.message}`)
  if (!settlementData) throw new Error('Settlement Creation Failed')

  const settlementId = settlementData.id

  // Simple parallel inserts that don't affect other tables.
  await Promise.all([
    addSettlementInnovations(template.innovationIds, settlementId),
    addSettlementMilestones(template.milestoneIds, settlementId),
    addSettlementPrinciples(template.principleIds, settlementId)
  ])

  // Accumulators for data that depends on nemesis/quarry/wanderer lookups.
  const settlementCollectiveCognitionRewardIds = [
    ...template.collectiveCognitionRewardIds
  ]
  const settlementLocationIds = [...template.locationIds]
  const settlementTimeline: Omit<
    Tables<'settlement_timeline_year'>,
    'created_at' | 'id' | 'updated_at'
  >[] = template.timeline.map(({ entries, year_number }) => ({
    completed: false,
    entries: [...entries],
    settlement_id: settlementId,
    year_number
  }))

  // Conditional locations (Arc forum, scout outskirts).
  const conditionalLocationNames: string[] = []
  if (options.survivorType === SurvivorType.ARC)
    conditionalLocationNames.push('Forum')
  if (options.usesScouts) conditionalLocationNames.push('Outskirts')

  if (conditionalLocationNames.length > 0)
    settlementLocationIds.push(
      ...(await getLocationIds(conditionalLocationNames, false, undefined))
    )

  // Nemeses
  const nemesisIds = [
    ...options.monsterIds.NN1,
    ...options.monsterIds.NN2,
    ...options.monsterIds.NN3,
    ...options.monsterIds.CO,
    ...options.monsterIds.FI
  ]

  // Quarries
  const quarryIds = [
    ...options.monsterIds.NQ1,
    ...options.monsterIds.NQ2,
    ...options.monsterIds.NQ3,
    ...options.monsterIds.NQ4
  ]

  // Insert nemeses, quarries, and wanderers in parallel.
  await Promise.all([
    addSettlementNemeses(nemesisIds, settlementId),
    addSettlementQuarries(quarryIds, settlementId),
    addSettlementWanderers(options.wandererIds, settlementId)
  ])

  // Fetch all timeline/location/collective-cognition-reward data in parallel
  // per-entity.
  const [nemesisDataResults, quarryDataResults, wandererDataResults] =
    await Promise.all([
      // All nemesis lookups in parallel
      Promise.all(
        nemesisIds.map(async (nemesisId) => {
          const [timelineYears, locationIds] = await Promise.all([
            getNemesisTimelineYears(nemesisId, options.campaignType),
            getNemesisLocationIds(nemesisId)
          ])
          return { timelineYears, locationIds }
        })
      ),
      // All quarry lookups in parallel
      Promise.all(
        quarryIds.map(async (quarryId) => {
          const [timelineYears, locationIds, collectiveCognitionRewardIds] =
            await Promise.all([
              getQuarryTimelineYears(quarryId, options.campaignType),
              getQuarryLocationIds(quarryId),
              getQuarryCollectiveCognitionRewardIds(quarryId)
            ])
          return { timelineYears, locationIds, collectiveCognitionRewardIds }
        })
      ),
      // All wanderer lookups in parallel
      Promise.all(
        options.wandererIds.map(async (wandererId) => {
          const timelineYears = await getWandererTimelineYears(wandererId)
          return { timelineYears }
        })
      )
    ])

  // Merge nemesis data into accumulators.
  for (const { timelineYears, locationIds } of nemesisDataResults) {
    for (const ty of timelineYears)
      settlementTimeline[ty.year_number].entries.push(...ty.entries)
    settlementLocationIds.push(...locationIds)
  }

  // Merge quarry data into accumulators.
  for (const {
    timelineYears,
    locationIds,
    collectiveCognitionRewardIds
  } of quarryDataResults) {
    for (const ty of timelineYears)
      settlementTimeline[ty.year_number].entries.push(...ty.entries)
    settlementLocationIds.push(...locationIds)
    settlementCollectiveCognitionRewardIds.push(...collectiveCognitionRewardIds)
  }

  // Merge wanderer data into accumulators.
  for (const { timelineYears } of wandererDataResults)
    for (const ty of Object.values(timelineYears))
      settlementTimeline[ty.year_number].entries.push(...ty.entries)

  // Final parallel inserts for accumulated data.
  await Promise.all([
    addSettlementCollectiveCognitionRewards(
      settlementCollectiveCognitionRewardIds,
      settlementId
    ),
    addSettlementLocations(settlementLocationIds, settlementId),
    addSettlementTimelineYears(settlementTimeline)
  ])

  // Campaign-specific additions.
  if (options.campaignType === CampaignType.SQUIRES_OF_THE_CITADEL)
    await addSquiresOfTheCitadelSurvivors(settlementId)

  return settlementId
}

/**
 * Get Settlement
 *
 * Gets the base details for a settlement by ID. Checks ownership first, then
 * falls back to shared access. Fetches all related data in parallel.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Details (or null)
 */
export async function getSettlement(
  settlementId: string | null
): Promise<SettlementDetail | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const userId = await getUserId()
  const supabase = createClient()

  let settlement: SettlementDetail | null = null

  // Check if the settlement is owned by the user directly.
  const { data: ownedSettlement, error: ownedError } = await supabase
    .from('settlement')
    .select('*')
    .eq('id', settlementId)
    .eq('user_id', userId)
    .maybeSingle()

  if (ownedError)
    throw new Error(`Error Fetching Settlement: ${ownedError.message}`)

  if (ownedSettlement) settlement = { ...ownedSettlement, shared: false }

  // Check if it is a shared settlement.
  if (!settlement) {
    const { data: sharedSettlementRow, error: sharedError } = await supabase
      .from('settlement_shared_user')
      .select('settlement(*)')
      .eq('settlement_id', settlementId)
      .eq('shared_user_id', userId)
      .maybeSingle()

    if (sharedError)
      throw new Error(
        `Error Fetching Shared Settlement: ${sharedError.message}`
      )

    const sharedSettlement = Array.isArray(sharedSettlementRow?.settlement)
      ? sharedSettlementRow.settlement[0]
      : sharedSettlementRow?.settlement

    if (sharedSettlement) settlement = { ...sharedSettlement, shared: true }
  }

  if (!settlement) return null

  const [
    collectiveCognitionRewards,
    gear,
    innovations,
    knowledges,
    locations,
    milestones,
    nemeses,
    patterns,
    philosophies,
    principles,
    quarries,
    resources,
    seedPatterns,
    timelineYears
  ] = await Promise.all([
    getSettlementCollectiveCognitionRewards(settlementId),
    getSettlementGear(settlementId),
    getSettlementInnovations(settlementId),
    getSettlementKnowledges(settlementId),
    getSettlementLocations(settlementId),
    getSettlementMilestones(settlementId),
    getSettlementNemeses(settlementId),
    getSettlementPatterns(settlementId),
    getSettlementPhilosophies(settlementId),
    getSettlementPrinciples(settlementId),
    getSettlementQuarries(settlementId),
    getSettlementResources(settlementId),
    getSettlementSeedPatterns(settlementId),
    getSettlementTimelineYears(settlementId)
  ])

  return {
    ...settlement,
    can_encourage: canEncourage(innovations),
    can_surge: canSurge(innovations),
    can_dash: canDash(innovations),
    can_fist_pump: canFistPump(innovations),
    can_endure: canEndure(innovations),
    collective_cognition_rewards: collectiveCognitionRewards,
    gear,
    innovations,
    knowledges,
    locations,
    milestones,
    nemeses,
    patterns,
    philosophies,
    principles,
    quarries,
    resources,
    seed_patterns: seedPatterns,
    survivors_born_with_understanding:
      survivorsBornWithUnderstanding(innovations),
    timeline: timelineYears
  }
}

/**
 * Get Collective Cognition
 *
 * Sums the collective cognition value based on settlement victories. Fetches
 * nemesis and quarry collective cognition data in parallel.
 *
 * @param settlementId Settlement ID
 * @returns Collective Cognition (or null)
 */
export async function getCollectiveCognition(
  settlementId: string | null | undefined
): Promise<number | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  // Fetch nemesis and quarry collective cognition data in parallel.
  const [nemesisResult, quarryResult] = await Promise.all([
    supabase
      .from('settlement_nemesis')
      .select(
        'collective_cognition_level_1, collective_cognition_level_2, collective_cognition_level_3'
      )
      .eq('settlement_id', settlementId),
    supabase
      .from('settlement_quarry')
      .select(
        'collective_cognition_level_1, collective_cognition_level_2, collective_cognition_level_3, collective_cognition_prologue'
      )
      .eq('settlement_id', settlementId)
  ])

  if (nemesisResult.error)
    throw new Error(
      `Error Fetching Settlement Nemeses: ${nemesisResult.error.message}`
    )
  if (quarryResult.error)
    throw new Error(
      `Error Fetching Settlement Quarries: ${quarryResult.error.message}`
    )

  let total = 0

  for (const nemesis of nemesisResult.data ?? []) {
    if (nemesis.collective_cognition_level_1) total += 3
    if (nemesis.collective_cognition_level_2) total += 3
    if (nemesis.collective_cognition_level_3) total += 3
  }

  for (const quarry of quarryResult.data ?? []) {
    if (quarry.collective_cognition_prologue) total += 1
    if (quarry.collective_cognition_level_1) total += 1
    for (const level2 of quarry.collective_cognition_level_2 as boolean[])
      if (level2) total += 2
    for (const level3 of quarry.collective_cognition_level_3 as boolean[])
      if (level3) total += 3
  }

  return total
}

/**
 * Get Death Count
 *
 * Only includes survivors who are dead. Uses `select('id')` instead of
 * `select('*')` to minimize data transferred with `head: true`.
 *
 * @param settlementId Settlement ID
 * @returns Death Count (or null)
 */
export async function getDeathCount(
  settlementId: string | null | undefined
): Promise<number | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { count, error } = await supabase
    .from('survivor')
    .select('id', { count: 'exact', head: true })
    .eq('settlement_id', settlementId)
    .eq('dead', true)

  if (error) throw new Error(`Error Fetching Death Count: ${error.message}`)

  return count
}

/**
 * Get Hunt ID
 *
 * Retrieves the selected settlement's hunt ID.
 *
 * @param settlementId Settlement ID
 * @returns Hunt ID (or null)
 */
export async function getHuntId(
  settlementId: string | null | undefined
): Promise<string | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt')
    .select('id')
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Hunt ID: ${error.message}`)

  return data?.id ?? null
}

/**
 * Get Lost Settlement Count
 *
 * Determined by evaluating the settlement's milestones. If there is a milestone
 * with the event name 'Game Over' marked as complete, that settlement has been
 * lost.
 *
 * @param settlementId Settlement ID
 * @returns Lost Settlement Count (or null)
 */
export async function getLostSettlementCount(
  settlementId: string | null | undefined
): Promise<number | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { count, error } = await supabase
    .from('settlement_milestone')
    .select('milestone!inner(event_name)', { count: 'exact', head: true })
    .eq('settlement_id', settlementId)
    .eq('complete', true)
    .eq('milestone.event_name', 'Game Over')

  if (error)
    throw new Error(`Error Fetching Lost Settlement Count: ${error.message}`)

  return count
}

/**
 * Get Population
 *
 * Only includes survivors who are not dead.
 *
 * @param settlementId Settlement ID
 * @returns Population (or null)
 */
export async function getPopulation(
  settlementId: string | null | undefined
): Promise<number | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { count, error } = await supabase
    .from('survivor')
    .select('id', { count: 'exact', head: true })
    .eq('settlement_id', settlementId)
    .not('dead', 'eq', true)

  if (error) throw new Error(`Error Fetching Population: ${error.message}`)

  return count
}

/**
 * Get Settlement Phase ID
 *
 * Retrieves the selected settlement's settlement phase ID.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Phase ID (or null)
 */
export async function getSettlementPhaseId(
  settlementId: string | null | undefined
): Promise<string | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_phase')
    .select('id')
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Settlement Phase ID: ${error.message}`)

  return data?.id ?? null
}

/**
 * Get Showdown ID
 *
 * Retrieves the selected settlement's showdown ID.
 *
 * @param settlementId Settlement ID
 * @returns Showdown ID (or null)
 */
export async function getShowdownId(
  settlementId: string | null | undefined
): Promise<string | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown')
    .select('id')
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Showdown ID: ${error.message}`)

  return data?.id ?? null
}

/**
 * Update Settlement
 *
 * @param settlementId Settlement ID
 * @param updates Settlement Updates
 */
export async function updateSettlement(
  settlementId: string | null | undefined,
  updates: Partial<Tables<'settlement'>>
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement')
    .update(updates)
    .eq('id', settlementId)

  if (error) throw new Error(`Error Updating Settlement: ${error.message}`)
}

/**
 * Remove Settlement
 *
 * Deletes a settlement record from the database.
 *
 * @param id Settlement ID
 */
export async function removeSettlement(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('settlement').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Settlement: ${error.message}`)
}
