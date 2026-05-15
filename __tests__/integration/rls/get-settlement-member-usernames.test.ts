import {
  createTestUser,
  deleteTestUser,
  seedSettlement,
  shareSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RPC — `get_settlement_member_usernames`
 *
 * SECURITY DEFINER function that returns the `(user_id, username)` map
 * for every user connected to a settlement (the owner plus every
 * collaborator listed in `settlement_shared_user`). Powers the "By
 * @username" authorship chip on custom catalog rows materialized into
 * `SettlementDetail`'s collections (E2.8 in
 * `docs/sharing-architecture.md` §7.4 / §10 Phase 2 item 2.6).
 *
 * This RPC exists because RLS on `user_settings` is owner-only, so a
 * direct PostgREST embed (`settlement_knowledge → knowledge →
 * user_settings`) would silently return `null` for every author who is
 * not the calling user. The function joins on the caller's behalf
 * after verifying settlement membership.
 *
 * Contract under test:
 *   1. The owner sees their own row plus one row per collaborator.
 *   2. A collaborator sees the same set of rows (they are a member).
 *   3. An unrelated user sees an empty list — they are not a member.
 *   4. An anonymous caller is blocked at the GRANT layer.
 */
describe('RPC: get_settlement_member_usernames', () => {
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
      'Get-Member-Usernames Test Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  it('returns owner and collaborator usernames when called by the owner', async () => {
    const { data, error } = await owner.client.rpc(
      'get_settlement_member_usernames',
      { target_settlement: settlementId }
    )

    expect(error).toBeNull()

    const rows = (data ?? []) as Array<{
      user_id: string
      username: string
    }>
    const ids = rows.map((r) => r.user_id)
    expect(ids).toContain(owner.id)
    expect(ids).toContain(collaborator.id)
    // Every row must populate username so the DAL mapping never falls
    // back to `null` for known members.
    for (const row of rows) expect(row.username).toBeTypeOf('string')
  })

  it('returns owner and collaborator usernames when called by a collaborator', async () => {
    const { data, error } = await collaborator.client.rpc(
      'get_settlement_member_usernames',
      { target_settlement: settlementId }
    )

    expect(error).toBeNull()

    const rows = (data ?? []) as Array<{
      user_id: string
      username: string
    }>
    const ids = rows.map((r) => r.user_id)
    expect(ids).toContain(owner.id)
    expect(ids).toContain(collaborator.id)
  })

  it('returns an empty list for an unrelated user', async () => {
    const { data, error } = await stranger.client.rpc(
      'get_settlement_member_usernames',
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

    const { data, error } = await anon.rpc('get_settlement_member_usernames', {
      target_settlement: settlementId
    })

    // The migration explicitly `revoke execute … from anon`, so PostgREST
    // must refuse the call rather than returning empty data. Pinning the
    // contract with a strict error assertion guards against accidentally
    // dropping the revoke (otherwise the in-function `auth.uid()` filter
    // would silently return [] and this test would still pass).
    expect(data).toBeNull()
    expect(error).not.toBeNull()
    expect(error?.code ?? '').toMatch(/PGRST|42501/)
  })
})
