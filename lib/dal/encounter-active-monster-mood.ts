import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { EncounterActiveMonsterMoodDetail } from '@/lib/types'

const ENCOUNTER_ACTIVE_MONSTER_MOOD_SELECT = `
  id,
  encounter_active_monster_id,
  settlement_id,
  mood_id,
  mood(*)
`

/**
 * Get Encounter Active Monster Moods
 *
 * Retrieves the requested encounter active monster moods data.
 *
 * @returns Encounter Active Monster Moods
 */
export async function getEncounterActiveMonsterMoods(): Promise<
  EncounterActiveMonsterMoodDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_active_monster_mood')
    .select(ENCOUNTER_ACTIVE_MONSTER_MOOD_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Encounter Active Monster Moods: ${error.message}`
    )

  return (data ?? []) as EncounterActiveMonsterMoodDetail[]
}

/**
 * Get Encounter Active Monster Mood
 *
 * Retrieves the requested encounter active monster mood data.
 *
 * @param id Encounter Active Monster Mood ID
 * @returns Encounter Active Monster Mood
 */
export async function getEncounterActiveMonsterMood(
  id: string | null | undefined
): Promise<EncounterActiveMonsterMoodDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('encounter_active_monster_mood')
    .select(ENCOUNTER_ACTIVE_MONSTER_MOOD_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Encounter Active Monster Mood: ${error.message}`
    )

  return data as EncounterActiveMonsterMoodDetail | null
}

/**
 * Add Encounter Active Monster Mood
 *
 * Adds a new encounter active monster mood record to the database.
 *
 * @param encounterActiveMonsterMood Encounter Active Monster Mood Data
 * @returns Inserted Encounter Active Monster Mood
 */
export async function addEncounterActiveMonsterMood(
  encounterActiveMonsterMood: Omit<
    TablesInsert<'encounter_active_monster_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<EncounterActiveMonsterMoodDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'encounter_active_monster_mood'> = {
    ...encounterActiveMonsterMood
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('encounter_active_monster_mood')
    .insert(insertData)
    .select(ENCOUNTER_ACTIVE_MONSTER_MOOD_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Encounter Active Monster Mood: ${error.message}`
    )

  return data as EncounterActiveMonsterMoodDetail
}

/**
 * Update Encounter Active Monster Mood
 *
 * Updates an existing encounter active monster mood record.
 *
 * @param id Encounter Active Monster Mood ID
 * @param encounterActiveMonsterMood Encounter Active Monster Mood Data
 */
export async function updateEncounterActiveMonsterMood(
  id: string,
  encounterActiveMonsterMood: Omit<
    TablesUpdate<'encounter_active_monster_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'encounter_active_monster_mood'> = {
    ...encounterActiveMonsterMood
  }

  delete updateData.id

  const { error } = await supabase
    .from('encounter_active_monster_mood')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Encounter Active Monster Mood: ${error.message}`
    )
}

/**
 * Remove Encounter Active Monster Mood
 *
 * Deletes a encounter active monster mood record from the database.
 */
export async function removeEncounterActiveMonsterMood(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('encounter_active_monster_mood')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Encounter Active Monster Mood: ${error.message}`
    )
}
