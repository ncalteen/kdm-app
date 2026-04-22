import { createClient } from '@/lib/supabase/client'

/**
 * Add Survivor Ability Impairment
 *
 * Adds an ability/impairment to a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param abilityImpairmentId Ability/Impairment ID
 * @returns Junction Table Row ID
 */
export async function addSurvivorAbilityImpairment(
  survivorId: string,
  abilityImpairmentId: string
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_ability_impairment')
    .insert({
      survivor_id: survivorId,
      ability_impairment_id: abilityImpairmentId
    })
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Survivor Ability/Impairment: ${error.message}`
    )

  return data.id
}

/**
 * Remove Survivor Ability Impairment
 *
 * Removes an ability/impairment from a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param abilityImpairmentId Ability/Impairment ID
 */
export async function removeSurvivorAbilityImpairment(
  survivorId: string,
  abilityImpairmentId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('survivor_ability_impairment')
    .delete()
    .eq('survivor_id', survivorId)
    .eq('ability_impairment_id', abilityImpairmentId)

  if (error)
    throw new Error(
      `Error Removing Survivor Ability/Impairment: ${error.message}`
    )
}
