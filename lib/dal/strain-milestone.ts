import { createClient } from '@/lib/supabase/client'
import { StrainMilestoneDetail } from '@/lib/types'

/**
 * Get Strain Milestones
 *
 * Retrieves all strain milestones available to the authenticated user:
 * - Built-in (non-custom) strain milestones
 * - Custom strain milestones owned by the user
 * - Custom strain milestones shared with the user
 *
 * @returns Strain Milestones
 */
export async function getStrainMilestones(): Promise<{
  [key: string]: StrainMilestoneDetail
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
      .from('strain_milestone')
      .select('id, strain_milestone_name')
      .eq('custom', false),
    supabase
      .from('strain_milestone')
      .select('id, strain_milestone_name')
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('strain_milestone_shared_user')
      .select('strain_milestone(id, strain_milestone_name)')
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(
        `Error Fetching Strain Milestones: ${result.error.message}`
      )

  const strainMilestoneMap: { [key: string]: StrainMilestoneDetail } = {}

  for (const s of nonCustomResult.data ?? []) strainMilestoneMap[s.id] = s
  for (const s of userCustomResult.data ?? []) strainMilestoneMap[s.id] = s
  for (const row of sharedResult.data ?? []) {
    const s = row.strain_milestone as unknown as StrainMilestoneDetail | null

    if (s) strainMilestoneMap[s.id] = s
  }

  return strainMilestoneMap
}
