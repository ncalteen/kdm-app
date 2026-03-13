import { createClient } from '@/lib/supabase/client'

/**
 * Add Innovations to Settlement
 *
 * @param innovationIds Innovation IDs
 * @param settlementId Settlement ID
 */
export async function addInnovationsToSettlement(
  innovationIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  if (innovationIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_innovation').insert(
    innovationIds.map((innovationId) => ({
      innovation_id: innovationId,
      settlement_id: settlementId
    }))
  )

  if (error)
    throw new Error(`Error Adding Innovations to Settlement: ${error.message}`)
}
