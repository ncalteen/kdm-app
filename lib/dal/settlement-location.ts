import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Locations
 *
 * Retrieves the locations associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Location Data
 */
export async function getSettlementLocations(
  settlementId: string | null | undefined
): Promise<SettlementDetail['locations']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_location')
    .select('id, location_id, unlocked, location(location_name)')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Locations: ${error.message}`)

  return (
    data?.map((item) => ({
      id: item.id,
      location_id: item.location_id,
      location_name: (item.location as unknown as { location_name: string })
        .location_name,
      unlocked: item.unlocked
    })) ?? []
  )
}

/**
 * Add Settlement Locations
 *
 * Adds locations to a settlement by their IDs. This is used when adding
 * locations to a settlement during settlement creation or editing.
 *
 * @param locationIds Location IDs
 * @param settlementId Settlement ID
 */
export async function addSettlementLocations(
  locationIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (locationIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_location').insert(
    locationIds.map((locationId) => ({
      location_id: locationId,
      settlement_id: settlementId,
      unlocked: false
    }))
  )

  if (error)
    throw new Error(`Error Adding Settlement Locations: ${error.message}`)
}

/**
 * Update Settlement Location
 *
 * Updates an existing settlement location record.
 *
 * @param id Settlement Location ID
 * @param settlementLocation Settlement Location Data
 */
export async function updateSettlementLocation(
  id: string,
  settlementLocation: Omit<
    TablesUpdate<'settlement_location'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_location')
    .update(settlementLocation)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Location: ${error.message}`)
}
