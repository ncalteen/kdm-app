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
 * RLS — Catalog Transitive SELECT via Survivor Junctions ([E2.1.a])
 *
 * Locks in the survivor-attached half of the Phase 2 transitive-visibility
 * policy added in
 * `20260514000000_catalog_transitive_select.sql`. When a custom catalog row
 * (`disorder`, `fighting_art`, `secret_fighting_art`,
 * `ability_impairment`) is attached to a survivor that lives in a shared
 * settlement, the settlement owner and any collaborator must be able to
 * SELECT the catalog row's full content. Strangers must not.
 *
 * Mirrors the structure of
 * `catalog-visibility-via-settlement.test.ts` but follows the
 * `catalog -> survivor_<x> -> survivor -> settlement` chain.
 *
 * Architecture references: docs/sharing-architecture.md §10 Phase 2
 * (2.1, 2.2), Appendix A "Phase 2 transitive-visibility list",
 * Appendix B EC-6.
 */
describe('RLS: catalog transitive SELECT via survivor junctions', () => {
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
      'Catalog Transitive Select Test Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)

    const { data: sv, error: svErr } = await admin
      .from('survivor')
      .insert({
        settlement_id: settlementId,
        gender: 'FEMALE',
        survivor_name: 'Catalog Transitive Test Survivor'
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

  describe('disorder (in-depth)', () => {
    let disorderId: string
    let survivorDisorderId: string

    beforeAll(async () => {
      // Collaborator authors a custom disorder.
      const name = `Hollow Quiet ${Date.now()}`
      const { data: d, error: dErr } = await admin
        .from('disorder')
        .insert({
          disorder_name: name,
          custom: true,
          user_id: collaborator.id,
          rules: 'Despair gnaws at the edges of memory.'
        })
        .select('id')
        .single()
      if (dErr || !d) throw new Error(`seed disorder: ${dErr?.message}`)
      disorderId = d.id

      // Collaborator attaches it to the shared survivor.
      const { data: sd, error: sdErr } = await admin
        .from('survivor_disorder')
        .insert({ survivor_id: survivorId, disorder_id: d.id })
        .select('id')
        .single()
      if (sdErr || !sd)
        throw new Error(`seed survivor_disorder: ${sdErr?.message}`)
      survivorDisorderId = sd.id
    })

    it('settlement owner reads the rules text of an attached collaborator-authored row', async () => {
      const { data, error } = await owner.client
        .from('disorder')
        .select('id, disorder_name, rules, custom, user_id')
        .eq('id', disorderId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect(data?.rules).toBe('Despair gnaws at the edges of memory.')
      expect(data?.custom).toBe(true)
      expect(data?.user_id).toBe(collaborator.id)
    })

    it('author (collaborator) still reads their own attached custom row', async () => {
      const { data, error } = await collaborator.client
        .from('disorder')
        .select('id, rules')
        .eq('id', disorderId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data?.rules).toBe('Despair gnaws at the edges of memory.')
    })

    it('an unrelated user cannot read the row', async () => {
      const { data, error } = await stranger.client
        .from('disorder')
        .select('id')
        .eq('id', disorderId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('after the junction is detached, the owner loses visibility (EC-4)', async () => {
      await admin
        .from('survivor_disorder')
        .delete()
        .eq('id', survivorDisorderId)

      const { data, error } = await owner.client
        .from('disorder')
        .select('id')
        .eq('id', disorderId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data).toBeNull()

      // Re-attach for any subsequent assertions.
      const { data: sd } = await admin
        .from('survivor_disorder')
        .insert({ survivor_id: survivorId, disorder_id: disorderId })
        .select('id')
        .single()
      if (sd) survivorDisorderId = sd.id
    })

    it('transitive SELECT does not grant a path to UPDATE the row', async () => {
      await owner.client
        .from('disorder')
        .update({ rules: 'Owner overwrites collaborator rules' })
        .eq('id', disorderId)

      const { data } = await admin
        .from('disorder')
        .select('rules')
        .eq('id', disorderId)
        .single()
      expect(data?.rules).toBe('Despair gnaws at the edges of memory.')
    })
  })

  describe('all 4 survivor-attached catalogs (smoke per-table)', () => {
    const cases: Array<{
      catalog: string
      junction: string
      fk: string
      nameCol: string
    }> = [
      {
        catalog: 'disorder',
        junction: 'survivor_disorder',
        fk: 'disorder_id',
        nameCol: 'disorder_name'
      },
      {
        catalog: 'fighting_art',
        junction: 'survivor_fighting_art',
        fk: 'fighting_art_id',
        nameCol: 'fighting_art_name'
      },
      {
        catalog: 'secret_fighting_art',
        junction: 'survivor_secret_fighting_art',
        fk: 'secret_fighting_art_id',
        nameCol: 'secret_fighting_art_name'
      },
      {
        catalog: 'ability_impairment',
        junction: 'survivor_ability_impairment',
        fk: 'ability_impairment_id',
        nameCol: 'ability_impairment_name'
      }
    ]

    for (const c of cases) {
      it(`owner reads collaborator-authored attached row in ${c.catalog}`, async () => {
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

        const { error: sjErr } = await admin.from(c.junction).insert({
          survivor_id: survivorId,
          [c.fk]: row.id
        })
        if (sjErr) throw new Error(`seed ${c.junction}: ${sjErr.message}`)

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

        // Collaborator (author) sees the row.
        const { data: collabRead, error: collabErr } = await collaborator.client
          .from(c.catalog)
          .select('id')
          .eq('id', row.id)
          .maybeSingle()
        expect(collabErr).toBeNull()
        expect(collabRead).not.toBeNull()

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
