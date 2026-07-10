import { getVignetteEncounterAIDecks } from '@/lib/dal/vignette-encounter-ai-deck'
import { TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import {
  VignetteEncounterAIDeckDetail,
  VignetteEncounterMonsterDetail
} from '@/lib/types'

function withAuthorship(row: unknown): Record<string, unknown> | null {
  if (!row || typeof row !== 'object') return null
  const { user_id, ...rest } = row as Record<string, unknown>
  const isCustom = rest.custom === true

  return {
    ...rest,
    author_user_id: isCustom && typeof user_id === 'string' ? user_id : null,
    author_username: null,
    author_avatar_url: null
  }
}

function mapRuleRows(rows: unknown, key: string): unknown[] {
  if (!Array.isArray(rows)) return []

  return rows.map((row) => {
    const object = row as Record<string, unknown>
    return {
      ...object,
      [key]: withAuthorship(object[key])
    }
  })
}

/**
 * Get Vignette Encounter Monsters
 *
 * Retrieves all monsters assigned to an active vignette encounter.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @param prefetchedAIDecks Optional prefetched AI Decks by ID
 * @returns Vignette Encounter Monsters
 */
export async function getVignetteEncounterMonsters(
  vignetteEncounterId: string | null | undefined,
  prefetchedAIDecks?: { [key: string]: VignetteEncounterAIDeckDetail } | null
): Promise<{ [key: string]: VignetteEncounterMonsterDetail } | null> {
  if (!vignetteEncounterId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_monster')
    .select(
      `
      id,
      accuracy,
      accuracy_tokens,
      ai_card_drawn,
      ai_deck_id,
      ai_deck_remaining,
      damage,
      damage_tokens,
      evasion,
      evasion_tokens,
      knocked_down,
      luck,
      luck_tokens,
      monster_name,
      movement,
      movement_tokens,
      notes,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      toughness,
      toughness_tokens,
      vignette_encounter_id,
      wounds,
      ai_deck:vignette_encounter_ai_deck(
        id,
        advanced_cards,
        basic_cards,
        legendary_cards,
        overtone_cards,
        vignette_encounter_id
      ),
      traits:vignette_encounter_monster_trait(
        id,
        vignette_encounter_monster_id,
        trait_id,
        trait(
          id,
          custom,
          trait_name,
          rules
        )
      ),
      moods:vignette_encounter_monster_mood(
        id,
        vignette_encounter_monster_id,
        mood_id,
        mood(
          id,
          custom,
          mood_name,
          rules
        )
      ),
      survivor_statuses:vignette_encounter_monster_survivor_status(
        id,
        vignette_encounter_monster_id,
        survivor_status_id,
        survivor_status(
          id,
          custom,
          user_id,
          survivor_status_name,
          rules
        )
      )
      `
    )
    .eq('vignette_encounter_id', vignetteEncounterId)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Monsters: ${error.message}`
    )

  if (!data) return null

  const vignetteEncounterMonsterMap: {
    [key: string]: VignetteEncounterMonsterDetail
  } = {}

  const aiDecks =
    prefetchedAIDecks ??
    ((data ?? []).some((monster) => !monster.ai_deck && monster.ai_deck_id)
      ? await getVignetteEncounterAIDecks(vignetteEncounterId)
      : null)

  for (const m of data ?? []) {
    const rawMonster = m as unknown as Record<string, unknown>
    const aiDeck = m.ai_deck ?? aiDecks?.[m.ai_deck_id]
    if (m.ai_deck_id && !aiDeck)
      throw new Error(
        `Error Fetching Vignette Encounter Monsters: AI deck ${m.ai_deck_id} not found for monster ${m.id}`
      )

    vignetteEncounterMonsterMap[m.id] = {
      ...m,
      ai_deck: aiDeck,
      moods: mapRuleRows(
        rawMonster.moods ?? rawMonster.vignette_encounter_monster_mood,
        'mood'
      ),
      survivor_statuses: mapRuleRows(
        rawMonster.survivor_statuses ??
          rawMonster.vignette_encounter_monster_survivor_status,
        'survivor_status'
      ),
      traits: mapRuleRows(
        rawMonster.traits ?? rawMonster.vignette_encounter_monster_trait,
        'trait'
      )
    } as unknown as VignetteEncounterMonsterDetail
  }

  return vignetteEncounterMonsterMap
}

/**
 * Update Vignette Encounter Monster
 *
 * Updates a vignette encounter monster's data.
 *
 * @param monsterId Monster ID
 * @param updateData Data to update
 * @returns Updated Vignette Encounter Monster Data
 */
export async function updateVignetteEncounterMonster(
  monsterId: string,
  updateData: Omit<
    TablesUpdate<'vignette_encounter_monster'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const monsterUpdateData: TablesUpdate<'vignette_encounter_monster'> = {
    ...updateData
  }

  delete monsterUpdateData.id

  const { error } = await supabase
    .from('vignette_encounter_monster')
    .update(monsterUpdateData)
    .eq('id', monsterId)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Monster: ${error.message}`
    )
}
