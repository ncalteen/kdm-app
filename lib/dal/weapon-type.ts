import { removeCatalogRow } from '@/lib/dal/catalog-archive'
import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { WeaponTypeDetail } from '@/lib/types'

/**
 * Get Weapon Types
 *
 * Retrieves all weapon types visible to the authenticated user. RLS
 * surfaces:
 *
 * - Built-in (non-custom) weapon types
 * - Custom weapon types owned by the user
 *
 * @returns Weapon Types
 */
export async function getWeaponTypes(): Promise<{
  [key: string]: WeaponTypeDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('weapon_type')
    .select(
      'id, custom, weapon_type_name, specialist_proficiency_rules, master_proficiency_rules'
    )

  if (error) throw new Error(`Error Fetching Weapon Types: ${error.message}`)

  const weaponTypeMap: { [key: string]: WeaponTypeDetail } = {}
  for (const w of data ?? []) weaponTypeMap[w.id] = w

  return weaponTypeMap
}

/**
 * Get User Custom Weapon Types
 *
 * Retrieves only custom weapon types authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Weapon Type Data Map
 */
export async function getUserCustomWeaponTypes(): Promise<{
  [key: string]: WeaponTypeDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('weapon_type')
    .select(
      'id, custom, weapon_type_name, specialist_proficiency_rules, master_proficiency_rules, archived_at'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Weapon Types: ${error.message}`)

  const weaponTypeMap: { [key: string]: WeaponTypeDetail } = {}
  for (const w of data ?? []) if (!w.archived_at) weaponTypeMap[w.id] = w

  return weaponTypeMap
}

/**
 * Add Weapon Type
 *
 * Adds a new weapon type record to the database.
 *
 * @param weaponType Weapon Type Data
 * @returns Inserted Weapon Type
 */
export async function addWeaponType(
  weaponType: Omit<
    TablesInsert<'weapon_type'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<WeaponTypeDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (weaponType.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('weapon_type')
    .insert({
      ...weaponType,
      ...(weaponType.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, custom, weapon_type_name, specialist_proficiency_rules, master_proficiency_rules'
    )
    .single()

  if (error) throw new Error(`Error Adding Weapon Type: ${error.message}`)

  return data
}

/**
 * Update Weapon Type
 *
 * Updates an existing weapon type record in the database.
 *
 * @param id Weapon Type ID
 * @param weaponType Weapon Type Data
 * @returns Updated Weapon Type
 */
export async function updateWeaponType(
  id: string,
  weaponType: Omit<
    TablesUpdate<'weapon_type'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('weapon_type')
    .update(weaponType)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Weapon Type: ${error.message}`)
}

/**
 * Remove Weapon Type
 *
 * Deletes a weapon type record from the database.
 *
 * @param id Weapon Type ID
 */
export async function removeWeaponType(id: string): Promise<void> {
  await removeCatalogRow('weapon_type', id, 'Weapon Type')
}
