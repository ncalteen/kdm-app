import { createClient } from '@/lib/supabase/client'
import { GearGridDetail, GearGridPosition } from '@/lib/types'

/**
 * Position to Column
 *
 * Maps a logical {@link GearGridPosition} to the physical `gear_grid` column
 * name that stores the gear ID for that slot.
 */
const POSITION_TO_COLUMN: { [key in GearGridPosition]: keyof GearGridDetail } =
  {
    top_left: 'pos_top_left',
    top_center: 'pos_top_center',
    top_right: 'pos_top_right',
    mid_left: 'pos_mid_left',
    mid_center: 'pos_mid_center',
    mid_right: 'pos_mid_right',
    bottom_left: 'pos_bottom_left',
    bottom_center: 'pos_bottom_center',
    bottom_right: 'pos_bottom_right'
  }

/**
 * Empty Gear Grid
 *
 * Returns an unsaved gear grid with every slot empty. Used as the default
 * representation for a survivor that has never been edited.
 *
 * @returns Empty Gear Grid
 */
export function emptyGearGrid(): GearGridDetail {
  return {
    id: null,
    pos_top_left: null,
    pos_top_center: null,
    pos_top_right: null,
    pos_mid_left: null,
    pos_mid_center: null,
    pos_mid_right: null,
    pos_bottom_left: null,
    pos_bottom_center: null,
    pos_bottom_right: null
  }
}

/**
 * Get Gear Grid
 *
 * Retrieves a survivor's persisted gear grid.
 *
 * @param survivorId Survivor ID
 * @returns Gear Grid (or null when no grid row exists)
 */
export async function getGearGrid(
  survivorId: string | null | undefined
): Promise<GearGridDetail | null> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear_grid')
    .select(
      'id, pos_top_left, pos_top_center, pos_top_right, pos_mid_left, pos_mid_center, pos_mid_right, pos_bottom_left, pos_bottom_center, pos_bottom_right'
    )
    .eq('survivor_id', survivorId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Gear Grid: ${error.message}`)

  return data ?? null
}

/**
 * Save Gear Grid
 *
 * Persists every slot of a survivor's gear grid in a single round-trip. Inserts
 * a new row when the survivor has no grid yet and updates the existing row
 * otherwise. The row is identified by `survivor_id` (which is unique per
 * survivor).
 *
 * @param survivorId Survivor ID
 * @param positions Position-Keyed Gear IDs (null clears the slot)
 * @returns Persisted Gear Grid
 */
export async function saveGearGrid(
  survivorId: string,
  positions: { [key in GearGridPosition]: string | null }
): Promise<GearGridDetail> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear_grid')
    .upsert(
      {
        survivor_id: survivorId,
        pos_top_left: positions.top_left,
        pos_top_center: positions.top_center,
        pos_top_right: positions.top_right,
        pos_mid_left: positions.mid_left,
        pos_mid_center: positions.mid_center,
        pos_mid_right: positions.mid_right,
        pos_bottom_left: positions.bottom_left,
        pos_bottom_center: positions.bottom_center,
        pos_bottom_right: positions.bottom_right
      },
      { onConflict: 'survivor_id' }
    )
    .select(
      'id, pos_top_left, pos_top_center, pos_top_right, pos_mid_left, pos_mid_center, pos_mid_right, pos_bottom_left, pos_bottom_center, pos_bottom_right'
    )
    .single()

  if (error) throw new Error(`Error Saving Gear Grid: ${error.message}`)

  return data
}

/**
 * Set Gear Grid Slot
 *
 * Convenience wrapper around {@link saveGearGrid} that mutates a single slot on
 * the grid. Existing slots are preserved as-is. The current grid (when one
 * exists) is supplied by the caller to avoid an extra round-trip.
 *
 * @param survivorId Survivor ID
 * @param current Current Gear Grid (or null if the survivor has no grid yet)
 * @param position Slot to Mutate
 * @param gearId Gear ID to Place (null clears the slot)
 * @returns Persisted Gear Grid
 */
export async function setGearGridSlot(
  survivorId: string,
  current: GearGridDetail | null,
  position: GearGridPosition,
  gearId: string | null
): Promise<GearGridDetail> {
  const baseline = current ?? emptyGearGrid()

  return saveGearGrid(survivorId, {
    top_left: baseline.pos_top_left,
    top_center: baseline.pos_top_center,
    top_right: baseline.pos_top_right,
    mid_left: baseline.pos_mid_left,
    mid_center: baseline.pos_mid_center,
    mid_right: baseline.pos_mid_right,
    bottom_left: baseline.pos_bottom_left,
    bottom_center: baseline.pos_bottom_center,
    bottom_right: baseline.pos_bottom_right,
    [position]: gearId
  } as { [key in GearGridPosition]: string | null })
}

/**
 * Clear Gear Grid
 *
 * Empties every slot on the survivor's gear grid. The row is preserved so
 * downstream consumers can keep relying on a stable grid ID.
 *
 * @param survivorId Survivor ID
 * @returns Persisted Gear Grid
 */
export async function clearGearGrid(
  survivorId: string
): Promise<GearGridDetail> {
  return saveGearGrid(survivorId, {
    top_left: null,
    top_center: null,
    top_right: null,
    mid_left: null,
    mid_center: null,
    mid_right: null,
    bottom_left: null,
    bottom_center: null,
    bottom_right: null
  })
}

/**
 * Apply Gear Grid Slot
 *
 * Pure helper that returns a copy of `current` with the given slot updated.
 * Intended for optimistic local-state updates that mirror what
 * {@link setGearGridSlot} writes to the database.
 *
 * @param current Current Gear Grid (or null if the survivor has no grid yet)
 * @param position Slot to Mutate
 * @param gearId Gear ID to Place (null clears the slot)
 * @returns New Gear Grid Detail
 */
export function applyGearGridSlot(
  current: GearGridDetail | null,
  position: GearGridPosition,
  gearId: string | null
): GearGridDetail {
  const baseline = current ?? emptyGearGrid()
  const column = POSITION_TO_COLUMN[position]

  return {
    ...baseline,
    [column]: gearId
  }
}
