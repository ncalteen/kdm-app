import {
  deleteCatalog,
  seedCatalog,
  seedSettlementFixture,
  SettlementFixture
} from '@/__tests__/integration/helpers/fixtures'
import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Settlement-Scoped Tables
 *
 * For every settlement-scoped table the matrix below asserts:
 *  - a non-owner SELECT returns zero rows,
 *  - a non-owner UPDATE affects zero rows,
 *  - a non-owner DELETE affects zero rows.
 *
 * Combined with [rls/settlement.test.ts] (which covers the `settlement` table
 * itself) this gives every table in the gameplay graph at least one cross-user
 * RLS assertion.
 */
describe('RLS: settlement-scoped tables', () => {
  let owner: TestUser
  let attacker: TestUser
  let fixture: SettlementFixture
  let catalog: SettlementFixture['catalogIds']

  beforeAll(async () => {
    owner = await createTestUser()
    attacker = await createTestUser()
    catalog = await seedCatalog()
    fixture = await seedSettlementFixture(owner, catalog)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(attacker.id)
    await deleteCatalog(catalog)
  })

  /**
   * Matrix: { table, rowId, updatePayload }
   *
   * `rowId` is a lazy getter because `fixture` is populated in `beforeAll`,
   * but Vitest evaluates `it.each(buildMatrix())` arguments at collection
   * time (before any hooks run). Looking the ID up lazily through the
   * closure is what keeps the matrix static while still pointing at the
   * seeded rows at test-execution time.
   */
  const SETTLEMENT_JUNCTION_TABLES = [
    'settlement_collective_cognition_reward',
    'settlement_gear',
    'settlement_innovation',
    'settlement_knowledge',
    'settlement_location',
    'settlement_milestone',
    'settlement_nemesis',
    'settlement_pattern',
    'settlement_philosophy',
    'settlement_principle',
    'settlement_quarry',
    'settlement_resource',
    'settlement_seed_pattern',
    'settlement_timeline_year'
  ] as const

  const SURVIVOR_JUNCTION_TABLES = [
    'survivor_disorder',
    'survivor_fighting_art',
    'survivor_cursed_gear',
    'survivor_secret_fighting_art',
    'survivor_ability_impairment'
  ] as const

  const MONSTER_JUNCTION_TABLES = [
    'hunt_monster_trait',
    'hunt_monster_mood',
    'showdown_monster_trait',
    'showdown_monster_mood'
  ] as const

  const buildMatrix = () => {
    const r: { table: string; rowId: () => string; update: object }[] = [
      {
        table: 'settlement',
        rowId: () => fixture.settlementId,
        update: { settlement_name: 'HACKED' }
      },
      {
        table: 'survivor',
        rowId: () => fixture.survivorId,
        update: { survivor_name: 'HACKED' }
      },
      {
        table: 'settlement_phase',
        rowId: () => fixture.settlementPhaseId,
        update: { endeavors: 99 }
      },
      {
        table: 'hunt',
        rowId: () => fixture.huntId,
        update: { monster_level: 99 }
      },
      {
        table: 'hunt_ai_deck',
        rowId: () => fixture.huntAiDeckId,
        update: { basic_cards: 99 }
      },
      {
        table: 'hunt_hunt_board',
        rowId: () => fixture.huntHuntBoardId,
        update: { pos_1: 'BASIC' }
      },
      {
        table: 'hunt_monster',
        rowId: () => fixture.huntMonsterId,
        update: { wounds: 99 }
      },
      {
        table: 'hunt_survivor',
        rowId: () => fixture.huntSurvivorId,
        update: { notes: 'HACKED' }
      },
      {
        table: 'showdown',
        rowId: () => fixture.showdownId,
        update: { monster_level: 99 }
      },
      {
        table: 'showdown_ai_deck',
        rowId: () => fixture.showdownAiDeckId,
        update: { basic_cards: 99 }
      },
      {
        table: 'showdown_monster',
        rowId: () => fixture.showdownMonsterId,
        update: { wounds: 99 }
      },
      {
        table: 'showdown_survivor',
        rowId: () => fixture.showdownSurvivorId,
        update: { notes: 'HACKED' }
      }
    ]

    const settlementJunctionUpdates: Record<string, object> = {
      settlement_collective_cognition_reward: {},
      settlement_gear: {},
      settlement_innovation: { unlocked: true },
      settlement_knowledge: {},
      settlement_location: { unlocked: true },
      settlement_milestone: { complete: true },
      settlement_nemesis: { unlocked: true },
      settlement_pattern: {},
      settlement_philosophy: {},
      settlement_principle: {},
      settlement_quarry: { unlocked: true },
      settlement_resource: {},
      settlement_seed_pattern: {},
      settlement_timeline_year: { completed: true }
    }
    for (const table of SETTLEMENT_JUNCTION_TABLES)
      r.push({
        table,
        rowId: () => fixture.settlementJunctionIds[table],
        update: settlementJunctionUpdates[table] ?? {}
      })

    // Survivor_* junction tables have no mutable non-FK cols; DELETE is the
    // only meaningful write operation. Empty update is a safe no-op.
    for (const table of SURVIVOR_JUNCTION_TABLES)
      r.push({
        table,
        rowId: () => fixture.survivorJunctionIds[table],
        update: {}
      })

    // Monster_* junction tables (hunt_monster / showdown_monster <-> trait /
    // mood) follow the settlement-owner pattern — no mutable non-FK cols, so
    // DELETE-via-RLS is the meaningful cross-user assertion.
    for (const table of MONSTER_JUNCTION_TABLES)
      r.push({
        table,
        rowId: () => fixture.monsterJunctionIds[table],
        update: {}
      })

    return r
  }

  it.each(buildMatrix())(
    'attacker cannot SELECT %s',
    async ({ table, rowId }) => {
      const { data, error } = await attacker.client
        .from(table)
        .select('id')
        .eq('id', rowId())
      expect(error).toBeNull()
      expect(data).toEqual([])
    }
  )

  it.each(buildMatrix())(
    'attacker cannot DELETE %s',
    async ({ table, rowId }) => {
      const { data, error } = await attacker.client
        .from(table)
        .delete()
        .eq('id', rowId())
        .select('id')
      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501/)

      // Confirm row survives by reading as owner.
      const { data: check } = await owner.client
        .from(table)
        .select('id')
        .eq('id', rowId())
      expect(check).toHaveLength(1)
    }
  )

  it.each(buildMatrix().filter((m) => Object.keys(m.update).length > 0))(
    'attacker cannot UPDATE %s',
    async ({ table, rowId, update }) => {
      const { data, error } = await attacker.client
        .from(table)
        .update(update)
        .eq('id', rowId())
        .select('id')
      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501/)
    }
  )

  // `settlement_phase_returning_survivor` has a composite primary key
  // (settlement_phase_id, survivor_id) rather than a synthetic `id`, so it
  // can't ride the matrix above. It is still a settlement-scoped table —
  // non-owners must not be able to observe or mutate the join row.
  describe('settlement_phase_returning_survivor', () => {
    beforeAll(async () => {
      const { error } = await admin
        .from('settlement_phase_returning_survivor')
        .insert({
          settlement_id: fixture.settlementId,
          settlement_phase_id: fixture.settlementPhaseId,
          survivor_id: fixture.survivorId
        })
      if (error)
        throw new Error(
          `seed settlement_phase_returning_survivor: ${error.message}`
        )
    })

    it('owner CAN SELECT the join row', async () => {
      const { data, error } = await owner.client
        .from('settlement_phase_returning_survivor')
        .select('settlement_phase_id')
        .eq('settlement_phase_id', fixture.settlementPhaseId)
        .eq('survivor_id', fixture.survivorId)
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
    })

    it('attacker cannot SELECT the join row', async () => {
      const { data, error } = await attacker.client
        .from('settlement_phase_returning_survivor')
        .select('settlement_phase_id')
        .eq('settlement_phase_id', fixture.settlementPhaseId)
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    it('attacker cannot DELETE the join row', async () => {
      const { data } = await attacker.client
        .from('settlement_phase_returning_survivor')
        .delete()
        .eq('settlement_phase_id', fixture.settlementPhaseId)
        .eq('survivor_id', fixture.survivorId)
        .select('settlement_phase_id')
      expect(data ?? []).toEqual([])

      const { data: check } = await owner.client
        .from('settlement_phase_returning_survivor')
        .select('settlement_phase_id')
        .eq('settlement_phase_id', fixture.settlementPhaseId)
        .eq('survivor_id', fixture.survivorId)
      expect(check).toHaveLength(1)
    })

    it('attacker cannot INSERT a join row into another user settlement', async () => {
      const { data, error } = await attacker.client
        .from('settlement_phase_returning_survivor')
        .insert({
          settlement_id: fixture.settlementId,
          settlement_phase_id: fixture.settlementPhaseId,
          survivor_id: fixture.survivorId
        })
        .select('settlement_phase_id')
      expect(data ?? []).toEqual([])
      expect(error?.code).toMatch(/PGRST|42501|23505/)
    })
  })
})
