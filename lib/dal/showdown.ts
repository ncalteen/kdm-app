import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Showdown
 *
 * @param showdownId Showdown ID
 * @param settlementId Settlement ID
 * @returns Showdown Data
 */
export async function getShowdown(
  showdownId: string | null,
  settlementId: string | null
): Promise<Tables<'showdown'> | null> {
  if (!showdownId || !settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown')
    .select('*')
    .eq('id', showdownId)
    .eq('settlement_id', settlementId)
    .single()

  if (error) throw new Error(`Error Fetching Showdown: ${error.message}`)

  return data ?? null
}
