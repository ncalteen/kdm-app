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
): Promise<HuntDetail | null> {
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

  return data ?? null
}
