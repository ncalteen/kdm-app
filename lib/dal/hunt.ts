import { getHuntHuntBoard } from '@/lib/dal/hunt-hunt-board'
import { getHuntMonsters } from '@/lib/dal/hunt-monster'
import { getHuntSurvivors } from '@/lib/dal/hunt-survivor'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { HuntDetail } from '@/lib/types'

/**
 * Get Hunt
 *
 * Gets the unique hunt for a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Hunt Data
 */
export async function getHunt(
  settlementId: string | null | undefined
): Promise<HuntDetail> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt')
    .select(
      'id, monster_level, monster_position, settlement_id, survivor_position'
    )
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Hunt: ${error.message}`)
  if (!data) throw new Error('Hunt Not Found')

  const [huntHuntBoard, huntMonsters, huntSurvivors] = await Promise.all([
    getHuntHuntBoard(data.id),
    getHuntMonsters(data.id),
    getHuntSurvivors(data.id)
  ])

  return {
    ...data,
    hunt_board: huntHuntBoard,
    hunt_monsters: huntMonsters,
    hunt_survivors: huntSurvivors
  }
}

/**
 * Add Hunt
 *
 * Adds a new hunt record to the database.
 *
 * @param hunt Hunt Data
 * @returns Inserted Hunt ID
 */
export async function addHunt(
  hunt: Omit<TablesInsert<'hunt'>, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt')
    .insert(hunt)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Hunt: ${error.message}`)

  return data.id
}

/**
 * Update Hunt
 *
 * Updates an existing hunt record in the database.
 *
 * @param id Hunt ID
 * @param hunt Hunt Data
 */
export async function updateHunt(
  id: string,
  hunt: Omit<TablesUpdate<'hunt'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('hunt').update(hunt).eq('id', id)

  if (error) throw new Error(`Error Updating Hunt: ${error.message}`)
}

/**
 * Remove Hunt
 *
 * Deletes a hunt record from the database.
 *
 * @param id Hunt ID
 */
export async function removeHunt(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('hunt').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Hunt: ${error.message}`)
}
