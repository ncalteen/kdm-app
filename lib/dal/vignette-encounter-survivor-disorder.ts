import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteEncounterSurvivorDisorderDetail } from '@/lib/types'

const VIGNETTE_ENCOUNTER_SURVIVOR_DISORDER_SELECT = `
  id,
  vignette_encounter_survivor_id,
  disorder_id,
  disorder(*)
`

/**
 * Get Vignette Encounter Survivor Disorders
 *
 * Retrieves all vignette encounter survivor disorder rows.
 *
 * @returns Vignette Encounter Survivor Disorders
 */
export async function getVignetteEncounterSurvivorDisorders(): Promise<
  VignetteEncounterSurvivorDisorderDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_disorder')
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_DISORDER_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivor Disorders: ${error.message}`
    )

  return (data ?? []) as VignetteEncounterSurvivorDisorderDetail[]
}

/**
 * Get Vignette Encounter Survivor Disorder
 *
 * Retrieves a single vignette encounter survivor disorder row by ID.
 *
 * @param id Vignette Encounter Survivor Disorder ID
 * @returns Vignette Encounter Survivor Disorder or null
 */
export async function getVignetteEncounterSurvivorDisorderRow(
  id: string | null | undefined
): Promise<VignetteEncounterSurvivorDisorderDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_disorder')
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_DISORDER_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivor Disorder: ${error.message}`
    )

  return data as VignetteEncounterSurvivorDisorderDetail | null
}

/**
 * Add Vignette Encounter Survivor Disorder
 *
 * Adds a new vignette encounter survivor disorder record to the database.
 *
 * @param vignetteEncounterSurvivorDisorderRow Vignette Encounter Survivor Disorder Data
 * @returns Inserted Vignette Encounter Survivor Disorder
 */
export async function addVignetteEncounterSurvivorDisorderRow(
  vignetteEncounterSurvivorDisorderRow: Omit<
    TablesInsert<'vignette_encounter_survivor_disorder'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteEncounterSurvivorDisorderDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_encounter_survivor_disorder'> = {
    ...vignetteEncounterSurvivorDisorderRow
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_disorder')
    .insert(insertData)
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_DISORDER_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Survivor Disorder: ${error.message}`
    )

  return data as VignetteEncounterSurvivorDisorderDetail
}

/**
 * Update Vignette Encounter Survivor Disorder
 *
 * Updates an existing vignette encounter survivor disorder record.
 *
 * @param id Vignette Encounter Survivor Disorder ID
 * @param vignetteEncounterSurvivorDisorderRow Vignette Encounter Survivor Disorder Data
 */
export async function updateVignetteEncounterSurvivorDisorderRow(
  id: string,
  vignetteEncounterSurvivorDisorderRow: Omit<
    TablesUpdate<'vignette_encounter_survivor_disorder'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_encounter_survivor_disorder'> = {
    ...vignetteEncounterSurvivorDisorderRow
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_encounter_survivor_disorder')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Survivor Disorder: ${error.message}`
    )
}

/**
 * Remove Vignette Encounter Survivor Disorder
 *
 * Deletes a vignette encounter survivor disorder record from the database.
 *
 * @param id Vignette Encounter Survivor Disorder ID
 */
export async function removeVignetteEncounterSurvivorDisorderRow(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_survivor_disorder')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Survivor Disorder: ${error.message}`
    )
}
