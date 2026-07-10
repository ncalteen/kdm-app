import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteSurvivorSecretFightingArtDetail } from '@/lib/types'

const VIGNETTE_SURVIVOR_SECRET_FIGHTING_ART_SELECT = `
  id,
  vignette_survivor_id,
  secret_fighting_art_id,
  secret_fighting_art(*)
`

/**
 * Get Vignette Survivor Secret Fighting Arts
 *
 * Retrieves all vignette survivor secret fighting art rows.
 *
 * @returns Vignette Survivor Secret Fighting Arts
 */
export async function getVignetteSurvivorSecretFightingArts(): Promise<
  VignetteSurvivorSecretFightingArtDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor_secret_fighting_art')
    .select(VIGNETTE_SURVIVOR_SECRET_FIGHTING_ART_SELECT)

  if (error)
    throw new Error(
      `Error Fetching Vignette Survivor Secret Fighting Arts: ${error.message}`
    )

  return (data ?? []) as VignetteSurvivorSecretFightingArtDetail[]
}

/**
 * Get Vignette Survivor Secret Fighting Art
 *
 * Retrieves a single vignette survivor secret fighting art row by ID.
 *
 * @param id Vignette Survivor Secret Fighting Art ID
 * @returns Vignette Survivor Secret Fighting Art or null
 */
export async function getVignetteSurvivorSecretFightingArt(
  id: string | null | undefined
): Promise<VignetteSurvivorSecretFightingArtDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_survivor_secret_fighting_art')
    .select(VIGNETTE_SURVIVOR_SECRET_FIGHTING_ART_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Vignette Survivor Secret Fighting Art: ${error.message}`
    )

  return data as VignetteSurvivorSecretFightingArtDetail | null
}

/**
 * Add Vignette Survivor Secret Fighting Art
 *
 * Adds a new vignette survivor secret fighting art record to the database.
 *
 * @param vignetteSurvivorSecretFightingArt Vignette Survivor Secret Fighting Art Data
 * @returns Inserted Vignette Survivor Secret Fighting Art
 */
export async function addVignetteSurvivorSecretFightingArt(
  vignetteSurvivorSecretFightingArt: Omit<
    TablesInsert<'vignette_survivor_secret_fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteSurvivorSecretFightingArtDetail> {
  const supabase = createClient()
  const insertData: TablesInsert<'vignette_survivor_secret_fighting_art'> = {
    ...vignetteSurvivorSecretFightingArt
  }

  delete insertData.id

  const { data, error } = await supabase
    .from('vignette_survivor_secret_fighting_art')
    .insert(insertData)
    .select(VIGNETTE_SURVIVOR_SECRET_FIGHTING_ART_SELECT)
    .single()

  if (error)
    throw new Error(
      `Error Adding Vignette Survivor Secret Fighting Art: ${error.message}`
    )

  return data as VignetteSurvivorSecretFightingArtDetail
}

/**
 * Update Vignette Survivor Secret Fighting Art
 *
 * Updates an existing vignette survivor secret fighting art record.
 *
 * @param id Vignette Survivor Secret Fighting Art ID
 * @param vignetteSurvivorSecretFightingArt Vignette Survivor Secret Fighting Art Data
 */
export async function updateVignetteSurvivorSecretFightingArt(
  id: string,
  vignetteSurvivorSecretFightingArt: Omit<
    TablesUpdate<'vignette_survivor_secret_fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const updateData: TablesUpdate<'vignette_survivor_secret_fighting_art'> = {
    ...vignetteSurvivorSecretFightingArt
  }

  delete updateData.id

  const { error } = await supabase
    .from('vignette_survivor_secret_fighting_art')
    .update(updateData)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Vignette Survivor Secret Fighting Art: ${error.message}`
    )
}

/**
 * Remove Vignette Survivor Secret Fighting Art
 *
 * Deletes a vignette survivor secret fighting art record from the database.
 *
 * @param id Vignette Survivor Secret Fighting Art ID
 */
export async function removeVignetteSurvivorSecretFightingArt(
  id: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_survivor_secret_fighting_art')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Survivor Secret Fighting Art: ${error.message}`
    )
}
