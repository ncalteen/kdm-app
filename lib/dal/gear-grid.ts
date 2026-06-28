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
  settlement_id
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
  gearGrid: Partial<GearGridDetail>
): Promise<GearGridDetail> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear_grid')
    .upsert(
      { ...gearGrid, survivor_id: survivorId },
      { onConflict: 'survivor_id' }
    )
    .select(GEAR_GRID_SELECT)
    .single<GearGridDetail>()

  if (error) throw new Error(`Error Saving Gear Grid: ${error.message}`)

  return data
}

/**
 * Set Selected Armor Set
 *
 * Persists the selected armor set for a survivor's gear grid.
 *
 * @param survivorId Survivor ID
 * @param armorSetId Armor Set ID or null to clear the selection
 * @returns Persisted Gear Grid
 */
export async function setSelectedArmorSet(
  survivorId: string,
  armorSetId: string | null
): Promise<GearGridDetail> {
  return updateGearGrid(survivorId, { selected_armor_set_id: armorSetId })
}
