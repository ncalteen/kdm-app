import { Tables, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Survivor Fighting Arts
 *
 * Retrieves all fighting arts for a survivor.
 *
 * @param survivorId Survivor ID
 * @returns Survivor Fighting Arts
 */
export async function getSurvivorFightingArts(
  survivorId: string | null | undefined
): Promise<
  Omit<
    Tables<'survivor_fighting_art'>,
    'created_at' | 'updated_at' | 'survivor_id'
  >[]
> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_fighting_art')
    .select('id, fighting_art_id')
    .eq('survivor_id', survivorId)

  if (error)
    throw new Error(`Error Fetching Survivor Fighting Arts: ${error.message}`)

  return data ?? []
}

/**
 * Add Survivor Fighting Art
 *
 * Adds a fighting art to a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param fightingArtId Fighting Art ID
 * @returns Junction Table Row ID
 */
export async function addSurvivorFightingArt(
  survivorId: string,
  fightingArtId: string
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_fighting_art')
    .insert({ survivor_id: survivorId, fighting_art_id: fightingArtId })
    .select('id')
    .single()

  if (error)
    throw new Error(`Error Adding Survivor Fighting Art: ${error.message}`)

  return data.id
}

/**
 * Remove Survivor Fighting Art
 *
 * Removes a fighting art from a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param fightingArtId Fighting Art ID
 */
export async function removeSurvivorFightingArt(
  survivorId: string,
  fightingArtId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('survivor_fighting_art')
    .delete()
    .eq('survivor_id', survivorId)
    .eq('fighting_art_id', fightingArtId)

  if (error)
    throw new Error(`Error Removing Survivor Fighting Art: ${error.message}`)
}

/**
 * Update Survivor Fighting Art
 *
 * Updates an existing survivor fighting art record.
 *
 * @param id Survivor Fighting Art ID
 * @param survivorFightingArt Survivor Fighting Art Data
 */
export async function updateSurvivorFightingArt(
  id: string,
  survivorFightingArt: Omit<
    TablesUpdate<'survivor_fighting_art'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('survivor_fighting_art')
    .update(survivorFightingArt)
    .eq('id', id)

  if (error)
    throw new Error(`Error Updating Survivor Fighting Art: ${error.message}`)
}
