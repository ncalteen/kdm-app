import { TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { ShowdownMonsterDetail } from '@/lib/types'

/**
 * Get Showdown Monsters
 *
 * Retrieves all monsters assigned to a showdown.
 *
 * @param showdownId Showdown ID
 * @returns Showdown Monsters
 */
export async function getShowdownMonsters(
  showdownId: string | null | undefined
): Promise<{ [key: string]: ShowdownMonsterDetail }> {
  if (!showdownId) throw new Error('Required: Showdown ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_monster')
    .select(
      'id, accuracy, accuracy_tokens, ai_card_drawn, ai_deck_id, ai_deck_remaining, damage, damage_tokens, evasion, evasion_tokens, knocked_down, luck, luck_tokens, monster_name, moods, movement, movement_tokens, notes, settlement_id, showdown_id, speed, speed_tokens, strength, strength_tokens, toughness, traits, wounds, showdown_ai_deck(id, advanced_cards, basic_cards, legendary_cards, overtone_cards)'
    )
    .eq('showdown_id', showdownId)

  if (error)
    throw new Error(`Error Fetching Showdown Monsters: ${error.message}`)
  if (!data) throw new Error('Showdown Monsters Not Found')

  const showdownMonsterMap: { [key: string]: ShowdownMonsterDetail } = {}

  for (const m of data ?? []) {
    const aiDeck =
      m.showdown_ai_deck as unknown as ShowdownMonsterDetail['ai_deck']
    showdownMonsterMap[m.id] = { ...m, ai_deck: aiDeck ?? null }
  }

  return showdownMonsterMap
}

/**
 * Update Showdown Monster
 *
 * Updates a showdown monster's data.
 *
 * @param monsterId Monster ID
 * @param updateData Data to update
 * @returns Updated Showdown Monster Data
 */
export async function updateShowdownMonster(
  monsterId: string,
  updateData: Partial<ShowdownMonsterDetail>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('showdown_monster')
    .update(updateData)
    .eq('id', monsterId)

  if (error)
    throw new Error(`Error Updating Showdown Monster: ${error.message}`)
}

/**
 * Add Showdown Monster
 *
 * Adds a new monster to a showdown.
 *
 * @param showdownMonster Showdown Monster Data
 * @returns Inserted Showdown Monster ID
 */
export async function addShowdownMonster(
  showdownMonster: Omit<
    TablesInsert<'showdown_monster'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_monster')
    .insert(showdownMonster)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Showdown Monster: ${error.message}`)

  return data.id
}

/**
 * Remove Showdown Monster
 *
 * Deletes a showdown monster record from the database.
 *
 * @param id Showdown Monster ID
 */
export async function removeShowdownMonster(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('showdown_monster')
    .delete()
    .eq('id', id)

  if (error)
    throw new Error(`Error Removing Showdown Monster: ${error.message}`)
}
