import { admin } from '@/__tests__/ui/helpers/supabase'
import { type Database } from '@/lib/database.types'

type HuntEventType = Database['public']['Enums']['hunt_event_type']
type EncounterMonsterLevelInsert =
  Database['public']['Tables']['encounter_monster_level']['Insert']
type SettlementPhaseStep = Database['public']['Enums']['settlement_phase_step']
type ShowdownTurn = Database['public']['Enums']['showdown_turn']

/** Survivor Fixture */
export interface GameplaySurvivorFixture {
  /** Survivor ID */
  id: string
  /** Survivor Name */
  name: string
}

/** Active Hunt Fixture Result */
export interface ActiveHuntFixtureResult {
  /** Hunt Board ID */
  boardId: string
  /** Hunt ID */
  huntId: string
}

/** Active Hunt Summary */
export interface ActiveHuntSummary {
  /** Hunt AI Deck Count */
  aiDeckCount: number
  /** Hunt Board Count */
  boardCount: number
  /** Hunt Monster Count */
  monsterCount: number
  /** Hunt Survivor Count */
  survivorCount: number
}

/** Active Showdown Summary */
export interface ActiveShowdownSummary {
  /** Showdown AI Deck Count */
  aiDeckCount: number
  /** Showdown Monster Count */
  monsterCount: number
  /** Showdown Survivor Count */
  survivorCount: number
}

/** Active Encounter Summary */
export interface ActiveEncounterSummary {
  /** Encounter Monster Count */
  monsterCount: number
  /** Encounter Survivor Count */
  survivorCount: number
}

/** Create Gameplay Survivor Fixtures */
export async function createGameplaySurvivorsFixture({
  count,
  prefix,
  settlementId
}: {
  count: number
  prefix: string
  settlementId: string
}): Promise<GameplaySurvivorFixture[]> {
  const survivors: GameplaySurvivorFixture[] = []

  for (let index = 1; index <= count; index += 1) {
    const name = `${prefix} ${index}`
    const { data, error } = await admin
      .from('survivor')
      .insert({
        gender: index % 2 === 0 ? 'MALE' : 'FEMALE',
        settlement_id: settlementId,
        survivor_name: name,
        survival: 1
      })
      .select('id')
      .single()

    if (error) throw new Error(`create survivor failed: ${error.message}`)

    survivors.push({ id: data.id, name })
  }

  return survivors
}

/** Unlock Quarry Fixture */
export async function unlockQuarryFixture(
  settlementId: string,
  monsterName = 'White Lion'
): Promise<string> {
  const quarryId = await findCatalogId('quarry', monsterName)
  const { error } = await admin.from('settlement_quarry').insert({
    quarry_id: quarryId,
    settlement_id: settlementId,
    unlocked: true
  })

  if (error) throw new Error(`unlock quarry failed: ${error.message}`)

  return quarryId
}

/** Unlock Nemesis Fixture */
export async function unlockNemesisFixture(
  settlementId: string,
  monsterName = 'Butcher'
): Promise<string> {
  const nemesisId = await findCatalogId('nemesis', monsterName)
  const { error } = await admin.from('settlement_nemesis').insert({
    nemesis_id: nemesisId,
    settlement_id: settlementId,
    unlocked: true
  })

  if (error) throw new Error(`unlock nemesis failed: ${error.message}`)

  return nemesisId
}

/** Create Encounter Monster Fixture */
export async function createEncounterMonsterFixture({
  monsterName,
  subMonsterNames = [],
  userId
}: {
  monsterName: string
  subMonsterNames?: string[]
  userId: string
}): Promise<{ levelId: string; monsterId: string }> {
  const { data: monster, error: monsterError } = await admin
    .from('encounter_monster')
    .insert({
      basic_action: 'Claw at the lantern light.',
      custom: true,
      instinct: 'Rush the closest survivor.',
      monster_name: monsterName,
      user_id: userId
    })
    .select('id')
    .single()

  if (monsterError)
    throw new Error(`create encounter monster failed: ${monsterError.message}`)

  const levelRows: EncounterMonsterLevelInsert[] =
    subMonsterNames.length > 0
      ? subMonsterNames.map((subMonsterName, index) => ({
          accuracy: index % 2 === 0 ? 4 : 3,
          damage: 1,
          encounter_monster_id: monster.id,
          evasion: index % 2 === 0 ? 0 : 1,
          level_number: 1,
          life: 6,
          luck: 0,
          movement: 5,
          speed: 2,
          sub_monster_name: subMonsterName,
          toughness: 7
        }))
      : [
          {
            accuracy: 4,
            damage: 1,
            encounter_monster_id: monster.id,
            evasion: 0,
            level_number: 1,
            life: 6,
            luck: 1,
            movement: 5,
            speed: 2,
            sub_monster_name: null,
            toughness: 7
          }
        ]

  const { data: levels, error: levelError } = await admin
    .from('encounter_monster_level')
    .insert(levelRows)
    .select('id')
    .order('id')

  if (levelError)
    throw new Error(
      `create encounter monster level failed: ${levelError.message}`
    )

  return { levelId: levels[0].id, monsterId: monster.id }
}

/** Add Survivor Gear Grid Fixture */
export async function addSurvivorGearGridFixture({
  gearName,
  settlementId,
  survivorId
}: {
  gearName: string
  settlementId: string
  survivorId: string
}): Promise<string> {
  const gearId = await findGearId(gearName)
  const { error: storageError } = await admin.from('settlement_gear').insert({
    gear_id: gearId,
    quantity: 1,
    settlement_id: settlementId
  })

  if (storageError)
    throw new Error(`settlement gear insert failed: ${storageError.message}`)

  const { error } = await admin.from('gear_grid').insert({
    pos_top_left: gearId,
    settlement_id: settlementId,
    survivor_id: survivorId
  })

  if (error) throw new Error(`gear grid insert failed: ${error.message}`)

  const { error: reduceError } = await admin
    .from('settlement_gear')
    .update({ quantity: 0 })
    .eq('gear_id', gearId)
    .eq('settlement_id', settlementId)

  if (reduceError)
    throw new Error(`settlement gear reduction failed: ${reduceError.message}`)

  return gearId
}

/** Create Active Hunt Fixture */
export async function createActiveHuntFixture({
  settlementId,
  survivorIds
}: {
  settlementId: string
  survivorIds: string[]
}): Promise<ActiveHuntFixtureResult> {
  const { data: hunt, error: huntError } = await admin
    .from('hunt')
    .insert({
      monster_level: 1,
      monster_position: 6,
      settlement_id: settlementId,
      survivor_position: 0
    })
    .select('id')
    .single()

  if (huntError)
    throw new Error(`create active hunt failed: ${huntError.message}`)

  const { data: board, error: boardError } = await admin
    .from('hunt_hunt_board')
    .insert({
      hunt_id: hunt.id,
      settlement_id: settlementId
    })
    .select('id')
    .single()

  if (boardError)
    throw new Error(`create active hunt board failed: ${boardError.message}`)

  const { data: aiDeck, error: aiDeckError } = await admin
    .from('hunt_ai_deck')
    .insert({ hunt_id: hunt.id, settlement_id: settlementId })
    .select('id')
    .single()

  if (aiDeckError)
    throw new Error(`create hunt ai deck failed: ${aiDeckError.message}`)

  const { error: monsterError } = await admin.from('hunt_monster').insert({
    ai_deck_id: aiDeck.id,
    hunt_id: hunt.id,
    monster_name: 'White Lion',
    settlement_id: settlementId
  })

  if (monsterError)
    throw new Error(`create hunt monster failed: ${monsterError.message}`)

  const { error: survivorError } = await admin.from('hunt_survivor').insert(
    survivorIds.map((survivorId) => ({
      hunt_id: hunt.id,
      settlement_id: settlementId,
      survivor_id: survivorId
    }))
  )

  if (survivorError)
    throw new Error(`create hunt survivors failed: ${survivorError.message}`)

  return { boardId: board.id, huntId: hunt.id }
}

/** Create Settlement Phase At Step Fixture */
export async function createSettlementPhaseAtStepFixture({
  returningSurvivorIds = [],
  settlementId,
  step
}: {
  returningSurvivorIds?: string[]
  settlementId: string
  step: SettlementPhaseStep
}): Promise<string> {
  const { data, error } = await admin
    .from('settlement_phase')
    .insert({ settlement_id: settlementId, step })
    .select('id')
    .single()

  if (error) throw new Error(`create settlement phase failed: ${error.message}`)

  if (returningSurvivorIds.length > 0) {
    const { error: returningError } = await admin
      .from('settlement_phase_returning_survivor')
      .insert(
        returningSurvivorIds.map((survivorId) => ({
          settlement_id: settlementId,
          settlement_phase_id: data.id,
          survivor_id: survivorId
        }))
      )

    if (returningError)
      throw new Error(
        `create returning survivors failed: ${returningError.message}`
      )
  }

  return data.id
}

/** Wait For Active Hunt */
export async function waitForActiveHunt(settlementId: string) {
  return waitForRow('hunt', 'settlement_id', settlementId, true)
}

/** Wait For No Active Hunt */
export async function waitForNoActiveHunt(settlementId: string): Promise<void> {
  await waitForRow('hunt', 'settlement_id', settlementId, false)
}

/** Wait For Active Showdown */
export async function waitForActiveShowdown(settlementId: string) {
  return waitForRow('showdown', 'settlement_id', settlementId, true)
}

/** Wait For Active Encounter */
export async function waitForActiveEncounter(settlementId: string) {
  return waitForRow('encounter', 'settlement_id', settlementId, true)
}

/** Wait For No Active Showdown */
export async function waitForNoActiveShowdown(
  settlementId: string
): Promise<void> {
  await waitForRow('showdown', 'settlement_id', settlementId, false)
}

/** Wait For No Active Encounter */
export async function waitForNoActiveEncounter(
  settlementId: string
): Promise<void> {
  await waitForRow('encounter', 'settlement_id', settlementId, false)
}

/** Wait For Active Settlement Phase */
export async function waitForActiveSettlementPhase(settlementId: string) {
  return waitForRow('settlement_phase', 'settlement_id', settlementId, true)
}

/** Count Hunts For Settlement */
export async function countHuntsForSettlement(
  settlementId: string
): Promise<number> {
  return countRows('hunt', 'settlement_id', settlementId)
}

/** Get Hunt Summary */
export async function getHuntSummary(
  huntId: string
): Promise<ActiveHuntSummary> {
  const [boardCount, aiDeckCount, monsterCount, survivorCount] =
    await Promise.all([
      countRows('hunt_hunt_board', 'hunt_id', huntId),
      countRows('hunt_ai_deck', 'hunt_id', huntId),
      countRows('hunt_monster', 'hunt_id', huntId),
      countRows('hunt_survivor', 'hunt_id', huntId)
    ])

  return { aiDeckCount, boardCount, monsterCount, survivorCount }
}

/** Get Hunt Board Space */
export async function getHuntBoardSpace(
  huntId: string,
  position: number
): Promise<HuntEventType> {
  const column = `pos_${position}`
  const { data, error } = await admin
    .from('hunt_hunt_board')
    .select(column)
    .eq('hunt_id', huntId)
    .single()

  if (error) throw new Error(`hunt board lookup failed: ${error.message}`)

  return (data as unknown as Record<string, HuntEventType>)[column]
}

/** Get Showdown Summary */
export async function getShowdownSummary(
  showdownId: string
): Promise<ActiveShowdownSummary> {
  const [aiDeckCount, monsterCount, survivorCount] = await Promise.all([
    countRows('showdown_ai_deck', 'showdown_id', showdownId),
    countRows('showdown_monster', 'showdown_id', showdownId),
    countRows('showdown_survivor', 'showdown_id', showdownId)
  ])

  return { aiDeckCount, monsterCount, survivorCount }
}

/** Get Encounter Summary */
export async function getEncounterSummary(
  encounterId: string
): Promise<ActiveEncounterSummary> {
  const [monsterCount, survivorCount] = await Promise.all([
    countRows('encounter_active_monster', 'encounter_id', encounterId),
    countRows('encounter_survivor', 'encounter_id', encounterId)
  ])

  return { monsterCount, survivorCount }
}

/** Get Encounter Survivor Bleeding Tokens */
export async function getEncounterSurvivorBleedingTokens(
  encounterId: string,
  survivorId: string
): Promise<number> {
  return getPhaseSurvivorBleedingTokens(
    'encounter_survivor',
    'encounter_id',
    encounterId,
    survivorId
  )
}

/** Find Encounter Survivor With Bleeding Tokens */
export async function findEncounterSurvivorWithBleedingTokens(
  encounterId: string,
  bleedingTokens: number
): Promise<string | null> {
  return findPhaseSurvivorWithBleedingTokens(
    'encounter_survivor',
    'encounter_id',
    encounterId,
    bleedingTokens
  )
}

/** Get Hunt Survivor Bleeding Tokens */
export async function getHuntSurvivorBleedingTokens(
  huntId: string,
  survivorId: string
): Promise<number> {
  return getPhaseSurvivorBleedingTokens(
    'hunt_survivor',
    'hunt_id',
    huntId,
    survivorId
  )
}

/** Get Showdown Survivor Bleeding Tokens */
export async function getShowdownSurvivorBleedingTokens(
  showdownId: string,
  survivorId: string
): Promise<number> {
  return getPhaseSurvivorBleedingTokens(
    'showdown_survivor',
    'showdown_id',
    showdownId,
    survivorId
  )
}

/** Get Showdown Turn */
export async function getShowdownTurn(
  showdownId: string
): Promise<ShowdownTurn> {
  const { data, error } = await admin
    .from('showdown')
    .select('turn')
    .eq('id', showdownId)
    .single()

  if (error) throw new Error(`showdown turn lookup failed: ${error.message}`)

  return data.turn as ShowdownTurn
}

/** Get Settlement Phase Step */
export async function getSettlementPhaseStep(
  settlementPhaseId: string
): Promise<SettlementPhaseStep> {
  const { data, error } = await admin
    .from('settlement_phase')
    .select('step')
    .eq('id', settlementPhaseId)
    .single()

  if (error)
    throw new Error(`settlement phase step lookup failed: ${error.message}`)

  return data.step as SettlementPhaseStep
}

/** Count Returning Survivors */
export async function countReturningSurvivors(
  settlementPhaseId: string
): Promise<number> {
  return countRows(
    'settlement_phase_returning_survivor',
    'settlement_phase_id',
    settlementPhaseId
  )
}

async function findCatalogId(
  table: 'nemesis' | 'quarry',
  monsterName: string
): Promise<string> {
  const { data, error } = await admin
    .from(table)
    .select('id')
    .eq('monster_name', monsterName)
    .single()

  if (error) throw new Error(`${table} lookup failed: ${error.message}`)

  return data.id
}

async function findGearId(gearName: string): Promise<string> {
  const { data, error } = await admin
    .from('gear')
    .select('id')
    .eq('gear_name', gearName)
    .eq('custom', false)
    .single()

  if (error) throw new Error(`gear lookup failed: ${error.message}`)

  return data.id
}

async function waitForRow(
  table: 'encounter' | 'hunt' | 'settlement_phase' | 'showdown',
  column: string,
  value: string,
  shouldExist: true
): Promise<Record<string, unknown>>
async function waitForRow(
  table: 'encounter' | 'hunt' | 'settlement_phase' | 'showdown',
  column: string,
  value: string,
  shouldExist: false
): Promise<void>
async function waitForRow(
  table: 'encounter' | 'hunt' | 'settlement_phase' | 'showdown',
  column: string,
  value: string,
  shouldExist: boolean
): Promise<Record<string, unknown> | void> {
  const timeoutAt = Date.now() + 10_000

  while (Date.now() < timeoutAt) {
    const { data, error } = await admin
      .from(table)
      .select('*')
      .eq(column, value)
      .maybeSingle()

    if (error) throw new Error(`${table} lookup failed: ${error.message}`)
    if (shouldExist && data) return data as Record<string, unknown>
    if (!shouldExist && !data) return

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(
    `Timed out waiting for ${table}.${column}=${value} ${
      shouldExist ? 'to exist' : 'to clear'
    }`
  )
}

async function countRows(
  table: string,
  column: string,
  value: string
): Promise<number> {
  const { count, error } = await admin
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq(column, value)

  if (error) throw new Error(`${table} count failed: ${error.message}`)

  return count ?? 0
}

async function getPhaseSurvivorBleedingTokens(
  table: 'encounter_survivor' | 'hunt_survivor' | 'showdown_survivor',
  phaseColumn: 'encounter_id' | 'hunt_id' | 'showdown_id',
  phaseId: string,
  survivorId: string
): Promise<number> {
  const { data, error } = await admin
    .from(table)
    .select('bleeding_tokens')
    .eq(phaseColumn, phaseId)
    .eq('survivor_id', survivorId)
    .single<{ bleeding_tokens: number }>()

  if (error)
    throw new Error(`${table} bleeding lookup failed: ${error.message}`)

  return data.bleeding_tokens
}

async function findPhaseSurvivorWithBleedingTokens(
  table: 'encounter_survivor' | 'hunt_survivor' | 'showdown_survivor',
  phaseColumn: 'encounter_id' | 'hunt_id' | 'showdown_id',
  phaseId: string,
  bleedingTokens: number
): Promise<string | null> {
  const { data, error } = await admin
    .from(table)
    .select('survivor_id')
    .eq(phaseColumn, phaseId)
    .eq('bleeding_tokens', bleedingTokens)
    .limit(1)

  if (error)
    throw new Error(`${table} bleeding search failed: ${error.message}`)

  return data?.[0]?.survivor_id ?? null
}
