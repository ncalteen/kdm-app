import { createClient } from '@/lib/supabase/client'

/**
 * Get Weapon Type Shared Users
 *
 * Retrieves all users a weapon type is shared with.
 *
 * @param weaponTypeId Weapon Type ID
 * @returns Shared User IDs
 */
export async function getWeaponTypeSharedUsers(
  weaponTypeId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('weapon_type_shared_user')
    .select('shared_user_id')
    .eq('weapon_type_id', weaponTypeId)

  if (error)
    throw new Error(`Error Fetching Weapon Type Shared Users: ${error.message}`)

  return (data ?? []).map((row) => row.shared_user_id)
}

/**
 * Add Weapon Type Shared User
 *
 * Shares a weapon type with another user.
 *
 * @param weaponTypeId Weapon Type ID
 * @param sharedUserId Shared User ID
 * @param userId Owner User ID
 */
export async function addWeaponTypeSharedUser(
  weaponTypeId: string,
  sharedUserId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('weapon_type_shared_user').insert({
    weapon_type_id: weaponTypeId,
    shared_user_id: sharedUserId,
    user_id: userId
  })

  if (error)
    throw new Error(`Error Adding Weapon Type Shared User: ${error.message}`)
}

/**
 * Remove Weapon Type Shared User
 *
 * Revokes sharing of a weapon type with a user.
 *
 * @param weaponTypeId Weapon Type ID
 * @param sharedUserId Shared User ID
 */
export async function removeWeaponTypeSharedUser(
  weaponTypeId: string,
  sharedUserId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('weapon_type_shared_user')
    .delete()
    .eq('weapon_type_id', weaponTypeId)
    .eq('shared_user_id', sharedUserId)

  if (error)
    throw new Error(`Error Removing Weapon Type Shared User: ${error.message}`)
}
