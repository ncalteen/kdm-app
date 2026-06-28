import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'
import { EncounterMonsterDetail } from '@/lib/types'

const ENCOUNTER_MONSTER_SELECT = `
  id,
  custom,
  monster_name,
  basic_action,
  instinct,
  levels:encounter_monster_level(
    id,
    encounter_monster_id,
    level_number,
    life,
    movement,
    toughness,
    speed,
    damage,
    accuracy,
    evasion,
    luck,
    sub_monster_name,
    moods:encounter_monster_level_mood(
      id,
      encounter_monster_level_id,
      mood_id,
      mood(
        id,
        custom,
        mood_name,
        rules
      )
    ),
    traits:encounter_monster_level_trait(
      id,
      encounter_monster_level_id,
      trait_id,
      trait(
        id,
        custom,
        trait_name,
        rules
      )
    )
  )
`

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
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_monster')
    .select(ENCOUNTER_MONSTER_SELECT)
    .order('monster_name')

  if (error)
    throw new Error(`Error Fetching Encounter Monsters: ${error.message}`)

  return data
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
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_monster')
    .select(ENCOUNTER_MONSTER_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('monster_name')

  if (error)
    throw new Error(
      `Error Fetching Custom Encounter Monsters: ${error.message}`
    )

  const monsterMap: { [key: string]: EncounterMonsterDetail } = {}
  for (const row of data ?? []) monsterMap[row.id] = row

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
