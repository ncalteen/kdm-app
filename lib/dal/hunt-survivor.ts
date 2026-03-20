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
 * Get Survival Tokens
 *
 * @param survivorId Survivor ID
 * @returns Survival Tokens
 */
export async function getHuntSurvivorSurvivalTokens(
  survivorId: string
): Promise<number | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_survivor')
    .select('survival_tokens')
    .eq('survivor_id', survivorId)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Hunt Survivor Survival Tokens: ${error.message}`
    )

  return data?.survival_tokens ?? null
}

/**
 * Update Survival Tokens
 *
 * @param survivorId Survivor ID
 * @param survivalTokens New Survival Tokens Value
 */
export async function updateHuntSurvivorSurvivalTokens(
  survivorId: string,
  survivalTokens: number
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('hunt_survivor')
    .update({ survival_tokens: survivalTokens })
    .eq('survivor_id', survivorId)

  if (error)
    throw new Error(
      `Error Updating Hunt Survivor Survival Tokens: ${error.message}`
    )
}
