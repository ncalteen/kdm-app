import { createClient } from '@/lib/supabase/client'

/**
 * Get Knowledge Shared Users
 *
 * Retrieves all users a knowledge is shared with.
 *
 * @param knowledgeId Knowledge ID
 * @returns Shared User IDs
 */
export async function getKnowledgeSharedUsers(
  knowledgeId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('knowledge_shared_user')
    .select('shared_user_id')
    .eq('knowledge_id', knowledgeId)

  if (error)
    throw new Error(`Error Fetching Knowledge Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Knowledge Shared User
 *
 * Shares a knowledge with another user.
 *
 * @param knowledgeId Knowledge ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addKnowledgeSharedUser(
  knowledgeId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('knowledge_shared_user').insert({
    knowledge_id: knowledgeId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Knowledge Shared User: ${error.message}`)
}

/**
 * Remove Knowledge Shared User
 *
 * Revokes sharing of a knowledge with a user.
 *
 * @param knowledgeId Knowledge ID
 * @param sharedUserId Shared User ID
 */
export async function removeKnowledgeSharedUser(
  knowledgeId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('knowledge_shared_user')
    .delete()
    .eq('knowledge_id', knowledgeId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Knowledge Shared User: ${error.message}`)
}
