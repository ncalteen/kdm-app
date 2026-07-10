import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { NemesisLevelMoodDetail } from '@/lib/types'

const NEMESIS_LEVEL_MOOD_SELECT = `
  id,
  nemesis_level_id,
  mood_id,
  mood(*)
`

/**
 * Get Nemesis Level Moods
 *
 * Retrieves all nemesis level mood rows.
 *
 * @returns Nemesis Level Moods
 */
export async function getNemesisLevelMoods(): Promise<
  NemesisLevelMoodDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_level_mood')
    .select(NEMESIS_LEVEL_MOOD_SELECT)

  if (error)
    throw new Error(`Error Fetching Nemesis Level Moods: ${error.message}`)

  return (data ?? []) as NemesisLevelMoodDetail[]
}

/**
 * Get Nemesis Level Mood
 *
 * Retrieves a single nemesis level mood row by ID.
 *
 * @param id Nemesis Level Mood ID
 * @returns Nemesis Level Mood or null
 */
export async function getNemesisLevelMood(
  id: string | null | undefined
): Promise<NemesisLevelMoodDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_level_mood')
    .select(NEMESIS_LEVEL_MOOD_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Nemesis Level Mood: ${error.message}`)

  return data as NemesisLevelMoodDetail | null
}

/**
 * Add Nemesis Level Mood
 *
 * Adds a new nemesis level mood record to the database.
 *
 * @param nemesisLevelMood Nemesis Level Mood Data
 * @returns Inserted Nemesis Level Mood
 */
export async function addNemesisLevelMood(
  nemesisLevelMood: Omit<
    TablesInsert<'nemesis_level_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<NemesisLevelMoodDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'nemesis_level_mood'> = { ...nemesisLevelMood }

  delete insertData.id

  const { data, error } = await supabase
    .from('nemesis_level_mood')
    .insert(insertData)
    .select(NEMESIS_LEVEL_MOOD_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Nemesis Level Mood: ${error.message}`)

  return data as NemesisLevelMoodDetail
}

/**
 * Update Nemesis Level Mood
 *
 * Updates an existing nemesis level mood record.
 *
 * @param id Nemesis Level Mood ID
 * @param nemesisLevelMood Nemesis Level Mood Data
 */
export async function updateNemesisLevelMood(
  id: string,
  nemesisLevelMood: Omit<
    TablesUpdate<'nemesis_level_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'nemesis_level_mood'> = { ...nemesisLevelMood }

  delete updateData.id

  const { error } = await supabase
    .from('nemesis_level_mood')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Nemesis Level Mood: ${error.message}`)
}

/**
 * Remove Nemesis Level Mood
 *
 * Deletes a nemesis level mood record from the database.
 *
 * @param id Nemesis Level Mood ID
 */
export async function removeNemesisLevelMood(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('nemesis_level_mood')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Nemesis Level Mood: ${error.message}`)
}
