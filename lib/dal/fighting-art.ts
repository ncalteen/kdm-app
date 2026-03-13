import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Fighting Arts
 *
 * Retrieves all fighting arts available to the authenticated user:
 * - Built-in (non-custom) fighting arts
 * - Custom fighting arts owned by the user
 * - Custom fighting arts shared with the user
 *
 * @returns Fighting Arts
 */
export async function getFightingArts(): Promise<
  Omit<
    Tables<'fighting_art'>,
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

  const selectFields = 'id, fighting_art_name, secret_fighting_art'

  // Built-in fighting arts
  const { data: builtIn, error: builtInError } = await supabase
    .from('fighting_art')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Fighting Arts: ${builtInError.message}`
    )

  // Custom fighting arts owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('fighting_art')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Fighting Arts: ${ownedError.message}`)

  // Custom fighting arts shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('fighting_art_shared_user')
    .select(`fighting_art(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(
      `Error Fetching Shared Fighting Arts: ${sharedError.message}`
    )

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.fighting_art)
      ? row.fighting_art
      : row.fighting_art
        ? [row.fighting_art]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
