import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { DisorderDetail } from '@/lib/types'

const DISORDER_SELECT = `
  id,
  custom,
  disorder_name,
  rules
`

/**
 * Get Disorders
 *
 * Retrieves all disorders visible to the authenticated user. RLS surfaces:
 *
 * - Built-in (non-custom) disorders
 * - Custom disorders owned by the user
 * - Custom disorders on settlements the user collaborates on (via the
 *   transitive SELECT policy on `disorder`)
 *
 * @returns Disorders by ID
 */
export async function getDisorders(): Promise<{
  [key: string]: DisorderDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('disorder')
    .select(DISORDER_SELECT)

  if (error) throw new Error(`Error Fetching Disorders: ${error.message}`)

  const map: { [key: string]: DisorderDetail } = {}
  for (const d of data) map[d.id] = d

  return map
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
    .select(DISORDER_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error)
    throw new Error(`Error Fetching Custom Disorders: ${error.message}`)

  const map: { [key: string]: DisorderDetail } = {}
  for (const d of data) map[d.id] = d

  return map
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
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<DisorderDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'disorder'> = { ...disorder }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('disorder')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(DISORDER_SELECT)
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
  disorder: Omit<
    TablesUpdate<'disorder'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'disorder'> = { ...disorder }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('disorder')
    .update(updateData)
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
