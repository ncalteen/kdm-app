import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '../helpers/supabase'

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

    // The `initialize_user_settings` trigger may auto-create a row on
    // user creation. Look it up; otherwise create one via admin.
    const { data: existing } = await admin
      .from('user_settings')
      .select('id')
      .eq('user_id', owner.id)
      .maybeSingle()

    if (existing) {
      ownerSettingsId = existing.id
    } else {
      const { data, error } = await admin
        .from('user_settings')
        .insert({ user_id: owner.id })
        .select('id')
        .single()
      if (error || !data)
        throw new Error(`seed user_settings: ${error?.message}`)
      ownerSettingsId = data.id
    }
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(attacker.id)
  })

  it('owner can SELECT their own settings', async () => {
    const { data, error } = await owner.client
      .from('user_settings')
      .select('id, unlocked_killenium_butcher')
      .eq('id', ownerSettingsId)
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
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
