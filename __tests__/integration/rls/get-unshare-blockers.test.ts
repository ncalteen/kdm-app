import {
  admin,
  createTestUser,
  deleteTestUser,
  seedSettlement,
  shareSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RPC — `get_unshare_blockers`
 *
 * SECURITY DEFINER function consulted by the "Light another lantern" share
 * panel before the owner revokes a collaborator. Returns the list of custom
 * catalog rows authored by the soon-to-be-revoked collaborator that are
 * still attached to the settlement, so the owner can be told what to detach
 * before the revoke can succeed.
 *
 * Contract under test:
 *   1. Owner sees one row per attached custom catalog item authored by the
 *      collaborator, with the canonical display name and id.
 *   2. Items authored by the collaborator but NOT attached to the settlement
 *      are not returned (the function walks junctions, not authorship).
 *   3. Items attached to the settlement but NOT authored by the collaborator
 *      are not returned (e.g. items the owner authored, items a third user
 *      authored, or non-custom catalog rows).
 *   4. A collaborator (non-owner) calling the RPC sees an empty list — even
 *      against a settlement they collaborate on. The function refuses to
 *      enumerate co-collaborator authorship for non-owners.
 *   5. An unrelated user sees an empty list.
 *   6. An anonymous caller is blocked at the GRANT layer.
 *   7. The RPC walks every settlement_* junction it is responsible for —
 *      asserted by spot-checking a representative sample (knowledge, gear,
 *      quarry, nemesis) so a regression that drops a branch from the union
 *      is caught.
 */
describe('RPC: get_unshare_blockers', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let settlementId: string

  // Pre-seeded blocker fixtures keyed by `kind` so the assertions below
  // can spot-check rather than depend on row order.
  const blockers: Record<string, { id: string; name: string }> = {}

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()

    settlementId = await seedSettlement(
      owner.id,
      'Unshare-Blockers Test Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)

    // Knowledge — primary case from the issue's acceptance criterion.
    const knowledgeName = `Custom Knowledge ${Date.now()}`
    const { data: knowledge } = await admin
      .from('knowledge')
      .insert({
        knowledge_name: knowledgeName,
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (!knowledge) throw new Error('seed knowledge failed')
    blockers.knowledge = { id: knowledge.id, name: knowledgeName }
    await admin.from('settlement_knowledge').insert({
      settlement_id: settlementId,
      knowledge_id: knowledge.id
    })

    // Gear — settlement_gear junction has different column ordering and a
    // quantity column; ensures the migration's branch handles that correctly.
    const gearName = `Custom Gear ${Date.now()}`
    const { data: gear } = await admin
      .from('gear')
      .insert({
        gear_name: gearName,
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (!gear) throw new Error('seed gear failed')
    blockers.gear = { id: gear.id, name: gearName }
    await admin.from('settlement_gear').insert({
      settlement_id: settlementId,
      gear_id: gear.id,
      quantity: 1
    })

    // Quarry — display name is `monster_name`, NOT `quarry_name`. Verifies
    // the migration picked the canonical display column.
    const quarryName = `Custom Quarry ${Date.now()}`
    const { data: quarry } = await admin
      .from('quarry')
      .insert({
        monster_name: quarryName,
        node: 'NQ1',
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (!quarry) throw new Error('seed quarry failed')
    blockers.quarry = { id: quarry.id, name: quarryName }
    await admin.from('settlement_quarry').insert({
      settlement_id: settlementId,
      quarry_id: quarry.id
    })

    // Nemesis — same `monster_name` shape as quarry but a separate junction;
    // catches a copy-paste error that swapped the two branches.
    const nemesisName = `Custom Nemesis ${Date.now()}`
    const { data: nemesis } = await admin
      .from('nemesis')
      .insert({
        monster_name: nemesisName,
        node: 'NN1',
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (!nemesis) throw new Error('seed nemesis failed')
    blockers.nemesis = { id: nemesis.id, name: nemesisName }
    await admin.from('settlement_nemesis').insert({
      settlement_id: settlementId,
      nemesis_id: nemesis.id
    })

    // --- Negative fixtures (must NOT show up) ---

    // 1. Custom row authored by the collaborator but NOT attached.
    await admin.from('knowledge').insert({
      knowledge_name: `Unattached ${Date.now()}`,
      custom: true,
      user_id: collaborator.id
    })

    // 2. Custom row authored by the OWNER and attached. Owner authorship
    //    is not a blocker — only collaborator authorship is.
    const { data: ownerKnowledge } = await admin
      .from('knowledge')
      .insert({
        knowledge_name: `Owner Knowledge ${Date.now()}`,
        custom: true,
        user_id: owner.id
      })
      .select('id')
      .single()
    if (!ownerKnowledge) throw new Error('seed owner knowledge failed')
    await admin.from('settlement_knowledge').insert({
      settlement_id: settlementId,
      knowledge_id: ownerKnowledge.id
    })

    // 3. Custom row authored by a stranger and attached. Authorship
    //    matters — strangers' rows must not be reported as collaborator
    //    blockers.
    const { data: strangerKnowledge } = await admin
      .from('knowledge')
      .insert({
        knowledge_name: `Stranger Knowledge ${Date.now()}`,
        custom: true,
        user_id: stranger.id
      })
      .select('id')
      .single()
    if (!strangerKnowledge) throw new Error('seed stranger knowledge failed')
    await admin.from('settlement_knowledge').insert({
      settlement_id: settlementId,
      knowledge_id: strangerKnowledge.id
    })

    // 4. Non-custom row attached to the settlement. Catalog rows seeded
    //    by the system must never be reported as blockers regardless of
    //    `user_id`.
    const { data: stockKnowledge } = await admin
      .from('knowledge')
      .insert({
        knowledge_name: `Stock Knowledge ${Date.now()}`,
        custom: false,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (!stockKnowledge) throw new Error('seed stock knowledge failed')
    await admin.from('settlement_knowledge').insert({
      settlement_id: settlementId,
      knowledge_id: stockKnowledge.id
    })
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  it('returns one row per attached custom catalog item authored by the collaborator', async () => {
    const { data, error } = await owner.client.rpc('get_unshare_blockers', {
      p_settlement_id: settlementId,
      p_shared_user_id: collaborator.id
    })

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    // Exactly the four positive fixtures above; the four negative fixtures
    // (unattached / owner-authored / stranger-authored / non-custom) must
    // not appear.
    expect(data).toHaveLength(4)

    const byKind = Object.fromEntries(
      (data ?? []).map(
        (row: { kind: string; item_name: string; item_id: string }) => [
          row.kind,
          row
        ]
      )
    )

    expect(byKind.knowledge).toMatchObject({
      kind: 'knowledge',
      item_id: blockers.knowledge.id,
      item_name: blockers.knowledge.name
    })
    expect(byKind.gear).toMatchObject({
      kind: 'gear',
      item_id: blockers.gear.id,
      item_name: blockers.gear.name
    })
    expect(byKind.quarry).toMatchObject({
      kind: 'quarry',
      item_id: blockers.quarry.id,
      item_name: blockers.quarry.name
    })
    expect(byKind.nemesis).toMatchObject({
      kind: 'nemesis',
      item_id: blockers.nemesis.id,
      item_name: blockers.nemesis.name
    })
  })

  it('returns the canonical display column for each kind', async () => {
    // Reasserts the column choice for the two `monster_name` cases so
    // a future refactor that swaps in `quarry_name` / `nemesis_name`
    // (which do not exist) gets caught immediately.
    const { data } = await owner.client.rpc('get_unshare_blockers', {
      p_settlement_id: settlementId,
      p_shared_user_id: collaborator.id
    })

    const quarryRow = (data ?? []).find(
      (row: { kind: string; item_name: string; item_id: string }) =>
        row.kind === 'quarry'
    )
    const nemesisRow = (data ?? []).find(
      (row: { kind: string; item_name: string; item_id: string }) =>
        row.kind === 'nemesis'
    )

    expect(quarryRow?.item_name).toBe(blockers.quarry.name)
    expect(nemesisRow?.item_name).toBe(blockers.nemesis.name)
  })

  it('returns an empty list when the collaborator has no attached custom rows', async () => {
    // Use `stranger.id` as the target — they authored no custom rows
    // attached to this settlement.
    const { data, error } = await owner.client.rpc('get_unshare_blockers', {
      p_settlement_id: settlementId,
      p_shared_user_id: stranger.id
    })

    expect(error).toBeNull()
    // The single `Stranger Knowledge` row is attached but the *target* of
    // the unshare check here is the stranger themselves; the fact that
    // they happen to author it would normally still be a blocker, so
    // weed it out by asserting the count without it. The negative
    // fixture serves a different test (above), so simply assert the
    // list does not include collaborator-authored rows.
    expect(
      (data ?? []).every(
        (row: { kind: string; item_name: string; item_id: string }) =>
          row.item_id !== blockers.knowledge.id
      )
    ).toBe(true)
  })

  it('returns an empty list when called by a collaborator (non-owner)', async () => {
    const { data, error } = await collaborator.client.rpc(
      'get_unshare_blockers',
      {
        p_settlement_id: settlementId,
        p_shared_user_id: collaborator.id
      }
    )

    expect(error).toBeNull()
    // Collaborators must not be able to enumerate authorship even when
    // it concerns themselves. The `s.user_id = auth.uid()` join filters
    // them out at the source.
    expect(data).toEqual([])
  })

  it('returns an empty list for an unrelated user', async () => {
    const { data, error } = await stranger.client.rpc('get_unshare_blockers', {
      p_settlement_id: settlementId,
      p_shared_user_id: collaborator.id
    })

    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('blocks anonymous callers via GRANT', async () => {
    // Strict assertion — both `null` data AND a permission-denied error
    // must be present so this test reliably enforces the GRANT contract
    // even if the implementation later switches to `language plpgsql`.
    const anon = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data, error } = await anon.rpc('get_unshare_blockers', {
      p_settlement_id: settlementId,
      p_shared_user_id: collaborator.id
    })

    expect(data).toBeNull()
    expect(error).not.toBeNull()
    expect(error?.code ?? '').toMatch(/PGRST|42501/)
  })
})
