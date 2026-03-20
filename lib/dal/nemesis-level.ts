import { Tables, TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Nemesis Levels
 *
 * Retrieves all levels for a nemesis.
 *
 * @param nemesisId Nemesis ID
 * @returns Nemesis Levels
 */
export async function getNemesisLevels(
  nemesisId: string | null | undefined
): Promise<
  Omit<Tables<'nemesis_level'>, 'created_at' | 'updated_at' | 'nemesis_id'>[]
> {
  if (!nemesisId) throw new Error('Required: Nemesis ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_level')
    .select(
      'id, accuracy, accuracy_tokens, advanced_cards, ai_deck_remaining, basic_cards, damage, damage_tokens, evasion, evasion_tokens, legendary_cards, level_number, life, luck, luck_tokens, moods, movement, movement_tokens, overtone_cards, speed, speed_tokens, strength, strength_tokens, sub_monster_name, survivor_statuses, toughness, toughness_tokens, traits'
    )
    .eq('nemesis_id', nemesisId)

  if (error) throw new Error(`Error Fetching Nemesis Levels: ${error.message}`)

  return data ?? []
}

/**
 * Add Nemesis Level
 *
 * Adds a new level to a nemesis.
 *
 * @param nemesisLevel Nemesis Level Data
 * @returns Inserted Nemesis Level ID
 */
export async function addNemesisLevel(
  nemesisLevel: Omit<
    TablesInsert<'nemesis_level'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nemesis_level')
    .insert(nemesisLevel)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Nemesis Level: ${error.message}`)

  return data.id
}
