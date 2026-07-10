import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { PhilosophyDetail } from '@/lib/types'

const PHILOSOPHY_SELECT = `
  id,
  custom,
  philosophy_name,
  hunt_xp_milestones,
  tenet_knowledge_id,
  tier,
  neurosis_id,
  neurosis(
    id,
    custom,
    neurosis_name,
    rules
  ),
  ranks:philosophy_rank(
    id,
    philosophy_id,
    rank_number,
    rules
  ),
  tenet_knowledge:knowledge!philosophy_tenet_knowledge_id_fkey(
    id,
    custom,
    knowledge_name,
    philosophy_id,
    rules,
    observation_conditions,
    observation_rank_up_milestone
  )
`

type PhilosophyRow = Omit<
  PhilosophyDetail,
  'neurosis' | 'ranks' | 'tenet_knowledge'
> & {
  neurosis: NonNullable<PhilosophyDetail['neurosis']>[number] | null
  ranks: NonNullable<PhilosophyDetail['ranks']> | null
  tenet_knowledge:
    | NonNullable<PhilosophyDetail['tenet_knowledge']>[number]
    | null
}

function nullableRowToArray<T>(row: T | null | undefined): T[] {
  return row ? [row] : []
}

function toPhilosophyDetail(row: PhilosophyRow): PhilosophyDetail {
  return {
    ...row,
    neurosis: nullableRowToArray(row.neurosis),
    ranks: row.ranks ?? [],
    tenet_knowledge: nullableRowToArray(row.tenet_knowledge)
  }
}

/**
 * Get Philosophies
 *
 * Retrieves all philosophies visible to the authenticated user. RLS
 * surfaces:
 *
 * - Built-in (non-custom) philosophies
 * - Custom philosophies owned by the user
 *
 * @returns Philosophies by ID
 */
export async function getPhilosophies(): Promise<{
  [key: string]: PhilosophyDetail
}> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('philosophy')
    .select(PHILOSOPHY_SELECT)

  if (error) throw new Error(`Error Fetching Philosophies: ${error.message}`)

  const map: { [key: string]: PhilosophyDetail } = {}
  for (const p of data as unknown as PhilosophyRow[])
    map[p.id] = toPhilosophyDetail(p)

  return map
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
    .select(PHILOSOPHY_SELECT)
    .eq('custom', true)
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error)
    throw new Error(`Error Fetching Custom Philosophies: ${error.message}`)

  const map: { [key: string]: PhilosophyDetail } = {}
  for (const p of data as unknown as PhilosophyRow[])
    map[p.id] = toPhilosophyDetail(p)

  return map
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
    'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
  >
): Promise<PhilosophyDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()
  const insertData: TablesInsert<'philosophy'> = { ...philosophy }

  // Ownership is derived from the authenticated user, even if caller input was
  // cast into this function with a user_id field.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('philosophy')
    .insert({
      ...insertData,
      ...(insertData.custom === true ? { user_id: userId } : {})
    })
    .select(PHILOSOPHY_SELECT)
    .single()

  if (error) throw new Error(`Error Adding Philosophy: ${error.message}`)

  return toPhilosophyDetail(data as unknown as PhilosophyRow)
}

/**
 * Update Philosophy
 *
 * Updates an existing philosophy record in the database.
 *
 * @param id Philosophy ID
 * @param philosophy Philosophy Data
 */
export async function updatePhilosophy(
  id: string,
  philosophy: Omit<
    TablesUpdate<'philosophy'>,
    'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'philosophy'> = { ...philosophy }

  delete updateData.custom
  delete updateData.user_id

  const { error } = await supabase
    .from('philosophy')
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Philosophy: ${error.message}`)
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
