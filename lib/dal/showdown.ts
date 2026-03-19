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
): Promise<ShowdownDetail | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown')
    .select(
      'id, ambush, monster_level, settlement_id, showdown_type, turn'
    )
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Showdown: ${error.message}`)

  return data ?? null
}
