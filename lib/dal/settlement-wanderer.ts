import { createClient } from '@/lib/supabase/client'

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
