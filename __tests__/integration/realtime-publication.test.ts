import { admin } from '@/__tests__/integration/helpers/supabase'
import { describe, expect, it } from 'vitest'

/**
 * Integration — Realtime Publication Membership
 *
 * Asserts that every settlement-scoped table is included in the
 * `supabase_realtime` publication. Tables in the publication broadcast
 * row-level changes to subscribed clients, which is what powers multiplayer
 * sync for shared settlements.
 *
 * If a new settlement-scoped table is added to the schema without being
 * added to the publication, this test fails with a list of missing tables —
 * a much more actionable signal than discovering the gap in production when
 * a collaborator's UI silently goes stale.
 *
 * Catalog tables (`survivor_status`, `armor_set`, `wanderer*`, etc.) are
 * intentionally out of scope: they are tracked under E2.4 and rely on a
 * different subscription model. `settlement_shared_user` is included here
 * (added to the publication in E1.4) so user-level subscriptions receive
 * invite / revoke events.
 */
describe('Realtime publication membership', () => {
  /**
   * Source of truth: every settlement-scoped table that must broadcast
   * changes for the multiplayer experience to work. Keep this list in sync
   * with the `TABLE_DOMAIN_MAP` in `hooks/use-realtime.tsx`.
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
})
