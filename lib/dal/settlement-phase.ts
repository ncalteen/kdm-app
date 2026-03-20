import { Tables, TablesInsert } from '@/lib/database.types'
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
): Promise<SettlementPhaseDetail> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_phase')
    .select('id, endeavors, returning_scout_id, settlement_id, step')
    .eq('settlement_id', settlementId)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Settlement Phase: ${error.message}`)
  if (!data) throw new Error('Settlement Phase Not Found')

  const { data: returningData, error: returningError } = await supabase
    .from('settlement_phase_returning_survivor')
    .select('survivor_id')
    .eq('settlement_phase_id', data.id)

  if (returningError)
    throw new Error(
      `Error Fetching Returning Survivors: ${returningError.message}`
    )

  return {
    ...data,
    returning_survivor_ids: (returningData ?? []).map((r) => r.survivor_id)
  }
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

/**
 * Add Settlement Phase
 *
 * Adds a new settlement phase record to the database.
 *
 * @param settlementPhase Settlement Phase Data
 * @returns Inserted Settlement Phase ID
 */
export async function addSettlementPhase(
  settlementPhase: Omit<
    TablesInsert<'settlement_phase'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_phase')
    .insert(settlementPhase)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Settlement Phase: ${error.message}`)

  return data.id
}

/**
 * Remove Settlement Phase
 *
 * Deletes a settlement phase record from the database.
 *
 * @param id Settlement Phase ID
 */
export async function removeSettlementPhase(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_phase')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Phase: ${error.message}`)
}
