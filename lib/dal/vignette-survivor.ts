import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteSurvivorDetail } from '@/lib/types'

const VIGNETTE_SURVIVOR_SELECT = `
  id,
  vignette_monster_id,
  survivor_name,
  survivor_type,
  gender,
  movement,
  accuracy,
  strength,
  evasion,
  luck,
  speed,
  survival,
  insanity,
  courage,
  understanding,
  notes,
  head_armor,
  arm_armor,
  body_armor,
  waist_armor,
  leg_armor,
  weapon_proficiency,
  weapon_type_id,
  abilities_impairments:vignette_survivor_ability_impairment(*, ability_impairment(*)),
  disorders:vignette_survivor_disorder(*, disorder(*)),
  fighting_arts:vignette_survivor_fighting_art(*, fighting_art(*)),
  gear_grid:vignette_survivor_gear_grid(*),
  secret_fighting_arts:vignette_survivor_secret_fighting_art(*, secret_fighting_art(*)),
  weapon_type(*)
`

/**
 * Get Vignette Survivors
 *
 * Retrieves all vignette survivor rows.
 *
 * @returns Vignette Survivors
 */
export async function getVignetteSurvivors(): Promise<
  VignetteSurvivorDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor')
    .select(VIGNETTE_SURVIVOR_SELECT)
    .order('survivor_name')

  if (error)
    throw new Error(`Error Fetching Vignette Survivors: ${error.message}`)

  return (data ?? []) as VignetteSurvivorDetail[]
}

/**
 * Get Vignette Survivor
 *
 * Retrieves a single vignette survivor row by ID.
 *
 * @param id Vignette Survivor ID
 * @returns Vignette Survivor or null
 */
export async function getVignetteSurvivor(
  id: string | null | undefined
): Promise<VignetteSurvivorDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor')
    .select(VIGNETTE_SURVIVOR_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Vignette Survivor: ${error.message}`)

  return data as VignetteSurvivorDetail | null
}

/**
 * Add Vignette Survivor
 *
 * Adds a new vignette survivor record to the database.
 *
 * @param vignetteSurvivor Vignette Survivor Data
 * @returns Inserted Vignette Survivor
 */
export async function addVignetteSurvivor(
  vignetteSurvivor: Omit<
    TablesInsert<'vignette_survivor'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteSurvivorDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_survivor'> = { ...vignetteSurvivor }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_survivor')
    .insert(insertData)
    .select(VIGNETTE_SURVIVOR_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Vignette Survivor: ${error.message}`)

  return data as VignetteSurvivorDetail
}

/**
 * Update Vignette Survivor
 *
 * Updates an existing vignette survivor record.
 *
 * @param id Vignette Survivor ID
 * @param vignetteSurvivor Vignette Survivor Data
 */
export async function updateVignetteSurvivor(
  id: string,
  vignetteSurvivor: Omit<
    TablesUpdate<'vignette_survivor'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_survivor'> = { ...vignetteSurvivor }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_survivor')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Vignette Survivor: ${error.message}`)
}

/**
 * Remove Vignette Survivor
 *
 * Deletes a vignette survivor record from the database.
 *
 * @param id Vignette Survivor ID
 */
export async function removeVignetteSurvivor(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_survivor')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Vignette Survivor: ${error.message}`)
}
