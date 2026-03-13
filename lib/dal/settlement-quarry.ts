import { createClient } from '@/lib/supabase/client'

/**
 * Settlement Quarry Row with Joined Quarry Details
 *
 * Represents a row from the settlement_quarry table with the quarry's display
 * name and monster node joined from the quarry table.
 */
export interface SettlementQuarryRow {
  /** Settlement Quarry ID */
  id: string
  /** Quarry ID (Foreign Key to quarry Table) */
  quarry_id: string
  /** Quarry Monster Name (quarry Table) */
  monster_name: string
  /** Quarry Monster Node (quarry Table) */
  node: string
  /** Whether the Quarry is Unlocked for This Settlement */
  unlocked: boolean
}

/**
 * Add Quarries to Settlement
 *
 * Links existing quarry IDs to a settlement by inserting records into the
 * settlement_quarry join table. Initial values for quarry progress and
 * collective cognition victories are set to false.
 *
 * @param quarryIds Quarry IDs
 * @param settlementId Settlement ID
 */
export async function addQuarriesToSettlement(
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
    throw new Error(`Error Adding Quarries to Settlement: ${error.message}`)
}

/**
 * Get Settlement Quarries
 *
 * Fetches all quarries linked to a settlement, joining the quarry table to
 * include the monster name and node for display.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Quarry Rows
 */
export async function getSettlementQuarries(
  settlementId: string | null | undefined
): Promise<SettlementQuarryRow[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_quarry')
    .select(
      'id, quarry_id, unlocked, quarry:quarry_id!inner(monster_name, node)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Quarries: ${error.message}`)

  return (data ?? []).map((row) => {
    const quarry = row.quarry as unknown as {
      monster_name: string
      node: string
    }

    return {
      id: row.id,
      quarry_id: row.quarry_id,
      monster_name: quarry.monster_name,
      node: quarry.node,
      unlocked: row.unlocked
    }
  })
}

/**
 * Add Quarry to Settlement
 *
 * Adds a single quarry to a settlement and returns the new settlement_quarry
 * row with joined quarry details.
 *
 * @param quarryId Quarry ID
 * @param settlementId Settlement ID
 * @returns Settlement Quarry Row
 */
export async function addQuarryToSettlement(
  quarryId: string | null | undefined,
  settlementId: string | null | undefined
): Promise<SettlementQuarryRow> {
  if (!quarryId || !settlementId)
    throw new Error('Required: Quarry ID, Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_quarry')
    .insert({
      collective_cognition_level_1: false,
      collective_cognition_level_2: [false, false],
      collective_cognition_level_3: [false, false, false],
      collective_cognition_prologue: false,
      quarry_id: quarryId,
      settlement_id: settlementId,
      unlocked: false
    })
    .select(
      'id, quarry_id, unlocked, quarry:quarry_id!inner(monster_name, node)'
    )
    .single()

  if (error)
    throw new Error(`Error Adding Quarry to Settlement: ${error.message}`)

  const quarry = data.quarry as unknown as {
    monster_name: string
    node: string
  }

  return {
    id: data.id,
    quarry_id: data.quarry_id,
    monster_name: quarry.monster_name,
    node: quarry.node,
    unlocked: data.unlocked
  }
}

/**
 * Remove Quarry from Settlement
 *
 * Removes a settlement_quarry record by its ID.
 *
 * @param settlementQuarryId Settlement Quarry ID
 */
export async function removeQuarryFromSettlement(
  settlementQuarryId: string | null | undefined
): Promise<void> {
  if (!settlementQuarryId) throw new Error('Required: Settlement Quarry ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_quarry')
    .delete()
    .eq('id', settlementQuarryId)

  if (error)
    throw new Error(`Error Removing Quarry from Settlement: ${error.message}`)
}

/**
 * Update Settlement Quarry Unlocked
 *
 * Toggles the unlocked status of a quarry for a settlement.
 *
 * @param settlementQuarryId Settlement Quarry ID
 * @param unlocked Unlocked Status
 */
export async function updateSettlementQuarryUnlocked(
  settlementQuarryId: string | null | undefined,
  unlocked: boolean
): Promise<void> {
  if (!settlementQuarryId) throw new Error('Required: Settlement Quarry ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_quarry')
    .update({ unlocked })
    .eq('id', settlementQuarryId)

  if (error)
    throw new Error(
      `Error Updating Settlement Quarry Unlocked: ${error.message}`
    )
}
