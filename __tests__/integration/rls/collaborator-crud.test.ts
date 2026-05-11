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
 * RLS — Collaborator CRUD Matrix (E1.11)
 *
 * Single regression smoke-test that consolidates the collaborator-CRUD
 * posture shipped in [E1.2.a] (#135), [E1.2.b] (#138), [E1.2.c] (#145),
 * [E1.2.d] (#140), and the hybrid settlement-row UPDATE policy from [E1.3]
 * (#133). The per-phase files exhaustively exercise each table group; this
 * file pins the full contract in one place so a future reader can grok the
 * collaborator authorization model end-to-end.
 *
 * Cast of users (created in `beforeAll`):
 *   - owner          — created the settlement
 *   - collaborator   — granted via `settlement_shared_user`
 *   - stranger       — no relationship to the settlement at all
 *
 * Contract assertions:
 *
 *   1. Settlement-scoped child tables ([E1.2.a]–[E1.2.d]):
 *      Collaborator can SELECT, INSERT, UPDATE, DELETE every row.
 *      Stranger gets zero rows / RLS denial on the same rows.
 *
 *   2. Settlement-row hybrid UPDATE policy ([E1.3]):
 *      Collaborator can UPDATE the gameplay-editable columns:
 *        arrival_bonuses, current_year, departing_bonuses, notes,
 *        survival_limit, lantern_research, monster_volumes.
 *      Collaborator CANNOT UPDATE the owner-only metadata columns
 *      (trigger raises SQLSTATE `0A000` / feature_not_supported):
 *        settlement_name, campaign_type, survivor_type, uses_scouts,
 *        user_id.
 *
 *   3. Settlement DELETE:
 *      Collaborator cannot delete the settlement (RLS denial).
 *
 *   4. Sharing controls:
 *      Collaborator cannot INSERT into `settlement_shared_user` (cannot
 *      share with another user — the policy requires
 *      `is_settlement_owner(settlement_id)`).
 *      Collaborator cannot DELETE rows from `settlement_shared_user`
 *      (cannot revoke their own or anyone else's share).
 *
 *   5. Stranger denial baseline:
 *      Stranger sees zero rows on a sampling across each table group.
 *
 *   6. Admin bypass:
 *      Admin (service-role) client can read every settlement-scoped table
 *      regardless of RLS predicates.
 *
 * The per-phase tests
 * (settlement-junction-collaborator-crud.test.ts,
 *  settlement-phase-collaborator-crud.test.ts,
 *  survivor-collaborator-crud.test.ts,
 *  hunt-showdown-collaborator-crud.test.ts,
 *  settlement-hybrid-update.test.ts)
 * are intentionally retained for their exhaustive per-table coverage. This
 * file does not duplicate every column-level case from those suites; it
 * pins one representative case per table group so the consolidated contract
 * fails loudly if any phase regresses.
 *
 * Scope explicitly out:
 *   - Catalog tables (covered by [E2.11] / [E2.12]).
 *   - Paywall (covered by [E3.12]).
 *   - survivor_status — catalog table, governed by E2.x.
 */
describe('RLS: collaborator CRUD matrix (E1.11)', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let catalog: SettlementFixture['catalogIds']
  let fixture: SettlementFixture
  let gearGridId: string
  let showdownSettlementId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()
    catalog = await seedCatalog()
    fixture = await seedSettlementFixture(owner, catalog)

    // gear_grid isn't seeded by the shared fixture — create one tied to the
    // fixture's survivor so the survivor-scoped matrix has something to
    // operate on.
    const { data: gearGridRow, error: gearGridErr } = await admin
      .from('gear_grid')
      .insert({ survivor_id: fixture.survivorId })
      .select('id')
      .single<{ id: string }>()
    if (gearGridErr || !gearGridRow)
      throw new Error(
        `seed gear_grid: ${gearGridErr?.message ?? 'no row returned'}`
      )
    gearGridId = gearGridRow.id

    // The fixture seeds the showdown graph on a separate settlement (because
    // `showdown.settlement_id` is unique). Both settlements need to be shared
    // with the collaborator so the showdown-side assertions can read /
    // mutate their rows.
    const { data: showdownRow, error: showdownErr } = await admin
      .from('showdown')
      .select('settlement_id')
      .eq('id', fixture.showdownId)
      .single<{ settlement_id: string }>()
    if (showdownErr || !showdownRow)
      throw new Error(
        `resolve showdown settlement: ${showdownErr?.message ?? 'no row'}`
      )
    showdownSettlementId = showdownRow.settlement_id

    await shareSettlement(fixture.settlementId, collaborator.id, owner.id)
    await shareSettlement(showdownSettlementId, collaborator.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
    await deleteCatalog(catalog)
  })

  // ===========================================================================
  // 1. Settlement-scoped child tables — collaborator CRUD parity.
  //
  // One representative table from each [E1.2.x] phase. Each test exercises
  // SELECT → INSERT → UPDATE → DELETE on a single throwaway row inserted by
  // the collaborator so the assertions are stateless and the fixture's
  // seeded rows survive for the stranger denial cases below.
  // ===========================================================================
  describe('settlement-scoped child tables (collaborator parity)', () => {
    it('[1.2.a] collaborator can full-CRUD settlement_timeline_year', async () => {
      // INSERT — year_number is unique per settlement; the fixture seeds 0,
      // so use a free slot.
      const { data: ins, error: insErr } = await collaborator.client
        .from('settlement_timeline_year')
        .insert({
          settlement_id: fixture.settlementId,
          year_number: 11
        })
        .select('id')
        .single<{ id: string }>()
      expect(insErr).toBeNull()
      expect(ins?.id).toBeTruthy()
      const rowId = ins!.id

      // SELECT
      const { data: sel, error: selErr } = await collaborator.client
        .from('settlement_timeline_year')
        .select('id, year_number, completed')
        .eq('id', rowId)
        .single()
      expect(selErr).toBeNull()
      expect(sel?.year_number).toBe(11)
      expect(sel?.completed).toBe(false)

      // UPDATE
      const { data: upd, error: updErr } = await collaborator.client
        .from('settlement_timeline_year')
        .update({ completed: true })
        .eq('id', rowId)
        .select('id, completed')
        .single()
      expect(updErr).toBeNull()
      expect(upd?.completed).toBe(true)

      // DELETE
      const { data: del, error: delErr } = await collaborator.client
        .from('settlement_timeline_year')
        .delete()
        .eq('id', rowId)
        .select('id')
      expect(delErr).toBeNull()
      expect(del ?? []).toHaveLength(1)
    })

    it('[1.2.b] collaborator can full-CRUD settlement_phase_returning_survivor', async () => {
      // INSERT — junction PK is (settlement_phase_id, survivor_id);
      // settlement_id is also NOT NULL on the row for the
      // cross-settlement consistency predicate added in 20260508000003.
      const { data: ins, error: insErr } = await collaborator.client
        .from('settlement_phase_returning_survivor')
        .insert({
          settlement_id: fixture.settlementId,
          settlement_phase_id: fixture.settlementPhaseId,
          survivor_id: fixture.survivorId
        })
        .select('settlement_phase_id, survivor_id')
        .single()
      expect(insErr).toBeNull()
      expect(ins?.settlement_phase_id).toBe(fixture.settlementPhaseId)

      // SELECT
      const { data: sel, error: selErr } = await collaborator.client
        .from('settlement_phase_returning_survivor')
        .select('settlement_phase_id, survivor_id')
        .eq('settlement_phase_id', fixture.settlementPhaseId)
        .eq('survivor_id', fixture.survivorId)
      expect(selErr).toBeNull()
      expect(sel).toHaveLength(1)

      // UPDATE — this junction has no mutable non-FK columns, so update the
      // parent settlement_phase row (also [E1.2.b]) to cover the UPDATE leg.
      // `step` is `settlement_phase_step` enum.
      const { data: upd, error: updErr } = await collaborator.client
        .from('settlement_phase')
        .update({ step: 'GAIN_ENDEAVORS' })
        .eq('id', fixture.settlementPhaseId)
        .select('id, step')
        .single()
      expect(updErr).toBeNull()
      expect(upd?.step).toBe('GAIN_ENDEAVORS')

      // DELETE
      const { data: del, error: delErr } = await collaborator.client
        .from('settlement_phase_returning_survivor')
        .delete()
        .eq('settlement_phase_id', fixture.settlementPhaseId)
        .eq('survivor_id', fixture.survivorId)
        .select('settlement_phase_id')
      expect(delErr).toBeNull()
      expect(del ?? []).toHaveLength(1)
    })

    it('[1.2.c] collaborator can full-CRUD survivor', async () => {
      // INSERT
      const { data: ins, error: insErr } = await collaborator.client
        .from('survivor')
        .insert({
          settlement_id: fixture.settlementId,
          gender: 'MALE',
          survivor_name: 'E1.11 Collaborator Survivor'
        })
        .select('id')
        .single<{ id: string }>()
      expect(insErr).toBeNull()
      expect(ins?.id).toBeTruthy()
      const rowId = ins!.id

      // SELECT
      const { data: sel, error: selErr } = await collaborator.client
        .from('survivor')
        .select('id, survivor_name, hunt_xp')
        .eq('id', rowId)
        .single()
      expect(selErr).toBeNull()
      expect(sel?.survivor_name).toBe('E1.11 Collaborator Survivor')

      // UPDATE
      const { data: upd, error: updErr } = await collaborator.client
        .from('survivor')
        .update({ hunt_xp: 4, survivor_name: 'Renamed by collaborator' })
        .eq('id', rowId)
        .select('id, hunt_xp, survivor_name')
        .single()
      expect(updErr).toBeNull()
      expect(upd?.hunt_xp).toBe(4)
      expect(upd?.survivor_name).toBe('Renamed by collaborator')

      // DELETE
      const { data: del, error: delErr } = await collaborator.client
        .from('survivor')
        .delete()
        .eq('id', rowId)
        .select('id')
      expect(delErr).toBeNull()
      expect(del ?? []).toHaveLength(1)
    })

    it('[1.2.c] collaborator can SELECT/UPDATE gear_grid (survivor-scoped)', async () => {
      // gear_grid is unique per survivor — one row already exists in
      // beforeAll. SELECT → UPDATE → confirm the row is still visible.
      const { data: sel, error: selErr } = await collaborator.client
        .from('gear_grid')
        .select('id, survivor_id')
        .eq('id', gearGridId)
        .single()
      expect(selErr).toBeNull()
      expect(sel?.survivor_id).toBe(fixture.survivorId)

      // The fixture seeds `settlement_gear` with quantity 0; the
      // gear_grid validation trigger (validate_gear_grid_positions in
      // 20260424000009) refuses to equip a gear that isn't in storage.
      // Bump the storage row to 1 so the RLS policy is what we are
      // actually exercising rather than the quantity trigger.
      const { error: stockErr } = await admin
        .from('settlement_gear')
        .update({ quantity: 1 })
        .eq('settlement_id', fixture.settlementId)
        .eq('gear_id', catalog.gearId)
      expect(stockErr).toBeNull()

      // Place a gear in the top-left slot. `pos_top_left` accepts any valid
      // gear id; the fixture seeds catalog.gearId before beforeAll runs so
      // this resolves to a real row that satisfies the FK.
      const { data: upd, error: updErr } = await collaborator.client
        .from('gear_grid')
        .update({ pos_top_left: catalog.gearId })
        .eq('id', gearGridId)
        .select('id, pos_top_left')
        .single()
      expect(updErr).toBeNull()
      expect(upd?.pos_top_left).toBe(catalog.gearId)
    })

    it('[1.2.d] collaborator can full-CRUD hunt_survivor (start-a-hunt smoke test)', async () => {
      // Insert a fresh survivor first — the seeded fixture's hunt_survivor
      // already occupies (hunt_id, survivor_id) for the original survivor.
      const { data: extraSurvivor, error: extraErr } = await collaborator.client
        .from('survivor')
        .insert({
          settlement_id: fixture.settlementId,
          gender: 'FEMALE',
          survivor_name: 'E1.11 Hunt Survivor'
        })
        .select('id')
        .single<{ id: string }>()
      expect(extraErr).toBeNull()
      expect(extraSurvivor?.id).toBeTruthy()
      const newSurvivorId = extraSurvivor!.id

      // INSERT hunt_survivor
      const { data: ins, error: insErr } = await collaborator.client
        .from('hunt_survivor')
        .insert({
          hunt_id: fixture.huntId,
          settlement_id: fixture.settlementId,
          survivor_id: newSurvivorId
        })
        .select('id')
        .single<{ id: string }>()
      expect(insErr).toBeNull()
      expect(ins?.id).toBeTruthy()
      const huntSurvivorRowId = ins!.id

      // SELECT
      const { data: sel, error: selErr } = await collaborator.client
        .from('hunt_survivor')
        .select('id, hunt_id, survivor_id')
        .eq('id', huntSurvivorRowId)
        .single()
      expect(selErr).toBeNull()
      expect(sel?.hunt_id).toBe(fixture.huntId)

      // UPDATE — bump hunt.monster_level to cover [E1.2.d] update on `hunt`.
      const { data: upd, error: updErr } = await collaborator.client
        .from('hunt')
        .update({ monster_level: 2 })
        .eq('id', fixture.huntId)
        .select('id, monster_level')
        .single()
      expect(updErr).toBeNull()
      expect(upd?.monster_level).toBe(2)

      // DELETE
      const { data: del, error: delErr } = await collaborator.client
        .from('hunt_survivor')
        .delete()
        .eq('id', huntSurvivorRowId)
        .select('id')
      expect(delErr).toBeNull()
      expect(del ?? []).toHaveLength(1)

      // Tidy up the extra survivor row.
      await collaborator.client
        .from('survivor')
        .delete()
        .eq('id', newSurvivorId)
    })

    it('[1.2.d] collaborator can UPDATE showdown (advance-a-showdown smoke test)', async () => {
      const { data, error } = await collaborator.client
        .from('showdown')
        .update({ monster_level: 3 })
        .eq('id', fixture.showdownId)
        .select('id, monster_level')
        .single()
      expect(error).toBeNull()
      expect(data?.monster_level).toBe(3)
    })

    it('[1.2.d] collaborator can full-CRUD showdown_monster_trait (monster-scoped junction)', async () => {
      // Seed a fresh trait so the (showdown_monster_id, trait_id) pair has
      // never existed — guarantees the INSERT is exercised against RLS, not
      // a 23505 unique-violation path.
      const { data: extraTrait, error: traitErr } = await admin
        .from('trait')
        .insert({ custom: false, trait_name: 'E1.11 Showdown Trait' })
        .select('id')
        .single<{ id: string }>()
      expect(traitErr).toBeNull()
      expect(extraTrait?.id).toBeTruthy()
      const traitId = extraTrait!.id

      try {
        // INSERT
        const { data: ins, error: insErr } = await collaborator.client
          .from('showdown_monster_trait')
          .insert({
            showdown_monster_id: fixture.showdownMonsterId,
            trait_id: traitId
          })
          .select('id')
          .single<{ id: string }>()
        expect(insErr).toBeNull()
        expect(ins?.id).toBeTruthy()
        const rowId = ins!.id

        // SELECT
        const { data: sel, error: selErr } = await collaborator.client
          .from('showdown_monster_trait')
          .select('id, showdown_monster_id, trait_id')
          .eq('id', rowId)
          .single()
        expect(selErr).toBeNull()
        expect(sel?.showdown_monster_id).toBe(fixture.showdownMonsterId)

        // UPDATE — this junction has no mutable non-FK columns, so cover the
        // UPDATE leg via the parent showdown_monster row (also monster-scoped
        // under the same predicate).
        const { data: upd, error: updErr } = await collaborator.client
          .from('showdown_monster')
          .update({ wounds: 1 })
          .eq('id', fixture.showdownMonsterId)
          .select('id, wounds')
          .single()
        expect(updErr).toBeNull()
        expect(upd?.wounds).toBe(1)

        // DELETE
        const { data: del, error: delErr } = await collaborator.client
          .from('showdown_monster_trait')
          .delete()
          .eq('id', rowId)
          .select('id')
        expect(delErr).toBeNull()
        expect(del ?? []).toHaveLength(1)
      } finally {
        await admin.from('trait').delete().eq('id', traitId)
      }
    })
  })

  // ===========================================================================
  // 2. Settlement-row hybrid UPDATE policy ([E1.3]).
  // ===========================================================================
  describe('settlement-row hybrid UPDATE policy', () => {
    type EditableColumn = { column: string; value: unknown }
    const editableColumns: EditableColumn[] = [
      { column: 'arrival_bonuses', value: ['E1.11 Arrival'] },
      { column: 'current_year', value: 8 },
      { column: 'departing_bonuses', value: ['E1.11 Departure'] },
      { column: 'notes', value: 'E1.11 — the lantern is shared.' },
      { column: 'survival_limit', value: 12 },
      { column: 'lantern_research', value: 5 },
      { column: 'monster_volumes', value: ['White Lion'] }
    ]

    it.each(editableColumns)(
      'collaborator CAN UPDATE editable column $column',
      async ({ column, value }) => {
        const { data, error } = await collaborator.client
          .from('settlement')
          .update({ [column]: value })
          .eq('id', fixture.settlementId)
          .select(`id, ${column}`)
          .single()
        expect(error).toBeNull()
        const row = data as unknown as Record<string, unknown>
        expect(row[column]).toEqual(value)
      }
    )

    type OwnerOnlyColumn = { column: string; value: unknown }
    const ownerOnlyColumns: OwnerOnlyColumn[] = [
      { column: 'settlement_name', value: 'GUEST WAS HERE' },
      { column: 'campaign_type', value: 'PEOPLE_OF_THE_SUN' },
      { column: 'survivor_type', value: 'ARC' },
      { column: 'uses_scouts', value: true }
    ]

    it.each(ownerOnlyColumns)(
      'collaborator CANNOT UPDATE owner-only column $column (trigger raises 0A000)',
      async ({ column, value }) => {
        // Capture the current value so we can prove the trigger left it
        // unchanged.
        const { data: before } = await admin
          .from('settlement')
          .select(column)
          .eq('id', fixture.settlementId)
          .single<Record<string, unknown>>()
        const previousValue = before?.[column]

        const { data, error } = await collaborator.client
          .from('settlement')
          .update({ [column]: value })
          .eq('id', fixture.settlementId)
          .select('id')

        expect(error).not.toBeNull()
        // Strict check on the exact SQLSTATE raised by
        // `enforce_settlement_owner_only_columns`. A generic PGRST* code
        // would mean the request was denied earlier (e.g. by RLS) and the
        // trigger never fired — not what this test pins.
        expect(error?.code).toBe('0A000')
        expect(data ?? []).toHaveLength(0)

        const { data: after } = await admin
          .from('settlement')
          .select(column)
          .eq('id', fixture.settlementId)
          .single<Record<string, unknown>>()
        expect(after?.[column]).toEqual(previousValue)
      }
    )

    it('collaborator CANNOT UPDATE user_id (owner-only — trigger raises 0A000)', async () => {
      // user_id needs a real, valid uuid to bypass FK; the trigger should
      // fire regardless because the column is in the owner-only list.
      const { data, error } = await collaborator.client
        .from('settlement')
        .update({ user_id: collaborator.id })
        .eq('id', fixture.settlementId)
        .select('id')
      expect(error).not.toBeNull()
      expect(error?.code).toBe('0A000')
      expect(data ?? []).toHaveLength(0)

      const { data: after } = await admin
        .from('settlement')
        .select('user_id')
        .eq('id', fixture.settlementId)
        .single<{ user_id: string }>()
      expect(after?.user_id).toBe(owner.id)
    })
  })

  // ===========================================================================
  // 3. Settlement DELETE — collaborator denial.
  // ===========================================================================
  describe('settlement DELETE', () => {
    it('collaborator CANNOT DELETE the settlement (RLS denial)', async () => {
      const { data, error } = await collaborator.client
        .from('settlement')
        .delete()
        .eq('id', fixture.settlementId)
        .select('id')

      expect(data ?? []).toHaveLength(0)
      if (error) expect(error.code).toMatch(/PGRST|42501/)

      // Belt-and-suspenders: row must survive.
      const { data: check } = await admin
        .from('settlement')
        .select('id')
        .eq('id', fixture.settlementId)
      expect(check).toHaveLength(1)
    })
  })

  // ===========================================================================
  // 4. Sharing controls — collaborator cannot share or revoke share.
  // ===========================================================================
  describe('settlement_shared_user — collaborator cannot share or revoke', () => {
    it('collaborator CANNOT INSERT a new share (owner-only INSERT policy)', async () => {
      const { data, error } = await collaborator.client
        .from('settlement_shared_user')
        .insert({
          settlement_id: fixture.settlementId,
          shared_user_id: stranger.id,
          user_id: collaborator.id
        })
        .select('settlement_id, shared_user_id')

      expect(data ?? []).toEqual([])
      expect(error).not.toBeNull()
      // The policy `with check` clause requires
      // `is_settlement_owner(settlement_id)`. A non-owner caller is rejected
      // with the standard RLS denial.
      expect(error?.code).toMatch(/PGRST|42501/)

      // Confirm no share row was created.
      const { data: check } = await admin
        .from('settlement_shared_user')
        .select('shared_user_id')
        .eq('settlement_id', fixture.settlementId)
        .eq('shared_user_id', stranger.id)
      expect(check ?? []).toEqual([])
    })

    it('collaborator CANNOT DELETE share rows (owner-only DELETE policy)', async () => {
      // Try to revoke their own access — RLS forbids it.
      const { data, error } = await collaborator.client
        .from('settlement_shared_user')
        .delete()
        .eq('settlement_id', fixture.settlementId)
        .eq('shared_user_id', collaborator.id)
        .select('shared_user_id')

      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501/)

      // Confirm the share row survives.
      const { data: check } = await admin
        .from('settlement_shared_user')
        .select('shared_user_id')
        .eq('settlement_id', fixture.settlementId)
        .eq('shared_user_id', collaborator.id)
        .single<{ shared_user_id: string }>()
      expect(check?.shared_user_id).toBe(collaborator.id)
    })
  })

  // ===========================================================================
  // 5. Stranger denial baseline — one row per table group.
  //
  // A small sampling is sufficient because `settlement-scoped.test.ts` (and
  // each per-phase file) already exhaustively asserts stranger denial across
  // every table. This block keeps the consolidated regression smoke-test
  // honest by pinning the contract at the entry point of each group.
  // ===========================================================================
  describe('stranger denial baseline', () => {
    type StrangerCase = { label: string; table: string; rowId: () => string }
    const cases: StrangerCase[] = [
      {
        label: 'settlement',
        table: 'settlement',
        rowId: () => fixture.settlementId
      },
      {
        label: 'survivor',
        table: 'survivor',
        rowId: () => fixture.survivorId
      },
      { label: 'hunt', table: 'hunt', rowId: () => fixture.huntId },
      {
        label: 'showdown',
        table: 'showdown',
        rowId: () => fixture.showdownId
      },
      {
        label: 'settlement_phase',
        table: 'settlement_phase',
        rowId: () => fixture.settlementPhaseId
      },
      {
        label: 'settlement_timeline_year (junction)',
        table: 'settlement_timeline_year',
        rowId: () => fixture.settlementJunctionIds.settlement_timeline_year
      },
      {
        label: 'survivor_disorder (survivor junction)',
        table: 'survivor_disorder',
        rowId: () => fixture.survivorJunctionIds.survivor_disorder
      },
      {
        label: 'hunt_monster_trait (monster junction)',
        table: 'hunt_monster_trait',
        rowId: () => fixture.monsterJunctionIds.hunt_monster_trait
      }
    ]

    it.each(cases)(
      'stranger gets zero rows on $label',
      async ({ table, rowId }) => {
        const { data, error } = await stranger.client
          .from(table)
          .select('id')
          .eq('id', rowId())
        expect(error).toBeNull()
        expect(data).toEqual([])
      }
    )

    it('stranger CANNOT INSERT into the shared settlement (survivor)', async () => {
      const { data, error } = await stranger.client
        .from('survivor')
        .insert({
          settlement_id: fixture.settlementId,
          gender: 'MALE',
          survivor_name: 'Stranger Intrusion'
        })
        .select('id')

      expect(data ?? []).toEqual([])
      expect(error).not.toBeNull()
      expect(error?.code).toMatch(/PGRST|42501/)
    })
  })

  // ===========================================================================
  // 6. Admin bypass — service-role client sees every table irrespective of
  // RLS. The integration test helpers' `admin` client is the same one the
  // app's seeding / migrations use; this test pins that the admin bypass
  // remains intact after every collaborator policy rewrite.
  // ===========================================================================
  describe('admin bypass', () => {
    type AdminCase = { table: string; rowId: () => string }
    const adminCases: AdminCase[] = [
      { table: 'settlement', rowId: () => fixture.settlementId },
      { table: 'survivor', rowId: () => fixture.survivorId },
      { table: 'hunt', rowId: () => fixture.huntId },
      { table: 'showdown', rowId: () => fixture.showdownId },
      {
        table: 'settlement_phase',
        rowId: () => fixture.settlementPhaseId
      },
      {
        table: 'settlement_timeline_year',
        rowId: () => fixture.settlementJunctionIds.settlement_timeline_year
      },
      {
        table: 'survivor_disorder',
        rowId: () => fixture.survivorJunctionIds.survivor_disorder
      },
      {
        table: 'hunt_monster_trait',
        rowId: () => fixture.monsterJunctionIds.hunt_monster_trait
      }
    ]

    it.each(adminCases)(
      'admin can SELECT from $table regardless of RLS',
      async ({ table, rowId }) => {
        const { data, error } = await admin
          .from(table)
          .select('id')
          .eq('id', rowId())
        expect(error).toBeNull()
        expect(data).toHaveLength(1)
      }
    )
  })
})
