import { getUserId } from '@/lib/dal/user'
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
 * Uses `getUserId()` to centralize the auth check rather than repeating
 * `supabase.auth.getUser()` inline.
 *
 * @returns Disorders keyed by ID
 */
export async function getDisorders(): Promise<{
  [key: string]: DisorderDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  // Fetch all three categories of disorders in parallel.
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase.from('disorder').select('id, disorder_name').eq('custom', false),
    supabase
      .from('disorder')
      .select('id, disorder_name')
      .eq('custom', true)
      .eq('user_id', userId),
    supabase
      .from('disorder_shared_user')
      .select('disorder(id, disorder_name)')
      .eq('shared_user_id', userId)
  ])

  if (nonCustomResult.error)
    throw new Error(
      `Error Fetching Built-in Disorders: ${nonCustomResult.error.message}`
    )
  if (userCustomResult.error)
    throw new Error(
      `Error Fetching Custom Disorders: ${userCustomResult.error.message}`
    )
  if (sharedResult.error)
    throw new Error(
      `Error Fetching Shared Disorders: ${sharedResult.error.message}`
    )

  const disorderMap: { [key: string]: DisorderDetail } = {}

  for (const d of nonCustomResult.data ?? []) disorderMap[d.id] = d
  for (const d of userCustomResult.data ?? []) disorderMap[d.id] = d

  // Safely handle the shared-user join — Supabase may return the joined
  // table as a single object or an array depending on the relationship type.
  for (const row of sharedResult.data ?? []) {
    const disorder = Array.isArray(row.disorder)
      ? row.disorder[0]
      : row.disorder
    if (disorder) disorderMap[disorder.id] = disorder
  }

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
 */
export async function updateDisorder(
  id: string,
  disorder: Omit<TablesUpdate<'disorder'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('disorder')
    .update(disorder)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Disorder: ${error.message}`)
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
