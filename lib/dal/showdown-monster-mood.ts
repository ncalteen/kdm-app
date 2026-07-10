import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { ShowdownMonsterMoodDetail } from '@/lib/types'

const SHOWDOWN_MONSTER_MOOD_SELECT = `
  id,
  showdown_monster_id,
  settlement_id,
  mood_id,
  mood(*)
`

/**
 * Get Showdown Monster Moods
 *
 * Retrieves all showdown monster mood rows.
 *
 * @returns Showdown Monster Moods
 */
export async function getShowdownMonsterMoods(): Promise<
  ShowdownMonsterMoodDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_monster_mood')
    .select(SHOWDOWN_MONSTER_MOOD_SELECT)

  if (error)
    throw new Error(`Error Fetching Showdown Monster Moods: ${error.message}`)

  return (data ?? []) as ShowdownMonsterMoodDetail[]
}

/**
 * Get Showdown Monster Mood
 *
 * Retrieves a single showdown monster mood row by ID.
 *
 * @param id Showdown Monster Mood ID
 * @returns Showdown Monster Mood or null
 */
export async function getShowdownMonsterMood(
  id: string | null | undefined
): Promise<ShowdownMonsterMoodDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_monster_mood')
    .select(SHOWDOWN_MONSTER_MOOD_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Showdown Monster Mood: ${error.message}`)

  return data as ShowdownMonsterMoodDetail | null
}

/**
 * Add Showdown Monster Mood
 *
 * Adds a new showdown monster mood record to the database.
 *
 * @param showdownMonsterMood Showdown Monster Mood Data
 * @returns Inserted Showdown Monster Mood
 */
export async function addShowdownMonsterMood(
  showdownMonsterMood: Omit<
    TablesInsert<'showdown_monster_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<ShowdownMonsterMoodDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'showdown_monster_mood'> = {
    ...showdownMonsterMood
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('showdown_monster_mood')
    .insert(insertData)
    .select(SHOWDOWN_MONSTER_MOOD_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Showdown Monster Mood: ${error.message}`)

  return data as ShowdownMonsterMoodDetail
}

/**
 * Update Showdown Monster Mood
 *
 * Updates an existing showdown monster mood record.
 *
 * @param id Showdown Monster Mood ID
 * @param showdownMonsterMood Showdown Monster Mood Data
 */
export async function updateShowdownMonsterMood(
  id: string,
  showdownMonsterMood: Omit<
    TablesUpdate<'showdown_monster_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'showdown_monster_mood'> = {
    ...showdownMonsterMood
  }

  delete updateData.id

  const { error } = await supabase
    .from('showdown_monster_mood')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Showdown Monster Mood: ${error.message}`)
}

/**
 * Remove Showdown Monster Mood
 *
 * Deletes a showdown monster mood record from the database.
 *
 * @param id Showdown Monster Mood ID
 */
export async function removeShowdownMonsterMood(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('showdown_monster_mood')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Showdown Monster Mood: ${error.message}`)
}
