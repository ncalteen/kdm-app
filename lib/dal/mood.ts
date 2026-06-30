import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { MoodDetail } from '@/lib/types'

export const MOOD_SELECT = `
  id,
  custom,
  mood_name,
  rules
`

/**
 * Get Moods
 *
 * Retrieves all monster moods visible to the authenticated user. RLS
 * surfaces:
 *
 * - Built-in (non-custom) moods
 * - Custom moods owned by the user
 *
 * @returns Moods by ID
 */
export async function getMoods(): Promise<{ [key: string]: MoodDetail }> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase.from('mood').select(MOOD_SELECT)

  if (error) throw new Error(`Error Fetching Moods: ${error.message}`)

  const map: { [key: string]: MoodDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Get User Custom Moods
 *
 * Retrieves only custom moods authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Mood Data Map
 */
export async function getUserCustomMoods(): Promise<{
  [key: string]: MoodDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('mood')
    .select(MOOD_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error) throw new Error(`Error Fetching Custom Moods: ${error.message}`)

  const map: { [key: string]: MoodDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Add Mood
 *
 * Adds a new mood record to the database.
 *
 * @param mood Mood Data
 * @returns Inserted Mood
 */
export async function addMood(
  mood: Omit<
    TablesInsert<'mood'>,
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<MoodDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'mood'> = { ...mood }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data: result, error } = await supabase
    .from('mood')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(MOOD_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Mood: ${error.message}`)

  return result
}

/**
 * Update Mood
 *
 * Updates an existing mood record in the database.
 *
 * @param id Mood ID
 * @param mood Mood Data
 */
export async function updateMood(
  id: string,
  mood: Omit<
    TablesUpdate<'mood'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'mood'> = { ...mood }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase.from('mood').update(updateData).eq('id', id)

  if (error) throw new Error(`Error Updating Mood: ${error.message}`)
}

/**
 * Remove Mood
 *
 * Deletes a mood record.
 *
 * @param id Mood ID
 */
export async function removeMood(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('mood').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Mood: ${error.message}`)
}

/**
 * Get Mood IDs
 *
 * Retrieves the IDs of moods. This depends on if they are custom moods
 * (requires the user ID if so).
 *
 * @param moodNames Mood Names
 * @param custom Custom
 * @param userId User ID
 * @returns Moods IDs
 */
export async function getMoodIds(
  moodNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('mood')
        .select('id')
        .in('mood_name', moodNames)
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('mood')
        .select('id')
        .in('mood_name', moodNames)
        .eq('custom', custom)

  if (error) throw new Error(`Error Fetching Mood ID(s): ${error.message}`)

  if (!data) throw new Error('Mood(s) Not Found')

  return data.map((mood) => mood.id)
}
