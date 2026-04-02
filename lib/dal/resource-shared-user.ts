import { createClient } from '@/lib/supabase/client'

/**
 * Get Resource Shared Users
 *
 * Retrieves all users a resource is shared with, including their usernames
 * from the user_settings table.
 *
 * @param resourceId Resource ID
 * @returns Shared User IDs and Usernames
 */
export async function getResourceSharedUsers(
  resourceId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_shared_user')
    .select('shared_user_id')
    .eq('resource_id', resourceId)

  if (error)
    throw new Error(`Error Fetching Resource Shared Users: ${error.message}`)

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
 * Add Resource Shared Users
 *
 * Shares a resource with other users.
 *
 * @param resourceId Resource ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addResourceSharedUsers(
  resourceId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('resource_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      resource_id: resourceId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Resource Shared Users: ${error.message}`)
}

/**
 * Remove Resource Shared Users
 *
 * Revokes sharing of a resource with users.
 *
 * @param resourceId Resource ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeResourceSharedUsers(
  resourceId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('resource_shared_user')
    .delete()
    .eq('resource_id', resourceId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Resource Shared Users: ${error.message}`)
}
