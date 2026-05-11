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
    // Catalogs without a settlement-bound junction (yet).
    'character',
    'strain_milestone',
    'wanderer',
    'constellation',
    'survivor_status'
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
})
