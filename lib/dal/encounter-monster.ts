import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import {
  EncounterMonsterDetail,
  EncounterMonsterLevelDetail,
  MoodDetail,
  TraitDetail
} from '@/lib/types'

/**
 * Get Encounter Monsters
 *
 * Retrieves encounter monster catalog rows and their level data.
 *
 * @returns Encounter Monsters
 */
export async function getEncounterMonsters(): Promise<
  EncounterMonsterDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_monster')
    .select(
      'id, archived_at, basic_action, custom, instinct, monster_name, user_id, encounter_monster_level(id, accuracy, damage, encounter_monster_id, evasion, level_number, life, luck, movement, speed, sub_monster_name, toughness, encounter_monster_level_trait(trait(id, custom, trait_name, rules)), encounter_monster_level_mood(mood(id, custom, mood_name, rules)))'
    )
    .order('monster_name')

  if (error)
    throw new Error(`Error Fetching Encounter Monsters: ${error.message}`)

  return (data ?? []).map((monster) => {
    const levelRows = (
      monster as unknown as {
        encounter_monster_level: (Omit<
          EncounterMonsterLevelDetail,
          'traits' | 'moods'
        > & {
          encounter_monster_level_trait: { trait: TraitDetail | null }[]
          encounter_monster_level_mood: { mood: MoodDetail | null }[]
        })[]
      }
    ).encounter_monster_level

    return {
      ...monster,
      levels: (levelRows ?? [])
        .map((level) => {
          const {
            encounter_monster_level_trait,
            encounter_monster_level_mood
          } = level

          return {
            ...level,
            traits: (encounter_monster_level_trait ?? [])
              .map((row) => row.trait)
              .filter((trait): trait is TraitDetail => trait !== null),
            moods: (encounter_monster_level_mood ?? [])
              .map((row) => row.mood)
              .filter((mood): mood is MoodDetail => mood !== null)
          }
        })
        .sort((a, b) => a.level_number - b.level_number)
    }
  })
}

/**
 * Get User Custom Encounter Monsters
 *
 * Retrieves only custom encounter monsters created by the current user.
 *
 * @returns Custom Encounter Monster Data Map
 */
export async function getUserCustomEncounterMonsters(): Promise<{
  [key: string]: EncounterMonsterDetail
}> {
  const userId = await getUserId()
  const monsters = await getEncounterMonsters()

  const monsterMap: { [key: string]: EncounterMonsterDetail } = {}
  for (const monster of monsters)
    if (monster.custom && monster.user_id === userId && !monster.archived_at)
      monsterMap[monster.id] = monster

  return monsterMap
}

/**
 * Get Encounter Monster
 *
 * Retrieves a single encounter monster by ID.
 *
 * @param encounterMonsterId Encounter Monster ID
 * @returns Encounter Monster Detail or null
 */
export async function getEncounterMonster(
  encounterMonsterId: string | null | undefined
): Promise<EncounterMonsterDetail | null> {
  if (!encounterMonsterId) return null

  const monsters = await getEncounterMonsters()
  return monsters.find((monster) => monster.id === encounterMonsterId) ?? null
}

/**
 * Add Encounter Monster
 *
 * Adds an encounter monster catalog row.
 *
 * @param encounterMonster Encounter Monster Data
 * @returns Inserted Encounter Monster ID
 */
export async function addEncounterMonster(
  encounterMonster: Omit<
    TablesInsert<'encounter_monster'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<EncounterMonsterDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (encounterMonster.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('encounter_monster')
    .insert({
      ...encounterMonster,
      ...(encounterMonster.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, archived_at, basic_action, custom, instinct, monster_name, updated_at, user_id'
    )
    .single()

  if (error) throw new Error(`Error Adding Encounter Monster: ${error.message}`)

  return { ...data, levels: [] }
}

/**
 * Update Encounter Monster
 *
 * Updates an encounter monster catalog row.
 *
 * @param id Encounter Monster ID
 * @param encounterMonster Encounter Monster Data
 */
export async function updateEncounterMonster(
  id: string,
  encounterMonster: Omit<
    TablesUpdate<'encounter_monster'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_monster')
    .update(encounterMonster)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Encounter Monster: ${error.message}`)
}

/**
 * Remove Encounter Monster
 *
 * Deletes an encounter monster catalog row.
 *
 * @param id Encounter Monster ID
 */
export async function removeEncounterMonster(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_monster')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Encounter Monster: ${error.message}`)
}

/**
 * Add Encounter Monster Level
 *
 * Adds level data for an encounter monster.
 *
 * @param level Encounter Monster Level Data
 * @returns Inserted Encounter Monster Level ID
 */
export async function addEncounterMonsterLevel(
  level: Omit<
    TablesInsert<'encounter_monster_level'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_monster_level')
    .insert(level)
    .select('id')
    .single()

  if (error)
    throw new Error(`Error Adding Encounter Monster Level: ${error.message}`)

  return data.id
}

/**
 * Update Encounter Monster Level
 *
 * Updates an existing encounter monster level row.
 *
 * @param id Encounter Monster Level ID
 * @param level Encounter Monster Level Data
 */
export async function updateEncounterMonsterLevel(
  id: string,
  level: Omit<
    TablesUpdate<'encounter_monster_level'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_monster_level')
    .update(level)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Encounter Monster Level: ${error.message}`)
}

/**
 * Remove Encounter Monster Level
 *
 * Deletes an encounter monster level row.
 *
 * @param id Encounter Monster Level ID
 */
export async function removeEncounterMonsterLevel(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_monster_level')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Encounter Monster Level: ${error.message}`)
}
