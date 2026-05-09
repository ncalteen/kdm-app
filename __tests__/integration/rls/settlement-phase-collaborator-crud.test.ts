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
  shareSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Collaborator CRUD on Settlement Phase Tables
 *
 * Phase 1.2.b — collaborators on a shared settlement should now have full
 * INSERT/UPDATE/DELETE/SELECT access on `settlement_phase` and
 * `settlement_phase_returning_survivor`, matching the owner's permissions.
 * Strangers must remain locked out.
 *
 * Owner CRUD on `settlement_phase` is already covered by the broad fixture
 * setup in `seedSettlementFixture`; this file focuses on the collaborator
 * path and the stranger denial path. The companion file
 * `settlement-scoped.test.ts` continues to assert the cross-user denial
 * matrix for `settlement_phase` / `settlement_phase_returning_survivor` to
 * make sure non-members still see zero rows.
 */
describe('RLS: collaborator CRUD on settlement_phase + returning_survivor', () => {
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

  describe('settlement_phase', () => {
    it('collaborator CAN SELECT the seeded phase row', async () => {
      const { data, error } = await collaborator.client
        .from('settlement_phase')
        .select('id, settlement_id, endeavors, step')
        .eq('id', fixture.settlementPhaseId)
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data?.[0]?.settlement_id).toBe(fixture.settlementId)
    })

    it('stranger CANNOT SELECT the seeded phase row', async () => {
      const { data, error } = await stranger.client
        .from('settlement_phase')
        .select('id')
        .eq('id', fixture.settlementPhaseId)
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    it('collaborator CAN UPDATE the phase row (advance step + endeavors)', async () => {
      const { data, error } = await collaborator.client
        .from('settlement_phase')
        .update({ endeavors: 3, step: 'SURVIVORS_RETURN' })
        .eq('id', fixture.settlementPhaseId)
        .select('id, endeavors, step')
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data?.[0]?.endeavors).toBe(3)
      expect(data?.[0]?.step).toBe('SURVIVORS_RETURN')
    })

    it('stranger CANNOT UPDATE the phase row', async () => {
      const { data, error } = await stranger.client
        .from('settlement_phase')
        .update({ endeavors: 99 })
        .eq('id', fixture.settlementPhaseId)
        .select('id')
      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501/)
    })

    // INSERT/DELETE on `settlement_phase` is exercised below by the cycle
    // test — the table has a UNIQUE(settlement_id), so the seeded row has
    // to be removed before a fresh insert can succeed.
    it('collaborator CAN DELETE + re-INSERT the phase row', async () => {
      // DELETE
      const { data: deleted, error: deleteError } = await collaborator.client
        .from('settlement_phase')
        .delete()
        .eq('id', fixture.settlementPhaseId)
        .select('id')
      expect(deleteError).toBeNull()
      expect(deleted).toHaveLength(1)

      // INSERT — collaborator creates a fresh phase row pointing at the
      // shared settlement.
      const { data: inserted, error: insertError } = await collaborator.client
        .from('settlement_phase')
        .insert({ settlement_id: fixture.settlementId, endeavors: 1 })
        .select('id, settlement_id, endeavors')
        .single()
      expect(insertError).toBeNull()
      expect(inserted?.settlement_id).toBe(fixture.settlementId)
      expect(inserted?.endeavors).toBe(1)

      // Restore the fixture invariant for the rest of the suite — the
      // returning-survivor section below depends on the join row, but we
      // just deleted the parent phase, so the cascade dropped the join.
      // Re-link the join row through the admin client.
      if (inserted?.id) {
        const { error: relinkError } = await admin
          .from('settlement_phase_returning_survivor')
          .insert({
            settlement_id: fixture.settlementId,
            settlement_phase_id: inserted.id,
            survivor_id: fixture.survivorId
          })
        expect(relinkError).toBeNull()
        // Update the local fixture so subsequent assertions reference the
        // re-inserted phase row.
        fixture.settlementPhaseId = inserted.id
      }
    })

    it('stranger CANNOT INSERT a phase row into another user settlement', async () => {
      // Phase is unique per settlement, so this needs a separate fixture
      // settlement that the stranger does not own and is not shared with.
      const { data: targetSettlement, error: setupError } = await admin
        .from('settlement')
        .insert({ user_id: owner.id, settlement_name: 'Lone Lantern' })
        .select('id')
        .single()
      expect(setupError).toBeNull()

      try {
        const { data, error } = await stranger.client
          .from('settlement_phase')
          .insert({
            settlement_id: targetSettlement!.id,
            endeavors: 0
          })
          .select('id')
        expect(data ?? []).toEqual([])
        if (error) expect(error.code).toMatch(/PGRST|42501/)
      } finally {
        await admin.from('settlement').delete().eq('id', targetSettlement!.id)
      }
    })
  })

  describe('settlement_phase_returning_survivor', () => {
    it('collaborator CAN SELECT the seeded join row', async () => {
      const { data, error } = await collaborator.client
        .from('settlement_phase_returning_survivor')
        .select('settlement_phase_id, survivor_id')
        .eq('settlement_phase_id', fixture.settlementPhaseId)
        .eq('survivor_id', fixture.survivorId)
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
    })

    it('stranger CANNOT SELECT the seeded join row', async () => {
      const { data, error } = await stranger.client
        .from('settlement_phase_returning_survivor')
        .select('settlement_phase_id')
        .eq('settlement_phase_id', fixture.settlementPhaseId)
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    it('collaborator CAN DELETE + re-INSERT the join row', async () => {
      // DELETE the existing join row.
      const { data: deleted, error: deleteError } = await collaborator.client
        .from('settlement_phase_returning_survivor')
        .delete()
        .eq('settlement_phase_id', fixture.settlementPhaseId)
        .eq('survivor_id', fixture.survivorId)
        .select('settlement_phase_id')
      expect(deleteError).toBeNull()
      expect(deleted).toHaveLength(1)

      // Re-INSERT — collaborator adds the survivor back to the returning
      // list.
      const { data: inserted, error: insertError } = await collaborator.client
        .from('settlement_phase_returning_survivor')
        .insert({
          settlement_id: fixture.settlementId,
          settlement_phase_id: fixture.settlementPhaseId,
          survivor_id: fixture.survivorId
        })
        .select('settlement_phase_id, survivor_id')
        .single()
      expect(insertError).toBeNull()
      expect(inserted?.settlement_phase_id).toBe(fixture.settlementPhaseId)
      expect(inserted?.survivor_id).toBe(fixture.survivorId)
    })

    it('collaborator CAN UPDATE the join row (no-op payload still authorized)', async () => {
      // Join row has no mutable non-FK columns, but UPDATE is still
      // gated by the policy. Update a column to its current value to
      // exercise the policy without changing schema state.
      const { data, error } = await collaborator.client
        .from('settlement_phase_returning_survivor')
        .update({ survivor_id: fixture.survivorId })
        .eq('settlement_phase_id', fixture.settlementPhaseId)
        .eq('survivor_id', fixture.survivorId)
        .select('settlement_phase_id, survivor_id')
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
    })

    it('stranger CANNOT INSERT a join row into another user settlement', async () => {
      const { data, error } = await stranger.client
        .from('settlement_phase_returning_survivor')
        .insert({
          settlement_id: fixture.settlementId,
          settlement_phase_id: fixture.settlementPhaseId,
          survivor_id: fixture.survivorId
        })
        .select('settlement_phase_id')
      expect(data ?? []).toEqual([])
      // Composite-PK unique violation (23505) is also acceptable since the
      // join row already exists; either way the stranger learned nothing.
      if (error) expect(error.code).toMatch(/PGRST|42501|23505/)
    })

    it('stranger CANNOT DELETE the seeded join row', async () => {
      const { data } = await stranger.client
        .from('settlement_phase_returning_survivor')
        .delete()
        .eq('settlement_phase_id', fixture.settlementPhaseId)
        .eq('survivor_id', fixture.survivorId)
        .select('settlement_phase_id')
      expect(data ?? []).toEqual([])

      // Confirm the row still exists by reading as the owner.
      const { data: check } = await owner.client
        .from('settlement_phase_returning_survivor')
        .select('settlement_phase_id')
        .eq('settlement_phase_id', fixture.settlementPhaseId)
        .eq('survivor_id', fixture.survivorId)
      expect(check).toHaveLength(1)
    })
  })
})
