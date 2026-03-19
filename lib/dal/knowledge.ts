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
      .select('id, knowledge_name, philosophy_id')
      .eq('custom', false),
    supabase
      .from('knowledge')
      .select('id, knowledge_name, philosophy_id')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('knowledge_shared_user')
      .select('knowledge(id, knowledge_name, philosophy_id)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Knowledges: ${result.error.message}`)

  const knowledgeMap: { [key: string]: KnowledgeDetail } = {}

  for (const k of nonCustomResult.data ?? []) knowledgeMap[k.id] = k
  for (const k of userCustomResult.data ?? []) knowledgeMap[k.id] = k
  for (const row of sharedResult.data ?? []) {
    const k = row.knowledge as unknown as KnowledgeDetail | null

    if (k) knowledgeMap[k.id] = k
  }

  return knowledgeMap
}
