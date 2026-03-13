import { createClient } from '@/lib/supabase/client'
import { HuntDetail } from '@/lib/types'

/**
 * Get Hunt
 *
 * @param huntId Hunt ID
 * @param settlementId Settlement ID
 * @returns Hunt Data
 */
export async function getHunt(
  huntId: string | null | undefined,
  settlementId: string | null | undefined
): Promise<HuntDetail | null> {
  if (!huntId || !settlementId)
    throw new Error('Required: Hunt ID, Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt')
    .select('*')
    .eq('id', huntId)
    .eq('settlement_id', settlementId)
    .single()

  if (error) throw new Error(`Error Fetching Hunt: ${error.message}`)

  return data ?? null
}
