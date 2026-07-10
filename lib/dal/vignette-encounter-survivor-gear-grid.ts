import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteEncounterSurvivorGearGridDetail } from '@/lib/types'

const VIGNETTE_ENCOUNTER_SURVIVOR_GEAR_GRID_SELECT = `
  id,
  vignette_encounter_survivor_id,
  pos_top_left,
  pos_top_center,
  pos_top_right,
  pos_mid_left,
  pos_mid_center,
  pos_mid_right,
  pos_bottom_left,
  pos_bottom_center,
  pos_bottom_right,
  selected_armor_set_id
`

/**
 * Get Vignette Encounter Survivor Gear Grids
 *
 * Retrieves all vignette encounter survivor gear grid rows.
 *
 * @returns Vignette Encounter Survivor Gear Grids
 */
export async function getVignetteEncounterSurvivorGearGrids(): Promise<
  VignetteEncounterSurvivorGearGridDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_gear_grid')
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_GEAR_GRID_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivor Gear Grids: ${error.message}`
    )

  return (data ?? []) as VignetteEncounterSurvivorGearGridDetail[]
}

/**
 * Get Vignette Encounter Survivor Gear Grid
 *
 * Retrieves a single vignette encounter survivor gear grid row by ID.
 *
 * @param id Vignette Encounter Survivor Gear Grid ID
 * @returns Vignette Encounter Survivor Gear Grid or null
 */
export async function getVignetteEncounterSurvivorGearGrid(
  id: string | null | undefined
): Promise<VignetteEncounterSurvivorGearGridDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_gear_grid')
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_GEAR_GRID_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivor Gear Grid: ${error.message}`
    )

  return data as VignetteEncounterSurvivorGearGridDetail | null
}

/**
 * Add Vignette Encounter Survivor Gear Grid
 *
 * Adds a new vignette encounter survivor gear grid record to the database.
 *
 * @param vignetteEncounterSurvivorGearGrid Vignette Encounter Survivor Gear Grid Data
 * @returns Inserted Vignette Encounter Survivor Gear Grid
 */
export async function addVignetteEncounterSurvivorGearGrid(
  vignetteEncounterSurvivorGearGrid: Omit<
    TablesInsert<'vignette_encounter_survivor_gear_grid'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteEncounterSurvivorGearGridDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_encounter_survivor_gear_grid'> = {
    ...vignetteEncounterSurvivorGearGrid
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_gear_grid')
    .insert(insertData)
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_GEAR_GRID_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Survivor Gear Grid: ${error.message}`
    )

  return data as VignetteEncounterSurvivorGearGridDetail
}

/**
 * Update Vignette Encounter Survivor Gear Grid
 *
 * Updates an existing vignette encounter survivor gear grid record.
 *
 * @param id Vignette Encounter Survivor Gear Grid ID
 * @param vignetteEncounterSurvivorGearGrid Vignette Encounter Survivor Gear Grid Data
 */
export async function updateVignetteEncounterSurvivorGearGrid(
  id: string,
  vignetteEncounterSurvivorGearGrid: Omit<
    TablesUpdate<'vignette_encounter_survivor_gear_grid'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_encounter_survivor_gear_grid'> = {
    ...vignetteEncounterSurvivorGearGrid
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_encounter_survivor_gear_grid')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Survivor Gear Grid: ${error.message}`
    )
}

/**
 * Remove Vignette Encounter Survivor Gear Grid
 *
 * Deletes a vignette encounter survivor gear grid record from the database.
 *
 * @param id Vignette Encounter Survivor Gear Grid ID
 */
export async function removeVignetteEncounterSurvivorGearGrid(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_survivor_gear_grid')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Survivor Gear Grid: ${error.message}`
    )
}
