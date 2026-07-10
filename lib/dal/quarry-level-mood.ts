import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { QuarryLevelMoodDetail } from '@/lib/types'

const QUARRY_LEVEL_MOOD_SELECT = `
  id,
  quarry_level_id,
  mood_id,
  mood(*)
`

/**
 * Get Quarry Level Moods
 *
 * Retrieves all quarry level mood rows.
 *
 * @returns Quarry Level Moods
 */
export async function getQuarryLevelMoods(): Promise<QuarryLevelMoodDetail[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_level_mood')
    .select(QUARRY_LEVEL_MOOD_SELECT)

  if (error)
    throw new Error(`Error Fetching Quarry Level Moods: ${error.message}`)

  return (data ?? []) as QuarryLevelMoodDetail[]
}

/**
 * Get Quarry Level Mood
 *
 * Retrieves a single quarry level mood row by ID.
 *
 * @param id Quarry Level Mood ID
 * @returns Quarry Level Mood or null
 */
export async function getQuarryLevelMood(
  id: string | null | undefined
): Promise<QuarryLevelMoodDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_level_mood')
    .select(QUARRY_LEVEL_MOOD_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Quarry Level Mood: ${error.message}`)

  return data as QuarryLevelMoodDetail | null
}

/**
 * Add Quarry Level Mood
 *
 * Adds a new quarry level mood record to the database.
 *
 * @param quarryLevelMood Quarry Level Mood Data
 * @returns Inserted Quarry Level Mood
 */
export async function addQuarryLevelMood(
  quarryLevelMood: Omit<
    TablesInsert<'quarry_level_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<QuarryLevelMoodDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'quarry_level_mood'> = { ...quarryLevelMood }

  delete insertData.id

  const { data, error } = await supabase
    .from('quarry_level_mood')
    .insert(insertData)
    .select(QUARRY_LEVEL_MOOD_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Quarry Level Mood: ${error.message}`)

  return data as QuarryLevelMoodDetail
}

/**
 * Update Quarry Level Mood
 *
 * Updates an existing quarry level mood record.
 *
 * @param id Quarry Level Mood ID
 * @param quarryLevelMood Quarry Level Mood Data
 */
export async function updateQuarryLevelMood(
  id: string,
  quarryLevelMood: Omit<
    TablesUpdate<'quarry_level_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'quarry_level_mood'> = { ...quarryLevelMood }

  delete updateData.id

  const { error } = await supabase
    .from('quarry_level_mood')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Quarry Level Mood: ${error.message}`)
}

/**
 * Remove Quarry Level Mood
 *
 * Deletes a quarry level mood record from the database.
 *
 * @param id Quarry Level Mood ID
 */
export async function removeQuarryLevelMood(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_level_mood')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Quarry Level Mood: ${error.message}`)
}
