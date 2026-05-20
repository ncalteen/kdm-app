import { removeCatalogRow } from '@/lib/dal/catalog-archive'
import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { KnowledgeDetail } from '@/lib/types'

/**
 * Get Knowledges
 *
 * Retrieves all knowledges visible to the authenticated user. RLS surfaces:
 * - Built-in (non-custom) knowledges
 * - Custom knowledges owned by the user
 * - Custom knowledges on settlements the user collaborates on (via the
 *   transitive SELECT policy on `knowledge`)
 *
 * @returns Knowledges
 */
export async function getKnowledges(): Promise<{
  [key: string]: KnowledgeDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('knowledge')
    .select(
      'id, custom, knowledge_name, philosophy_id, rules, observation_conditions, observation_rank_up_milestone'
    )

  if (error) throw new Error(`Error Fetching Knowledges: ${error.message}`)

  const knowledgeMap: { [key: string]: KnowledgeDetail } = {}
  for (const k of data ?? []) knowledgeMap[k.id] = k

  return knowledgeMap
}

/**
 * Get User Custom Knowledges
 *
 * Retrieves only custom knowledges authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Knowledge Data Map
 */
export async function getUserCustomKnowledges(): Promise<{
  [key: string]: KnowledgeDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('knowledge')
    .select(
      'id, custom, knowledge_name, philosophy_id, rules, observation_conditions, observation_rank_up_milestone, archived_at'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Knowledges: ${error.message}`)

  const knowledgeMap: { [key: string]: KnowledgeDetail } = {}
  for (const k of data ?? []) if (!k.archived_at) knowledgeMap[k.id] = k

  return knowledgeMap
}

/**
 * Add Knowledge
 *
 * Adds a new knowledge record to the database.
 *
 * @param knowledge Knowledge Data
 * @returns Inserted Knowledge
 */
export async function addKnowledge(
  knowledge: Omit<
    TablesInsert<'knowledge'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<KnowledgeDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (knowledge.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('knowledge')
    .insert({
      ...knowledge,
      ...(knowledge.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, custom, knowledge_name, philosophy_id, rules, observation_conditions, observation_rank_up_milestone'
    )
    .single()

  if (error) throw new Error(`Error Adding Knowledge: ${error.message}`)

  return data
}

/**
 * Update Knowledge
 *
 * Updates an existing knowledge record in the database.
 *
 * @param id Knowledge ID
 * @param knowledge Knowledge Data
 * @returns Updated Knowledge
 */
export async function updateKnowledge(
  id: string,
  knowledge: Omit<TablesUpdate<'knowledge'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('knowledge')
    .update(knowledge)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Knowledge: ${error.message}`)
}

/**
 * Remove Knowledge
 *
 * Deletes a knowledge record from the database.
 *
 * @param id Knowledge ID
 */
export async function removeKnowledge(id: string): Promise<void> {
  await removeCatalogRow('knowledge', id, 'Knowledge')
}
