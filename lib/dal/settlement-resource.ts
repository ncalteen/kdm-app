import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Resources
 *
 * Retrieves the resources associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Resources Data
 */
export async function getSettlementResources(
  settlementId: string | null | undefined
): Promise<SettlementDetail['resources']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_resource')
    .select(
      'id, resource_id, quantity, resource(category, quarry_id, resource_name, resource_types)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Resources: ${error.message}`)

  return (
    data?.map((item) => ({
      category: (item.resource as unknown as { category: string }).category,
      id: item.id,
      quantity: item.quantity,
      quarry_id: (item.resource as unknown as { quarry_id: string | null })
        .quarry_id,
      resource_id: item.resource_id,
      resource_name: (item.resource as unknown as { resource_name: string })
        .resource_name,
      resource_types: (item.resource as unknown as { resource_types: string[] })
        .resource_types
    })) ?? []
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
 */
export async function addSettlementResources(
  resourceIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (resourceIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_resource').insert(
    resourceIds.map((resourceId) => ({
      resource_id: resourceId,
      settlement_id: settlementId,
      quantity: 0
    }))
  )

  if (error)
    throw new Error(`Error Adding Settlement Resources: ${error.message}`)
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
