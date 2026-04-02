import { createClient } from '@/lib/supabase/client'

/**
 * Get Knowledge Shared Users
 *
 * Retrieves all users a knowledge is shared with, including their usernames
 * from the user_settings table.
 *
 * @param knowledgeId Knowledge ID
 * @returns Shared User IDs and Usernames
 */
export async function getKnowledgeSharedUsers(
  knowledgeId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('knowledge_shared_user')
    .select('shared_user_id, user_settings!shared_user_id(username)')
    .eq('knowledge_id', knowledgeId)

  if (error)
    throw new Error(`Error Fetching Knowledge Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  return data.map((row) => ({
    shared_user_id: row.shared_user_id,
    username: (row.user_settings as unknown as { username: string })?.username
  }))
}

/**
 * Add Knowledge Shared Users
 *
 * Shares a knowledge with other users.
 *
 * @param knowledgeId Knowledge ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addKnowledgeSharedUsers(
  knowledgeId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('knowledge_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      knowledge_id: knowledgeId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Knowledge Shared Users: ${error.message}`)
}

/**
 * Remove Knowledge Shared Users
 *
 * Revokes sharing of a knowledge with users.
 *
 * @param knowledgeId Knowledge ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeKnowledgeSharedUsers(
  knowledgeId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('knowledge_shared_user')
    .delete()
    .eq('knowledge_id', knowledgeId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Knowledge Shared Users: ${error.message}`)
}
