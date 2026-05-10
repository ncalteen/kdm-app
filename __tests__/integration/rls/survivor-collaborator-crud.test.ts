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
 * RLS — Collaborator CRUD on Survivor + Survivor Junctions + Gear Grid
 *
 * Phase 1.2.c — collaborators on a shared settlement should now have full
 * INSERT/UPDATE/DELETE/SELECT access on `survivor`, the five survivor-owned
 * junction tables, and `gear_grid`, matching the owner's permissions.
 * Strangers must remain locked out.
 *
 * Tables exercised:
 *   survivor, survivor_disorder, survivor_fighting_art,
 *   survivor_secret_fighting_art, survivor_cursed_gear,
 *   survivor_ability_impairment, gear_grid.
 *
 * `survivor_status` is a CATALOG table (custom-content RLS), not a
 * survivor-owned junction, and is intentionally excluded from this matrix
 * even though the architecture doc lists it under "survivor child rows".
 * `hunt_survivor` / `showdown_survivor` are settlement-scoped and are
 * covered by [E1.2.d] (issue #140).
 *
 * The companion file `settlement-scoped.test.ts` continues to assert the
 * cross-user denial matrix for `survivor` and the survivor junctions, so
 * those non-member negative cases are not duplicated here.
 */
describe('RLS: collaborator CRUD on survivor + survivor junctions + gear_grid', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let catalog: SettlementFixture['catalogIds']
  let fixture: SettlementFixture
  let gearGridId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()
    catalog = await seedCatalog()
    fixture = await seedSettlementFixture(owner, catalog)
    await shareSettlement(fixture.settlementId, collaborator.id, owner.id)

    // gear_grid isn't seeded by the shared fixture — create one tied to the
    // fixture's survivor so the matrix below has something to read/update.
    const { data, error } = await admin
      .from('gear_grid')
      .insert({ survivor_id: fixture.survivorId })
      .select('id')
      .single<{ id: string }>()
    if (error || !data)
      throw new Error(`seed gear_grid: ${error?.message ?? 'no row'}`)
    gearGridId = data.id
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
    await deleteCatalog(catalog)
  })

  // ---------------------------------------------------------------------------
  // survivor (settlement_id is on the row).
  // ---------------------------------------------------------------------------
  describe('survivor', () => {
    it('collaborator CAN SELECT the seeded survivor row', async () => {
      const { data, error } = await collaborator.client
        .from('survivor')
        .select('id, settlement_id, survivor_name')
        .eq('id', fixture.survivorId)
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data?.[0]?.settlement_id).toBe(fixture.settlementId)
    })

    it('stranger CANNOT SELECT the seeded survivor row', async () => {
      const { data, error } = await stranger.client
        .from('survivor')
        .select('id')
        .eq('id', fixture.survivorId)
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    it('collaborator CAN INSERT a new survivor into the shared settlement', async () => {
      const { data, error } = await collaborator.client
        .from('survivor')
        .insert({
          settlement_id: fixture.settlementId,
          survivor_name: 'Collaborator Survivor',
          gender: 'FEMALE'
        })
        .select('id, settlement_id, survivor_name')
        .single()
      expect(error).toBeNull()
      expect(data?.settlement_id).toBe(fixture.settlementId)
      expect(data?.survivor_name).toBe('Collaborator Survivor')

      // Clean up so subsequent matrix queries (which assume one survivor)
      // remain stable.
      if (data?.id) await admin.from('survivor').delete().eq('id', data.id)
    })

    it('collaborator CAN UPDATE survivor attributes', async () => {
      const { data, error } = await collaborator.client
        .from('survivor')
        .update({ survivor_name: 'Renamed by collaborator', hunt_xp: 5 })
        .eq('id', fixture.survivorId)
        .select('id, survivor_name, hunt_xp')
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data?.[0]?.survivor_name).toBe('Renamed by collaborator')
      expect(data?.[0]?.hunt_xp).toBe(5)
    })

    it('stranger CANNOT UPDATE the survivor', async () => {
      const { data, error } = await stranger.client
        .from('survivor')
        .update({ survivor_name: 'HACKED' })
        .eq('id', fixture.survivorId)
        .select('id')
      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501/)
    })

    it('stranger CANNOT INSERT a survivor into another user settlement', async () => {
      const { data, error } = await stranger.client
        .from('survivor')
        .insert({
          settlement_id: fixture.settlementId,
          survivor_name: 'Lone Lantern',
          gender: 'MALE'
        })
        .select('id')
      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501/)
    })

    it('collaborator CAN DELETE + re-INSERT a survivor', async () => {
      // Insert a throwaway survivor first so we don't tear down the fixture
      // survivor (which the rest of the suite leans on).
      const { data: throwaway, error: insertError } = await collaborator.client
        .from('survivor')
        .insert({
          settlement_id: fixture.settlementId,
          survivor_name: 'Throwaway',
          gender: 'FEMALE'
        })
        .select('id')
        .single()
      expect(insertError).toBeNull()

      const { data: deleted, error: deleteError } = await collaborator.client
        .from('survivor')
        .delete()
        .eq('id', throwaway!.id)
        .select('id')
      expect(deleteError).toBeNull()
      expect(deleted).toHaveLength(1)
    })
  })

  // ---------------------------------------------------------------------------
  // Survivor-owned junctions (FK to survivor only).
  // ---------------------------------------------------------------------------
  const SURVIVOR_JUNCTION_TABLES = [
    'survivor_disorder',
    'survivor_fighting_art',
    'survivor_secret_fighting_art',
    'survivor_cursed_gear',
    'survivor_ability_impairment'
  ] as const

  /**
   * Build Junction Insert Row
   *
   * Returns a fresh insert payload for each junction. The fixture already
   * holds rows for each catalog, so the collaborator INSERT path needs the
   * fixture row to be removed first (the unique `(survivor_id, fk_id)`
   * constraint would otherwise short-circuit the policy check with a
   * 23505 unique violation, which would mask an RLS hole).
   */
  const buildJunctionInsertRow = (
    table: (typeof SURVIVOR_JUNCTION_TABLES)[number]
  ): Record<string, unknown> => {
    switch (table) {
      case 'survivor_disorder':
        return {
          survivor_id: fixture.survivorId,
          disorder_id: catalog.disorderId
        }
      case 'survivor_fighting_art':
        return {
          survivor_id: fixture.survivorId,
          fighting_art_id: catalog.fightingArtId
        }
      case 'survivor_secret_fighting_art':
        return {
          survivor_id: fixture.survivorId,
          secret_fighting_art_id: catalog.secretFightingArtId
        }
      case 'survivor_cursed_gear':
        return { survivor_id: fixture.survivorId, gear_id: catalog.gearId }
      case 'survivor_ability_impairment':
        return {
          survivor_id: fixture.survivorId,
          ability_impairment_id: catalog.abilityImpairmentId
        }
    }
  }

  it.each(SURVIVOR_JUNCTION_TABLES)(
    'collaborator CAN SELECT seeded row in %s',
    async (table) => {
      const rowId = fixture.survivorJunctionIds[table]
      const { data, error } = await collaborator.client
        .from(table)
        .select('id')
        .eq('id', rowId)
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
    }
  )

  it.each(SURVIVOR_JUNCTION_TABLES)(
    'stranger CANNOT SELECT seeded row in %s',
    async (table) => {
      const rowId = fixture.survivorJunctionIds[table]
      const { data, error } = await stranger.client
        .from(table)
        .select('id')
        .eq('id', rowId)
      expect(error).toBeNull()
      expect(data).toEqual([])
    }
  )

  it.each(SURVIVOR_JUNCTION_TABLES)(
    'collaborator CAN DELETE + re-INSERT row in %s',
    async (table) => {
      const rowId = fixture.survivorJunctionIds[table]

      // DELETE the seeded row.
      const { data: deleted, error: deleteError } = await collaborator.client
        .from(table)
        .delete()
        .eq('id', rowId)
        .select('id')
      expect(deleteError).toBeNull()
      expect(deleted).toHaveLength(1)

      // Re-INSERT to confirm the collaborator can write fresh rows.
      const { data: inserted, error: insertError } = await collaborator.client
        .from(table)
        .insert(buildJunctionInsertRow(table))
        .select('id')
        .single<{ id: string }>()
      expect(insertError).toBeNull()
      expect(inserted?.id).toBeDefined()

      // Restore the fixture invariant.
      if (inserted?.id) fixture.survivorJunctionIds[table] = inserted.id
    }
  )

  it.each(SURVIVOR_JUNCTION_TABLES)(
    'stranger CANNOT INSERT a row into %s for another user survivor',
    async (table) => {
      const rowId = fixture.survivorJunctionIds[table]
      const insertRow = buildJunctionInsertRow(table)

      // Make this test self-contained: remove the conflicting seeded row so
      // the assertion exercises RLS denial instead of depending on execution
      // order to avoid a 23505 unique-constraint error.
      const { error: deleteError } = await admin
        .from(table)
        .delete()
        .eq('id', rowId)
      expect(deleteError).toBeNull()

      try {
        const { data, error } = await stranger.client
          .from(table)
          .insert(insertRow)
          .select('id')
        expect(data ?? []).toEqual([])
        expect(error).not.toBeNull()
        if (error) expect(error.code).toMatch(/PGRST|42501/)
      } finally {
        const { data: restored, error: restoreError } = await admin
          .from(table)
          .insert(insertRow)
          .select('id')
          .single<{ id: string }>()
        expect(restoreError).toBeNull()
        expect(restored?.id).toBeDefined()
        if (restored?.id) fixture.survivorJunctionIds[table] = restored.id
      }
    }
  )

  // ---------------------------------------------------------------------------
  // gear_grid (FK to survivor; settlement-scoped via 20260503000000).
  // ---------------------------------------------------------------------------
  describe('gear_grid', () => {
    it('collaborator CAN SELECT the seeded grid', async () => {
      const { data, error } = await collaborator.client
        .from('gear_grid')
        .select('id, survivor_id')
        .eq('id', gearGridId)
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data?.[0]?.survivor_id).toBe(fixture.survivorId)
    })

    it('stranger CANNOT SELECT the seeded grid', async () => {
      const { data, error } = await stranger.client
        .from('gear_grid')
        .select('id')
        .eq('id', gearGridId)
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    it('collaborator CAN UPDATE grid positions', async () => {
      // The fixture seeds `settlement_gear` with quantity 0; the
      // gear_grid validation trigger (validate_gear_grid_positions in
      // 20260424000009) refuses to equip a gear that isn't in storage.
      // Bump the storage row to 1 so the RLS policy is what we are
      // actually exercising rather than the quantity trigger.
      const { error: settlementGearError } = await admin
        .from('settlement_gear')
        .update({ quantity: 1 })
        .eq('settlement_id', fixture.settlementId)
        .eq('gear_id', catalog.gearId)
      expect(settlementGearError).toBeNull()

      const { data, error } = await collaborator.client
        .from('gear_grid')
        .update({ pos_top_left: catalog.gearId })
        .eq('id', gearGridId)
        .select('id, pos_top_left')
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data?.[0]?.pos_top_left).toBe(catalog.gearId)
    })

    it('stranger CANNOT UPDATE the grid', async () => {
      const { data, error } = await stranger.client
        .from('gear_grid')
        .update({ pos_top_left: catalog.gearId })
        .eq('id', gearGridId)
        .select('id')
      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501/)
    })

    it('collaborator CAN INSERT + DELETE a fresh grid', async () => {
      // Spin up a second survivor so the new grid has its own owner row.
      const { data: extraSurvivor, error: setupError } = await admin
        .from('survivor')
        .insert({
          settlement_id: fixture.settlementId,
          survivor_name: 'Grid Owner',
          gender: 'FEMALE'
        })
        .select('id')
        .single<{ id: string }>()
      expect(setupError).toBeNull()

      try {
        const { data: inserted, error: insertError } = await collaborator.client
          .from('gear_grid')
          .insert({ survivor_id: extraSurvivor!.id })
          .select('id, survivor_id')
          .single()
        expect(insertError).toBeNull()
        expect(inserted?.survivor_id).toBe(extraSurvivor!.id)

        const { data: deleted, error: deleteError } = await collaborator.client
          .from('gear_grid')
          .delete()
          .eq('id', inserted!.id)
          .select('id')
        expect(deleteError).toBeNull()
        expect(deleted).toHaveLength(1)
      } finally {
        await admin.from('survivor').delete().eq('id', extraSurvivor!.id)
      }
    })

    it('stranger CANNOT INSERT a grid for another user survivor', async () => {
      const { data, error } = await stranger.client
        .from('gear_grid')
        .insert({ survivor_id: fixture.survivorId })
        .select('id')
      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501/)
    })
  })
})
