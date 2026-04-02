import { createClient } from '@/lib/supabase/client'

/**
 * Get Gear Shared Users
 *
 * Retrieves all users a gear is shared with, including their usernames from
 * the user_settings table.
 *
 * @param gearId Gear ID
 * @returns Shared User IDs and Usernames
 */
export async function getGearSharedUsers(
  gearId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear_shared_user')
    .select('shared_user_id, user_settings!shared_user_id(username)')
    .eq('gear_id', gearId)

  if (error)
    throw new Error(`Error Fetching Gear Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  return data.map((row) => ({
    shared_user_id: row.shared_user_id,
    username: (row.user_settings as unknown as { username: string })?.username
  }))
}

/**
 * Add Gear Shared Users
 *
 * Shares a gear with other users.
 *
 * @param gearId Gear ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addGearSharedUsers(
  gearId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('gear_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      gear_id: gearId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error) throw new Error(`Error Adding Gear Shared Users: ${error.message}`)
}

/**
 * Remove Gear Shared Users
 *
 * Revokes sharing of a gear with users.
 *
 * @param gearId Gear ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeGearSharedUsers(
  gearId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('gear_shared_user')
    .delete()
    .eq('gear_id', gearId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Gear Shared Users: ${error.message}`)
}
