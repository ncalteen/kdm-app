import {
  getSettlementMemberUsernames,
  resolveSettlementAuthorship,
  type SettlementMemberProfile
} from '@/lib/dal/settlement-shared-user'
import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Locations
 *
 * Retrieves the locations associated with a settlement. Each returned row
 * carries `author_username` (null for built-ins; the catalog author's
 * username for customs) — see `getSettlementKnowledges` for the canonical
 * resolution pattern.
 *
 * @param settlementId Settlement ID
 * @param prefetchedMemberProfiles Optional pre-fetched map of IDs to usernames
 * @returns Settlement Location Data
 */
export async function getSettlementLocations(
  settlementId: string | null | undefined,
  prefetchedMemberProfiles?: Promise<Map<string, SettlementMemberProfile>>
): Promise<SettlementDetail['locations']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const [{ data, error }, memberProfiles] = await Promise.all([
    supabase
      .from('settlement_location')
      .select(
        'id, location_id, unlocked, location(custom, user_id, location_name, rules)'
      )
      .eq('settlement_id', settlementId),
    prefetchedMemberProfiles ?? getSettlementMemberUsernames(settlementId)
  ])

  if (error)
    throw new Error(`Error Fetching Settlement Locations: ${error.message}`)

  // Skip rows whose embedded catalog row is invisible under RLS (see EC-6 in
  // local/sharing-architecture.md — transitive visibility gap).
  return (
    data?.flatMap((item) => {
      const rawLocation = item.location as unknown
      const location = (
        Array.isArray(rawLocation) ? (rawLocation[0] ?? null) : rawLocation
      ) as {
        custom: boolean
        user_id: string | null
        location_name: string
        rules: string | null
      } | null

      if (!location) return []

      return [
        {
          id: item.id,
          location_id: item.location_id,
          location_name: location.location_name,
          rules: location.rules,
          unlocked: item.unlocked,
          custom: location.custom,
          ...resolveSettlementAuthorship(
            { custom: location.custom, user_id: location.user_id },
            memberProfiles
          )
        }
      ]
    }) ?? []
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
 * @returns Inserted Settlement Location Rows
 */
export async function addSettlementLocations(
  locationIds: string[],
  settlementId: string | null | undefined
): Promise<
  {
    id: string
    location_id: string
    location_name: string
    rules: string | null
    custom: boolean
  }[]
> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (locationIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_location')
    .insert(
      locationIds.map((locationId) => ({
        location_id: locationId,
        settlement_id: settlementId,
        unlocked: false
      }))
    )
    .select('id, location(id, custom, location_name, rules)')

  if (error)
    throw new Error(`Error Adding Settlement Locations: ${error.message}`)

  return (
    data as unknown as {
      id: string
      location: {
        id: string
        custom: boolean
        location_name: string
        rules: string | null
      }
    }[]
  ).map((item) => ({
    id: item.id,
    location_id: item.location.id,
    location_name: item.location.location_name,
    rules: item.location.rules,
    custom: item.location.custom
  }))
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

/**
 * Remove Settlement Location
 *
 * Deletes a settlement location record from the database.
 *
 * @param id Settlement Location ID
 */
export async function removeSettlementLocation(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_location')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Location: ${error.message}`)
}
