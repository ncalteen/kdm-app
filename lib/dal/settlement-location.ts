import { createClient } from '@/lib/supabase/client'

/**
 * Add Locations to Settlement
 *
 * Links existing location IDs to a settlement by inserting records into the
 * settlement_location join table.
 *
 * @param locationIds Location IDs
 * @param settlementId Settlement ID
 */
export async function addLocationsToSettlement(
  locationIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  if (locationIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_location').insert(
    locationIds.map((locationId) => ({
      location_id: locationId,
      settlement_id: settlementId
    }))
  )

  if (error)
    throw new Error(`Error Adding Locations to Settlement: ${error.message}`)
}
