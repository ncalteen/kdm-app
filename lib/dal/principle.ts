import { CampaignType, DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'
import { PrincipleDetail } from '@/lib/types'

/**
 * Get Principles
 *
 * Retrieves all principles available to the authenticated user:
 * - Built-in (non-custom) principles
 * - Custom principles owned by the user
 * - Custom principles shared with the user
 *
 * @returns Principles
 */
export async function getPrinciples(): Promise<{
  [key: string]: PrincipleDetail
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
      .from('principle')
      .select(
        'id, principle_name, option_1_name, option_2_name, campaign_types'
      )
      .eq('custom', false),
    supabase
      .from('principle')
      .select(
        'id, principle_name, option_1_name, option_2_name, campaign_types'
      )
      .eq('custom', true)
      .eq('user_id', user.id),
    supabase
      .from('principle_shared_user')
      .select(
        'principle(id, principle_name, option_1_name, option_2_name, campaign_types)'
      )
      .eq('shared_user_id', user.id)
  ])

  for (const result of [nonCustomResult, userCustomResult, sharedResult])
    if (result.error)
      throw new Error(`Error Fetching Principles: ${result.error.message}`)

  const principleMap: { [key: string]: PrincipleDetail } = {}

  for (const p of nonCustomResult.data ?? []) principleMap[p.id] = p
  for (const p of userCustomResult.data ?? []) principleMap[p.id] = p
  for (const row of sharedResult.data ?? [])
    principleMap[row.principle[0].id] = row.principle[0]

  return principleMap
}

/**
 * Get Principle IDs
 *
 * Retrieves the IDs of principles. This depends on if they are custom
 * principles (requires the user ID if so).
 *
 * @param principleNames Principle Names
 * @param campaignType Campaign Type
 * @param custom Custom
 * @param userId User ID
 * @returns Principle IDs
 */
export async function getPrincipleIds(
  principleNames: string[],
  campaignType: CampaignType,
  custom: boolean,
  userId?: string
): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = userId
    ? await supabase
        .from('principle')
        .select('id')
        .in('principle_name', principleNames)
        .contains('campaign_types', [DatabaseCampaignType[campaignType]])
        .eq('custom', custom)
        .eq('user_id', userId)
    : await supabase
        .from('principle')
        .select('id')
        .in('principle_name', principleNames)
        .contains('campaign_types', [DatabaseCampaignType[campaignType]])
        .eq('custom', custom)

  if (error) throw new Error(`Error Fetching Principle ID(s): ${error.message}`)

  if (!data) throw new Error('Principle(s) Not Found')

  return data.map((principle) => principle.id)
}
