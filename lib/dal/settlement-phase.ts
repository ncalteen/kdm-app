import { createClient } from '@/lib/supabase/client'

/**
 * Get Endeavors
 *
 * @param settlementPhaseId Settlement ID
 * @returns Endeavors (or null)
 */
export async function getEndeavors(
  settlementPhaseId: string | null
): Promise<number | null> {
  if (!settlementPhaseId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_phase')
    .select('endeavors')
    .eq('id', settlementPhaseId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Endeavors: ${error.message}`)

  return data?.endeavors ?? null
}

/**
 * Update Endeavors
 *
 * @param settlementPhaseId Settlement Phase ID
 * @param endeavors New Endeavors value
 */
export async function updateEndeavors(
  settlementPhaseId: string | null,
  endeavors: number
): Promise<void> {
  if (!settlementPhaseId) return

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_phase')
    .update({ endeavors })
    .eq('id', settlementPhaseId)

  if (error) throw new Error(`Error Updating Endeavors: ${error.message}`)
}
