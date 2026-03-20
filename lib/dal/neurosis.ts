import { createClient } from '@/lib/supabase/client'
import { NeurosisDetail } from '@/lib/types'

/**
 * Get Neuroses
 *
 * Retrieves all neuroses available to the authenticated user:
 *
 * - Built-in (non-custom) neuroses
 * - Custom neuroses owned by the user
 * - Custom neuroses shared with the user
 *
 * @returns Neuroses
 */
export async function getNeuroses(): Promise<{
  [key: string]: NeurosisDetail
}> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) throw new Error(`Error Fetching User: ${userError.message}`)
  if (!user) throw new Error('Not Authenticated')

  // Fetch all three categories of neuroses in parallel
  const [nonCustomResult, userCustomResult, sharedResult] = await Promise.all([
    // Non-custom neuroses (available to all users)
    supabase
      .from('neurosis')
      .select('id, neurosis_name, philosophy_id')
      .eq('custom', false),
    // Custom neuroses created by the user
    supabase
      .from('neurosis')
      .select('id, neurosis_name, philosophy_id')
      .eq('custom', true)
      .eq('user_id', user.id),
    // Custom neuroses shared with the user
    supabase
      .from('neurosis_shared_user')
      .select('neurosis(id, neurosis_name, philosophy_id)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Neuroses: ${result.error.message}`)

  // Collect neuroses from all sources, deduplicating by ID
  const neurosisMap: { [key: string]: NeurosisDetail } = {}

  for (const n of nonCustomResult.data ?? []) neurosisMap[n.id] = n
  for (const n of userCustomResult.data ?? []) neurosisMap[n.id] = n
  for (const row of sharedResult.data ?? [])
    neurosisMap[row.neurosis[0].id] = row.neurosis[0]

  return neurosisMap
}
