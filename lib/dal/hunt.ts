import { getHuntHuntBoard } from '@/lib/dal/hunt-hunt-board'
import { getHuntMonsters } from '@/lib/dal/hunt-monster'
import { getHuntSurvivors } from '@/lib/dal/hunt-survivor'
import { getSettlementMemberUsernames } from '@/lib/dal/settlement-shared-user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { HuntDetail } from '@/lib/types'

/**
 * Get Hunt
 *
 * Gets the unique hunt for a settlement.
 *
 * Starts the settlement member-username RPC once and shares the in-flight
 * promise with {@link getHuntMonsters} so the trait / mood / survivor-status
 * `author_username` resolution does not issue a duplicate RPC (E2.8; see
 * `docs/sharing-architecture.md` §7.4 / §10 Phase 2 item 2.6).
 *
 * @param settlementId Settlement ID
 * @returns Hunt Data
 */
export async function getHunt(
  settlementId: string | null | undefined
): Promise<HuntDetail | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt')
    .select(
      'id, monster_level, monster_position, settlement_id, survivor_position'
    )
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Hunt: ${error.message}`)
  if (!data) return null

  // Start the member-username RPC once and share the in-flight promise with
  // the monster fetch (the only sub-query that materializes custom catalog
  // rows). The board and hunt-survivor fetches don't need it.
  const memberProfilesPromise = getSettlementMemberUsernames(settlementId)

  const [huntHuntBoard, huntMonsters, huntSurvivors] = await Promise.all([
    getHuntHuntBoard(data.id),
    getHuntMonsters(data.id, memberProfilesPromise),
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
