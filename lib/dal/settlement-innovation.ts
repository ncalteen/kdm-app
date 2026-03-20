import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Innovations
 *
 * Retrieves the innovations associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Innovation Data
 */
export async function getSettlementInnovations(
  settlementId: string | null | undefined
): Promise<SettlementDetail['innovations']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_innovation')
    .select('id, innovation_id, innovation(innovation_name)')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Innovations: ${error.message}`)

  return (
    data?.map((item) => ({
      id: item.id,
      innovation_id: item.innovation_id,
      innovation_name: (
        item.innovation as unknown as { innovation_name: string }
      ).innovation_name
    })) ?? []
  )
}

/**
 * Add Settlement Innovations
 *
 * Adds innovations to a settlement by their IDs. This is used when adding
 * innovations to a settlement during settlement creation or editing.
 *
 * @param innovationIds Innovation IDs
 * @param settlementId Settlement ID
 */
export async function addSettlementInnovations(
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
    throw new Error(`Error Adding Settlement Innovations: ${error.message}`)
}

/**
 * Update Settlement Innovation
 *
 * Updates an existing settlement innovation record.
 *
 * @param id Settlement Innovation ID
 * @param settlementInnovation Settlement Innovation Data
 */
export async function updateSettlementInnovation(
  id: string,
  settlementInnovation: Omit<
    TablesUpdate<'settlement_innovation'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_innovation')
    .update(settlementInnovation)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Innovation: ${error.message}`)
}

/**
 * Remove Settlement Innovation
 *
 * Deletes a settlement innovation record from the database.
 *
 * @param id Settlement Innovation ID
 */
export async function removeSettlementInnovation(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_innovation')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Innovation: ${error.message}`)
}
