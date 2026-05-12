import { getSettlementMemberUsernames } from '@/lib/dal/settlement-shared-user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Gear
 *
 * Retrieves the gear associated with a settlement. Each returned row
 * carries `author_username` (null for built-ins; the catalog author's
 * username for customs) — see `getSettlementKnowledges` for the
 * canonical resolution pattern.
 *
 * @param settlementId Settlement ID
 * @param prefetchedMemberUsernames Optional pre-fetched map of IDs to usernames
 * @returns Settlement Gear Data
 */
export async function getSettlementGear(
  settlementId: string | null | undefined,
  prefetchedMemberUsernames?: Promise<Map<string, string>>
): Promise<SettlementDetail['gear']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const [{ data, error }, memberUsernames] = await Promise.all([
    supabase
      .from('settlement_gear')
      .select('gear_id, id, quantity, gear(gear_name, custom, user_id)')
      .eq('settlement_id', settlementId),
    prefetchedMemberUsernames ?? getSettlementMemberUsernames(settlementId)
  ])

  if (error) throw new Error(`Error Fetching Settlement Gear: ${error.message}`)

  // Skip rows whose embedded catalog row is invisible under RLS (see EC-6 in
  // local/sharing-architecture.md — transitive visibility gap).
  return (
    data?.flatMap((item) => {
      const rawGear = item.gear as unknown as
        | {
            gear_name: string
            custom: boolean
            user_id: string | null
          }
        | {
            gear_name: string
            custom: boolean
            user_id: string | null
          }[]
        | null
      const gear = Array.isArray(rawGear) ? (rawGear[0] ?? null) : rawGear

      if (!gear) return []

      return [
        {
          gear_id: item.gear_id,
          gear_name: gear.gear_name,
          id: item.id,
          quantity: item.quantity,
          custom: !!gear.custom,
          author_username:
            gear.custom && gear.user_id
              ? (memberUsernames.get(gear.user_id) ?? null)
              : null
        }
      ]
    }) ?? []
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

/**
 * Remove Settlement Gear
 *
 * Deletes a settlement gear record from the database.
 *
 * @param id Settlement Gear ID
 */
export async function removeSettlementGear(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('settlement_gear').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Settlement Gear: ${error.message}`)
}
