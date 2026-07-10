import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteEncounterMonsterMoodDetail } from '@/lib/types'

const VIGNETTE_ENCOUNTER_MONSTER_MOOD_SELECT = `
  id,
  vignette_encounter_monster_id,
  mood_id,
  mood(*)
`

/**
 * Get Vignette Encounter Monster Moods
 *
 * Retrieves all vignette encounter monster mood rows.
 *
 * @returns Vignette Encounter Monster Moods
 */
export async function getVignetteEncounterMonsterMoods(): Promise<
  VignetteEncounterMonsterMoodDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_monster_mood')
    .select(VIGNETTE_ENCOUNTER_MONSTER_MOOD_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Monster Moods: ${error.message}`
    )

  return (data ?? []) as VignetteEncounterMonsterMoodDetail[]
}

/**
 * Get Vignette Encounter Monster Mood
 *
 * Retrieves a single vignette encounter monster mood row by ID.
 *
 * @param id Vignette Encounter Monster Mood ID
 * @returns Vignette Encounter Monster Mood or null
 */
export async function getVignetteEncounterMonsterMood(
  id: string | null | undefined
): Promise<VignetteEncounterMonsterMoodDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_monster_mood')
    .select(VIGNETTE_ENCOUNTER_MONSTER_MOOD_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Monster Mood: ${error.message}`
    )

  return data as VignetteEncounterMonsterMoodDetail | null
}

/**
 * Add Vignette Encounter Monster Mood
 *
 * Adds a new vignette encounter monster mood record to the database.
 *
 * @param vignetteEncounterMonsterMood Vignette Encounter Monster Mood Data
 * @returns Inserted Vignette Encounter Monster Mood
 */
export async function addVignetteEncounterMonsterMood(
  vignetteEncounterMonsterMood: Omit<
    TablesInsert<'vignette_encounter_monster_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteEncounterMonsterMoodDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_encounter_monster_mood'> = {
    ...vignetteEncounterMonsterMood
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_encounter_monster_mood')
    .insert(insertData)
    .select(VIGNETTE_ENCOUNTER_MONSTER_MOOD_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Monster Mood: ${error.message}`
    )

  return data as VignetteEncounterMonsterMoodDetail
}

/**
 * Update Vignette Encounter Monster Mood
 *
 * Updates an existing vignette encounter monster mood record.
 *
 * @param id Vignette Encounter Monster Mood ID
 * @param vignetteEncounterMonsterMood Vignette Encounter Monster Mood Data
 */
export async function updateVignetteEncounterMonsterMood(
  id: string,
  vignetteEncounterMonsterMood: Omit<
    TablesUpdate<'vignette_encounter_monster_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_encounter_monster_mood'> = {
    ...vignetteEncounterMonsterMood
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_encounter_monster_mood')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Monster Mood: ${error.message}`
    )
}

/**
 * Remove Vignette Encounter Monster Mood
 *
 * Deletes a vignette encounter monster mood record from the database.
 *
 * @param id Vignette Encounter Monster Mood ID
 */
export async function removeVignetteEncounterMonsterMood(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_monster_mood')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Monster Mood: ${error.message}`
    )
}
