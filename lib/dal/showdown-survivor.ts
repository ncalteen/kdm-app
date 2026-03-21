import { TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { ShowdownSurvivorDetail } from '@/lib/types'

/**
 * Get Showdown Survivors
 *
 * Retrieves all survivors assigned to a showdown.
 *
 * @param showdownId Showdown ID
 * @returns Showdown Survivors
 */
export async function getShowdownSurvivors(
  showdownId: string | null | undefined
): Promise<{ [key: string]: ShowdownSurvivorDetail } | null> {
  if (!showdownId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_survivor')
    .select(
      'id, accuracy_tokens, activation_used, bleeding_tokens, block_tokens, deflect_tokens, evasion_tokens, insanity_tokens, knocked_down, luck_tokens, movement_tokens, movement_used, notes, priority_target, scout, settlement_id, showdown_id, speed_tokens, strength_tokens, survival_tokens, survivor_id'
    )
    .eq('showdown_id', showdownId)

  if (error)
    throw new Error(`Error Fetching Showdown Survivors: ${error.message}`)
  if (!data) return null

  const showdownSurvivorMap: { [key: string]: ShowdownSurvivorDetail } = {}

  for (const s of data ?? []) showdownSurvivorMap[s.id] = s

  return showdownSurvivorMap
}

/**
 * Update Showdown Survivor
 *
 * Updates a showdown survivor's data.
 *
 * @param survivorId Survivor ID
 * @param updateData Data to update
 * @returns Updated Showdown Survivor Data
 */
export async function updateShowdownSurvivor(
  survivorId: string,
  updateData: Partial<ShowdownSurvivorDetail>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('showdown_survivor')
    .update(updateData)
    .eq('id', survivorId)

  if (error)
    throw new Error(`Error Updating Showdown Survivor: ${error.message}`)
}

/**
 * Add Showdown Survivor
 *
 * Adds a new survivor to a showdown.
 *
 * @param showdownSurvivor Showdown Survivor Data
 * @returns Inserted Showdown Survivor ID
 */
export async function addShowdownSurvivor(
  showdownSurvivor: Omit<
    TablesInsert<'showdown_survivor'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_survivor')
    .insert(showdownSurvivor)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Showdown Survivor: ${error.message}`)

  return data.id
}

/**
 * Remove Showdown Survivor
 *
 * Deletes a showdown survivor record from the database.
 *
 * @param id Showdown Survivor ID
 */
export async function removeShowdownSurvivor(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('showdown_survivor')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Showdown Survivor: ${error.message}`)
}
