import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Knowledges
 *
 * Retrieves the knowledges associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Knowledge Data
 */
export async function getSettlementKnowledges(
  settlementId: string | null | undefined
): Promise<SettlementDetail['knowledges']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_knowledge')
    .select('id, knowledge_id, knowledge(knowledge_name)')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Knowledges: ${error.message}`)

  return (
    data?.map((item) => ({
      id: item.id,
      knowledge_id: item.knowledge_id,
      knowledge_name: (item.knowledge as unknown as { knowledge_name: string })
        .knowledge_name
    })) ?? []
  )
}

/**
 * Add Settlement Knowledges
 *
 * Adds knowledges to a settlement by their IDs. This is used when adding
 * knowledges to a settlement during settlement creation or editing.
 *
 * @param knowledgeIds Knowledge IDs
 * @param settlementId Settlement ID
 */
export async function addSettlementKnowledges(
  knowledgeIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (knowledgeIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_knowledge').insert(
    knowledgeIds.map((knowledgeId) => ({
      knowledge_id: knowledgeId,
      settlement_id: settlementId
    }))
  )

  if (error)
    throw new Error(`Error Adding Settlement Knowledges: ${error.message}`)
}

/**
 * Update Settlement Knowledge
 *
 * Updates an existing settlement knowledge record.
 *
 * @param id Settlement Knowledge ID
 * @param settlementKnowledge Settlement Knowledge Data
 */
export async function updateSettlementKnowledge(
  id: string,
  settlementKnowledge: Omit<
    TablesUpdate<'settlement_knowledge'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_knowledge')
    .update(settlementKnowledge)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Knowledge: ${error.message}`)
}

/**
 * Remove Settlement Knowledge
 *
 * Deletes a settlement knowledge record from the database.
 *
 * @param id Settlement Knowledge ID
 */
export async function removeSettlementKnowledge(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_knowledge')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Knowledge: ${error.message}`)
}
