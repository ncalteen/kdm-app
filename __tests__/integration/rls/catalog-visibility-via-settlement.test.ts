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
 * RLS — Catalog Visibility Via Settlement Membership
 *
 * Locks in the Phase 2 (partial) policy added in
 * `20260512000000_catalog_visibility_via_settlement.sql`. When a custom
 * catalog row is attached to a settlement, both the settlement's owner and
 * its collaborators must be able to SELECT the catalog row's full content.
 *
 * Mirrors EC-6 from docs/settlement-sharing-architecture.md: a collaborator
 * authors a custom row, attaches it to a shared settlement, and the owner can
 * read the rules text.
 *
 * Coverage strategy:
 *   * `knowledge` is exercised in depth (positive owner read, positive
 *     collaborator read, negative non-member read, detach-then-hide).
 *   * The other 12 settlement-attached catalogs are smoke-tested with the
 *     "owner can read collaborator-authored attached row" path. A
 *     regression that drops a single CREATE POLICY block from the migration
 *     is caught by the per-table loop below.
 */
describe('RLS: catalog visibility via settlement membership', () => {
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
      'Catalog Visibility Test Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  describe('knowledge (in-depth)', () => {
    let knowledgeId: string
    let settlementKnowledgeId: string

    beforeAll(async () => {
      // Collaborator authors a custom knowledge.
      const knowledgeName = `Whispered Truth ${Date.now()}`
      const { data: k, error: kErr } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: knowledgeName,
          custom: true,
          user_id: collaborator.id,
          rules: 'A truth only the dark remembers.'
        })
        .select('id')
        .single()
      if (kErr || !k) throw new Error(`seed knowledge: ${kErr?.message}`)
      knowledgeId = k.id

      // Collaborator attaches it to the shared settlement.
      const { data: sj, error: sjErr } = await admin
        .from('settlement_knowledge')
        .insert({ settlement_id: settlementId, knowledge_id: k.id })
        .select('id')
        .single()
      if (sjErr || !sj)
        throw new Error(`seed settlement_knowledge: ${sjErr?.message}`)
      settlementKnowledgeId = sj.id
    })

    it('settlement owner can read the rules text of an attached collaborator-authored row', async () => {
      const { data, error } = await owner.client
        .from('knowledge')
        .select('id, knowledge_name, rules, custom, user_id')
        .eq('id', knowledgeId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect(data?.rules).toBe('A truth only the dark remembers.')
      expect(data?.custom).toBe(true)
      expect(data?.user_id).toBe(collaborator.id)
    })

    it('collaborator can still read their own attached custom row', async () => {
      const { data, error } = await collaborator.client
        .from('knowledge')
        .select('id, rules')
        .eq('id', knowledgeId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data?.rules).toBe('A truth only the dark remembers.')
    })

    it('an unrelated user (no settlement membership) cannot read the row', async () => {
      const { data, error } = await stranger.client
        .from('knowledge')
        .select('id')
        .eq('id', knowledgeId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('after the row is detached, the owner loses visibility (EC-4)', async () => {
      // Detach.
      await admin
        .from('settlement_knowledge')
        .delete()
        .eq('id', settlementKnowledgeId)

      const { data, error } = await owner.client
        .from('knowledge')
        .select('id')
        .eq('id', knowledgeId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data).toBeNull()

      // Re-attach for any subsequent assertions in this file.
      const { data: sj } = await admin
        .from('settlement_knowledge')
        .insert({ settlement_id: settlementId, knowledge_id: knowledgeId })
        .select('id')
        .single()
      if (sj) settlementKnowledgeId = sj.id
    })

    it('does not grant a path to UPDATE the row (read-only transitive visibility)', async () => {
      const { error } = await owner.client
        .from('knowledge')
        .update({ rules: 'Owner overwrites collaborator rules' })
        .eq('id', knowledgeId)

      // RLS may surface this as a row-not-found (PGRST116) or as an
      // update-violates-policy error (42501). Either is correct; what
      // matters is the persisted row was NOT modified.
      // Re-read with admin to confirm.
      const { data } = await admin
        .from('knowledge')
        .select('rules')
        .eq('id', knowledgeId)
        .single()
      expect(data?.rules).toBe('A truth only the dark remembers.')
      // We don't strictly require an error code; some configurations let the
      // update silently affect zero rows. Either branch is acceptable as
      // long as the row is unchanged.
      void error
    })
  })

  describe('all 13 settlement-attached catalogs (smoke per-table)', () => {
    // (catalog table, junction table, fk column, name column, extra-row-cols)
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

    for (const c of cases) {
      it(`owner reads collaborator-authored attached row in ${c.catalog}`, async () => {
        const name = `${c.catalog}-${Date.now()}-${Math.random()}`
        const insertCatalog = {
          [c.nameCol]: name,
          custom: true,
          user_id: collaborator.id,
          ...(c.extraCatalog ?? {})
        }
        const { data: row, error: rowErr } = await admin
          .from(c.catalog)
          .insert(insertCatalog)
          .select('id')
          .single()
        if (rowErr || !row)
          throw new Error(`seed ${c.catalog}: ${rowErr?.message}`)

        const { error: sjErr } = await admin.from(c.junction).insert({
          settlement_id: settlementId,
          [c.fk]: row.id,
          ...(c.extraJunction ?? {})
        })
        if (sjErr) throw new Error(`seed ${c.junction}: ${sjErr.message}`)

        // Owner sees the row.
        const { data: ownerRead, error: ownerErr } = await owner.client
          .from(c.catalog)
          .select(`id, ${c.nameCol}`)
          .eq('id', row.id)
          .maybeSingle()
        expect(ownerErr).toBeNull()
        expect(ownerRead).not.toBeNull()
        expect(ownerRead![c.nameCol as never]).toBe(name)

        // Stranger does not.
        const { data: strangerRead } = await stranger.client
          .from(c.catalog)
          .select('id')
          .eq('id', row.id)
          .maybeSingle()
        expect(strangerRead).toBeNull()
      })
    }
  })
})
