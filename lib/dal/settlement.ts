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
import { addInnovationsToSettlement } from '@/lib/dal/settlement-innovation'
import { addLocationsToSettlement } from '@/lib/dal/settlement-location'
import { addMilestonesToSettlement } from '@/lib/dal/settlement-milestone'
import { addNemesesToSettlement } from '@/lib/dal/settlement-nemesis'
import { addPrinciplesToSettlement } from '@/lib/dal/settlement-principle'
import { addQuarriesToSettlement } from '@/lib/dal/settlement-quarry'
import { addTimelineYearsToSettlement } from '@/lib/dal/settlement-timeline-year'
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

/**
 * Create Settlement
 *
 * Takes either the preselected campaign or custom campaign data and uses it to
 * create a new settlement.
 *
 * @param data Settlement Input Data
 */
export async function createSettlement(options: {
  /** Campaign Type */
  campaignType: CampaignType
  /** Settlement Name */
  settlementName: string
  /** Survivor Type */
  survivorType: SurvivorType
  /** Uses Scouts */
  usesScouts: boolean
  /** Monster IDs */
  monsters: {
    /** Node Quarry 1 IDs */
    NQ1: string[]
    /** Node Quarry 2 IDs */
    NQ2: string[]
    /** Node Quarry 3 IDs */
    NQ3: string[]
    /** Node Quarry 4 IDs */
    NQ4: string[]
    /** Node Nemesis 1 IDs */
    NN1: string[]
    /** Node Nemesis 2 IDs */
    NN2: string[]
    /** Node Nemesis 3 IDs */
    NN3: string[]
    /** Core Monster IDs */
    CO: string[]
    /** Finale Monster IDs */
    FI: string[]
  }
  /** Wanderer IDs */
  wanderers: string[]
}): Promise<void> {
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
  await addInnovationsToSettlement(template.innovationIds, settlementId)
  // Milestones
  await addMilestonesToSettlement(template.milestoneIds, settlementId)
  // Principles
  await addPrinciplesToSettlement(template.principleIds, settlementId)

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
  const nemesisIds = options.monsters.NN1.concat(
    options.monsters.NN2,
    options.monsters.NN3,
    options.monsters.CO,
    options.monsters.FI
  )
  await addNemesesToSettlement(nemesisIds, settlementId)

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
  const quarryIds = options.monsters.NQ1.concat(
    options.monsters.NQ2,
    options.monsters.NQ3,
    options.monsters.NQ4
  )
  await addQuarriesToSettlement(quarryIds, settlementId)

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
  await addWanderersToSettlement(options.wanderers, settlementId)

  for (const wandererId of options.wanderers)
    // Append any timeline entries to the settlement timeline.
    for (const timelineYear of await getWandererTimelineYears(wandererId))
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
  await addLocationsToSettlement(settlementLocationIds, settlementId)
  // Timeline Events
  await addTimelineYearsToSettlement(settlementTimeline)

  //////////////////////////////////////////////////////////////////////////////
  // Any final additions or customizations based on the campaign type.
  //////////////////////////////////////////////////////////////////////////////

  // Squires of the Citadel
  if (options.campaignType === CampaignType.SQUIRES_OF_THE_CITADEL)
    await addSquiresOfTheCitadelSurvivors(settlementId)
}

/**
 * Get Campaign Type
 *
 * Retrieves the selected settlement's campaign type.
 *
 * @param settlementId Settlement ID
 * @returns Campaign Type (or null)
 */
export async function getCampaignType(
  settlementId: string | null
): Promise<CampaignType | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement')
    .select('campaign_type')
    .eq('id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Campaign Type: ${error.message}`)

  return data?.campaign_type
    ? CampaignType[data.campaign_type as keyof typeof CampaignType]
    : null
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
  settlementId: string | null
): Promise<number | null> {
  if (!settlementId) return null

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
  settlementId: string | null
): Promise<number | null> {
  if (!settlementId) return null

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
  settlementId: string | null
): Promise<string | null> {
  if (!settlementId) return null

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
 * Get Lantern Research
 *
 * @param settlementId Settlement ID
 * @returns Lantern Research (or null)
 */
export async function getLanternResearch(
  settlementId: string | null
): Promise<number | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement')
    .select('lantern_research')
    .eq('id', settlementId)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Lantern Research: ${error.message}`)

  return data?.lantern_research ?? null
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
  settlementId: string | null
): Promise<number | null> {
  if (!settlementId) return null

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
  settlementId: string | null
): Promise<number | null> {
  if (!settlementId) return null

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
  settlementId: string | null
): Promise<string | null> {
  if (!settlementId) return null

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
  settlementId: string | null
): Promise<string | null> {
  if (!settlementId) return null

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
 * Get Survival Limit
 *
 * @param settlementId Settlement ID
 * @returns Survival Limit (or null)
 */
export async function getSurvivalLimit(
  settlementId: string | null
): Promise<number | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement')
    .select('survival_limit')
    .eq('id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Survival Limit: ${error.message}`)

  return data?.survival_limit ?? null
}

/**
 * Get Survivor Type
 *
 * Retrieves the selected settlement's survivor type.
 *
 * @param settlementId Settlement ID
 * @returns Survivor Type (or null)
 */
export async function getSurvivorType(
  settlementId: string | null
): Promise<SurvivorType> {
  if (!settlementId) return SurvivorType.CORE

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement')
    .select('survivor_type')
    .eq('id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Survivor Type: ${error.message}`)

  return data?.survivor_type
    ? SurvivorType[data.survivor_type as keyof typeof SurvivorType]
    : SurvivorType.CORE
}

/**
 * Update Lantern Research Level
 *
 * @param settlementId Settlement ID
 * @param value Lantern Research Level
 */
export async function updateLanternResearch(
  settlementId: string | null,
  value: number
): Promise<void> {
  if (!settlementId) return

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement')
    .update({ lantern_research: value })
    .eq('id', settlementId)

  if (error)
    throw new Error(`Error Updating Lantern Research: ${error.message}`)
}

/**
 * Update Survival Limit
 *
 * @param settlementId Settlement ID
 * @param value Survival Limit
 */
export async function updateSurvivalLimit(
  settlementId: string | null,
  value: number
): Promise<void> {
  if (!settlementId) return

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement')
    .update({ survival_limit: value })
    .eq('id', settlementId)

  if (error) throw new Error(`Error Updating Survial Limit: ${error.message}`)
}
