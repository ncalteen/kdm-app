import { createClient } from '@/lib/supabase/client'

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
  settlementId: string
): Promise<void> {
  if (quarryIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_quarry').insert(
    quarryIds.map((quarryId) => ({
      collective_cognition_level_1: false,
      collective_cognition_level_2: false,
      collective_cognition_level_3: false,
      collective_cognition_prologue: false,
      quarry_id: quarryId,
      settlement_id: settlementId,
      unlocked: false
    }))
  )

  if (error)
    throw new Error(`Error Adding Quarries to Settlement: ${error.message}`)
}
