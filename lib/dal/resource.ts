import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { ResourceDetail } from '@/lib/types'

/**
 * Get Resources
 *
 * Retrieves all resources available to the authenticated user:
 * - Built-in (non-custom) resources
 * - Custom resources owned by the user
 * - Custom resources shared with the user
 *
 * @returns Resources
 */
export async function getResources(): Promise<{
  [key: string]: ResourceDetail
}> {
  const userId = await getUserId()
  const supabase = createClient()

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase
      .from('resource')
      .select(
        'id, custom, resource_name, category, quarry_id, resource_types, pattern_id, rules, quarry(monster_name, node)'
      )
      .eq('custom', false),
    supabase
      .from('resource')
      .select(
        'id, custom, resource_name, category, quarry_id, resource_types, pattern_id, rules, quarry(monster_name, node)'
      )
      .eq('custom', true)
      .eq('user_id', userId),
    supabase
      .from('resource_shared_user')
      .select(
        `resource(${'id, custom, resource_name, category, quarry_id, resource_types, pattern_id, rules, quarry(monster_name, node)'})`
      )
      .eq('shared_user_id', userId)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Resources: ${result.error.message}`)

  const resourceMap: { [key: string]: ResourceDetail } = {}

  const toDetail = (r: Record<string, unknown>): ResourceDetail => {
    const raw = r.quarry
    // Supabase may return quarry as a single object or an array depending on
    // the relationship direction. Handle both shapes.
    const quarry = raw
      ? Array.isArray(raw)
        ? (raw as { monster_name: string; node: string }[])[0]
        : (raw as { monster_name: string; node: string })
      : null
    return {
      id: r.id as string,
      category: r.category as ResourceDetail['category'],
      custom: r.custom as boolean,
      nemesis_id: null,
      pattern_id: (r.pattern_id as string | null) ?? null,
      quarry_id: r.quarry_id as string | null,
      quarry_monster_name: quarry?.monster_name ?? null,
      quarry_node: quarry?.node ?? null,
      resource_name: r.resource_name as string,
      resource_types: r.resource_types as ResourceDetail['resource_types'],
      rules: (r.rules as string | null) ?? null
    }
  }

  for (const r of nonCustomResult.data ?? []) resourceMap[r.id] = toDetail(r)
  for (const r of userCustomResult.data ?? []) resourceMap[r.id] = toDetail(r)
  for (const row of sharedResult.data ?? [])
    resourceMap[row.resource[0].id] = toDetail(row.resource[0])

  return resourceMap
}

/**
 * Add Resource
 *
 * Adds a new resource record to the database.
 *
 * @param resource Resource Data
 * @returns Inserted Resource
 */
export async function addResource(
  resource: Omit<
    TablesInsert<'resource'>,
    'id' | 'created_at' | 'updated_at' | 'user_id'
  >
): Promise<ResourceDetail> {
  const userId = await getUserIdOrNull()
  const supabase = createClient()

  if (resource.custom && !userId) throw new Error('Not Authenticated')

  const { data, error } = await supabase
    .from('resource')
    .insert({
      ...resource,
      ...(resource.custom ? { user_id: userId! } : {})
    })
    .select(
      'id, custom, resource_name, category, quarry_id, resource_types, pattern_id, rules, quarry(monster_name, node)'
    )
    .single()

  if (error) throw new Error(`Error Adding Resource: ${error.message}`)

  const quarry = data.quarry
    ? Array.isArray(data.quarry)
      ? (data.quarry as { monster_name: string; node: string }[])[0]
      : (data.quarry as { monster_name: string; node: string })
    : null

  return {
    id: data.id,
    category: data.category,
    custom: data.custom,
    nemesis_id: null,
    pattern_id: data.pattern_id ?? null,
    quarry_id: data.quarry_id,
    quarry_monster_name: quarry?.monster_name ?? null,
    quarry_node: quarry?.node ?? null,
    resource_name: data.resource_name,
    resource_types: data.resource_types,
    rules: data.rules ?? null
  }
}

/**
 * Update Resource
 *
 * Updates an existing resource record in the database.
 *
 * @param id Resource ID
 * @param resource Resource Data
 * @returns Updated Resource
 */
export async function updateResource(
  id: string,
  resource: Omit<TablesUpdate<'resource'>, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('resource')
    .update(resource)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Resource: ${error.message}`)
}

/**
 * Remove Resource
 *
 * Deletes a resource record from the database.
 *
 * @param id Resource ID
 */
export async function removeResource(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('resource').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Resource: ${error.message}`)
}
