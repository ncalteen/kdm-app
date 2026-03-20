import { Tables, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Survivor Secret Fighting Arts
 *
 * Retrieves all secret fighting arts for a survivor.
 *
 * @param survivorId Survivor ID
 * @returns Survivor Secret Fighting Arts
 */
export async function getSurvivorSecretFightingArts(
  survivorId: string | null | undefined
): Promise<
  Omit<
    Tables<'survivor_secret_fighting_art'>,
    'created_at' | 'updated_at' | 'survivor_id'
  >[]
> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_secret_fighting_art')
    .select('id, secret_fighting_art_id')
    .eq('survivor_id', survivorId)

  if (error)
    throw new Error(
      `Error Fetching Survivor Secret Fighting Arts: ${error.message}`
    )

  return data ?? []
}

/**
 * Add Survivor Secret Fighting Art
 *
 * Adds a secret fighting art to a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param secretFightingArtId Secret Fighting Art ID
 * @returns Junction Table Row ID
 */
export async function addSurvivorSecretFightingArt(
  survivorId: string,
  secretFightingArtId: string
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_secret_fighting_art')
    .insert({
      survivor_id: survivorId,
      secret_fighting_art_id: secretFightingArtId
    })
    .select('id')
    .single()

  if (error)
    throw new Error(
      `Error Adding Survivor Secret Fighting Art: ${error.message}`
    )

  return data.id
}

/**
 * Remove Survivor Secret Fighting Art
 *
 * Removes a secret fighting art from a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param secretFightingArtId Secret Fighting Art ID
 */
export async function removeSurvivorSecretFightingArt(
  survivorId: string,
  secretFightingArtId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('survivor_secret_fighting_art')
    .delete()
    .eq('survivor_id', survivorId)
    .eq('secret_fighting_art_id', secretFightingArtId)

  if (error)
    throw new Error(
      `Error Removing Survivor Secret Fighting Art: ${error.message}`
    )
}

/**
 * Update Survivor Secret Fighting Art
 *
 * Updates an existing survivor secret fighting art record.
 *
 * @param id Survivor Secret Fighting Art ID
 * @param survivorSecretFightingArt Survivor Secret Fighting Art Data
 */
export async function updateSurvivorSecretFightingArt(
  id: string,
  survivorSecretFightingArt: Omit<
    TablesUpdate<'survivor_secret_fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('survivor_secret_fighting_art')
    .update(survivorSecretFightingArt)
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Updating Survivor Secret Fighting Art: ${error.message}`
    )
}
