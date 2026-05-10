import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

/**
 * RPC — `lookup_user_by_username`
 *
 * Validates the SECURITY DEFINER function used by the share-settlement
 * invite flow to resolve an exact username to its `auth.users.id`.
 *
 * Anti-enumeration contract under test:
 *   1. Exact match returns the matching `user_id`.
 *   2. Unknown handles return `null` (no enumeration leak).
 *   3. The 31st call inside a 60s rolling window also returns `null`,
 *      indistinguishable from the not-found case.
 *   4. Anonymous and unauthenticated callers are blocked at both the
 *      GRANT layer and the in-function `auth.uid()` guard.
 */
describe('RPC: lookup_user_by_username', () => {
  let alice: TestUser
  let bob: TestUser

  beforeAll(async () => {
    alice = await createTestUser()
    bob = await createTestUser()
  })

  afterAll(async () => {
    await deleteTestUser(alice.id)
    await deleteTestUser(bob.id)
  })

  beforeEach(async () => {
    // Reset the audit table between tests so the rate-limit case can run
    // first or last without depending on test ordering.
    await admin
      .from('lookup_user_audit')
      .delete()
      .in('user_id', [alice.id, bob.id])
  })

  it('returns the matching user_id for an existing username', async () => {
    const { data: bobRow } = await admin
      .from('user_settings')
      .select('username')
      .eq('user_id', bob.id)
      .single()

    const { data, error } = await alice.client.rpc('lookup_user_by_username', {
      p_username: bobRow?.username ?? ''
    })

    expect(error).toBeNull()
    expect(data).toBe(bob.id)
  })

  it('returns null for a non-existent username', async () => {
    const { data, error } = await alice.client.rpc('lookup_user_by_username', {
      p_username: 'no_such_user_definitely_not_seeded'
    })

    expect(error).toBeNull()
    expect(data).toBeNull()
  })

  it('records one audit row per successful call', async () => {
    const { data: bobRow } = await admin
      .from('user_settings')
      .select('username')
      .eq('user_id', bob.id)
      .single()

    await alice.client.rpc('lookup_user_by_username', {
      p_username: bobRow?.username ?? ''
    })
    await alice.client.rpc('lookup_user_by_username', {
      p_username: 'definitely_missing'
    })

    const { count } = await admin
      .from('lookup_user_audit')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', alice.id)

    // Both hit and miss paths should be counted — otherwise an attacker
    // could probe past the budget by always missing.
    expect(count).toBe(2)
  })

  it('returns null for the 31st call inside the rolling 60s window', async () => {
    // Seed 30 prior attempts directly so the boundary can be tested without
    // 30 real RPC calls. All seeded rows fall inside the active window.
    const seeded = Array.from({ length: 30 }, () => ({
      user_id: alice.id,
      attempted_at: new Date().toISOString()
    }))
    const { error: seedErr } = await admin
      .from('lookup_user_audit')
      .insert(seeded)
    expect(seedErr).toBeNull()

    const { data: bobRow } = await admin
      .from('user_settings')
      .select('username')
      .eq('user_id', bob.id)
      .single()

    const { data, error } = await alice.client.rpc('lookup_user_by_username', {
      p_username: bobRow?.username ?? ''
    })

    // The caller cannot tell this `null` from the not-found case — that's
    // the no-leak contract from `local/sharing-architecture.md` §4 P9.
    expect(error).toBeNull()
    expect(data).toBeNull()
  })

  it('does not count expired audit rows toward the rolling-window limit', async () => {
    // 30 rows, all stamped 2 minutes ago — outside the 60s window. The
    // function must prune them before counting, otherwise it would falsely
    // rate-limit a caller who hasn't done anything recently.
    const expiredAt = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    const seeded = Array.from({ length: 30 }, () => ({
      user_id: alice.id,
      attempted_at: expiredAt
    }))
    const { error: seedErr } = await admin
      .from('lookup_user_audit')
      .insert(seeded)
    expect(seedErr).toBeNull()

    const { data: bobRow } = await admin
      .from('user_settings')
      .select('username')
      .eq('user_id', bob.id)
      .single()

    const { data, error } = await alice.client.rpc('lookup_user_by_username', {
      p_username: bobRow?.username ?? ''
    })

    expect(error).toBeNull()
    expect(data).toBe(bob.id)

    // Pruning should also have wiped the stale rows so the table doesn't
    // grow without bound.
    const { count } = await admin
      .from('lookup_user_audit')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', alice.id)
    expect(count).toBe(1)
  })

  it('rejects an unauthenticated caller at the GRANT layer', async () => {
    const anon = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_ANON_KEY ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data, error } = await anon.rpc('lookup_user_by_username', {
      p_username: 'phantom'
    })

    // Either PostgREST refuses execution (permission denied) or the
    // in-function guard fires; both are acceptable. The contract is just
    // "anon cannot resolve usernames".
    expect(data).toBeNull()
    expect(error).not.toBeNull()
  })

  it('rejects a service-role direct call (in-function auth.uid() guard)', async () => {
    // service_role bypasses RLS and PostgREST GRANT checks but `auth.uid()`
    // returns null, so the in-function guard must still refuse the call.
    const { data, error } = await admin.rpc('lookup_user_by_username', {
      p_username: 'phantom'
    })

    expect(data).toBeNull()
    expect(error?.message).toBe('not-authenticated')
  })

  it('blocks direct SELECT on lookup_user_audit even from authenticated users', async () => {
    // RLS is enabled with no policies, so only the SECURITY DEFINER function
    // can read the audit table. A direct query from a logged-in user must
    // return zero rows, regardless of what's actually stored.
    await admin
      .from('lookup_user_audit')
      .insert({ user_id: alice.id, attempted_at: new Date().toISOString() })

    const { data, error } = await alice.client
      .from('lookup_user_audit')
      .select('*')

    expect(error).toBeNull()
    expect(data).toEqual([])
  })
})
