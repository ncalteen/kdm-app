import { createClient } from '@/lib/supabase/client'

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
  settlementId: string
): Promise<void> {
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
