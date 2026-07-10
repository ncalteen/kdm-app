import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { EncounterMonsterLevelDetail } from '@/lib/types'

const ENCOUNTER_MONSTER_LEVEL_SELECT = `
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
  moods:encounter_monster_level_mood(*, mood(*)),
  traits:encounter_monster_level_trait(*, trait(*))
`

/**
 * Get Encounter Monster Levels
 *
 * Retrieves all encounter monster level rows.
 *
 * @returns Encounter Monster Levels
 */
export async function getEncounterMonsterLevels(): Promise<
  EncounterMonsterLevelDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_monster_level')
    .select(ENCOUNTER_MONSTER_LEVEL_SELECT)
    .order('level_number')

  if (error)
    throw new Error(`Error Fetching Encounter Monster Levels: ${error.message}`)

  return (data ?? []) as EncounterMonsterLevelDetail[]
}

/**
 * Get Encounter Monster Level
 *
 * Retrieves a single encounter monster level row by ID.
 *
 * @param id Encounter Monster Level ID
 * @returns Encounter Monster Level or null
 */
export async function getEncounterMonsterLevel(
  id: string | null | undefined
): Promise<EncounterMonsterLevelDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_monster_level')
    .select(ENCOUNTER_MONSTER_LEVEL_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Encounter Monster Level: ${error.message}`)

  return data as EncounterMonsterLevelDetail | null
}

/**
 * Add Encounter Monster Level
 *
 * Adds a new encounter monster level record to the database.
 *
 * @param encounterMonsterLevel Encounter Monster Level Data
 * @returns Inserted Encounter Monster Level
 */
export async function addEncounterMonsterLevel(
  encounterMonsterLevel: Omit<
    TablesInsert<'encounter_monster_level'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<EncounterMonsterLevelDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'encounter_monster_level'> = {
    ...encounterMonsterLevel
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('encounter_monster_level')
    .insert(insertData)
    .select(ENCOUNTER_MONSTER_LEVEL_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Encounter Monster Level: ${error.message}`)

  return data as EncounterMonsterLevelDetail
}

/**
 * Update Encounter Monster Level
 *
 * Updates an existing encounter monster level record.
 *
 * @param id Encounter Monster Level ID
 * @param encounterMonsterLevel Encounter Monster Level Data
 */
export async function updateEncounterMonsterLevel(
  id: string,
  encounterMonsterLevel: Omit<
    TablesUpdate<'encounter_monster_level'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'encounter_monster_level'> = {
    ...encounterMonsterLevel
  }

  delete updateData.id

  const { error } = await supabase
    .from('encounter_monster_level')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Encounter Monster Level: ${error.message}`)
}

/**
 * Remove Encounter Monster Level
 *
 * Deletes a encounter monster level record from the database.
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
