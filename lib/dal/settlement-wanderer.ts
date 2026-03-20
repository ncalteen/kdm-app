import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Settlement Wanderers
 *
 * Retrieves all wanderers linked to a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Wanderers
 */
export async function getSettlementWanderers(
  settlementId: string | null | undefined
): Promise<
  Omit<
    Tables<'settlement_wanderer'>,
    'created_at' | 'updated_at' | 'settlement_id'
  >[]
> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_wanderer')
    .select('id, wanderer_id')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Wanderers: ${error.message}`)

  return data ?? []
}

/**
 * Add Settlement Wanderers
 *
 * Links existing wanderer IDs to a settlement by inserting records into the
 * settlement_wanderer join table.
 *
 * @param wandererIds Wanderer IDs
 * @param settlementId Settlement ID
 */
export async function addSettlementWanderers(
  wandererIds: string[],
  settlementId: string
): Promise<void> {
  if (wandererIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_wanderer').insert(
    wandererIds.map((wandererId) => ({
      wanderer_id: wandererId,
      settlement_id: settlementId
    }))
  )

  if (error)
    throw new Error(`Error Adding Wanderers to Settlement: ${error.message}`)
}
