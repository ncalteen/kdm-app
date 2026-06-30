import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { NeurosisDetail } from '@/lib/types'

export const NEUROSIS_SELECT = `
  id,
  custom,
  neurosis_name,
  rules
`

/**
 * Get Neuroses
 *
 * Retrieves all neuroses visible to the authenticated user. RLS surfaces:
 *
 * - Built-in (non-custom) neuroses
 * - Custom neuroses owned by the user
 *
 * @returns Neuroses by ID
 */
export async function getNeuroses(): Promise<{
  [key: string]: NeurosisDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('neurosis')
    .select(NEUROSIS_SELECT)

  if (error) throw new Error(`Error Fetching Neuroses: ${error.message}`)

  const map: { [key: string]: NeurosisDetail } = {}
  for (const item of data) map[item.id] = item

  return map
}

/**
 * Get User Custom Neuroses
 *
 * Retrieves only custom neuroses authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Neurosis Data Map
 */
export async function getUserCustomNeuroses(): Promise<{
  [key: string]: NeurosisDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('neurosis')
    .select(NEUROSIS_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error) throw new Error(`Error Fetching Custom Neuroses: ${error.message}`)

  const map: { [key: string]: NeurosisDetail } = {}
  for (const item of data) map[item.id] = item

  return map
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
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<NeurosisDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'neurosis'> = { ...neurosis }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('neurosis')
    .insert({
      ...insertData,
      custom: true,
      user_id: userId
    })
    .select(NEUROSIS_SELECT)
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
 */
export async function updateNeurosis(
  id: string,
  neurosis: Omit<
    TablesUpdate<'neurosis'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'neurosis'> = { ...neurosis }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('neurosis')
    .update(updateData)
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
