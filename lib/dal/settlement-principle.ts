import { createClient } from '@/lib/supabase/client'

/**
 * Add Principles to Settlement
 *
 * @param principleIds Principle IDs
 * @param settlementId Settlement ID
 */
export async function addPrinciplesToSettlement(
  principleIds: string[],
  settlementId: string
): Promise<void> {
  if (principleIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_principle').insert(
    principleIds.map((principleId) => ({
      option_1_selected: false,
      option_2_selected: false,
      principle_id: principleId,
      settlement_id: settlementId
    }))
  )

  if (error)
    throw new Error(`Error Adding Principles to Settlement: ${error.message}`)
}
