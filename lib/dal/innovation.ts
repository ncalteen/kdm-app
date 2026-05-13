import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { InnovationDetail } from '@/lib/types'

/**
 * Get Innovations
 *
 * Retrieves all innovations visible to the authenticated user. RLS surfaces:
 * - Built-in (non-custom) innovations
 * - Custom innovations owned by the user
 * - Custom innovations on settlements the user collaborates on (via the
 *   transitive SELECT policy on `innovation`)
 *
 * @returns Innovations
 */
export async function getInnovations(): Promise<{
  [key: string]: InnovationDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('innovation')
    .select('id, custom, innovation_name, rules, consequences, benefits')

  if (error) throw new Error(`Error Fetching Innovations: ${error.message}`)

  const innovationMap: { [key: string]: InnovationDetail } = {}
  for (const i of data ?? []) innovationMap[i.id] = i

  return innovationMap
}

/**
 * Get User Custom Innovations
 *
 * Retrieves only custom innovations authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Innovation Data Map
 */
export async function getUserCustomInnovations(): Promise<{
  [key: string]: InnovationDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('innovation')
    .select('id, custom, innovation_name, rules, consequences, benefits')
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Innovations: ${error.message}`)

  const innovationMap: { [key: string]: InnovationDetail } = {}
  for (const i of data ?? []) innovationMap[i.id] = i

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
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<InnovationDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (innovation.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('innovation')
    .insert({
      ...innovation,
      ...(innovation.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, innovation_name, rules, consequences, benefits')
    .single()

  if (error) throw new Error(`Error Adding Innovation: ${error.message}`)

  return data
}

/**
 * Update Innovation
 *
 * Updates an existing innovation record in the database.
 *
 * @param id Innovation ID
 * @param innovation Innovation Data
 * @returns Updated Innovation
 */
export async function updateInnovation(
  id: string,
  innovation: Omit<
    TablesUpdate<'innovation'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('innovation')
    .update(innovation)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Innovation: ${error.message}`)
}

/**
 * Remove Innovation
 *
 * Deletes an innovation record from the database.
 *
 * @param id Innovation ID
 */
export async function removeInnovation(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('innovation').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Innovation: ${error.message}`)
}
