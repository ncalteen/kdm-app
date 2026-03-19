import { createClient } from '@/lib/supabase/client'
import { HuntAIDeckDetail } from '@/lib/types'

/**
 * Get Hunt AI Decks
 *
 * Retrieves all AI decks assigned to a hunt.
 *
 * @param huntId Hunt ID
 * @returns Hunt AI Decks
 */
export async function getHuntAIDecks(
  huntId: string | null | undefined
): Promise<{ [key: string]: HuntAIDeckDetail }> {
  if (!huntId) throw new Error('Required: Hunt ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_ai_deck')
    .select(
      'id, basic_cards, advanced_cards, legendary_cards, overtone_cards, hunt_monster_id'
    )
    .eq('hunt_id', huntId)

  if (error) throw new Error(`Error Fetching Hunt AI Decks: ${error.message}`)

  const huntAIDeckMap: { [key: string]: HuntAIDeckDetail } = {}

  for (const m of data ?? []) huntAIDeckMap[m.id] = m

  return huntAIDeckMap
}
