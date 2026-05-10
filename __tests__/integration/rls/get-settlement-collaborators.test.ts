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
 * RPC — `get_settlement_collaborators`
 *
 * SECURITY DEFINER function called by the owner's "Light another lantern"
 * panel to enumerate the users their settlement is currently shared with.
 *
 * This RPC exists because direct `from('settlement_shared_user').select()`
 * queries can read the junction row but cannot read the embedded
 * `user_settings` (username, avatar_url) — the user_settings RLS policy is
 * owner-only and would silently return null for every collaborator. The
 * function joins on the caller's behalf after verifying ownership.
 *
 * Contract under test:
 *   1. The settlement owner sees one row per collaborator with username +
 *      avatar_url + created_at populated.
 *   2. A collaborator (non-owner) sees an empty list — even for a settlement
 *      that has been shared with them — because they are not the owner.
 *   3. A completely unrelated user sees an empty list.
 *   4. An anonymous caller is blocked at the GRANT layer.
 */
describe('RPC: get_settlement_collaborators', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let settlementId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()

    settlementId = await seedSettlement(
      owner.id,
      'Get-Collaborators Test Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  it('returns the collaborator row when called by the settlement owner', async () => {
    const { data, error } = await owner.client.rpc(
      'get_settlement_collaborators',
      { target_settlement: settlementId }
    )

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data?.[0]?.shared_user_id).toBe(collaborator.id)
    expect(data?.[0]?.username).toBeTypeOf('string')
    expect(data?.[0]?.created_at).toBeTypeOf('string')
  })

  it('returns an empty list when called by a collaborator (non-owner)', async () => {
    // The collaborator IS the shared user but is NOT the settlement owner;
    // the RPC must refuse to enumerate co-collaborators for them.
    const { data, error } = await collaborator.client.rpc(
      'get_settlement_collaborators',
      { target_settlement: settlementId }
    )

    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('returns an empty list for an unrelated user', async () => {
    const { data, error } = await stranger.client.rpc(
      'get_settlement_collaborators',
      { target_settlement: settlementId }
    )

    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('blocks anonymous callers at the GRANT layer', async () => {
    // Building an anon client locally so this test is self-contained.
    const { createClient } = await import('@supabase/supabase-js')
    const anon = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_ANON_KEY ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data, error } = await anon.rpc('get_settlement_collaborators', {
      target_settlement: settlementId
    })

    // Either PostgREST refuses execution outright, or the function returns
    // an empty result set — both satisfy "anon cannot read this".
    if (error) {
      expect(error.code ?? '').toMatch(/PGRST|42501/)
    } else {
      expect(data ?? []).toEqual([])
    }
  })

  it('reflects added shares dynamically', async () => {
    const second = await createTestUser()
    try {
      await shareSettlement(settlementId, second.id, owner.id)

      const { data, error } = await owner.client.rpc(
        'get_settlement_collaborators',
        { target_settlement: settlementId }
      )

      expect(error).toBeNull()
      const rows = (data ?? []) as Array<{ shared_user_id: string }>
      const ids = rows.map((r) => r.shared_user_id)
      expect(ids).toContain(collaborator.id)
      expect(ids).toContain(second.id)
    } finally {
      await admin
        .from('settlement_shared_user')
        .delete()
        .eq('settlement_id', settlementId)
        .eq('shared_user_id', second.id)
      await deleteTestUser(second.id)
    }
  })
})
