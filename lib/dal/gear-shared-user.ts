import { createClient } from '@/lib/supabase/client'

/**
 * Get Gear Shared Users
 *
 * Retrieves all users a gear is shared with.
 *
 * @param gearId Gear ID
 * @returns Shared User IDs
 */
export async function getGearSharedUsers(gearId: string): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gear_shared_user')
    .select('shared_user_id')
    .eq('gear_id', gearId)

  if (error)
    throw new Error(`Error Fetching Gear Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Gear Shared User
 *
 * Shares a gear with another user.
 *
 * @param gearId Gear ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addGearSharedUser(
  gearId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('gear_shared_user').insert({
    gear_id: gearId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error) throw new Error(`Error Adding Gear Shared User: ${error.message}`)
}

/**
 * Remove Gear Shared User
 *
 * Revokes sharing of a gear with a user.
 *
 * @param gearId Gear ID
 * @param sharedUserId Shared User ID
 */
export async function removeGearSharedUser(
  gearId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('gear_shared_user')
    .delete()
    .eq('gear_id', gearId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Gear Shared User: ${error.message}`)
}
