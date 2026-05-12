import { getSettlementMemberUsernames } from '@/lib/dal/settlement-shared-user'
import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Innovations
 *
 * Retrieves the innovations associated with a settlement. Uses a join to
 * resolve innovation names. Safely handles the Supabase join result shape.
 *
 * Each returned row carries `author_username` (null for built-ins; the
 * catalog author's username for customs) — see `getSettlementKnowledges`
 * for the canonical resolution pattern.
 *
 * @param settlementId Settlement ID
 * @param prefetchedMemberUsernames Optional pre-fetched map of IDs to usernames
 * @returns Settlement Innovation Data
 */
export async function getSettlementInnovations(
  settlementId: string | null | undefined,
  prefetchedMemberUsernames?: Promise<Map<string, string>>
): Promise<SettlementDetail['innovations']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const [{ data, error }, memberUsernames] = await Promise.all([
    supabase
      .from('settlement_innovation')
      .select(
        'id, innovation_id, innovation(custom, user_id, innovation_name, rules, consequences, benefits)'
      )
      .eq('settlement_id', settlementId),
    prefetchedMemberUsernames ?? getSettlementMemberUsernames(settlementId)
  ])

  if (error)
    throw new Error(`Error Fetching Settlement Innovations: ${error.message}`)

  return (
    data?.flatMap((item) => {
      // Supabase returns joined tables as objects or arrays depending on
      // the relationship. Safely handle both cases.
      const innovation = Array.isArray(item.innovation)
        ? item.innovation[0]
        : item.innovation

      // Skip rows whose embedded catalog row is invisible under RLS (see
      // EC-6 in local/sharing-architecture.md — transitive visibility gap).
      if (!innovation) return []

      return [
        {
          id: item.id,
          innovation_id: item.innovation_id,
          innovation_name: innovation.innovation_name ?? '',
          rules: innovation.rules ?? null,
          consequences: innovation.consequences ?? null,
          benefits: innovation.benefits ?? null,
          // Pulled directly from the junction so the UI can show the Custom
          // badge / open the rules sheet for custom rows authored by
          // collaborators that the owner can only see transitively via
          // settlement membership (EC-6 in local/sharing-architecture.md).
          // The catalog `availableInnovations` lookup filters by user_id and
          // would otherwise return undefined for those rows.
          custom: !!innovation.custom,
          author_username:
            innovation.custom && innovation.user_id
              ? (memberUsernames.get(innovation.user_id) ?? null)
              : null
        }
      ]
    }) ?? []
  )
}

/**
 * Add Settlement Innovations
 *
 * Adds innovations to a settlement by their IDs.
 *
 * @param innovationIds Innovation IDs
 * @param settlementId Settlement ID
 * @returns Inserted Settlement Innovation Records
 */
export async function addSettlementInnovations(
  innovationIds: string[],
  settlementId: string | null | undefined
): Promise<SettlementDetail['innovations']> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (innovationIds.length === 0) return []

  const supabase = createClient()

  const [{ data, error }, memberUsernames] = await Promise.all([
    supabase
      .from('settlement_innovation')
      .insert(
        innovationIds.map((innovationId) => ({
          innovation_id: innovationId,
          settlement_id: settlementId
        }))
      )
      .select(
        'id, innovation_id, innovation(custom, user_id, innovation_name, rules, consequences, benefits)'
      ),
    getSettlementMemberUsernames(settlementId)
  ])

  if (error)
    throw new Error(`Error Adding Settlement Innovations: ${error.message}`)

  return (
    data?.flatMap((item) => {
      const innovation = Array.isArray(item.innovation)
        ? item.innovation[0]
        : item.innovation

      if (!innovation) return []

      return [
        {
          id: item.id,
          innovation_id: item.innovation_id,
          innovation_name: innovation.innovation_name ?? '',
          rules: innovation.rules ?? null,
          consequences: innovation.consequences ?? null,
          benefits: innovation.benefits ?? null,
          custom: !!innovation.custom,
          author_username:
            innovation.custom && innovation.user_id
              ? (memberUsernames.get(innovation.user_id) ?? null)
              : null
        }
      ]
    }) ?? []
  )
}

/**
 * Update Settlement Innovation
 *
 * Updates an existing settlement innovation record.
 *
 * @param id Settlement Innovation ID
 * @param settlementInnovation Settlement Innovation Data
 */
export async function updateSettlementInnovation(
  id: string,
  settlementInnovation: Omit<
    TablesUpdate<'settlement_innovation'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_innovation')
    .update(settlementInnovation)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Innovation: ${error.message}`)
}

/**
 * Remove Settlement Innovation
 *
 * Deletes a settlement innovation record from the database.
 *
 * @param id Settlement Innovation ID
 */
export async function removeSettlementInnovation(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_innovation')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Innovation: ${error.message}`)
}
