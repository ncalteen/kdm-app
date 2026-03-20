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
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase
      .from('resource')
      .select('id, resource_name, category, quarry_id, resource_types')
      .eq('custom', false),
    supabase
      .from('resource')
      .select('id, resource_name, category, quarry_id, resource_types')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('resource_shared_user')
      .select(
        'resource(id, resource_name, category, quarry_id, resource_types)'
      )
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Resources: ${result.error.message}`)

  const resourceMap: { [key: string]: ResourceDetail } = {}

  for (const r of nonCustomResult.data ?? []) resourceMap[r.id] = r
  for (const r of userCustomResult.data ?? []) resourceMap[r.id] = r
  for (const row of sharedResult.data ?? [])
    resourceMap[row.resource[0].id] = row.resource[0]

  return resourceMap
}
