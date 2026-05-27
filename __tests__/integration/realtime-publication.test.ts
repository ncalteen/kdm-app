import { admin } from '@/__tests__/integration/helpers/supabase'
import { describe, expect, it } from 'vitest'

/**
 * Integration — Realtime Publication Membership
 *
 * Asserts that every settlement-scoped table AND every catalog table
 * covered by [E2.1.a/b/c] is included in the `supabase_realtime`
 * publication. Tables in the publication broadcast row-level changes to
 * subscribed clients, which is what powers multiplayer sync for shared
 * settlements and collaborator-visible custom rules text.
 *
 * If a new settlement-scoped table or a custom catalog is added to the
 * schema without being added to the publication, this test fails with a
 * list of missing tables — a much more actionable signal than discovering
 * the gap in production when a collaborator's UI silently goes stale.
 *
 * `settlement_shared_user` is included here (added to the publication in
 * E1.4) so user-level subscriptions receive invite / revoke events; it is
 * intentionally absent from the per-settlement `TABLE_DOMAIN_MAP` in
 * `hooks/use-realtime.tsx`.
 */
describe('Realtime publication membership', () => {
  /**
   * Source of truth: every settlement-scoped table that must broadcast
   * changes for the multiplayer experience to work. Keep this list in sync
   * with the `TABLE_DOMAIN_MAP` in `hooks/use-realtime.tsx`, with one
   * exception: `settlement_shared_user` is part of the `supabase_realtime`
   * publication (added in E1.4) but is consumed by a user-level subscription
   * landing in [E1.5], so it does not appear in the per-settlement
   * `TABLE_DOMAIN_MAP`.
   */
  const EXPECTED_TABLES = [
    // Core settlement & junctions
    'settlement',
    'settlement_collective_cognition_reward',
    'settlement_gear',
    'settlement_innovation',
    'settlement_knowledge',
    'settlement_location',
    'settlement_milestone',
    'settlement_nemesis',
    'settlement_pattern',
    'settlement_phase',
    'settlement_phase_returning_survivor',
    'settlement_philosophy',
    'settlement_principle',
    'settlement_quarry',
    'settlement_resource',
    'settlement_seed_pattern',
    'settlement_shared_user',
    'settlement_timeline_year',

    // Hunt
    'hunt',
    'hunt_ai_deck',
    'hunt_hunt_board',
    'hunt_monster',
    'hunt_monster_mood',
    'hunt_monster_survivor_status',
    'hunt_monster_trait',
    'hunt_survivor',

    // Showdown
    'showdown',
    'showdown_ai_deck',
    'showdown_monster',
    'showdown_monster_mood',
    'showdown_monster_survivor_status',
    'showdown_monster_trait',
    'showdown_survivor',

    // Encounter
    'encounter',
    'encounter_active_monster',
    'encounter_active_monster_mood',
    'encounter_active_monster_trait',
    'encounter_survivor',

    // Survivor
    'survivor',
    'survivor_ability_impairment',
    'survivor_cursed_gear',
    'survivor_disorder',
    'survivor_fighting_art',
    'survivor_secret_fighting_art',

    // Gear grid
    'gear_grid'
  ] as const

  /**
   * Source of truth: every catalog table whose custom rows must broadcast
   * to settlement collaborators. Mirrors the `catalog_tables` array in
   * `20260519000000_catalog_realtime_publication.sql`. New custom-content
   * tables should be added here alongside their publication-membership
   * migration.
   */
  const EXPECTED_CATALOG_TABLES = [
    // Settlement-attached catalogs ([E2.1.a]).
    'knowledge',
    'disorder',
    'gear',
    'pattern',
    'seed_pattern',
    'innovation',
    'fighting_art',
    'secret_fighting_art',
    'collective_cognition_reward',
    'location',
    'milestone',
    'principle',
    'resource',
    'quarry',
    'nemesis',
    'ability_impairment',
    // Survivor-column-direct catalogs ([E2.1.b]).
    'neurosis',
    'philosophy',
    'philosophy_rank',
    'weapon_type',
    // Hunt / showdown / armor catalogs ([E2.1.c]).
    'trait',
    'mood',
    'armor_set',
    'armor_set_slot',
    'quarry_level',
    'quarry_level_trait',
    'quarry_level_mood',
    'nemesis_level',
    'nemesis_level_trait',
    'nemesis_level_mood',
    'encounter_monster',
    // Catalogs without a settlement-bound junction (yet).
    'character',
    'strain_milestone',
    'wanderer',
    'constellation',
    'survivor_status'
  ] as const

  /**
   * Source of truth: every catalog *sub-row* table whose custom rows must
   * broadcast to settlement collaborators. Mirrors the
   * `catalog_sub_row_tables` array in
   * `20260525000000_catalog_sub_row_realtime_publication.sql` and the
   * sub-row entries appended to `TABLE_DOMAIN_MAP` in
   * `hooks/use-realtime.tsx`. New cost / level / slot child tables should
   * be added here alongside their publication-membership migration.
   */
  const EXPECTED_CATALOG_SUB_ROW_TABLES = [
    // Crafting cost children of `gear`.
    'gear_gear_cost',
    'gear_resource_cost',
    'gear_resource_type_cost',
    'gear_other_cost',
    // Crafting cost children of `pattern`.
    'pattern_gear_cost',
    'pattern_resource_cost',
    'pattern_resource_type_cost',
    'pattern_innovation_requirement',
    // Crafting cost children of `seed_pattern`.
    'seed_pattern_gear_cost',
    'seed_pattern_resource_cost',
    'seed_pattern_resource_type_cost',
    'seed_pattern_innovation_requirement',
    // Armor set slot contents.
    'armor_set_slot_gear',
    // Monster-level survivor status junctions.
    'quarry_level_survivor_status',
    'nemesis_level_survivor_status',
    // Direct quarry/nemesis sub-rows added alongside the level-status
    // junctions. Wanderer child tables are intentionally absent —
    // `wanderer` has no settlement junction, so collaborators never
    // satisfy the SELECT predicate for custom wanderer rows and
    // publication membership would be a no-op.
    'quarry_location',
    'quarry_timeline_year',
    'quarry_hunt_board',
    'quarry_hunt_board_position',
    'quarry_collective_cognition_reward',
    'nemesis_location',
    'nemesis_timeline_year',
    'encounter_monster_level',
    'encounter_monster_level_trait',
    'encounter_monster_level_mood'
  ] as const

  it('includes every settlement-scoped table in `supabase_realtime`', async () => {
    const { data, error } = await admin.rpc('realtime_publication_tables')

    expect(error).toBeNull()
    expect(data).toBeTruthy()

    const rows = (data ?? []) as { tablename: string }[]
    const actual = new Set(rows.map((r) => r.tablename))
    const missing = EXPECTED_TABLES.filter((t) => !actual.has(t))

    expect(missing).toEqual([])
  })

  // E1.4 acceptance: the pg_publication_tables row exists for
  // `settlement_shared_user`, mirroring the SQL predicate from issue #136.
  it('includes `settlement_shared_user` in `supabase_realtime` (E1.4)', async () => {
    const { data, error } = await admin.rpc('realtime_publication_tables')

    expect(error).toBeNull()
    const rows = (data ?? []) as { tablename: string }[]
    const matches = rows.filter((r) => r.tablename === 'settlement_shared_user')
    expect(matches).toHaveLength(1)
  })

  // Issue #170 acceptance: `user_subscription` is added to the publication
  // by `20260602000000_user_subscription_realtime_publication.sql` so the
  // SPA can refresh its cached entitlement state as soon as the Stripe
  // webhook commits, without waiting for the user to round-trip through
  // the Customer Portal and re-mount on return.
  it('includes `user_subscription` in `supabase_realtime` (issue #170)', async () => {
    const { data, error } = await admin.rpc('realtime_publication_tables')

    expect(error).toBeNull()
    const rows = (data ?? []) as { tablename: string }[]
    const matches = rows.filter((r) => r.tablename === 'user_subscription')
    expect(matches).toHaveLength(1)
  })

  // [E4.3] acceptance: `notification` is added to the publication by
  // `20260604000000_notification.sql` so the in-app bell pushes new
  // notifications to recipients live (no polling). The table's "Allow
  // select own" RLS policy is honored by the secure broadcast channel.
  it('includes `notification` in `supabase_realtime` ([E4.3])', async () => {
    const { data, error } = await admin.rpc('realtime_publication_tables')

    expect(error).toBeNull()
    const rows = (data ?? []) as { tablename: string }[]
    const matches = rows.filter((r) => r.tablename === 'notification')
    expect(matches).toHaveLength(1)
  })

  // [E2.4] acceptance: every catalog table covered by E2.1.a/b/c is in
  // the publication so collaborators receive rules-text edits live.
  it('includes every catalog table in `supabase_realtime` ([E2.4])', async () => {
    const { data, error } = await admin.rpc('realtime_publication_tables')

    expect(error).toBeNull()
    const rows = (data ?? []) as { tablename: string }[]
    const actual = new Set(rows.map((r) => r.tablename))
    const missing = EXPECTED_CATALOG_TABLES.filter((t) => !actual.has(t))

    expect(missing).toEqual([])
  })

  // [E2.4 cont.] acceptance: every catalog sub-row table covered by
  // `20260524000000_catalog_sub_row_transitive_select.sql` is in the
  // publication so collaborators receive child INSERT / UPDATE / DELETE
  // events live (cost lists, slot contents, monster-level status
  // junctions).
  it('includes every catalog sub-row table in `supabase_realtime` ([E2.4 cont.])', async () => {
    const { data, error } = await admin.rpc('realtime_publication_tables')

    expect(error).toBeNull()
    const rows = (data ?? []) as { tablename: string }[]
    const actual = new Set(rows.map((r) => r.tablename))
    const missing = EXPECTED_CATALOG_SUB_ROW_TABLES.filter(
      (t) => !actual.has(t)
    )

    expect(missing).toEqual([])
  })
})
