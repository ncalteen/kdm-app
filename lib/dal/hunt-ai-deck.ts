import { TablesInsert, TablesUpdate } from '@/lib/database.types'
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
    .select('id, basic_cards, advanced_cards, legendary_cards, overtone_cards')
    .eq('hunt_id', huntId)

  if (error) throw new Error(`Error Fetching Hunt AI Decks: ${error.message}`)

  const huntAIDeckMap: { [key: string]: HuntAIDeckDetail } = {}

  for (const m of data ?? []) huntAIDeckMap[m.id] = m

  return huntAIDeckMap
}

/**
 * Add Hunt AI Deck
 *
 * Adds a new AI deck to a hunt.
 *
 * @param huntAIDeck Hunt AI Deck Data
 * @returns Inserted Hunt AI Deck
 */
export async function addHuntAIDeck(
  huntAIDeck: Omit<
    TablesInsert<'hunt_ai_deck'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<HuntAIDeckDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_ai_deck')
    .insert(huntAIDeck)
    .select('id, basic_cards, advanced_cards, legendary_cards, overtone_cards')
    .single()

  if (error) throw new Error(`Error Adding Hunt AI Deck: ${error.message}`)

  return data
}

/**
 * Update Hunt AI Deck
 *
 * Updates an existing hunt AI deck record.
 *
 * @param id Hunt AI Deck ID
 * @param huntAIDeck Hunt AI Deck Data
 * @returns Updated Hunt AI Deck
 */
export async function updateHuntAIDeck(
  id: string,
  huntAIDeck: Omit<
    TablesUpdate<'hunt_ai_deck'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('hunt_ai_deck')
    .update(huntAIDeck)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Hunt AI Deck: ${error.message}`)
}

/**
 * Remove Hunt AI Deck
 *
 * Deletes a hunt AI deck record from the database.
 *
 * @param id Hunt AI Deck ID
 */
export async function removeHuntAIDeck(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('hunt_ai_deck').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Hunt AI Deck: ${error.message}`)
}
