import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { HuntSurvivorDetail } from '@/lib/types'

/**
 * Get Hunt Survivors
 *
 * Retrieves all survivors assigned to a hunt.
 *
 * @param huntId Hunt ID
 * @returns Hunt Survivors
 */
export async function getHuntSurvivors(
  huntId: string | null | undefined
): Promise<{ [key: string]: HuntSurvivorDetail }> {
  if (!huntId) throw new Error('Required: Hunt ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_survivor')
    .select(
      'id, accuracy_tokens, evasion_tokens, hunt_id, insanity_tokens, luck_tokens, movement_tokens, notes, scout, settlement_id, speed_tokens, strength_tokens, survival_tokens, survivor_id'
    )
    .eq('hunt_id', huntId)

  if (error) throw new Error(`Error Fetching Hunt Survivors: ${error.message}`)
  if (!data) throw new Error('Hunt Survivors Not Found')

  const huntSurvivorMap: { [key: string]: HuntSurvivorDetail } = {}

  for (const s of data ?? []) huntSurvivorMap[s.id] = s

  return huntSurvivorMap
}

/**
 * Add Hunt Survivor
 *
 * Adds a new survivor to a hunt.
 *
 * @param huntSurvivor Hunt Survivor Data
 * @returns Inserted Hunt Survivor ID
 */
export async function addHuntSurvivor(
  huntSurvivor: Omit<
    TablesInsert<'hunt_survivor'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_survivor')
    .insert(huntSurvivor)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Hunt Survivor: ${error.message}`)

  return data.id
}

/**
 * Update Hunt Survivor
 *
 * Updates an existing hunt survivor record.
 *
 * @param id Hunt Survivor ID
 * @param huntSurvivor Hunt Survivor Data
 */
export async function updateHuntSurvivor(
  id: string,
  huntSurvivor: Omit<
    TablesUpdate<'hunt_survivor'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('hunt_survivor')
    .update(huntSurvivor)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Hunt Survivor: ${error.message}`)
}
