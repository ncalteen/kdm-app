import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Knowledges
 *
 * Retrieves all knowledges available to the authenticated user:
 * - Built-in (non-custom) knowledges
 * - Custom knowledges owned by the user
 * - Custom knowledges shared with the user
 *
 * @returns Knowledges
 */
export async function getKnowledges(): Promise<
  Omit<
    Tables<'knowledge'>,
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

  const selectFields = 'id, knowledge_name, philosophy_id'

  // Built-in knowledges
  const { data: builtIn, error: builtInError } = await supabase
    .from('knowledge')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Knowledges: ${builtInError.message}`
    )

  // Custom knowledges owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('knowledge')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Knowledges: ${ownedError.message}`)

  // Custom knowledges shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('knowledge_shared_user')
    .select(`knowledge(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Knowledges: ${sharedError.message}`)

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.knowledge)
      ? row.knowledge
      : row.knowledge
        ? [row.knowledge]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
