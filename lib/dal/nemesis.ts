import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { MonsterNode } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { NemesisDetail } from '@/lib/types'

/**
 * Get Nemeses
 *
 * Retrieves the nemeses visible to the authenticated user. RLS surfaces:
 *
 * - Non-custom nemeses
 * - Custom nemeses created by the user
 * - Custom nemeses on settlements the user collaborates on (via the
 *   transitive SELECT policy on `nemesis`)
 *
 * @param nodeTypes Optional Node Types Filter
 * @param includeAlternates Whether to Include Alternate Nemeses (Default: true)
 * @param includeVignettes Whether to Include Vignette Nemeses (Default: true)
 * @returns Nemesis Data
 */
export async function getNemeses(
  nodeTypes: MonsterNode[] = [
    MonsterNode.NN1,
    MonsterNode.NN2,
    MonsterNode.NN3,
    MonsterNode.CO,
    MonsterNode.FI
  ],
  includeAlternates = true,
  includeVignettes = true
): Promise<{ [key: string]: NemesisDetail }> {
  await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis')
    .select(
      'id, alternate_id, custom, monster_name, multi_monster, node, vignette_id, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome'
    )
    .in('node', nodeTypes)

  if (error) throw new Error(`Error Fetching Nemeses: ${error.message}`)

  const nemesisMap: { [key: string]: NemesisDetail } = {}
  for (const n of data ?? []) nemesisMap[n.id] = n

  // Build sets of IDs that are referenced as alternates or vignettes by other
  // records. When the corresponding flag is false, these IDs are excluded.
  if (!includeAlternates || !includeVignettes) {
    const alternateIds = new Set<string>()
    const vignetteIds = new Set<string>()

    for (const n of Object.values(nemesisMap)) {
      if (n.alternate_id) alternateIds.add(n.alternate_id)
      if (n.vignette_id) vignetteIds.add(n.vignette_id)
    }

    for (const id of Object.keys(nemesisMap)) {
      if (!includeAlternates && alternateIds.has(id)) delete nemesisMap[id]
      if (!includeVignettes && vignetteIds.has(id)) delete nemesisMap[id]
    }
  }

  return nemesisMap
}

/**
 * Get User Custom Nemeses
 *
 * Retrieves only custom nemeses created by the current user.
 *
 * @returns Custom Nemesis Data Map
 */
export async function getUserCustomNemeses(): Promise<{
  [key: string]: NemesisDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis')
    .select(
      'id, alternate_id, custom, monster_name, multi_monster, node, vignette_id, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome'
    )
    .eq('custom', true)
    .eq('user_id', userId)

  if (error) throw new Error(`Error Fetching Custom Nemeses: ${error.message}`)

  const nemesisMap: { [key: string]: NemesisDetail } = {}
  for (const n of data ?? []) nemesisMap[n.id] = n

  return nemesisMap
}

/**
 * Get Nemesis
 *
 * Retrieves a single nemesis by ID.
 *
 * @param nemesisId Nemesis ID
 * @returns Nemesis Detail or null
 */
export async function getNemesis(
  nemesisId: string | null | undefined
): Promise<NemesisDetail | null> {
  if (!nemesisId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis')
    .select(
      'id, alternate_id, custom, monster_name, multi_monster, node, vignette_id, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome'
    )
    .eq('id', nemesisId)
    .maybeSingle()

  if (error) throw new Error(`Error Fetching Nemesis: ${error.message}`)

  return data
}

/**
 * Get Nemesis IDs
 *
 * Retrieves the IDs of nemeses. This depends on if they are custom nemeses
 * (requires the user ID if so).
 *
 * @param nemesisNames Nemesis Names
 * @param custom Custom
 * @param userId User ID
 * @returns Nemesis IDs
 */
export async function getNemesisIds(
  nemesisNames: string[],
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('nemesis')
        .select('id')
        .in('monster_name', nemesisNames)
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('nemesis')
        .select('id')
        .in('monster_name', nemesisNames)
        .eq('custom', custom)

  if (error) throw new Error(`Error Fetching Nemesis ID(s): ${error.message}`)

  if (!data) throw new Error('Nemesis(es) Not Found')

  return data.map((nemesis) => nemesis.id)
}

/**
 * Get Nemesis Nodes by ID
 *
 * Given an array of nemesis IDs, returns each ID with its monster node.
 *
 * @param ids Nemesis IDs
 * @returns Nemesis ID/Node Pairs
 */
export async function getNemesisNodesById(
  ids: string[]
): Promise<{ id: string; node: MonsterNode }[]> {
  if (ids.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis')
    .select('id, node')
    .in('id', ids)

  if (error) throw new Error(`Error Fetching Nemesis Nodes: ${error.message}`)

  return (data ?? []).map((n) => ({ id: n.id, node: n.node as MonsterNode }))
}

/**
 * Add Nemesis
 *
 * Adds a new nemesis record to the database.
 *
 * @param nemesis Nemesis Data
 * @returns Inserted Nemesis
 */
export async function addNemesis(
  nemesis: Omit<
    TablesInsert<'nemesis'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<NemesisDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (nemesis.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('nemesis')
    .insert({
      ...nemesis,
      ...(nemesis.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, alternate_id, custom, monster_name, multi_monster, node, vignette_id, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome'
    )
    .single()

  if (error) throw new Error(`Error Adding Nemesis: ${error.message}`)

  return data
}

/**
 * Update Nemesis
 *
 * Updates an existing nemesis record in the database.
 *
 * @param id Nemesis ID
 * @param nemesis Nemesis Data
 * @returns Updated Nemesis
 */
export async function updateNemesis(
  id: string,
  nemesis: Omit<TablesUpdate<'nemesis'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('nemesis').update(nemesis).eq('id', id)

  if (error) throw new Error(`Error Updating Nemesis: ${error.message}`)
}

/**
 * Remove Nemesis
 *
 * Deletes a nemesis record from the database.
 *
 * @param id Nemesis ID
 */
export async function removeNemesis(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('nemesis').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Nemesis: ${error.message}`)
}
