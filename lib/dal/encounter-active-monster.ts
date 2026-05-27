import {
  getSettlementMemberUsernames,
  resolveSettlementAuthorship,
  type SettlementMemberProfile
} from '@/lib/dal/settlement-shared-user'
import { TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import {
  EncounterActiveMonsterDetail,
  MoodDetail,
  TraitDetail
} from '@/lib/types'

/** Catalog Row With Authorship */
type WithAuthorship<T> = T & { user_id: string | null }

/**
 * Get Encounter Active Monsters
 *
 * Retrieves all monsters assigned to an active encounter.
 *
 * @param encounterId Encounter ID
 * @param prefetchedMemberProfiles Optional in-flight member-profile map
 * @returns Encounter Monsters
 */
export async function getEncounterActiveMonsters(
  encounterId: string | null | undefined,
  prefetchedMemberProfiles?: Promise<Map<string, SettlementMemberProfile>>
): Promise<{ [key: string]: EncounterActiveMonsterDetail } | null> {
  if (!encounterId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_active_monster')
    .select(
      'id, accuracy, accuracy_tokens, damage, damage_tokens, encounter_id, encounter_monster_id, encounter_monster_level_id, evasion, evasion_tokens, knocked_down, life, luck, luck_tokens, monster_name, movement, movement_tokens, notes, settlement_id, speed, speed_tokens, toughness, encounter_active_monster_trait(trait(id, custom, user_id, trait_name, rules)), encounter_active_monster_mood(mood(id, custom, user_id, mood_name, rules))'
    )
    .eq('encounter_id', encounterId)

  if (error)
    throw new Error(`Error Fetching Encounter Monsters: ${error.message}`)
  if (!data) return null

  const settlementId =
    (data[0] as { settlement_id?: string | null } | undefined)?.settlement_id ??
    null

  const memberProfiles =
    data.length === 0
      ? new Map<string, SettlementMemberProfile>()
      : await (prefetchedMemberProfiles ??
          (settlementId
            ? getSettlementMemberUsernames(settlementId)
            : Promise.resolve(new Map<string, SettlementMemberProfile>())))

  const encounterMonsterMap: {
    [key: string]: EncounterActiveMonsterDetail
  } = {}

  for (const monster of data ?? []) {
    const traitRows = (
      monster as unknown as {
        encounter_active_monster_trait: {
          trait: WithAuthorship<TraitDetail> | null
        }[]
      }
    ).encounter_active_monster_trait
    const moodRows = (
      monster as unknown as {
        encounter_active_monster_mood: {
          mood: WithAuthorship<MoodDetail> | null
        }[]
      }
    ).encounter_active_monster_mood

    encounterMonsterMap[monster.id] = {
      ...monster,
      traits: (traitRows ?? [])
        .map((row) => row.trait)
        .filter((trait): trait is WithAuthorship<TraitDetail> => trait !== null)
        .map(({ user_id, ...trait }) => ({
          ...trait,
          ...resolveSettlementAuthorship(
            { custom: trait.custom, user_id },
            memberProfiles
          )
        })),
      moods: (moodRows ?? [])
        .map((row) => row.mood)
        .filter((mood): mood is WithAuthorship<MoodDetail> => mood !== null)
        .map(({ user_id, ...mood }) => ({
          ...mood,
          ...resolveSettlementAuthorship(
            { custom: mood.custom, user_id },
            memberProfiles
          )
        })),
      survivor_statuses: []
    }
  }

  return encounterMonsterMap
}

/**
 * Add Encounter Active Monster
 *
 * Adds a monster to an active encounter.
 *
 * @param encounterMonster Encounter Monster Data
 * @returns Inserted Encounter Monster ID
 */
export async function addEncounterActiveMonster(
  encounterMonster: Omit<
    TablesInsert<'encounter_active_monster'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_active_monster')
    .insert(encounterMonster)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Encounter Monster: ${error.message}`)

  return data.id
}

/**
 * Update Encounter Active Monster
 *
 * Updates an active encounter monster's data.
 *
 * @param monsterId Encounter Monster Row ID
 * @param updateData Data to Update
 */
export async function updateEncounterActiveMonster(
  monsterId: string,
  updateData: Partial<EncounterActiveMonsterDetail>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_active_monster')
    .update(updateData)
    .eq('id', monsterId)

  if (error)
    throw new Error(`Error Updating Encounter Monster: ${error.message}`)
}

/**
 * Remove Encounter Active Monster
 *
 * Deletes an active encounter monster row.
 *
 * @param id Encounter Monster Row ID
 */
export async function removeEncounterActiveMonster(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_active_monster')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Encounter Monster: ${error.message}`)
}
