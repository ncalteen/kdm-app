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
    .select('shared_user_id')
    .eq('knowledge_id', knowledgeId)

  if (error)
    throw new Error(`Error Fetching Knowledge Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('user_id, username')
    .in(
      'user_id',
      data.map((row) => row.shared_user_id)
    )

  if (settingsError)
    throw new Error(
      `Error Fetching Shared User Settings: ${settingsError.message}`
    )

  return settings.map((row) => ({
    shared_user_id: row.user_id,
    username: row.username
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
