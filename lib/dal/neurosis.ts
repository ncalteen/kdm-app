import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { NeurosisDetail } from '@/lib/types'

/**
 * Get Neuroses
 *
 * Retrieves all neuroses available to the authenticated user:
 *
 * - Built-in (non-custom) neuroses
 * - Custom neuroses owned by the user
 * - Custom neuroses shared with the user
 *
 * @returns Neuroses
 */
export async function getNeuroses(): Promise<{
  [key: string]: NeurosisDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  // Fetch all three categories of neuroses in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom neuroses (available to all users)
    supabase
      .from('neurosis')
      .select('id, custom, neurosis_name, rules')
      .eq('custom', false),
    // Custom neuroses created by the user
    supabase
      .from('neurosis')
      .select('id, custom, neurosis_name, rules')
      .eq('custom', true)
      .eq('user_id', userId),
    // Custom neuroses shared with the user
    supabase
      .from('neurosis_shared_user')
      .select('neurosis(id, custom, neurosis_name, rules)')
      .eq('shared_user_id', userId)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Neuroses: ${result.error.message}`)

  // Collect neuroses from all sources, deduplicating by ID
  const neurosisMap: { [key: string]: NeurosisDetail } = {}

  for (const n of nonCustomResult.data ?? []) neurosisMap[n.id] = n
  for (const n of userCustomResult.data ?? []) neurosisMap[n.id] = n
  for (const row of sharedResult.data ?? [])
    neurosisMap[row.neurosis[0].id] = row.neurosis[0]

  return neurosisMap
}

/**
 * Add Neurosis
 *
 * Adds a new neurosis record to the database.
 *
 * @param neurosis Neurosis Data
 * @returns Inserted Neurosis
 */
export async function addNeurosis(
  neurosis: Omit<
    TablesInsert<'neurosis'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<NeurosisDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (neurosis.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('neurosis')
    .insert({
      ...neurosis,
      ...(neurosis.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, neurosis_name, rules')
    .single()

  if (error) throw new Error(`Error Adding Neurosis: ${error.message}`)

  return data
}

/**
 * Update Neurosis
 *
 * Updates an existing neurosis record in the database.
 *
 * @param id Neurosis ID
 * @param neurosis Neurosis Data
 * @returns Updated Neurosis
 */
export async function updateNeurosis(
  id: string,
  neurosis: Omit<TablesUpdate<'neurosis'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('neurosis')
    .update(neurosis)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Neurosis: ${error.message}`)
}

/**
 * Remove Neurosis
 *
 * Deletes a neurosis record from the database.
 *
 * @param id Neurosis ID
 */
export async function removeNeurosis(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('neurosis').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Neurosis: ${error.message}`)
}
