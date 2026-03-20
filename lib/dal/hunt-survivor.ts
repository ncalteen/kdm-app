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
