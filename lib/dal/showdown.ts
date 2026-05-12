import { getShowdownMonsters } from '@/lib/dal/showdown-monster'
import { getShowdownSurvivors } from '@/lib/dal/showdown-survivor'
import { getSettlementMemberUsernames } from '@/lib/dal/settlement-shared-user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { ShowdownDetail } from '@/lib/types'

/**
 * Get Showdown
 *
 * Gets the unique showdown for a specific settlement.
 *
 * Starts the settlement member-username RPC once and shares the in-flight
 * promise with {@link getShowdownMonsters} so the trait / mood /
 * survivor-status `author_username` resolution does not issue a duplicate
 * RPC (E2.8; see `local/sharing-architecture.md` §7.4 / §10 Phase 2 item
 * 2.6).
 *
 * @param settlementId Settlement ID
 * @returns Showdown Data
 */
export async function getShowdown(
  settlementId: string | null
): Promise<ShowdownDetail | null> {
  if (!settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown')
    .select('id, ambush, monster_level, settlement_id, showdown_type, turn')
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Showdown: ${error.message}`)
  if (!data) return null

  // Start the member-username RPC once and share the in-flight promise with
  // the monster fetch (the only sub-query that materializes custom catalog
  // rows). The showdown-survivor fetch does not need it.
  const memberUsernamesPromise = getSettlementMemberUsernames(settlementId)

  const [showdownMonsters, showdownSurvivors] = await Promise.all([
    getShowdownMonsters(data.id, memberUsernamesPromise),
    getShowdownSurvivors(data.id)
  ])

  return {
    ...data,
    showdown_monsters: showdownMonsters,
    showdown_survivors: showdownSurvivors
  }
}

/**
 * Add Showdown
 *
 * Adds a new showdown record to the database.
 *
 * @param showdown Showdown Data
 * @returns Inserted Showdown ID
 */
export async function addShowdown(
  showdown: Omit<TablesInsert<'showdown'>, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown')
    .insert(showdown)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Showdown: ${error.message}`)

  return data.id
}

/**
 * Update Showdown
 *
 * Updates an existing showdown record in the database.
 *
 * @param id Showdown ID
 * @param showdown Showdown Data
 */
export async function updateShowdown(
  id: string,
  showdown: Omit<TablesUpdate<'showdown'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('showdown')
    .update(showdown)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Showdown: ${error.message}`)
}

/**
 * Remove Showdown
 *
 * Deletes a showdown record from the database.
 *
 * @param id Showdown ID
 */
export async function removeShowdown(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('showdown').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Showdown: ${error.message}`)
}
