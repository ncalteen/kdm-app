import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { QuarryHuntBoardPositionDetail } from '@/lib/types'

/**
 * Get Quarry Hunt Board Positions
 *
 * Retrieves all level-based hunt board positions for a quarry.
 *
 * @param quarryId Quarry ID
 * @returns Quarry Hunt Board Positions
 */
export async function getQuarryHuntBoardPositions(
  quarryId: string | null | undefined
): Promise<QuarryHuntBoardPositionDetail[]> {
  if (!quarryId) throw new Error('Required: Quarry ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_hunt_board_position')
    .select('id, quarry_id, level_number, monster_hunt_pos, survivor_hunt_pos')
    .eq('quarry_id', quarryId)

  if (error)
    throw new Error(
      `Error Fetching Quarry Hunt Board Positions: ${error.message}`
    )

  return data ?? []
}

/**
 * Upsert Quarry Hunt Board Position
 *
 * Creates or updates the hunt board positions for a quarry level.
 *
 * @param quarryHuntBoardPosition Quarry Hunt Board Position Data
 */
export async function upsertQuarryHuntBoardPosition(
  quarryHuntBoardPosition: Omit<
    TablesInsert<'quarry_hunt_board_position'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_hunt_board_position')
    .upsert(quarryHuntBoardPosition, {
      onConflict: 'quarry_id,level_number'
    })

  if (error)
    throw new Error(
      `Error Upserting Quarry Hunt Board Position: ${error.message}`
    )
}

/**
 * Update Quarry Hunt Board Position
 *
 * Updates an existing quarry hunt board position record.
 *
 * @param id Quarry Hunt Board Position ID
 * @param quarryHuntBoardPosition Quarry Hunt Board Position Data
 */
export async function updateQuarryHuntBoardPosition(
  id: string,
  quarryHuntBoardPosition: Omit<
    TablesUpdate<'quarry_hunt_board_position'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_hunt_board_position')
    .update(quarryHuntBoardPosition)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Quarry Hunt Board Position: ${error.message}`
    )
}

/**
 * Remove Quarry Hunt Board Position
 *
 * Deletes a quarry hunt board position record.
 *
 * @param id Quarry Hunt Board Position ID
 */
export async function removeQuarryHuntBoardPosition(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_hunt_board_position')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Quarry Hunt Board Position: ${error.message}`
    )
}
