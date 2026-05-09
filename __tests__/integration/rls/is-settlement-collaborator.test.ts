import {
  createTestUser,
  deleteTestUser,
  seedSettlement,
  shareSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RPC — `is_settlement_collaborator(uuid)`
 *
 * SECURITY DEFINER predicate consumed by collaborator-aware RLS policies on
 * every `settlement_*` junction table (see Epic E1 — Phase 1).
 *
 * The helper returns `true` only when `auth.uid()` matches a `shared_user_id`
 * row in `settlement_shared_user` for the given settlement. It MUST NOT
 * report owners as collaborators, and it MUST NOT leak access to anonymous
 * callers — the function is scoped to the `authenticated` role.
 */
describe('RPC: is_settlement_collaborator', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let settlementId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()
    settlementId = await seedSettlement(owner.id, 'Collaborator Helper Test')
    await shareSettlement(settlementId, collaborator.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  it('returns true for a shared collaborator', async () => {
    const { data, error } = await collaborator.client.rpc(
      'is_settlement_collaborator',
      { target_settlement: settlementId }
    )
    expect(error).toBeNull()
    expect(data).toBe(true)
  })

  it('returns false for the settlement owner', async () => {
    // Owners are intentionally NOT modeled as collaborators — policies that
    // accept either role should use the disjunction
    // `is_settlement_owner(...) or is_settlement_collaborator(...)`.
    const { data, error } = await owner.client.rpc(
      'is_settlement_collaborator',
      { target_settlement: settlementId }
    )
    expect(error).toBeNull()
    expect(data).toBe(false)
  })

  it('returns false for an unrelated authenticated user', async () => {
    const { data, error } = await stranger.client.rpc(
      'is_settlement_collaborator',
      { target_settlement: settlementId }
    )
    expect(error).toBeNull()
    expect(data).toBe(false)
  })

  it('returns false for a settlement that does not exist', async () => {
    const { data, error } = await collaborator.client.rpc(
      'is_settlement_collaborator',
      { target_settlement: '00000000-0000-0000-0000-000000000000' }
    )
    expect(error).toBeNull()
    expect(data).toBe(false)
  })

  it('rejects an unauthenticated caller', async () => {
    // EXECUTE was revoked from PUBLIC and from anon explicitly, so the
    // anon role cannot invoke the helper. (service_role still holds EXECUTE
    // via Supabase's default privileges — that's intentional and not what
    // this test exercises.)
    const anon = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_ANON_KEY ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data, error } = await anon.rpc('is_settlement_collaborator', {
      target_settlement: settlementId
    })

    expect(data).toBeNull()
    expect(error).not.toBeNull()
    // Pin the failure to a permission-denied signal so the test can't
    // accidentally pass on an unrelated error (e.g. a malformed argument).
    // PostgREST surfaces PostgreSQL's 42501 either as a top-level `code` or
    // inside `message` ("permission denied for function ..."); accept either.
    expect(
      error?.code === '42501' ||
        /permission denied/i.test(error?.message ?? '')
    ).toBe(true)
  })
})
