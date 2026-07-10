import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteSurvivorAbilityImpairmentDetail } from '@/lib/types'

const VIGNETTE_SURVIVOR_ABILITY_IMPAIRMENT_SELECT = `
  id,
  vignette_survivor_id,
  ability_impairment_id,
  ability_impairment(*)
`

/**
 * Get Vignette Survivor Ability/Impairments
 *
 * Retrieves all vignette survivor ability/impairment rows.
 *
 * @returns Vignette Survivor Ability/Impairments
 */
export async function getVignetteSurvivorAbilityImpairments(): Promise<
  VignetteSurvivorAbilityImpairmentDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor_ability_impairment')
    .select(VIGNETTE_SURVIVOR_ABILITY_IMPAIRMENT_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Survivor Ability/Impairments: ${error.message}`
    )

  return (data ?? []) as VignetteSurvivorAbilityImpairmentDetail[]
}

/**
 * Get Vignette Survivor Ability/Impairment
 *
 * Retrieves a single vignette survivor ability/impairment row by ID.
 *
 * @param id Vignette Survivor Ability/Impairment ID
 * @returns Vignette Survivor Ability/Impairment or null
 */
export async function getVignetteSurvivorAbilityImpairment(
  id: string | null | undefined
): Promise<VignetteSurvivorAbilityImpairmentDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor_ability_impairment')
    .select(VIGNETTE_SURVIVOR_ABILITY_IMPAIRMENT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Survivor Ability/Impairment: ${error.message}`
    )

  return data as VignetteSurvivorAbilityImpairmentDetail | null
}

/**
 * Add Vignette Survivor Ability/Impairment
 *
 * Adds a new vignette survivor ability/impairment record to the database.
 *
 * @param vignetteSurvivorAbilityImpairment Vignette Survivor Ability/Impairment Data
 * @returns Inserted Vignette Survivor Ability/Impairment
 */
export async function addVignetteSurvivorAbilityImpairment(
  vignetteSurvivorAbilityImpairment: Omit<
    TablesInsert<'vignette_survivor_ability_impairment'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteSurvivorAbilityImpairmentDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_survivor_ability_impairment'> = {
    ...vignetteSurvivorAbilityImpairment
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_survivor_ability_impairment')
    .insert(insertData)
    .select(VIGNETTE_SURVIVOR_ABILITY_IMPAIRMENT_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Survivor Ability/Impairment: ${error.message}`
    )

  return data as VignetteSurvivorAbilityImpairmentDetail
}

/**
 * Update Vignette Survivor Ability/Impairment
 *
 * Updates an existing vignette survivor ability/impairment record.
 *
 * @param id Vignette Survivor Ability/Impairment ID
 * @param vignetteSurvivorAbilityImpairment Vignette Survivor Ability/Impairment Data
 */
export async function updateVignetteSurvivorAbilityImpairment(
  id: string,
  vignetteSurvivorAbilityImpairment: Omit<
    TablesUpdate<'vignette_survivor_ability_impairment'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_survivor_ability_impairment'> = {
    ...vignetteSurvivorAbilityImpairment
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_survivor_ability_impairment')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Survivor Ability/Impairment: ${error.message}`
    )
}

/**
 * Remove Vignette Survivor Ability/Impairment
 *
 * Deletes a vignette survivor ability/impairment record from the database.
 *
 * @param id Vignette Survivor Ability/Impairment ID
 */
export async function removeVignetteSurvivorAbilityImpairment(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_survivor_ability_impairment')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Survivor Ability/Impairment: ${error.message}`
    )
}
