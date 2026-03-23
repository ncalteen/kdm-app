import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { HuntMonsterDetail } from '@/lib/types'

/**
 * Get Hunt Monsters
 *
 * Retrieves all monsters assigned to a hunt.
 *
 * @param huntId Hunt ID
 * @returns Hunt Monsters
 */
export async function getHuntMonsters(
  huntId: string | null | undefined
): Promise<{ [key: string]: HuntMonsterDetail } | null> {
  if (!huntId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_monster')
    .select(
      'id, accuracy, accuracy_tokens, ai_deck_id, ai_deck_remaining, damage, damage_tokens, evasion, evasion_tokens, hunt_id, knocked_down, luck, luck_tokens, monster_name, moods, movement, movement_tokens, notes, settlement_id, speed, speed_tokens, strength, strength_tokens, toughness, traits, wounds, hunt_ai_deck(id, advanced_cards, basic_cards, legendary_cards, overtone_cards)'
    )
    .eq('hunt_id', huntId)

  if (error) throw new Error(`Error Fetching Hunt Monsters: ${error.message}`)
  if (!data) return null

  const huntMonsterMap: { [key: string]: HuntMonsterDetail } = {}

  for (const m of data ?? []) {
    const aiDeck = m.hunt_ai_deck as unknown as HuntMonsterDetail['ai_deck']
    huntMonsterMap[m.id] = { ...m, ai_deck: aiDeck ?? null }
  }

  return huntMonsterMap
}

/**
 * Add Hunt Monster
 *
 * Adds a new monster to a hunt.
 *
 * @param huntMonster Hunt Monster Data
 * @returns Inserted Hunt Monster ID
 */
export async function addHuntMonster(
  huntMonster: Omit<
    TablesInsert<'hunt_monster'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_monster')
    .insert(huntMonster)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Hunt Monster: ${error.message}`)

  return data.id
}

/**
 * Update Hunt Monster
 *
 * Updates an existing hunt monster record.
 *
 * @param id Hunt Monster ID
 * @param huntMonster Hunt Monster Data
 */
export async function updateHuntMonster(
  id: string,
  huntMonster: Omit<
    TablesUpdate<'hunt_monster'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('hunt_monster')
    .update(huntMonster)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Hunt Monster: ${error.message}`)
}

/**
 * Remove Hunt Monster
 *
 * Deletes a hunt monster record from the database.
 *
 * @param id Hunt Monster ID
 */
export async function removeHuntMonster(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('hunt_monster').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Hunt Monster: ${error.message}`)
}
