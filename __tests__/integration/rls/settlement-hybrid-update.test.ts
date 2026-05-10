import {
  admin,
  createTestUser,
  deleteTestUser,
  seedSettlement,
  shareSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Hybrid `settlement` UPDATE Policy
 *
 * Phase 1.3 (issue #133) replaces the old "owner OR shared full" pair of
 * UPDATE policies on `settlement` with a single helper-based "member"
 * policy plus a BEFORE UPDATE trigger that guards owner-only metadata
 * columns.
 *
 * Owner-only columns (collaborator UPDATE must raise `feature_not_supported`):
 *   `settlement_name`, `campaign_type`, `survivor_type`, `uses_scouts`,
 *   `user_id`.
 *
 * Collaborator-editable columns (collaborator UPDATE succeeds):
 *   `arrival_bonuses`, `current_year`, `departing_bonuses`, `notes`,
 *   `survival_limit`, `lantern_research`, `monster_volumes`.
 *
 * Stranger UPDATE on every column is denied by RLS (no member predicate).
 */
describe('RLS: hybrid settlement UPDATE policy', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let settlementId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()
    settlementId = await seedSettlement(owner.id, 'Hybrid Test Settlement')
    await shareSettlement(settlementId, collaborator.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  // ---------------------------------------------------------------------------
  // Collaborator-editable columns — UPDATE must succeed.
  // ---------------------------------------------------------------------------
  type EditableColumn = {
    column: string
    value: unknown
    expected?: unknown
  }
  const editableColumns: EditableColumn[] = [
    { column: 'arrival_bonuses', value: ['Arrival 1', 'Arrival 2'] },
    { column: 'current_year', value: 5 },
    { column: 'departing_bonuses', value: ['Departing 1'] },
    { column: 'notes', value: 'Lanterns flicker against the dark.' },
    { column: 'survival_limit', value: 9 },
    { column: 'lantern_research', value: 3 },
    { column: 'monster_volumes', value: ['White Lion'] }
  ]

  it.each(editableColumns)(
    'collaborator CAN UPDATE $column',
    async ({ column, value, expected }) => {
      const { data, error } = await collaborator.client
        .from('settlement')
        .update({ [column]: value })
        .eq('id', settlementId)
        .select(`id, ${column}`)
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      const row = data![0] as unknown as Record<string, unknown>
      expect(row[column]).toEqual(expected ?? value)
    }
  )

  // ---------------------------------------------------------------------------
  // Owner-only columns — collaborator UPDATE must raise the trigger error.
  // ---------------------------------------------------------------------------
  type OwnerOnlyColumn = {
    column: string
    value: unknown
  }
  const ownerOnlyColumns: OwnerOnlyColumn[] = [
    { column: 'settlement_name', value: 'GUEST WAS HERE' },
    { column: 'campaign_type', value: 'PEOPLE_OF_THE_SUN' },
    { column: 'survivor_type', value: 'ARC' },
    { column: 'uses_scouts', value: true }
  ]

  it.each(ownerOnlyColumns)(
    'collaborator CANNOT UPDATE $column (trigger raises feature_not_supported)',
    async ({ column, value }) => {
      // Capture the current owner-controlled value so we can assert the
      // trigger left it untouched.
      const { data: before } = await admin
        .from('settlement')
        .select(column)
        .eq('id', settlementId)
        .single<Record<string, unknown>>()
      const previousValue = before?.[column]

      const { data, error } = await collaborator.client
        .from('settlement')
        .update({ [column]: value })
        .eq('id', settlementId)
        .select('id')

      expect(error).not.toBeNull()
      // Strict check on the exact SQLSTATE raised by
      // `enforce_settlement_owner_only_columns` — a generic PGRST* error
      // would mean the request was denied earlier (e.g. by RLS) and the
      // trigger never fired.
      expect(error?.code).toBe('0A000')
      expect(data ?? []).toHaveLength(0)

      const { data: after } = await admin
        .from('settlement')
        .select(column)
        .eq('id', settlementId)
        .single<Record<string, unknown>>()
      expect(after?.[column]).toEqual(previousValue)
    }
  )

  // user_id needs a real, valid uuid to bypass FK; the trigger should fire
  // regardless because the column is in the owner-only list.
  it('collaborator CANNOT UPDATE user_id (trigger raises feature_not_supported)', async () => {
    const { data, error } = await collaborator.client
      .from('settlement')
      .update({ user_id: collaborator.id })
      .eq('id', settlementId)
      .select('id')
    expect(error).not.toBeNull()
    expect(error?.code).toBe('0A000')
    expect(data ?? []).toHaveLength(0)

    const { data: after } = await admin
      .from('settlement')
      .select('user_id')
      .eq('id', settlementId)
      .single<{ user_id: string }>()
    expect(after?.user_id).toBe(owner.id)
  })

  // ---------------------------------------------------------------------------
  // Owner — full CRUD on every column, including owner-only metadata.
  // ---------------------------------------------------------------------------
  it('owner CAN UPDATE every owner-only column', async () => {
    const { data, error } = await owner.client
      .from('settlement')
      .update({
        settlement_name: 'Renamed By Owner',
        campaign_type: 'PEOPLE_OF_THE_SUN',
        survivor_type: 'ARC',
        uses_scouts: true
      })
      .eq('id', settlementId)
      .select('id, settlement_name, campaign_type, survivor_type, uses_scouts')
      .single()
    expect(error).toBeNull()
    expect(data?.settlement_name).toBe('Renamed By Owner')
    expect(data?.campaign_type).toBe('PEOPLE_OF_THE_SUN')
    expect(data?.survivor_type).toBe('ARC')
    expect(data?.uses_scouts).toBe(true)

    // Restore initial values for any later assertions.
    await owner.client
      .from('settlement')
      .update({
        settlement_name: 'Hybrid Test Settlement',
        campaign_type: 'PEOPLE_OF_THE_LANTERN',
        survivor_type: 'CORE',
        uses_scouts: false
      })
      .eq('id', settlementId)
  })

  // ---------------------------------------------------------------------------
  // Immutable columns — both owner and collaborator are blocked from
  // changing `id` / `created_at`. The trigger raises before the
  // owner-only-column branch is consulted, so the error code is the same.
  // ---------------------------------------------------------------------------
  it('owner CANNOT UPDATE created_at (immutable)', async () => {
    const { data, error } = await owner.client
      .from('settlement')
      .update({ created_at: '2000-01-01T00:00:00Z' })
      .eq('id', settlementId)
      .select('id')
    expect(error).not.toBeNull()
    expect(error?.code).toBe('0A000')
    expect(data ?? []).toHaveLength(0)
  })

  it('collaborator CANNOT UPDATE created_at (immutable)', async () => {
    const { data, error } = await collaborator.client
      .from('settlement')
      .update({ created_at: '2000-01-01T00:00:00Z' })
      .eq('id', settlementId)
      .select('id')
    expect(error).not.toBeNull()
    expect(error?.code).toBe('0A000')
    expect(data ?? []).toHaveLength(0)
  })

  // ---------------------------------------------------------------------------
  // Stranger — RLS denies before the trigger ever runs.
  // ---------------------------------------------------------------------------
  it('stranger CANNOT UPDATE editable columns (RLS denial)', async () => {
    const { data, error } = await stranger.client
      .from('settlement')
      .update({ notes: 'stranger edit' })
      .eq('id', settlementId)
      .select('id')
    expect(data ?? []).toEqual([])
    if (error) expect(error.code).toMatch(/PGRST|42501/)
  })

  it('stranger CANNOT UPDATE owner-only columns (RLS denial)', async () => {
    const { data, error } = await stranger.client
      .from('settlement')
      .update({ settlement_name: 'stranger rename' })
      .eq('id', settlementId)
      .select('id')
    expect(data ?? []).toEqual([])
    if (error) expect(error.code).toMatch(/PGRST|42501/)
  })
})
