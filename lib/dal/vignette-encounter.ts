import { getUserId, lookupUserByUsername } from '@/lib/dal/user'
import {
  getVignetteEncounterAIDecks,
  updateVignetteEncounterAIDeck as updateVignetteEncounterAIDeckRow
} from '@/lib/dal/vignette-encounter-ai-deck'
import {
  getVignetteEncounterMonsters,
  updateVignetteEncounterMonster as updateVignetteEncounterMonsterRow
} from '@/lib/dal/vignette-encounter-monster'
import { getVignetteEncounterSurvivors } from '@/lib/dal/vignette-encounter-survivor'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import type {
  VignetteEncounterDetail,
  VignetteEncounterSharedUserDetail,
  VignetteEncounterSummary,
  VignetteEncounterSummaryDetail,
  VignetteMonsterDetail,
  VignetteMonsterSummary
} from '@/lib/types'

export { getVignetteEncounterAIDecks } from '@/lib/dal/vignette-encounter-ai-deck'
export { getVignetteEncounterMonsters } from '@/lib/dal/vignette-encounter-monster'
export { getVignetteEncounterSurvivors } from '@/lib/dal/vignette-encounter-survivor'

const VIGNETTE_MONSTER_SELECT = `
  id,
  monster_name,
  multi_monster,
  source_monster_type,
  source_nemesis_id,
  source_quarry_id,
  source_nemesis:nemesis(*),
  source_quarry:quarry(*),
  levels:vignette_monster_level(
    *,
    moods:vignette_monster_level_mood(*, mood(*)),
    traits:vignette_monster_level_trait(*, trait(*)),
    survivor_statuses:vignette_monster_level_survivor_status(*, survivor_status(*))
  ),
  survivors:vignette_survivor(
    *,
    abilities_impairments:vignette_survivor_ability_impairment(*, ability_impairment(*)),
    disorders:vignette_survivor_disorder(*, disorder(*)),
    fighting_arts:vignette_survivor_fighting_art(*, fighting_art(*)),
    secret_fighting_arts:vignette_survivor_secret_fighting_art(*, secret_fighting_art(*)),
    gear_grid:vignette_survivor_gear_grid(*, gear(*)),
    weapon_type(*)
  )
`

type VignetteEncounterMonsterMoodInput = Omit<
  TablesInsert<'vignette_encounter_monster_mood'>,
  'created_at' | 'id' | 'updated_at'
> & { source_vignette_monster_level_mood_id?: string | null }
type VignetteEncounterMonsterTraitInput = Omit<
  TablesInsert<'vignette_encounter_monster_trait'>,
  'created_at' | 'id' | 'updated_at'
> & { source_vignette_monster_level_trait_id?: string | null }
type VignetteEncounterMonsterSurvivorStatusInput = Omit<
  TablesInsert<'vignette_encounter_monster_survivor_status'>,
  'created_at' | 'id' | 'updated_at'
> & { source_vignette_monster_level_survivor_status_id?: string | null }

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {}
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function withAuthorship(row: unknown): Record<string, unknown> | null {
  if (!row || typeof row !== 'object') return null
  const { user_id, ...rest } = row as Record<string, unknown>
  const isCustom = rest.custom === true

  return {
    ...rest,
    author_user_id: isCustom && typeof user_id === 'string' ? user_id : null,
    author_username: null,
    author_avatar_url: null
  }
}

function mapRuleRows(rows: unknown, key: string): unknown[] {
  return asArray(rows).map((row) => {
    const object = asObject(row)
    return {
      ...object,
      [key]: withAuthorship(object[key])
    }
  })
}

function mapGear(row: unknown): Record<string, unknown> | null {
  const gear = withAuthorship(row)
  if (!gear) return null

  return {
    ...gear,
    affinity_bonus_requirements: gear.affinity_bonus_requirements ?? [],
    gear_costs: gear.gear_costs ?? gear.gear_gear_cost ?? [],
    other_costs: gear.other_costs ?? gear.gear_other_cost ?? [],
    resource_costs: gear.resource_costs ?? gear.gear_resource_cost ?? [],
    resource_type_costs:
      gear.resource_type_costs ?? gear.gear_resource_type_cost ?? []
  }
}

function toVignetteMonsterDetail(row: unknown): VignetteMonsterDetail {
  const monster = asObject(row)

  return {
    ...monster,
    levels: asArray(monster.levels ?? monster.vignette_monster_level).map(
      (level) => {
        const levelObject = asObject(level)
        return {
          ...levelObject,
          moods: mapRuleRows(
            levelObject.moods ?? levelObject.vignette_monster_level_mood,
            'mood'
          ),
          survivor_statuses: mapRuleRows(
            levelObject.survivor_statuses ??
              levelObject.vignette_monster_level_survivor_status,
            'survivor_status'
          ),
          traits: mapRuleRows(
            levelObject.traits ?? levelObject.vignette_monster_level_trait,
            'trait'
          )
        }
      }
    ),
    survivors: asArray(monster.survivors ?? monster.vignette_survivor).map(
      (survivor) => {
        const survivorObject = asObject(survivor)
        return {
          ...survivorObject,
          abilities_impairments: mapRuleRows(
            survivorObject.abilities_impairments ??
              survivorObject.vignette_survivor_ability_impairment,
            'ability_impairment'
          ),
          disorders: mapRuleRows(
            survivorObject.disorders ??
              survivorObject.vignette_survivor_disorder,
            'disorder'
          ),
          fighting_arts: mapRuleRows(
            survivorObject.fighting_arts ??
              survivorObject.vignette_survivor_fighting_art,
            'fighting_art'
          ),
          gear_grid: asArray(
            survivorObject.gear_grid ??
              survivorObject.vignette_survivor_gear_grid
          ).map((gearGrid) => {
            const gearGridObject = asObject(gearGrid)
            return {
              ...gearGridObject,
              gear: mapGear(gearGridObject.gear)
            }
          }),
          secret_fighting_arts: mapRuleRows(
            survivorObject.secret_fighting_arts ??
              survivorObject.vignette_survivor_secret_fighting_art,
            'secret_fighting_art'
          )
        }
      }
    )
  } as unknown as VignetteMonsterDetail
}

function toVignetteEncounterSummary(
  row: unknown,
  role: VignetteEncounterSummary['role']
): VignetteEncounterSummary {
  const encounter = asObject(row)
  const monster = asObject(encounter.vignette_monster)
  const ownerUserId =
    typeof encounter.user_id === 'string' ? encounter.user_id : null

  return {
    id: String(encounter.id),
    level_number: Number(encounter.level_number),
    monster_name:
      typeof monster.monster_name === 'string' ? monster.monster_name : '',
    owner_avatar_url: null,
    owner_user_id: ownerUserId,
    owner_username: null,
    role,
    turn: encounter.turn as VignetteEncounterSummary['turn'],
    vignette_monster_id: String(encounter.vignette_monster_id)
  } as VignetteEncounterSummary
}

/**
 * Get Vignette Monsters
 *
 * @returns Vignette Monster Details by ID
 */
export async function getVignetteMonsters(): Promise<{
  [key: string]: VignetteMonsterDetail
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vignette_monster')
    .select(VIGNETTE_MONSTER_SELECT)

  if (error)
    throw new Error(`Error Fetching Vignette Monsters: ${error.message}`)

  return Object.fromEntries(
    asArray(data).map((row) => {
      const detail = toVignetteMonsterDetail(row)
      return [detail.id, detail]
    })
  )
}

/**
 * Get Vignette Monster Summaries
 *
 * @returns Vignette Monster Summaries
 */
export async function getVignetteMonsterSummaries(): Promise<
  VignetteMonsterSummary[]
> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vignette_monster')
    .select(
      'id, monster_name, multi_monster, source_monster_type, vignette_monster_level(id, level_number)'
    )

  if (error)
    throw new Error(
      `Error Fetching Vignette Monster Summaries: ${error.message}`
    )

  return asArray(data)
    .map((row) => {
      const monster = asObject(row)
      return {
        id: String(monster.id),
        monster_name: String(monster.monster_name),
        multi_monster: monster.multi_monster === true,
        source_monster_type: String(
          monster.source_monster_type
        ) as VignetteMonsterSummary['source_monster_type'],
        levels: asArray(
          monster.vignette_monster_level
        ) as VignetteMonsterSummary['levels']
      }
    })
    .sort((a, b) => a.monster_name.localeCompare(b.monster_name))
}

/**
 * Get Vignette Monster
 *
 * @param vignetteMonsterId Vignette Monster ID
 * @returns Vignette Monster Detail or null
 */
export async function getVignetteMonster(
  vignetteMonsterId: string | null | undefined
): Promise<VignetteMonsterDetail | null> {
  if (!vignetteMonsterId) return null

  const supabase = createClient()
  const { data, error } = await supabase
    .from('vignette_monster')
    .select(VIGNETTE_MONSTER_SELECT)
    .eq('id', vignetteMonsterId)

  if (error)
    throw new Error(`Error Fetching Vignette Monster: ${error.message}`)

  const [row] = asArray(data)
  return row ? toVignetteMonsterDetail(row) : null
}

/**
 * Get Active Vignette Encounter For User
 *
 * @returns Owned Active Vignette Encounter Summary
 */
export async function getActiveVignetteEncounterForUser(): Promise<VignetteEncounterSummary | null> {
  const userId = await getUserId()
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vignette_encounter')
    .select(
      'id, level_number, notes, turn, user_id, vignette_monster_id, vignette_monster(monster_name)'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Active Vignette Encounter: ${error.message}`
    )

  return data ? toVignetteEncounterSummary(data, 'owner') : null
}

/**
 * Get Shared Vignette Encounters For User
 *
 * @returns Shared Active Vignette Encounter Summaries
 */
export async function getSharedVignetteEncountersForUser(): Promise<
  VignetteEncounterSummary[]
> {
  const userId = await getUserId()
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vignette_encounter_shared_user')
    .select(
      'vignette_encounter(id, level_number, notes, turn, user_id, vignette_monster_id, vignette_monster(monster_name))'
    )
    .eq('shared_user_id', userId)

  if (error)
    throw new Error(
      `Error Fetching Shared Vignette Encounters: ${error.message}`
    )

  return asArray(data).flatMap((row) => {
    const encounter = asObject(row).vignette_encounter
    return encounter
      ? [toVignetteEncounterSummary(encounter, 'collaborator')]
      : []
  })
}

/**
 * Get Accessible Vignette Encounters For User
 *
 * @returns Accessible Vignette Encounter Summaries
 */
export async function getAccessibleVignetteEncountersForUser(): Promise<
  VignetteEncounterSummary[]
> {
  const [owned, shared] = await Promise.all([
    getActiveVignetteEncounterForUser(),
    getSharedVignetteEncountersForUser()
  ])

  return [...(owned ? [owned] : []), ...shared]
}

/**
 * Create Vignette Encounter
 *
 * Creates an active vignette encounter from catalog setup data.
 *
 * @param input Vignette Create Input
 * @returns Created Vignette Encounter ID
 */
export async function createVignetteEncounter(input: {
  vignette_monster_id: string
  level_number: number
}): Promise<string> {
  await getUserId()
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

  return data
}

/**
 * Update Vignette Encounter AI Deck
 *
 * @param input Vignette Encounter AI Deck Update Data
 * @returns Promise that resolves when updated
 */
export async function updateVignetteEncounterAIDeck(
  input: Omit<
    TablesUpdate<'vignette_encounter_ai_deck'>,
    'id' | 'created_at' | 'updated_at'
  > & { vignette_encounter_ai_deck_id: string }
): Promise<void> {
  const { vignette_encounter_ai_deck_id, ...updateData } = input
  return updateVignetteEncounterAIDeckRow(
    vignette_encounter_ai_deck_id,
    updateData
  )
}

/**
 * Update Vignette Encounter Monster
 *
 * @param input Vignette Encounter Monster Update Data
 * @returns Promise that resolves when updated
 */
export async function updateVignetteEncounterMonster(
  input: Omit<
    TablesUpdate<'vignette_encounter_monster'>,
    'id' | 'created_at' | 'updated_at'
  > & { vignette_encounter_monster_id: string }
): Promise<void> {
  const { vignette_encounter_monster_id, ...updateData } = input
  return updateVignetteEncounterMonsterRow(
    vignette_encounter_monster_id,
    updateData
  )
}

/**
 * Update Vignette Encounter Survivor Live State
 *
 * @param input Vignette Encounter Survivor Live State Update Data
 * @returns Promise that resolves when updated
 */
export async function updateVignetteEncounterSurvivorLiveState(
  input: Omit<
    TablesUpdate<'vignette_encounter_survivor'>,
    'id' | 'created_at' | 'updated_at'
  > & { vignette_encounter_survivor_id: string }
): Promise<void> {
  const { vignette_encounter_survivor_id, ...updateData } = input
  const supabase = createClient()
  const { error } = await supabase
    .from('vignette_encounter_survivor')
    .update(updateData as never)
    .eq('id', vignette_encounter_survivor_id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Survivor: ${error.message}`
    )
}

/**
 * Update Vignette Encounter Survivor Gear Grid
 *
 * @param input Vignette Encounter Survivor Gear Grid Update Data
 * @returns Promise that resolves when updated
 */
export async function updateVignetteEncounterSurvivorGearGrid(
  input: Omit<
    TablesUpdate<'vignette_encounter_survivor_gear_grid'>,
    'id' | 'created_at' | 'updated_at'
  > & {
    vignette_encounter_survivor_gear_grid_id: string
    column_number?: number
    row_number?: number
  }
): Promise<void> {
  const { vignette_encounter_survivor_gear_grid_id, ...updateData } = input
  const supabase = createClient()
  const { error } = await supabase
    .from('vignette_encounter_survivor_gear_grid')
    .update(updateData as never)
    .eq('id', vignette_encounter_survivor_gear_grid_id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Survivor Gear Grid: ${error.message}`
    )
}

async function addSurvivorChildRow(
  table:
    | 'vignette_encounter_survivor_ability_impairment'
    | 'vignette_encounter_survivor_disorder'
    | 'vignette_encounter_survivor_fighting_art'
    | 'vignette_encounter_survivor_secret_fighting_art',
  row: Record<string, unknown>
): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(table)
    .insert(row as never)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Survivor Child: ${error.message}`
    )

  return data.id
}

async function removeSurvivorChildRow(
  table:
    | 'vignette_encounter_survivor_ability_impairment'
    | 'vignette_encounter_survivor_disorder'
    | 'vignette_encounter_survivor_fighting_art'
    | 'vignette_encounter_survivor_secret_fighting_art',
  id: string
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from(table).delete().eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Survivor Child: ${error.message}`
    )
}

/**
 * Add Vignette Encounter Survivor Ability/Impairment
 *
 * @param row Vignette Encounter Survivor Ability/Impairment Data
 * @returns Inserted Row ID
 */
export async function addVignetteEncounterSurvivorAbilityImpairment(
  row: Record<string, unknown>
): Promise<string> {
  return addSurvivorChildRow(
    'vignette_encounter_survivor_ability_impairment',
    row
  )
}

/**
 * Add Vignette Encounter Survivor Disorder
 *
 * @param row Vignette Encounter Survivor Disorder Data
 * @returns Inserted Row ID
 */
export async function addVignetteEncounterSurvivorDisorder(
  row: Record<string, unknown>
): Promise<string> {
  return addSurvivorChildRow('vignette_encounter_survivor_disorder', row)
}

/**
 * Add Vignette Encounter Survivor Fighting Art
 *
 * @param row Vignette Encounter Survivor Fighting Art Data
 * @returns Inserted Row ID
 */
export async function addVignetteEncounterSurvivorFightingArt(
  row: Record<string, unknown>
): Promise<string> {
  return addSurvivorChildRow('vignette_encounter_survivor_fighting_art', row)
}

/**
 * Add Vignette Encounter Survivor Secret Fighting Art
 *
 * @param row Vignette Encounter Survivor Secret Fighting Art Data
 * @returns Inserted Row ID
 */
export async function addVignetteEncounterSurvivorSecretFightingArt(
  row: Record<string, unknown>
): Promise<string> {
  return addSurvivorChildRow(
    'vignette_encounter_survivor_secret_fighting_art',
    row
  )
}

/**
 * Remove Vignette Encounter Survivor Ability/Impairment
 *
 * @param id Row ID
 * @returns Promise that resolves when removed
 */
export async function removeVignetteEncounterSurvivorAbilityImpairment(
  id: string
): Promise<void> {
  return removeSurvivorChildRow(
    'vignette_encounter_survivor_ability_impairment',
    id
  )
}

/**
 * Remove Vignette Encounter Survivor Disorder
 *
 * @param id Row ID
 * @returns Promise that resolves when removed
 */
export async function removeVignetteEncounterSurvivorDisorder(
  id: string
): Promise<void> {
  return removeSurvivorChildRow('vignette_encounter_survivor_disorder', id)
}

/**
 * Remove Vignette Encounter Survivor Fighting Art
 *
 * @param id Row ID
 * @returns Promise that resolves when removed
 */
export async function removeVignetteEncounterSurvivorFightingArt(
  id: string
): Promise<void> {
  return removeSurvivorChildRow('vignette_encounter_survivor_fighting_art', id)
}

/**
 * Remove Vignette Encounter Survivor Secret Fighting Art
 *
 * @param id Row ID
 * @returns Promise that resolves when removed
 */
export async function removeVignetteEncounterSurvivorSecretFightingArt(
  id: string
): Promise<void> {
  return removeSurvivorChildRow(
    'vignette_encounter_survivor_secret_fighting_art',
    id
  )
}

/**
 * Get Vignette Encounter Shared Users
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @returns Shared User Rows, or null for empty IDs
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

  return (data ?? []).map((row) => {
    const userSettings = Array.isArray(row.user_settings)
      ? row.user_settings[0]
      : row.user_settings

    return {
      id: row.id,
      shared_user_id: row.shared_user_id,
      vignette_encounter_id: row.vignette_encounter_id,
      username: userSettings?.username ?? null,
      avatar_url: userSettings?.avatar_url ?? null
    }
  })
}

/**
 * Add Vignette Encounter Shared User
 *
 * @param input Share Input
 * @returns Created Share Row ID
 */
export async function addVignetteEncounterSharedUser(input: {
  username: string
  vignette_encounter_id: string
}): Promise<string> {
  const sharedUserId = await lookupUserByUsername(input.username)
  if (!sharedUserId)
    throw new Error(
      'Error Adding Vignette Encounter Shared User: User not found or lookup throttled'
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
 * @param input Share Removal Input
 */
export async function removeVignetteEncounterSharedUser(input: {
  shared_user_id: string
  vignette_encounter_id: string
}): Promise<void> {
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
 * @param input Share Removal Input
 * @returns Promise that resolves when removed
 */
export async function removeVignetteEncounterSharedUserByUsername(input: {
  username: string
  vignette_encounter_id: string
}): Promise<void> {
  const sharedUserId = await lookupUserByUsername(input.username)
  if (!sharedUserId)
    throw new Error(
      'Error Removing Vignette Encounter Shared User: User not found or lookup throttled'
    )

  return removeVignetteEncounterSharedUser({
    shared_user_id: sharedUserId,
    vignette_encounter_id: input.vignette_encounter_id
  })
}

/**
 * Add Vignette Encounter Monster Mood
 *
 * @param row Vignette Encounter Monster Mood Data
 * @returns Inserted Row ID
 */
export async function addVignetteEncounterMonsterMood(
  row: VignetteEncounterMonsterMoodInput
): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vignette_encounter_monster_mood')
    .insert(row as never)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Monster Mood: ${error.message}`
    )

  return data.id
}

/**
 * Add Vignette Encounter Monster Trait
 *
 * @param row Vignette Encounter Monster Trait Data
 * @returns Inserted Row ID
 */
export async function addVignetteEncounterMonsterTrait(
  row: VignetteEncounterMonsterTraitInput
): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vignette_encounter_monster_trait')
    .insert(row as never)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Monster Trait: ${error.message}`
    )

  return data.id
}

/**
 * Add Vignette Encounter Monster Survivor Status
 *
 * @param row Vignette Encounter Monster Survivor Status Data
 * @returns Inserted Row ID
 */
export async function addVignetteEncounterMonsterSurvivorStatus(
  row: VignetteEncounterMonsterSurvivorStatusInput
): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vignette_encounter_monster_survivor_status')
    .insert(row as never)
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Monster Survivor Status: ${error.message}`
    )

  return data.id
}

async function removeVignetteEncounterMonsterChild(
  table:
    | 'vignette_encounter_monster_mood'
    | 'vignette_encounter_monster_survivor_status'
    | 'vignette_encounter_monster_trait',
  id: string
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from(table).delete().eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Monster Child: ${error.message}`
    )
}

/**
 * Remove Vignette Encounter Monster Mood
 *
 * @param params Row ID Params
 * @returns Promise that resolves when removed
 */
export async function removeVignetteEncounterMonsterMood({
  id
}: {
  id: string
}): Promise<void> {
  return removeVignetteEncounterMonsterChild(
    'vignette_encounter_monster_mood',
    id
  )
}

/**
 * Remove Vignette Encounter Monster Trait
 *
 * @param params Row ID Params
 * @returns Promise that resolves when removed
 */
export async function removeVignetteEncounterMonsterTrait({
  id
}: {
  id: string
}): Promise<void> {
  return removeVignetteEncounterMonsterChild(
    'vignette_encounter_monster_trait',
    id
  )
}

/**
 * Remove Vignette Encounter Monster Survivor Status
 *
 * @param params Row ID Params
 * @returns Promise that resolves when removed
 */
export async function removeVignetteEncounterMonsterSurvivorStatus({
  id
}: {
  id: string
}): Promise<void> {
  return removeVignetteEncounterMonsterChild(
    'vignette_encounter_monster_survivor_status',
    id
  )
}

/**
 * Get Vignette Encounter Summary
 *
 * Retrieves a lightweight summary of a vignette encounter.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @returns Vignette Encounter Summary
 */
export async function getVignetteEncounterSummary(
  vignetteEncounterId: string | null
): Promise<VignetteEncounterSummaryDetail | null> {
  if (!vignetteEncounterId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter')
    .select(
      'id, level_number, notes, turn, user_id, vignette_monster_id, vignette_monster(monster_name)'
    )
    .eq('id', vignetteEncounterId)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Summary: ${error.message}`
    )
  if (!data) return null

  return data
}

/**
 * Get Vignette Encounter
 *
 * Gets the unique vignette encounter by ID.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @returns Vignette Encounter Data
 */
export async function getVignetteEncounter(
  vignetteEncounterId: string | null | undefined
): Promise<VignetteEncounterDetail | null> {
  if (!vignetteEncounterId) return null

  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter')
    .select(
      'id, level_number, notes, turn, user_id, vignette_monster_id, vignette_monster(id, monster_name, multi_monster, source_monster_type)'
    )
    .eq('id', vignetteEncounterId)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Vignette Encounter: ${error.message}`)
  if (!data) return null

  const vignetteMonsters = await getVignetteMonsters()
  const vignetteMonster = vignetteMonsters[data.vignette_monster_id]
  if (!vignetteMonster)
    throw new Error(
      `Error Fetching Vignette Encounter: Vignette Monster Not Found for vignette_monster_id ${data.vignette_monster_id}`
    )

  const aiDecks = await getVignetteEncounterAIDecks(vignetteEncounterId)
  const sharedUsers = await getVignetteEncounterSharedUsers(vignetteEncounterId)
  const vignetteEncounterMonsters = await getVignetteEncounterMonsters(
    vignetteEncounterId,
    aiDecks
  )
  const vignetteEncounterSurvivors =
    await getVignetteEncounterSurvivors(vignetteEncounterId)

  return {
    ...data,
    ai_decks: aiDecks ?? {},
    role: data.user_id === userId ? 'owner' : 'collaborator',
    shared_users: sharedUsers ?? [],
    vignette_monster: vignetteMonster,
    monsters: vignetteEncounterMonsters ?? {},
    survivors: vignetteEncounterSurvivors ?? {}
  }
}

/**
 * Add Vignette Encounter
 *
 * Adds a new vignette encounter record to the database.
 *
 * @param vignetteEncounter Vignette Encounter Data
 * @returns Inserted Vignette Encounter ID
 */
export async function addVignetteEncounter(
  vignetteEncounter: Omit<
    TablesInsert<'vignette_encounter'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter')
    .insert(vignetteEncounter)
    .select('id')
    .single()

  if (error)
    throw new Error(`Error Adding Vignette Encounter: ${error.message}`)

  return data.id
}

/**
 * Update Vignette Encounter
 *
 * Updates an existing vignette encounter record in the database.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @param vignetteEncounter Vignette Encounter Data
 */
export async function updateVignetteEncounter(
  vignetteEncounterId:
    | string
    | (Omit<
        TablesUpdate<'vignette_encounter'>,
        'id' | 'created_at' | 'updated_at'
      > & { vignette_encounter_id: string | null | undefined })
    | null,
  vignetteEncounter?: Omit<
    TablesUpdate<'vignette_encounter'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const objectInput =
    typeof vignetteEncounterId === 'object' && vignetteEncounterId !== null
      ? (vignetteEncounterId as Record<string, unknown>)
      : null
  const id = objectInput
    ? typeof objectInput.vignette_encounter_id === 'string'
      ? objectInput.vignette_encounter_id
      : null
    : typeof vignetteEncounterId === 'string'
      ? vignetteEncounterId
      : null
  const updateData = objectInput
    ? (() => {
        const { vignette_encounter_id, ...data } = objectInput
        void vignette_encounter_id
        return data
      })()
    : (vignetteEncounter ?? {})

  if (!id) return

  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Vignette Encounter: ${error.message}`)
}

/**
 * Remove Vignette Encounter
 *
 * Deletes a vignette encounter record from the database.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 */
export async function removeVignetteEncounter(
  vignetteEncounterId:
    | string
    | { vignette_encounter_id: string | null | undefined }
    | null
): Promise<void> {
  const id =
    typeof vignetteEncounterId === 'object'
      ? (vignetteEncounterId?.vignette_encounter_id ?? null)
      : vignetteEncounterId
  if (!id) return

  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Vignette Encounter: ${error.message}`)
}
