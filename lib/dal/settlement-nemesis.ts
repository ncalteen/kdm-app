import {
  getSettlementMemberUsernames,
  resolveSettlementAuthorship,
  type SettlementMemberProfile
} from '@/lib/dal/settlement-shared-user'
import { createClient } from '@/lib/supabase/client'
import { SettlementDetail, SettlementNemesisDetail } from '@/lib/types'

type EmbeddedNemesis = {
  custom: boolean
  user_id: string | null
  monster_name: string
  node: string
  instinct: string | null
  basic_action: string | null
  blind_spot: string | null
  defeat_outcome: string | null
  deployment_rules: string | null
  victory_outcome: string | null
}

type RawEmbeddedNemesis = EmbeddedNemesis | EmbeddedNemesis[] | null

/**
 * Get Settlement Nemeses
 *
 * Retrieves the nemeses associated with a settlement. Each returned row
 * carries `author_username` (null for built-ins; the catalog author's
 * username for customs) — see `getSettlementKnowledges` for the canonical
 * resolution pattern.
 *
 * @param settlementId Settlement ID
 * @param prefetchedMemberProfiles Optional pre-fetched map of IDs to usernames
 * @returns Settlement Nemesis Data
 */
export async function getSettlementNemeses(
  settlementId: string | null | undefined,
  prefetchedMemberProfiles?: Promise<Map<string, SettlementMemberProfile>>
): Promise<SettlementDetail['nemeses']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const [{ data, error }, memberProfiles] = await Promise.all([
    supabase
      .from('settlement_nemesis')
      .select(
        'collective_cognition_level_1, collective_cognition_level_2, collective_cognition_level_3, id, level_1_defeated, level_2_defeated, level_3_defeated, level_4_defeated, nemesis_id, unlocked, nemesis(custom, user_id, monster_name, node, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome)'
      )
      .eq('settlement_id', settlementId),
    prefetchedMemberProfiles ?? getSettlementMemberUsernames(settlementId)
  ])

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

  // Skip rows whose embedded catalog row is invisible under RLS (see EC-6 in
  // local/sharing-architecture.md — transitive visibility gap).
  return data.flatMap((item) => {
    const rawNemesis = item.nemesis as unknown as RawEmbeddedNemesis

    const nemesis = Array.isArray(rawNemesis)
      ? (rawNemesis[0] ?? null)
      : rawNemesis

    if (!nemesis) return []

    return [
      {
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
        monster_name: nemesis.monster_name,
        node: nemesis.node,
        instinct: nemesis.instinct,
        basic_action: nemesis.basic_action,
        blind_spot: nemesis.blind_spot,
        defeat_outcome: nemesis.defeat_outcome,
        deployment_rules: nemesis.deployment_rules,
        victory_outcome: nemesis.victory_outcome,
        custom: nemesis.custom,
        ...resolveSettlementAuthorship(
          { custom: nemesis.custom, user_id: nemesis.user_id },
          memberProfiles
        )
      }
    ]
  })
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

  const [{ data, error }, memberProfiles] = await Promise.all([
    supabase
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
        'collective_cognition_level_1, collective_cognition_level_2, collective_cognition_level_3, id, level_1_defeated, level_2_defeated, level_3_defeated, level_4_defeated, nemesis_id, unlocked, nemesis(custom, user_id, monster_name, node, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome)'
      ),
    getSettlementMemberUsernames(settlementId)
  ])

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

  return data.flatMap((item) => {
    const rawNemesis = item.nemesis as unknown as RawEmbeddedNemesis

    const nemesis = Array.isArray(rawNemesis)
      ? (rawNemesis[0] ?? null)
      : rawNemesis

    if (!nemesis) return []

    return [
      {
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
        monster_name: nemesis.monster_name,
        node: nemesis.node,
        instinct: nemesis.instinct,
        basic_action: nemesis.basic_action,
        blind_spot: nemesis.blind_spot,
        defeat_outcome: nemesis.defeat_outcome,
        deployment_rules: nemesis.deployment_rules,
        victory_outcome: nemesis.victory_outcome,
        custom: nemesis.custom,
        ...resolveSettlementAuthorship(
          { custom: nemesis.custom, user_id: nemesis.user_id },
          memberProfiles
        )
      }
    ]
  })
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
