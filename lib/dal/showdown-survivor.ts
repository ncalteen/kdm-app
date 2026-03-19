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
): Promise<{ [key: string]: ShowdownSurvivorDetail }> {
  if (!showdownId) throw new Error('Required: Showdown ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_survivor')
    .select(
      'id, accuracy_tokens, activation_used, bleeding_tokens, block_tokens, deflect_tokens, evasion_tokens, insanity_tokens, knocked_down, luck_tokens, movement_tokens, movement_used, notes, priority_target, scout, settlement_id, showdown_id, speed_tokens, strength_tokens, survival_tokens, survivor_id'
    )
    .eq('showdown_id', showdownId)

  if (error)
    throw new Error(`Error Fetching Showdown Survivors: ${error.message}`)

  const showdownSurvivorMap: { [key: string]: ShowdownSurvivorDetail } = {}

  for (const s of data ?? []) showdownSurvivorMap[s.id] = s

  return showdownSurvivorMap
}

////////////////////////////////////////////////////////////
// TODO: Consolidate the following into appropviate get/set functions for the whole showdown survivor
////////////////////////////////////////////////////////////

/**
 * Get Survival Tokens
 *
 * @param survivorId Survivor ID
 * @returns Survival Tokens
 */
export async function getShowdownSurvivorSurvivalTokens(
  survivorId: string
): Promise<number | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_survivor')
    .select('survival_tokens')
    .eq('survivor_id', survivorId)
    .maybeSingle()

  if (error)
    throw new Error(
      `Error Fetching Showdown Survivor Survival Tokens: ${error.message}`
    )

  return data?.survival_tokens ?? null
}

/**
 * Update Survival Tokens
 *
 * @param survivorId Survivor ID
 * @param survivalTokens New Survival Tokens Value
 */
export async function updateShowdownSurvivorSurvivalTokens(
  survivorId: string,
  survivalTokens: number
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('showdown_survivor')
    .update({ survival_tokens: survivalTokens })
    .eq('survivor_id', survivorId)

  if (error)
    throw new Error(
      `Error Updating Showdown Survivor Survival Tokens: ${error.message}`
    )
}
