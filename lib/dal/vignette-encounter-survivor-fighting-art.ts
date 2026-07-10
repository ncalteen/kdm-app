import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteEncounterSurvivorFightingArtDetail } from '@/lib/types'

const VIGNETTE_ENCOUNTER_SURVIVOR_FIGHTING_ART_SELECT = `
  id,
  vignette_encounter_survivor_id,
  fighting_art_id,
  fighting_art(*)
`

/**
 * Get Vignette Encounter Survivor Fighting Arts
 *
 * Retrieves all vignette encounter survivor fighting art rows.
 *
 * @returns Vignette Encounter Survivor Fighting Arts
 */
export async function getVignetteEncounterSurvivorFightingArts(): Promise<
  VignetteEncounterSurvivorFightingArtDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_fighting_art')
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_FIGHTING_ART_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivor Fighting Arts: ${error.message}`
    )

  return (data ?? []) as VignetteEncounterSurvivorFightingArtDetail[]
}

/**
 * Get Vignette Encounter Survivor Fighting Art
 *
 * Retrieves a single vignette encounter survivor fighting art row by ID.
 *
 * @param id Vignette Encounter Survivor Fighting Art ID
 * @returns Vignette Encounter Survivor Fighting Art or null
 */
export async function getVignetteEncounterSurvivorFightingArtRow(
  id: string | null | undefined
): Promise<VignetteEncounterSurvivorFightingArtDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_fighting_art')
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_FIGHTING_ART_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivor Fighting Art: ${error.message}`
    )

  return data as VignetteEncounterSurvivorFightingArtDetail | null
}

/**
 * Add Vignette Encounter Survivor Fighting Art
 *
 * Adds a new vignette encounter survivor fighting art record to the database.
 *
 * @param vignetteEncounterSurvivorFightingArtRow Vignette Encounter Survivor Fighting Art Data
 * @returns Inserted Vignette Encounter Survivor Fighting Art
 */
export async function addVignetteEncounterSurvivorFightingArtRow(
  vignetteEncounterSurvivorFightingArtRow: Omit<
    TablesInsert<'vignette_encounter_survivor_fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteEncounterSurvivorFightingArtDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_encounter_survivor_fighting_art'> = {
    ...vignetteEncounterSurvivorFightingArtRow
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_encounter_survivor_fighting_art')
    .insert(insertData)
    .select(VIGNETTE_ENCOUNTER_SURVIVOR_FIGHTING_ART_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Encounter Survivor Fighting Art: ${error.message}`
    )

  return data as VignetteEncounterSurvivorFightingArtDetail
}

/**
 * Update Vignette Encounter Survivor Fighting Art
 *
 * Updates an existing vignette encounter survivor fighting art record.
 *
 * @param id Vignette Encounter Survivor Fighting Art ID
 * @param vignetteEncounterSurvivorFightingArtRow Vignette Encounter Survivor Fighting Art Data
 */
export async function updateVignetteEncounterSurvivorFightingArtRow(
  id: string,
  vignetteEncounterSurvivorFightingArtRow: Omit<
    TablesUpdate<'vignette_encounter_survivor_fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_encounter_survivor_fighting_art'> = {
    ...vignetteEncounterSurvivorFightingArtRow
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_encounter_survivor_fighting_art')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Survivor Fighting Art: ${error.message}`
    )
}

/**
 * Remove Vignette Encounter Survivor Fighting Art
 *
 * Deletes a vignette encounter survivor fighting art record from the database.
 *
 * @param id Vignette Encounter Survivor Fighting Art ID
 */
export async function removeVignetteEncounterSurvivorFightingArtRow(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_survivor_fighting_art')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter Survivor Fighting Art: ${error.message}`
    )
}
