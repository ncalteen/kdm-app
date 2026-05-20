import { removeCatalogRow } from '@/lib/dal/catalog-archive'
import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { DisorderDetail } from '@/lib/types'

/**
 * Get Disorders
 *
 * Retrieves all disorders visible to the authenticated user. RLS surfaces:
 * - Built-in (non-custom) disorders
 * - Custom disorders owned by the user
 * - Custom disorders on settlements the user collaborates on (via the
 *   transitive SELECT policy on `disorder`)
 *
 * Uses `getUserId()` to centralize the auth check rather than repeating
 * `supabase.auth.getUser()` inline.
 *
 * @returns Disorders keyed by ID
 */
export async function getDisorders(): Promise<{
  [key: string]: DisorderDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('disorder')
    .select('id, custom, disorder_name, rules')

  if (error) throw new Error(`Error Fetching Disorders: ${error.message}`)

  const disorderMap: { [key: string]: DisorderDetail } = {}
  for (const d of data ?? []) disorderMap[d.id] = d

  return disorderMap
}

/**
 * Get User Custom Disorders
 *
 * Retrieves only custom disorders authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Disorder Data Map
 */
export async function getUserCustomDisorders(): Promise<{
  [key: string]: DisorderDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('disorder')
    .select('id, custom, disorder_name, rules, archived_at')
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Disorders: ${error.message}`)

  const disorderMap: { [key: string]: DisorderDetail } = {}
  for (const d of data ?? []) if (!d.archived_at) disorderMap[d.id] = d

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
  disorder: Omit<
    TablesInsert<'disorder'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<DisorderDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (disorder.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('disorder')
    .insert({
      ...disorder,
      ...(disorder.custom ? { user_id: userId! } : {})
    })
    .select('id, custom, disorder_name, rules')
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
  await removeCatalogRow('disorder', id, 'Disorder')
}
