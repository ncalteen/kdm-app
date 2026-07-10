import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteSurvivorFightingArtDetail } from '@/lib/types'

const VIGNETTE_SURVIVOR_FIGHTING_ART_SELECT = `
  id,
  vignette_survivor_id,
  fighting_art_id,
  fighting_art(*)
`

/**
 * Get Vignette Survivor Fighting Arts
 *
 * Retrieves all vignette survivor fighting art rows.
 *
 * @returns Vignette Survivor Fighting Arts
 */
export async function getVignetteSurvivorFightingArts(): Promise<
  VignetteSurvivorFightingArtDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor_fighting_art')
    .select(VIGNETTE_SURVIVOR_FIGHTING_ART_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Survivor Fighting Arts: ${error.message}`
    )

  return (data ?? []) as VignetteSurvivorFightingArtDetail[]
}

/**
 * Get Vignette Survivor Fighting Art
 *
 * Retrieves a single vignette survivor fighting art row by ID.
 *
 * @param id Vignette Survivor Fighting Art ID
 * @returns Vignette Survivor Fighting Art or null
 */
export async function getVignetteSurvivorFightingArt(
  id: string | null | undefined
): Promise<VignetteSurvivorFightingArtDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor_fighting_art')
    .select(VIGNETTE_SURVIVOR_FIGHTING_ART_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Survivor Fighting Art: ${error.message}`
    )

  return data as VignetteSurvivorFightingArtDetail | null
}

/**
 * Add Vignette Survivor Fighting Art
 *
 * Adds a new vignette survivor fighting art record to the database.
 *
 * @param vignetteSurvivorFightingArt Vignette Survivor Fighting Art Data
 * @returns Inserted Vignette Survivor Fighting Art
 */
export async function addVignetteSurvivorFightingArt(
  vignetteSurvivorFightingArt: Omit<
    TablesInsert<'vignette_survivor_fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteSurvivorFightingArtDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_survivor_fighting_art'> = {
    ...vignetteSurvivorFightingArt
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_survivor_fighting_art')
    .insert(insertData)
    .select(VIGNETTE_SURVIVOR_FIGHTING_ART_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Survivor Fighting Art: ${error.message}`
    )

  return data as VignetteSurvivorFightingArtDetail
}

/**
 * Update Vignette Survivor Fighting Art
 *
 * Updates an existing vignette survivor fighting art record.
 *
 * @param id Vignette Survivor Fighting Art ID
 * @param vignetteSurvivorFightingArt Vignette Survivor Fighting Art Data
 */
export async function updateVignetteSurvivorFightingArt(
  id: string,
  vignetteSurvivorFightingArt: Omit<
    TablesUpdate<'vignette_survivor_fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_survivor_fighting_art'> = {
    ...vignetteSurvivorFightingArt
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_survivor_fighting_art')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Survivor Fighting Art: ${error.message}`
    )
}

/**
 * Remove Vignette Survivor Fighting Art
 *
 * Deletes a vignette survivor fighting art record from the database.
 *
 * @param id Vignette Survivor Fighting Art ID
 */
export async function removeVignetteSurvivorFightingArt(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_survivor_fighting_art')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Survivor Fighting Art: ${error.message}`
    )
}
