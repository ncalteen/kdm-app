import {
  getSettlementMemberUsernames,
  resolveSettlementAuthorship,
  type SettlementMemberProfile
} from '@/lib/dal/settlement-shared-user'
import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Resources
 *
 * Retrieves the resources associated with a settlement. Each returned row
 * carries `author_username` (null for built-ins; the catalog author's
 * username for customs) — see `getSettlementKnowledges` for the canonical
 * resolution pattern.
 *
 * @param settlementId Settlement ID
 * @param prefetchedMemberProfiles Optional pre-fetched map of IDs to usernames
 * @returns Settlement Resources Data
 */
export async function getSettlementResources(
  settlementId: string | null | undefined,
  prefetchedMemberProfiles?: Promise<Map<string, SettlementMemberProfile>>
): Promise<SettlementDetail['resources']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const [{ data, error }, memberProfiles] = await Promise.all([
    supabase
      .from('settlement_resource')
      .select(
        'id, resource_id, quantity, resource(custom, user_id, category, quarry_id, resource_name, resource_types, quarry(monster_name, node))'
      )
      .eq('settlement_id', settlementId),
    prefetchedMemberProfiles ?? getSettlementMemberUsernames(settlementId)
  ])

  if (error)
    throw new Error(`Error Fetching Settlement Resources: ${error.message}`)

  // Skip rows whose embedded catalog row is invisible under RLS (see EC-6 in
  // local/sharing-architecture.md — transitive visibility gap).
  return (
    data?.flatMap((item) => {
      const resource = item.resource as unknown as
        | {
            custom: boolean
            user_id: string | null
            category: string
            quarry_id: string | null
            resource_name: string
            resource_types: string[]
            quarry: { monster_name: string; node: string } | null
          }
        | {
            custom: boolean
            user_id: string | null
            category: string
            quarry_id: string | null
            resource_name: string
            resource_types: string[]
            quarry: { monster_name: string; node: string } | null
          }[]
        | null
      const res = Array.isArray(resource) ? (resource[0] ?? null) : resource

      if (!res) return []

      return [
        {
          category: res.category,
          id: item.id,
          quantity: item.quantity,
          quarry_id: res.quarry_id,
          quarry_monster_name: res.quarry?.monster_name ?? null,
          quarry_node: res.quarry?.node ?? null,
          resource_id: item.resource_id,
          resource_name: res.resource_name,
          resource_types: res.resource_types,
          custom: res.custom,
          ...resolveSettlementAuthorship(
            { custom: res.custom, user_id: res.user_id },
            memberProfiles
          )
        }
      ]
    }) ?? []
  )
}

/**
 * Add Settlement Resources
 *
 * Adds resources to a settlement by their IDs. This is used when adding
 * resources to a settlement during settlement creation or editing.
 *
 * @param resourceIds Resource IDs
 * @param settlementId Settlement ID
 * @returns Inserted Settlement Resource Rows
 */
export async function addSettlementResources(
  resourceIds: string[],
  settlementId: string | null | undefined
): Promise<{ id: string }[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (resourceIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_resource')
    .insert(
      resourceIds.map((resourceId) => ({
        resource_id: resourceId,
        settlement_id: settlementId,
        quantity: 0
      }))
    )
    .select('id')

  if (error)
    throw new Error(`Error Adding Settlement Resources: ${error.message}`)

  return data
}

/**
 * Update Settlement Resource
 *
 * Updates an existing settlement resource record.
 *
 * @param id Settlement Resource ID
 * @param settlementResource Settlement Resource Data
 */
export async function updateSettlementResource(
  id: string,
  settlementResource: Omit<
    TablesUpdate<'settlement_resource'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_resource')
    .update(settlementResource)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Resource: ${error.message}`)
}

/**
 * Remove Settlement Resource
 *
 * Deletes a settlement resource record from the database.
 *
 * @param id Settlement Resource ID
 */
export async function removeSettlementResource(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_resource')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Resource: ${error.message}`)
}
