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
): Promise<HuntHuntBoardDetail | null> {
  if (!huntId) throw new Error('Required: Hunt ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_hunt_board')
    .select(
      'id, hunt_id, pos_1, pos_2, pos_3, pos_4, pos_5, pos_7, pos_8, pos_9, pos_10, pos_11, settlement_id'
    )
    .eq('hunt_id', huntId)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Hunt Board: ${error.message}`)

  return data ?? null
}
