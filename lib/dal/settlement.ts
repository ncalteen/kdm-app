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
import { addCollectiveCognitionRewardsToSettlement } from '@/lib/dal/settlement-collective-cognition-reward'
import { getSettlementGear } from '@/lib/dal/settlement-gear'
import {
  addSettlementInnovations,
  getSettlementInnovations
} from '@/lib/dal/settlement-innovation'
import { addSettlementLocations } from '@/lib/dal/settlement-location'
import {
  addSettlementMilestones,
  getSettlementMilestones
} from '@/lib/dal/settlement-milestone'
import {
  addSettlementNemeses,
  getSettlementNemeses
} from '@/lib/dal/settlement-nemesis'
import { getSettlementPatterns } from '@/lib/dal/settlement-pattern'
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
import { addWanderersToSettlement } from '@/lib/dal/settlement-wanderer'
import { addSquiresOfTheCitadelSurvivors } from '@/lib/dal/survivor'
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
 * create a new settlement.
 *
 * @param data Settlement Input Data
 * @returns Settlement ID
 */
export async function createSettlement(
  options: NewSettlementInput
): Promise<string> {
  const supabase = createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!userData.user) throw new Error('User Not Authenticated')

  // Get the template based on the campaign type. This will call various helper
  // functions to get the necessary data for creating the settlement.
  const template = await {
    [CampaignType.CUSTOM]: getCustomCampaignTemplate,
    [CampaignType.PEOPLE_OF_THE_DREAM_KEEPER]:
      getPeopleOfTheDreamKeeperTemplate,
    [CampaignType.PEOPLE_OF_THE_LANTERN]: getPeopleOfTheLanternTemplate,
    [CampaignType.PEOPLE_OF_THE_STARS]: getPeopleOfTheStarsTemplate,
    [CampaignType.PEOPLE_OF_THE_SUN]: getPeopleOfTheSunTemplate,
    [CampaignType.SQUIRES_OF_THE_CITADEL]: getSquiresOfTheCitadelTemplate
  }[options.campaignType]()

  // Create the settlement record. This is must happen first to generate the
  // settlement ID.
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
    user_id: userData.user.id
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

  //////////////////////////////////////////////////////////////////////////////
  // The following do not need to be added for a new settlement.
  // - Knowledges
  // - Philosophies
  // - Gear
  // - Patterns
  // - Resources
  //////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////
  // The following are "simple" additions. They don't require any additional
  // logic beyond creating in the database.
  //////////////////////////////////////////////////////////////////////////////

  // Innovations
  await addSettlementInnovations(template.innovationIds, settlementId)
  // Milestones
  await addSettlementMilestones(template.milestoneIds, settlementId)
  // Principles
  await addSettlementPrinciples(template.principleIds, settlementId)

  //////////////////////////////////////////////////////////////////////////////
  // The following shouldn't be added until the remaining creation logic is
  // done, as they will be updated based on the other inputs. Instead, they
  // will be built up as the settlement is created, and then added at the end.
  //////////////////////////////////////////////////////////////////////////////

  // Collective Cognition Rewards
  const settlementCollectiveCognitionRewardIds =
    template.collectiveCognitionRewardIds
  // Locations
  const settlementLocationIds = template.locationIds
  // Timeline Events (data, not IDs)
  const settlementTimeline: Omit<
    Tables<'settlement_timeline_year'>,
    'created_at' | 'id' | 'updated_at'
  >[] = template.timeline.map(({ entries, year_number }) => ({
    completed: false,
    entries,
    settlement_id: settlementId,
    year_number
  }))

  // If the settlement uses Arc survivors, add the Forum location.
  if (options.survivorType === SurvivorType.ARC)
    settlementLocationIds.push(
      ...(await getLocationIds(['Forum'], false, undefined))
    )
  // If the settlement uses scouts, get the Outskirts location.
  if (options.usesScouts)
    settlementLocationIds.push(
      ...(await getLocationIds(['Outskirts'], false, undefined))
    )

  //////////////////////////////////////////////////////////////////////////////
  // The following are more complex, as they will affect other tables like
  // locations and timelines.
  //////////////////////////////////////////////////////////////////////////////

  // Nemeses
  const nemesisIds = options.monsterIds.NN1.concat(
    options.monsterIds.NN2,
    options.monsterIds.NN3,
    options.monsterIds.CO,
    options.monsterIds.FI
  )
  await addSettlementNemeses(nemesisIds, settlementId)

  for (const nemesisId of nemesisIds) {
    // Append any timeline entries to the settlement timeline.
    for (const timelineYear of await getNemesisTimelineYears(
      nemesisId,
      options.campaignType
    ))
      settlementTimeline[timelineYear.year_number].entries.push(
        ...timelineYear.entries
      )

    // Add any locations to the settlement locations.
    settlementLocationIds.push(...(await getNemesisLocationIds(nemesisId)))
  }

  // Quarries
  const quarryIds = options.monsterIds.NQ1.concat(
    options.monsterIds.NQ2,
    options.monsterIds.NQ3,
    options.monsterIds.NQ4
  )
  await addSettlementQuarries(quarryIds, settlementId)

  for (const quarryId of quarryIds) {
    // Append any timeline entries to the settlement timeline.
    for (const timelineYear of await getQuarryTimelineYears(
      quarryId,
      options.campaignType
    ))
      settlementTimeline[timelineYear.year_number].entries.push(
        ...timelineYear.entries
      )

    // Add any locations to the settlement locations.
    settlementLocationIds.push(...(await getQuarryLocationIds(quarryId)))

    // Add any collective cognition rewards to the settlement collective
    // cognition rewards.
    settlementCollectiveCognitionRewardIds.push(
      ...(await getQuarryCollectiveCognitionRewardIds(quarryId))
    )
  }

  // Wanderers
  await addWanderersToSettlement(options.wandererIds, settlementId)

  for (const wandererId of options.wandererIds)
    // Append any timeline entries to the settlement timeline.
    for (const timelineYear of Object.values(
      await getWandererTimelineYears(wandererId)
    ))
      settlementTimeline[timelineYear.year_number].entries.push(
        ...timelineYear.entries
      )

  //////////////////////////////////////////////////////////////////////////////
  // Main creation logic is done. Add the built up data to the settlement.
  //////////////////////////////////////////////////////////////////////////////

  // Collective Cognition Rewards
  await addCollectiveCognitionRewardsToSettlement(
    settlementCollectiveCognitionRewardIds,
    settlementId
  )
  // Locations
  await addSettlementLocations(settlementLocationIds, settlementId)
  // Timeline Events
  await addSettlementTimelineYears(settlementTimeline)

  //////////////////////////////////////////////////////////////////////////////
  // Any final additions or customizations based on the campaign type.
  //////////////////////////////////////////////////////////////////////////////

  // Squires of the Citadel
  if (options.campaignType === CampaignType.SQUIRES_OF_THE_CITADEL)
    await addSquiresOfTheCitadelSurvivors(settlementId)

  return settlementId
}

/**
 * Get Settlement
 *
 * Gets the base details for a settlement by ID.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Details (or null)
 */
export async function getSettlement(
  settlementId: string | null
): Promise<SettlementDetail | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  let settlement: SettlementDetail | null = null

  // Check if the settlement is owned by the user directly.
  const { data: ownedSettlement, error: ownedError } = await supabase
    .from('settlement')
    .select('*')
    .eq('id', settlementId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (ownedError)
    throw new Error(`Error Fetching Settlement: ${ownedError.message}`)

  if (ownedSettlement)
    settlement = {
      ...ownedSettlement,
      shared: false
    }

  // Check if it is a shared settlement.
  if (!settlement) {
    const { data: sharedSettlementRow, error: sharedError } = await supabase
      .from('settlement_shared_user')
      .select('settlement(*)')
      .eq('settlement_id', settlementId)
      .eq('shared_user_id', user.id)
      .maybeSingle()

    if (sharedError)
      throw new Error(
        `Error Fetching Shared Settlement: ${sharedError.message}`
      )

    const sharedSettlement = Array.isArray(sharedSettlementRow?.settlement)
      ? sharedSettlementRow.settlement[0]
      : sharedSettlementRow?.settlement

    if (sharedSettlement)
      settlement = {
        ...sharedSettlement,
        shared: true
      }
  }

  if (!settlement) return null

  const [
    gear,
    innovations,
    milestones,
    nemeses,
    patterns,
    principles,
    quarries,
    resources,
    seedPatterns,
    timelineYears
  ] = await Promise.all([
    getSettlementGear(settlementId),
    getSettlementInnovations(settlementId),
    getSettlementMilestones(settlementId),
    getSettlementNemeses(settlementId),
    getSettlementPatterns(settlementId),
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
    gear,
    innovations,
    milestones,
    nemeses,
    patterns,
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
 * Sums the collective cognition value based on settlement victories.
 *
 * @param settlementId Settlement ID
 * @returns Collective Cognition (or null)
 */
export async function getCollectiveCognition(
  settlementId: string | null | undefined
): Promise<number | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  let total = 0

  const supabase = createClient()

  // Each settlement nemesis victory gives 3 CC.
  const { data, error: getNemesesError } = await supabase
    .from('settlement_nemesis')
    .select(
      'collective_cognition_level_1, collective_cognition_level_2, collective_cognition_level_3'
    )
    .eq('settlement_id', settlementId)

  if (getNemesesError)
    throw new Error(`Error Fetching Settlement Nemeses: ${getNemesesError}`)

  for (const nemesis of data as Tables<'settlement_nemesis'>[]) {
    if (nemesis.collective_cognition_level_1) total += 3
    if (nemesis.collective_cognition_level_2) total += 3
    if (nemesis.collective_cognition_level_3) total += 3
  }

  // Each settlement quarry gives CC based on the victory level:
  // Prologue (1 CC), Level 1 (1 CC), Level 2 (2 CC), Level 3 (3 CC).
  const { data: quarries, error: getQuarriesError } = await supabase
    .from('settlement_quarry')
    .select(
      'collective_cognition_level_1, collective_cognition_level_2, collective_cognition_level_3, collective_cognition_prologue'
    )
    .eq('settlement_id', settlementId)

  if (getQuarriesError)
    throw new Error(`Error Fetching Settlement Quarries: ${getQuarriesError}`)

  for (const quarry of quarries as Tables<'settlement_quarry'>[]) {
    // Prologue and level 1 can grant CC one time each
    if (quarry.collective_cognition_prologue) total += 1
    if (quarry.collective_cognition_level_1) total += 1

    // Level 2 and level 3 can grant CC multiple times
    for (const level2 of quarry.collective_cognition_level_2)
      if (level2) total += 2
    for (const level3 of quarry.collective_cognition_level_3)
      if (level3) total += 3
  }

  return total
}

/**
 * Get Death Count
 *
 * Only includes survivors who are dead.
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
    .select('*', { count: 'exact', head: true })
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

  return data?.id || null
}

/**
 * Get Lost Settlement Count
 *
 * This is determined by evaluating the settlement's milestones. If there is a
 * milestone with the event name 'Game Over', and it is marked as complete, that
 * settlement has been lost.
 *
 * This does not include any settlements that have been shared with the user.
 * Only their unique settlements are included.
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
 * Only includes survivors who are not dead or retired.
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

  return data?.id || null
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

  return data?.id || null
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
