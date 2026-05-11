import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { CharacterDetail } from '@/lib/types'

/**
 * Get Characters
 *
 * Retrieves all characters visible to the authenticated user. RLS surfaces:
 * - Built-in (non-custom) characters
 * - Custom characters owned by the user
 *
 * @returns Characters
 */
export async function getCharacters(): Promise<{
  [key: string]: CharacterDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('character')
    .select('id, custom, character_name, rules')

  if (error) throw new Error(`Error Fetching Characters: ${error.message}`)

  const characterMap: { [key: string]: CharacterDetail } = {}
  for (const c of data ?? []) characterMap[c.id] = c

  return characterMap
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
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<CharacterDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (character.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('character')
    .insert({
      ...character,
      ...(character.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, character_name, rules')
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
 * @returns Updated Character
 */
export async function updateCharacter(
  id: string,
  character: Omit<TablesUpdate<'character'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('character')
    .update(character)
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
