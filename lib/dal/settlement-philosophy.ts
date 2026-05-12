import { getSettlementMemberUsernames } from '@/lib/dal/settlement-shared-user'
import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Philosophies
 *
 * Gets the settlement philosophies for a given settlement. Each returned
 * row carries `author_username` (null for built-ins; the catalog author's
 * username for customs) — see `getSettlementKnowledges` for the canonical
 * resolution pattern.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Philosophies
 */
export async function getSettlementPhilosophies(
  settlementId: string | null | undefined
): Promise<SettlementDetail['philosophies']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const [{ data, error }, memberUsernames] = await Promise.all([
    supabase
      .from('settlement_philosophy')
      .select(
        'id,  philosophy_id, philosophy(custom, user_id, philosophy_name, hunt_xp_milestones, tenet_knowledge_id, tier, neurosis_id)'
      )
      .eq('settlement_id', settlementId),
    getSettlementMemberUsernames(settlementId)
  ])

  if (error)
    throw new Error(`Error Fetching Settlement Philosophies: ${error.message}`)

  // Skip rows whose embedded catalog row is invisible under RLS (see EC-6 in
  // local/sharing-architecture.md — transitive visibility gap).
  return (
    data?.flatMap((item) => {
      const rawPhilosophy = item.philosophy as unknown as
        | {
            custom: boolean
            user_id: string | null
            philosophy_name: string
            hunt_xp_milestones: number[] | null
            tenet_knowledge_id: string | null
            tier: number | null
            neurosis_id: string | null
          }
        | {
            custom: boolean
            user_id: string | null
            philosophy_name: string
            hunt_xp_milestones: number[] | null
            tenet_knowledge_id: string | null
            tier: number | null
            neurosis_id: string | null
          }[]
        | null

      const philosophy = Array.isArray(rawPhilosophy)
        ? (rawPhilosophy[0] ?? null)
        : rawPhilosophy

      if (!philosophy) return []

      return [
        {
          id: item.id,
          philosophy_id: item.philosophy_id,
          philosophy_name: philosophy.philosophy_name,
          hunt_xp_milestones: philosophy.hunt_xp_milestones,
          tenet_knowledge_id: philosophy.tenet_knowledge_id,
          tier: philosophy.tier,
          neurosis_id: philosophy.neurosis_id,
          custom: philosophy.custom,
          author_username:
            philosophy.custom && philosophy.user_id
              ? (memberUsernames.get(philosophy.user_id) ?? null)
              : null
        }
      ]
    }) ?? []
  )
}

/**
 * Add Settlement Philosophies
 *
 * Adds philosophies to a settlement by their IDs. This is used when adding
 * philosophies to a settlement during settlement creation or editing.
 *
 * @param philosophyIds Philosophy IDs
 * @param settlementId Settlement ID
 * @returns Inserted Settlement Philosophy Rows
 */
export async function addSettlementPhilosophies(
  philosophyIds: string[],
  settlementId: string | null | undefined
): Promise<{ id: string }[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (philosophyIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_philosophy')
    .insert(
      philosophyIds.map((philosophyId) => ({
        philosophy_id: philosophyId,
        settlement_id: settlementId
      }))
    )
    .select('id')

  if (error)
    throw new Error(`Error Adding Settlement Philosophies: ${error.message}`)

  return data
}

/**
 * Update Settlement Philosophy
 *
 * Updates an existing settlement philosophy record.
 *
 * @param id Settlement Philosophy ID
 * @param settlementPhilosophy Settlement Philosophy Data
 */
export async function updateSettlementPhilosophy(
  id: string,
  settlementPhilosophy: Omit<
    TablesUpdate<'settlement_philosophy'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_philosophy')
    .update(settlementPhilosophy)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Philosophy: ${error.message}`)
}

/**
 * Remove Settlement Philosophy
 *
 * Deletes a settlement philosophy record from the database.
 *
 * @param id Settlement Philosophy ID
 */
export async function removeSettlementPhilosophy(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_philosophy')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Philosophy: ${error.message}`)
}
