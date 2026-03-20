import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Principles
 *
 * Gets the settlement principles for a given settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Principles
 */
export async function getSettlementPrinciples(
  settlementId: string | null | undefined
): Promise<SettlementDetail['principles']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_principle')
    .select(
      'id,  option_1_selected, option_2_selected, principle_id, principle(principle_name, option_1_name, option_2_name)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Principles: ${error.message}`)

  return (
    data?.map((item) => ({
      id: item.id,
      option_1_name: (
        item.principle as unknown as {
          principle_name: string
          option_1_name: string
          option_2_name: string
        }
      ).option_1_name,
      option_1_selected: item.option_1_selected,
      option_2_name: (
        item.principle as unknown as {
          principle_name: string
          option_1_name: string
          option_2_name: string
        }
      ).option_2_name,
      option_2_selected: item.option_2_selected,
      principle_id: item.principle_id,
      principle_name: (
        item.principle as unknown as {
          principle_name: string
          option_1_name: string
          option_2_name: string
        }
      ).principle_name
    })) ?? []
  )
}

/**
 * Add Settlement Principles
 *
 * Adds principles to a settlement by their IDs. This is used when adding
 * principles to a settlement during settlement creation or editing.
 *
 * @param principleIds Principle IDs
 * @param settlementId Settlement ID
 */
export async function addSettlementPrinciples(
  principleIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (principleIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_principle').insert(
    principleIds.map((principleId) => ({
      option_1_selected: false,
      option_2_selected: false,
      principle_id: principleId,
      settlement_id: settlementId
    }))
  )

  if (error)
    throw new Error(`Error Adding Settlement Principles: ${error.message}`)
}
