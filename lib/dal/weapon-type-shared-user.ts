import { createClient } from '@/lib/supabase/client'

/**
 * Get Weapon Type Shared Users
 *
 * Retrieves all users a weapon type is shared with, including their usernames
 * from the user_settings table.
 *
 * @param weaponTypeId Weapon Type ID
 * @returns Shared User IDs and Usernames
 */
export async function getWeaponTypeSharedUsers(
  weaponTypeId: string
): Promise<{ shared_user_id: string; username: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('weapon_type_shared_user')
    .select('shared_user_id')
    .eq('weapon_type_id', weaponTypeId)

  if (error)
    throw new Error(`Error Fetching Weapon Type Shared Users: ${error.message}`)

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
 * Add Weapon Type Shared Users
 *
 * Shares a weapon type with other users.
 *
 * @param weaponTypeId Weapon Type ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addWeaponTypeSharedUsers(
  weaponTypeId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('weapon_type_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      weapon_type_id: weaponTypeId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Weapon Type Shared Users: ${error.message}`)
}

/**
 * Remove Weapon Type Shared Users
 *
 * Revokes sharing of a weapon type with users.
 *
 * @param weaponTypeId Weapon Type ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeWeaponTypeSharedUsers(
  weaponTypeId: string,
  sharedUserIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('weapon_type_shared_user')
    .delete()
    .eq('weapon_type_id', weaponTypeId)
    .in('shared_user_id', sharedUserIds)

  if (error)
    throw new Error(`Error Removing Weapon Type Shared Users: ${error.message}`)
}
