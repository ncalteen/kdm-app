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
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Fetch all three categories of secret fighting arts in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom secret fighting arts (available to all users)
    supabase
      .from('secret_fighting_art')
      .select('id, secret_fighting_art_name')
      .eq('custom', false),
    // Custom secret fighting arts created by the user
    supabase
      .from('secret_fighting_art')
      .select('id, secret_fighting_art_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    // Custom secret fighting arts shared with the user
    supabase
      .from('secret_fighting_art_shared_user')
      .select('secret_fighting_art(id, secret_fighting_art_name)')
      .eq('shared_user_id', user.id)
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
