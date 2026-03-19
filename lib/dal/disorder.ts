import { createClient } from '@/lib/supabase/client'
import { DisorderDetail } from '@/lib/types'

/**
 * Get Disorders
 *
 * Retrieves all disorders available to the authenticated user:
 * - Built-in (non-custom) disorders
 * - Custom disorders owned by the user
 * - Custom disorders shared with the user
 *
 * @returns Disorders
 */
export async function getDisorders(): Promise<{
  [key: string]: DisorderDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Fetch all three categories of disorders in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    supabase.from('disorder').select('id, disorder_name').eq('custom', false),
    supabase
      .from('disorder')
      .select('id, disorder_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('disorder_shared_user')
      .select('disorder(id, disorder_name)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Disorders: ${result.error.message}`)

  const disorderMap: { [key: string]: DisorderDetail } = {}

  for (const d of nonCustomResult.data ?? []) disorderMap[d.id] = d
  for (const d of userCustomResult.data ?? []) disorderMap[d.id] = d
  for (const row of sharedResult.data ?? []) {
    const d = row.disorder as unknown as DisorderDetail | null

    if (d) disorderMap[d.id] = d
  }

  return disorderMap
}
