import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SecretFightingArtDetail } from '@/lib/types'

/**
 * Get Secret Fighting Arts
 *
 * Retrieves the secret fighting arts a user has access to. This includes:
 *
 * - Non-custom secret fighting arts
 * - Custom secret fighting arts created by the user
 * - Custom secret fighting arts shared with the user (via the
 *   secret_fighting_art_shared_user table)
 *
 * @returns Secret Fighting Art Data
 */
export async function getSecretFightingArts(): Promise<{
  [key: string]: SecretFightingArtDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  // Fetch all three categories of secret fighting arts in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom secret fighting arts (available to all users)
    supabase
      .from('secret_fighting_art')
      .select('id, custom, secret_fighting_art_name, rules')
      .eq('custom', false),
    // Custom secret fighting arts created by the user
    supabase
      .from('secret_fighting_art')
      .select('id, custom, secret_fighting_art_name, rules')
      .eq('custom', true)
      .eq('user_id', userId),
    // Custom secret fighting arts shared with the user
    supabase
      .from('secret_fighting_art_shared_user')
      .select(
        'secret_fighting_art(id, custom, secret_fighting_art_name, rules)'
      )
      .eq('shared_user_id', userId)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(
        `Error Fetching Secret Fighting Arts: ${result.error.message}`
      )

  // Collect secret fighting arts from all sources, deduplicating by ID
  const secretFightingArtMap: { [key: string]: SecretFightingArtDetail } = {}

  for (const s of nonCustomResult.data ?? []) secretFightingArtMap[s.id] = s
  for (const s of userCustomResult.data ?? []) secretFightingArtMap[s.id] = s
  for (const row of sharedResult.data ?? [])
    secretFightingArtMap[row.secret_fighting_art[0].id] =
      row.secret_fighting_art[0]

  return secretFightingArtMap
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
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<SecretFightingArtDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (secretFightingArt.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('secret_fighting_art')
    .insert({
      ...secretFightingArt,
      ...(secretFightingArt.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, secret_fighting_art_name, rules')
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
 * @returns Updated Secret Fighting Art
 */
export async function updateSecretFightingArt(
  id: string,
  secretFightingArt: Omit<
    TablesUpdate<'secret_fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('secret_fighting_art')
    .update(secretFightingArt)
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
