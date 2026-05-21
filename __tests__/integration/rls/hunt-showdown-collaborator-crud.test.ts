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
 * RLS — Collaborator CRUD on Hunt + Showdown Tables
 *
 * Phase 1.2.d — collaborators on a shared settlement should now have full
 * INSERT/UPDATE/DELETE/SELECT access on every hunt and showdown table,
 * matching the owner's permissions. Strangers must remain locked out.
 *
 * Tables exercised (15):
 *   Direct-settlement (9): hunt, hunt_ai_deck, hunt_hunt_board,
 *     hunt_monster, hunt_survivor, showdown, showdown_ai_deck,
 *     showdown_monster, showdown_survivor.
 *   Monster-scoped (6): hunt_monster_trait, hunt_monster_mood,
 *     hunt_monster_survivor_status, showdown_monster_trait,
 *     showdown_monster_mood, showdown_monster_survivor_status.
 *
 * The fixture seeds the hunt graph against `settlementId` and the showdown
 * graph against a separate `showdownSettlementId` (because both `hunt` and
 * `showdown` carry a unique constraint on `settlement_id`). Both settlements
 * are shared with the collaborator so the matrix below is symmetric across
 * the hunt and showdown halves.
 */
describe('RLS: collaborator CRUD on hunt + showdown tables', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let catalog: SettlementFixture['catalogIds']
  let fixture: SettlementFixture
  let showdownSettlementId: string
  // Fresh catalog rows reserved for the stranger INSERT denial assertions.
  // Using these guarantees the (monster_id, catalog_id) pair has never
  // existed, so a 23505 unique-violation cannot mask an RLS hole. Each id is
  // cleaned up in afterAll via the admin client.
  const strangerCatalog: { trait?: string; mood?: string; status?: string } = {}

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()
    catalog = await seedCatalog()
    fixture = await seedSettlementFixture(owner, catalog)

    // The fixture seeds the showdown graph on a separate settlement; resolve
    // its id by walking back from the seeded showdown row.
    const { data, error } = await admin
      .from('showdown')
      .select('settlement_id')
      .eq('id', fixture.showdownId)
      .single<{ settlement_id: string }>()
    if (error || !data)
      throw new Error(`resolve showdown settlement: ${error?.message}`)
    showdownSettlementId = data.settlement_id

    await shareSettlement(fixture.settlementId, collaborator.id, owner.id)
    await shareSettlement(showdownSettlementId, collaborator.id, owner.id)

    // Seed dedicated catalog rows for the stranger INSERT denial cases —
    // see comment on `strangerCatalog` above.
    const seedExtra = async (
      table: string,
      row: Record<string, unknown>
    ): Promise<string> => {
      const { data: extra, error: extraErr } = await admin
        .from(table)
        .insert(row)
        .select('id')
        .single<{ id: string }>()
      if (extraErr || !extra)
        throw new Error(`seed extra ${table}: ${extraErr?.message}`)
      return extra.id
    }
    strangerCatalog.trait = await seedExtra('trait', {
      custom: false,
      trait_name: 'RLS Stranger Trait'
    })
    strangerCatalog.mood = await seedExtra('mood', {
      custom: false,
      mood_name: 'RLS Stranger Mood'
    })
    strangerCatalog.status = await seedExtra('survivor_status', {
      custom: false,
      survivor_status_name: 'RLS Stranger Status'
    })
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
    if (strangerCatalog.trait)
      await admin.from('trait').delete().eq('id', strangerCatalog.trait)
    if (strangerCatalog.mood)
      await admin.from('mood').delete().eq('id', strangerCatalog.mood)
    if (strangerCatalog.status)
      await admin
        .from('survivor_status')
        .delete()
        .eq('id', strangerCatalog.status)
    await deleteCatalog(catalog)
  })

  // ---------------------------------------------------------------------------
  // SELECT matrix.
  // ---------------------------------------------------------------------------
  type Row = { table: string; rowId: () => string }
  const buildSelectMatrix = (): Row[] => [
    // Direct-settlement (9)
    { table: 'hunt', rowId: () => fixture.huntId },
    { table: 'hunt_ai_deck', rowId: () => fixture.huntAiDeckId },
    { table: 'hunt_hunt_board', rowId: () => fixture.huntHuntBoardId },
    { table: 'hunt_monster', rowId: () => fixture.huntMonsterId },
    { table: 'hunt_survivor', rowId: () => fixture.huntSurvivorId },
    { table: 'showdown', rowId: () => fixture.showdownId },
    { table: 'showdown_ai_deck', rowId: () => fixture.showdownAiDeckId },
    { table: 'showdown_monster', rowId: () => fixture.showdownMonsterId },
    { table: 'showdown_survivor', rowId: () => fixture.showdownSurvivorId },
    // Monster-scoped (6)
    {
      table: 'hunt_monster_trait',
      rowId: () => fixture.monsterJunctionIds.hunt_monster_trait
    },
    {
      table: 'hunt_monster_mood',
      rowId: () => fixture.monsterJunctionIds.hunt_monster_mood
    },
    {
      table: 'hunt_monster_survivor_status',
      rowId: () => fixture.monsterJunctionIds.hunt_monster_survivor_status
    },
    {
      table: 'showdown_monster_trait',
      rowId: () => fixture.monsterJunctionIds.showdown_monster_trait
    },
    {
      table: 'showdown_monster_mood',
      rowId: () => fixture.monsterJunctionIds.showdown_monster_mood
    },
    {
      table: 'showdown_monster_survivor_status',
      rowId: () => fixture.monsterJunctionIds.showdown_monster_survivor_status
    }
  ]

  it.each(buildSelectMatrix())(
    'collaborator CAN SELECT seeded row in %s',
    async ({ table, rowId }) => {
      const { data, error } = await collaborator.client
        .from(table)
        .select('id')
        .eq('id', rowId())
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
    }
  )

  it.each(buildSelectMatrix())(
    'stranger CANNOT SELECT seeded row in %s',
    async ({ table, rowId }) => {
      const { data, error } = await stranger.client
        .from(table)
        .select('id')
        .eq('id', rowId())
      expect(error).toBeNull()
      expect(data).toEqual([])
    }
  )

  // ---------------------------------------------------------------------------
  // UPDATE matrix — only tables with a mutable non-FK column.
  // ---------------------------------------------------------------------------
  type UpdateRow = Row & { update: object }
  const buildUpdateMatrix = (): UpdateRow[] => [
    {
      table: 'hunt',
      rowId: () => fixture.huntId,
      update: { monster_level: 9 }
    },
    {
      table: 'hunt_ai_deck',
      rowId: () => fixture.huntAiDeckId,
      update: { basic_cards: 7 }
    },
    {
      table: 'hunt_hunt_board',
      rowId: () => fixture.huntHuntBoardId,
      update: { pos_1: 'BASIC' }
    },
    {
      table: 'hunt_monster',
      rowId: () => fixture.huntMonsterId,
      update: { wounds: 2 }
    },
    {
      table: 'hunt_survivor',
      rowId: () => fixture.huntSurvivorId,
      update: { notes: 'collab edit' }
    },
    {
      table: 'showdown',
      rowId: () => fixture.showdownId,
      update: { monster_level: 9 }
    },
    {
      table: 'showdown_ai_deck',
      rowId: () => fixture.showdownAiDeckId,
      update: { basic_cards: 7 }
    },
    {
      table: 'showdown_monster',
      rowId: () => fixture.showdownMonsterId,
      update: { wounds: 2 }
    },
    {
      table: 'showdown_survivor',
      rowId: () => fixture.showdownSurvivorId,
      update: { notes: 'collab edit' }
    }
  ]

  it.each(buildUpdateMatrix())(
    'collaborator CAN UPDATE %s',
    async ({ table, rowId, update }) => {
      const { data, error } = await collaborator.client
        .from(table)
        .update(update)
        .eq('id', rowId())
        .select('id')
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
    }
  )

  it.each(buildUpdateMatrix())(
    'stranger CANNOT UPDATE %s',
    async ({ table, rowId, update }) => {
      const { data, error } = await stranger.client
        .from(table)
        .update(update)
        .eq('id', rowId())
        .select('id')
      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501/)
    }
  )

  // ---------------------------------------------------------------------------
  // INSERT/DELETE matrix — monster-scoped junctions delete + re-insert
  // cleanly because the seeded row's composite (monster_id, catalog_id)
  // isn't repeated by anything else in the fixture.
  // ---------------------------------------------------------------------------
  type MonsterJunctionRow = {
    table: string
    parentMonsterId: () => string
    parentColumn: string
    catalogColumn: string
    catalogId: () => string
    // A separate catalog id reserved for the stranger INSERT denial test.
    // Pairing this with `parentMonsterId` produces a composite that has
    // never existed in the table, so a 23505 unique violation is impossible
    // and any insert failure must come from RLS.
    strangerCatalogId: () => string
    seededRowId: () => string
  }

  const monsterJunctions: MonsterJunctionRow[] = [
    {
      table: 'hunt_monster_trait',
      parentMonsterId: () => fixture.huntMonsterId,
      parentColumn: 'hunt_monster_id',
      catalogColumn: 'trait_id',
      catalogId: () => catalog.traitId,
      strangerCatalogId: () => strangerCatalog.trait!,
      seededRowId: () => fixture.monsterJunctionIds.hunt_monster_trait
    },
    {
      table: 'hunt_monster_mood',
      parentMonsterId: () => fixture.huntMonsterId,
      parentColumn: 'hunt_monster_id',
      catalogColumn: 'mood_id',
      catalogId: () => catalog.moodId,
      strangerCatalogId: () => strangerCatalog.mood!,
      seededRowId: () => fixture.monsterJunctionIds.hunt_monster_mood
    },
    {
      table: 'hunt_monster_survivor_status',
      parentMonsterId: () => fixture.huntMonsterId,
      parentColumn: 'hunt_monster_id',
      catalogColumn: 'survivor_status_id',
      catalogId: () => catalog.survivorStatusId,
      strangerCatalogId: () => strangerCatalog.status!,
      seededRowId: () => fixture.monsterJunctionIds.hunt_monster_survivor_status
    },
    {
      table: 'showdown_monster_trait',
      parentMonsterId: () => fixture.showdownMonsterId,
      parentColumn: 'showdown_monster_id',
      catalogColumn: 'trait_id',
      catalogId: () => catalog.traitId,
      strangerCatalogId: () => strangerCatalog.trait!,
      seededRowId: () => fixture.monsterJunctionIds.showdown_monster_trait
    },
    {
      table: 'showdown_monster_mood',
      parentMonsterId: () => fixture.showdownMonsterId,
      parentColumn: 'showdown_monster_id',
      catalogColumn: 'mood_id',
      catalogId: () => catalog.moodId,
      strangerCatalogId: () => strangerCatalog.mood!,
      seededRowId: () => fixture.monsterJunctionIds.showdown_monster_mood
    },
    {
      table: 'showdown_monster_survivor_status',
      parentMonsterId: () => fixture.showdownMonsterId,
      parentColumn: 'showdown_monster_id',
      catalogColumn: 'survivor_status_id',
      catalogId: () => catalog.survivorStatusId,
      strangerCatalogId: () => strangerCatalog.status!,
      seededRowId: () =>
        fixture.monsterJunctionIds.showdown_monster_survivor_status
    }
  ]

  it.each(monsterJunctions)(
    'collaborator CAN DELETE + re-INSERT row in $table',
    async (row) => {
      // DELETE the seeded row.
      const { data: deleted, error: deleteError } = await collaborator.client
        .from(row.table)
        .delete()
        .eq('id', row.seededRowId())
        .select('id')
      expect(deleteError).toBeNull()
      expect(deleted).toHaveLength(1)

      // Re-INSERT to confirm the collaborator can write fresh rows.
      const insertRow: Record<string, unknown> = {
        [row.parentColumn]: row.parentMonsterId(),
        [row.catalogColumn]: row.catalogId()
      }
      const { data: inserted, error: insertError } = await collaborator.client
        .from(row.table)
        .insert(insertRow)
        .select('id')
        .single<{ id: string }>()
      expect(insertError).toBeNull()
      expect(inserted?.id).toBeDefined()

      // Restore the fixture invariant for any tests below.
      if (inserted?.id) fixture.monsterJunctionIds[row.table] = inserted.id
    }
  )

  it.each(monsterJunctions)(
    'stranger CANNOT INSERT into $table for another user monster',
    async (row) => {
      // Pair the foreign monster with a catalog id reserved for the
      // stranger denial cases (seeded in beforeAll). The composite has
      // never existed in this table, so a 23505 unique-violation is
      // impossible. The denormalized-settlement trigger may now surface the
      // denial as the same generic 23503 parent reference used for missing
      // parents.
      const insertRow: Record<string, unknown> = {
        [row.parentColumn]: row.parentMonsterId(),
        [row.catalogColumn]: row.strangerCatalogId()
      }
      const { data, error } = await stranger.client
        .from(row.table)
        .insert(insertRow)
        .select('id')
      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501|23503/)
    }
  )

  // ---------------------------------------------------------------------------
  // Acceptance scenarios from the issue body.
  // ---------------------------------------------------------------------------
  describe('acceptance: gameplay actions', () => {
    it('collaborator CAN INSERT a fresh hunt_survivor row (start a hunt)', async () => {
      // Create a second survivor on the shared settlement so the new
      // hunt_survivor row doesn't collide with the seeded one
      // (unique on hunt_id, survivor_id).
      const { data: extraSurvivor, error: setupError } = await admin
        .from('survivor')
        .insert({
          settlement_id: fixture.settlementId,
          gender: 'FEMALE',
          survivor_name: 'Hunt-Phase Recruit'
        })
        .select('id')
        .single<{ id: string }>()
      expect(setupError).toBeNull()

      try {
        const { data: inserted, error: insertError } = await collaborator.client
          .from('hunt_survivor')
          .insert({
            hunt_id: fixture.huntId,
            settlement_id: fixture.settlementId,
            survivor_id: extraSurvivor!.id
          })
          .select('id, hunt_id, survivor_id')
          .single()
        expect(insertError).toBeNull()
        expect(inserted?.hunt_id).toBe(fixture.huntId)
        expect(inserted?.survivor_id).toBe(extraSurvivor!.id)

        // Cleanup so the fixture remains stable for subsequent tests.
        if (inserted?.id)
          await admin.from('hunt_survivor').delete().eq('id', inserted.id)
      } finally {
        await admin.from('survivor').delete().eq('id', extraSurvivor!.id)
      }
    })

    it('collaborator CAN advance the showdown (update monster_level + wounds)', async () => {
      const { data: showdownUpdate, error: showdownErr } =
        await collaborator.client
          .from('showdown')
          .update({ monster_level: 4 })
          .eq('id', fixture.showdownId)
          .select('id, monster_level')
      expect(showdownErr).toBeNull()
      expect(showdownUpdate?.[0]?.monster_level).toBe(4)

      const { data: monsterUpdate, error: monsterErr } =
        await collaborator.client
          .from('showdown_monster')
          .update({ wounds: 5 })
          .eq('id', fixture.showdownMonsterId)
          .select('id, wounds')
      expect(monsterErr).toBeNull()
      expect(monsterUpdate?.[0]?.wounds).toBe(5)
    })
  })
})
