import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { CharacterDetail } from '@/lib/types'

/**
 * Get Characters
 *
 * Retrieves all characters available to the authenticated user:
 * - Built-in (non-custom) characters
 * - Custom characters owned by the user
 * - Custom characters shared with the user
 *
 * @returns Characters
 */
export async function getCharacters(): Promise<{
  [key: string]: CharacterDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  // Fetch all three categories of characters in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom characters (available to all users)
    supabase
      .from('character')
      .select('id, custom, character_name, rules')
      .eq('custom', false),
    // Custom characters created by the user
    supabase
      .from('character')
      .select('id, custom, character_name, rules')
      .eq('custom', true)
      .eq('user_id', userId),
    // Custom characters shared with the user
    supabase
      .from('character_shared_user')
      .select('character(id, custom, character_name, rules)')
      .eq('shared_user_id', userId)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Characters: ${result.error.message}`)

  // Collect characters from all sources, deduplicating by ID
  const characterMap: { [key: string]: CharacterDetail } = {}

  for (const c of nonCustomResult.data ?? []) characterMap[c.id] = c
  for (const c of userCustomResult.data ?? []) characterMap[c.id] = c
  for (const row of sharedResult.data ?? [])
    characterMap[row.character[0].id] = row.character[0]

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
