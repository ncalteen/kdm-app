import { createClient } from '@/lib/supabase/client'

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
