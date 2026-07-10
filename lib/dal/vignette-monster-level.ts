import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteMonsterLevelDetail } from '@/lib/types'

const VIGNETTE_MONSTER_LEVEL_SELECT = `
  id,
  vignette_monster_id,
  level_number,
  sub_monster_name,
  basic_cards,
  advanced_cards,
  legendary_cards,
  overtone_cards,
  ai_deck_remaining,
  accuracy,
  accuracy_tokens,
  damage,
  damage_tokens,
  evasion,
  evasion_tokens,
  life,
  luck,
  luck_tokens,
  movement,
  movement_tokens,
  speed,
  speed_tokens,
  strength,
  strength_tokens,
  toughness,
  toughness_tokens,
  moods:vignette_monster_level_mood(*, mood(*)),
  survivor_statuses:vignette_monster_level_survivor_status(*, survivor_status(*)),
  traits:vignette_monster_level_trait(*, trait(*))
`

/**
 * Get Vignette Monster Levels
 *
 * Retrieves all vignette monster level rows.
 *
 * @returns Vignette Monster Levels
 */
export async function getVignetteMonsterLevels(): Promise<
  VignetteMonsterLevelDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_monster_level')
    .select(VIGNETTE_MONSTER_LEVEL_SELECT)
    .order('level_number')

  if (error)
    throw new Error(`Error Fetching Vignette Monster Levels: ${error.message}`)

  return (data ?? []) as VignetteMonsterLevelDetail[]
}

/**
 * Get Vignette Monster Level
 *
 * Retrieves a single vignette monster level row by ID.
 *
 * @param id Vignette Monster Level ID
 * @returns Vignette Monster Level or null
 */
export async function getVignetteMonsterLevel(
  id: string | null | undefined
): Promise<VignetteMonsterLevelDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_monster_level')
    .select(VIGNETTE_MONSTER_LEVEL_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Vignette Monster Level: ${error.message}`)

  return data as VignetteMonsterLevelDetail | null
}

/**
 * Add Vignette Monster Level
 *
 * Adds a new vignette monster level record to the database.
 *
 * @param vignetteMonsterLevel Vignette Monster Level Data
 * @returns Inserted Vignette Monster Level
 */
export async function addVignetteMonsterLevel(
  vignetteMonsterLevel: Omit<
    TablesInsert<'vignette_monster_level'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteMonsterLevelDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_monster_level'> = {
    ...vignetteMonsterLevel
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_monster_level')
    .insert(insertData)
    .select(VIGNETTE_MONSTER_LEVEL_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Vignette Monster Level: ${error.message}`)

  return data as VignetteMonsterLevelDetail
}

/**
 * Update Vignette Monster Level
 *
 * Updates an existing vignette monster level record.
 *
 * @param id Vignette Monster Level ID
 * @param vignetteMonsterLevel Vignette Monster Level Data
 */
export async function updateVignetteMonsterLevel(
  id: string,
  vignetteMonsterLevel: Omit<
    TablesUpdate<'vignette_monster_level'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_monster_level'> = {
    ...vignetteMonsterLevel
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_monster_level')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Vignette Monster Level: ${error.message}`)
}

/**
 * Remove Vignette Monster Level
 *
 * Deletes a vignette monster level record from the database.
 *
 * @param id Vignette Monster Level ID
 */
export async function removeVignetteMonsterLevel(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_monster_level')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Vignette Monster Level: ${error.message}`)
}
