import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — `subscription_plan` + `user_subscription` Tables
 *
 * Covers Epic E3.1 acceptance criteria (GitHub issues #168 and #232):
 *
 *   * The three canonical plans (`free`, `lantern`, `lantern_hoard`) exist
 *     with the correct entitlements.
 *   * Any authenticated user can SELECT the catalog of plans.
 *   * `user_subscription` is owner-private — readers cannot see another
 *     user's subscription row, and non-service-role clients cannot
 *     INSERT/UPDATE/DELETE rows.
 *   * The integration test helper seeds a `free` row for every new user,
 *     standing in for the production OAuth / email auto-provisioning
 *     paths.
 */
describe('RLS: subscription_plan + user_subscription', () => {
  let owner: TestUser
  let attacker: TestUser

  beforeAll(async () => {
    owner = await createTestUser()
    attacker = await createTestUser()
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(attacker.id)
  })

  describe('subscription_plan', () => {
    it('seeds the three canonical plans with the correct entitlements', async () => {
      const { data, error } = await admin
        .from('subscription_plan')
        .select('*')
        .order('monthly_price_cents', { ascending: true })

      expect(error).toBeNull()
      expect(data).toHaveLength(3)

      const byId = Object.fromEntries(
        (data ?? []).map((row) => [row.id, row])
      ) as Record<string, NonNullable<typeof data>[number]>

      expect(byId.free).toMatchObject({
        display_name: 'Wanderer',
        monthly_price_cents: 0,
        max_owned_settlements: 5,
        max_collaborators_per_settlement: null,
        may_share: false,
        may_be_invited: true,
        may_create_custom: true
      })
      expect(byId.lantern).toMatchObject({
        display_name: 'Lantern',
        monthly_price_cents: 100,
        max_owned_settlements: null,
        max_collaborators_per_settlement: null,
        may_share: false,
        may_be_invited: true,
        may_create_custom: true
      })
      expect(byId.lantern_hoard).toMatchObject({
        display_name: 'Lantern Hoard',
        monthly_price_cents: 500,
        max_owned_settlements: null,
        max_collaborators_per_settlement: null,
        may_share: true,
        may_be_invited: true,
        may_create_custom: true
      })
    })

    it('any authenticated user can SELECT the plan catalog', async () => {
      const { data, error } = await owner.client
        .from('subscription_plan')
        .select('id')
      expect(error).toBeNull()
      expect(data?.map((r) => r.id).sort()).toEqual([
        'free',
        'lantern',
        'lantern_hoard'
      ])
    })

    it('authenticated users cannot INSERT plans', async () => {
      const { data, error } = await owner.client
        .from('subscription_plan')
        .insert({
          id: 'pirate',
          display_name: 'Pirate',
          monthly_price_cents: 0
        })
        .select('id')
      // Either RLS denies silently (returning empty data) or PostgREST surfaces
      // a 42501 / PGRST permission error — both are acceptable RLS outcomes.
      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501/)
    })

    it('authenticated users cannot UPDATE plans', async () => {
      const { data } = await owner.client
        .from('subscription_plan')
        .update({ may_share: true })
        .eq('id', 'free')
        .select('id')
      expect(data ?? []).toEqual([])

      const { data: check } = await admin
        .from('subscription_plan')
        .select('may_share')
        .eq('id', 'free')
        .single()
      expect(check?.may_share).toBe(false)
    })
  })

  describe('user_subscription', () => {
    it('every new user is provisioned with a `free` subscription row', async () => {
      const { data, error } = await owner.client
        .from('user_subscription')
        .select('user_id, plan_id, status')
        .eq('user_id', owner.id)
        .single()
      expect(error).toBeNull()
      expect(data?.plan_id).toBe('free')
      expect(data?.status).toBe('active')
    })

    it('owner can SELECT their own subscription', async () => {
      const { data, error } = await owner.client
        .from('user_subscription')
        .select('plan_id')
      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data?.[0].plan_id).toBe('free')
    })

    it('attacker cannot SELECT another user subscription', async () => {
      const { data, error } = await attacker.client
        .from('user_subscription')
        .select('user_id')
        .eq('user_id', owner.id)
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    it('attacker cannot UPDATE another user subscription', async () => {
      const { data } = await attacker.client
        .from('user_subscription')
        .update({ plan_id: 'lantern_hoard' })
        .eq('user_id', owner.id)
        .select('user_id')
      expect(data ?? []).toEqual([])

      const { data: check } = await admin
        .from('user_subscription')
        .select('plan_id')
        .eq('user_id', owner.id)
        .single()
      expect(check?.plan_id).toBe('free')
    })

    it('owner cannot UPDATE their own plan (write reserved for service role)', async () => {
      const { data } = await owner.client
        .from('user_subscription')
        .update({ plan_id: 'lantern_hoard' })
        .eq('user_id', owner.id)
        .select('user_id')
      expect(data ?? []).toEqual([])

      const { data: check } = await admin
        .from('user_subscription')
        .select('plan_id')
        .eq('user_id', owner.id)
        .single()
      expect(check?.plan_id).toBe('free')
    })

    it('owner cannot INSERT a duplicate / impersonating subscription row', async () => {
      const { data, error } = await owner.client
        .from('user_subscription')
        .insert({ user_id: owner.id, plan_id: 'lantern_hoard' })
        .select('user_id')
      expect(data ?? []).toEqual([])
      if (error) expect(error.code).toMatch(/PGRST|42501|23505/)
    })

    it('owner cannot DELETE their own subscription row', async () => {
      const { data } = await owner.client
        .from('user_subscription')
        .delete()
        .eq('user_id', owner.id)
        .select('user_id')
      expect(data ?? []).toEqual([])

      const { data: check } = await admin
        .from('user_subscription')
        .select('user_id')
        .eq('user_id', owner.id)
      expect(check).toHaveLength(1)
    })
  })
})
