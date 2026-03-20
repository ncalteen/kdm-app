import { TablesInsert } from '@/lib/database.types'
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

/**
 * Update Showdown AI Deck
 *
 * Updates a showdown AI deck's data.
 *
 * @param aiDeckId AI Deck ID
 * @param updateData Data to update
 * @returns Updated Showdown AI Deck Data
 */
export async function updateShowdownAIDeck(
  aiDeckId: string,
  updateData: Partial<ShowdownAIDeckDetail>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('showdown_ai_deck')
    .update(updateData)
    .eq('id', aiDeckId)

  if (error)
    throw new Error(`Error Updating Showdown AI Deck: ${error.message}`)
}

/**
 * Add Showdown AI Deck
 *
 * Adds a new AI deck to a showdown.
 *
 * @param showdownAIDeck Showdown AI Deck Data
 * @returns Inserted Showdown AI Deck
 */
export async function addShowdownAIDeck(
  showdownAIDeck: Omit<
    TablesInsert<'showdown_ai_deck'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<ShowdownAIDeckDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_ai_deck')
    .insert(showdownAIDeck)
    .select('id, basic_cards, advanced_cards, legendary_cards, overtone_cards')
    .single()

  if (error) throw new Error(`Error Adding Showdown AI Deck: ${error.message}`)

  return data
}
