import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '../types'

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
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_location')
    .select('location_id, unlocked, location(location_name)')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Locations: ${error.message}`)

  return (
    data?.map((item) => ({
      id: item.location_id,
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
