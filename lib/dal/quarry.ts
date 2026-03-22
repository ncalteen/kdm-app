import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { MonsterNode } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { QuarryDetail } from '@/lib/types'

/**
 * Get Quarries
 *
 * Retrieves the quarries a user has access to. This includes:
 *
 * - Non-custom quarries
 * - Custom quarries created by the user
 * - Custom quarries shared with the user (via the quarry_shared_user table)
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
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Fetch all three categories of quarries in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom quarries (available to all users)
    supabase
      .from('quarry')
      .select(
        'id, alternate_id, monster_name, multi_monster, node, prologue, vignette_id'
      )
      .eq('custom', false)
      .in('node', nodeTypes),
    // Custom quarries created by the user
    supabase
      .from('quarry')
      .select(
        'id, alternate_id, monster_name, multi_monster, node, prologue, vignette_id'
      )
      .eq('custom', true)
      .eq('user_id', user.id)
      .in('node', nodeTypes),
    // Custom quarries shared with the user
    supabase
      .from('quarry_shared_user')
      .select(
        'quarry(id, alternate_id, monster_name, multi_monster, node, prologue, vignette_id)'
      )
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Quarries: ${result.error.message}`)

  // Collect quarries from all sources, deduplicating by ID
  const quarryMap: { [key: string]: QuarryDetail } = {}

  for (const q of nonCustomResult.data ?? []) quarryMap[q.id] = q
  for (const q of userCustomResult.data ?? []) quarryMap[q.id] = q
  for (const row of sharedResult.data ?? [])
    quarryMap[row.quarry[0].id] = row.quarry[0]

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
      'id, alternate_id, monster_name, multi_monster, node, prologue, vignette_id'
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
  quarry: Omit<TablesInsert<'quarry'>, 'id' | 'created_at' | 'updated_at'>
): Promise<QuarryDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry')
    .insert(quarry)
    .select(
      'id, alternate_id, monster_name, multi_monster, node, prologue, vignette_id'
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
  const supabase = createClient()

  const { error } = await supabase.from('quarry').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Quarry: ${error.message}`)
}
