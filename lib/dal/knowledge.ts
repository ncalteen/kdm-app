import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { KnowledgeDetail } from '@/lib/types'

export const KNOWLEDGE_SELECT = `
  id,
  custom,
  knowledge_name,
  philosophy_id,
  rules,
  observation_conditions,
  observation_rank_up_milestone
`

/**
 * Get Knowledges
 *
 * Retrieves all knowledges visible to the authenticated user. RLS surfaces:
 *
 * - Built-in (non-custom) knowledges
 * - Custom knowledges owned by the user
 * - Custom knowledges on settlements the user collaborates on (via the
 *   transitive SELECT policy on `knowledge`)
 *
 * @returns Knowledges by ID
 */
export async function getKnowledges(): Promise<{
  [key: string]: KnowledgeDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('knowledge')
    .select(KNOWLEDGE_SELECT)

  if (error) throw new Error(`Error Fetching Knowledges: ${error.message}`)

  const map: { [key: string]: KnowledgeDetail } = {}
  for (const item of data) map[item.id] = item

  return map
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
    .select(KNOWLEDGE_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error)
    throw new Error(`Error Fetching Custom Knowledges: ${error.message}`)

  const map: { [key: string]: KnowledgeDetail } = {}
  for (const item of data) map[item.id] = item

  return map
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
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<KnowledgeDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'knowledge'> = { ...knowledge }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('knowledge')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(KNOWLEDGE_SELECT)
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
 */
export async function updateKnowledge(
  id: string,
  knowledge: Omit<
    TablesUpdate<'knowledge'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'knowledge'> = { ...knowledge }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('knowledge')
    .update(updateData)
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
