import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Innovation IDs
 *
 * Retrieves the IDs of innovations. This depends on if they are custom
 * innovations (requires the user ID if so).
 *
 * @param innovationNames Innovation Names
 * @param custom Custom
 * @param userId User ID
 * @returns Innovation IDs
 */
export async function getInnovationIds(
  innovationNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('innovation')
        .select('id')
        .in('innovation_name', innovationNames)
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('innovation')
        .select('id')
        .in('innovation_name', innovationNames)
        .eq('custom', custom)

  if (error)
    throw new Error(`Error Fetching Innovation ID(s): ${error.message}`)

  if (!data) throw new Error('Innovation(s) Not Found')

  return data.map((innovation) => innovation.id)
}

/**
 * Get Innovation Names by Settlement ID
 *
 * Retrieves the names of innovations associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Innovation Names
 */
export async function getInnovationNames(
  settlementId: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_innovation')
    .select('innovation(innovation_name)')
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Innovations: ${error.message}`)

  const innovationNames =
    data?.map((row) => {
      const innovation = Array.isArray(row.innovation)
        ? row.innovation[0]
        : row.innovation

      return innovation?.innovation_name
    }) ?? []

  return innovationNames
}

/**
 * Get Innovations
 *
 * Retrieves all innovations available to the authenticated user:
 * - Built-in (non-custom) innovations
 * - Custom innovations owned by the user
 * - Custom innovations shared with the user
 *
 * @returns Innovations
 */
export async function getInnovations(): Promise<
  Omit<
    Tables<'innovation'>,
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

  const selectFields = 'id, innovation_name'

  // Built-in innovations
  const { data: builtIn, error: builtInError } = await supabase
    .from('innovation')
    .select(selectFields)
    .eq('custom', false)

  if (builtInError)
    throw new Error(
      `Error Fetching Built-in Innovations: ${builtInError.message}`
    )

  // Custom innovations owned by the user
  const { data: owned, error: ownedError } = await supabase
    .from('innovation')
    .select(selectFields)
    .eq('custom', true)
    .eq('user_id', user.id)

  if (ownedError)
    throw new Error(`Error Fetching Owned Innovations: ${ownedError.message}`)

  // Custom innovations shared with the user
  const { data: shared, error: sharedError } = await supabase
    .from('innovation_shared_user')
    .select(`innovation(${selectFields})`)
    .eq('shared_user_id', user.id)

  if (sharedError)
    throw new Error(`Error Fetching Shared Innovations: ${sharedError.message}`)

  const sharedItems = (shared ?? []).flatMap((row) => {
    const item = Array.isArray(row.innovation)
      ? row.innovation
      : row.innovation
        ? [row.innovation]
        : []
    return item
  })

  return [...(builtIn ?? []), ...(owned ?? []), ...sharedItems]
}
