import { createClient } from '@/lib/supabase/client'

/**
 * Set Wanderer Abilities/Impairments
 *
 * Reconciles the `wanderer_ability_impairment` junction for a wanderer so
 * it contains exactly the provided ability/impairment IDs. Existing rows
 * are deleted and the new set is inserted in a single round-trip pair.
 *
 * @param wandererId Wanderer ID
 * @param abilityImpairmentIds Ability/Impairment IDs to link
 */
export async function setWandererAbilityImpairments(
  wandererId: string,
  abilityImpairmentIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('wanderer_ability_impairment')
    .delete()
    .eq('wanderer_id', wandererId)

  if (deleteError)
    throw new Error(
      `Error Clearing Wanderer Abilities/Impairments: ${deleteError.message}`
    )

  if (abilityImpairmentIds.length === 0) return

  const { error: insertError } = await supabase
    .from('wanderer_ability_impairment')
    .insert(
      abilityImpairmentIds.map((abilityImpairmentId) => ({
        wanderer_id: wandererId,
        ability_impairment_id: abilityImpairmentId
      }))
    )

  if (insertError)
    throw new Error(
      `Error Setting Wanderer Abilities/Impairments: ${insertError.message}`
    )
}
