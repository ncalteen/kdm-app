import { getShowdownMonsters } from '@/lib/dal/showdown-monster'
import { getShowdownSurvivors } from '@/lib/dal/showdown-survivor'
import { createClient } from '@/lib/supabase/client'
import { ShowdownDetail } from '@/lib/types'

/**
 * Get Showdown
 *
 * Gets the unique showdown for a specific settlement.
 *
 * @param settlementId Settlement ID
 * @returns Showdown Data
 */
export async function getShowdown(
  settlementId: string | null
): Promise<ShowdownDetail> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown')
    .select('id, ambush, monster_level, settlement_id, showdown_type, turn')
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Showdown: ${error.message}`)
  if (!data) throw new Error('Showdown Not Found')

  const [showdownMonsters, showdownSurvivors] = await Promise.all([
    getShowdownMonsters(data.id),
    getShowdownSurvivors(data.id)
  ])

  return {
    ...data,
    showdown_monsters: showdownMonsters,
    showdown_survivors: showdownSurvivors
  }
}
