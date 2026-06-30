import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { WeaponTypeDetail } from '@/lib/types'

export const WEAPON_TYPE_SELECT = `
  id,
  custom,
  weapon_type_name,
  specialist_proficiency_rules,
  master_proficiency_rules
`

/**
 * Get Weapon Types
 *
 * Retrieves all weapon types visible to the authenticated user. RLS
 * surfaces:
 *
 * - Built-in (non-custom) weapon types
 * - Custom weapon types owned by the user
 *
 * @returns Weapon Types by ID
 */
export async function getWeaponTypes(): Promise<{
  [key: string]: WeaponTypeDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('weapon_type')
    .select(WEAPON_TYPE_SELECT)

  if (error) throw new Error(`Error Fetching Weapon Types: ${error.message}`)

  const map: { [key: string]: WeaponTypeDetail } = {}
  for (const item of data) map[item.id] = item

  return map
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
    .select(WEAPON_TYPE_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error)
    throw new Error(`Error Fetching Custom Weapon Types: ${error.message}`)

  const map: { [key: string]: WeaponTypeDetail } = {}
  for (const item of data) map[item.id] = item

  return map
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
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<WeaponTypeDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'weapon_type'> = { ...weaponType }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('weapon_type')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(WEAPON_TYPE_SELECT)
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
 */
export async function updateWeaponType(
  id: string,
  weaponType: Omit<
    TablesUpdate<'weapon_type'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'weapon_type'> = { ...weaponType }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('weapon_type')
    .update(updateData)
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
  const supabase = createClient()

  const { error } = await supabase.from('weapon_type').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Weapon Type: ${error.message}`)
}
