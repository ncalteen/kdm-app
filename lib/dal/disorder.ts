import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { DisorderDetail } from '@/lib/types'

/**
 * Get Disorders
 *
 * Retrieves all disorders available to the authenticated user:
 * - Built-in (non-custom) disorders
 * - Custom disorders owned by the user
 * - Custom disorders shared with the user
 *
 * @returns Disorders
 */
export async function getDisorders(): Promise<{
  [key: string]: DisorderDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Fetch all three categories of disorders in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase.from('disorder').select('id, disorder_name').eq('custom', false),
    supabase
      .from('disorder')
      .select('id, disorder_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('disorder_shared_user')
      .select('disorder(id, disorder_name)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Disorders: ${result.error.message}`)

  const disorderMap: { [key: string]: DisorderDetail } = {}

  for (const d of nonCustomResult.data ?? []) disorderMap[d.id] = d
  for (const d of userCustomResult.data ?? []) disorderMap[d.id] = d
  for (const row of sharedResult.data ?? [])
    disorderMap[row.disorder[0].id] = row.disorder[0]

  return disorderMap
}

/**
 * Add Disorder
 *
 * Adds a new disorder record to the database.
 *
 * @param disorder Disorder Data
 * @returns Inserted Disorder
 */
export async function addDisorder(
  disorder: Omit<TablesInsert<'disorder'>, 'id' | 'created_at' | 'updated_at'>
): Promise<DisorderDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('disorder')
    .insert(disorder)
    .select('id, disorder_name')
    .single()

  if (error) throw new Error(`Error Adding Disorder: ${error.message}`)

  return data
}

/**
 * Update Disorder
 *
 * Updates an existing disorder record in the database.
 *
 * @param id Disorder ID
 * @param disorder Disorder Data
 * @returns Updated Disorder
 */
export async function updateDisorder(
  id: string,
  disorder: Omit<TablesUpdate<'disorder'>, 'id' | 'created_at' | 'updated_at'>
): Promise<DisorderDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('disorder')
    .update(disorder)
    .eq('id', id)
    .select('id, disorder_name')
    .single()

  if (error) throw new Error(`Error Updating Disorder: ${error.message}`)
  if (!data) throw new Error('Disorder Not Found')

  return data
}

/**
 * Remove Disorder
 *
 * Deletes a disorder record from the database.
 *
 * @param id Disorder ID
 */
export async function removeDisorder(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('disorder').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Disorder: ${error.message}`)
}
