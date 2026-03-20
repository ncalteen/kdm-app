import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Philosophies
 *
 * Gets the settlement philosophies for a given settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Philosophies
 */
export async function getSettlementPhilosophies(
  settlementId: string | null | undefined
): Promise<SettlementDetail['philosophies']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_philosophy')
    .select('id,  philosophy_id, philosophy(philosophy_name)')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Philosophies: ${error.message}`)

  return (
    data?.map((item) => ({
      id: item.id,
      philosophy_id: item.philosophy_id,
      philosophy_name: (
        item.philosophy as unknown as {
          philosophy_name: string
        }
      ).philosophy_name
    })) ?? []
  )
}

/**
 * Add Settlement Philosophies
 *
 * Adds philosophies to a settlement by their IDs. This is used when adding
 * philosophies to a settlement during settlement creation or editing.
 *
 * @param philosophyIds Philosophy IDs
 * @param settlementId Settlement ID
 */
export async function addSettlementPhilosophies(
  philosophyIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (philosophyIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_philosophy').insert(
    philosophyIds.map((philosophyId) => ({
      philosophy_id: philosophyId,
      settlement_id: settlementId
    }))
  )

  if (error)
    throw new Error(`Error Adding Settlement Philosophies: ${error.message}`)
}

/**
 * Update Settlement Philosophy
 *
 * Updates an existing settlement philosophy record.
 *
 * @param id Settlement Philosophy ID
 * @param settlementPhilosophy Settlement Philosophy Data
 */
export async function updateSettlementPhilosophy(
  id: string,
  settlementPhilosophy: Omit<
    TablesUpdate<'settlement_philosophy'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_philosophy')
    .update(settlementPhilosophy)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Philosophy: ${error.message}`)
}

/**
 * Remove Settlement Philosophy
 *
 * Deletes a settlement philosophy record from the database.
 *
 * @param id Settlement Philosophy ID
 */
export async function removeSettlementPhilosophy(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_philosophy')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Philosophy: ${error.message}`)
}
