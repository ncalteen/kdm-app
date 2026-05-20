import { removeCatalogRow } from '@/lib/dal/catalog-archive'
import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { MonsterNode } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { QuarryDetail } from '@/lib/types'

/**
 * Get Quarries
 *
 * Retrieves the quarries visible to the authenticated user. RLS surfaces:
 *
 * - Non-custom quarries
 * - Custom quarries created by the user
 * - Custom quarries on settlements the user collaborates on (via the
 *   transitive SELECT policy on `quarry`)
 *
 * @param nodeTypes Optional Node Types Filter
 * @param includeAlternates Whether to Include Alternate Quarries (Default: true)
 * @param includeVignettes Whether to Include Vignette Quarries (Default: true)
 * @returns Quarry Data
 */
export async function getQuarries(
  nodeTypes: MonsterNode[] = [
    MonsterNode.NQ1,
    MonsterNode.NQ2,
    MonsterNode.NQ3,
    MonsterNode.NQ4
  ],
  includeAlternates = true,
  includeVignettes = true
): Promise<{ [key: string]: QuarryDetail }> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry')
    .select(
      'id, alternate_id, custom, monster_name, multi_monster, node, prologue, vignette_id, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome'
    )
    .in('node', nodeTypes)

  if (error) throw new Error(`Error Fetching Quarries: ${error.message}`)

  const quarryMap: { [key: string]: QuarryDetail } = {}
  for (const q of data ?? []) quarryMap[q.id] = q

  // Build sets of IDs that are referenced as alternates or vignettes by other
  // records. When the corresponding flag is false, these IDs are excluded.
  if (!includeAlternates || !includeVignettes) {
    const alternateIds = new Set<string>()
    const vignetteIds = new Set<string>()

    for (const q of Object.values(quarryMap)) {
      if (q.alternate_id) alternateIds.add(q.alternate_id)
      if (q.vignette_id) vignetteIds.add(q.vignette_id)
    }

    for (const id of Object.keys(quarryMap)) {
      if (!includeAlternates && alternateIds.has(id)) delete quarryMap[id]
      if (!includeVignettes && vignetteIds.has(id)) delete quarryMap[id]
    }
  }

  return quarryMap
}

/**
 * Get User Custom Quarries
 *
 * Retrieves only custom quarries created by the current user.
 *
 * @returns Custom Quarry Data Map
 */
export async function getUserCustomQuarries(): Promise<{
  [key: string]: QuarryDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry')
    .select(
      'id, alternate_id, custom, monster_name, multi_monster, node, prologue, vignette_id, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome, archived_at'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error) throw new Error(`Error Fetching Custom Quarries: ${error.message}`)

  const quarryMap: { [key: string]: QuarryDetail } = {}
  for (const q of data ?? []) if (!q.archived_at) quarryMap[q.id] = q

  return quarryMap
}

/**
 * Get Quarry
 *
 * Retrieves a single quarry by ID.
 *
 * @param quarryId Quarry ID
 * @returns Quarry Detail or null
 */
export async function getQuarry(
  quarryId: string | null | undefined
): Promise<QuarryDetail | null> {
  if (!quarryId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry')
    .select(
      'id, alternate_id, custom, monster_name, multi_monster, node, prologue, vignette_id, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome'
    )
    .eq('id', quarryId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Quarry: ${error.message}`)

  return data
}

/**
 * Get Quarry IDs
 *
 * Retrieves the IDs of quarries. This depends on if they are custom quarries
 * (requires the user ID if so). This is used to populate new hunts and
 * showdowns created from templates.
 *
 * @param quarryNames Quarry Names
 * @param custom Custom
 * @param userId User ID
 * @returns Quarry IDs
 */
export async function getQuarryIds(
  quarryNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('quarry')
        .select('id')
        .in('monster_name', quarryNames)
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('quarry')
        .select('id')
        .in('monster_name', quarryNames)
        .eq('custom', custom)

  if (error) throw new Error(`Error Fetching Quarry ID(s): ${error.message}`)

  if (!data) throw new Error('Quarry(ies) Not Found')

  return data.map((quarry) => quarry.id)
}

/**
 * Get Quarry Nodes by ID
 *
 * Given an array of quarry IDs, returns each ID with its monster node.
 *
 * @param ids Quarry IDs
 * @returns Quarry ID/Node Pairs
 */
export async function getQuarryNodesById(
  ids: string[]
): Promise<{ id: string; node: MonsterNode }[]> {
  if (ids.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry')
    .select('id, node')
    .in('id', ids)

  if (error) throw new Error(`Error Fetching Quarry Nodes: ${error.message}`)

  return (data ?? []).map((q) => ({ id: q.id, node: q.node as MonsterNode }))
}

/**
 * Add Quarry
 *
 * Adds a new quarry record to the database.
 *
 * @param quarry Quarry Data
 * @returns Inserted Quarry
 */
export async function addQuarry(
  quarry: Omit<
    TablesInsert<'quarry'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<QuarryDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (quarry.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('quarry')
    .insert({ ...quarry, ...(quarry.custom ? { user_id: userId! } : {}) })
    .select(
      'id, alternate_id, custom, monster_name, multi_monster, node, prologue, vignette_id, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome'
    )
    .single()

  if (error) throw new Error(`Error Adding Quarry: ${error.message}`)

  return data
}

/**
 * Update Quarry
 *
 * Updates an existing quarry record in the database.
 *
 * @param id Quarry ID
 * @param quarry Quarry Data
 * @returns Updated Quarry
 */
export async function updateQuarry(
  id: string,
  quarry: Omit<TablesUpdate<'quarry'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('quarry').update(quarry).eq('id', id)

  if (error) throw new Error(`Error Updating Quarry: ${error.message}`)
}

/**
 * Remove Quarry
 *
 * Deletes a quarry record from the database.
 *
 * @param id Quarry ID
 */
export async function removeQuarry(id: string): Promise<void> {
  await removeCatalogRow('quarry', id, 'Quarry')
}
