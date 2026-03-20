import { Tables, TablesInsert } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Quarry Levels
 *
 * Retrieves all levels for a quarry.
 *
 * @param quarryId Quarry ID
 * @returns Quarry Levels
 */
export async function getQuarryLevels(
  quarryId: string | null | undefined
): Promise<
  Omit<Tables<'quarry_level'>, 'created_at' | 'updated_at' | 'quarry_id'>[]
> {
  if (!quarryId) throw new Error('Required: Quarry ID')

  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_level')
    .select(
      'id, accuracy, accuracy_tokens, advanced_cards, ai_deck_remaining, basic_cards, damage, damage_tokens, evasion, evasion_tokens, hunt_pos, legendary_cards, level_number, luck, luck_tokens, moods, movement, movement_tokens, overtone_cards, speed, speed_tokens, strength, strength_tokens, sub_monster_name, survivor_hunt_pos, survivor_statuses, toughness, toughness_tokens, traits'
    )
    .eq('quarry_id', quarryId)

  if (error) throw new Error(`Error Fetching Quarry Levels: ${error.message}`)

  return data ?? []
}

/**
 * Add Quarry Level
 *
 * Adds a new level to a quarry.
 *
 * @param quarryLevel Quarry Level Data
 * @returns Inserted Quarry Level ID
 */
export async function addQuarryLevel(
  quarryLevel: Omit<
    TablesInsert<'quarry_level'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quarry_level')
    .insert(quarryLevel)
    .select('id')
    .single()

  if (error) throw new Error(`Error Adding Quarry Level: ${error.message}`)

  return data.id
}
