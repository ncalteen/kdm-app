import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteSurvivorGearGridDetail } from '@/lib/types'

const VIGNETTE_SURVIVOR_GEAR_GRID_SELECT = `
  id,
  vignette_survivor_id,
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
 * Get Vignette Survivor Gear Grids
 *
 * Retrieves all vignette survivor gear grid rows.
 *
 * @returns Vignette Survivor Gear Grids
 */
export async function getVignetteSurvivorGearGrids(): Promise<
  VignetteSurvivorGearGridDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor_gear_grid')
    .select(VIGNETTE_SURVIVOR_GEAR_GRID_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Survivor Gear Grids: ${error.message}`
    )

  return (data ?? []) as VignetteSurvivorGearGridDetail[]
}

/**
 * Get Vignette Survivor Gear Grid
 *
 * Retrieves a single vignette survivor gear grid row by ID.
 *
 * @param id Vignette Survivor Gear Grid ID
 * @returns Vignette Survivor Gear Grid or null
 */
export async function getVignetteSurvivorGearGrid(
  id: string | null | undefined
): Promise<VignetteSurvivorGearGridDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor_gear_grid')
    .select(VIGNETTE_SURVIVOR_GEAR_GRID_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Survivor Gear Grid: ${error.message}`
    )

  return data as VignetteSurvivorGearGridDetail | null
}

/**
 * Add Vignette Survivor Gear Grid
 *
 * Adds a new vignette survivor gear grid record to the database.
 *
 * @param vignetteSurvivorGearGrid Vignette Survivor Gear Grid Data
 * @returns Inserted Vignette Survivor Gear Grid
 */
export async function addVignetteSurvivorGearGrid(
  vignetteSurvivorGearGrid: Omit<
    TablesInsert<'vignette_survivor_gear_grid'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteSurvivorGearGridDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_survivor_gear_grid'> = {
    ...vignetteSurvivorGearGrid
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_survivor_gear_grid')
    .insert(insertData)
    .select(VIGNETTE_SURVIVOR_GEAR_GRID_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Survivor Gear Grid: ${error.message}`
    )

  return data as VignetteSurvivorGearGridDetail
}

/**
 * Update Vignette Survivor Gear Grid
 *
 * Updates an existing vignette survivor gear grid record.
 *
 * @param id Vignette Survivor Gear Grid ID
 * @param vignetteSurvivorGearGrid Vignette Survivor Gear Grid Data
 */
export async function updateVignetteSurvivorGearGrid(
  id: string,
  vignetteSurvivorGearGrid: Omit<
    TablesUpdate<'vignette_survivor_gear_grid'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_survivor_gear_grid'> = {
    ...vignetteSurvivorGearGrid
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_survivor_gear_grid')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Survivor Gear Grid: ${error.message}`
    )
}

/**
 * Remove Vignette Survivor Gear Grid
 *
 * Deletes a vignette survivor gear grid record from the database.
 *
 * @param id Vignette Survivor Gear Grid ID
 */
export async function removeVignetteSurvivorGearGrid(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_survivor_gear_grid')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Survivor Gear Grid: ${error.message}`
    )
}
