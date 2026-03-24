import { createClient } from '@/lib/supabase/client'

/**
 * Get Resource Shared Users
 *
 * Retrieves all users a resource is shared with.
 *
 * @param resourceId Resource ID
 * @returns Shared User IDs
 */
export async function getResourceSharedUsers(
  resourceId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_shared_user')
    .select('shared_user_id')
    .eq('resource_id', resourceId)

  if (error)
    throw new Error(`Error Fetching Resource Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Resource Shared User
 *
 * Shares a resource with another user.
 *
 * @param resourceId Resource ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addResourceSharedUser(
  resourceId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('resource_shared_user').insert({
    resource_id: resourceId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Resource Shared User: ${error.message}`)
}

/**
 * Remove Resource Shared User
 *
 * Revokes sharing of a resource with a user.
 *
 * @param resourceId Resource ID
 * @param sharedUserId Shared User ID
 */
export async function removeResourceSharedUser(
  resourceId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('resource_shared_user')
    .delete()
    .eq('resource_id', resourceId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Resource Shared User: ${error.message}`)
}
