import { admin } from '@/__tests__/ui/helpers/supabase'

/** Settlement Creation Summary */
export interface SettlementCreationSummary {
  /** Campaign Type */
  campaign_type: string
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
  survivor_type: string
  /** Timeline Entries By Year */
  timelineEntriesByYear: Record<number, string[]>
  /** Uses Scouts */
  uses_scouts: boolean
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
  campaign_type: string
  id: string
  settlement_name: string
  survivor_type: string
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
