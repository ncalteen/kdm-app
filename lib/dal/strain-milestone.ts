import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Strain Milestones
 *
 * Retrieves all strain milestones available to the authenticated user:
 * - Built-in (non-custom) strain milestones
 * - Custom strain milestones owned by the user
 * - Custom strain milestones shared with the user
 *
 * @returns Strain Milestones
 */
export async function getStrainMilestones(): Promise<
  Omit<
    Tables<'strain_milestone'>,
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

  const selectFields = 'id, strain_milestone_name'

  // Built-in strain milestones
  const { data: builtIn, error: builtInError } = await supabase
    .from('strain_milestone')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Strain Milestones: ${builtInError.message}`
    )

  // Custom strain milestones owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('strain_milestone')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(
      `Error Fetching Owned Strain Milestones: ${ownedError.message}`
    )

  // Custom strain milestones shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('strain_milestone_shared_user')
    .select(`strain_milestone(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(
      `Error Fetching Shared Strain Milestones: ${sharedError.message}`
    )

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.strain_milestone)
      ? row.strain_milestone
      : row.strain_milestone
        ? [row.strain_milestone]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
