import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { KnowledgeDetail } from '@/lib/types'

/**
 * Get Knowledges
 *
 * Retrieves all knowledges available to the authenticated user:
 * - Built-in (non-custom) knowledges
 * - Custom knowledges owned by the user
 * - Custom knowledges shared with the user
 *
 * @returns Knowledges
 */
export async function getKnowledges(): Promise<{
  [key: string]: KnowledgeDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase
      .from('knowledge')
      .select('id, custom, knowledge_name, philosophy_id, rules, observation_conditions, observation_rank_up_milestone')
      .eq('custom', false),
    supabase
      .from('knowledge')
      .select('id, custom, knowledge_name, philosophy_id, rules, observation_conditions, observation_rank_up_milestone')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('knowledge_shared_user')
      .select('knowledge(id, custom, knowledge_name, philosophy_id, rules, observation_conditions, observation_rank_up_milestone)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Knowledges: ${result.error.message}`)

  const knowledgeMap: { [key: string]: KnowledgeDetail } = {}

  for (const k of nonCustomResult.data ?? []) knowledgeMap[k.id] = k
  for (const k of userCustomResult.data ?? []) knowledgeMap[k.id] = k
  for (const row of sharedResult.data ?? [])
    knowledgeMap[row.knowledge[0].id] = row.knowledge[0]

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
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (knowledge.custom && !user) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('knowledge')
    .insert({
      ...knowledge,
      ...(knowledge.custom ? { user_id: user!.id } : {})
    })
    .select('id, custom, knowledge_name, philosophy_id, rules, observation_conditions, observation_rank_up_milestone')
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
  const supabase = createClient()

  const { error } = await supabase.from('knowledge').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Knowledge: ${error.message}`)
}
