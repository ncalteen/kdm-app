import { CampaignType, DatabaseCampaignType } from '@/lib/enums'
import { createClient } from '@/lib/supabase/client'

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

/**
 * Get Principle Data by Settlement ID
 *
 * Retrieves the names and options of principles associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Principle Data
 */
export async function getPrincipleData(settlementId: string): Promise<
  {
    principle_name: string
    option_1_name: string
    option_1_selected: boolean
    option_2_name: string
    option_2_selected: boolean
  }[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_principle')
    .select(
      'option_1_selected, option_2_selected, principle(option_1_name, option_2_name, principle_name)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Principles: ${error.message}`)

  const principleData =
    data?.map((row) => {
      const principle = Array.isArray(row.principle)
        ? row.principle[0]
        : row.principle

      return {
        principle_name: principle.principle_name,
        option_1_name: principle.option_1_name,
        option_1_selected: row.option_1_selected,
        option_2_name: principle.option_2_name,
        option_2_selected: row.option_2_selected
      }
    }) ?? []

  return principleData
}
