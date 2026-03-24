import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Milestones
 *
 * Retrieves the milestones associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Milestone Data
 */
export async function getSettlementMilestones(
  settlementId: string | null | undefined
): Promise<SettlementDetail['milestones']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_milestone')
    .select('complete, id, milestone_id, milestone(event_name, milestone_name)')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Milestones: ${error.message}`)

  return (
    data?.map((item) => ({
      complete: item.complete,
      event_name: (item.milestone as unknown as { event_name: string })
        .event_name,
      id: item.id,
      milestone_id: item.milestone_id,
      milestone_name: (item.milestone as unknown as { milestone_name: string })
        .milestone_name
    })) ?? []
  )
}

/**
 * Add Settlement Milestones
 *
 * Adds milestones to a settlement by their IDs. This is used when adding
 * milestones to a settlement during settlement creation or editing.
 *
 * @param milestoneIds Milestone IDs
 * @param settlementId Settlement ID
 */
export async function addSettlementMilestones(
  milestoneIds: string[],
  settlementId: string | null | undefined
): Promise<{ id: string }[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (milestoneIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_milestone')
    .insert(
      milestoneIds.map((milestoneId) => ({
        complete: false,
        milestone_id: milestoneId,
        settlement_id: settlementId
      }))
    )
    .select('id')

  if (error)
    throw new Error(`Error Adding Settlement Milestones: ${error.message}`)

  return data
}

/**
 * Update Settlement Milestone
 *
 * Updates an existing settlement milestone record.
 *
 * @param id Settlement Milestone ID
 * @param settlementMilestone Settlement Milestone Data
 */
export async function updateSettlementMilestone(
  id: string,
  settlementMilestone: Omit<
    TablesUpdate<'settlement_milestone'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_milestone')
    .update(settlementMilestone)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Milestone: ${error.message}`)
}

/**
 * Remove Settlement Milestone
 *
 * Deletes a settlement milestone record from the database.
 *
 * @param id Settlement Milestone ID
 */
export async function removeSettlementMilestone(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_milestone')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Milestone: ${error.message}`)
}
