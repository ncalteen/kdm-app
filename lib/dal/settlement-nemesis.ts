import { createClient } from '@/lib/supabase/client'

/**
 * Settlement Nemesis Row with Joined Nemesis Details
 *
 * Represents a row from the settlement_nemesis table with the nemesis's display
 * name and monster node joined from the nemesis table, plus the available
 * levels joined from the nemesis_level table.
 */
export interface SettlementNemesisRow {
  /** Settlement Nemesis ID */
  id: string
  /** Nemesis ID (Foreign Key to nemesis Table) */
  nemesis_id: string
  /** Nemesis Monster Name (nemesis Table) */
  monster_name: string
  /** Nemesis Monster Node (nemesis Table) */
  node: string
  /** Whether the Nemesis is Unlocked for This Settlement */
  unlocked: boolean
  /** Level 1 Defeated */
  level_1_defeated: boolean
  /** Level 2 Defeated */
  level_2_defeated: boolean
  /** Level 3 Defeated */
  level_3_defeated: boolean
  /** Level 4 Defeated */
  level_4_defeated: boolean
  /** Available Level Numbers (from nemesis_level Table) */
  available_levels: number[]
}

/**
 * Add Nemeses to Settlement
 *
 * Links existing nemesis IDs to a settlement by inserting records into the
 * settlement_nemesis join table. Initial values for nemesis progress and
 * collective cognition victories are set to false.
 *
 * @param nemesisIds Nemesis IDs
 * @param settlementId Settlement ID
 */
export async function addNemesesToSettlement(
  nemesisIds: string[],
  settlementId: string | null | undefined
): Promise<void> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  if (nemesisIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_nemesis').insert(
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

  if (error)
    throw new Error(`Error Adding Nemeses to Settlement: ${error.message}`)
}

/**
 * Get Settlement Nemeses
 *
 * Fetches all nemeses linked to a settlement, joining the nemesis table to
 * include the monster name and node, and the nemesis_level table to determine
 * which levels are available for each nemesis.
 *
 * @param settlementId Settlement ID
 * @returns Settlement Nemesis Rows
 */
export async function getSettlementNemeses(
  settlementId: string | null | undefined
): Promise<SettlementNemesisRow[]> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('settlement_nemesis')
    .select(
      'id, nemesis_id, unlocked, level_1_defeated, level_2_defeated, level_3_defeated, level_4_defeated, nemesis:nemesis_id!inner(monster_name, node)'
    )
    .eq('settlement_id', settlementId)

  if (error)
    throw new Error(`Error Fetching Settlement Nemeses: ${error.message}`)

  if (!data || data.length === 0) return []

  // Fetch available levels for all nemeses in a single query.
  const nemesisIds = data.map((row) => row.nemesis_id)

  const { data: levelData, error: levelError } = await supabase
    .from('nemesis_level')
    .select('nemesis_id, level_number')
    .in('nemesis_id', nemesisIds)

  if (levelError)
    throw new Error(`Error Fetching Nemesis Levels: ${levelError.message}`)

  // Build a map of nemesis_id -> sorted set of available level numbers.
  const levelMap = new Map<string, number[]>()

  for (const row of levelData ?? []) {
    const levels = levelMap.get(row.nemesis_id) ?? []
    if (!levels.includes(row.level_number)) levels.push(row.level_number)
    levelMap.set(row.nemesis_id, levels)
  }

  for (const levels of levelMap.values()) levels.sort((a, b) => a - b)

  return data.map((row) => {
    const nemesis = row.nemesis as unknown as {
      monster_name: string
      node: string
    }

    return {
      id: row.id,
      nemesis_id: row.nemesis_id,
      monster_name: nemesis.monster_name,
      node: nemesis.node,
      unlocked: row.unlocked,
      level_1_defeated: row.level_1_defeated,
      level_2_defeated: row.level_2_defeated,
      level_3_defeated: row.level_3_defeated,
      level_4_defeated: row.level_4_defeated,
      available_levels: levelMap.get(row.nemesis_id) ?? []
    }
  })
}

/**
 * Add Nemesis to Settlement
 *
 * Adds a single nemesis to a settlement and returns the new
 * settlement_nemesis row with joined nemesis details and available levels.
 *
 * @param nemesisId Nemesis ID
 * @param settlementId Settlement ID
 * @returns Settlement Nemesis Row
 */
export async function addNemesisToSettlement(
  nemesisId: string | null | undefined,
  settlementId: string | null | undefined
): Promise<SettlementNemesisRow> {
  if (!nemesisId || !settlementId)
    throw new Error('Required: Nemesis ID, Settlement ID')

  const supabase = createClient()

  // Insert the settlement_nemesis row and fetch available levels in parallel.
  const [insertResult, levelsResult] = await Promise.all([
    supabase
      .from('settlement_nemesis')
      .insert({
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
      })
      .select(
        'id, nemesis_id, unlocked, level_1_defeated, level_2_defeated, level_3_defeated, level_4_defeated, nemesis:nemesis_id!inner(monster_name, node)'
      )
      .single(),
    supabase
      .from('nemesis_level')
      .select('level_number')
      .eq('nemesis_id', nemesisId)
  ])

  if (insertResult.error)
    throw new Error(
      `Error Adding Nemesis to Settlement: ${insertResult.error.message}`
    )

  if (levelsResult.error)
    throw new Error(
      `Error Fetching Nemesis Levels: ${levelsResult.error.message}`
    )

  const data = insertResult.data
  const nemesis = data.nemesis as unknown as {
    monster_name: string
    node: string
  }

  const availableLevels = [
    ...new Set((levelsResult.data ?? []).map((l) => l.level_number))
  ].sort((a, b) => a - b)

  return {
    id: data.id,
    nemesis_id: data.nemesis_id,
    monster_name: nemesis.monster_name,
    node: nemesis.node,
    unlocked: data.unlocked,
    level_1_defeated: data.level_1_defeated,
    level_2_defeated: data.level_2_defeated,
    level_3_defeated: data.level_3_defeated,
    level_4_defeated: data.level_4_defeated,
    available_levels: availableLevels
  }
}

/**
 * Remove Nemesis from Settlement
 *
 * Removes a settlement_nemesis record by its ID.
 *
 * @param settlementNemesisId Settlement Nemesis ID
 */
export async function removeNemesisFromSettlement(
  settlementNemesisId: string | null | undefined
): Promise<void> {
  if (!settlementNemesisId) throw new Error('Required: Settlement Nemesis ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_nemesis')
    .delete()
    .eq('id', settlementNemesisId)

  if (error)
    throw new Error(`Error Removing Nemesis from Settlement: ${error.message}`)
}

/**
 * Update Settlement Nemesis Unlocked
 *
 * Toggles the unlocked status of a nemesis for a settlement.
 *
 * @param settlementNemesisId Settlement Nemesis ID
 * @param unlocked Unlocked Status
 */
export async function updateSettlementNemesisUnlocked(
  settlementNemesisId: string | null | undefined,
  unlocked: boolean
): Promise<void> {
  if (!settlementNemesisId) throw new Error('Required: Settlement Nemesis ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_nemesis')
    .update({ unlocked })
    .eq('id', settlementNemesisId)

  if (error)
    throw new Error(
      `Error Updating Settlement Nemesis Unlocked: ${error.message}`
    )
}

/**
 * Settlement Nemesis Level Defeated Field
 *
 * Union of the defeated level column names in the settlement_nemesis table.
 */
export type NemesisDefeatedField =
  | 'level_1_defeated'
  | 'level_2_defeated'
  | 'level_3_defeated'
  | 'level_4_defeated'

/**
 * Update Settlement Nemesis Level Defeated
 *
 * Updates a single defeated-level boolean on a settlement_nemesis row.
 *
 * @param settlementNemesisId Settlement Nemesis ID
 * @param field Defeated Level Field
 * @param defeated Defeated Status
 */
export async function updateSettlementNemesisLevelDefeated(
  settlementNemesisId: string | null | undefined,
  field: NemesisDefeatedField,
  defeated: boolean
): Promise<void> {
  if (!settlementNemesisId) throw new Error('Required: Settlement Nemesis ID')

  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_nemesis')
    .update({ [field]: defeated })
    .eq('id', settlementNemesisId)

  if (error)
    throw new Error(`Error Updating Settlement Nemesis Level: ${error.message}`)
}
