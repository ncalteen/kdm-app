import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { CharacterDetail } from '@/lib/types'

export const CHARACTER_SELECT = `
  id,
  custom,
  character_name,
  rules
`

/**
 * Get Characters
 *
 * Retrieves all characters visible to the authenticated user. RLS surfaces:
 *
 * - Built-in (non-custom) characters
 * - Custom characters owned by the user
 *
 * @returns Characters by ID
 */
export async function getCharacters(): Promise<{
  [key: string]: CharacterDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('character')
    .select(CHARACTER_SELECT)

  if (error) throw new Error(`Error Fetching Characters: ${error.message}`)

  const map: { [key: string]: CharacterDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Get User Custom Characters
 *
 * Retrieves only custom characters authored by the current user. Used by the
 * user-content library so archived customs don't pollute the caller's personal
 * catalog.
 *
 * @returns Custom Character Data Map
 */
export async function getUserCustomCharacters(): Promise<{
  [key: string]: CharacterDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('character')
    .select(CHARACTER_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error)
    throw new Error(`Error Fetching Custom Characters: ${error.message}`)

  const map: { [key: string]: CharacterDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Add Character
 *
 * Adds a new character record to the database.
 *
 * @param character Character Data
 * @returns Inserted Character
 */
export async function addCharacter(
  character: Omit<
    TablesInsert<'character'>,
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<CharacterDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'character'> = { ...character }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('character')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(CHARACTER_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Character: ${error.message}`)

  return data
}

/**
 * Update Character
 *
 * Updates an existing character record in the database.
 *
 * @param id Character ID
 * @param character Character Data
 */
export async function updateCharacter(
  id: string,
  character: Omit<
    TablesUpdate<'character'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'character'> = { ...character }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('character')
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Character: ${error.message}`)
}

/**
 * Remove Character
 *
 * Deletes a character record from the database.
 *
 * @param id Character ID
 */
export async function removeCharacter(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('character').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Character: ${error.message}`)
}
