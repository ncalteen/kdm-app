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
      'id, archived_at, basic_action, custom, instinct, monster_name, encounter_monster_level(id, accuracy, damage, encounter_monster_id, evasion, level_number, life, luck, movement, speed, sub_monster_name, toughness, encounter_monster_level_trait(trait(id, custom, trait_name, rules)), encounter_monster_level_mood(mood(id, custom, mood_name, rules)))'
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
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_monster')
    .insert(encounterMonster)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Encounter Monster: ${error.message}`)

  return data.id
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
