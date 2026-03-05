import { Tables } from '@/lib/database.types'
import { CampaignType, SurvivorType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'

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
