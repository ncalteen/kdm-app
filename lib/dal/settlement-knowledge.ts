import {
  getSettlementMemberUsernames,
  resolveSettlementAuthorship,
  type SettlementMemberProfile
} from '@/lib/dal/settlement-shared-user'
import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Knowledges
 *
 * Retrieves the knowledges associated with a settlement.
 *
 * Each returned row carries `author_username` — `null` for built-in
 * (non-custom) knowledges, and the catalog author's username for custom
 * knowledges so the UI can render the "By @username" chip on custom
 * cards (E2.8; see `local/sharing-architecture.md` §7.4 / §10 Phase 2
 * item 2.6).
 *
 * **Author username resolution (canonical pattern; mirrored by sibling
 * `settlement_*` DALs).** The catalog row's `user_id` cannot be
 * resolved through a direct PostgREST embed of `user_settings` because
 * RLS on `user_settings` restricts SELECT to the row owner; the JOIN
 * is therefore performed against a `Map<user_id, username>` produced
 * by the `get_settlement_member_usernames` SECURITY DEFINER RPC (via
 * {@link getSettlementMemberUsernames}). The map covers every user
 * connected to the settlement — owner plus collaborators — so any
 * custom row attached to the settlement resolves to its author's
 * username, while rows authored by users who are no longer connected
 * resolve to `null`. The catalog row's `user_id` itself is readable
 * via the existing transitive settlement-membership SELECT policy
 * (20260512000000_catalog_visibility_via_settlement.sql).
 * username for the catalog row's `user_id` (custom rows) or `null` (built-ins).
 *
 * **Performance** When called from {@link getSettlement} (which loads
 * every settlement-attached collection in parallel), the caller should
 * start the member-username RPC alongside the collection queries and
 * pass the resulting **promise** via `prefetchedMemberProfiles`. Each
 * collection DAL awaits the same shared promise inside its own
 * `Promise.all`, so all ~13 collection queries and the single RPC run
 * concurrently. When called standalone the second argument can be
 * omitted; the DAL transparently issues its own RPC.
 *
 * @param settlementId Settlement ID
 * @param prefetchedMemberProfiles Optional in-flight (or resolved)
 *   member-username map. When provided, the DAL skips its own
 *   `get_settlement_member_usernames` RPC and awaits this promise
 *   alongside its main query.
 * @returns Settlement Knowledge Data
 */
export async function getSettlementKnowledges(
  settlementId: string | null | undefined,
  prefetchedMemberProfiles?: Promise<Map<string, SettlementMemberProfile>>
): Promise<SettlementDetail['knowledges']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const [{ data, error }, memberProfiles] = await Promise.all([
    supabase
      .from('settlement_knowledge')
      .select(
        'id, knowledge_id, knowledge(custom, user_id, knowledge_name, philosophy_id, rules, observation_conditions, observation_rank_up_milestone)'
      )
      .eq('settlement_id', settlementId),
    prefetchedMemberProfiles ?? getSettlementMemberUsernames(settlementId)
  ])

  if (error)
    throw new Error(`Error Fetching Settlement Knowledges: ${error.message}`)

  // PostgREST returns the embedded catalog row as `null` when the caller can't
  // read it under RLS (e.g., a settlement owner viewing a collaborator's
  // custom knowledge before transitive visibility lands; see EC-6 in the
  // sharing architecture doc). Skip those junction rows so the page renders
  // instead of crashing on a null deref. The unshare-blockers dialog (E1.8)
  // surfaces the hidden attachments when the owner tries to revoke access.
  return (
    data?.flatMap((item) => {
      const rawKnowledge = item.knowledge as unknown as
        | {
            custom: boolean
            user_id: string | null
            knowledge_name: string
            philosophy_id: string | null
            rules: string | null
            observation_conditions: string | null
            observation_rank_up_milestone: number | null
          }
        | {
            custom: boolean
            user_id: string | null
            knowledge_name: string
            philosophy_id: string | null
            rules: string | null
            observation_conditions: string | null
            observation_rank_up_milestone: number | null
          }[]
        | null

      const knowledge = Array.isArray(rawKnowledge)
        ? (rawKnowledge[0] ?? null)
        : rawKnowledge

      if (!knowledge) return []

      return [
        {
          id: item.id,
          knowledge_id: item.knowledge_id,
          knowledge_name: knowledge.knowledge_name,
          philosophy_id: knowledge.philosophy_id,
          rules: knowledge.rules,
          observation_conditions: knowledge.observation_conditions,
          observation_rank_up_milestone:
            knowledge.observation_rank_up_milestone,
          custom: knowledge.custom,
          ...resolveSettlementAuthorship(
            { custom: knowledge.custom, user_id: knowledge.user_id },
            memberProfiles
          )
        }
      ]
    }) ?? []
  )
}

/**
 * Add Settlement Knowledges
 *
 * Adds knowledges to a settlement by their IDs. This is used when adding
 * knowledges to a settlement during settlement creation or editing.
 *
 * @param knowledgeIds Knowledge IDs
 * @param settlementId Settlement ID
 * @returns Inserted Settlement Knowledge Rows
 */
export async function addSettlementKnowledges(
  knowledgeIds: string[],
  settlementId: string | null | undefined
): Promise<{ id: string }[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (knowledgeIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_knowledge')
    .insert(
      knowledgeIds.map((knowledgeId) => ({
        knowledge_id: knowledgeId,
        settlement_id: settlementId
      }))
    )
    .select('id')

  if (error)
    throw new Error(`Error Adding Settlement Knowledges: ${error.message}`)

  return data
}

/**
 * Update Settlement Knowledge
 *
 * Updates an existing settlement knowledge record.
 *
 * @param id Settlement Knowledge ID
 * @param settlementKnowledge Settlement Knowledge Data
 */
export async function updateSettlementKnowledge(
  id: string,
  settlementKnowledge: Omit<
    TablesUpdate<'settlement_knowledge'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_knowledge')
    .update(settlementKnowledge)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Settlement Knowledge: ${error.message}`)
}

/**
 * Remove Settlement Knowledge
 *
 * Deletes a settlement knowledge record from the database.
 *
 * @param id Settlement Knowledge ID
 */
export async function removeSettlementKnowledge(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_knowledge')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Settlement Knowledge: ${error.message}`)
}
