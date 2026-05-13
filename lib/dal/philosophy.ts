import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { PhilosophyDetail } from '@/lib/types'

/**
 * Get Philosophies
 *
 * Retrieves all philosophies visible to the authenticated user. RLS
 * surfaces:
 * - Built-in (non-custom) philosophies
 * - Custom philosophies owned by the user
 *
 * @returns Philosophies
 */
export async function getPhilosophies(): Promise<{
  [key: string]: PhilosophyDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('philosophy')
    .select(
      'id, custom, philosophy_name, hunt_xp_milestones, tenet_knowledge_id, tier, neurosis_id'
    )

  if (error) throw new Error(`Error Fetching Philosophies: ${error.message}`)

  const philosophyMap: { [key: string]: PhilosophyDetail } = {}
  for (const p of data ?? []) philosophyMap[p.id] = p

  return philosophyMap
}

/**
 * Get User Custom Philosophies
 *
 * Retrieves only custom philosophies authored by the current user. Used by
 * the user-content library so collaborator-authored customs visible via the
 * transitive SELECT policy don't pollute the caller's personal catalog.
 *
 * @returns Custom Philosophy Data Map
 */
export async function getUserCustomPhilosophies(): Promise<{
  [key: string]: PhilosophyDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('philosophy')
    .select(
      'id, custom, philosophy_name, hunt_xp_milestones, tenet_knowledge_id, tier, neurosis_id'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Fetching Custom Philosophies: ${error.message}`)

  const philosophyMap: { [key: string]: PhilosophyDetail } = {}
  for (const p of data ?? []) philosophyMap[p.id] = p

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
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<PhilosophyDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (philosophy.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('philosophy')
    .insert({
      ...philosophy,
      ...(philosophy.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, custom, philosophy_name, hunt_xp_milestones, tenet_knowledge_id, tier, neurosis_id'
    )
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
    .select(
      'id, custom, philosophy_name, hunt_xp_milestones, tenet_knowledge_id, tier, neurosis_id'
    )
    .single()

  if (error) throw new Error(`Error Updating Philosophy: ${error.message}`)
  if (!data) throw new Error('Philosophy Not Found')

  return data
}

/**
 * Remove Philosophy
 *
 * Deletes a philosophy record from the database.
 *
 * @param id Philosophy ID
 */
export async function removePhilosophy(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('philosophy').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Philosophy: ${error.message}`)
}
