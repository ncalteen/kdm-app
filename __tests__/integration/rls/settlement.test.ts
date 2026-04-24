import {
  createTestUser,
  deleteTestUser,
  seedSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Cross-User Access on `settlement` + junction tables
 *
 * Covers review item P0-1(2): a non-owner MUST NOT be able to select, update,
 * or delete another user's settlement rows.
 */
describe('RLS: settlement cross-user access', () => {
  let owner: TestUser
  let attacker: TestUser
  let settlementId: string

  beforeAll(async () => {
    owner = await createTestUser()
    attacker = await createTestUser()
    settlementId = await seedSettlement(owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(attacker.id)
  })

  it('owner can select their own settlement', async () => {
    const { data, error } = await owner.client
      .from('settlement')
      .select('id')
      .eq('id', settlementId)
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it('attacker cannot select the settlement', async () => {
    const { data, error } = await attacker.client
      .from('settlement')
      .select('id')
      .eq('id', settlementId)
    expect(error).toBeNull()
    // RLS hides the row — query succeeds but returns nothing.
    expect(data).toEqual([])
  })

  it('attacker cannot update the settlement', async () => {
    const { data, error } = await attacker.client
      .from('settlement')
      .update({ settlement_name: 'PWNED' })
      .eq('id', settlementId)
      .select('id')
    // Either an error OR zero rows affected is acceptable — BOTH a 200 + data
    // with the row would indicate a broken policy.
    expect(data ?? []).toHaveLength(0)
    if (error) expect(error.code).toMatch(/PGRST|42501/)
  })

  it('attacker cannot delete the settlement', async () => {
    const { data, error } = await attacker.client
      .from('settlement')
      .delete()
      .eq('id', settlementId)
      .select('id')
    expect(data ?? []).toHaveLength(0)
    if (error) expect(error.code).toMatch(/PGRST|42501/)
  })

  it('settlement still exists after attacker attempts', async () => {
    const { data } = await owner.client
      .from('settlement')
      .select('settlement_name')
      .eq('id', settlementId)
      .single()
    expect(data?.settlement_name).not.toBe('PWNED')
  })

  // Add one of these per junction table you want covered. Keeping the list
  // small here; grow as needed.
  const JUNCTION_TABLES = [
    'settlement_location',
    'settlement_innovation',
    'settlement_milestone',
    'settlement_nemesis',
    'settlement_quarry',
    'settlement_resource'
  ] as const

  for (const table of JUNCTION_TABLES)
    it(`attacker cannot select ${table} for another user's settlement`, async () => {
      const { data, error } = await attacker.client
        .from(table)
        .select('id')
        .eq('settlement_id', settlementId)
      expect(error).toBeNull()
      expect(data).toEqual([])
    })
})
