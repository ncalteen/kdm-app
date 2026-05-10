import {
  createTestUser,
  deleteTestUser,
  seedSettlement,
  shareSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Shared-User Access Semantics
 *
 * Covers review item P0-1(3): a user who has been granted access via
 * `settlement_shared_user` should be able to READ the settlement, but should
 * NOT be able to delete it or perform owner-only destructive actions.
 *
 * If your current policy intentionally grants shared users write access,
 * flip the relevant `expect` below — but make the assertion explicit so the
 * policy choice is documented in tests.
 */
describe('RLS: shared-user access on settlement', () => {
  let owner: TestUser
  let guest: TestUser
  let settlementId: string

  beforeAll(async () => {
    owner = await createTestUser()
    guest = await createTestUser()
    settlementId = await seedSettlement(owner.id, 'Shared Test Settlement')
    await shareSettlement(settlementId, guest.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(guest.id)
  })

  it('guest CAN select the shared settlement', async () => {
    const { data, error } = await guest.client
      .from('settlement')
      .select('id, settlement_name')
      .eq('id', settlementId)
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it('guest CANNOT delete the shared settlement', async () => {
    const { data, error } = await guest.client
      .from('settlement')
      .delete()
      .eq('id', settlementId)
      .select('id')
    expect(data ?? []).toHaveLength(0)
    if (error) expect(error.code).toMatch(/PGRST|42501/)

    // Confirm the row survives.
    const { data: check } = await owner.client
      .from('settlement')
      .select('id')
      .eq('id', settlementId)
    expect(check).toHaveLength(1)
  })

  it('guest CANNOT remove their own share row via settlement delete', async () => {
    // Belt-and-suspenders: even if guest deletes their share link, ownership
    // should remain with the owner.
    await guest.client
      .from('settlement_shared_user')
      .delete()
      .eq('settlement_id', settlementId)
      .eq('shared_user_id', guest.id)

    const { data } = await owner.client
      .from('settlement')
      .select('id')
      .eq('id', settlementId)
    expect(data).toHaveLength(1)
  })

  // Phase 1.3 (issue #133): the `Allow update for member` policy lets
  // collaborators pass RLS, but the `enforce_settlement_owner_only_columns`
  // BEFORE UPDATE trigger raises `feature_not_supported` (SQLSTATE 0A000)
  // when a non-owner mutates settlement metadata. The previous version of
  // this test pinned the looser behaviour; it is now an explicit denial
  // assertion.
  it('guest CANNOT update settlement_name (owner-only column)', async () => {
    const { data, error } = await guest.client
      .from('settlement')
      .update({ settlement_name: 'GUEST WAS HERE' })
      .eq('id', settlementId)
      .select('id')

    expect(error).not.toBeNull()
    // PGRST204 / 0A000 (feature_not_supported) — Postgres surfaces the
    // raise in the trigger via PostgREST as the SQLSTATE code.
    expect(error?.code).toMatch(/0A000|PGRST/)
    expect(data ?? []).toHaveLength(0)

    // Confirm the row was not modified.
    const { data: check } = await owner.client
      .from('settlement')
      .select('settlement_name')
      .eq('id', settlementId)
      .single()
    expect(check?.settlement_name).toBe('Shared Test Settlement')
  })
})
