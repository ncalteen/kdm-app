import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteMonsterLevelMoodDetail } from '@/lib/types'

const VIGNETTE_MONSTER_LEVEL_MOOD_SELECT = `
  id,
  vignette_monster_level_id,
  mood_id,
  mood(*)
`

/**
 * Get Vignette Monster Level Moods
 *
 * Retrieves all vignette monster level mood rows.
 *
 * @returns Vignette Monster Level Moods
 */
export async function getVignetteMonsterLevelMoods(): Promise<
  VignetteMonsterLevelMoodDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_monster_level_mood')
    .select(VIGNETTE_MONSTER_LEVEL_MOOD_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Monster Level Moods: ${error.message}`
    )

  return (data ?? []) as VignetteMonsterLevelMoodDetail[]
}

/**
 * Get Vignette Monster Level Mood
 *
 * Retrieves a single vignette monster level mood row by ID.
 *
 * @param id Vignette Monster Level Mood ID
 * @returns Vignette Monster Level Mood or null
 */
export async function getVignetteMonsterLevelMood(
  id: string | null | undefined
): Promise<VignetteMonsterLevelMoodDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_monster_level_mood')
    .select(VIGNETTE_MONSTER_LEVEL_MOOD_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Monster Level Mood: ${error.message}`
    )

  return data as VignetteMonsterLevelMoodDetail | null
}

/**
 * Add Vignette Monster Level Mood
 *
 * Adds a new vignette monster level mood record to the database.
 *
 * @param vignetteMonsterLevelMood Vignette Monster Level Mood Data
 * @returns Inserted Vignette Monster Level Mood
 */
export async function addVignetteMonsterLevelMood(
  vignetteMonsterLevelMood: Omit<
    TablesInsert<'vignette_monster_level_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteMonsterLevelMoodDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_monster_level_mood'> = {
    ...vignetteMonsterLevelMood
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_monster_level_mood')
    .insert(insertData)
    .select(VIGNETTE_MONSTER_LEVEL_MOOD_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Monster Level Mood: ${error.message}`
    )

  return data as VignetteMonsterLevelMoodDetail
}

/**
 * Update Vignette Monster Level Mood
 *
 * Updates an existing vignette monster level mood record.
 *
 * @param id Vignette Monster Level Mood ID
 * @param vignetteMonsterLevelMood Vignette Monster Level Mood Data
 */
export async function updateVignetteMonsterLevelMood(
  id: string,
  vignetteMonsterLevelMood: Omit<
    TablesUpdate<'vignette_monster_level_mood'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_monster_level_mood'> = {
    ...vignetteMonsterLevelMood
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_monster_level_mood')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Monster Level Mood: ${error.message}`
    )
}

/**
 * Remove Vignette Monster Level Mood
 *
 * Deletes a vignette monster level mood record from the database.
 *
 * @param id Vignette Monster Level Mood ID
 */
export async function removeVignetteMonsterLevelMood(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_monster_level_mood')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Monster Level Mood: ${error.message}`
    )
}
