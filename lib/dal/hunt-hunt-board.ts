import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { HuntHuntBoardDetail } from '@/lib/types'

/**
 * Get Hunt Hunt Board
 *
 * Retrieves the hunt board for a specific hunt.
 *
 * @param huntId Hunt ID
 * @returns Hunt Board Data
 */
export async function getHuntHuntBoard(
  huntId: string | null | undefined
): Promise<HuntHuntBoardDetail> {
  if (!huntId) throw new Error('Required: Hunt ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_hunt_board')
    .select(
      'id, hunt_id, pos_1, pos_2, pos_3, pos_4, pos_5, pos_7, pos_8, pos_9, pos_10, pos_11, settlement_id'
    )
    .eq('hunt_id', huntId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Hunt Board: ${error.message}`)
  if (!data) throw new Error('Hunt Board Not Found')

  return data
}

/**
 * Add Hunt Hunt Board
 *
 * Adds a new hunt board to a hunt.
 *
 * @param huntHuntBoard Hunt Board Data
 * @returns Inserted Hunt Board
 */
export async function addHuntHuntBoard(
  huntHuntBoard: Omit<
    TablesInsert<'hunt_hunt_board'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<HuntHuntBoardDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_hunt_board')
    .insert(huntHuntBoard)
    .select(
      'id, hunt_id, pos_1, pos_2, pos_3, pos_4, pos_5, pos_7, pos_8, pos_9, pos_10, pos_11, settlement_id'
    )
    .single()

  if (error) throw new Error(`Error Adding Hunt Board: ${error.message}`)

  return data
}

/**
 * Update Hunt Hunt Board
 *
 * Updates an existing hunt board record.
 *
 * @param id Hunt Board ID
 * @param huntHuntBoard Hunt Board Data
 * @returns Updated Hunt Board
 */
export async function updateHuntHuntBoard(
  id: string,
  huntHuntBoard: Omit<
    TablesUpdate<'hunt_hunt_board'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('hunt_hunt_board')
    .update(huntHuntBoard)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Hunt Board: ${error.message}`)
}

/**
 * Remove Hunt Hunt Board
 *
 * Deletes a hunt board record from the database.
 *
 * @param id Hunt Board ID
 */
export async function removeHuntHuntBoard(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('hunt_hunt_board').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Hunt Board: ${error.message}`)
}
