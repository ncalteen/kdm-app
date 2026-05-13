import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { FightingArtDetail } from '@/lib/types'

/**
 * Get Fighting Arts
 *
 * Retrieves all fighting arts visible to the authenticated user. RLS
 * surfaces:
 * - Built-in (non-custom) fighting arts
 * - Custom fighting arts owned by the user
 * - Custom fighting arts on settlements the user collaborates on (via the
 *   transitive SELECT policy on `fighting_art`)
 *
 * @returns Fighting Arts
 */
export async function getFightingArts(): Promise<{
  [key: string]: FightingArtDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('fighting_art')
    .select('id, custom, fighting_art_name, rules')

  if (error) throw new Error(`Error Fetching Fighting Arts: ${error.message}`)

  const fightingArtMap: { [key: string]: FightingArtDetail } = {}
  for (const f of data ?? []) fightingArtMap[f.id] = f

  return fightingArtMap
}

/**
 * Get User Custom Fighting Arts
 *
 * Retrieves only custom fighting arts authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Fighting Art Data Map
 */
export async function getUserCustomFightingArts(): Promise<{
  [key: string]: FightingArtDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('fighting_art')
    .select('id, custom, fighting_art_name, rules')
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Fighting Arts: ${error.message}`)

  const fightingArtMap: { [key: string]: FightingArtDetail } = {}
  for (const f of data ?? []) fightingArtMap[f.id] = f

  return fightingArtMap
}

/**
 * Add Fighting Art
 *
 * Adds a new fighting art record to the database.
 *
 * @param fightingArt Fighting Art Data
 * @returns Inserted Fighting Art
 */
export async function addFightingArt(
  fightingArt: Omit<
    TablesInsert<'fighting_art'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<FightingArtDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (fightingArt.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('fighting_art')
    .insert({
      ...fightingArt,
      ...(fightingArt.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, fighting_art_name, rules')
    .single()

  if (error) throw new Error(`Error Adding Fighting Art: ${error.message}`)

  return data
}

/**
 * Update Fighting Art
 *
 * Updates an existing fighting art record in the database.
 *
 * @param id Fighting Art ID
 * @param fightingArt Fighting Art Data
 * @returns Updated Fighting Art
 */
export async function updateFightingArt(
  id: string,
  fightingArt: Omit<
    TablesUpdate<'fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('fighting_art')
    .update(fightingArt)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Fighting Art: ${error.message}`)
}

/**
 * Remove Fighting Art
 *
 * Deletes a fighting art record from the database.
 *
 * @param id Fighting Art ID
 */
export async function removeFightingArt(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('fighting_art').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Fighting Art: ${error.message}`)
}

/**
 * Get Custom Fighting Arts
 *
 * Gets only the custom fighting arts that the user has created.
 *
 * @returns Custom Fighting Arts
 */
export async function getCustomFightingArts(): Promise<{
  [key: string]: FightingArtDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('fighting_art')
    .select('id, custom, fighting_art_name, rules')
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Fighting Arts: ${error.message}`)

  const fightingArtMap: { [key: string]: FightingArtDetail } = {}
  for (const f of data ?? []) fightingArtMap[f.id] = f

  return fightingArtMap
}
