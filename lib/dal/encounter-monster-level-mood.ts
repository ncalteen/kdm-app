import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { EncounterMonsterLevelMoodDetail } from '@/lib/types'

const ENCOUNTER_MONSTER_LEVEL_MOOD_SELECT = `
  id,
  encounter_monster_level_id,
  mood_id,
  mood(*)
`

/**
 * Get Encounter Monster Level Moods
 *
 * Retrieves all encounter monster level mood rows.
 *
 * @returns Encounter Monster Level Moods
 */
export async function getEncounterMonsterLevelMoods(): Promise<
  EncounterMonsterLevelMoodDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_monster_level_mood')
    .select(ENCOUNTER_MONSTER_LEVEL_MOOD_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Encounter Monster Level Moods: ${error.message}`
    )

  return (data ?? []) as EncounterMonsterLevelMoodDetail[]
}

/**
 * Get Encounter Monster Level Mood
 *
 * Retrieves a single encounter monster level mood row by ID.
 *
 * @param id Encounter Monster Level Mood ID
 * @returns Encounter Monster Level Mood or null
 */
export async function getEncounterMonsterLevelMood(
  id: string | null | undefined
): Promise<EncounterMonsterLevelMoodDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_monster_level_mood')
    .select(ENCOUNTER_MONSTER_LEVEL_MOOD_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Encounter Monster Level Mood: ${error.message}`
    )

  return data as EncounterMonsterLevelMoodDetail | null
}

/**
 * Add Encounter Monster Level Mood
 *
 * Adds a new encounter monster level mood record to the database.
 *
 * @param encounterMonsterLevelMood Encounter Monster Level Mood Data
 * @returns Inserted Encounter Monster Level Mood
 */
export async function addEncounterMonsterLevelMood(
  encounterMonsterLevelMood: Omit<
    TablesInsert<'encounter_monster_level_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<EncounterMonsterLevelMoodDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'encounter_monster_level_mood'> = {
    ...encounterMonsterLevelMood
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('encounter_monster_level_mood')
    .insert(insertData)
    .select(ENCOUNTER_MONSTER_LEVEL_MOOD_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Encounter Monster Level Mood: ${error.message}`
    )

  return data as EncounterMonsterLevelMoodDetail
}

/**
 * Update Encounter Monster Level Mood
 *
 * Updates an existing encounter monster level mood record.
 *
 * @param id Encounter Monster Level Mood ID
 * @param encounterMonsterLevelMood Encounter Monster Level Mood Data
 */
export async function updateEncounterMonsterLevelMood(
  id: string,
  encounterMonsterLevelMood: Omit<
    TablesUpdate<'encounter_monster_level_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'encounter_monster_level_mood'> = {
    ...encounterMonsterLevelMood
  }

  delete updateData.id

  const { error } = await supabase
    .from('encounter_monster_level_mood')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Encounter Monster Level Mood: ${error.message}`
    )
}

/**
 * Remove Encounter Monster Level Mood
 *
 * Deletes a encounter monster level mood record from the database.
 *
 * @param id Encounter Monster Level Mood ID
 */
export async function removeEncounterMonsterLevelMood(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_monster_level_mood')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Encounter Monster Level Mood: ${error.message}`
    )
}
