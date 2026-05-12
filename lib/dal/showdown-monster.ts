import { TablesInsert } from '@/lib/database.types'
import { getSettlementMemberUsernames } from '@/lib/dal/settlement-shared-user'
import { createClient } from '@/lib/supabase/client'
import {
  MoodDetail,
  ShowdownMonsterDetail,
  SurvivorStatusDetail,
  TraitDetail
} from '@/lib/types'

/**
 * Catalog Row With Authorship
 *
 * Raw shape of a `trait` / `mood` / `survivor_status` embed coming back from
 * Supabase before `author_username` is resolved. The `user_id` is dropped on
 * the way out so it never leaks into `ShowdownMonsterDetail`.
 */
type WithAuthorship<T> = T & { user_id: string | null }

/**
 * Resolve Author Username
 *
 * Returns the catalog author's username for custom rows, or `null` for
 * built-ins / rows authored by users no longer connected to the settlement.
 *
 * @param row Catalog Row With `custom` + `user_id`
 * @param memberUsernames Settlement Member Username Map
 * @returns Author Username Or Null
 */
function resolveAuthorUsername(
  row: { custom: boolean; user_id: string | null } | null | undefined,
  memberUsernames: Map<string, string>
): string | null {
  if (!row || !row.custom || !row.user_id) return null
  return memberUsernames.get(row.user_id) ?? null
}

/**
 * Get Showdown Monsters
 *
 * Retrieves all monsters assigned to a showdown.
 *
 * Each embedded `trait` / `mood` / `survivor_status` row carries
 * `author_username` — `null` for built-ins, and the catalog author's
 * username for custom rows so the UI can render the "By @username" chip
 * (E2.8; see `local/sharing-architecture.md` §7.4 / §10 Phase 2 item 2.6).
 *
 * @param showdownId Showdown ID
 * @param prefetchedMemberUsernames Optional in-flight (or resolved)
 *   member-username map. When called from {@link getShowdown} (which
 *   fetches the map once for the whole settlement load), pass the promise
 *   to skip the extra RPC.
 * @returns Showdown Monsters
 */
export async function getShowdownMonsters(
  showdownId: string | null | undefined,
  prefetchedMemberUsernames?: Promise<Map<string, string>>
): Promise<{ [key: string]: ShowdownMonsterDetail } | null> {
  if (!showdownId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('showdown_monster')
    .select(
      'id, accuracy, accuracy_tokens, ai_card_drawn, ai_deck_id, ai_deck_remaining, damage, damage_tokens, evasion, evasion_tokens, knocked_down, luck, luck_tokens, monster_name, movement, movement_tokens, notes, settlement_id, showdown_id, speed, speed_tokens, strength, strength_tokens, toughness, wounds, showdown_ai_deck(id, advanced_cards, basic_cards, legendary_cards, overtone_cards), showdown_monster_trait(trait(id, custom, user_id, trait_name, rules)), showdown_monster_mood(mood(id, custom, user_id, mood_name, rules)), showdown_monster_survivor_status(survivor_status(id, custom, user_id, survivor_status_name, rules))'
    )
    .eq('showdown_id', showdownId)

  if (error)
    throw new Error(`Error Fetching Showdown Monsters: ${error.message}`)
  if (!data) return null

  // Derive the settlement scope from the first showdown-monster row (all rows
  // for a showdown share the same settlement). Skip the RPC entirely when
  // there are no monsters yet.
  const settlementId =
    (data[0] as { settlement_id?: string | null } | undefined)?.settlement_id ??
    null

  const memberUsernames =
    data.length === 0
      ? new Map<string, string>()
      : await (prefetchedMemberUsernames ??
          (settlementId
            ? getSettlementMemberUsernames(settlementId)
            : Promise.resolve(new Map<string, string>())))

  const showdownMonsterMap: { [key: string]: ShowdownMonsterDetail } = {}

  for (const m of data ?? []) {
    const aiDeck =
      m.showdown_ai_deck as unknown as ShowdownMonsterDetail['ai_deck']
    const traitRows = (
      m as unknown as {
        showdown_monster_trait: { trait: WithAuthorship<TraitDetail> | null }[]
      }
    ).showdown_monster_trait
    const moodRows = (
      m as unknown as {
        showdown_monster_mood: { mood: WithAuthorship<MoodDetail> | null }[]
      }
    ).showdown_monster_mood
    const statusRows = (
      m as unknown as {
        showdown_monster_survivor_status: {
          survivor_status: WithAuthorship<SurvivorStatusDetail> | null
        }[]
      }
    ).showdown_monster_survivor_status

    showdownMonsterMap[m.id] = {
      ...m,
      ai_deck: aiDeck ?? null,
      traits: (traitRows ?? [])
        .map((r) => r.trait)
        .filter((t): t is WithAuthorship<TraitDetail> => t !== null)
        .map(({ user_id, ...trait }) => ({
          ...trait,
          author_username: resolveAuthorUsername(
            { custom: trait.custom, user_id },
            memberUsernames
          )
        })),
      moods: (moodRows ?? [])
        .map((r) => r.mood)
        .filter((m): m is WithAuthorship<MoodDetail> => m !== null)
        .map(({ user_id, ...mood }) => ({
          ...mood,
          author_username: resolveAuthorUsername(
            { custom: mood.custom, user_id },
            memberUsernames
          )
        })),
      survivor_statuses: (statusRows ?? [])
        .map((r) => r.survivor_status)
        .filter((s): s is WithAuthorship<SurvivorStatusDetail> => s !== null)
        .map(({ user_id, ...status }) => ({
          ...status,
          author_username: resolveAuthorUsername(
            { custom: status.custom, user_id },
            memberUsernames
          )
        }))
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
