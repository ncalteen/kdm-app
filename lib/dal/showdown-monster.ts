import { TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import {
  MoodDetail,
  ShowdownMonsterDetail,
  SurvivorStatusDetail,
  TraitDetail
} from '@/lib/types'

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
): Promise<{ [key: string]: ShowdownMonsterDetail } | null> {
  if (!showdownId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_monster')
    .select(
      'id, accuracy, accuracy_tokens, ai_card_drawn, ai_deck_id, ai_deck_remaining, damage, damage_tokens, evasion, evasion_tokens, knocked_down, luck, luck_tokens, monster_name, movement, movement_tokens, notes, settlement_id, showdown_id, speed, speed_tokens, strength, strength_tokens, toughness, wounds, showdown_ai_deck(id, advanced_cards, basic_cards, legendary_cards, overtone_cards), showdown_monster_trait(trait(id, custom, trait_name, rules)), showdown_monster_mood(mood(id, custom, mood_name, rules)), showdown_monster_survivor_status(survivor_status(id, custom, survivor_status_name, rules))'
    )
    .eq('showdown_id', showdownId)

  if (error)
    throw new Error(`Error Fetching Showdown Monsters: ${error.message}`)
  if (!data) return null

  const showdownMonsterMap: { [key: string]: ShowdownMonsterDetail } = {}

  for (const m of data ?? []) {
    const aiDeck =
      m.showdown_ai_deck as unknown as ShowdownMonsterDetail['ai_deck']
    const traitRows = (
      m as unknown as {
        showdown_monster_trait: { trait: TraitDetail | null }[]
      }
    ).showdown_monster_trait
    const moodRows = (
      m as unknown as {
        showdown_monster_mood: { mood: MoodDetail | null }[]
      }
    ).showdown_monster_mood
    const statusRows = (
      m as unknown as {
        showdown_monster_survivor_status: {
          survivor_status: SurvivorStatusDetail | null
        }[]
      }
    ).showdown_monster_survivor_status

    showdownMonsterMap[m.id] = {
      ...m,
      ai_deck: aiDeck ?? null,
      traits: (traitRows ?? [])
        .map((r) => r.trait)
        .filter((t): t is TraitDetail => t !== null),
      moods: (moodRows ?? [])
        .map((r) => r.mood)
        .filter((m): m is MoodDetail => m !== null),
      survivor_statuses: (statusRows ?? [])
        .map((r) => r.survivor_status)
        .filter((s): s is SurvivorStatusDetail => s !== null)
    }
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
