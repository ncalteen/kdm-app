import { MonsterNode } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Nemesis Names
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
export async function getNemesisNames(
  nodeTypes: MonsterNode[] = [
    MonsterNode.NN1,
    MonsterNode.NN2,
    MonsterNode.NN3,
    MonsterNode.CO,
    MonsterNode.FI
  ]
): Promise<{ id: string; monster_name: string }[]> {
  const supabase = createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!userData.user) throw new Error('User Not Authenticated')

  // Fetch all three categories of nemeses in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom nemeses (available to all users)
    supabase
      .from('nemesis')
      .select('id, monster_name')
      .eq('custom', false)
      .in('node', nodeTypes),
    // Custom nemeses created by the user
    supabase
      .from('nemesis')
      .select('id, monster_name')
      .eq('custom', true)
      .eq('user_id', userData.user.id)
      .in('node', nodeTypes),
    // Custom nemeses shared with the user
    supabase
      .from('nemesis_shared_user')
      .select('nemesis_id, nemesis:nemesis_id!inner(id, monster_name, node)')
      .eq('user_id', userData.user.id)
      .in('nemesis.node', nodeTypes)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Nemeses: ${result.error.message}`)

  // Collect nemeses from all sources, deduplicating by ID
  const nemesisMap = new Map<string, { id: string; monster_name: string }>()

  for (const n of nonCustomResult.data ?? [])
    nemesisMap.set(n.id, { id: n.id, monster_name: n.monster_name })

  for (const n of userCustomResult.data ?? [])
    nemesisMap.set(n.id, { id: n.id, monster_name: n.monster_name })

  for (const row of sharedResult.data ?? []) {
    const n = row.nemesis as unknown as {
      id: string
      monster_name: string
    }

    if (n) nemesisMap.set(n.id, { id: n.id, monster_name: n.monster_name })
  }

  if (nemesisMap.size === 0) throw new Error('Nemeses(s) Not Found')

  return [...nemesisMap.values()]
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
