import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

/**
 * Get Settlement Nemeses
 *
 * Retrieves the nemeses associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Nemesis Data
 */
export async function getSettlementNemeses(
  settlementId: string | null | undefined
): Promise<SettlementDetail['nemeses']> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_nemesis')
    .select(
      'collective_cognition_level_1, collective_cognition_level_2, collective_cognition_level_3, id, level_1_defeated, level_2_defeated, level_3_defeated, level_4_defeated, nemesis_id, unlocked, nemesis(monster_name, node)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Nemeses: ${error.message}`)

  return (
    data?.map((item) => ({
      collective_cognition_level_1: item.collective_cognition_level_1,
      collective_cognition_level_2: item.collective_cognition_level_2,
      collective_cognition_level_3: item.collective_cognition_level_3,
      id: item.id,
      level_1_defeated: item.level_1_defeated,
      level_2_defeated: item.level_2_defeated,
      level_3_defeated: item.level_3_defeated,
      level_4_defeated: item.level_4_defeated,
      nemesis_id: item.nemesis_id,
      unlocked: item.unlocked,
      monster_name: (item.nemesis as unknown as { monster_name: string })
        .monster_name,
      node: (item.nemesis as unknown as { node: string }).node
    })) ?? []
  )
}

/**
 * Add Settlement Nemeses
 *
 * Adds nemeses to a settlement by their IDs. This is used when adding nemeses
 * to a settlement during settlement creation or editing.
 *
 * @param nemesisIds Nemesis IDs
 * @param settlementId Settlement ID
 */
export async function addSettlementNemeses(
  nemesisIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (nemesisIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_nemesis').insert(
    nemesisIds.map((nemesisId) => ({
      collective_cognition_level_1: false,
      collective_cognition_level_2: [false, false],
      collective_cognition_level_3: [false, false, false],
      level_1_defeated: false,
      level_2_defeated: false,
      level_3_defeated: false,
      level_4_defeated: false,
      nemesis_id: nemesisId,
      settlement_id: settlementId,
      unlocked: false
    }))
  )

  if (error)
    throw new Error(`Error Adding Settlement Nemeses: ${error.message}`)
}

/**
 * Remove Settlement Nemesis
 *
 * @param settlementNemesisId Settlement Nemesis ID
 */
export async function removeSettlementNemesis(
  settlementNemesisId: string | null | undefined
): Promise<void> {
  if (!settlementNemesisId) throw new Error('Required: Settlement Nemesis ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_nemesis')
    .delete()
    .eq('id', settlementNemesisId)

  if (error)
    throw new Error(`Error Removing Settlement Nemesis: ${error.message}`)
}
