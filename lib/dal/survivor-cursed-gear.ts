import { Tables } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Survivor Cursed Gear
 *
 * Retrieves all cursed gear items for a survivor.
 *
 * @param survivorId Survivor ID
 * @returns Survivor Cursed Gear
 */
export async function getSurvivorCursedGear(
  survivorId: string | null | undefined
): Promise<
  Omit<
    Tables<'survivor_cursed_gear'>,
    'created_at' | 'updated_at' | 'survivor_id'
  >[]
> {
  if (!survivorId) throw new Error('Required: Survivor ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_cursed_gear')
    .select('id, gear_id')
    .eq('survivor_id', survivorId)

  if (error)
    throw new Error(`Error Fetching Survivor Cursed Gear: ${error.message}`)

  return data ?? []
}

/**
 * Add Survivor Cursed Gear
 *
 * Adds a cursed gear item to a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param gearId Gear ID
 * @returns Junction Table Row ID
 */
export async function addSurvivorCursedGear(
  survivorId: string,
  gearId: string
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('survivor_cursed_gear')
    .insert({ survivor_id: survivorId, gear_id: gearId })
    .select('id')
    .single()

  if (error)
    throw new Error(`Error Adding Survivor Cursed Gear: ${error.message}`)

  return data.id
}

/**
 * Remove Survivor Cursed Gear
 *
 * Removes a cursed gear item from a survivor via the junction table.
 *
 * @param survivorId Survivor ID
 * @param gearId Gear ID
 */
export async function removeSurvivorCursedGear(
  survivorId: string,
  gearId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('survivor_cursed_gear')
    .delete()
    .eq('survivor_id', survivorId)
    .eq('gear_id', gearId)

  if (error)
    throw new Error(`Error Removing Survivor Cursed Gear: ${error.message}`)
}
