import { MonsterNode } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Quarry Names
 *
 * Retrieves the quarries a user has access to. This includes:
 *
 * - Non-custom quarries
 * - Custom quarries created by the user
 * - Custom quarries shared with the user (via the quarry_shared_user table)
 *
 * @param nodeTypes Optional Node Types Filter
 * @returns Quarry Data
 */
export async function getQuarryNames(
  nodeTypes: MonsterNode[] = [
    MonsterNode.NQ1,
    MonsterNode.NQ2,
    MonsterNode.NQ3,
    MonsterNode.NQ4
  ]
): Promise<{ id: string; monster_name: string }[]> {
  const supabase = createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!userData.user) throw new Error('User Not Authenticated')

  // Fetch all three categories of quarries in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom quarries (available to all users)
    supabase
      .from('quarry')
      .select('id, monster_name')
      .eq('custom', false)
      .in('node', nodeTypes),
    // Custom quarries created by the user
    supabase
      .from('quarry')
      .select('id, monster_name')
      .eq('custom', true)
      .eq('user_id', userData.user.id)
      .in('node', nodeTypes),
    // Custom quarries shared with the user
    supabase
      .from('quarry_shared_user')
      .select('quarry_id, quarry:quarry_id!inner(id, monster_name, node)')
      .eq('user_id', userData.user.id)
      .in('quarry.node', nodeTypes)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Quarries: ${result.error.message}`)

  // Collect quarries from all sources, deduplicating by ID
  const quarryMap = new Map<string, { id: string; monster_name: string }>()

  for (const q of nonCustomResult.data ?? [])
    quarryMap.set(q.id, { id: q.id, monster_name: q.monster_name })

  for (const q of userCustomResult.data ?? [])
    quarryMap.set(q.id, { id: q.id, monster_name: q.monster_name })

  for (const row of sharedResult.data ?? []) {
    const q = row.quarry as unknown as {
      id: string
      monster_name: string
    }

    if (q) quarryMap.set(q.id, { id: q.id, monster_name: q.monster_name })
  }

  if (quarryMap.size === 0) throw new Error('Quarries(s) Not Found')

  return [...quarryMap.values()]
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
 * Get Quarry IDs
 *
 * Retrieves the IDs of nemeses. This depends on if they are custom nemeses
 * (requires the user ID if so).
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
