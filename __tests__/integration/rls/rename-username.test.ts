import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RPC — `rename_username`
 *
 * Validates the behaviour of the SECURITY DEFINER `rename_username` function.
 * The DAL helper relies on the exact error messages and boolean return value
 * documented in the migration, so any drift here will silently break the
 * client-facing rename flow.
 */
describe('RPC: rename_username', () => {
  let alice: TestUser
  let bob: TestUser

  beforeAll(async () => {
    alice = await createTestUser()
    bob = await createTestUser()
  })

  afterAll(async () => {
    await deleteTestUser(alice.id)
    await deleteTestUser(bob.id)

    // Reset Bob's `username_renamed_at` between runs so re-running the suite
    // against the same DB does not silently rate-limit the next pass.
    await admin
      .from('user_settings')
      .update({ username_renamed_at: null })
      .in('user_id', [alice.id, bob.id])
  })

  it('renames the caller and stamps username_renamed_at', async () => {
    const newName = `alice_${Date.now().toString(36)}`

    const { data, error } = await alice.client.rpc('rename_username', {
      new_username: newName
    })

    expect(error).toBeNull()
    expect(data).toBe(true)

    const { data: row } = await admin
      .from('user_settings')
      .select('username, username_renamed_at')
      .eq('user_id', alice.id)
      .single()
    expect(row?.username).toBe(newName)
    expect(row?.username_renamed_at).not.toBeNull()
  })

  it('returns false when the desired username is already taken', async () => {
    // Read Alice's current handle directly so the test stays valid regardless
    // of test-ordering changes.
    const { data: aliceRow } = await admin
      .from('user_settings')
      .select('username')
      .eq('user_id', alice.id)
      .single()

    const { data, error } = await bob.client.rpc('rename_username', {
      new_username: aliceRow?.username ?? ''
    })

    expect(error).toBeNull()
    expect(data).toBe(false)
  })

  it('rejects a second rename within the 10-minute window', async () => {
    // Alice already renamed in the first test. A second attempt must be
    // throttled even with a different (unique) target handle.
    const { data, error } = await alice.client.rpc('rename_username', {
      new_username: `alice_v2_${Date.now().toString(36)}`
    })

    expect(data).toBeNull()
    expect(error?.message).toBe('rate-limited')
  })

  it('rejects an invalid format (too short)', async () => {
    const { data, error } = await bob.client.rpc('rename_username', {
      new_username: 'ab'
    })

    expect(data).toBeNull()
    expect(error?.message).toBe('invalid-format')
  })

  it('rejects an invalid format (disallowed characters)', async () => {
    const { data, error } = await bob.client.rpc('rename_username', {
      new_username: 'has space'
    })

    expect(data).toBeNull()
    expect(error?.message).toBe('invalid-format')
  })

  it('rejects an invalid format (too long)', async () => {
    const { data, error } = await bob.client.rpc('rename_username', {
      new_username: 'a'.repeat(21)
    })

    expect(data).toBeNull()
    expect(error?.message).toBe('invalid-format')
  })

  it('rejects an unauthenticated caller', async () => {
    const anon = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_ANON_KEY ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data, error } = await anon.rpc('rename_username', {
      new_username: 'phantom_user'
    })

    expect(data).toBeNull()
    expect(error?.message).toBe('not-authenticated')
  })

  it('creates a settings row when none exists for the caller', async () => {
    // Simulate an unusual auth flow where `user_settings` was never seeded
    // (the schema-level `getUserSettings` helper explicitly tolerates this).
    // The RPC should provision the row instead of silently no-opping.
    const orphan = await createTestUser()
    try {
      // Cascade-cleanup of any rows referencing user_settings, then drop
      // the seeded settings row itself so the RPC must INSERT.
      await admin.from('user_settings').delete().eq('user_id', orphan.id)

      const newName = `orphan_${Date.now().toString(36)}`
      const { data, error } = await orphan.client.rpc('rename_username', {
        new_username: newName
      })

      expect(error).toBeNull()
      expect(data).toBe(true)

      const { data: row } = await admin
        .from('user_settings')
        .select('username, username_renamed_at, user_id')
        .eq('user_id', orphan.id)
        .single()
      expect(row?.username).toBe(newName)
      expect(row?.username_renamed_at).not.toBeNull()
    } finally {
      await deleteTestUser(orphan.id)
    }
  })
})
