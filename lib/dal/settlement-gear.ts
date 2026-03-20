import { TablesInsert, TablesUpdate } from '@/lib/database.types'
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
  if (!settlementId) throw new Error('Required: Settlement ID')

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

/**
 * Add Settlement Gear
 *
 * Adds a gear item to a settlement.
 *
 * @param settlementGear Settlement Gear Data
 * @returns Inserted Settlement Gear ID
 */
export async function addSettlementGear(
  settlementGear: Omit<
    TablesInsert<'settlement_gear'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_gear')
    .insert(settlementGear)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Settlement Gear: ${error.message}`)

  return data.id
}

/**
 * Update Settlement Gear
 *
 * Updates an existing settlement gear record.
 *
 * @param id Settlement Gear ID
 * @param settlementGear Settlement Gear Data
 */
export async function updateSettlementGear(
  id: string,
  settlementGear: Omit<
    TablesUpdate<'settlement_gear'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_gear')
    .update(settlementGear)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Settlement Gear: ${error.message}`)
}
