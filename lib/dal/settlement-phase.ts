import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Settlement Phase
 *
 * @param settlementPhaseId Settlement Phase ID
 * @param settlementId Settlement ID
 * @returns Settlement Phase Data
 */
export async function getSettlementPhase(
  settlementPhaseId: string | null,
  settlementId: string | null
): Promise<Tables<'settlement_phase'> | null> {
  if (!settlementPhaseId || !settlementId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_phase')
    .select('*')
    .eq('id', settlementPhaseId)
    .eq('settlement_id', settlementId)
    .single()

  if (error)
    throw new Error(`Error Fetching Settlement Phase: ${error.message}`)

  return data ?? null
}

/**
 * Get Endeavors
 *
 * @param settlementPhaseId Settlement ID
 * @returns Endeavors (or null)
 */
export async function getEndeavors(
  settlementPhaseId: string | null | undefined
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
  settlementPhaseId: string | null | undefined,
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
