import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

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
export async function getCharacters(): Promise<
  Omit<
    Tables<'character'>,
    'created_at' | 'updated_at' | 'custom' | 'user_id'
  >[]
> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const selectFields = 'id, character_name'

  // Built-in characters
  const { data: builtIn, error: builtInError } = await supabase
    .from('character')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Characters: ${builtInError.message}`
    )

  // Custom characters owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('character')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Characters: ${ownedError.message}`)

  // Custom characters shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('character_shared_user')
    .select(`character(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Characters: ${sharedError.message}`)

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.character)
      ? row.character
      : row.character
        ? [row.character]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
