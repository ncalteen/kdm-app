import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RPC — `user_can_share()`
 *
 * SECURITY DEFINER predicate added by `20260530000000_user_can_share.sql`
 * (Epic E3 — Phase 3.2 / GitHub issue #174). Returns true iff the calling
 * user is on a `subscription_plan` whose `may_share = true` AND whose
 * `user_subscription.status` is `active` or `trialing`.
 *
 * The acceptance criteria spell out a four-cell matrix:
 *
 *   |             | active            | canceled         |
 *   | ----------- | ----------------- | ---------------- |
 *   | paid plan   | paid-active  ✅   | paid-canceled ⛔ |
 *   | free / anon | free          ⛔  | anonymous     ⛔ |
 *
 * A `trialing` Lantern Hoard user is asserted alongside the matrix to lock in
 * the second member of the status whitelist.
 */
describe('RPC: user_can_share', () => {
  let user: TestUser

  beforeAll(async () => {
    user = await createTestUser()
  })

  afterAll(async () => {
    await deleteTestUser(user.id)
  })

  /**
   * Set User Subscription
   *
   * Drives the test user into the requested entitlement cell. Uses the
   * service-role `admin` client so the update bypasses the RLS policy that
   * reserves `user_subscription` writes for service-role / admin contexts.
   *
   * @param planId Subscription Plan ID
   * @param status User Subscription Status
   */
  async function setUserSubscription(
    planId: 'free' | 'lantern' | 'lantern_hoard',
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
  ): Promise<void> {
    const { error } = await admin
      .from('user_subscription')
      .update({ plan_id: planId, status })
      .eq('user_id', user.id)
    expect(error).toBeNull()
  }

  it('returns true for an active Lantern Hoard subscriber (paid-active)', async () => {
    await setUserSubscription('lantern_hoard', 'active')

    const { data, error } = await user.client.rpc('user_can_share')
    expect(error).toBeNull()
    expect(data).toBe(true)
  })

  it('returns true for a trialing Lantern Hoard subscriber', async () => {
    // Locks in the second member of the status whitelist alongside `active`.
    await setUserSubscription('lantern_hoard', 'trialing')

    const { data, error } = await user.client.rpc('user_can_share')
    expect(error).toBeNull()
    expect(data).toBe(true)
  })

  it('returns false for a canceled Lantern Hoard subscriber (paid-canceled)', async () => {
    // Existing shares persist (see docs/settlement-sharing-architecture.md
    // §9.3), but the entitlement is paused so no new shares may be created.
    await setUserSubscription('lantern_hoard', 'canceled')

    const { data, error } = await user.client.rpc('user_can_share')
    expect(error).toBeNull()
    expect(data).toBe(false)
  })

  it('returns false for an active free-plan user (free)', async () => {
    await setUserSubscription('free', 'active')

    const { data, error } = await user.client.rpc('user_can_share')
    expect(error).toBeNull()
    expect(data).toBe(false)
  })

  it('rejects an anonymous caller (anonymous)', async () => {
    // EXECUTE was revoked from PUBLIC and from anon explicitly, so the
    // anon role cannot invoke the helper. (service_role still holds EXECUTE
    // via Supabase's default privileges — that's intentional and not what
    // this test exercises.)
    const anon = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_ANON_KEY ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data, error } = await anon.rpc('user_can_share')

    expect(data).toBeNull()
    expect(error).not.toBeNull()
    // Pin the failure to a permission-denied signal so the test can't
    // accidentally pass on an unrelated error. PostgREST surfaces
    // PostgreSQL's 42501 either as a top-level `code` or inside `message`
    // ("permission denied for function ..."); accept either.
    expect(
      error?.code === '42501' || /permission denied/i.test(error?.message ?? '')
    ).toBe(true)
  })
})
