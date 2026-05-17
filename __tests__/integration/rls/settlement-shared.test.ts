import {
  admin,
  createTestUser,
  deleteTestUser,
  seedSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — `settlement_shared_user` paid INSERT gate (E3.3)
 *
 * Verifies the policy minted by
 * `20260531000000_settlement_shared_user_paid_gate.sql`:
 *
 *     create policy "Allow insert by paying owner"
 *       on settlement_shared_user for insert to authenticated
 *       with check (
 *         user_can_share()
 *         and is_settlement_owner(settlement_id)
 *         and user_id = (select auth.uid())
 *       );
 *
 * Acceptance criteria from GitHub issue #165 (Epic E3, Phase 3.3):
 *   1. Free user trying to INSERT into `settlement_shared_user` is denied
 *      at the RLS layer.
 *   2. Paying user (Lantern Hoard + `active`) can INSERT.
 *   3. Cancelled user retains existing shares but cannot create new ones
 *      (EC-12 from `docs/settlement-sharing-architecture.md` §9.3).
 *   4. Admin bypass (service_role) continues to work — the "Allow all for
 *      admin" policy is untouched by the migration.
 *
 * `trialing` is also exercised because it is the second member of the
 * `user_can_share()` status whitelist and a separate regression target
 * from `active`.
 *
 * The fixture creates one owner + one collaborator + one stranger.
 * `createTestUser` already seeds every test user with a default
 * `free`/`active` `user_subscription` row, so test bodies that need a
 * different entitlement state mutate the row through the service-role
 * `admin` client (bypassing the user_subscription RLS write reservation).
 */
describe('RLS: settlement_shared_user paid INSERT gate (E3.3)', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let settlementId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()
    settlementId = await seedSettlement(owner.id, 'E3.3 Paid-Gate Settlement')
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  /**
   * Set Owner Subscription
   *
   * Drives the owner test user into the requested entitlement cell via the
   * service-role `admin` client. The `user_subscription` table reserves
   * writes for admin / service-role / Stripe-webhook contexts, so this is
   * the canonical fixture path.
   *
   * @param planId Subscription Plan ID
   * @param status User Subscription Status
   */
  async function setOwnerSubscription(
    planId: 'free' | 'lantern' | 'lantern_hoard',
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
  ): Promise<void> {
    const { error } = await admin
      .from('user_subscription')
      .update({ plan_id: planId, status })
      .eq('user_id', owner.id)
    expect(error).toBeNull()
  }

  /**
   * Clear Shares
   *
   * Wipes any `settlement_shared_user` rows for the fixture settlement so
   * each test case starts from a known-empty state. Uses `admin` so the
   * cleanup is independent of whatever subscription state the previous
   * test left the owner in.
   */
  async function clearShares(): Promise<void> {
    const { error } = await admin
      .from('settlement_shared_user')
      .delete()
      .eq('settlement_id', settlementId)
    expect(error).toBeNull()
  }

  describe('paid owner CAN create new shares', () => {
    it('Lantern Hoard + active → INSERT succeeds', async () => {
      await setOwnerSubscription('lantern_hoard', 'active')
      await clearShares()

      const { data, error } = await owner.client
        .from('settlement_shared_user')
        .insert({
          settlement_id: settlementId,
          shared_user_id: collaborator.id,
          user_id: owner.id
        })
        .select('settlement_id, shared_user_id, user_id')
        .single()

      expect(error).toBeNull()
      expect(data?.settlement_id).toBe(settlementId)
      expect(data?.shared_user_id).toBe(collaborator.id)
      expect(data?.user_id).toBe(owner.id)
    })

    it('Lantern Hoard + trialing → INSERT succeeds', async () => {
      // Locks the second member of user_can_share()'s status whitelist
      // against the policy as well as the helper itself.
      await setOwnerSubscription('lantern_hoard', 'trialing')
      await clearShares()

      const { data, error } = await owner.client
        .from('settlement_shared_user')
        .insert({
          settlement_id: settlementId,
          shared_user_id: collaborator.id,
          user_id: owner.id
        })
        .select('shared_user_id')
        .single()

      expect(error).toBeNull()
      expect(data?.shared_user_id).toBe(collaborator.id)
    })
  })

  describe('free / unentitled owner CANNOT create new shares', () => {
    it('free + active → INSERT denied (RLS)', async () => {
      // Default seeded state — but assert it explicitly so the test is
      // not coupled to fixture defaults.
      await setOwnerSubscription('free', 'active')
      await clearShares()

      const { data, error } = await owner.client
        .from('settlement_shared_user')
        .insert({
          settlement_id: settlementId,
          shared_user_id: collaborator.id,
          user_id: owner.id
        })
        .select('shared_user_id')

      expect(data ?? []).toEqual([])
      expect(error).not.toBeNull()
      // PostgREST surfaces an RLS check-clause failure as either a
      // `42501` (newer) or a `PGRST` prefix code. Either is acceptable —
      // both signal the same RLS denial.
      expect(error?.code).toMatch(/PGRST|42501/)

      // Defense-in-depth: confirm no row was created server-side.
      const { data: post } = await admin
        .from('settlement_shared_user')
        .select('shared_user_id')
        .eq('settlement_id', settlementId)
      expect(post ?? []).toEqual([])
    })

    it('Lantern Hoard + past_due → INSERT denied (status whitelist excludes past_due)', async () => {
      await setOwnerSubscription('lantern_hoard', 'past_due')
      await clearShares()

      const { data, error } = await owner.client
        .from('settlement_shared_user')
        .insert({
          settlement_id: settlementId,
          shared_user_id: collaborator.id,
          user_id: owner.id
        })
        .select('shared_user_id')

      expect(data ?? []).toEqual([])
      expect(error).not.toBeNull()
      expect(error?.code).toMatch(/PGRST|42501/)
    })

    it('lantern (no may_share) + active → INSERT denied (plan whitelist excludes lantern)', async () => {
      // The middle tier is `active` and current, but `may_share = false`
      // on the plan row. Pins the policy to the plan flag, not just to
      // the status whitelist.
      await setOwnerSubscription('lantern', 'active')
      await clearShares()

      const { data, error } = await owner.client
        .from('settlement_shared_user')
        .insert({
          settlement_id: settlementId,
          shared_user_id: collaborator.id,
          user_id: owner.id
        })
        .select('shared_user_id')

      expect(data ?? []).toEqual([])
      expect(error).not.toBeNull()
      expect(error?.code).toMatch(/PGRST|42501/)
    })
  })

  describe('EC-12: cancelled owner — existing shares persist', () => {
    it('owner with a paid-era share keeps SELECT/UPDATE/DELETE after downgrade, but cannot create new shares', async () => {
      // 1. Owner is paying — seeds an existing share to `collaborator`.
      await setOwnerSubscription('lantern_hoard', 'active')
      await clearShares()
      const { error: seedErr } = await owner.client
        .from('settlement_shared_user')
        .insert({
          settlement_id: settlementId,
          shared_user_id: collaborator.id,
          user_id: owner.id
        })
      expect(seedErr).toBeNull()

      // 2. Owner downgrades — subscription canceled.
      await setOwnerSubscription('lantern_hoard', 'canceled')

      // 3a. Existing share still visible to the owner.
      const { data: visible, error: visibleErr } = await owner.client
        .from('settlement_shared_user')
        .select('shared_user_id, user_id')
        .eq('settlement_id', settlementId)
      expect(visibleErr).toBeNull()
      expect(visible ?? []).toEqual([
        { shared_user_id: collaborator.id, user_id: owner.id }
      ])

      // 3b. Owner can no longer create a NEW share (to the stranger).
      const { data: newShare, error: newShareErr } = await owner.client
        .from('settlement_shared_user')
        .insert({
          settlement_id: settlementId,
          shared_user_id: stranger.id,
          user_id: owner.id
        })
        .select('shared_user_id')
      expect(newShare ?? []).toEqual([])
      expect(newShareErr).not.toBeNull()
      expect(newShareErr?.code).toMatch(/PGRST|42501/)

      // 3c. Owner can still DELETE the existing share — the
      //     "Allow delete for owner" policy is untouched by the migration,
      //     so revoke-while-cancelled remains possible (matches §9.3).
      const { data: deleted, error: deleteErr } = await owner.client
        .from('settlement_shared_user')
        .delete()
        .eq('settlement_id', settlementId)
        .eq('shared_user_id', collaborator.id)
        .select('shared_user_id')
      expect(deleteErr).toBeNull()
      expect(deleted ?? []).toHaveLength(1)
    })
  })

  describe('paid owner cannot launder a share through a forged user_id', () => {
    it('owner with may_share but user_id != auth.uid() → INSERT denied', async () => {
      // Regression test for the third clause of the policy. Even with
      // user_can_share() = true and is_settlement_owner() = true, the
      // `user_id = (select auth.uid())` clause prevents the owner from
      // attributing the grant to anyone else.
      await setOwnerSubscription('lantern_hoard', 'active')
      await clearShares()

      const { data, error } = await owner.client
        .from('settlement_shared_user')
        .insert({
          settlement_id: settlementId,
          shared_user_id: collaborator.id,
          // Spoof: claim the share was created by the stranger.
          user_id: stranger.id
        })
        .select('shared_user_id')

      expect(data ?? []).toEqual([])
      expect(error).not.toBeNull()
      expect(error?.code).toMatch(/PGRST|42501/)
    })
  })

  describe('admin / service-role bypass survives the migration', () => {
    it('service_role can INSERT regardless of the owner subscription state', async () => {
      // The fixture `admin` client uses the service_role key. Even with
      // the owner explicitly downgraded to free, the service-role bypass
      // (`Allow all for admin` + Postgres's bypassrls on the role)
      // continues to allow direct inserts — required for support tooling
      // and the integration-test fixture path.
      await setOwnerSubscription('free', 'active')
      await clearShares()

      const { error } = await admin.from('settlement_shared_user').insert({
        settlement_id: settlementId,
        shared_user_id: collaborator.id,
        user_id: owner.id
      })
      expect(error).toBeNull()

      const { data: post } = await admin
        .from('settlement_shared_user')
        .select('shared_user_id')
        .eq('settlement_id', settlementId)
      expect(post ?? []).toEqual([{ shared_user_id: collaborator.id }])
    })
  })
})
