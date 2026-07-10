import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { VignetteEncounterAIDeckDetail } from '@/lib/types'

/**
 * Get Vignette Encounter AI Decks
 *
 * Retrieves all AI decks assigned to a vignette encounter.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @returns Vignette Encounter AI Decks
 */
export async function getVignetteEncounterAIDecks(
  vignetteEncounterId: string | null | undefined
): Promise<{ [key: string]: VignetteEncounterAIDeckDetail } | null> {
  if (!vignetteEncounterId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_ai_deck')
    .select(
      'id, vignette_encounter_id, basic_cards, advanced_cards, legendary_cards, overtone_cards'
    )
    .eq('vignette_encounter_id', vignetteEncounterId)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter AI Decks: ${error.message}`
    )

  const vignetteEncounterAIDeckMap: {
    [key: string]: VignetteEncounterAIDeckDetail
  } = {}

  for (const m of data ?? []) vignetteEncounterAIDeckMap[m.id] = m

  return vignetteEncounterAIDeckMap
}

/**
 * Update Vignette Encounter AI Deck
 *
 * Updates a vignette encounter AI deck's data.
 *
 * @param aiDeckId AI Deck ID
 * @param updateData Data to update
 */
export async function updateVignetteEncounterAIDeck(
  aiDeckId: string,
  updateData: Omit<
    TablesUpdate<'vignette_encounter_ai_deck'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_ai_deck')
    .update(updateData)
    .eq('id', aiDeckId)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter AI Deck: ${error.message}`
    )
}

/**
 * Add Vignette Encounter AI Deck
 *
 * Adds a new AI deck to a vignette encounter.
 *
 * @param vignetteEncounterAIDeck Vignette Encounter AI Deck Data
 * @returns Inserted Vignette Encounter AI Deck
 */
export async function addVignetteEncounterAIDeck(
  vignetteEncounterAIDeck: Omit<
    TablesInsert<'vignette_encounter_ai_deck'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<VignetteEncounterAIDeckDetail> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_ai_deck')
    .insert(vignetteEncounterAIDeck)
    .select(
      'id, vignette_encounter_id, basic_cards, advanced_cards, legendary_cards, overtone_cards'
    )
    .single()

  if (error)
    throw new Error(`Error Adding Vignette Encounter AI Deck: ${error.message}`)

  return data
}

/**
 * Remove Vignette Encounter AI Deck
 *
 * Deletes a vignette encounter AI deck record from the database.
 *
 * @param id Showdown AI Deck ID
 */
export async function removeVignetteEncounterAIDeck(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('vignette_encounter_ai_deck')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(
      `Error Removing Vignette Encounter AI Deck: ${error.message}`
    )
}
