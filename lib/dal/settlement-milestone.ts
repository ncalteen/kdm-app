import { createClient } from '@/lib/supabase/client'

/**
 * Add Milestones to Settlement
 *
 * @param milestoneIds Milestone IDs
 * @param settlementId Settlement ID
 */
export async function addMilestonesToSettlement(
  milestoneIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  if (milestoneIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_milestone').insert(
    milestoneIds.map((milestoneId) => ({
      complete: false,
      milestone_id: milestoneId,
      settlement_id: settlementId
    }))
  )

  if (error)
    throw new Error(`Error Adding Milestones to Settlement: ${error.message}`)
}
