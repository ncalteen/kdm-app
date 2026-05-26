import { admin } from '@/__tests__/ui/helpers/supabase'
import { type Database } from '@/lib/database.types'
import { type PlanSlug } from '@/lib/types'

type DatabaseCampaignType = Database['public']['Enums']['campaign_type']
type DatabaseSurvivorType = Database['public']['Enums']['survivor_type']

/** Settlement Fixture Options */
export interface SettlementFixtureOptions {
  /** Campaign Type */
  campaignType?: DatabaseCampaignType
  /** Settlement Name */
  name: string
  /** Survivor Type */
  survivorType?: DatabaseSurvivorType
  /** Survival Limit */
  survivalLimit?: number
  /** Uses Scouts */
  usesScouts?: boolean
  /** User ID */
  userId: string
}

/** Settlement Creation Summary */
export interface SettlementCreationSummary {
  /** Campaign Type */
  campaign_type: DatabaseCampaignType
  /** Settlement ID */
  id: string
  /** Quarry Names */
  quarryNames: string[]
  /** Nemesis Names */
  nemesisNames: string[]
  /** Settlement Name */
  settlement_name: string
  /** Survivor Count */
  survivorCount: number
  /** Survivor Type */
  survivor_type: DatabaseSurvivorType
  /** Timeline Entries By Year */
  timelineEntriesByYear: Record<number, string[]>
  /** Uses Scouts */
  uses_scouts: boolean
}

/**
 * Create Settlement Fixture
 *
 * Creates a minimal owned settlement directly through the service-role client.
 *
 * @param options Settlement Fixture Options
 * @returns Settlement ID
 */
export async function createSettlementFixture(
  options: SettlementFixtureOptions
): Promise<string> {
  const { data, error } = await admin
    .from('settlement')
    .insert({
      campaign_type: options.campaignType ?? 'PEOPLE_OF_THE_LANTERN',
      settlement_name: options.name,
      survival_limit: options.survivalLimit ?? 1,
      survivor_type: options.survivorType ?? 'CORE',
      uses_scouts: options.usesScouts ?? false,
      user_id: options.userId
    })
    .select('id')
    .single()

  if (error) throw new Error(`create settlement failed: ${error.message}`)

  return data.id
}

/**
 * Share Settlement Fixture
 *
 * @param args Share Fixture Data
 */
export async function shareSettlementFixture(args: {
  settlementId: string
  sharedUserId: string
  ownerId: string
}): Promise<void> {
  const { error } = await admin.from('settlement_shared_user').insert({
    settlement_id: args.settlementId,
    shared_user_id: args.sharedUserId,
    user_id: args.ownerId
  })

  if (error) throw new Error(`share settlement failed: ${error.message}`)
}

/**
 * Set Subscription Plan Fixture
 *
 * @param userId User ID
 * @param planId Plan ID
 */
export async function setSubscriptionPlanFixture(
  userId: string,
  planId: PlanSlug
): Promise<void> {
  const { error } = await admin
    .from('user_subscription')
    .update({ plan_id: planId, status: 'active' })
    .eq('user_id', userId)

  if (error) throw new Error(`update subscription failed: ${error.message}`)
}

/**
 * Create Settlement List Fixtures
 *
 * @param userId User ID
 * @param prefix Settlement Name Prefix
 * @param count Number Of Settlements To Create
 * @returns Created Settlement IDs
 */
export async function createSettlementListFixtures(
  userId: string,
  prefix: string,
  count: number
): Promise<string[]> {
  const settlementIds: string[] = []

  for (let index = 1; index <= count; index += 1) {
    const id = await createSettlementFixture({
      name: `${prefix} ${index}`,
      userId
    })
    settlementIds.push(id)
  }

  return settlementIds
}

/** Create Hunt Fixture */
export async function createHuntFixture(settlementId: string): Promise<string> {
  const { data, error } = await admin
    .from('hunt')
    .insert({ monster_level: 1, settlement_id: settlementId })
    .select('id')
    .single()

  if (error) throw new Error(`create hunt failed: ${error.message}`)

  return data.id
}

/** Create Showdown Fixture */
export async function createShowdownFixture(
  settlementId: string
): Promise<string> {
  const { data, error } = await admin
    .from('showdown')
    .insert({ monster_level: 1, settlement_id: settlementId })
    .select('id')
    .single()

  if (error) throw new Error(`create showdown failed: ${error.message}`)

  return data.id
}

/** Create Settlement Phase Fixture */
export async function createSettlementPhaseFixture(
  settlementId: string
): Promise<string> {
  const { data, error } = await admin
    .from('settlement_phase')
    .insert({ settlement_id: settlementId })
    .select('id')
    .single()

  if (error) throw new Error(`create settlement phase failed: ${error.message}`)

  return data.id
}

/**
 * Settlement Exists
 *
 * @param settlementId Settlement ID
 * @returns Whether Settlement Exists
 */
export async function settlementExists(settlementId: string): Promise<boolean> {
  const { data, error } = await admin
    .from('settlement')
    .select('id')
    .eq('id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`settlement lookup failed: ${error.message}`)

  return Boolean(data)
}

/** Hunt Exists */
export async function huntExists(huntId: string): Promise<boolean> {
  const { data, error } = await admin
    .from('hunt')
    .select('id')
    .eq('id', huntId)
    .maybeSingle()

  if (error) throw new Error(`hunt lookup failed: ${error.message}`)

  return Boolean(data)
}

/** Showdown Exists */
export async function showdownExists(showdownId: string): Promise<boolean> {
  const { data, error } = await admin
    .from('showdown')
    .select('id')
    .eq('id', showdownId)
    .maybeSingle()

  if (error) throw new Error(`showdown lookup failed: ${error.message}`)

  return Boolean(data)
}

/** Settlement Phase Exists */
export async function settlementPhaseExists(
  settlementPhaseId: string
): Promise<boolean> {
  const { data, error } = await admin
    .from('settlement_phase')
    .select('id')
    .eq('id', settlementPhaseId)
    .maybeSingle()

  if (error) throw new Error(`settlement phase lookup failed: ${error.message}`)

  return Boolean(data)
}

/**
 * Get Settlement Uses Scouts
 *
 * @param settlementId Settlement ID
 * @returns Uses Scouts
 */
export async function getSettlementUsesScouts(
  settlementId: string
): Promise<boolean> {
  const { data, error } = await admin
    .from('settlement')
    .select('uses_scouts')
    .eq('id', settlementId)
    .single()

  if (error) throw new Error(`scout setting lookup failed: ${error.message}`)

  return data.uses_scouts
}

/**
 * Wait For Settlement Uses Scouts
 *
 * @param settlementId Settlement ID
 * @param expected Expected Uses Scouts Value
 */
export async function waitForSettlementUsesScouts(
  settlementId: string,
  expected: boolean
): Promise<void> {
  const timeoutAt = Date.now() + 10_000

  while (Date.now() < timeoutAt) {
    if ((await getSettlementUsesScouts(settlementId)) === expected) return
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for uses_scouts=${expected}`)
}

/**
 * Wait For Settlement Creation Summary
 *
 * Polls until a settlement with the supplied name exists for the user, then
 * returns the persisted campaign defaults used by the UI creation matrix.
 *
 * @param userId User ID
 * @param settlementName Settlement Name
 * @returns Settlement Creation Summary
 */
export async function waitForSettlementCreationSummary(
  userId: string,
  settlementName: string
): Promise<SettlementCreationSummary> {
  const timeoutAt = Date.now() + 10_000

  while (Date.now() < timeoutAt) {
    const settlement = await findSettlementByName(userId, settlementName)
    if (settlement) return getSettlementCreationSummary(settlement)

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for settlement ${settlementName}`)
}

/**
 * Count Settlements For User
 *
 * @param userId User ID
 * @returns Owned Settlement Count
 */
export async function countSettlementsForUser(userId: string): Promise<number> {
  const { count, error } = await admin
    .from('settlement')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw new Error(`settlement count failed: ${error.message}`)

  return count ?? 0
}

interface SettlementRow {
  campaign_type: DatabaseCampaignType
  id: string
  settlement_name: string
  survivor_type: DatabaseSurvivorType
  uses_scouts: boolean
}

async function findSettlementByName(
  userId: string,
  settlementName: string
): Promise<SettlementRow | null> {
  const { data, error } = await admin
    .from('settlement')
    .select('id, settlement_name, campaign_type, survivor_type, uses_scouts')
    .eq('user_id', userId)
    .eq('settlement_name', settlementName)
    .maybeSingle()

  if (error) throw new Error(`settlement lookup failed: ${error.message}`)

  return data
}

async function getSettlementCreationSummary(
  settlement: SettlementRow
): Promise<SettlementCreationSummary> {
  const [quarryNames, nemesisNames, survivorCount, timelineEntriesByYear] =
    await Promise.all([
      getRelatedMonsterNames({
        junctionTable: 'settlement_quarry',
        targetTable: 'quarry',
        targetIdColumn: 'quarry_id',
        settlementId: settlement.id
      }),
      getRelatedMonsterNames({
        junctionTable: 'settlement_nemesis',
        targetTable: 'nemesis',
        targetIdColumn: 'nemesis_id',
        settlementId: settlement.id
      }),
      countSurvivors(settlement.id),
      getTimelineEntriesByYear(settlement.id)
    ])

  return {
    ...settlement,
    quarryNames,
    nemesisNames,
    survivorCount,
    timelineEntriesByYear
  }
}

async function getRelatedMonsterNames({
  junctionTable,
  targetTable,
  targetIdColumn,
  settlementId
}: {
  junctionTable: 'settlement_quarry' | 'settlement_nemesis'
  targetTable: 'quarry' | 'nemesis'
  targetIdColumn: 'quarry_id' | 'nemesis_id'
  settlementId: string
}): Promise<string[]> {
  const { data: junctionRows, error: junctionError } = await admin
    .from(junctionTable)
    .select(targetIdColumn)
    .eq('settlement_id', settlementId)

  if (junctionError)
    throw new Error(`${junctionTable} lookup failed: ${junctionError.message}`)

  const monsterIds = (junctionRows ?? [])
    .map((row) => (row as Record<string, unknown>)[targetIdColumn])
    .filter((id): id is string => typeof id === 'string')

  if (monsterIds.length === 0) return []

  const { data: monsterRows, error: monsterError } = await admin
    .from(targetTable)
    .select('monster_name')
    .in('id', monsterIds)

  if (monsterError)
    throw new Error(`${targetTable} lookup failed: ${monsterError.message}`)

  return (monsterRows ?? [])
    .map((row) => row.monster_name)
    .filter((name): name is string => typeof name === 'string')
    .sort((a, b) => a.localeCompare(b))
}

async function countSurvivors(settlementId: string): Promise<number> {
  const { count, error } = await admin
    .from('survivor')
    .select('id', { count: 'exact', head: true })
    .eq('settlement_id', settlementId)

  if (error) throw new Error(`survivor count failed: ${error.message}`)

  return count ?? 0
}

async function getTimelineEntriesByYear(
  settlementId: string
): Promise<Record<number, string[]>> {
  const { data, error } = await admin
    .from('settlement_timeline_year')
    .select('year_number, entries')
    .eq('settlement_id', settlementId)

  if (error) throw new Error(`timeline lookup failed: ${error.message}`)

  return Object.fromEntries(
    (data ?? []).map((row) => [row.year_number, row.entries ?? []])
  )
}
