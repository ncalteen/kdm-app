import {
  deleteCatalog,
  seedCatalog,
  seedSettlementFixture,
  SettlementFixture
} from '@/__tests__/integration/helpers/fixtures'
import {
  createTestUser,
  deleteTestUser,
  shareSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Collaborator CRUD on `settlement_*` Junction Tables
 *
 * Phase 1.2.a — collaborators on a shared settlement should now have full
 * INSERT/UPDATE/DELETE/SELECT access on every `settlement_*` junction table,
 * matching the owner's permissions. Strangers must remain locked out.
 *
 * Tables exercised:
 *   settlement_collective_cognition_reward, settlement_gear,
 *   settlement_innovation, settlement_knowledge, settlement_location,
 *   settlement_milestone, settlement_nemesis, settlement_pattern,
 *   settlement_philosophy, settlement_principle, settlement_quarry,
 *   settlement_resource, settlement_seed_pattern, settlement_timeline_year
 */
describe('RLS: collaborator CRUD on settlement_* junction tables', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let catalog: SettlementFixture['catalogIds']
  let fixture: SettlementFixture

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()
    catalog = await seedCatalog()
    fixture = await seedSettlementFixture(owner, catalog)
    await shareSettlement(fixture.settlementId, collaborator.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
    await deleteCatalog(catalog)
  })

  /**
   * Build the matrix lazily — fixture IDs are populated in `beforeAll`
   * but vitest evaluates `it.each` arguments at collection time, so the
   * `rowId` getter has to close over the binding rather than capture its
   * value.
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

  /**
   * Insert payloads keyed by table. Each table has different required
   * non-FK columns, so each row needs its own catalog reference plus any
   * NOT NULL columns. `settlement_id` is filled in at call time so the
   * shape stays static.
   */
  const buildInsertRow = (table: string): Record<string, unknown> => {
    switch (table) {
      case 'settlement_collective_cognition_reward':
        return {
          collective_cognition_reward_id: catalog.collectiveCognitionRewardId
        }
      case 'settlement_gear':
        return { gear_id: catalog.gearId }
      case 'settlement_innovation':
        return { innovation_id: catalog.innovationId }
      case 'settlement_knowledge':
        return { knowledge_id: catalog.knowledgeId }
      case 'settlement_location':
        return { location_id: catalog.locationId }
      case 'settlement_milestone':
        return { milestone_id: catalog.milestoneId }
      case 'settlement_nemesis':
        return { nemesis_id: catalog.nemesisId }
      case 'settlement_pattern':
        return { pattern_id: catalog.patternId }
      case 'settlement_philosophy':
        return { philosophy_id: catalog.philosophyId }
      case 'settlement_principle':
        return { principle_id: catalog.principleId }
      case 'settlement_quarry':
        return { quarry_id: catalog.quarryId }
      case 'settlement_resource':
        return { resource_id: catalog.resourceId }
      case 'settlement_seed_pattern':
        return { seed_pattern_id: catalog.seedPatternId }
      case 'settlement_timeline_year':
        // year_number is unique per settlement and constrained to 0..50.
        // The fixture seeds year_number=0, so use a different valid value.
        return { year_number: 7 }
      default:
        throw new Error(`Unknown junction table: ${table}`)
    }
  }

  /**
   * Existing-row update payloads (mutable, non-FK columns where available).
   * Tables with no mutable non-FK columns return `{}`, so the matrix below
   * skips the UPDATE assertion for them.
   */
  const updatePayload: Record<string, object> = {
    settlement_collective_cognition_reward: {},
    settlement_gear: {},
    settlement_innovation: {},
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

  it.each(SETTLEMENT_JUNCTION_TABLES)(
    'collaborator CAN SELECT seeded row in %s',
    async (table) => {
      const rowId = fixture.settlementJunctionIds[table]
      const { data, error } = await collaborator.client
        .from(table)
        .select('id')
        .eq('id', rowId)
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
    }
  )

  it.each(SETTLEMENT_JUNCTION_TABLES)(
    'stranger CANNOT SELECT seeded row in %s',
    async (table) => {
      const rowId = fixture.settlementJunctionIds[table]
      const { data, error } = await stranger.client
        .from(table)
        .select('id')
        .eq('id', rowId)
      expect(error).toBeNull()
      expect(data).toEqual([])
    }
  )

  /**
   * Tracks IDs inserted by the collaborator so the matching UPDATE and
   * DELETE tests can operate against fresh collaborator-created rows
   * rather than the original seeded fixture rows.
   */
  const collaboratorInsertedIds: Record<string, string> = {}

  it.each(SETTLEMENT_JUNCTION_TABLES)(
    'collaborator CAN INSERT into %s',
    async (table) => {
      const row = {
        ...buildInsertRow(table),
        settlement_id: fixture.settlementId
      }

      // settlement_timeline_year is the only table with a unique
      // (settlement_id, year_number) constraint that conflicts with the
      // seeded fixture row at year_number=0; the buildInsertRow helper
      // already uses year_number=7. For tables with a (settlement_id, x_id)
      // unique index, the seeded fixture used the catalog row, so a second
      // insert with the same (settlement_id, x_id) would 23505. Resolve
      // by deleting the seeded row first so the collaborator's INSERT
      // has a clean slot.
      const seededId = fixture.settlementJunctionIds[table]
      if (table !== 'settlement_timeline_year' && seededId) {
        const { error: cleanupErr } = await owner.client
          .from(table)
          .delete()
          .eq('id', seededId)
        expect(cleanupErr).toBeNull()
      }

      const { data, error } = await collaborator.client
        .from(table)
        .insert(row)
        .select('id')
        .single<{ id: string }>()

      expect(error).toBeNull()
      expect(data?.id).toBeTruthy()
      if (data?.id) collaboratorInsertedIds[table] = data.id
    }
  )

  it.each(
    SETTLEMENT_JUNCTION_TABLES.filter(
      (t) => Object.keys(updatePayload[t]).length > 0
    )
  )('collaborator CAN UPDATE rows in %s', async (table) => {
    const rowId = collaboratorInsertedIds[table]
    if (!rowId) {
      throw new Error(
        `expected collaborator-inserted row id for ${table} from prior test`
      )
    }

    const { data, error } = await collaborator.client
      .from(table)
      .update(updatePayload[table])
      .eq('id', rowId)
      .select('id')

    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(1)
  })

  it.each(SETTLEMENT_JUNCTION_TABLES)(
    'collaborator CAN DELETE rows in %s',
    async (table) => {
      const rowId = collaboratorInsertedIds[table]
      if (!rowId) {
        throw new Error(
          `expected collaborator-inserted row id for ${table} from prior test`
        )
      }

      const { data, error } = await collaborator.client
        .from(table)
        .delete()
        .eq('id', rowId)
        .select('id')

      expect(error).toBeNull()
      expect(data ?? []).toHaveLength(1)
    }
  )

  it.each(SETTLEMENT_JUNCTION_TABLES)(
    'stranger CANNOT INSERT into %s for another user settlement',
    async (table) => {
      const row = {
        ...buildInsertRow(table),
        // Stranger should be denied before the constraint check runs;
        // year_number stays inside the valid 0..50 range to make the
        // assertion unambiguous.
        settlement_id: fixture.settlementId,
        ...(table === 'settlement_timeline_year' ? { year_number: 13 } : {})
      }

      const { data, error } = await stranger.client
        .from(table)
        .insert(row)
        .select('id')

      expect(data ?? []).toEqual([])
      expect(error).not.toBeNull()
      expect(error?.code).toMatch(/PGRST|42501/)
    }
  )

  it('owner retains full CRUD on the settlement (sanity check)', async () => {
    // Re-seed one timeline-year row so the owner-side delete has something
    // to remove, since prior tests may have cleared the originals.
    const { data: ins, error: insErr } = await owner.client
      .from('settlement_timeline_year')
      .insert({ settlement_id: fixture.settlementId, year_number: 1 })
      .select('id')
      .single<{ id: string }>()
    expect(insErr).toBeNull()
    expect(ins?.id).toBeTruthy()

    if (ins?.id) {
      const { data: upd, error: updErr } = await owner.client
        .from('settlement_timeline_year')
        .update({ completed: true })
        .eq('id', ins.id)
        .select('id')
      expect(updErr).toBeNull()
      expect(upd ?? []).toHaveLength(1)

      const { data: del, error: delErr } = await owner.client
        .from('settlement_timeline_year')
        .delete()
        .eq('id', ins.id)
        .select('id')
      expect(delErr).toBeNull()
      expect(del ?? []).toHaveLength(1)
    }
  })
})
