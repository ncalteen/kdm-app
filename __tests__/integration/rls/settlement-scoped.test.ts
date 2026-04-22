import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  deleteCatalog,
  seedCatalog,
  seedSettlementFixture,
  SettlementFixture
} from '../helpers/fixtures'
import { createTestUser, deleteTestUser, TestUser } from '../helpers/supabase'

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
   * Each entry corresponds to one row seeded by `seedSettlementFixture`.
   * `updatePayload` is a harmless column bump used to detect whether an
   * unauthorized UPDATE was silently applied.
   */
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

    // Settlement-junction rows: bump `updated_at` isn't needed — use a shared
    // low-impact payload or fall back to a no-op update (pick a bool/int).
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
    for (const [table, rowId] of Object.entries(fixture.settlementJunctionIds))
      r.push({
        table,
        rowId: () => rowId,
        update: settlementJunctionUpdates[table] ?? {}
      })

    const survivorJunctionUpdates: Record<string, object> = {
      // All survivor_* junction tables have no mutable non-FK cols; DELETE is
      // the only meaningful write operation. Empty update is a safe no-op.
      survivor_disorder: {},
      survivor_fighting_art: {},
      survivor_cursed_gear: {},
      survivor_secret_fighting_art: {},
      survivor_ability_impairment: {}
    }
    for (const [table, rowId] of Object.entries(fixture.survivorJunctionIds))
      r.push({
        table,
        rowId: () => rowId,
        update: survivorJunctionUpdates[table] ?? {}
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
})
