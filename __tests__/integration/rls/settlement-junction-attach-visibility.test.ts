import {
  admin,
  createTestUser,
  deleteTestUser,
  seedSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Settlement Junction Attach Visibility Guard
 *
 * Locks in the security hardening from
 * `20260513000000_settlement_junction_attach_visibility.sql`. That
 * migration AND-s a catalog-visibility predicate into the INSERT and
 * UPDATE WITH CHECK clauses of every settlement_* junction that points
 * at a custom-content catalog table:
 *
 *   exists (select 1 from public.<catalog> c where c.id = <fk>)
 *
 * The guard closes a side-channel that opened up when the new
 * `Allow select via settlement membership` policy on catalog tables
 * went live: without it, any settlement member could attach a guessed
 * or leaked foreign catalog UUID to one of their own settlements and
 * then read its rules text via the new transitive predicate.
 *
 * Coverage strategy:
 *   * Knowledge gets the in-depth scenarios (foreign rule blocks
 *     attach; legit attach still works for built-ins, owner customs,
 *     and shared-via-membership customs; UPDATE re-rewrite to a
 *     foreign FK is also blocked).
 *   * The other 12 catalog tables get a smoke test for the foreign-
 *     attach-blocked path so a regression that drops a single CASE
 *     branch from the migration's loop is caught.
 */
describe('RLS: settlement junction attach visibility guard', () => {
  let owner: TestUser
  let stranger: TestUser
  let settlementId: string

  beforeAll(async () => {
    owner = await createTestUser()
    stranger = await createTestUser()
    settlementId = await seedSettlement(owner.id, 'Attach Guard Test')
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(stranger.id)
  })

  describe('knowledge (in-depth)', () => {
    it("blocks attaching a stranger's invisible custom knowledge", async () => {
      // Stranger authors a custom catalog row that the owner has no path
      // to SEE: not a member of any shared settlement.
      const { data: foreign, error: foreignErr } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Foreign ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: stranger.id
        })
        .select('id')
        .single()
      if (foreignErr || !foreign)
        throw new Error(`seed foreign knowledge: ${foreignErr?.message}`)

      // Owner attempts to attach the foreign row to their own settlement.
      // The catalog-visibility AND-clause on the junction's INSERT WITH
      // CHECK must reject this insert — the owner has no path to SELECT
      // the foreign row, so `exists (...)` evaluates to false.
      const { data, error } = await owner.client
        .from('settlement_knowledge')
        .insert({
          settlement_id: settlementId,
          knowledge_id: foreign.id
        })
        .select('id')

      expect(error).not.toBeNull()
      expect(data ?? []).toHaveLength(0)
      // RLS policy violations surface as 42501.
      expect(error?.code ?? '').toMatch(/42501|PGRST/)
    })

    it('blocks UPDATE that rewrites a junction row to point at a foreign catalog row', async () => {
      // First, attach an owner-authored custom knowledge — this is a
      // legitimate attach and should succeed.
      const { data: ownKnowledge } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Owner Auth ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: owner.id
        })
        .select('id')
        .single()
      if (!ownKnowledge) throw new Error('seed owner knowledge failed')

      const { data: junction, error: insertErr } = await owner.client
        .from('settlement_knowledge')
        .insert({
          settlement_id: settlementId,
          knowledge_id: ownKnowledge.id
        })
        .select('id')
        .single()
      expect(insertErr).toBeNull()
      expect(junction).not.toBeNull()

      // Stranger authors a foreign custom row.
      const { data: foreign } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Foreign UPD ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: stranger.id
        })
        .select('id')
        .single()
      if (!foreign) throw new Error('seed foreign knowledge failed')

      // Owner tries to swap the junction's FK to point at the foreign
      // row. The UPDATE WITH CHECK must reject this.
      const { error } = await owner.client
        .from('settlement_knowledge')
        .update({ knowledge_id: foreign.id })
        .eq('id', junction!.id)
        .select('id')

      expect(error).not.toBeNull()

      // Confirm via admin that the row was NOT modified.
      const { data: refetched } = await admin
        .from('settlement_knowledge')
        .select('knowledge_id')
        .eq('id', junction!.id)
        .single()
      expect(refetched?.knowledge_id).toBe(ownKnowledge.id)
    })

    it('still allows attaching a built-in (non-custom) catalog row', async () => {
      // Built-ins are visible to all authenticated users, so the
      // visibility predicate must accept them.
      const { data: builtIn } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Built-in ${Date.now()}-${Math.random()}`,
          custom: false
        })
        .select('id')
        .single()
      if (!builtIn) throw new Error('seed built-in knowledge failed')

      const { error } = await owner.client.from('settlement_knowledge').insert({
        settlement_id: settlementId,
        knowledge_id: builtIn.id
      })

      expect(error).toBeNull()
    })

    it("still allows attaching the owner's own custom catalog row", async () => {
      const { data: own } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Own Auth ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: owner.id
        })
        .select('id')
        .single()
      if (!own) throw new Error('seed own knowledge failed')

      const { error } = await owner.client.from('settlement_knowledge').insert({
        settlement_id: settlementId,
        knowledge_id: own.id
      })

      expect(error).toBeNull()
    })
  })

  describe('all 13 settlement-attached junctions (smoke per-table)', () => {
    const cases: Array<{
      junction: string
      catalog: string
      fk: string
      nameCol: string
      extraCatalog?: Record<string, unknown>
      extraJunction?: Record<string, unknown>
    }> = [
      {
        junction: 'settlement_knowledge',
        catalog: 'knowledge',
        fk: 'knowledge_id',
        nameCol: 'knowledge_name'
      },
      {
        junction: 'settlement_philosophy',
        catalog: 'philosophy',
        fk: 'philosophy_id',
        nameCol: 'philosophy_name'
      },
      {
        junction: 'settlement_gear',
        catalog: 'gear',
        fk: 'gear_id',
        nameCol: 'gear_name',
        extraJunction: { quantity: 1 }
      },
      {
        junction: 'settlement_innovation',
        catalog: 'innovation',
        fk: 'innovation_id',
        nameCol: 'innovation_name'
      },
      {
        junction: 'settlement_pattern',
        catalog: 'pattern',
        fk: 'pattern_id',
        nameCol: 'pattern_name'
      },
      {
        junction: 'settlement_seed_pattern',
        catalog: 'seed_pattern',
        fk: 'seed_pattern_id',
        nameCol: 'seed_pattern_name'
      },
      {
        junction: 'settlement_collective_cognition_reward',
        catalog: 'collective_cognition_reward',
        fk: 'collective_cognition_reward_id',
        nameCol: 'reward_name',
        extraCatalog: { collective_cognition: 1 }
      },
      {
        junction: 'settlement_location',
        catalog: 'location',
        fk: 'location_id',
        nameCol: 'location_name'
      },
      {
        junction: 'settlement_milestone',
        catalog: 'milestone',
        fk: 'milestone_id',
        nameCol: 'milestone_name',
        extraCatalog: { event_name: 'event' }
      },
      {
        junction: 'settlement_principle',
        catalog: 'principle',
        fk: 'principle_id',
        nameCol: 'principle_name',
        extraCatalog: { option_1_name: 'a', option_2_name: 'b' }
      },
      {
        junction: 'settlement_resource',
        catalog: 'resource',
        fk: 'resource_id',
        nameCol: 'resource_name',
        extraCatalog: { category: 'BASIC', resource_types: [] },
        extraJunction: { quantity: 1 }
      },
      {
        junction: 'settlement_quarry',
        catalog: 'quarry',
        fk: 'quarry_id',
        nameCol: 'monster_name',
        extraCatalog: { node: 'NQ1' }
      },
      {
        junction: 'settlement_nemesis',
        catalog: 'nemesis',
        fk: 'nemesis_id',
        nameCol: 'monster_name',
        extraCatalog: { node: 'NN1' }
      }
    ]

    for (const c of cases) {
      it(`blocks attaching a foreign custom row to ${c.junction}`, async () => {
        const insertCatalog = {
          [c.nameCol]: `Foreign-${c.catalog}-${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: stranger.id,
          ...(c.extraCatalog ?? {})
        }
        const { data: foreign, error: foreignErr } = await admin
          .from(c.catalog)
          .insert(insertCatalog)
          .select('id')
          .single()
        if (foreignErr || !foreign)
          throw new Error(`seed ${c.catalog}: ${foreignErr?.message}`)

        const { data, error } = await owner.client
          .from(c.junction)
          .insert({
            settlement_id: settlementId,
            [c.fk]: foreign.id,
            ...(c.extraJunction ?? {})
          })
          .select('id')

        // Must be rejected.
        expect(error).not.toBeNull()
        expect(data ?? []).toHaveLength(0)
      })
    }
  })
})
