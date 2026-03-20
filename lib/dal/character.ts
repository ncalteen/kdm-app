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
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Fetch all three categories of characters in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom characters (available to all users)
    supabase.from('character').select('id, character_name').eq('custom', false),
    // Custom characters created by the user
    supabase
      .from('character')
      .select('id, character_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    // Custom characters shared with the user
    supabase
      .from('character_shared_user')
      .select('character(id, character_name)')
      .eq('shared_user_id', user.id)
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
