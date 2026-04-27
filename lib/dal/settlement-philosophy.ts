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
    .select(
      'id,  philosophy_id, philosophy(custom, philosophy_name, hunt_xp_milestones, tenet_knowledge_id, tier, neurosis_id)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Philosophies: ${error.message}`)

  return (
    data?.map((item) => {
      const philosophy = item.philosophy as unknown as {
        custom: boolean
        philosophy_name: string
        hunt_xp_milestones: number[] | null
        tenet_knowledge_id: string | null
        tier: number | null
        neurosis_id: string | null
      }

      return {
        id: item.id,
        philosophy_id: item.philosophy_id,
        philosophy_name: philosophy.philosophy_name,
        hunt_xp_milestones: philosophy.hunt_xp_milestones,
        tenet_knowledge_id: philosophy.tenet_knowledge_id,
        tier: philosophy.tier,
        neurosis_id: philosophy.neurosis_id,
        custom: philosophy.custom
      }
    }) ?? []
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
 * @returns Inserted Settlement Philosophy Rows
 */
export async function addSettlementPhilosophies(
  philosophyIds: string[],
  settlementId: string | null | undefined
): Promise<{ id: string }[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (philosophyIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_philosophy')
    .insert(
      philosophyIds.map((philosophyId) => ({
        philosophy_id: philosophyId,
        settlement_id: settlementId
      }))
    )
    .select('id')

  if (error)
    throw new Error(`Error Adding Settlement Philosophies: ${error.message}`)

  return data
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
