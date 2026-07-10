import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { HuntMonsterMoodDetail } from '@/lib/types'

const HUNT_MONSTER_MOOD_SELECT = `
  id,
  hunt_monster_id,
  settlement_id,
  mood_id,
  mood(*)
`

/**
 * Get Hunt Monster Moods
 *
 * Retrieves all hunt monster mood rows.
 *
 * @returns Hunt Monster Moods
 */
export async function getHuntMonsterMoods(): Promise<HuntMonsterMoodDetail[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_monster_mood')
    .select(HUNT_MONSTER_MOOD_SELECT)

  if (error)
    throw new Error(`Error Fetching Hunt Monster Moods: ${error.message}`)

  return (data ?? []) as HuntMonsterMoodDetail[]
}

/**
 * Get Hunt Monster Mood
 *
 * Retrieves a single hunt monster mood row by ID.
 *
 * @param id Hunt Monster Mood ID
 * @returns Hunt Monster Mood or null
 */
export async function getHuntMonsterMood(
  id: string | null | undefined
): Promise<HuntMonsterMoodDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_monster_mood')
    .select(HUNT_MONSTER_MOOD_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Hunt Monster Mood: ${error.message}`)

  return data as HuntMonsterMoodDetail | null
}

/**
 * Add Hunt Monster Mood
 *
 * Adds a new hunt monster mood record to the database.
 *
 * @param huntMonsterMood Hunt Monster Mood Data
 * @returns Inserted Hunt Monster Mood
 */
export async function addHuntMonsterMood(
  huntMonsterMood: Omit<
    TablesInsert<'hunt_monster_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<HuntMonsterMoodDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'hunt_monster_mood'> = { ...huntMonsterMood }

  delete insertData.id

  const { data, error } = await supabase
    .from('hunt_monster_mood')
    .insert(insertData)
    .select(HUNT_MONSTER_MOOD_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Hunt Monster Mood: ${error.message}`)

  return data as HuntMonsterMoodDetail
}

/**
 * Update Hunt Monster Mood
 *
 * Updates an existing hunt monster mood record.
 *
 * @param id Hunt Monster Mood ID
 * @param huntMonsterMood Hunt Monster Mood Data
 */
export async function updateHuntMonsterMood(
  id: string,
  huntMonsterMood: Omit<
    TablesUpdate<'hunt_monster_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'hunt_monster_mood'> = { ...huntMonsterMood }

  delete updateData.id

  const { error } = await supabase
    .from('hunt_monster_mood')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Hunt Monster Mood: ${error.message}`)
}

/**
 * Remove Hunt Monster Mood
 *
 * Deletes a hunt monster mood record from the database.
 *
 * @param id Hunt Monster Mood ID
 */
export async function removeHuntMonsterMood(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('hunt_monster_mood')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Hunt Monster Mood: ${error.message}`)
}
