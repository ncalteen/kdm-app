import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { MoodDetail, QuarryLevelDetail, TraitDetail } from '@/lib/types'

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
): Promise<QuarryLevelDetail[]> {
  if (!quarryId) throw new Error('Required: Quarry ID')

  const supabase = createClient()

  const { data: levels, error: levelsError } = await supabase
    .from('quarry_level')
    .select(
      'id, accuracy, accuracy_tokens, advanced_cards, ai_deck_remaining, basic_cards, damage, damage_tokens, evasion, evasion_tokens, legendary_cards, level_number, luck, luck_tokens, movement, movement_tokens, overtone_cards, speed, speed_tokens, strength, strength_tokens, sub_monster_name, survivor_statuses, toughness, toughness_tokens, quarry_level_trait(trait(id, custom, trait_name, rules)), quarry_level_mood(mood(id, custom, mood_name, rules))'
    )
    .eq('quarry_id', quarryId)

  if (levelsError)
    throw new Error(`Error Fetching Quarry Levels: ${levelsError.message}`)

  const { data: positions, error: positionsError } = await supabase
    .from('quarry_hunt_board_position')
    .select('level_number, monster_hunt_pos, survivor_hunt_pos')
    .eq('quarry_id', quarryId)

  if (positionsError)
    throw new Error(
      `Error Fetching Quarry Hunt Positions: ${positionsError.message}`
    )

  const positionsByLevel = new Map(
    (positions ?? []).map((position) => [position.level_number, position])
  )

  const mergedLevels = (levels ?? []).map((level) => {
    const position = positionsByLevel.get(level.level_number)

    const traitRows = (
      level as unknown as {
        quarry_level_trait: { trait: TraitDetail | null }[]
      }
    ).quarry_level_trait
    const moodRows = (
      level as unknown as {
        quarry_level_mood: { mood: MoodDetail | null }[]
      }
    ).quarry_level_mood

    return {
      ...level,
      hunt_pos: position?.monster_hunt_pos ?? 12,
      survivor_hunt_pos: position?.survivor_hunt_pos ?? 0,
      traits: (traitRows ?? [])
        .map((r) => r.trait)
        .filter((t): t is TraitDetail => t !== null),
      moods: (moodRows ?? [])
        .map((r) => r.mood)
        .filter((m): m is MoodDetail => m !== null)
    }
  })

  return mergedLevels
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

/**
 * Update Quarry Level
 *
 * Updates an existing quarry level record.
 *
 * @param id Quarry Level ID
 * @param quarryLevel Quarry Level Data
 */
export async function updateQuarryLevel(
  id: string,
  quarryLevel: Omit<
    TablesUpdate<'quarry_level'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('quarry_level')
    .update(quarryLevel)
    .eq('id', id)

  if (error) throw new Error(`Error Updating Quarry Level: ${error.message}`)
}

/**
 * Remove Quarry Level
 *
 * Deletes a quarry level record from the database.
 *
 * @param id Quarry Level ID
 */
export async function removeQuarryLevel(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('quarry_level').delete().eq('id', id)

  if (error) throw new Error(`Error Removing Quarry Level: ${error.message}`)
}
