import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementPhaseDetail } from '@/lib/types'

/**
 * Get Settlement Phase
 *
 * @param settlementPhaseId Settlement Phase ID
 * @param settlementId Settlement ID
 * @returns Settlement Phase Data
 */
export async function getSettlementPhase(
  settlementPhaseId: string | null | undefined,
  settlementId: string | null | undefined
): Promise<SettlementPhaseDetail | null> {
  if (!settlementPhaseId || !settlementId)
    throw new Error('Required: Settlement Phase ID, Settlement ID')

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
