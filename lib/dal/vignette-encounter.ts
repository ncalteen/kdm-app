import { toGearDetail } from '@/lib/dal/gear'
import {
  resolveSettlementAuthorship,
  type SettlementMemberProfile
} from '@/lib/dal/settlement-shared-user'
import { getUserId, lookupUserByUsername } from '@/lib/dal/user'
import type { TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import type {
  CatalogAuthorshipDetail,
  GearDetail,
  VignetteEncounterAIDeckDetail,
  VignetteEncounterDetail,
  VignetteEncounterMonsterDetail,
  VignetteEncounterSharedUserDetail,
  VignetteEncounterSummary,
  VignetteEncounterSurvivorDetail,
  VignetteEncounterSurvivorLiveState,
  VignetteMonsterDetail
} from '@/lib/types'
import type {
  VignetteCreateInput,
  VignetteEncounterAIDeckUpdateInput,
  VignetteEncounterDeleteInput,
  VignetteEncounterMonsterMoodInput,
  VignetteEncounterMonsterStateDeleteInput,
  VignetteEncounterMonsterSurvivorStatusInput,
  VignetteEncounterMonsterTraitInput,
  VignetteEncounterMonsterUpdateInput,
  VignetteEncounterSurvivorGearGridUpdateInput,
  VignetteEncounterSurvivorLiveStateUpdateInput,
  VignetteEncounterUpdateInput,
  VignetteShareInput,
  VignetteShareRemovalInput
} from '@/schemas/vignette-encounter'

type DataRow = Record<string, unknown>
type VignetteEncounterSurvivorAbilityImpairmentInput = Omit<
  TablesInsert<'vignette_encounter_survivor_ability_impairment'>,
  'created_at' | 'id' | 'updated_at'
>
type VignetteEncounterSurvivorDisorderInput = Omit<
  TablesInsert<'vignette_encounter_survivor_disorder'>,
  'created_at' | 'id' | 'updated_at'
>
type VignetteEncounterSurvivorFightingArtInput = Omit<
  TablesInsert<'vignette_encounter_survivor_fighting_art'>,
  'created_at' | 'id' | 'updated_at'
>
type VignetteEncounterSurvivorSecretFightingArtInput = Omit<
  TablesInsert<'vignette_encounter_survivor_secret_fighting_art'>,
  'created_at' | 'id' | 'updated_at'
>

const EMPTY_MEMBER_PROFILES = new Map<string, SettlementMemberProfile>()

/** Catalog Authorship Select Statement */
const CATALOG_AUTHORSHIP_SELECT = 'custom, id, rules, user_id'

/** Gear Select Statement */
const GEAR_SELECT = [
  'accessory',
  'accuracy',
  'affinity_bonus',
  'affinity_bonus_requirements',
  'affinity_bottom',
  'affinity_left',
  'affinity_right',
  'affinity_top',
  'armor_location',
  'armor_points',
  'custom',
  'gear_name',
  'id',
  'keywords',
  'location_id',
  'rules',
  'speed',
  'strength',
  'user_id',
  'weapon_type_id',
  'gear_gear_cost!gear_gear_cost_gear_id_fkey(cost_gear_id, quantity)',
  'gear_resource_cost(resource_id, quantity)',
  'gear_resource_type_cost(resource_type, quantity)'
].join(', ')

/**
 * Vignette Monster Select Statement
 *
 * Includes the survivors that are associated with the monster.
 */
const VIGNETTE_MONSTER_SELECT = [
  'id',
  'monster_name',
  'multi_monster',
  'source_monster_type',
  'source_nemesis_id',
  'source_quarry_id',
  [
    'vignette_monster_level(',
    [
      'accuracy',
      'accuracy_tokens',
      'advanced_cards',
      'ai_deck_remaining',
      'basic_cards',
      'damage',
      'damage_tokens',
      'evasion',
      'evasion_tokens',
      'id',
      'legendary_cards',
      'level_number',
      'life',
      'luck',
      'luck_tokens',
      'movement',
      'movement_tokens',
      'overtone_cards',
      'speed',
      'speed_tokens',
      'strength',
      'strength_tokens',
      'sub_monster_name',
      'toughness',
      'toughness_tokens',
      'vignette_monster_id',
      `vignette_monster_level_mood(id, mood_id, vignette_monster_level_id, mood(${CATALOG_AUTHORSHIP_SELECT}, mood_name))`,
      `vignette_monster_level_trait(id, trait_id, vignette_monster_level_id, trait(${CATALOG_AUTHORSHIP_SELECT}, trait_name))`,
      `vignette_monster_level_survivor_status(id, survivor_status_id, vignette_monster_level_id, survivor_status(${CATALOG_AUTHORSHIP_SELECT}, survivor_status_name))`
    ].join(', '),
    ')'
  ].join(''),
  [
    'vignette_survivor(',
    [
      'accuracy',
      'arm_armor',
      'body_armor',
      'courage',
      'evasion',
      'gender',
      'head_armor',
      'id',
      'insanity',
      'leg_armor',
      'luck',
      'movement',
      'notes',
      'speed',
      'strength',
      'survival',
      'survivor_name',
      'survivor_type',
      'understanding',
      'vignette_monster_id',
      'waist_armor',
      'weapon_proficiency',
      'weapon_type_id',
      `vignette_survivor_ability_impairment(id, ability_impairment_id, vignette_survivor_id, ability_impairment(${CATALOG_AUTHORSHIP_SELECT}, ability_impairment_name))`,
      `vignette_survivor_disorder(id, disorder_id, vignette_survivor_id, disorder(${CATALOG_AUTHORSHIP_SELECT}, disorder_name))`,
      `vignette_survivor_fighting_art(id, fighting_art_id, vignette_survivor_id, fighting_art(${CATALOG_AUTHORSHIP_SELECT}, fighting_art_name))`,
      `vignette_survivor_secret_fighting_art(id, secret_fighting_art_id, vignette_survivor_id, secret_fighting_art(${CATALOG_AUTHORSHIP_SELECT}, secret_fighting_art_name))`,
      `vignette_survivor_gear_grid(id, column_number, gear_id, row_number, vignette_survivor_id, gear(${GEAR_SELECT}))`
    ].join(', '),
    ')'
  ].join('')
].join(', ')

/**
 * Vignette Encounter Survivor Select Statement
 *
 * Includes the survivors that are part of this specific encounter.
 */
const VIGNETTE_ENCOUNTER_SURVIVOR_SELECT = [
  'accuracy',
  'accuracy_tokens',
  'activation_used',
  'arm_armor',
  'arm_heavy_damage',
  'arm_light_damage',
  'bleeding_tokens',
  'block_tokens',
  'body_armor',
  'body_heavy_damage',
  'body_light_damage',
  'brain_light_damage',
  'courage',
  'dead',
  'deflect_tokens',
  'evasion',
  'evasion_tokens',
  'gender',
  'head_armor',
  'head_heavy_damage',
  'id',
  'insanity',
  'insanity_tokens',
  'knocked_down',
  'leg_armor',
  'leg_heavy_damage',
  'leg_light_damage',
  'luck',
  'luck_tokens',
  'movement',
  'movement_tokens',
  'movement_used',
  'notes',
  'priority_target',
  'retired',
  'scout',
  'source_vignette_survivor_id',
  'speed',
  'speed_tokens',
  'strength',
  'strength_tokens',
  'survival',
  'survival_tokens',
  'survivor_name',
  'survivor_type',
  'understanding',
  'vignette_encounter_id',
  'vignette_monster_id',
  'waist_armor',
  'waist_heavy_damage',
  'waist_light_damage',
  'weapon_proficiency',
  'weapon_type_id',
  `vignette_encounter_survivor_ability_impairment(id, ability_impairment_id, source_vignette_survivor_ability_impairment_id, vignette_encounter_survivor_id, ability_impairment(${CATALOG_AUTHORSHIP_SELECT}, ability_impairment_name))`,
  `vignette_encounter_survivor_disorder(id, disorder_id, source_vignette_survivor_disorder_id, vignette_encounter_survivor_id, disorder(${CATALOG_AUTHORSHIP_SELECT}, disorder_name))`,
  `vignette_encounter_survivor_fighting_art(id, fighting_art_id, source_vignette_survivor_fighting_art_id, vignette_encounter_survivor_id, fighting_art(${CATALOG_AUTHORSHIP_SELECT}, fighting_art_name))`,
  `vignette_encounter_survivor_secret_fighting_art(id, secret_fighting_art_id, source_vignette_survivor_secret_fighting_art_id, vignette_encounter_survivor_id, secret_fighting_art(${CATALOG_AUTHORSHIP_SELECT}, secret_fighting_art_name))`,
  `vignette_encounter_survivor_gear_grid(id, column_number, gear_id, row_number, source_vignette_survivor_gear_grid_id, vignette_encounter_survivor_id, gear(${GEAR_SELECT}))`
].join(', ')

/**
 * Vignette Encounter Summary Select Statement
 *
 * Includes the summary information for a specific vignette encounter.
 */
const VIGNETTE_ENCOUNTER_SUMMARY_SELECT =
  'id, level_number, turn, user_id, vignette_monster_id, vignette_monster(monster_name)'

/**
 * Live State Keys
 *
 * The keys that are used to represent the live state of a vignette encounter.
 */
const LIVE_STATE_KEYS = [
  'accuracy_tokens',
  'activation_used',
  'arm_heavy_damage',
  'arm_light_damage',
  'bleeding_tokens',
  'block_tokens',
  'body_heavy_damage',
  'body_light_damage',
  'brain_light_damage',
  'dead',
  'deflect_tokens',
  'evasion_tokens',
  'head_heavy_damage',
  'insanity_tokens',
  'knocked_down',
  'leg_heavy_damage',
  'leg_light_damage',
  'luck_tokens',
  'movement_tokens',
  'movement_used',
  'notes',
  'priority_target',
  'retired',
  'scout',
  'speed_tokens',
  'strength_tokens',
  'survival',
  'survival_tokens',
  'waist_heavy_damage',
  'waist_light_damage'
] as const

/**
 * Rows
 *
 * @param value Value to Convert
 * @returns Array of DataRow Objects
 */
function rows(value: unknown): DataRow[] {
  return Array.isArray(value) ? (value as DataRow[]) : []
}

/**
 * First Row
 *
 * @param value Value to Extract First Row From
 * @returns First DataRow Object (or null)
 */
function firstRow(value: unknown): DataRow | null {
  if (Array.isArray(value)) return (value[0] as DataRow | undefined) ?? null
  return value && typeof value === 'object' ? (value as DataRow) : null
}

/**
 * Omit
 *
 * @param row DataRow to Omit Properties From
 * @param keys Keys to Omit
 * @returns Updated DataRow with Properties Omitted
 */
function omit(row: DataRow, keys: readonly string[]): DataRow {
  const result = { ...row }
  for (const key of keys) delete result[key]
  return result
}

async function resolveVignetteSharedUserId(
  username: string,
  operation: string
): Promise<string> {
  try {
    const sharedUserId = await lookupUserByUsername(username)
    if (!sharedUserId) throw new Error('User Not Found')
    return sharedUserId
  } catch (error) {
    throw new Error(
      `${operation}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Resolve Vignette Authorship
 *
 * @param row DataRow to Resolve Authorship For
 * @returns Resolved CatalogAuthorshipDetail
 */
function resolveVignetteAuthorship(
  row: DataRow | null | undefined
): CatalogAuthorshipDetail {
  return resolveSettlementAuthorship(
    {
      custom: row?.custom === true,
      user_id: typeof row?.user_id === 'string' ? row.user_id : null
    },
    EMPTY_MEMBER_PROFILES
  )
}

/**
 * Catalog Detail
 *
 * @param row DataRow to Create a Catalog Detail For
 * @returns Catalog Detail (or null)
 */
function catalogDetail<T>(
  row: DataRow | null
): (T & CatalogAuthorshipDetail) | null {
  if (!row) return null

  return {
    ...omit(row, ['user_id']),
    ...resolveVignetteAuthorship(row)
  } as T & CatalogAuthorshipDetail
}

/**
 * Relation Detail
 *
 * Maps a junction row with one embedded catalog relation into its public detail
 * shape with catalog authorship data.
 *
 * @param row Junction Row
 * @param relationKey Embedded Relation Key
 * @returns Relation Detail or Null
 */
function relationDetail<T>(row: DataRow, relationKey: string): T | null {
  const relation = catalogDetail(firstRow(row[relationKey]))
  if (!relation) return null

  return {
    ...omit(row, [relationKey]),
    [relationKey]: relation
  } as T
}

/**
 * Gear Detail
 *
 * Maps an embedded gear row into gear detail, normalizing nested cost and
 * affinity arrays.
 *
 * @param row Gear Row
 * @returns Gear Detail or Null
 */
function gearDetail(
  row: DataRow | null
): (GearDetail & CatalogAuthorshipDetail) | null {
  if (!row) return null

  return {
    ...toGearDetail(row as Parameters<typeof toGearDetail>[0]),
    ...resolveVignetteAuthorship(row)
  } as GearDetail & CatalogAuthorshipDetail
}

/**
 * Gear Grid Detail
 *
 * Maps a gear-grid row and its embedded gear into the expected detail shape.
 *
 * @param row Gear Grid Row
 * @returns Gear Grid Detail or Null
 */
function gearGridDetail<T>(row: DataRow): T | null {
  const gear = gearDetail(firstRow(row.gear))
  if (!gear) return null

  return {
    ...omit(row, ['gear']),
    gear
  } as T
}

/**
 * Map Present
 *
 * Maps rows through a nullable mapper and removes null results.
 *
 * @param values Rows to Map
 * @param mapper Nullable Mapper
 * @returns Present Mapped Values
 */
function mapPresent<T>(
  values: DataRow[],
  mapper: (row: DataRow) => T | null
): T[] {
  return values.map(mapper).filter((value): value is T => value !== null)
}

/**
 * Vignette Monster Level
 *
 * Maps a catalog monster level with mood, trait, and survivor-status setup
 * rows.
 *
 * @param row Vignette Monster Level Row
 * @returns Vignette Monster Level Detail
 */
function vignetteMonsterLevel(
  row: DataRow
): VignetteMonsterDetail['levels'][number] {
  return {
    ...omit(row, [
      'vignette_monster_level_mood',
      'vignette_monster_level_trait',
      'vignette_monster_level_survivor_status'
    ]),
    moods: mapPresent(rows(row.vignette_monster_level_mood), (moodRow) =>
      relationDetail(moodRow, 'mood')
    ),
    traits: mapPresent(rows(row.vignette_monster_level_trait), (traitRow) =>
      relationDetail(traitRow, 'trait')
    ),
    survivor_statuses: mapPresent(
      rows(row.vignette_monster_level_survivor_status),
      (statusRow) => relationDetail(statusRow, 'survivor_status')
    )
  } as VignetteMonsterDetail['levels'][number]
}

/**
 * Vignette Survivor
 *
 * Maps a catalog survivor preset with abilities, disorders, fighting arts, and
 * gear-grid rows.
 *
 * @param row Vignette Survivor Row
 * @returns Vignette Survivor Detail
 */
function vignetteSurvivor(
  row: DataRow
): VignetteMonsterDetail['survivors'][number] {
  return {
    ...omit(row, [
      'vignette_survivor_ability_impairment',
      'vignette_survivor_disorder',
      'vignette_survivor_fighting_art',
      'vignette_survivor_secret_fighting_art',
      'vignette_survivor_gear_grid'
    ]),
    abilities_impairments: mapPresent(
      rows(row.vignette_survivor_ability_impairment),
      (abilityRow) => relationDetail(abilityRow, 'ability_impairment')
    ),
    disorders: mapPresent(rows(row.vignette_survivor_disorder), (disorderRow) =>
      relationDetail(disorderRow, 'disorder')
    ),
    fighting_arts: mapPresent(
      rows(row.vignette_survivor_fighting_art),
      (fightingArtRow) => relationDetail(fightingArtRow, 'fighting_art')
    ),
    secret_fighting_arts: mapPresent(
      rows(row.vignette_survivor_secret_fighting_art),
      (secretFightingArtRow) =>
        relationDetail(secretFightingArtRow, 'secret_fighting_art')
    ),
    gear_grid: mapPresent(rows(row.vignette_survivor_gear_grid), gearGridDetail)
  } as VignetteMonsterDetail['survivors'][number]
}

/**
 * Vignette Monster
 *
 * Maps a catalog vignette monster with level and survivor preset collections.
 *
 * @param row Vignette Monster Row
 * @returns Vignette Monster Detail
 */
function vignetteMonster(row: DataRow): VignetteMonsterDetail {
  return {
    ...omit(row, ['vignette_monster_level', 'vignette_survivor']),
    levels: rows(row.vignette_monster_level).map(vignetteMonsterLevel),
    survivors: rows(row.vignette_survivor).map(vignetteSurvivor)
  } as VignetteMonsterDetail
}

/**
 * Active Monster
 *
 * Maps an active vignette monster row with its mutable mood, trait, and
 * survivor-status rows.
 *
 * @param row Active Monster Row
 * @param aiDecks AI Deck Map
 * @returns Vignette Encounter Monster Detail
 */
function activeMonster(
  row: DataRow,
  aiDecks: { [key: string]: VignetteEncounterAIDeckDetail }
): VignetteEncounterMonsterDetail {
  const monsterId = typeof row.id === 'string' && row.id ? row.id : 'unknown'
  const aiDeckId = row.ai_deck_id

  if (typeof aiDeckId !== 'string' || !aiDeckId)
    throw new Error(
      `Error Fetching Vignette Encounter Monsters: Monster ${monsterId} is missing ai_deck_id`
    )

  const aiDeck = aiDecks[aiDeckId]

  if (!aiDeck)
    throw new Error(
      `Error Fetching Vignette Encounter Monsters: AI deck ${aiDeckId} not found for monster ${monsterId}`
    )

  return {
    ...omit(row, [
      'vignette_encounter_monster_mood',
      'vignette_encounter_monster_trait',
      'vignette_encounter_monster_survivor_status'
    ]),
    ai_deck: aiDeck,
    moods: mapPresent(rows(row.vignette_encounter_monster_mood), (moodRow) =>
      relationDetail(moodRow, 'mood')
    ),
    traits: mapPresent(rows(row.vignette_encounter_monster_trait), (traitRow) =>
      relationDetail(traitRow, 'trait')
    ),
    survivor_statuses: mapPresent(
      rows(row.vignette_encounter_monster_survivor_status),
      (statusRow) => relationDetail(statusRow, 'survivor_status')
    )
  } as VignetteEncounterMonsterDetail
}

/**
 * Live State
 *
 * Extracts active survivor live-state fields from a survivor row.
 *
 * @param row Active Survivor Row
 * @returns Vignette Encounter Survivor Live State
 */
function liveState(row: DataRow): VignetteEncounterSurvivorLiveState {
  return Object.fromEntries(
    LIVE_STATE_KEYS.map((key) => [key, row[key]])
  ) as VignetteEncounterSurvivorLiveState
}

/**
 * Active Survivor
 *
 * Maps an active vignette survivor row into static survivor data, live state,
 * child catalog rows, and gear-grid rows.
 *
 * @param row Active Survivor Row
 * @returns Vignette Encounter Survivor Detail
 */
function activeSurvivor(row: DataRow): VignetteEncounterSurvivorDetail {
  return {
    ...omit(row, [
      ...LIVE_STATE_KEYS,
      'vignette_encounter_survivor_ability_impairment',
      'vignette_encounter_survivor_disorder',
      'vignette_encounter_survivor_fighting_art',
      'vignette_encounter_survivor_secret_fighting_art',
      'vignette_encounter_survivor_gear_grid'
    ]),
    live_state: liveState(row),
    abilities_impairments: mapPresent(
      rows(row.vignette_encounter_survivor_ability_impairment),
      (abilityRow) => relationDetail(abilityRow, 'ability_impairment')
    ),
    disorders: mapPresent(
      rows(row.vignette_encounter_survivor_disorder),
      (disorderRow) => relationDetail(disorderRow, 'disorder')
    ),
    fighting_arts: mapPresent(
      rows(row.vignette_encounter_survivor_fighting_art),
      (fightingArtRow) => relationDetail(fightingArtRow, 'fighting_art')
    ),
    secret_fighting_arts: mapPresent(
      rows(row.vignette_encounter_survivor_secret_fighting_art),
      (secretFightingArtRow) =>
        relationDetail(secretFightingArtRow, 'secret_fighting_art')
    ),
    gear_grid: mapPresent(
      rows(row.vignette_encounter_survivor_gear_grid),
      gearGridDetail
    )
  } as VignetteEncounterSurvivorDetail
}

/**
 * Shared User
 *
 * Maps a vignette shared-user row with optional embedded user settings.
 *
 * @param row Shared User Row
 * @returns Vignette Encounter Shared User Detail
 */
function sharedUser(row: DataRow): VignetteEncounterSharedUserDetail {
  const profile = firstRow(row.user_settings)

  return {
    ...omit(row, ['user_settings']),
    username: typeof profile?.username === 'string' ? profile.username : '',
    avatar_url:
      typeof profile?.avatar_url === 'string' ? profile.avatar_url : null
  } as VignetteEncounterSharedUserDetail
}

/**
 * Summary
 *
 * Maps an active vignette encounter row into summary data for switcher UI.
 *
 * @param row Vignette Encounter Row
 * @param role Caller Role
 * @returns Vignette Encounter Summary
 */
function summary(
  row: DataRow,
  role: VignetteEncounterSummary['role']
): VignetteEncounterSummary {
  const monster = firstRow(row.vignette_monster)

  return {
    id: row.id as string,
    vignette_monster_id: row.vignette_monster_id as string,
    monster_name:
      typeof monster?.monster_name === 'string' ? monster.monster_name : '',
    level_number: row.level_number as number,
    turn: row.turn as VignetteEncounterSummary['turn'],
    owner_user_id: row.user_id as string,
    owner_username: null,
    owner_avatar_url: null,
    role
  }
}

/**
 * Fetch Vignette Monster Rows
 *
 * Fetches raw vignette monster catalog rows, optionally filtered by ID.
 *
 * @param vignetteMonsterId Optional Vignette Monster ID
 * @returns Raw Vignette Monster Rows
 */
async function fetchVignetteMonsterRows(
  vignetteMonsterId?: string
): Promise<DataRow[]> {
  const supabase = createClient()
  const query = supabase
    .from('vignette_monster')
    .select(VIGNETTE_MONSTER_SELECT)

  const { data, error } = vignetteMonsterId
    ? await query.eq('id', vignetteMonsterId)
    : await query

  if (error)
    throw new Error(`Error Fetching Vignette Monsters: ${error.message}`)

  return (data ?? []) as unknown as DataRow[]
}

/**
 * Get Vignette Encounter AI Decks
 *
 * Retrieves active AI decks for a vignette encounter.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @returns Vignette Encounter AI Deck Map or Null
 */
export async function getVignetteEncounterAIDecks(
  vignetteEncounterId: string | null | undefined
): Promise<{ [key: string]: VignetteEncounterAIDeckDetail } | null> {
  if (!vignetteEncounterId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_ai_deck')
    .select(
      'advanced_cards, basic_cards, id, legendary_cards, overtone_cards, vignette_encounter_id'
    )
    .eq('vignette_encounter_id', vignetteEncounterId)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter AI Decks: ${error.message}`
    )

  const aiDecks: { [key: string]: VignetteEncounterAIDeckDetail } = {}
  for (const aiDeck of data ?? []) aiDecks[aiDeck.id] = aiDeck

  return aiDecks
}

/**
 * Get Vignette Encounter Monsters
 *
 * Retrieves active monster rows for a vignette encounter.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @param prefetchedAIDecks Optional Prefetched AI Deck Map
 * @returns Vignette Encounter Monster Map or Null
 */
export async function getVignetteEncounterMonsters(
  vignetteEncounterId: string | null | undefined,
  prefetchedAIDecks?: { [key: string]: VignetteEncounterAIDeckDetail }
): Promise<{ [key: string]: VignetteEncounterMonsterDetail } | null> {
  if (!vignetteEncounterId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_monster')
    .select(
      [
        'accuracy',
        'accuracy_tokens',
        'ai_card_drawn',
        'ai_deck_id',
        'ai_deck_remaining',
        'damage',
        'damage_tokens',
        'evasion',
        'evasion_tokens',
        'id',
        'knocked_down',
        'luck',
        'luck_tokens',
        'monster_name',
        'movement',
        'movement_tokens',
        'notes',
        'source_vignette_monster_level_id',
        'speed',
        'speed_tokens',
        'strength',
        'strength_tokens',
        'toughness',
        'toughness_tokens',
        'vignette_encounter_id',
        'wounds',
        `vignette_encounter_monster_mood(id, mood_id, source_vignette_monster_level_mood_id, vignette_encounter_monster_id, mood(${CATALOG_AUTHORSHIP_SELECT}, mood_name))`,
        `vignette_encounter_monster_trait(id, trait_id, source_vignette_monster_level_trait_id, vignette_encounter_monster_id, trait(${CATALOG_AUTHORSHIP_SELECT}, trait_name))`,
        `vignette_encounter_monster_survivor_status(id, survivor_status_id, source_vignette_monster_level_survivor_status_id, vignette_encounter_monster_id, survivor_status(${CATALOG_AUTHORSHIP_SELECT}, survivor_status_name))`
      ].join(', ')
    )
    .eq('vignette_encounter_id', vignetteEncounterId)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Monsters: ${error.message}`
    )

  const aiDecks =
    prefetchedAIDecks ??
    (await getVignetteEncounterAIDecks(vignetteEncounterId)) ??
    {}
  const monsters: { [key: string]: VignetteEncounterMonsterDetail } = {}
  for (const monster of (data ?? []) as unknown as DataRow[])
    monsters[monster.id as string] = activeMonster(monster, aiDecks)

  return monsters
}

/**
 * Get Vignette Encounter Survivors
 *
 * Retrieves active survivor rows for a vignette encounter.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @returns Vignette Encounter Survivor Map or Null
 */
export async function getVignetteEncounterSurvivors(
  vignetteEncounterId: string | null | undefined
): Promise<{ [key: string]: VignetteEncounterSurvivorDetail } | null> {
  if (!vignetteEncounterId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor')
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_SELECT)
    .eq('vignette_encounter_id', vignetteEncounterId)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivors: ${error.message}`
    )

  const survivors: { [key: string]: VignetteEncounterSurvivorDetail } = {}
  for (const survivor of (data ?? []) as unknown as DataRow[])
    survivors[survivor.id as string] = activeSurvivor(survivor)

  return survivors
}

/**
 * Get Vignette Encounter Shared Users
 *
 * Retrieves share rows for a vignette encounter.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @returns Shared User Details or Null
 */
export async function getVignetteEncounterSharedUsers(
  vignetteEncounterId: string | null | undefined
): Promise<VignetteEncounterSharedUserDetail[] | null> {
  if (!vignetteEncounterId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_shared_user')
    .select(
      'id, shared_user_id, vignette_encounter_id, user_settings(username, avatar_url)'
    )
    .eq('vignette_encounter_id', vignetteEncounterId)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Shared Users: ${error.message}`
    )

  return ((data ?? []) as unknown as DataRow[]).map(sharedUser)
}

/**
 * Get Vignette Monsters
 *
 * Retrieves vignette catalog monsters with levels, survivor presets, and nested
 * catalog rows needed for setup UI.
 *
 * @returns Vignette Monsters Map
 */
export async function getVignetteMonsters(): Promise<{
  [key: string]: VignetteMonsterDetail
}> {
  await getUserId()

  const rawRows = await fetchVignetteMonsterRows()
  const monsters: { [key: string]: VignetteMonsterDetail } = {}
  for (const row of rawRows) monsters[row.id as string] = vignetteMonster(row)

  return monsters
}

/**
 * Get Vignette Monster
 *
 * Retrieves a single vignette catalog monster by ID.
 *
 * @param vignetteMonsterId Vignette Monster ID
 * @returns Vignette Monster Detail or Null
 */
export async function getVignetteMonster(
  vignetteMonsterId: string | null | undefined
): Promise<VignetteMonsterDetail | null> {
  if (!vignetteMonsterId) return null

  await getUserId()

  const [row] = await fetchVignetteMonsterRows(vignetteMonsterId)
  return row ? vignetteMonster(row) : null
}

/**
 * Get Active Vignette Encounter For User
 *
 * Retrieves the current user's owned active vignette summary. Shared vignettes
 * are intentionally excluded and do not count as owned active vignettes.
 *
 * @returns Owned Active Vignette Summary or Null
 */
export async function getActiveVignetteEncounterForUser(): Promise<VignetteEncounterSummary | null> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter')
    .select(VIGNETTE_ENCOUNTER_SUMMARY_SELECT)
    .eq('user_id', userId)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Active Vignette Encounter: ${error.message}`
    )
  if (!data) return null

  return summary(data as unknown as DataRow, 'owner')
}

/**
 * Get Shared Vignette Encounters For User
 *
 * Retrieves active vignette summaries shared with the current user.
 *
 * @returns Shared Vignette Summaries
 */
export async function getSharedVignetteEncountersForUser(): Promise<
  VignetteEncounterSummary[]
> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_shared_user')
    .select(`vignette_encounter(${VIGNETTE_ENCOUNTER_SUMMARY_SELECT})`)
    .eq('shared_user_id', userId)

  if (error)
    throw new Error(
      `Error Fetching Shared Vignette Encounters: ${error.message}`
    )

  return ((data ?? []) as unknown as DataRow[])
    .map((row) => firstRow(row.vignette_encounter))
    .filter((row): row is DataRow => row !== null)
    .map((row) => summary(row, 'collaborator'))
}

/**
 * Get Accessible Vignette Encounters For User
 *
 * Retrieves owned and shared active vignette summaries for switcher UI.
 *
 * @returns Accessible Vignette Summaries
 */
export async function getAccessibleVignetteEncountersForUser(): Promise<
  VignetteEncounterSummary[]
> {
  const [ownedEncounter, sharedEncounters] = await Promise.all([
    getActiveVignetteEncounterForUser(),
    getSharedVignetteEncountersForUser()
  ])

  return [...(ownedEncounter ? [ownedEncounter] : []), ...sharedEncounters]
}

/**
 * Get Vignette Encounter
 *
 * Retrieves full active vignette detail state for tracker UI.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @returns Vignette Encounter Detail or Null
 */
export async function getVignetteEncounter(
  vignetteEncounterId: string | null | undefined
): Promise<VignetteEncounterDetail | null> {
  if (!vignetteEncounterId) return null

  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter')
    .select('id, level_number, notes, turn, user_id, vignette_monster_id')
    .eq('id', vignetteEncounterId)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Vignette Encounter: ${error.message}`)
  if (!data) return null

  const encounter = data as unknown as DataRow
  const vignetteMonsterId = encounter.vignette_monster_id as string
  const [catalogMonsterRows, aiDecks, sharedUsers] = await Promise.all([
    fetchVignetteMonsterRows(vignetteMonsterId),
    getVignetteEncounterAIDecks(encounter.id as string),
    getVignetteEncounterSharedUsers(encounter.id as string)
  ])
  const catalogMonster = catalogMonsterRows[0]
    ? vignetteMonster(catalogMonsterRows[0])
    : null

  if (!catalogMonster)
    throw new Error(
      `Error Fetching Vignette Encounter: Vignette Monster Not Found for vignette_monster_id ${vignetteMonsterId}`
    )

  const [monsters, survivors] = await Promise.all([
    getVignetteEncounterMonsters(encounter.id as string, aiDecks ?? {}),
    getVignetteEncounterSurvivors(encounter.id as string)
  ])

  return {
    ...encounter,
    role: encounter.user_id === userId ? 'owner' : 'collaborator',
    vignette_monster: catalogMonster,
    ai_decks: aiDecks ?? {},
    monsters: monsters ?? {},
    survivors: survivors ?? {},
    shared_users: sharedUsers ?? []
  } as VignetteEncounterDetail
}

/**
 * Create Vignette Encounter
 *
 * Creates an active vignette encounter from catalog monster and level data.
 * The database RPC performs the deterministic catalog-to-active copy for the
 * encounter, AI decks, monsters, survivors, and copied child rows.
 *
 * @param input Vignette Create Input
 * @returns Created Vignette Encounter ID
 */
export async function createVignetteEncounter(
  input: VignetteCreateInput
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc(
    'create_vignette_encounter_from_catalog',
    {
      target_level_number: input.level_number,
      target_vignette_monster_id: input.vignette_monster_id
    }
  )

  if (error)
    throw new Error(`Error Creating Vignette Encounter: ${error.message}`)
  if (!data)
    throw new Error('Error Creating Vignette Encounter: Missing encounter ID')

  return data
}

/**
 * Update Vignette Encounter
 *
 * Updates mutable encounter-level state such as turn and notes.
 *
 * @param input Vignette Encounter Update Input
 */
export async function updateVignetteEncounter(
  input: VignetteEncounterUpdateInput
): Promise<void> {
  const { vignette_encounter_id, ...updateData } = input
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter')
    .update(updateData)
    .eq('id', vignette_encounter_id)

  if (error)
    throw new Error(`Error Updating Vignette Encounter: ${error.message}`)
}

/**
 * Remove Vignette Encounter
 *
 * Deletes an active vignette encounter. Database cascade rules remove active
 * child state, clearing the owned active slot without recording outcome or
 * lifecycle history.
 *
 * @param input Vignette Encounter Delete Input
 */
export async function removeVignetteEncounter(
  input: VignetteEncounterDeleteInput
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter')
    .delete()
    .eq('id', input.vignette_encounter_id)

  if (error)
    throw new Error(`Error Removing Vignette Encounter: ${error.message}`)
}

/**
 * Update Vignette Encounter AI Deck
 *
 * Updates remaining active AI deck card counts for a vignette encounter.
 *
 * @param input Vignette Encounter AI Deck Update Input
 */
export async function updateVignetteEncounterAIDeck(
  input: VignetteEncounterAIDeckUpdateInput
): Promise<void> {
  const { vignette_encounter_ai_deck_id, ...updateData } = input
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_ai_deck')
    .update(updateData)
    .eq('id', vignette_encounter_ai_deck_id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter AI Deck: ${error.message}`
    )
}

/**
 * Update Vignette Encounter Monster
 *
 * Updates mutable active monster state including wounds, tokens, card state,
 * stats, and notes.
 *
 * @param input Vignette Encounter Monster Update Input
 */
export async function updateVignetteEncounterMonster(
  input: VignetteEncounterMonsterUpdateInput
): Promise<void> {
  const { vignette_encounter_monster_id, ...updateData } = input
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_monster')
    .update(updateData)
    .eq('id', vignette_encounter_monster_id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Monster: ${error.message}`
    )
}

/**
 * Add Vignette Encounter Monster Mood
 *
 * Adds a mood row to an active vignette monster.
 *
 * @param input Vignette Encounter Monster Mood Input
 * @returns Created Mood Row ID
 */
export async function addVignetteEncounterMonsterMood(
  input: VignetteEncounterMonsterMoodInput
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_monster_mood')
    .insert(input)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Monster Mood: ${error.message}`
    )

  return data.id
}

/**
 * Remove Vignette Encounter Monster Mood
 *
 * Removes a mood row from an active vignette monster.
 *
 * @param input Vignette Encounter Monster State Delete Input
 */
export async function removeVignetteEncounterMonsterMood(
  input: VignetteEncounterMonsterStateDeleteInput
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_monster_mood')
    .delete()
    .eq('id', input.id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Monster Mood: ${error.message}`
    )
}

/**
 * Add Vignette Encounter Monster Trait
 *
 * Adds a trait row to an active vignette monster.
 *
 * @param input Vignette Encounter Monster Trait Input
 * @returns Created Trait Row ID
 */
export async function addVignetteEncounterMonsterTrait(
  input: VignetteEncounterMonsterTraitInput
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_monster_trait')
    .insert(input)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Monster Trait: ${error.message}`
    )

  return data.id
}

/**
 * Remove Vignette Encounter Monster Trait
 *
 * Removes a trait row from an active vignette monster.
 *
 * @param input Vignette Encounter Monster State Delete Input
 */
export async function removeVignetteEncounterMonsterTrait(
  input: VignetteEncounterMonsterStateDeleteInput
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_monster_trait')
    .delete()
    .eq('id', input.id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Monster Trait: ${error.message}`
    )
}

/**
 * Add Vignette Encounter Monster Survivor Status
 *
 * Adds a survivor status row to an active vignette monster.
 *
 * @param input Vignette Encounter Monster Survivor Status Input
 * @returns Created Survivor Status Row ID
 */
export async function addVignetteEncounterMonsterSurvivorStatus(
  input: VignetteEncounterMonsterSurvivorStatusInput
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_monster_survivor_status')
    .insert(input)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Monster Survivor Status: ${error.message}`
    )

  return data.id
}

/**
 * Remove Vignette Encounter Monster Survivor Status
 *
 * Removes a survivor status row from an active vignette monster.
 *
 * @param input Vignette Encounter Monster State Delete Input
 */
export async function removeVignetteEncounterMonsterSurvivorStatus(
  input: VignetteEncounterMonsterStateDeleteInput
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_monster_survivor_status')
    .delete()
    .eq('id', input.id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Monster Survivor Status: ${error.message}`
    )
}

/**
 * Update Vignette Encounter Survivor Live State
 *
 * Updates mutable active survivor live-state fields without changing copied
 * survivor identity or base stat fields.
 *
 * @param input Vignette Encounter Survivor Live State Update Input
 */
export async function updateVignetteEncounterSurvivorLiveState(
  input: VignetteEncounterSurvivorLiveStateUpdateInput
): Promise<void> {
  const { vignette_encounter_survivor_id, ...updateData } = input
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_survivor')
    .update(updateData)
    .eq('id', vignette_encounter_survivor_id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Survivor Live State: ${error.message}`
    )
}

/**
 * Add Vignette Encounter Survivor Ability Impairment
 *
 * Adds an ability impairment row to an active vignette survivor.
 *
 * @param input Vignette Encounter Survivor Ability Impairment Input
 * @returns Created Ability Impairment Row ID
 */
export async function addVignetteEncounterSurvivorAbilityImpairment(
  input: VignetteEncounterSurvivorAbilityImpairmentInput
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_ability_impairment')
    .insert(input)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Survivor Ability Impairment: ${error.message}`
    )

  return data.id
}

/**
 * Remove Vignette Encounter Survivor Ability Impairment
 *
 * Removes an ability impairment row from an active vignette survivor.
 *
 * @param id Vignette Encounter Survivor Ability Impairment Row ID
 */
export async function removeVignetteEncounterSurvivorAbilityImpairment(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_survivor_ability_impairment')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Survivor Ability Impairment: ${error.message}`
    )
}

/**
 * Add Vignette Encounter Survivor Disorder
 *
 * Adds a disorder row to an active vignette survivor.
 *
 * @param input Vignette Encounter Survivor Disorder Input
 * @returns Created Disorder Row ID
 */
export async function addVignetteEncounterSurvivorDisorder(
  input: VignetteEncounterSurvivorDisorderInput
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_disorder')
    .insert(input)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Survivor Disorder: ${error.message}`
    )

  return data.id
}

/**
 * Remove Vignette Encounter Survivor Disorder
 *
 * Removes a disorder row from an active vignette survivor.
 *
 * @param id Vignette Encounter Survivor Disorder Row ID
 */
export async function removeVignetteEncounterSurvivorDisorder(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_survivor_disorder')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Survivor Disorder: ${error.message}`
    )
}

/**
 * Add Vignette Encounter Survivor Fighting Art
 *
 * Adds a fighting art row to an active vignette survivor.
 *
 * @param input Vignette Encounter Survivor Fighting Art Input
 * @returns Created Fighting Art Row ID
 */
export async function addVignetteEncounterSurvivorFightingArt(
  input: VignetteEncounterSurvivorFightingArtInput
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_fighting_art')
    .insert(input)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Survivor Fighting Art: ${error.message}`
    )

  return data.id
}

/**
 * Remove Vignette Encounter Survivor Fighting Art
 *
 * Removes a fighting art row from an active vignette survivor.
 *
 * @param id Vignette Encounter Survivor Fighting Art Row ID
 */
export async function removeVignetteEncounterSurvivorFightingArt(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_survivor_fighting_art')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Survivor Fighting Art: ${error.message}`
    )
}

/**
 * Add Vignette Encounter Survivor Secret Fighting Art
 *
 * Adds a secret fighting art row to an active vignette survivor.
 *
 * @param input Vignette Encounter Survivor Secret Fighting Art Input
 * @returns Created Secret Fighting Art Row ID
 */
export async function addVignetteEncounterSurvivorSecretFightingArt(
  input: VignetteEncounterSurvivorSecretFightingArtInput
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_secret_fighting_art')
    .insert(input)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Survivor Secret Fighting Art: ${error.message}`
    )

  return data.id
}

/**
 * Remove Vignette Encounter Survivor Secret Fighting Art
 *
 * Removes a secret fighting art row from an active vignette survivor.
 *
 * @param id Vignette Encounter Survivor Secret Fighting Art Row ID
 */
export async function removeVignetteEncounterSurvivorSecretFightingArt(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_survivor_secret_fighting_art')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Survivor Secret Fighting Art: ${error.message}`
    )
}

/**
 * Update Vignette Encounter Survivor Gear Grid
 *
 * Updates one copied active survivor gear-grid row.
 *
 * @param input Vignette Encounter Survivor Gear Grid Update Input
 */
export async function updateVignetteEncounterSurvivorGearGrid(
  input: VignetteEncounterSurvivorGearGridUpdateInput
): Promise<void> {
  const { vignette_encounter_survivor_gear_grid_id, ...updateData } = input
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_survivor_gear_grid')
    .update(updateData)
    .eq('id', vignette_encounter_survivor_gear_grid_id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Survivor Gear Grid: ${error.message}`
    )
}

/**
 * Add Vignette Encounter Shared User
 *
 * Resolves an exact username through the username lookup RPC, then shares the
 * active vignette encounter with the resolved user.
 *
 * @param input Vignette Share Input
 * @returns Created Share Row ID
 */
export async function addVignetteEncounterSharedUser(
  input: VignetteShareInput
): Promise<string> {
  const sharedUserId = await resolveVignetteSharedUserId(
    input.username,
    'Error Adding Vignette Encounter Shared User'
  )

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_shared_user')
    .insert({
      shared_user_id: sharedUserId,
      vignette_encounter_id: input.vignette_encounter_id
    })
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Shared User: ${error.message}`
    )

  return data.id
}

/**
 * Remove Vignette Encounter Shared User
 *
 * Revokes a user's access to an active vignette encounter by user ID.
 *
 * @param input Vignette Share Removal Input
 */
export async function removeVignetteEncounterSharedUser(
  input: VignetteShareRemovalInput
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_shared_user')
    .delete()
    .eq('vignette_encounter_id', input.vignette_encounter_id)
    .eq('shared_user_id', input.shared_user_id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Shared User: ${error.message}`
    )
}

/**
 * Remove Vignette Encounter Shared User By Username
 *
 * Resolves an exact username, then revokes that user's access to an active
 * vignette encounter.
 *
 * @param input Vignette Share Input
 */
export async function removeVignetteEncounterSharedUserByUsername(
  input: VignetteShareInput
): Promise<void> {
  const sharedUserId = await resolveVignetteSharedUserId(
    input.username,
    'Error Removing Vignette Encounter Shared User'
  )

  await removeVignetteEncounterSharedUser({
    shared_user_id: sharedUserId,
    vignette_encounter_id: input.vignette_encounter_id
  })
}
