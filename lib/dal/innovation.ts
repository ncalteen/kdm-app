import { TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { InnovationDetail } from '@/lib/types'

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
export async function getInnovations(): Promise<{
  [key: string]: InnovationDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase
      .from('innovation')
      .select('id, innovation_name')
      .eq('custom', false),
    supabase
      .from('innovation')
      .select('id, innovation_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('innovation_shared_user')
      .select('innovation(id, innovation_name)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Innovations: ${result.error.message}`)

  const innovationMap: { [key: string]: InnovationDetail } = {}

  for (const i of nonCustomResult.data ?? []) innovationMap[i.id] = i
  for (const i of userCustomResult.data ?? []) innovationMap[i.id] = i
  for (const row of sharedResult.data ?? [])
    innovationMap[row.innovation[0].id] = row.innovation[0]

  return innovationMap
}

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
 * Add Innovation
 *
 * Adds a new innovation record to the database.
 *
 * @param innovation Innovation Data
 * @returns Inserted Innovation
 */
export async function addInnovation(
  innovation: Omit<
    TablesInsert<'innovation'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<InnovationDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('innovation')
    .insert(innovation)
    .select('id, innovation_name')
    .single()

  if (error) throw new Error(`Error Adding Innovation: ${error.message}`)

  return data
}
