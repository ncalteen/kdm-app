import { createClient } from '@/lib/supabase/client'
import { SettlementDetail } from '@/lib/types'

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
  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_quarry')
    .select(
      'collective_cognition_level_1, collective_cognition_level_2, collective_cognition_level_3, collective_cognition_prologue, id, quarry_id, unlocked, quarry(monster_name, node)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Quarries: ${error.message}`)

  return (
    data?.map((item) => ({
      collective_cognition_level_1: item.collective_cognition_level_1,
      collective_cognition_level_2: item.collective_cognition_level_2,
      collective_cognition_level_3: item.collective_cognition_level_3,
      collective_cognition_prologue: item.collective_cognition_prologue,
      id: item.id,
      monster_name: (item.quarry as unknown as { monster_name: string })
        .monster_name,
      node: (item.quarry as unknown as { node: string }).node,
      quarry_id: item.quarry_id,
      unlocked: item.unlocked
    })) ?? []
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
 */
export async function addSettlementQuarries(
  quarryIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')
  if (quarryIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_quarry').insert(
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

  if (error)
    throw new Error(`Error Adding Settlement Quarries: ${error.message}`)
}
