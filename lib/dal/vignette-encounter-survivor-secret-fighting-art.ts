import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteEncounterSurvivorSecretFightingArtDetail } from '@/lib/types'

const VIGNETTE_ENCOUNTER_SURVIVOR_SECRET_FIGHTING_ART_SELECT = `
  id,
  vignette_encounter_survivor_id,
  secret_fighting_art_id,
  secret_fighting_art(*)
`

/**
 * Get Vignette Encounter Survivor Secret Fighting Arts
 *
 * Retrieves all vignette encounter survivor secret fighting art rows.
 *
 * @returns Vignette Encounter Survivor Secret Fighting Arts
 */
export async function getVignetteEncounterSurvivorSecretFightingArts(): Promise<
  VignetteEncounterSurvivorSecretFightingArtDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_secret_fighting_art')
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_SECRET_FIGHTING_ART_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivor Secret Fighting Arts: ${error.message}`
    )

  return (data ?? []) as VignetteEncounterSurvivorSecretFightingArtDetail[]
}

/**
 * Get Vignette Encounter Survivor Secret Fighting Art
 *
 * Retrieves a single vignette encounter survivor secret fighting art row by ID.
 *
 * @param id Vignette Encounter Survivor Secret Fighting Art ID
 * @returns Vignette Encounter Survivor Secret Fighting Art or null
 */
export async function getVignetteEncounterSurvivorSecretFightingArtRow(
  id: string | null | undefined
): Promise<VignetteEncounterSurvivorSecretFightingArtDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_secret_fighting_art')
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_SECRET_FIGHTING_ART_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivor Secret Fighting Art: ${error.message}`
    )

  return data as VignetteEncounterSurvivorSecretFightingArtDetail | null
}

/**
 * Add Vignette Encounter Survivor Secret Fighting Art
 *
 * Adds a new vignette encounter survivor secret fighting art record to the database.
 *
 * @param vignetteEncounterSurvivorSecretFightingArtRow Vignette Encounter Survivor Secret Fighting Art Data
 * @returns Inserted Vignette Encounter Survivor Secret Fighting Art
 */
export async function addVignetteEncounterSurvivorSecretFightingArtRow(
  vignetteEncounterSurvivorSecretFightingArtRow: Omit<
    TablesInsert<'vignette_encounter_survivor_secret_fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteEncounterSurvivorSecretFightingArtDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_encounter_survivor_secret_fighting_art'> =
    { ...vignetteEncounterSurvivorSecretFightingArtRow }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_secret_fighting_art')
    .insert(insertData)
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_SECRET_FIGHTING_ART_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Survivor Secret Fighting Art: ${error.message}`
    )

  return data as VignetteEncounterSurvivorSecretFightingArtDetail
}

/**
 * Update Vignette Encounter Survivor Secret Fighting Art
 *
 * Updates an existing vignette encounter survivor secret fighting art record.
 *
 * @param id Vignette Encounter Survivor Secret Fighting Art ID
 * @param vignetteEncounterSurvivorSecretFightingArtRow Vignette Encounter Survivor Secret Fighting Art Data
 */
export async function updateVignetteEncounterSurvivorSecretFightingArtRow(
  id: string,
  vignetteEncounterSurvivorSecretFightingArtRow: Omit<
    TablesUpdate<'vignette_encounter_survivor_secret_fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_encounter_survivor_secret_fighting_art'> =
    { ...vignetteEncounterSurvivorSecretFightingArtRow }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_encounter_survivor_secret_fighting_art')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Survivor Secret Fighting Art: ${error.message}`
    )
}

/**
 * Remove Vignette Encounter Survivor Secret Fighting Art
 *
 * Deletes a vignette encounter survivor secret fighting art record from the database.
 *
 * @param id Vignette Encounter Survivor Secret Fighting Art ID
 */
export async function removeVignetteEncounterSurvivorSecretFightingArtRow(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_survivor_secret_fighting_art')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Survivor Secret Fighting Art: ${error.message}`
    )
}
