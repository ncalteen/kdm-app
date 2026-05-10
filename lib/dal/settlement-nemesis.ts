import { createClient } from '@/lib/supabase/client'
import { SettlementDetail, SettlementNemesisDetail } from '@/lib/types'

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
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_nemesis')
    .select(
      'collective_cognition_level_1, collective_cognition_level_2, collective_cognition_level_3, id, level_1_defeated, level_2_defeated, level_3_defeated, level_4_defeated, nemesis_id, unlocked, nemesis(custom, monster_name, node, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Nemeses: ${error.message}`)

  if (!data?.length) return []

  // Fetch available levels for each nemesis in parallel.
  const nemesisIds = [...new Set(data.map((item) => item.nemesis_id))]

  const { data: levelData, error: levelError } = await supabase
    .from('nemesis_level')
    .select('nemesis_id, level_number')
    .in('nemesis_id', nemesisIds)

  if (levelError)
    throw new Error(`Error Fetching Nemesis Levels: ${levelError.message}`)

  // Group level numbers by nemesis_id.
  const levelsByNemesisId = new Map<string, number[]>()
  for (const row of levelData ?? []) {
    const levels = levelsByNemesisId.get(row.nemesis_id) ?? []
    levels.push(row.level_number)
    levelsByNemesisId.set(row.nemesis_id, levels)
  }

  return data.map((item) => ({
    available_levels: (levelsByNemesisId.get(item.nemesis_id) ?? []).sort(
      (a, b) => a - b
    ),
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
    node: (item.nemesis as unknown as { node: string }).node,
    instinct: (item.nemesis as unknown as { instinct: string | null }).instinct,
    basic_action: (item.nemesis as unknown as { basic_action: string | null })
      .basic_action,
    blind_spot: (item.nemesis as unknown as { blind_spot: string | null })
      .blind_spot,
    defeat_outcome: (
      item.nemesis as unknown as { defeat_outcome: string | null }
    ).defeat_outcome,
    deployment_rules: (
      item.nemesis as unknown as { deployment_rules: string | null }
    ).deployment_rules,
    victory_outcome: (
      item.nemesis as unknown as { victory_outcome: string | null }
    ).victory_outcome,
    custom: !!(item.nemesis as unknown as { custom: boolean }).custom
  }))
}

/**
 * Add Settlement Nemeses
 *
 * Adds nemeses to a settlement by their IDs. This is used when adding nemeses
 * to a settlement during settlement creation or editing.
 *
 * @param nemesisIds Nemesis IDs
 * @param settlementId Settlement ID
 * @returns Inserted Settlement Nemesis Records
 */
export async function addSettlementNemeses(
  nemesisIds: string[],
  settlementId: string | null | undefined
): Promise<SettlementDetail['nemeses']> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (nemesisIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_nemesis')
    .insert(
      nemesisIds.map((nemesisId) => ({
        collective_cognition_level_1: false,
        collective_cognition_level_2: false,
        collective_cognition_level_3: false,
        level_1_defeated: false,
        level_2_defeated: false,
        level_3_defeated: false,
        level_4_defeated: false,
        nemesis_id: nemesisId,
        settlement_id: settlementId,
        unlocked: false
      }))
    )
    .select(
      'collective_cognition_level_1, collective_cognition_level_2, collective_cognition_level_3, id, level_1_defeated, level_2_defeated, level_3_defeated, level_4_defeated, nemesis_id, unlocked, nemesis(custom, monster_name, node, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome)'
    )

  if (error)
    throw new Error(`Error Adding Settlement Nemeses: ${error.message}`)

  if (!data?.length) return []

  // Fetch available levels for the inserted nemeses.
  const { data: levelData, error: levelError } = await supabase
    .from('nemesis_level')
    .select('nemesis_id, level_number')
    .in('nemesis_id', nemesisIds)

  if (levelError)
    throw new Error(`Error Fetching Nemesis Levels: ${levelError.message}`)

  const levelsByNemesisId = new Map<string, number[]>()
  for (const row of levelData ?? []) {
    const levels = levelsByNemesisId.get(row.nemesis_id) ?? []
    levels.push(row.level_number)
    levelsByNemesisId.set(row.nemesis_id, levels)
  }

  return data.map((item) => ({
    available_levels: (levelsByNemesisId.get(item.nemesis_id) ?? []).sort(
      (a, b) => a - b
    ),
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
    node: (item.nemesis as unknown as { node: string }).node,
    instinct: (item.nemesis as unknown as { instinct: string | null }).instinct,
    basic_action: (item.nemesis as unknown as { basic_action: string | null })
      .basic_action,
    blind_spot: (item.nemesis as unknown as { blind_spot: string | null })
      .blind_spot,
    defeat_outcome: (
      item.nemesis as unknown as { defeat_outcome: string | null }
    ).defeat_outcome,
    deployment_rules: (
      item.nemesis as unknown as { deployment_rules: string | null }
    ).deployment_rules,
    victory_outcome: (
      item.nemesis as unknown as { victory_outcome: string | null }
    ).victory_outcome,
    custom: !!(item.nemesis as unknown as { custom: boolean }).custom
  }))
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

/**
 * Update Settlement Nemesis
 *
 * Updates the specified fields of a settlement nemesis row.
 *
 * @param settlementNemesisId Settlement Nemesis ID
 * @param updates Partial Settlement Nemesis Updates
 */
export async function updateSettlementNemesis(
  settlementNemesisId: string | null | undefined,
  updates: Partial<SettlementNemesisDetail>
): Promise<void> {
  if (!settlementNemesisId) throw new Error('Required: Settlement Nemesis ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_nemesis')
    .update(updates)
    .eq('id', settlementNemesisId)

  if (error)
    throw new Error(`Error Updating Settlement Nemesis: ${error.message}`)
}
