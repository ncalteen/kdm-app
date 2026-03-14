import { createClient } from '@/lib/supabase/client'

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
