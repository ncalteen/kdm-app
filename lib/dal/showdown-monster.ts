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
      'id, accuracy, accuracy_tokens, ai_card_drawn, ai_deck_id, ai_deck_remaining, damage, damage_tokens, evasion, evasion_tokens, knocked_down, luck, luck_tokens, monster_name, moods, movement, movement_tokens, notes, settlement_id, showdown_id, speed, speed_tokens, strength, strength_tokens, toughness, traits, wounds'
    )
    .eq('showdown_id', showdownId)

  if (error)
    throw new Error(`Error Fetching Showdown Monsters: ${error.message}`)

  const showdownMonsterMap: { [key: string]: ShowdownMonsterDetail } = {}

  for (const m of data ?? []) showdownMonsterMap[m.id] = m

  return showdownMonsterMap
}
