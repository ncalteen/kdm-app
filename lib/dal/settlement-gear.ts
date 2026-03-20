import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Gear
 *
 * Retrieves the gear associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Gear Data
 */
export async function getSettlementGear(
  settlementId: string | null | undefined
): Promise<SettlementDetail['gear']> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_gear')
    .select('gear_id, id, quantity, gear(gear_name)')
    .eq('settlement_id', settlementId)

  if (error) throw new Error(`Error Fetching Settlement Gear: ${error.message}`)

  return (
    data?.map((item) => ({
      gear_id: item.gear_id,
      gear_name: (item.gear as unknown as { gear_name: string }).gear_name,
      id: item.id,
      quantity: item.quantity
    })) ?? []
  )
}
