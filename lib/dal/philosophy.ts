import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { PhilosophyDetail } from '@/lib/types'

/**
 * Get Philosophies
 *
 * Retrieves all philosophies available to the authenticated user:
 * - Built-in (non-custom) philosophies
 * - Custom philosophies owned by the user
 * - Custom philosophies shared with the user
 *
 * @returns Philosophies
 */
export async function getPhilosophies(): Promise<{
  [key: string]: PhilosophyDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Fetch all three categories of philosophies in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom philosophies (available to all users)
    supabase
      .from('philosophy')
      .select('id, neurosis_id, philosophy_name')
      .eq('custom', false),
    // Custom philosophies created by the user
    supabase
      .from('philosophy')
      .select('id, neurosis_id, philosophy_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    // Custom philosophies shared with the user
    supabase
      .from('philosophy_shared_user')
      .select('philosophy(id, neurosis_id, philosophy_name)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Philosophies: ${result.error.message}`)

  // Collect philosophies from all sources, deduplicating by ID
  const philosophyMap: { [key: string]: PhilosophyDetail } = {}

  for (const p of nonCustomResult.data ?? []) philosophyMap[p.id] = p
  for (const p of userCustomResult.data ?? []) philosophyMap[p.id] = p
  for (const row of sharedResult.data ?? [])
    philosophyMap[row.philosophy[0].id] = row.philosophy[0]

  return philosophyMap
}

/**
 * Add Philosophy
 *
 * Adds a new philosophy record to the database.
 *
 * @param philosophy Philosophy Data
 * @returns Inserted Philosophy
 */
export async function addPhilosophy(
  philosophy: Omit<
    TablesInsert<'philosophy'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<PhilosophyDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('philosophy')
    .insert(philosophy)
    .select('id, neurosis_id, philosophy_name')
    .single()

  if (error) throw new Error(`Error Adding Philosophy: ${error.message}`)

  return data
}

/**
 * Update Philosophy
 *
 * Updates an existing philosophy record in the database.
 *
 * @param id Philosophy ID
 * @param philosophy Philosophy Data
 * @returns Updated Philosophy
 */
export async function updatePhilosophy(
  id: string,
  philosophy: Omit<
    TablesUpdate<'philosophy'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<PhilosophyDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('philosophy')
    .update(philosophy)
    .eq('id', id)
    .select('id, neurosis_id, philosophy_name')
    .single()

  if (error) throw new Error(`Error Updating Philosophy: ${error.message}`)
  if (!data) throw new Error('Philosophy Not Found')

  return data
}
