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
): Promise<{ [key: string]: HuntMonsterDetail }> {
  if (!huntId) throw new Error('Required: Hunt ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_monster')
    .select(
      'id, accuracy, accuracy_tokens, ai_deck_id, ai_deck_remaining, damage, damage_tokens, evasion, evasion_tokens, hunt_id, knocked_down, luck, luck_tokens, monster_name, moods, movement, movement_tokens, notes, settlement_id, speed, speed_tokens, strength, strength_tokens, toughness, traits, wounds'
    )
    .eq('hunt_id', huntId)

  if (error) throw new Error(`Error Fetching Hunt Monsters: ${error.message}`)

  const huntMonsterMap: { [key: string]: HuntMonsterDetail } = {}

  for (const m of data ?? []) huntMonsterMap[m.id] = m

  return huntMonsterMap
}
