import { MonsterNode } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { NemesisDetail } from '@/lib/types'

/**
 * Get Nemeses
 *
 * Retrieves the nemeses a user has access to. This includes:
 *
 * - Non-custom nemeses
 * - Custom nemeses created by the user
 * - Custom nemeses shared with the user (via the nemesis_shared_user table)
 *
 * @param nodeTypes Optional Node Types Filter
 * @returns Nemesis Data
 */
export async function getNemeses(
  nodeTypes: MonsterNode[] = [
    MonsterNode.NN1,
    MonsterNode.NN2,
    MonsterNode.NN3,
    MonsterNode.CO,
    MonsterNode.FI
  ]
): Promise<{ [key: string]: NemesisDetail }> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Fetch all three categories of nemeses in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom nemeses (available to all users)
    supabase
      .from('nemesis')
      .select(
        'id, alternate_id, monster_name, multi_monster, node, vignette_id'
      )
      .eq('custom', false)
      .in('node', nodeTypes),
    // Custom nemeses created by the user
    supabase
      .from('nemesis')
      .select(
        'id, alternate_id, monster_name, multi_monster, node, vignette_id'
      )
      .eq('custom', true)
      .eq('user_id', user.id)
      .in('node', nodeTypes),
    // Custom nemeses shared with the user
    supabase
      .from('nemesis_shared_user')
      .select(
        'nemesis(id, alternate_id, monster_name, multi_monster, node, vignette_id)'
      )
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Nemeses: ${result.error.message}`)

  // Collect nemeses from all sources, deduplicating by ID
  const nemesisMap: { [key: string]: NemesisDetail } = {}

  for (const n of nonCustomResult.data ?? []) nemesisMap[n.id] = n
  for (const n of userCustomResult.data ?? []) nemesisMap[n.id] = n
  for (const row of sharedResult.data ?? []) {
    const n = row.nemesis as unknown as NemesisDetail | null

    if (n) nemesisMap[n.id] = n
  }

  return nemesisMap
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
