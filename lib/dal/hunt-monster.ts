import { TablesInsert, TablesUpdate } from '@/lib/database.types'
import {
  getSettlementMemberUsernames,
  resolveSettlementAuthorship,
  type SettlementMemberProfile
} from '@/lib/dal/settlement-shared-user'
import { createClient } from '@/lib/supabase/client'
import {
  HuntMonsterDetail,
  MoodDetail,
  SurvivorStatusDetail,
  TraitDetail
} from '@/lib/types'

/**
 * Catalog Row With Authorship
 *
 * Raw shape of a `trait` / `mood` / `survivor_status` embed coming back from
 * Supabase before the author triplet is resolved. The `user_id` is dropped
 * on the way out so it never leaks into `HuntMonsterDetail`.
 */
type WithAuthorship<T> = T & { user_id: string | null }

/**
 * Get Hunt Monsters
 *
 * Retrieves all monsters assigned to a hunt.
 *
 * Each embedded `trait` / `mood` / `survivor_status` row carries the
 * author triplet (`author_user_id`, `author_username`,
 * `author_avatar_url`) — all `null` for built-ins, populated for custom
 * rows so the UI can render the avatar/tooltip chip (E2.8 / E2.9; see
 * `local/sharing-architecture.md` §7.4 / §10 Phase 2 items 2.6–2.7).
 *
 * @param huntId Hunt ID
 * @param prefetchedMemberProfiles Optional in-flight (or resolved)
 *   member-profile map. When called from {@link getHunt} (which fetches
 *   the map once for the whole settlement load), pass the promise to skip
 *   the extra RPC.
 * @returns Hunt Monsters
 */
export async function getHuntMonsters(
  huntId: string | null | undefined,
  prefetchedMemberProfiles?: Promise<Map<string, SettlementMemberProfile>>
): Promise<{ [key: string]: HuntMonsterDetail } | null> {
  if (!huntId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('hunt_monster')
    .select(
      'id, accuracy, accuracy_tokens, ai_deck_id, ai_deck_remaining, damage, damage_tokens, evasion, evasion_tokens, hunt_id, knocked_down, luck, luck_tokens, monster_name, movement, movement_tokens, notes, settlement_id, speed, speed_tokens, strength, strength_tokens, toughness, wounds, hunt_ai_deck(id, advanced_cards, basic_cards, legendary_cards, overtone_cards), hunt_monster_trait(trait(id, custom, user_id, trait_name, rules)), hunt_monster_mood(mood(id, custom, user_id, mood_name, rules)), hunt_monster_survivor_status(survivor_status(id, custom, user_id, survivor_status_name, rules))'
    )
    .eq('hunt_id', huntId)

  if (error) throw new Error(`Error Fetching Hunt Monsters: ${error.message}`)
  if (!data) return null

  // Derive the settlement scope from the first hunt-monster row (all rows for
  // a hunt share the same settlement). Skip the RPC entirely when there are
  // no monsters yet.
  const settlementId =
    (data[0] as { settlement_id?: string | null } | undefined)?.settlement_id ??
    null

  const memberProfiles =
    data.length === 0
      ? new Map<string, SettlementMemberProfile>()
      : await (prefetchedMemberProfiles ??
          (settlementId
            ? getSettlementMemberUsernames(settlementId)
            : Promise.resolve(new Map<string, SettlementMemberProfile>())))

  const huntMonsterMap: { [key: string]: HuntMonsterDetail } = {}

  for (const m of data ?? []) {
    const aiDeck = m.hunt_ai_deck as unknown as HuntMonsterDetail['ai_deck']
    const traitRows = (
      m as unknown as {
        hunt_monster_trait: { trait: WithAuthorship<TraitDetail> | null }[]
      }
    ).hunt_monster_trait
    const moodRows = (
      m as unknown as {
        hunt_monster_mood: { mood: WithAuthorship<MoodDetail> | null }[]
      }
    ).hunt_monster_mood
    const statusRows = (
      m as unknown as {
        hunt_monster_survivor_status: {
          survivor_status: WithAuthorship<SurvivorStatusDetail> | null
        }[]
      }
    ).hunt_monster_survivor_status

    huntMonsterMap[m.id] = {
      ...m,
      ai_deck: aiDeck ?? null,
      traits: (traitRows ?? [])
        .map((r) => r.trait)
        .filter((t): t is WithAuthorship<TraitDetail> => t !== null)
        .map(({ user_id, ...trait }) => ({
          ...trait,
          ...resolveSettlementAuthorship(
            { custom: trait.custom, user_id },
            memberProfiles
          )
        })),
      moods: (moodRows ?? [])
        .map((r) => r.mood)
        .filter((m): m is WithAuthorship<MoodDetail> => m !== null)
        .map(({ user_id, ...mood }) => ({
          ...mood,
          ...resolveSettlementAuthorship(
            { custom: mood.custom, user_id },
            memberProfiles
          )
        })),
      survivor_statuses: (statusRows ?? [])
        .map((r) => r.survivor_status)
        .filter((s): s is WithAuthorship<SurvivorStatusDetail> => s !== null)
        .map(({ user_id, ...status }) => ({
          ...status,
          ...resolveSettlementAuthorship(
            { custom: status.custom, user_id },
            memberProfiles
          )
        }))
    }
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
