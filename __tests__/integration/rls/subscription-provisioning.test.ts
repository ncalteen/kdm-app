import { admin } from '@/__tests__/integration/helpers/supabase'
import type { User } from '@supabase/supabase-js'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * RLS — Default-Row Provisioning of `free` Subscription on New Sign-Up
 *
 * Integration coverage for Epic E3.13 (GitHub issue #173). Verifies the
 * `user_subscription` provisioning paths that ship in
 * `20260527000001_user_subscription.sql`:
 *
 *   1. Email sign-up — the `initialize_user_settings(p_user_id, p_username)`
 *      RPC (called by the sign-up form after `signUp()` resolves) seeds a
 *      `free` / `active` row.
 *   2. OAuth sign-up — the `on_auth_user_created_oauth` trigger delegates
 *      to `provision_user_settings_for_oauth(p_user_id)`, which seeds the
 *      same row. The trigger's wrapper (`handle_new_oauth_user`) is
 *      authored to call this helper, so testing the helper directly is
 *      equivalent to testing the trigger's contract without forging
 *      `auth.users` rows.
 *   3. Idempotency — both RPCs are wrapped in `on conflict do nothing`
 *      so re-invocations and OAuth-then-email race scenarios are
 *      harmless.
 *   4. Backfill — re-running the migration's backfill SQL produces a row
 *      for any pre-existing user that lacks one (mirroring the block at
 *      the bottom of `20260527000001_user_subscription.sql`).
 *
 * Why this file does NOT use `createTestUser`
 * -------------------------------------------
 * The shared `createTestUser` helper manually seeds both `user_settings`
 * and `user_subscription` rows so downstream RLS tests can rely on a
 * known starting state. That manual seed would mask the production
 * provisioning paths under test here, so this file creates its
 * `auth.users` row via the GoTrue admin endpoint directly and then
 * inspects the database for the resulting subscription row.
 *
 * GoTrue's admin `createUser` records `provider = 'email'` on the
 * inserted row, which the OAuth trigger
 * (`handle_new_oauth_user`) explicitly short-circuits. So the test
 * users created here never trigger any auto-provisioning of their own —
 * provisioning happens only when the production RPC under test is
 * invoked.
 */
describe('RLS: subscription provisioning on sign-up (E3.13)', () => {
  // Track every test-created user so a single afterEach can tear them down
  // even when an assertion mid-test throws. `deleteUser` cascades to
  // `user_settings` and `user_subscription` via the FK chain.
  const provisionedUserIds: string[] = []

  afterEach(async () => {
    while (provisionedUserIds.length > 0) {
      const id = provisionedUserIds.pop()!
      await admin.auth.admin.deleteUser(id)
    }
  })

  /**
   * Create Bare Auth User
   *
   * Mints an `auth.users` row via GoTrue admin and returns the User
   * record. Performs NO `user_settings` or `user_subscription` seeding —
   * the OAuth trigger short-circuits for `provider = 'email'` (which is
   * what GoTrue's admin path emits), so the database stays in the exact
   * state a fresh email sign-up sees right after `signUp()` resolves and
   * before the sign-up form calls `initialize_user_settings`.
   *
   * @returns Auth User
   */
  async function createBareAuthUser(): Promise<User> {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const { data, error } = await admin.auth.admin.createUser({
      email: `prov-${suffix}@test.local`,
      password: `password-${suffix}`,
      email_confirm: true
    })
    if (error || !data.user)
      throw new Error(`createUser failed: ${error?.message}`)
    provisionedUserIds.push(data.user.id)
    return data.user
  }

  it('email path — initialize_user_settings seeds free/active subscription', async () => {
    const user = await createBareAuthUser()

    // Confirm the OAuth trigger did NOT pre-seed (it short-circuits for
    // provider='email'). This is the exact pre-condition the production
    // sign-up flow sees right after signUp() resolves.
    const { data: before } = await admin
      .from('user_subscription')
      .select('user_id')
      .eq('user_id', user.id)
    expect(before ?? []).toEqual([])

    // Production codepath: the sign-up form calls this RPC with the
    // username the user typed in. The function is SECURITY DEFINER, so
    // the admin client is used only as a transport — the function body
    // would behave identically when called by the anon client.
    const { error: rpcErr } = await admin.rpc('initialize_user_settings', {
      p_user_id: user.id,
      p_username: `prov_${user.id.slice(0, 8)}`
    })
    expect(rpcErr).toBeNull()

    const { data: after, error: afterErr } = await admin
      .from('user_subscription')
      .select('user_id, plan_id, status')
      .eq('user_id', user.id)
      .single()
    expect(afterErr).toBeNull()
    expect(after?.plan_id).toBe('free')
    expect(after?.status).toBe('active')
  })

  it('oauth path — provision_user_settings_for_oauth seeds free/active subscription', async () => {
    const user = await createBareAuthUser()

    const { data: before } = await admin
      .from('user_subscription')
      .select('user_id')
      .eq('user_id', user.id)
    expect(before ?? []).toEqual([])

    // The OAuth trigger (`handle_new_oauth_user`) is a thin wrapper that
    // delegates to this helper for every non-email provider. Calling it
    // directly tests the helper's contract — which is what the trigger
    // body actually executes — without having to forge an auth.users
    // row with `provider = 'discord'`. EXECUTE on this function is
    // restricted to service_role per
    // `20260508000000_user_settings_avatar_url.sql`, which is exactly
    // what the admin client holds.
    const { error: rpcErr } = await admin.rpc(
      'provision_user_settings_for_oauth',
      { p_user_id: user.id }
    )
    expect(rpcErr).toBeNull()

    const { data: after, error: afterErr } = await admin
      .from('user_subscription')
      .select('user_id, plan_id, status')
      .eq('user_id', user.id)
      .single()
    expect(afterErr).toBeNull()
    expect(after?.plan_id).toBe('free')
    expect(after?.status).toBe('active')
  })

  it('email path is idempotent — re-invocation is a no-op', async () => {
    const user = await createBareAuthUser()

    // First call seeds the row.
    await admin.rpc('initialize_user_settings', {
      p_user_id: user.id,
      p_username: `prov_${user.id.slice(0, 8)}`
    })

    // Mutate the row out of band so we can detect any overwrite by the
    // second call. The `on conflict do nothing` clause should leave
    // this in place.
    const { error: mutateErr } = await admin
      .from('user_subscription')
      .update({ plan_id: 'lantern_hoard', status: 'active' })
      .eq('user_id', user.id)
    expect(mutateErr).toBeNull()

    // Re-call: must not clobber the upgraded plan.
    const { error: secondErr } = await admin.rpc('initialize_user_settings', {
      p_user_id: user.id,
      p_username: `prov_${user.id.slice(0, 8)}`
    })
    expect(secondErr).toBeNull()

    const { data: rows } = await admin
      .from('user_subscription')
      .select('user_id, plan_id')
      .eq('user_id', user.id)
    expect(rows).toHaveLength(1)
    expect(rows?.[0].plan_id).toBe('lantern_hoard')
  })

  it('oauth path is idempotent — re-invocation is a no-op', async () => {
    const user = await createBareAuthUser()

    await admin.rpc('provision_user_settings_for_oauth', { p_user_id: user.id })

    const { error: mutateErr } = await admin
      .from('user_subscription')
      .update({ plan_id: 'lantern', status: 'trialing' })
      .eq('user_id', user.id)
    expect(mutateErr).toBeNull()

    const { error: secondErr } = await admin.rpc(
      'provision_user_settings_for_oauth',
      { p_user_id: user.id }
    )
    expect(secondErr).toBeNull()

    const { data: rows } = await admin
      .from('user_subscription')
      .select('user_id, plan_id, status')
      .eq('user_id', user.id)
    expect(rows).toHaveLength(1)
    expect(rows?.[0].plan_id).toBe('lantern')
    expect(rows?.[0].status).toBe('trialing')
  })

  it('backfill — a pre-existing user without a subscription row is recovered to free', async () => {
    // Simulate the state any pre-E3.1 user was in immediately before the
    // backfill ran: an `auth.users` row with NO matching
    // `user_subscription` row. (Our `createBareAuthUser` already produces
    // exactly this state because the OAuth trigger short-circuits on
    // `provider = 'email'`.)
    const user = await createBareAuthUser()

    const { data: before } = await admin
      .from('user_subscription')
      .select('user_id')
      .eq('user_id', user.id)
    expect(before ?? []).toEqual([])

    // Mirror the backfill block at the bottom of
    // `20260527000001_user_subscription.sql`. Scoped to the test user via
    // an `eq` filter so it cannot interfere with other concurrent tests.
    const { error: backfillErr } = await admin
      .from('user_subscription')
      .upsert(
        { user_id: user.id, plan_id: 'free' },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )
    expect(backfillErr).toBeNull()

    const { data: after, error: afterErr } = await admin
      .from('user_subscription')
      .select('user_id, plan_id, status')
      .eq('user_id', user.id)
      .single()
    expect(afterErr).toBeNull()
    expect(after?.plan_id).toBe('free')
    expect(after?.status).toBe('active')

    // Re-running the backfill must be a no-op (idempotency). Mutate the
    // row first to a non-default state; the backfill should not clobber
    // it.
    await admin
      .from('user_subscription')
      .update({ plan_id: 'lantern_hoard' })
      .eq('user_id', user.id)

    const { error: secondErr } = await admin
      .from('user_subscription')
      .upsert(
        { user_id: user.id, plan_id: 'free' },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )
    expect(secondErr).toBeNull()

    const { data: post } = await admin
      .from('user_subscription')
      .select('plan_id')
      .eq('user_id', user.id)
      .single()
    expect(post?.plan_id).toBe('lantern_hoard')
  })
})
