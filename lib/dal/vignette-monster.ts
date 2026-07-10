import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteMonsterDetail } from '@/lib/types'

const VIGNETTE_MONSTER_SELECT = `
  id,
  monster_name,
  multi_monster,
  source_monster_type,
  source_nemesis_id,
  source_quarry_id,
  source_nemesis:nemesis(*),
  source_quarry:quarry(*),
  levels:vignette_monster_level(
    *,
    moods:vignette_monster_level_mood(*, mood(*)),
    survivor_statuses:vignette_monster_level_survivor_status(*, survivor_status(*)),
    traits:vignette_monster_level_trait(*, trait(*))
  ),
  survivors:vignette_survivor(
    *,
    abilities_impairments:vignette_survivor_ability_impairment(*, ability_impairment(*)),
    disorders:vignette_survivor_disorder(*, disorder(*)),
    fighting_arts:vignette_survivor_fighting_art(*, fighting_art(*)),
    gear_grid:vignette_survivor_gear_grid(*),
    secret_fighting_arts:vignette_survivor_secret_fighting_art(*, secret_fighting_art(*)),
    weapon_type(*)
  )
`

/**
 * Get Vignette Monsters
 *
 * Retrieves all vignette monster rows.
 *
 * @returns Vignette Monsters
 */
export async function getVignetteMonsters(): Promise<VignetteMonsterDetail[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_monster')
    .select(VIGNETTE_MONSTER_SELECT)
    .order('monster_name')

  if (error)
    throw new Error(`Error Fetching Vignette Monsters: ${error.message}`)

  return (data ?? []) as VignetteMonsterDetail[]
}

/**
 * Get Vignette Monster
 *
 * Retrieves a single vignette monster row by ID.
 *
 * @param id Vignette Monster ID
 * @returns Vignette Monster or null
 */
export async function getVignetteMonster(
  id: string | null | undefined
): Promise<VignetteMonsterDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_monster')
    .select(VIGNETTE_MONSTER_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Vignette Monster: ${error.message}`)

  return data as VignetteMonsterDetail | null
}

/**
 * Add Vignette Monster
 *
 * Adds a new vignette monster record to the database.
 *
 * @param vignetteMonster Vignette Monster Data
 * @returns Inserted Vignette Monster
 */
export async function addVignetteMonster(
  vignetteMonster: Omit<
    TablesInsert<'vignette_monster'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteMonsterDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_monster'> = { ...vignetteMonster }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_monster')
    .insert(insertData)
    .select(VIGNETTE_MONSTER_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Vignette Monster: ${error.message}`)

  return data as VignetteMonsterDetail
}

/**
 * Update Vignette Monster
 *
 * Updates an existing vignette monster record.
 *
 * @param id Vignette Monster ID
 * @param vignetteMonster Vignette Monster Data
 */
export async function updateVignetteMonster(
  id: string,
  vignetteMonster: Omit<
    TablesUpdate<'vignette_monster'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_monster'> = { ...vignetteMonster }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_monster')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Vignette Monster: ${error.message}`)
}

/**
 * Remove Vignette Monster
 *
 * Deletes a vignette monster record from the database.
 *
 * @param id Vignette Monster ID
 */
export async function removeVignetteMonster(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_monster')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Vignette Monster: ${error.message}`)
}
