import { getUserId } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { EncounterActiveMonsterDetail } from '@/lib/types'

const ENCOUNTER_ACTIVE_MONSTER_SELECT = `
  id,
  accuracy,
  accuracy_tokens,
  damage,
  damage_tokens,
  encounter_id,
  encounter_monster_id,
  encounter_monster_level_id,
  evasion,
  evasion_tokens,
  knocked_down,
  life,
  luck,
  luck_tokens,
  monster_name,
  movement,
  movement_tokens,
  notes,
  settlement_id,
  speed,
  speed_tokens,
  toughness,
  moods:encounter_active_monster_mood(
    id,
    encounter_active_monster_id,
    settlement_id,
    mood_id,
    mood(
      id,
      custom,
      user_id,
      mood_name,
      rules
    )
  ),
  traits:encounter_active_monster_trait(
    id,
    encounter_active_monster_id,
    settlement_id,
    trait_id,
    trait(
      id,
      custom,
      user_id,
      trait_name,
      rules
    )
  )
`

/**
 * Get Encounter Active Monsters
 *
 * Retrieves all active monsters assigned to an encounter visible to the
 * authenticated user. RLS surfaces active encounter monsters for settlements
 * the user owns or collaborates on.
 *
 * @param encounterId Encounter ID
 * @returns Encounter Monsters by ID
 */
export async function getEncounterActiveMonsters(
  encounterId: string | null | undefined
): Promise<{ [key: string]: EncounterActiveMonsterDetail }> {
  if (!encounterId) return {}

  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_active_monster')
    .select(ENCOUNTER_ACTIVE_MONSTER_SELECT)
    .eq('encounter_id', encounterId)

  if (error)
    throw new Error(`Error Fetching Encounter Monsters: ${error.message}`)

  const map: { [key: string]: EncounterActiveMonsterDetail } = {}
  for (const activeMonster of data) map[activeMonster.id] = activeMonster

  return map
}

/**
 * Add Encounter Active Monster
 *
 * Adds a monster to an active encounter.
 *
 * @param encounterMonster Encounter Monster Data
 * @returns Inserted Encounter Monster
 */
export async function addEncounterActiveMonster(
  encounterMonster: Omit<
    TablesInsert<'encounter_active_monster'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<EncounterActiveMonsterDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_active_monster')
    .insert(encounterMonster)
    .select(ENCOUNTER_ACTIVE_MONSTER_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Encounter Monster: ${error.message}`)

  return data
}

/**
 * Update Encounter Active Monster
 *
 * Updates an active encounter monster's data.
 *
 * @param monsterId Encounter Monster Row ID
 * @param activeMonster Active Monster Data
 */
export async function updateEncounterActiveMonster(
  monsterId: string,
  activeMonster: Omit<
    TablesUpdate<'encounter_active_monster'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'encounter_active_monster'> = {
    ...activeMonster
  }

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
