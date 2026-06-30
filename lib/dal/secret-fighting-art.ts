import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SecretFightingArtDetail } from '@/lib/types'

export const SECRET_FIGHTING_ART_SELECT = `
  id,
  custom,
  secret_fighting_art_name,
  rules
`

/**
 * Get Secret Fighting Arts
 *
 * Retrieves the secret fighting arts visible to the authenticated user. RLS
 * surfaces:
 *
 * - Non-custom secret fighting arts
 * - Custom secret fighting arts created by the user
 * - Custom secret fighting arts on settlements the user collaborates on
 *   (via the transitive SELECT policy on `secret_fighting_art`)
 *
 * @returns Secret Fighting Art Data
 */
export async function getSecretFightingArts(): Promise<{
  [key: string]: SecretFightingArtDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('secret_fighting_art')
    .select(SECRET_FIGHTING_ART_SELECT)

  if (error)
    throw new Error(`Error Fetching Secret Fighting Arts: ${error.message}`)

  const map: { [key: string]: SecretFightingArtDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Get User Custom Secret Fighting Arts
 *
 * Retrieves only custom secret fighting arts authored by the current user.
 * Used by the user-content library so collaborator-authored customs visible
 * via the transitive SELECT policy don't pollute the caller's personal
 * catalog.
 *
 * @returns Custom Secret Fighting Art Data Map
 */
export async function getUserCustomSecretFightingArts(): Promise<{
  [key: string]: SecretFightingArtDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('secret_fighting_art')
    .select(SECRET_FIGHTING_ART_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error)
    throw new Error(
      `Error Fetching Custom Secret Fighting Arts: ${error.message}`
    )

  const map: { [key: string]: SecretFightingArtDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Add Secret Fighting Art
 *
 * Adds a new secret fighting art record to the database.
 *
 * @param secretFightingArt Secret Fighting Art Data
 * @returns Inserted Secret Fighting Art
 */
export async function addSecretFightingArt(
  secretFightingArt: Omit<
    TablesInsert<'secret_fighting_art'>,
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<SecretFightingArtDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'secret_fighting_art'> = {
    ...secretFightingArt
  }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('secret_fighting_art')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(SECRET_FIGHTING_ART_SELECT)
    .single()

  if (error)
    throw new Error(`Error Adding Secret Fighting Art: ${error.message}`)

  return data
}

/**
 * Update Secret Fighting Art
 *
 * Updates an existing secret fighting art record in the database.
 *
 * @param id Secret Fighting Art ID
 * @param secretFightingArt Secret Fighting Art Data
 */
export async function updateSecretFightingArt(
  id: string,
  secretFightingArt: Omit<
    TablesUpdate<'secret_fighting_art'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'secret_fighting_art'> = {
    ...secretFightingArt
  }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('secret_fighting_art')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Secret Fighting Art: ${error.message}`)
}

/**
 * Remove Secret Fighting Art
 *
 * Deletes a secret fighting art record from the database.
 *
 * @param id Secret Fighting Art ID
 */
export async function removeSecretFightingArt(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('secret_fighting_art')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Secret Fighting Art: ${error.message}`)
}
