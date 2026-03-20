import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Survivor Disorders
 *
 * Retrieves all disorders for a survivor.
 *
 * @param survivorId Survivor ID
 * @returns Survivor Disorders
 */
export async function getSurvivorDisorders(
  survivorId: string | null | undefined
): Promise<
  Omit<
    Tables<'survivor_disorder'>,
    'created_at' | 'updated_at' | 'survivor_id'
  >[]
> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_disorder')
    .select('id, disorder_id')
    .eq('survivor_id', survivorId)

  if (error)
    throw new Error(`Error Fetching Survivor Disorders: ${error.message}`)

  return data ?? []
}

/**
 * Add Survivor Disorder
 *
 * Adds a disorder to a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param disorderId Disorder ID
 * @returns Junction Table Row ID
 */
export async function addSurvivorDisorder(
  survivorId: string,
  disorderId: string
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_disorder')
    .insert({ survivor_id: survivorId, disorder_id: disorderId })
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Survivor Disorder: ${error.message}`)

  return data.id
}

/**
 * Remove Survivor Disorder
 *
 * Removes a disorder from a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param disorderId Disorder ID
 */
export async function removeSurvivorDisorder(
  survivorId: string,
  disorderId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('survivor_disorder')
    .delete()
    .eq('survivor_id', survivorId)
    .eq('disorder_id', disorderId)

  if (error)
    throw new Error(`Error Removing Survivor Disorder: ${error.message}`)
}
