import { GEAR_SELECT } from '@/lib/dal/gear'
import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { GearGridDetail } from '@/lib/types'

const GEAR_GRID_SELECT = `
  id,
  pos_top_left,
  pos_top_center,
  pos_top_right,
  pos_mid_left,
  pos_mid_center,
  pos_mid_right,
  pos_bottom_left,
  pos_bottom_center,
  pos_bottom_right,
  survivor_id,
  selected_armor_set_id,
  settlement_id,
  gear_top_left:gear!pos_top_left(${GEAR_SELECT}),
  gear_top_center:gear!pos_top_center(${GEAR_SELECT}),
  gear_top_right:gear!pos_top_right(${GEAR_SELECT}),
  gear_mid_left:gear!pos_mid_left(${GEAR_SELECT}),
  gear_mid_center:gear!pos_mid_center(${GEAR_SELECT}),
  gear_mid_right:gear!pos_mid_right(${GEAR_SELECT}),
  gear_bottom_left:gear!pos_bottom_left(${GEAR_SELECT}),
  gear_bottom_center:gear!pos_bottom_center(${GEAR_SELECT}),
  gear_bottom_right:gear!pos_bottom_right(${GEAR_SELECT})
`

/**
 * Get Gear Grid
 *
 * Retrieves a survivor's persisted gear grid.
 *
 * @param survivorId Survivor ID
 * @returns Gear Grid (or null)
 */
export async function getGearGrid(
  survivorId: string | null | undefined
): Promise<GearGridDetail | null> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear_grid')
    .select(GEAR_GRID_SELECT)
    .eq('survivor_id', survivorId)
    .maybeSingle<GearGridDetail>()

  if (error) throw new Error(`Error Fetching Gear Grid: ${error.message}`)

  return data
}

/**
 * Update Gear Grid
 *
 * Persists the provided slots of a survivor's gear grid in a single round-trip.
 * Inserts a new row when the survivor has no grid yet and updates the existing
 * row otherwise. The row is identified by `survivor_id` (which is unique per
 * survivor).
 *
 * Passing all positions preserves the existing "save entire grid" behavior.
 * Passing only a subset of positions allows single-slot edits without rewriting
 * unrelated columns.
 *
 * @param survivorId Survivor ID
 * @param gearGrid Partial Gear Grid Data
 * @returns Persisted Gear Grid
 */
export async function updateGearGrid(
  survivorId: string,
  gearGrid: Omit<
    TablesUpdate<'gear_grid'>,
    'id' | 'created_at' | 'updated_at' | 'survivor_id' | 'settlement_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'gear_grid'> = {
    ...gearGrid
  }

  delete updateData.survivor_id
  delete updateData.settlement_id

  const { error } = await supabase
    .from('gear_grid')
    .update(updateData)
    .eq('survivor_id', survivorId)

  if (error) throw new Error(`Error Saving Gear Grid: ${error.message}`)
}

/**
 * Remove Gear Grid
 *
 * Removes a survivor's gear grid.
 *
 * @param survivorId Survivor ID
 */
export async function removeGearGrid(survivorId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('gear_grid')
    .delete()
    .eq('survivor_id', survivorId)

  if (error) throw new Error(`Error Removing Gear Grid: ${error.message}`)
}
