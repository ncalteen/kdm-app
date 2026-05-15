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
 * RLS — Catalog Transitive SELECT via Survivor Columns ([E2.1.b])
 *
 * Locks in the survivor-column transitive-visibility policy added in
 * `20260515000000_catalog_transitive_via_survivor.sql`. When a custom
 * catalog row is referenced directly by a column on `survivor`
 * (no junction table), the settlement owner and any
 * `settlement_shared_user` collaborator must be able to SELECT the catalog
 * row. Strangers must not.
 *
 * Catalogs covered:
 *   * `weapon_type`     ← survivor.weapon_type_id
 *   * `philosophy`      ← survivor.philosophy_id
 *   * `neurosis`        ← survivor.neurosis_id
 *   * `knowledge`       ← survivor.knowledge_1_id / knowledge_2_id /
 *                          tenet_knowledge_id
 *   * `philosophy_rank` ← parent philosophy reached via the same chain
 *
 * Architecture: docs/sharing-architecture.md §5.2 Decision 2,
 * Appendix A, Appendix B EC-2 / EC-6.
 */
describe('RLS: catalog transitive SELECT via survivor columns', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let settlementId: string
  let survivorId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()

    settlementId = await seedSettlement(
      owner.id,
      'Catalog Transitive Via Survivor Test Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)

    const { data: sv, error: svErr } = await admin
      .from('survivor')
      .insert({
        settlement_id: settlementId,
        gender: 'FEMALE',
        survivor_name: 'Catalog Transitive Via Survivor Test Survivor'
      })
      .select('id')
      .single()
    if (svErr || !sv) throw new Error(`seed survivor: ${svErr?.message}`)
    survivorId = sv.id
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  /**
   * Smoke matrix — for each (catalog, survivor column) pair, the
   * collaborator-authored row referenced by the shared settlement's survivor
   * must be visible to the owner AND to the collaborator (author SELECT),
   * but NOT to the stranger.
   */
  describe('all 4 survivor-column catalogs (smoke per-table)', () => {
    const cases: Array<{
      catalog: string
      survivorCol: string
      nameCol: string
    }> = [
      {
        catalog: 'weapon_type',
        survivorCol: 'weapon_type_id',
        nameCol: 'weapon_type_name'
      },
      {
        catalog: 'philosophy',
        survivorCol: 'philosophy_id',
        nameCol: 'philosophy_name'
      },
      {
        catalog: 'neurosis',
        survivorCol: 'neurosis_id',
        nameCol: 'neurosis_name'
      },
      {
        catalog: 'knowledge',
        survivorCol: 'knowledge_1_id',
        nameCol: 'knowledge_name'
      }
    ]

    for (const c of cases) {
      it(`owner & author can read collaborator-authored ${c.catalog} referenced by survivor.${c.survivorCol}; stranger cannot`, async () => {
        const name = `${c.catalog}-${Date.now()}-${Math.random()}`
        const { data: row, error: rowErr } = await admin
          .from(c.catalog)
          .insert({
            [c.nameCol]: name,
            custom: true,
            user_id: collaborator.id
          })
          .select('id')
          .single()
        if (rowErr || !row)
          throw new Error(`seed ${c.catalog}: ${rowErr?.message}`)

        const { error: linkErr } = await admin
          .from('survivor')
          .update({ [c.survivorCol]: row.id })
          .eq('id', survivorId)
        if (linkErr)
          throw new Error(`link survivor.${c.survivorCol}: ${linkErr.message}`)

        // Owner sees the row.
        const { data: ownerRead, error: ownerErr } = await owner.client
          .from(c.catalog)
          .select('*')
          .eq('id', row.id)
          .maybeSingle()
        expect(ownerErr).toBeNull()
        expect(ownerRead).not.toBeNull()
        expect(
          (ownerRead as unknown as Record<string, unknown>)[c.nameCol]
        ).toBe(name)

        // Author (collaborator) sees the row via `Allow select for owner
        // and custom`.
        const { data: authorRead, error: authorErr } = await collaborator.client
          .from(c.catalog)
          .select('id')
          .eq('id', row.id)
          .maybeSingle()
        expect(authorErr).toBeNull()
        expect(authorRead).not.toBeNull()

        // Stranger does not see the row.
        const { data: strangerRead } = await stranger.client
          .from(c.catalog)
          .select('id')
          .eq('id', row.id)
          .maybeSingle()
        expect(strangerRead).toBeNull()

        // Cleanup link so subsequent cases for the same column start clean.
        await admin
          .from('survivor')
          .update({ [c.survivorCol]: null })
          .eq('id', survivorId)
      })
    }
  })

  describe('knowledge — every survivor knowledge column reaches the catalog row', () => {
    for (const col of [
      'knowledge_1_id',
      'knowledge_2_id',
      'tenet_knowledge_id'
    ]) {
      it(`survivor.${col} grants SELECT to the settlement owner`, async () => {
        const name = `Knowledge-${col}-${Date.now()}-${Math.random()}`
        const { data: row, error: rowErr } = await admin
          .from('knowledge')
          .insert({
            knowledge_name: name,
            custom: true,
            user_id: collaborator.id,
            rules: `A truth bound to ${col}.`
          })
          .select('id')
          .single()
        if (rowErr || !row)
          throw new Error(`seed knowledge: ${rowErr?.message}`)

        await admin
          .from('survivor')
          .update({ [col]: row.id })
          .eq('id', survivorId)

        const { data: ownerRead, error: ownerErr } = await owner.client
          .from('knowledge')
          .select('id, rules')
          .eq('id', row.id)
          .maybeSingle()
        expect(ownerErr).toBeNull()
        expect(ownerRead?.rules).toBe(`A truth bound to ${col}.`)

        const { data: strangerRead } = await stranger.client
          .from('knowledge')
          .select('id')
          .eq('id', row.id)
          .maybeSingle()
        expect(strangerRead).toBeNull()

        await admin
          .from('survivor')
          .update({ [col]: null })
          .eq('id', survivorId)
      })
    }
  })

  describe('philosophy_rank — visible iff parent philosophy is visible via survivor', () => {
    let philosophyId: string
    let philosophyRankId: string

    beforeAll(async () => {
      // Collaborator authors a custom philosophy and a rank under it.
      const { data: p, error: pErr } = await admin
        .from('philosophy')
        .insert({
          philosophy_name: `Philosophy-Rank-Test-${Date.now()}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (pErr || !p) throw new Error(`seed philosophy: ${pErr?.message}`)
      philosophyId = p.id

      const { data: pr, error: prErr } = await admin
        .from('philosophy_rank')
        .insert({
          philosophy_id: p.id,
          rank_number: 1,
          rules: 'The first rank reveals only shadow.'
        })
        .select('id')
        .single()
      if (prErr || !pr)
        throw new Error(`seed philosophy_rank: ${prErr?.message}`)
      philosophyRankId = pr.id
    })

    it('owner cannot read the rank when no survivor references the parent philosophy', async () => {
      const { data, error } = await owner.client
        .from('philosophy_rank')
        .select('id')
        .eq('id', philosophyRankId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('owner can read the rank once a survivor references the parent philosophy', async () => {
      await admin
        .from('survivor')
        .update({ philosophy_id: philosophyId })
        .eq('id', survivorId)

      const { data, error } = await owner.client
        .from('philosophy_rank')
        .select('id, rules')
        .eq('id', philosophyRankId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect(data?.rules).toBe('The first rank reveals only shadow.')

      // Stranger never sees the rank.
      const { data: strangerRead } = await stranger.client
        .from('philosophy_rank')
        .select('id')
        .eq('id', philosophyRankId)
        .maybeSingle()
      expect(strangerRead).toBeNull()
    })

    it('owner loses rank visibility after the survivor link is cleared (EC-4)', async () => {
      await admin
        .from('survivor')
        .update({ philosophy_id: null })
        .eq('id', survivorId)

      const { data, error } = await owner.client
        .from('philosophy_rank')
        .select('id')
        .eq('id', philosophyRankId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('negative cases', () => {
    it('owner cannot SELECT a custom weapon_type that no survivor references', async () => {
      const { data: row } = await admin
        .from('weapon_type')
        .insert({
          weapon_type_name: `Orphan WT ${Date.now()}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()

      const { data, error } = await owner.client
        .from('weapon_type')
        .select('id')
        .eq('id', row!.id)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('transitive SELECT does not grant UPDATE on a referenced philosophy', async () => {
      const { data: row } = await admin
        .from('philosophy')
        .insert({
          philosophy_name: `Read-only Philosophy ${Date.now()}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()

      await admin
        .from('survivor')
        .update({ philosophy_id: row!.id })
        .eq('id', survivorId)

      await owner.client
        .from('philosophy')
        .update({ philosophy_name: 'HACKED' })
        .eq('id', row!.id)

      const { data: check } = await admin
        .from('philosophy')
        .select('philosophy_name')
        .eq('id', row!.id)
        .single()
      expect(check?.philosophy_name).not.toBe('HACKED')

      await admin
        .from('survivor')
        .update({ philosophy_id: null })
        .eq('id', survivorId)
    })
  })
})
