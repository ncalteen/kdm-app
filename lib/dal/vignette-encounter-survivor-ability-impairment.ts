import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteEncounterSurvivorAbilityImpairmentDetail } from '@/lib/types'

const VIGNETTE_ENCOUNTER_SURVIVOR_ABILITY_IMPAIRMENT_SELECT = `
  id,
  vignette_encounter_survivor_id,
  ability_impairment_id,
  ability_impairment(*)
`

/**
 * Get Vignette Encounter Survivor Ability/Impairments
 *
 * Retrieves all vignette encounter survivor ability/impairment rows.
 *
 * @returns Vignette Encounter Survivor Ability/Impairments
 */
export async function getVignetteEncounterSurvivorAbilityImpairments(): Promise<
  VignetteEncounterSurvivorAbilityImpairmentDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_ability_impairment')
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_ABILITY_IMPAIRMENT_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivor Ability/Impairments: ${error.message}`
    )

  return (data ?? []) as VignetteEncounterSurvivorAbilityImpairmentDetail[]
}

/**
 * Get Vignette Encounter Survivor Ability/Impairment
 *
 * Retrieves a single vignette encounter survivor ability/impairment row by ID.
 *
 * @param id Vignette Encounter Survivor Ability/Impairment ID
 * @returns Vignette Encounter Survivor Ability/Impairment or null
 */
export async function getVignetteEncounterSurvivorAbilityImpairmentRow(
  id: string | null | undefined
): Promise<VignetteEncounterSurvivorAbilityImpairmentDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_ability_impairment')
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_ABILITY_IMPAIRMENT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivor Ability/Impairment: ${error.message}`
    )

  return data as VignetteEncounterSurvivorAbilityImpairmentDetail | null
}

/**
 * Add Vignette Encounter Survivor Ability/Impairment
 *
 * Adds a new vignette encounter survivor ability/impairment record to the database.
 *
 * @param vignetteEncounterSurvivorAbilityImpairmentRow Vignette Encounter Survivor Ability/Impairment Data
 * @returns Inserted Vignette Encounter Survivor Ability/Impairment
 */
export async function addVignetteEncounterSurvivorAbilityImpairmentRow(
  vignetteEncounterSurvivorAbilityImpairmentRow: Omit<
    TablesInsert<'vignette_encounter_survivor_ability_impairment'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteEncounterSurvivorAbilityImpairmentDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_encounter_survivor_ability_impairment'> =
    { ...vignetteEncounterSurvivorAbilityImpairmentRow }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_ability_impairment')
    .insert(insertData)
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_ABILITY_IMPAIRMENT_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Survivor Ability/Impairment: ${error.message}`
    )

  return data as VignetteEncounterSurvivorAbilityImpairmentDetail
}

/**
 * Update Vignette Encounter Survivor Ability/Impairment
 *
 * Updates an existing vignette encounter survivor ability/impairment record.
 *
 * @param id Vignette Encounter Survivor Ability/Impairment ID
 * @param vignetteEncounterSurvivorAbilityImpairmentRow Vignette Encounter Survivor Ability/Impairment Data
 */
export async function updateVignetteEncounterSurvivorAbilityImpairmentRow(
  id: string,
  vignetteEncounterSurvivorAbilityImpairmentRow: Omit<
    TablesUpdate<'vignette_encounter_survivor_ability_impairment'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_encounter_survivor_ability_impairment'> =
    { ...vignetteEncounterSurvivorAbilityImpairmentRow }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_encounter_survivor_ability_impairment')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Survivor Ability/Impairment: ${error.message}`
    )
}

/**
 * Remove Vignette Encounter Survivor Ability/Impairment
 *
 * Deletes a vignette encounter survivor ability/impairment record from the database.
 *
 * @param id Vignette Encounter Survivor Ability/Impairment ID
 */
export async function removeVignetteEncounterSurvivorAbilityImpairmentRow(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_survivor_ability_impairment')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Survivor Ability/Impairment: ${error.message}`
    )
}
