import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { SurvivorAbilityImpairmentDetail } from '@/lib/types'

const SURVIVOR_ABILITY_IMPAIRMENT_SELECT = `
  id,
  ability_impairment_id,
  settlement_id,
  survivor_id,
  ability_impairment(
    id,
    custom,
    ability_impairment_name,
    rules
  )
`

/**
 * Get Survivor Ability/Impairments
 *
 * Retrieves all abilities/impairments for a survivor.
 *
 * @param survivorId Survivor ID
 * @returns Survivor Ability/Impairments
 */
export async function getSurvivorAbilityImpairments(
  survivorId: string | null | undefined
): Promise<SurvivorAbilityImpairmentDetail[]> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_ability_impairment')
    .select(SURVIVOR_ABILITY_IMPAIRMENT_SELECT)
    .eq('survivor_id', survivorId)

  if (error)
    throw new Error(
      `Error Fetching Survivor Ability/Impairments: ${error.message}`
    )

  return (data ?? []) as SurvivorAbilityImpairmentDetail[]
}

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

/**
 * Update Survivor Ability/Impairment
 *
 * Updates an existing survivor ability/impairment record.
 *
 * @param id Survivor Ability/Impairment ID
 * @param survivorAbilityImpairment Survivor Ability/Impairment Data
 */
export async function updateSurvivorAbilityImpairment(
  id: string,
  survivorAbilityImpairment: Omit<
    TablesUpdate<'survivor_ability_impairment'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'survivor_ability_impairment'> = {
    ...survivorAbilityImpairment
  }

  delete updateData.id

  const { error } = await supabase
    .from('survivor_ability_impairment')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Survivor Ability/Impairment: ${error.message}`
    )
}
