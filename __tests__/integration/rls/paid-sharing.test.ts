import {
  admin,
  createTestUser,
  deleteTestUser,
  seedSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Paid-Sharing Entitlement Matrix (E3.12)
 *
 * Integration test matrix for the paid-sharing entitlement layer added in
 * Epic E3 — Phase 3 (`docs/settlement-sharing-architecture.md` §9.1 / §9.3
 * and Appendix B EC-11, EC-12). Mirrors the cases enumerated in GitHub
 * issue #172:
 *
 *   1. Free user attempts to INSERT into `settlement_shared_user` → RLS
 *      denies (EC-11).
 *   2. Lantern Hoard / active user INSERTs → success.
 *   3. Lantern Hoard / active user shares with two free invitees; both can
 *      collaborate fully on the paid-shared settlement (EC-11/EC-12 — the
 *      entitlement attaches to the GRANTOR, not the grantee).
 *   4. Owner downgrades to canceled; the existing share row persists and
 *      the invitee still has full collaboration access, but the owner
 *      cannot create a NEW share to a third party (EC-12).
 *   5. Past-due owner: INSERT denied — `past_due` is intentionally outside
 *      the `user_can_share()` status whitelist (`active`, `trialing`).
 *   6. Trialing owner: INSERT allowed — locks in the second member of the
 *      `user_can_share()` status whitelist alongside `active`.
 *
 * This file is the high-level matrix that ties EC-11 and EC-12 together
 * end-to-end. The lower-level policy regression for the same migration
 * lives in `settlement-shared.test.ts` (E3.3 / #165), and the
 * SECURITY DEFINER predicate by itself is exercised in
 * `user-can-share.test.ts` (E3.2 / #174). The overlap is intentional:
 * the per-cell matrix here is the canonical home for the paywall
 * acceptance criteria in #172, and it cross-checks both lower-level
 * suites by composing the predicate, the INSERT policy, and the
 * collaborator-SELECT/INSERT contract in a single flow.
 *
 * Why the `admin` (service-role) client seeds `user_subscription`
 * --------------------------------------------------------------
 * The `user_subscription` table is provisioned with two RLS policies
 * (see `20260527000001_user_subscription.sql`):
 *
 *   * `"Allow select own"` — authenticated callers may read their own row.
 *   * `"Allow all for admin"` — only `is_admin()` callers may write.
 *
 * Writes are intentionally reserved for the future Stripe webhook handler
 * (which runs under `service_role`) and for admin operators. There is no
 * authenticated-user INSERT/UPDATE path on the table. The integration
 * test fixture therefore mutates rows through the `admin` client, which
 * holds the service-role key, bypasses RLS, and matches the exact
 * codepath the production webhook will use. The `setUserSubscription`
 * helper below documents this contract at its single call site.
 */
describe('RLS: paid-sharing matrix (E3.12)', () => {
  let owner: TestUser
  let invitee1: TestUser
  let invitee2: TestUser
  let stranger: TestUser
  let settlementId: string

  beforeAll(async () => {
    // Four users:
    //   - owner    — flipped between subscription cells per case
    //   - invitee1 — stays on the default `free` / `active` seed; the
    //                invitee's plan is irrelevant to `user_can_share()`
    //                because the predicate is evaluated against the
    //                grantor (`auth.uid()`), not the grantee.
    //   - invitee2 — second free invitee for case 3 (two-invitee
    //                collaboration evidence).
    //   - stranger — never shared with; used as the target of the
    //                "new INSERT denied after downgrade" assertion in
    //                case 4.
    owner = await createTestUser()
    invitee1 = await createTestUser()
    invitee2 = await createTestUser()
    stranger = await createTestUser()
    settlementId = await seedSettlement(owner.id, 'E3.12 Paid-Sharing Matrix')
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(invitee1.id)
    await deleteTestUser(invitee2.id)
    await deleteTestUser(stranger.id)
  })

  /**
   * Set User Subscription
   *
   * Drives an arbitrary test user into the requested entitlement cell.
   *
   * Uses the service-role `admin` client because the `user_subscription`
   * table's write policies (`Allow all for admin` only) intentionally
   * reserve INSERT/UPDATE/DELETE for the Stripe webhook handler and
   * admin operators — there is no authenticated-user write path. See
   * the file-level JSDoc above for the full rationale.
   *
   * @param userId User ID
   * @param planId Subscription Plan ID
   * @param status User Subscription Status
   */
  async function setUserSubscription(
    userId: string,
    planId: 'free' | 'lantern' | 'lantern_hoard',
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
  ): Promise<void> {
    const { error } = await admin
      .from('user_subscription')
      .update({ plan_id: planId, status })
      .eq('user_id', userId)
    expect(error).toBeNull()
  }

  /**
   * Clear Shares
   *
   * Wipes every `settlement_shared_user` row for the fixture settlement
   * so each case starts from a known-empty state. Uses `admin` so the
   * cleanup is independent of whatever subscription state the previous
   * case left the owner in (a canceled owner cannot, in general, delete
   * other people's shares — but the admin bypass survives the paid gate).
   */
  async function clearShares(): Promise<void> {
    const { error } = await admin
      .from('settlement_shared_user')
      .delete()
      .eq('settlement_id', settlementId)
    expect(error).toBeNull()
  }

  it('case 1 — free owner: INSERT into settlement_shared_user is denied (EC-11)', async () => {
    // `createTestUser` already seeds `free` / `active`, but assert the
    // entitlement cell explicitly so the test is not coupled to fixture
    // defaults.
    await setUserSubscription(owner.id, 'free', 'active')
    await clearShares()

    const { data, error } = await owner.client
      .from('settlement_shared_user')
      .insert({
        settlement_id: settlementId,
        shared_user_id: invitee1.id,
        user_id: owner.id
      })
      .select('shared_user_id')

    expect(data ?? []).toEqual([])
    expect(error).not.toBeNull()
    // PostgREST surfaces an RLS check-clause failure as either `42501`
    // (newer Postgres) or a `PGRST` prefix code. Either is acceptable —
    // both signal the same RLS denial.
    expect(error?.code).toMatch(/PGRST|42501/)

    // Defense-in-depth: confirm no row was created server-side.
    const { data: post } = await admin
      .from('settlement_shared_user')
      .select('shared_user_id')
      .eq('settlement_id', settlementId)
    expect(post ?? []).toEqual([])
  })

  it('case 2 — lantern_hoard + active owner: INSERT succeeds', async () => {
    await setUserSubscription(owner.id, 'lantern_hoard', 'active')
    await clearShares()

    const { data, error } = await owner.client
      .from('settlement_shared_user')
      .insert({
        settlement_id: settlementId,
        shared_user_id: invitee1.id,
        user_id: owner.id
      })
      .select('settlement_id, shared_user_id, user_id')
      .single()

    expect(error).toBeNull()
    expect(data?.settlement_id).toBe(settlementId)
    expect(data?.shared_user_id).toBe(invitee1.id)
    expect(data?.user_id).toBe(owner.id)
  })

  it('case 3 — two free invitees can collaborate fully on a paid-shared settlement (EC-11/EC-12)', async () => {
    // Paid owner shares with TWO free invitees. The entitlement gates
    // share CREATION (grantor side), not consumption (grantee side), so
    // both invitees — despite being on the default free plan — must be
    // able to exercise the full collaborator contract on the settlement.
    await setUserSubscription(owner.id, 'lantern_hoard', 'active')
    await clearShares()

    // Sanity-check the assumed invitee state: both are still on `free`.
    // If a previous case mutated them (none should), this would surface
    // the cross-test bleed loudly.
    for (const invitee of [invitee1, invitee2]) {
      const { data: sub } = await admin
        .from('user_subscription')
        .select('plan_id, status')
        .eq('user_id', invitee.id)
        .single<{ plan_id: string; status: string }>()
      expect(sub?.plan_id).toBe('free')
    }

    // Owner grants both invitees in a single round-trip — verifies the
    // policy fires correctly for back-to-back inserts and not just for
    // the first.
    const { error: shareErr } = await owner.client
      .from('settlement_shared_user')
      .insert([
        {
          settlement_id: settlementId,
          shared_user_id: invitee1.id,
          user_id: owner.id
        },
        {
          settlement_id: settlementId,
          shared_user_id: invitee2.id,
          user_id: owner.id
        }
      ])
    expect(shareErr).toBeNull()

    // Both invitees can now SELECT the settlement row (the "Allow select
    // for shared" policy on `settlement` reads through
    // `settlement_shared_user`).
    for (const invitee of [invitee1, invitee2]) {
      const { data: sel, error: selErr } = await invitee.client
        .from('settlement')
        .select('id, settlement_name')
        .eq('id', settlementId)
        .single()
      expect(selErr).toBeNull()
      expect(sel?.id).toBe(settlementId)
    }

    // Each invitee can INSERT into a settlement-scoped child table.
    // `settlement_timeline_year.year_number` is unique per settlement
    // and constrained to `0..50` by a CHECK; the two invitees pick
    // distinct in-range slots (the seeded settlement has no timeline
    // rows of its own).
    const insertedRowIds: string[] = []
    const invitees = [invitee1, invitee2]
    const yearSlots = [11, 12]
    for (let i = 0; i < invitees.length; i++) {
      const invitee = invitees[i]
      const { data: ins, error: insErr } = await invitee.client
        .from('settlement_timeline_year')
        .insert({
          settlement_id: settlementId,
          year_number: yearSlots[i]
        })
        .select('id')
        .single<{ id: string }>()
      expect(insErr).toBeNull()
      expect(ins?.id).toBeTruthy()
      insertedRowIds.push(ins!.id)
    }

    // And each invitee can UPDATE the row they just inserted — proves
    // the full SELECT + INSERT + UPDATE contract on a child row that
    // their entitlement does NOT directly cover.
    for (let i = 0; i < invitees.length; i++) {
      const { data: upd, error: updErr } = await invitees[i].client
        .from('settlement_timeline_year')
        .update({ completed: true })
        .eq('id', insertedRowIds[i])
        .select('id, completed')
        .single()
      expect(updErr).toBeNull()
      expect(upd?.completed).toBe(true)
    }

    // Cleanup so the next case starts from a clean settlement_timeline_year.
    const { error: cleanupErr } = await admin
      .from('settlement_timeline_year')
      .delete()
      .in('id', insertedRowIds)
    expect(cleanupErr).toBeNull()
  })

  it('case 4 — owner downgrades to canceled: existing share persists, new INSERT denied (EC-12)', async () => {
    // 1. Paid owner seeds a share to invitee1.
    await setUserSubscription(owner.id, 'lantern_hoard', 'active')
    await clearShares()
    const { error: seedErr } = await owner.client
      .from('settlement_shared_user')
      .insert({
        settlement_id: settlementId,
        shared_user_id: invitee1.id,
        user_id: owner.id
      })
    expect(seedErr).toBeNull()

    // 2. Owner cancels. The "Allow insert by paying owner" policy now
    //    rejects new grants, but the SELECT / UPDATE / DELETE policies
    //    minted in 20260220190650_settlement.sql are untouched, so the
    //    existing row remains intact for both sides.
    await setUserSubscription(owner.id, 'lantern_hoard', 'canceled')

    // 3a. The existing share row is still visible to the owner.
    const { data: ownerView, error: ownerViewErr } = await owner.client
      .from('settlement_shared_user')
      .select('shared_user_id, user_id')
      .eq('settlement_id', settlementId)
    expect(ownerViewErr).toBeNull()
    expect(ownerView ?? []).toEqual([
      { shared_user_id: invitee1.id, user_id: owner.id }
    ])

    // 3b. The invitee can still SELECT the settlement — their access
    //     was minted before the downgrade and the canceled owner has
    //     not had it revoked. This is the EC-12 contract.
    const { data: inviteeView, error: inviteeViewErr } = await invitee1.client
      .from('settlement')
      .select('id')
      .eq('id', settlementId)
      .single()
    expect(inviteeViewErr).toBeNull()
    expect(inviteeView?.id).toBe(settlementId)

    // 3c. But the owner can NO LONGER create a new share. Pick the
    //     stranger as the target so this assertion is independent of
    //     the existing invitee1 grant.
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

    // 3d. Defense-in-depth: confirm the share table holds exactly the
    //     original row — no stranger grant leaked through.
    const { data: final } = await admin
      .from('settlement_shared_user')
      .select('shared_user_id')
      .eq('settlement_id', settlementId)
    expect(final ?? []).toEqual([{ shared_user_id: invitee1.id }])
  })

  it('case 5 — past_due owner: INSERT denied (status whitelist excludes past_due)', async () => {
    // `past_due` is intentionally outside the `user_can_share()`
    // whitelist (which only accepts `active` and `trialing`). The
    // grantor's plan still has `may_share = true`, so this pins the
    // policy to the status check specifically.
    await setUserSubscription(owner.id, 'lantern_hoard', 'past_due')
    await clearShares()

    const { data, error } = await owner.client
      .from('settlement_shared_user')
      .insert({
        settlement_id: settlementId,
        shared_user_id: invitee1.id,
        user_id: owner.id
      })
      .select('shared_user_id')

    expect(data ?? []).toEqual([])
    expect(error).not.toBeNull()
    expect(error?.code).toMatch(/PGRST|42501/)
  })

  it('case 6 — trialing owner: INSERT allowed (second member of the status whitelist)', async () => {
    // Locks in the second whitelisted status (`trialing`) against the
    // policy as a regression target separate from `active`.
    await setUserSubscription(owner.id, 'lantern_hoard', 'trialing')
    await clearShares()

    const { data, error } = await owner.client
      .from('settlement_shared_user')
      .insert({
        settlement_id: settlementId,
        shared_user_id: invitee1.id,
        user_id: owner.id
      })
      .select('shared_user_id')
      .single()

    expect(error).toBeNull()
    expect(data?.shared_user_id).toBe(invitee1.id)
  })
})
