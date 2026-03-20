import { Tables, TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Quarry Hunt Board
 *
 * Retrieves the hunt board for a quarry.
 *
 * @param quarryId Quarry ID
 * @returns Quarry Hunt Board
 */
export async function getQuarryHuntBoard(
  quarryId: string | null | undefined
): Promise<Omit<
  Tables<'quarry_hunt_board'>,
  'created_at' | 'updated_at'
> | null> {
  if (!quarryId) throw new Error('Required: Quarry ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_hunt_board')
    .select(
      'id, quarry_id, pos_1, pos_2, pos_3, pos_4, pos_5, pos_7, pos_8, pos_9, pos_10, pos_11'
    )
    .eq('quarry_id', quarryId)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Quarry Hunt Board: ${error.message}`)

  return data
}

/**
 * Add Quarry Hunt Board
 *
 * Adds a hunt board to a quarry.
 *
 * @param quarryHuntBoard Quarry Hunt Board Data
 * @returns Inserted Quarry Hunt Board ID
 */
export async function addQuarryHuntBoard(
  quarryHuntBoard: Omit<
    TablesInsert<'quarry_hunt_board'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_hunt_board')
    .insert(quarryHuntBoard)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Quarry Hunt Board: ${error.message}`)

  return data.id
}
