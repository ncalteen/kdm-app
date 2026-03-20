import { getHuntHuntBoard } from '@/lib/dal/hunt-hunt-board'
import { getHuntMonsters } from '@/lib/dal/hunt-monster'
import { getHuntSurvivors } from '@/lib/dal/hunt-survivor'
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
