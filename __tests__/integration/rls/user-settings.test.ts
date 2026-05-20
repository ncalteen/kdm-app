import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — `user_settings` Table
 *
 * Per-user settings must be strictly owner-only. No shared-user concept.
 */
describe('RLS: user_settings', () => {
  let owner: TestUser
  let attacker: TestUser
  let ownerSettingsId: string

  beforeAll(async () => {
    owner = await createTestUser()
    attacker = await createTestUser()

    // `createTestUser` seeds a user_settings row for the created user (so
    // that it satisfies the `settlement_shared_user.shared_user_id` FK).
    // Look it up.
    const { data, error } = await admin
      .from('user_settings')
      .select('id')
      .eq('user_id', owner.id)
      .single()
    if (error || !data)
      throw new Error(`lookup user_settings: ${error?.message}`)
    ownerSettingsId = data.id
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(attacker.id)
  })

  it('owner can SELECT their own settings', async () => {
    const { data, error } = await owner.client
      .from('user_settings')
      .select('app_role, id, unlocked_killenium_butcher')
      .eq('id', ownerSettingsId)
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data?.[0]?.app_role).toBe('user')
  })

  it('owner cannot promote themselves to admin', async () => {
    const { data, error } = await owner.client
      .from('user_settings')
      .update({ app_role: 'admin' })
      .eq('id', ownerSettingsId)
      .select('app_role')

    expect(data ?? []).toEqual([])
    expect(error?.code).toBe('42501')

    const { data: check } = await admin
      .from('user_settings')
      .select('app_role')
      .eq('id', ownerSettingsId)
      .single()
    expect(check?.app_role).toBe('user')
  })

  it('attacker cannot SELECT another user settings', async () => {
    const { data, error } = await attacker.client
      .from('user_settings')
      .select('id')
      .eq('id', ownerSettingsId)
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('attacker cannot UPDATE another user settings', async () => {
    const { data } = await attacker.client
      .from('user_settings')
      .update({ unlocked_killenium_butcher: true })
      .eq('id', ownerSettingsId)
      .select('id')
    expect(data ?? []).toEqual([])

    const { data: check } = await owner.client
      .from('user_settings')
      .select('unlocked_killenium_butcher')
      .eq('id', ownerSettingsId)
      .single()
    expect(check?.unlocked_killenium_butcher).toBe(false)
  })

  it('attacker cannot DELETE another user settings', async () => {
    const { data } = await attacker.client
      .from('user_settings')
      .delete()
      .eq('id', ownerSettingsId)
      .select('id')
    expect(data ?? []).toEqual([])

    const { data: check } = await owner.client
      .from('user_settings')
      .select('id')
      .eq('id', ownerSettingsId)
    expect(check).toHaveLength(1)
  })

  it('attacker cannot INSERT a settings row impersonating another user', async () => {
    // The INSERT with-check clause forces user_id = auth.uid(), and the
    // `user_id unique` constraint means a double-insert would collide anyway.
    const { data, error } = await attacker.client
      .from('user_settings')
      .insert({ user_id: owner.id })
      .select('id')
    expect(data ?? []).toEqual([])
    expect(error?.code).toMatch(/PGRST|42501|23505/)
  })
})
