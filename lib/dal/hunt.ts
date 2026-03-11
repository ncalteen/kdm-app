import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Hunt
 *
 * @param huntId Hunt ID
 * @param settlementId Settlement ID
 * @returns Hunt Data
 */
export async function getHunt(
  huntId: string,
  settlementId: string
): Promise<Tables<'hunt'> | null> {
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
