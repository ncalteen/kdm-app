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
 * RLS — Catalog Transitive Visibility (EC-2..EC-8)
 *
 * Comprehensive integration coverage for the canonical catalog-sharing edge
 * cases in `local/sharing-architecture.md` Appendix B (EC-2..EC-8). Each
 * scenario is exercised as a single narrative `it` block against the live
 * RLS layer using the standard `__tests__/integration/helpers/supabase`
 * harness.
 *
 * Setup:
 *
 *   * Two users: A (settlement owner) and B (collaborator).
 *   * One settlement S, owned by A and shared with B, used for scenarios
 *     that do not mutate the share / detach state. Scenarios that DO mutate
 *     those states (EC-3, EC-5, EC-7) seed their own fresh settlement so
 *     they remain independent of one another.
 *
 * Catalog tables under test:
 *
 *   * `knowledge`  — exercises the settlement-junction chain (EC-2..EC-5).
 *   * `disorder`   — exercises the survivor-junction chain (EC-6..EC-8).
 *
 * Other chains (survivor column, hunt / showdown junctions, gear_grid armor
 * selection) are pinned by sibling files
 * (`catalog-transitive-via-survivor.test.ts`,
 * `catalog-transitive-hunt-showdown.test.ts`,
 * `catalog-visibility-via-settlement.test.ts`,
 * `custom-content.test.ts`,
 * `catalog-delete-guard.test.ts`,
 * `catalog-owner-cannot-delete-shared.test.ts`). This file is the
 * canonical EC-2..EC-8 narrative lock.
 *
 * Closes [E2.12].
 */
describe('RLS: catalog transitive visibility (EC-2..EC-8)', () => {
  let userA: TestUser
  let userB: TestUser
  let settlementId: string

  beforeAll(async () => {
    userA = await createTestUser()
    userB = await createTestUser()

    settlementId = await seedSettlement(userA.id, 'EC-2..EC-8 Test Settlement')
    await shareSettlement(settlementId, userB.id, userA.id)
  })

  afterAll(async () => {
    await deleteTestUser(userA.id)
    await deleteTestUser(userB.id)
  })

  /**
   * Seed Knowledge
   *
   * Inserts a custom knowledge row authored by the given user.
   *
   * @param userId Author User ID
   * @param label Short Test Label (used to disambiguate names)
   * @returns Knowledge ID And Rules Text
   */
  async function seedKnowledge(
    userId: string,
    label: string
  ): Promise<{ id: string; rules: string }> {
    const rules = `The lantern's truth — ${label} ${Date.now()}-${Math.random()}`
    const { data, error } = await admin
      .from('knowledge')
      .insert({
        knowledge_name: `Knowledge ${label} ${Date.now()}-${Math.random()}`,
        custom: true,
        user_id: userId,
        rules
      })
      .select('id')
      .single()
    if (error || !data) throw new Error(`seed knowledge: ${error?.message}`)
    return { id: data.id, rules }
  }

  /**
   * Seed Disorder
   *
   * Inserts a custom disorder row authored by the given user.
   *
   * @param userId Author User ID
   * @param label Short Test Label
   * @returns Disorder ID And Rules Text
   */
  async function seedDisorder(
    userId: string,
    label: string
  ): Promise<{ id: string; rules: string }> {
    const rules = `Whispers from the dark — ${label} ${Date.now()}-${Math.random()}`
    const { data, error } = await admin
      .from('disorder')
      .insert({
        disorder_name: `Disorder ${label} ${Date.now()}-${Math.random()}`,
        custom: true,
        user_id: userId,
        rules
      })
      .select('id')
      .single()
    if (error || !data) throw new Error(`seed disorder: ${error?.message}`)
    return { id: data.id, rules }
  }

  /**
   * Seed Survivor
   *
   * Inserts a survivor in the given settlement. Uses admin to bypass the
   * survivor INSERT policy because the suite is only interested in the
   * post-insert visibility / delete behavior of the catalog rows.
   *
   * @param settlementId Settlement ID
   * @returns Survivor ID
   */
  async function seedSurvivor(settlementId: string): Promise<string> {
    const { data, error } = await admin
      .from('survivor')
      .insert({
        settlement_id: settlementId,
        gender: 'FEMALE',
        survivor_name: `Survivor ${Date.now()}-${Math.random()}`
      })
      .select('id')
      .single()
    if (error || !data) throw new Error(`seed survivor: ${error?.message}`)
    return data.id
  }

  // ---------------------------------------------------------------------------
  // EC-2: A creates custom knowledge K, attaches K to S, shares S with B
  //       → B can SELECT K (rules included). B cannot UPDATE K's rules text.
  // ---------------------------------------------------------------------------
  it('EC-2: collaborator can read author-attached custom knowledge (rules included) but cannot edit it', async () => {
    const { id: knowledgeId, rules } = await seedKnowledge(userA.id, 'EC-2')

    const { error: attachErr } = await admin
      .from('settlement_knowledge')
      .insert({ settlement_id: settlementId, knowledge_id: knowledgeId })
    if (attachErr) throw new Error(`attach knowledge: ${attachErr.message}`)

    // B (collaborator) can SELECT the row with rules.
    const { data: bRead, error: bErr } = await userB.client
      .from('knowledge')
      .select('id, knowledge_name, rules, custom, user_id')
      .eq('id', knowledgeId)
      .maybeSingle()
    expect(bErr).toBeNull()
    expect(bRead).not.toBeNull()
    expect(bRead?.rules).toBe(rules)
    expect(bRead?.custom).toBe(true)
    expect(bRead?.user_id).toBe(userA.id)

    // B cannot UPDATE the row. The persisted rules must be unchanged.
    await userB.client
      .from('knowledge')
      .update({ rules: 'Collaborator overwrites the lantern' })
      .eq('id', knowledgeId)

    const { data: persisted } = await admin
      .from('knowledge')
      .select('rules')
      .eq('id', knowledgeId)
      .single()
    expect(persisted?.rules).toBe(rules)
  })

  // ---------------------------------------------------------------------------
  // EC-3: (EC-2) + A unshares S → B loses access to K.
  //
  // Uses its own settlement so unsharing does not bleed into the main
  // settlement's collaborator state.
  // ---------------------------------------------------------------------------
  it('EC-3: collaborator loses SELECT on attached knowledge after the settlement is unshared', async () => {
    const sId = await seedSettlement(userA.id, 'EC-3 Settlement')
    await shareSettlement(sId, userB.id, userA.id)

    const { id: knowledgeId } = await seedKnowledge(userA.id, 'EC-3')
    const { error: attachErr } = await admin
      .from('settlement_knowledge')
      .insert({ settlement_id: sId, knowledge_id: knowledgeId })
    if (attachErr) throw new Error(`attach knowledge: ${attachErr.message}`)

    // Sanity: B sees the row while the share is in place.
    const { data: beforeUnshare } = await userB.client
      .from('knowledge')
      .select('id')
      .eq('id', knowledgeId)
      .maybeSingle()
    expect(beforeUnshare).not.toBeNull()

    // A unshares S.
    const { error: unshareErr } = await admin
      .from('settlement_shared_user')
      .delete()
      .eq('settlement_id', sId)
      .eq('shared_user_id', userB.id)
    if (unshareErr) throw new Error(`unshare: ${unshareErr.message}`)

    // B no longer sees the row through the transitive path.
    const { data: afterUnshare, error: afterErr } = await userB.client
      .from('knowledge')
      .select('id')
      .eq('id', knowledgeId)
      .maybeSingle()
    expect(afterErr).toBeNull()
    expect(afterUnshare).toBeNull()

    // Row itself is unchanged.
    const { data: still } = await admin
      .from('knowledge')
      .select('id')
      .eq('id', knowledgeId)
      .maybeSingle()
    expect(still).not.toBeNull()
  })

  // ---------------------------------------------------------------------------
  // EC-4: (EC-2) + A removes K from S (without deleting K) → B loses access
  //       to K, since no other settlement attaches it.
  // ---------------------------------------------------------------------------
  it('EC-4: collaborator loses SELECT on knowledge after the settlement_knowledge junction is removed', async () => {
    const { id: knowledgeId } = await seedKnowledge(userA.id, 'EC-4')

    const { data: sj, error: attachErr } = await admin
      .from('settlement_knowledge')
      .insert({ settlement_id: settlementId, knowledge_id: knowledgeId })
      .select('id')
      .single()
    if (attachErr || !sj)
      throw new Error(`attach knowledge: ${attachErr?.message}`)

    // Sanity: B sees the row.
    const { data: beforeDetach } = await userB.client
      .from('knowledge')
      .select('id')
      .eq('id', knowledgeId)
      .maybeSingle()
    expect(beforeDetach).not.toBeNull()

    // A detaches the row from the settlement (without deleting it).
    const { error: detachErr } = await admin
      .from('settlement_knowledge')
      .delete()
      .eq('id', sj.id)
    if (detachErr) throw new Error(`detach: ${detachErr.message}`)

    // B no longer sees the row.
    const { data: afterDetach, error: afterErr } = await userB.client
      .from('knowledge')
      .select('id')
      .eq('id', knowledgeId)
      .maybeSingle()
    expect(afterErr).toBeNull()
    expect(afterDetach).toBeNull()

    // Row itself still exists and is owned by A.
    const { data: still } = await admin
      .from('knowledge')
      .select('id, user_id')
      .eq('id', knowledgeId)
      .maybeSingle()
    expect(still?.user_id).toBe(userA.id)
  })

  // ---------------------------------------------------------------------------
  // EC-5: (EC-2) + A deletes K while attached to A's OWN settlement only
  //       → the BEFORE DELETE trigger allows the delete because every
  //       referencing settlement belongs to A.
  // ---------------------------------------------------------------------------
  it('EC-5: author can delete a custom knowledge when every referencing settlement is their own', async () => {
    // A's solo settlement (not shared with anyone).
    const soloSettlementId = await seedSettlement(
      userA.id,
      'EC-5 Solo Settlement'
    )

    const { id: knowledgeId } = await seedKnowledge(userA.id, 'EC-5')
    const { error: attachErr } = await admin
      .from('settlement_knowledge')
      .insert({
        settlement_id: soloSettlementId,
        knowledge_id: knowledgeId
      })
    if (attachErr) throw new Error(`attach knowledge: ${attachErr.message}`)

    // A deletes the row. The delete-guard trigger should NOT raise.
    const { error: delErr } = await userA.client
      .from('knowledge')
      .delete()
      .eq('id', knowledgeId)
    expect(delErr).toBeNull()

    // Row is gone.
    const { data: gone } = await admin
      .from('knowledge')
      .select('id')
      .eq('id', knowledgeId)
      .maybeSingle()
    expect(gone).toBeNull()
  })

  // ---------------------------------------------------------------------------
  // EC-6: A shares S with B; B creates own custom disorder D; B attaches D
  //       to a survivor in S → A can SELECT D's rules. A cannot edit D.
  // ---------------------------------------------------------------------------
  it('EC-6: settlement owner can read a collaborator-authored disorder attached via a survivor in the shared settlement', async () => {
    const survivorId = await seedSurvivor(settlementId)
    const { id: disorderId, rules } = await seedDisorder(userB.id, 'EC-6')

    const { error: attachErr } = await admin
      .from('survivor_disorder')
      .insert({ survivor_id: survivorId, disorder_id: disorderId })
    if (attachErr) throw new Error(`attach disorder: ${attachErr.message}`)

    // A (owner) reads D's rules through transitive visibility.
    const { data: aRead, error: aErr } = await userA.client
      .from('disorder')
      .select('id, disorder_name, rules, custom, user_id')
      .eq('id', disorderId)
      .maybeSingle()
    expect(aErr).toBeNull()
    expect(aRead).not.toBeNull()
    expect(aRead?.rules).toBe(rules)
    expect(aRead?.custom).toBe(true)
    expect(aRead?.user_id).toBe(userB.id)

    // A cannot UPDATE the row.
    await userA.client
      .from('disorder')
      .update({ rules: 'Owner overwrites collaborator rules' })
      .eq('id', disorderId)

    const { data: persisted } = await admin
      .from('disorder')
      .select('rules')
      .eq('id', disorderId)
      .single()
    expect(persisted?.rules).toBe(rules)
  })

  // ---------------------------------------------------------------------------
  // EC-7: (EC-6) + A removes B from S → A loses access to D's rules text.
  //
  // Per `local/sharing-architecture.md` Appendix B, after B is removed
  // from S the settlement owner A must no longer be able to read the
  // rules text of the collaborator-authored disorder D, even though the
  // `survivor_disorder` row remains (it is not cascaded by removing the
  // collaborator share — only by detaching the disorder or removing the
  // survivor).
  //
  // This is enforced by the author-membership clause added to every
  // Phase 2 transitive SELECT policy in
  // `20260523000000_catalog_author_membership_select.sql`: the new
  // `is_settlement_member(s.id, <catalog>.user_id)` predicate evaluates
  // to false once B is removed from S, so A's transitive SELECT path on
  // D collapses. The author SELECT path
  // (`Allow select for owner and custom`) is unaffected, so B can still
  // read their own row.
  // ---------------------------------------------------------------------------
  it('EC-7: owner loses SELECT on a collaborator-authored disorder after the collaborator is removed from the settlement', async () => {
    const sId = await seedSettlement(userA.id, 'EC-7 Settlement')
    await shareSettlement(sId, userB.id, userA.id)

    const survivorId = await seedSurvivor(sId)
    const { id: disorderId, rules } = await seedDisorder(userB.id, 'EC-7')

    const { error: attachErr } = await admin
      .from('survivor_disorder')
      .insert({ survivor_id: survivorId, disorder_id: disorderId })
    if (attachErr) throw new Error(`attach disorder: ${attachErr.message}`)

    // Sanity: A sees the row while B is still a collaborator.
    const { data: beforeRemove } = await userA.client
      .from('disorder')
      .select('id, rules')
      .eq('id', disorderId)
      .maybeSingle()
    expect(beforeRemove).not.toBeNull()
    expect(beforeRemove?.rules).toBe(rules)

    // A removes B from S.
    const { error: unshareErr } = await admin
      .from('settlement_shared_user')
      .delete()
      .eq('settlement_id', sId)
      .eq('shared_user_id', userB.id)
    if (unshareErr) throw new Error(`unshare: ${unshareErr.message}`)

    // After the author-membership clause kicks in, A's transitive path
    // collapses: RLS silently hides the row from A.
    const { data: afterRemove, error: afterErr } = await userA.client
      .from('disorder')
      .select('id, rules')
      .eq('id', disorderId)
      .maybeSingle()
    expect(afterErr).toBeNull()
    expect(afterRemove).toBeNull()

    // B (the author) can still read their own row via the
    // `Allow select for owner and custom` policy, which is independent
    // of settlement membership.
    const { data: authorStillSees } = await userB.client
      .from('disorder')
      .select('id, rules')
      .eq('id', disorderId)
      .maybeSingle()
    expect(authorStillSees).not.toBeNull()
    expect(authorStillSees?.rules).toBe(rules)

    // The `survivor_disorder` row remains regardless of policy — it is
    // not cascaded by `settlement_shared_user` deletion.
    const { data: junctionStill } = await admin
      .from('survivor_disorder')
      .select('disorder_id')
      .eq('survivor_id', survivorId)
      .eq('disorder_id', disorderId)
      .maybeSingle()
    expect(junctionStill).not.toBeNull()
  })

  // ---------------------------------------------------------------------------
  // EC-8: (EC-6) + B tries to delete D while D is attached to A's
  //       settlement → BEFORE DELETE trigger raises with code 0A000 and a
  //       friendly message naming the blocking settlement.
  // ---------------------------------------------------------------------------
  it("EC-8: author cannot delete a custom disorder while it is still attached to another user's settlement", async () => {
    const survivorId = await seedSurvivor(settlementId)
    const { id: disorderId } = await seedDisorder(userB.id, 'EC-8')

    const { error: attachErr } = await admin
      .from('survivor_disorder')
      .insert({ survivor_id: survivorId, disorder_id: disorderId })
    if (attachErr) throw new Error(`attach disorder: ${attachErr.message}`)

    // B (author) attempts to delete D. The BEFORE DELETE guard must
    // raise because A's settlement still references D via the survivor.
    const { error } = await userB.client
      .from('disorder')
      .delete()
      .eq('id', disorderId)

    expect(error).not.toBeNull()
    expect(error?.code).toBe('0A000')
    expect(error?.message).toMatch(/unmake what others rely upon/i)
    expect(error?.message).toContain('EC-2..EC-8 Test Settlement')

    // The disorder row must still exist.
    const { data: still } = await admin
      .from('disorder')
      .select('id')
      .eq('id', disorderId)
      .maybeSingle()
    expect(still).not.toBeNull()
  })

  // ---------------------------------------------------------------------------
  // Realtime: owner edits K's rules; collaborator's subscription receives
  // the event.
  //
  // Skipped per the issue scope ("skipped or marked as e2e"). The
  // publication-membership lock in `__tests__/integration/realtime-publication.test.ts`
  // already pins the catalog tables (including `knowledge`) into
  // `supabase_realtime`. An end-to-end subscription test belongs in a
  // dedicated e2e harness because it requires the realtime websocket
  // connection and event polling, which is out of scope for this RLS suite.
  // ---------------------------------------------------------------------------
  it.skip('realtime: collaborator subscription receives owner edits to attached knowledge (e2e)', () => {
    // Intentionally left blank. Tracked in the realtime publication test
    // and the future end-to-end harness.
  })
})
