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
 * RLS — Settlement Owner Cannot Delete A Collaborator's Custom Catalog Row
 *
 * Scenario:
 *   * Owner shares a settlement with a collaborator.
 *   * Collaborator authors a custom catalog row (e.g. a custom innovation)
 *     and attaches it to the shared settlement.
 *
 * Required behavior:
 *   * The settlement owner CAN read the custom catalog row through
 *     transitive visibility (locked in by
 *     `catalog-visibility-via-settlement.test.ts`).
 *   * The settlement owner CANNOT hard-delete the underlying catalog row —
 *     the "Allow delete for owner and custom" RLS policy on every catalog
 *     table is author-only (`custom AND user_id = auth.uid()`), so the
 *     owner's DELETE silently affects zero rows and the row stays put.
 *   * The settlement owner CAN remove the row from their settlement by
 *     deleting the `settlement_*` junction row. The underlying catalog row
 *     remains intact and the collaborator still owns it.
 *
 * Together these two guarantees enforce the product rule:
 *   "Settlement owners may detach collaborator-authored custom content
 *   from their settlement, but they may never destroy the collaborator's
 *   work."
 *
 * Companion guard:
 *   `catalog-delete-guard.test.ts` covers the inverse — the
 *   `enforce_catalog_delete_guard` trigger prevents the AUTHOR from
 *   hard-deleting a custom row while it is still attached to another
 *   user's settlement.
 */
describe('RLS: settlement owner cannot delete collaborator custom catalog rows', () => {
  let owner: TestUser
  let collaborator: TestUser
  let settlementId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    settlementId = await seedSettlement(
      owner.id,
      'Owner-Cannot-Delete Test Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
  })

  /**
   * Settlement-attached catalog tables we want to lock in. Mirrors the
   * coverage set in `catalog-visibility-via-settlement.test.ts` so any
   * future settlement-attached catalog table that gets added there should
   * be added here too.
   */
  const cases: Array<{
    catalog: string
    junction: string
    fk: string
    nameCol: string
    extraCatalog?: Record<string, unknown>
    extraJunction?: Record<string, unknown>
  }> = [
    {
      catalog: 'knowledge',
      junction: 'settlement_knowledge',
      fk: 'knowledge_id',
      nameCol: 'knowledge_name'
    },
    {
      catalog: 'philosophy',
      junction: 'settlement_philosophy',
      fk: 'philosophy_id',
      nameCol: 'philosophy_name'
    },
    {
      catalog: 'gear',
      junction: 'settlement_gear',
      fk: 'gear_id',
      nameCol: 'gear_name',
      extraJunction: { quantity: 1 }
    },
    {
      catalog: 'innovation',
      junction: 'settlement_innovation',
      fk: 'innovation_id',
      nameCol: 'innovation_name'
    },
    {
      catalog: 'pattern',
      junction: 'settlement_pattern',
      fk: 'pattern_id',
      nameCol: 'pattern_name'
    },
    {
      catalog: 'seed_pattern',
      junction: 'settlement_seed_pattern',
      fk: 'seed_pattern_id',
      nameCol: 'seed_pattern_name'
    },
    {
      catalog: 'collective_cognition_reward',
      junction: 'settlement_collective_cognition_reward',
      fk: 'collective_cognition_reward_id',
      nameCol: 'reward_name',
      extraCatalog: { collective_cognition: 1 }
    },
    {
      catalog: 'location',
      junction: 'settlement_location',
      fk: 'location_id',
      nameCol: 'location_name'
    },
    {
      catalog: 'milestone',
      junction: 'settlement_milestone',
      fk: 'milestone_id',
      nameCol: 'milestone_name',
      extraCatalog: { event_name: 'event' }
    },
    {
      catalog: 'principle',
      junction: 'settlement_principle',
      fk: 'principle_id',
      nameCol: 'principle_name',
      extraCatalog: { option_1_name: 'a', option_2_name: 'b' }
    },
    {
      catalog: 'resource',
      junction: 'settlement_resource',
      fk: 'resource_id',
      nameCol: 'resource_name',
      extraCatalog: { category: 'BASIC', resource_types: [] },
      extraJunction: { quantity: 1 }
    },
    {
      catalog: 'quarry',
      junction: 'settlement_quarry',
      fk: 'quarry_id',
      nameCol: 'monster_name',
      extraCatalog: { node: 'NQ1' }
    },
    {
      catalog: 'nemesis',
      junction: 'settlement_nemesis',
      fk: 'nemesis_id',
      nameCol: 'monster_name',
      extraCatalog: { node: 'NN1' }
    }
  ]

  /**
   * Seeds a fresh collaborator-authored custom catalog row attached to
   * the shared settlement. Returns both ids so the test can clean up
   * after itself even if intermediate assertions throw.
   */
  async function seedAttachedCustomRow(c: (typeof cases)[number]): Promise<{
    catalogId: string
    junctionId: string
    name: string
  }> {
    const name = `${c.catalog}-${Date.now()}-${Math.random()}`
    const { data: row, error: rowErr } = await admin
      .from(c.catalog)
      .insert({
        [c.nameCol]: name,
        custom: true,
        user_id: collaborator.id,
        ...(c.extraCatalog ?? {})
      })
      .select('id')
      .single()
    if (rowErr || !row) throw new Error(`seed ${c.catalog}: ${rowErr?.message}`)

    const { data: j, error: jErr } = await admin
      .from(c.junction)
      .insert({
        settlement_id: settlementId,
        [c.fk]: row.id,
        ...(c.extraJunction ?? {})
      })
      .select('id')
      .single()
    if (jErr || !j) throw new Error(`seed ${c.junction}: ${jErr?.message}`)

    return { catalogId: row.id, junctionId: j.id, name }
  }

  for (const c of cases) {
    describe(`${c.catalog} (attached via ${c.junction})`, () => {
      it("owner's DELETE on the catalog row affects 0 rows and leaves the row intact", async () => {
        const { catalogId } = await seedAttachedCustomRow(c)

        // Owner can SEE the row (transitive SELECT).
        const { data: seen } = await owner.client
          .from(c.catalog)
          .select('id')
          .eq('id', catalogId)
          .maybeSingle()
        expect(seen?.id).toBe(catalogId)

        // Owner's DELETE silently filters via the author-only USING
        // clause: no error, but zero rows returned.
        const { data: deleted, error: delErr } = await owner.client
          .from(c.catalog)
          .delete()
          .eq('id', catalogId)
          .select('id')
        expect(delErr).toBeNull()
        expect(deleted ?? []).toEqual([])

        // Re-read with admin (bypasses RLS) to prove the row still exists
        // physically.
        const { data: still, error: stillErr } = await admin
          .from(c.catalog)
          .select('id, user_id, custom')
          .eq('id', catalogId)
          .maybeSingle()
        expect(stillErr).toBeNull()
        expect(still).not.toBeNull()
        expect(still?.user_id).toBe(collaborator.id)
        expect(still?.custom).toBe(true)

        // Cleanup.
        await admin.from(c.catalog).delete().eq('id', catalogId)
      })

      it('owner CAN delete the settlement junction row; the catalog row survives and the collaborator still owns it', async () => {
        const { catalogId, junctionId } = await seedAttachedCustomRow(c)

        // Owner deletes the junction row — this is the only sanctioned
        // way to remove the row from their settlement.
        const { data: detached, error: junctionErr } = await owner.client
          .from(c.junction)
          .delete()
          .eq('id', junctionId)
          .select('id')
        expect(junctionErr).toBeNull()
        expect(detached ?? []).toHaveLength(1)

        // Junction row is gone.
        const { data: junctionGone } = await admin
          .from(c.junction)
          .select('id')
          .eq('id', junctionId)
          .maybeSingle()
        expect(junctionGone).toBeNull()

        // Catalog row is NOT gone — the collaborator's work survives.
        const { data: catalogStill } = await admin
          .from(c.catalog)
          .select('id, user_id, custom')
          .eq('id', catalogId)
          .maybeSingle()
        expect(catalogStill).not.toBeNull()
        expect(catalogStill?.user_id).toBe(collaborator.id)
        expect(catalogStill?.custom).toBe(true)

        // Collaborator can still read their own row.
        const { data: collabRead } = await collaborator.client
          .from(c.catalog)
          .select('id')
          .eq('id', catalogId)
          .maybeSingle()
        expect(collabRead?.id).toBe(catalogId)

        // Cleanup.
        await admin.from(c.catalog).delete().eq('id', catalogId)
      })

      it('after detach, the owner loses visibility but the collaborator can still hard-delete their own row', async () => {
        const { catalogId, junctionId } = await seedAttachedCustomRow(c)

        // Owner detaches.
        const { error: junctionErr } = await owner.client
          .from(c.junction)
          .delete()
          .eq('id', junctionId)
        expect(junctionErr).toBeNull()

        // Owner can no longer read the catalog row (no settlement
        // membership path to it any more).
        const { data: ownerLostSight } = await owner.client
          .from(c.catalog)
          .select('id')
          .eq('id', catalogId)
          .maybeSingle()
        expect(ownerLostSight).toBeNull()

        // Collaborator (author) can hard-delete now that no other user's
        // settlement still references the row. The catalog-delete-guard
        // trigger only blocks deletes when a NON-self settlement
        // references the row; here the only attachment was to a
        // settlement owned by `owner`, which has been removed.
        const { error: authorDelErr } = await collaborator.client
          .from(c.catalog)
          .delete()
          .eq('id', catalogId)
        expect(authorDelErr).toBeNull()

        const { data: catalogGone } = await admin
          .from(c.catalog)
          .select('id')
          .eq('id', catalogId)
          .maybeSingle()
        expect(catalogGone).toBeNull()
      })
    })
  }

  /**
   * Sanity: the symmetric scenario via a survivor-attached catalog
   * (`fighting_art` through `survivor_fighting_art`). Survivor-attached
   * catalogs travel through a different transitive-visibility path
   * (`20260515000000_catalog_transitive_via_survivor.sql`), and their
   * DELETE policies are still author-only, so the same rule must hold.
   */
  describe('survivor-attached catalog (fighting_art via survivor_fighting_art)', () => {
    it("owner cannot hard-delete a collaborator's fighting_art attached to a survivor in the shared settlement", async () => {
      // Owner creates a survivor in the shared settlement (admin client to
      // keep this independent of survivor RLS).
      const { data: sv, error: svErr } = await admin
        .from('survivor')
        .insert({
          settlement_id: settlementId,
          gender: 'FEMALE',
          survivor_name: 'Shared-Settlement Survivor'
        })
        .select('id')
        .single()
      if (svErr || !sv) throw new Error(`seed survivor: ${svErr?.message}`)

      const { data: fa, error: faErr } = await admin
        .from('fighting_art')
        .insert({
          fighting_art_name: `Collab Fighting Art ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (faErr || !fa) throw new Error(`seed fighting_art: ${faErr?.message}`)

      const { data: sf, error: sfErr } = await admin
        .from('survivor_fighting_art')
        .insert({ survivor_id: sv.id, fighting_art_id: fa.id })
        .select('id')
        .single()
      if (sfErr || !sf)
        throw new Error(`seed survivor_fighting_art: ${sfErr?.message}`)

      // Owner can SELECT the fighting art transitively.
      const { data: ownerSees } = await owner.client
        .from('fighting_art')
        .select('id')
        .eq('id', fa.id)
        .maybeSingle()
      expect(ownerSees?.id).toBe(fa.id)

      // Owner's DELETE on the catalog row is blocked silently.
      const { data: ownerDel, error: ownerDelErr } = await owner.client
        .from('fighting_art')
        .delete()
        .eq('id', fa.id)
        .select('id')
      expect(ownerDelErr).toBeNull()
      expect(ownerDel ?? []).toEqual([])

      // Row still exists.
      const { data: stillFa } = await admin
        .from('fighting_art')
        .select('id, user_id')
        .eq('id', fa.id)
        .maybeSingle()
      expect(stillFa?.user_id).toBe(collaborator.id)

      // Owner CAN remove the linkage via the survivor's
      // `survivor_fighting_art` row (survivor-scoped RLS lets the
      // settlement owner mutate). The catalog row still survives.
      const { error: detachErr } = await owner.client
        .from('survivor_fighting_art')
        .delete()
        .eq('id', sf.id)
      expect(detachErr).toBeNull()

      const { data: stillFa2 } = await admin
        .from('fighting_art')
        .select('id')
        .eq('id', fa.id)
        .maybeSingle()
      expect(stillFa2?.id).toBe(fa.id)

      // Cleanup.
      await admin.from('fighting_art').delete().eq('id', fa.id)
      await admin.from('survivor').delete().eq('id', sv.id)
    })
  })
})
