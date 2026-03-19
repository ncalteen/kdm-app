import { createClient } from '@/lib/supabase/client'
import { ShowdownAIDeckDetail } from '@/lib/types'

/**
 * Get Showdown AI Decks
 *
 * Retrieves all AI decks assigned to a showdown.
 *
 * @param showdownId Showdown ID
 * @returns Showdown AI Decks
 */
export async function getShowdownAIDecks(
  showdownId: string | null | undefined
): Promise<{ [key: string]: ShowdownAIDeckDetail }> {
  if (!showdownId) throw new Error('Required: Showdown ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_ai_deck')
    .select('id, basic_cards, advanced_cards, legendary_cards, overtone_cards')
    .eq('showdown_id', showdownId)

  if (error)
    throw new Error(`Error Fetching Showdown AI Decks: ${error.message}`)

  const showdownAIDeckMap: { [key: string]: ShowdownAIDeckDetail } = {}

  for (const m of data ?? []) showdownAIDeckMap[m.id] = m

  return showdownAIDeckMap
}
