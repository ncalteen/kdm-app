import { createClient } from '@/lib/supabase/client'
import { SettlementDetail, SettlementQuarryDetail } from '@/lib/types'

/**
 * Get Settlement Quarries
 *
 * Retrieves the quarries associated with a settlement.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Quarry Data
 */
export async function getSettlementQuarries(
  settlementId: string | null | undefined
): Promise<SettlementDetail['quarries']> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_quarry')
    .select(
      'collective_cognition_level_1, collective_cognition_level_2, collective_cognition_level_3, collective_cognition_prologue, id, quarry_id, unlocked, quarry(monster_name, node, prologue, instinct, basic_action, blind_spot, defeat_outcome, deployment_rules, victory_outcome)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Quarries: ${error.message}`)

  // Skip rows whose embedded catalog row is invisible under RLS (see EC-6 in
  // local/sharing-architecture.md — transitive visibility gap).
  return (
    data?.flatMap((item) => {
      const rawQuarry = item.quarry as unknown as
        | {
            monster_name: string
            node: string
            prologue: boolean
            instinct: string | null
            basic_action: string | null
            blind_spot: string | null
            defeat_outcome: string | null
            deployment_rules: string | null
            victory_outcome: string | null
          }
        | {
            monster_name: string
            node: string
            prologue: boolean
            instinct: string | null
            basic_action: string | null
            blind_spot: string | null
            defeat_outcome: string | null
            deployment_rules: string | null
            victory_outcome: string | null
          }[]
        | null

      const quarry = Array.isArray(rawQuarry)
        ? (rawQuarry[0] ?? null)
        : rawQuarry

      if (!quarry) return []

      return [
        {
          collective_cognition_level_1: item.collective_cognition_level_1,
          collective_cognition_level_2: item.collective_cognition_level_2,
          collective_cognition_level_3: item.collective_cognition_level_3,
          collective_cognition_prologue: item.collective_cognition_prologue,
          id: item.id,
          monster_name: quarry.monster_name,
          node: quarry.node,
          prologue: quarry.prologue,
          quarry_id: item.quarry_id,
          unlocked: item.unlocked,
          instinct: quarry.instinct,
          basic_action: quarry.basic_action,
          blind_spot: quarry.blind_spot,
          defeat_outcome: quarry.defeat_outcome,
          deployment_rules: quarry.deployment_rules,
          victory_outcome: quarry.victory_outcome
        }
      ]
    }) ?? []
  )
}

/**
 * Add Settlement Quarries
 *
 * Adds quarries to a settlement by their IDs. This is used when adding quarries
 * to a settlement during settlement creation or editing.
 *
 * @param quarryIds Quarry IDs
 * @param settlementId Settlement ID
 * @returns Inserted Settlement Quarry Rows
 */
export async function addSettlementQuarries(
  quarryIds: string[],
  settlementId: string | null | undefined
): Promise<{ id: string }[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (quarryIds.length === 0) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_quarry')
    .insert(
      quarryIds.map((quarryId) => ({
        collective_cognition_level_1: false,
        collective_cognition_level_2: [false, false],
        collective_cognition_level_3: [false, false, false],
        collective_cognition_prologue: false,
        quarry_id: quarryId,
        settlement_id: settlementId,
        unlocked: false
      }))
    )
    .select('id')

  if (error)
    throw new Error(`Error Adding Settlement Quarries: ${error.message}`)

  return data
}

/**
 * Remove Settlement Quarry
 *
 * @param settlementQuarryId Settlement Quarry ID
 */
export async function removeSettlementQuarry(
  settlementQuarryId: string | null | undefined
): Promise<void> {
  if (!settlementQuarryId) throw new Error('Required: Settlement Quarry ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_quarry')
    .delete()
    .eq('id', settlementQuarryId)

  if (error)
    throw new Error(`Error Removing Settlement Quarry: ${error.message}`)
}

/**
 * Update Settlement Quarry
 *
 * Updates the specified fields of a settlement quarry row.
 *
 * @param settlementQuarryId Settlement Quarry ID
 * @param updates Partial Settlement Quarry Updates
 */
export async function updateSettlementQuarry(
  settlementQuarryId: string | null | undefined,
  updates: Partial<SettlementQuarryDetail>
): Promise<void> {
  if (!settlementQuarryId) throw new Error('Required: Settlement Quarry ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_quarry')
    .update(updates)
    .eq('id', settlementQuarryId)

  if (error)
    throw new Error(`Error Updating Settlement Quarry: ${error.message}`)
}
