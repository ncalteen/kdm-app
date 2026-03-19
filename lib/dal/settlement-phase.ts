import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementPhaseDetail } from '@/lib/types'

/**
 * Get Settlement Phase
 *
 * Gets the unique settlement phase for a given settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Phase Data
 */
export async function getSettlementPhase(
  settlementId: string | null | undefined
): Promise<SettlementPhaseDetail | null> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_phase')
    .select('id, endeavors, returning_scout_id, settlement_id, step')
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Settlement Phase: ${error.message}`)

  return data ?? null
}

/**
 * Update Settlement Phase
 *
 * @param settlementPhaseId Settlement Phase ID
 * @param updates Settlement Phase Updates
 */
export async function updateSettlementPhase(
  settlementPhaseId: string | null | undefined,
  updates: Partial<Tables<'settlement_phase'>>
): Promise<void> {
  if (!settlementPhaseId) throw new Error('Required: Settlement Phase ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement')
    .update(updates)
    .eq('id', settlementPhaseId)

  if (error)
    throw new Error(`Error Updating Settlement Phase: ${error.message}`)
}
