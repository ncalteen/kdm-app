import {
  admin,
  createTestUser,
  deleteTestUser,
  seedSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Catalog Hard-Delete Guard ([E2.3])
 *
 * Locks in the `enforce_catalog_delete_guard` BEFORE DELETE trigger added
 * in `20260518000000_catalog_delete_guard_trigger.sql`. Rules:
 *
 *  * Authors may hard-delete a custom catalog row only if every settlement
 *    that currently references it belongs to them.
 *  * If any non-self settlement references the row, the delete is rejected
 *    with a friendly error naming up to three blocking settlements.
 *  * The service role (admin / fixture teardown) bypasses the guard so
 *    test fixtures and auth.users cascade-deletes keep working.
 *
 * Architecture references: #122 Epic E2 Phase 2, #153 this issue,
 * Appendix B EC-5 (author hard-deletes a referenced custom row), EC-8
 * (author hard-deletes their own unattached / self-only row).
 */
describe('RLS: catalog delete guard ([E2.3])', () => {
  let author: TestUser
  let otherOwner: TestUser
  let authorSettlementId: string
  let otherSettlementId: string

  beforeAll(async () => {
    author = await createTestUser()
    otherOwner = await createTestUser()

    authorSettlementId = await seedSettlement(
      author.id,
      'Delete Guard — Author Settlement'
    )
    otherSettlementId = await seedSettlement(
      otherOwner.id,
      'Delete Guard — Other Settlement'
    )
  })

  afterAll(async () => {
    await deleteTestUser(author.id)
    await deleteTestUser(otherOwner.id)
  })

  // ---------------------------------------------------------------------------
  // EC-8 — author can hard-delete an unattached / self-only custom row.
  // ---------------------------------------------------------------------------
  describe('EC-8: author can delete unattached or self-only rows', () => {
    it('author deletes a brand-new unattached custom knowledge', async () => {
      const { data: k, error: kErr } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Hollow Word ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: author.id
        })
        .select('id')
        .single()
      if (kErr || !k) throw new Error(`seed knowledge: ${kErr?.message}`)

      const { error: delErr } = await author.client
        .from('knowledge')
        .delete()
        .eq('id', k.id)
      expect(delErr).toBeNull()

      const { data: gone } = await admin
        .from('knowledge')
        .select('id')
        .eq('id', k.id)
        .maybeSingle()
      expect(gone).toBeNull()
    })

    it('author deletes a custom knowledge attached only to their own settlement', async () => {
      const { data: k, error: kErr } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Self-Only Knowledge ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: author.id
        })
        .select('id')
        .single()
      if (kErr || !k) throw new Error(`seed knowledge: ${kErr?.message}`)

      const { error: attachErr } = await admin
        .from('settlement_knowledge')
        .insert({
          settlement_id: authorSettlementId,
          knowledge_id: k.id
        })
      if (attachErr) throw new Error(`attach knowledge: ${attachErr.message}`)

      const { error: delErr } = await author.client
        .from('knowledge')
        .delete()
        .eq('id', k.id)
      expect(delErr).toBeNull()

      const { data: gone } = await admin
        .from('knowledge')
        .select('id')
        .eq('id', k.id)
        .maybeSingle()
      expect(gone).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // EC-5 — author cannot hard-delete when a non-self settlement references
  // the row. Same shape repeated across reference paths so the dispatch
  // catches each branch.
  // ---------------------------------------------------------------------------
  describe('EC-5: delete blocked when a non-self settlement references the row', () => {
    it('settlement_<x> direct junction blocks (knowledge via settlement_knowledge)', async () => {
      const { data: k, error: kErr } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Knowledge Blocked ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: author.id
        })
        .select('id')
        .single()
      if (kErr || !k) throw new Error(`seed knowledge: ${kErr?.message}`)

      const { error: attachErr } = await admin
        .from('settlement_knowledge')
        .insert({
          settlement_id: otherSettlementId,
          knowledge_id: k.id
        })
      if (attachErr)
        throw new Error(`seed settlement_knowledge: ${attachErr.message}`)

      const { error } = await author.client
        .from('knowledge')
        .delete()
        .eq('id', k.id)
      expect(error).not.toBeNull()
      expect(error?.code).toBe('0A000')
      expect(error?.message).toMatch(/unmake what others rely upon/i)
      expect(error?.message).toContain('Delete Guard — Other Settlement')

      // Row must still exist (verified via admin to bypass RLS).
      const { data: still } = await admin
        .from('knowledge')
        .select('id')
        .eq('id', k.id)
        .maybeSingle()
      expect(still).not.toBeNull()
    })

    it('survivor_<x> junction blocks (disorder via survivor_disorder on a non-self settlement)', async () => {
      const { data: sv, error: svErr } = await admin
        .from('survivor')
        .insert({
          settlement_id: otherSettlementId,
          gender: 'FEMALE',
          survivor_name: 'Other-Settlement Survivor'
        })
        .select('id')
        .single()
      if (svErr || !sv) throw new Error(`seed survivor: ${svErr?.message}`)

      const { data: d, error: dErr } = await admin
        .from('disorder')
        .insert({
          disorder_name: `Disorder Blocked ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: author.id
        })
        .select('id')
        .single()
      if (dErr || !d) throw new Error(`seed disorder: ${dErr?.message}`)

      const { error: jErr } = await admin
        .from('survivor_disorder')
        .insert({ survivor_id: sv.id, disorder_id: d.id })
      if (jErr) throw new Error(`seed survivor_disorder: ${jErr.message}`)

      const { error } = await author.client
        .from('disorder')
        .delete()
        .eq('id', d.id)
      expect(error).not.toBeNull()
      expect(error?.code).toBe('0A000')
      expect(error?.message).toMatch(/unmake what others rely upon/i)
      expect(error?.message).toContain('Delete Guard — Other Settlement')
    })

    it('survivor direct column blocks (philosophy via survivor.philosophy_id)', async () => {
      const { data: p, error: pErr } = await admin
        .from('philosophy')
        .insert({
          philosophy_name: `Philosophy Blocked ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: author.id
        })
        .select('id')
        .single()
      if (pErr || !p) throw new Error(`seed philosophy: ${pErr?.message}`)

      const { error: svErr } = await admin.from('survivor').insert({
        settlement_id: otherSettlementId,
        gender: 'FEMALE',
        survivor_name: 'Philosophy-Carrying Survivor',
        philosophy_id: p.id
      })
      if (svErr) throw new Error(`seed survivor: ${svErr.message}`)

      const { error } = await author.client
        .from('philosophy')
        .delete()
        .eq('id', p.id)
      expect(error).not.toBeNull()
      expect(error?.code).toBe('0A000')
      expect(error?.message).toMatch(/unmake what others rely upon/i)
    })

    it("hunt_monster_trait junction blocks (trait via another owner's hunt)", async () => {
      const { data: t, error: tErr } = await admin
        .from('trait')
        .insert({
          trait_name: `Trait Blocked ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: author.id
        })
        .select('id')
        .single()
      if (tErr || !t) throw new Error(`seed trait: ${tErr?.message}`)

      const { data: hunt, error: huntErr } = await admin
        .from('hunt')
        .insert({ settlement_id: otherSettlementId, monster_level: 1 })
        .select('id')
        .single()
      if (huntErr || !hunt) throw new Error(`seed hunt: ${huntErr?.message}`)

      const { data: ad, error: adErr } = await admin
        .from('hunt_ai_deck')
        .insert({ hunt_id: hunt.id, settlement_id: otherSettlementId })
        .select('id')
        .single()
      if (adErr || !ad) throw new Error(`seed hunt_ai_deck: ${adErr?.message}`)

      const { data: hm, error: hmErr } = await admin
        .from('hunt_monster')
        .insert({
          ai_deck_id: ad.id,
          hunt_id: hunt.id,
          settlement_id: otherSettlementId
        })
        .select('id')
        .single()
      if (hmErr || !hm) throw new Error(`seed hunt_monster: ${hmErr?.message}`)

      const { error: hmtErr } = await admin
        .from('hunt_monster_trait')
        .insert({ hunt_monster_id: hm.id, trait_id: t.id })
      if (hmtErr) throw new Error(`seed hunt_monster_trait: ${hmtErr.message}`)

      const { error } = await author.client
        .from('trait')
        .delete()
        .eq('id', t.id)
      expect(error).not.toBeNull()
      expect(error?.code).toBe('0A000')
      expect(error?.message).toMatch(/unmake what others rely upon/i)
      expect(error?.message).toContain('Delete Guard — Other Settlement')
    })

    it('gear_grid selected_armor_set_id blocks (armor_set via gear_grid -> survivor)', async () => {
      const { data: sv, error: svErr } = await admin
        .from('survivor')
        .insert({
          settlement_id: otherSettlementId,
          gender: 'FEMALE',
          survivor_name: 'Armor-Wearing Survivor'
        })
        .select('id')
        .single()
      if (svErr || !sv) throw new Error(`seed survivor: ${svErr?.message}`)

      const { data: as_, error: asErr } = await admin
        .from('armor_set')
        .insert({
          armor_set_name: `Armor Blocked ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: author.id
        })
        .select('id')
        .single()
      if (asErr || !as_) throw new Error(`seed armor_set: ${asErr?.message}`)

      const { error: ggErr } = await admin.from('gear_grid').insert({
        survivor_id: sv.id,
        selected_armor_set_id: as_.id
      })
      if (ggErr) throw new Error(`seed gear_grid: ${ggErr.message}`)

      const { error } = await author.client
        .from('armor_set')
        .delete()
        .eq('id', as_.id)
      expect(error).not.toBeNull()
      expect(error?.code).toBe('0A000')
      expect(error?.message).toMatch(/unmake what others rely upon/i)
    })

    it('counts and names up to 3 blocking settlements (sorted)', async () => {
      // Three additional settlements for otherOwner, plus the existing
      // one (= 4 total). The friendly message must list 3 of them and
      // report the total count = 4.
      const s2 = await seedSettlement(otherOwner.id, 'Delete Guard — Beta')
      const s3 = await seedSettlement(otherOwner.id, 'Delete Guard — Gamma')
      const s4 = await seedSettlement(otherOwner.id, 'Delete Guard — Delta')

      const { data: k, error: kErr } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Multi Block ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: author.id
        })
        .select('id')
        .single()
      if (kErr || !k) throw new Error(`seed knowledge: ${kErr?.message}`)

      for (const sid of [otherSettlementId, s2, s3, s4]) {
        const { error: skErr } = await admin
          .from('settlement_knowledge')
          .insert({ settlement_id: sid, knowledge_id: k.id })
        if (skErr)
          throw new Error(`seed settlement_knowledge: ${skErr.message}`)
      }

      const { error } = await author.client
        .from('knowledge')
        .delete()
        .eq('id', k.id)
      expect(error).not.toBeNull()
      expect(error?.code).toBe('0A000')
      // Count of 4 blocking settlements.
      expect(error?.message).toMatch(/4 settlement\(s\)/)
      // Listed names are alphabetically sorted, first 3 only.
      expect(error?.message).toContain('Delete Guard — Beta')
      expect(error?.message).toContain('Delete Guard — Delta')
      expect(error?.message).toContain('Delete Guard — Gamma')
      // The "Other Settlement" sorts AFTER "Delta" / "Gamma" alphabetically
      // and so should NOT appear in the trimmed 3-name list.
      expect(error?.message).not.toContain('Delete Guard — Other Settlement')
    })
  })

  // ---------------------------------------------------------------------------
  // Non-custom (catalog seed) rows: the guard does not apply. The RLS
  // policy on each catalog already blocks the delete (it doesn't match the
  // `custom = true` owner policy), but if RLS were ever to permit it the
  // trigger must not also block, since the guard's job is only to protect
  // shared custom content.
  // ---------------------------------------------------------------------------
  describe('non-custom rows: guard does not apply', () => {
    it('admin can delete a non-custom row regardless of attachments (service-role bypass)', async () => {
      // The trigger short-circuits for service_role; we just confirm that
      // a non-custom-row delete via admin succeeds even when attached.
      const { data: k, error: kErr } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Seed-like ${Date.now()}-${Math.random()}`,
          custom: false
        })
        .select('id')
        .single()
      if (kErr || !k) throw new Error(`seed knowledge: ${kErr?.message}`)

      const { error: skErr } = await admin
        .from('settlement_knowledge')
        .insert({ settlement_id: otherSettlementId, knowledge_id: k.id })
      if (skErr) throw new Error(`seed settlement_knowledge: ${skErr.message}`)

      const { error } = await admin.from('knowledge').delete().eq('id', k.id)
      expect(error).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // Service-role / fixture-teardown bypass: admin can delete a custom row
  // even when other owners' settlements reference it.
  // ---------------------------------------------------------------------------
  describe('service-role bypass', () => {
    it('admin can delete a custom row referenced by a non-self settlement', async () => {
      const { data: k, error: kErr } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Admin Force Delete ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: author.id
        })
        .select('id')
        .single()
      if (kErr || !k) throw new Error(`seed knowledge: ${kErr?.message}`)

      const { error: skErr } = await admin
        .from('settlement_knowledge')
        .insert({ settlement_id: otherSettlementId, knowledge_id: k.id })
      if (skErr) throw new Error(`seed settlement_knowledge: ${skErr.message}`)

      const { error } = await admin.from('knowledge').delete().eq('id', k.id)
      expect(error).toBeNull()

      const { data: gone } = await admin
        .from('knowledge')
        .select('id')
        .eq('id', k.id)
        .maybeSingle()
      expect(gone).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // Catalogs without settlement-attached junctions: trigger is still
  // attached for symmetry but the dispatch's `else` branch leaves
  // `blocking_count = 0` so authors can always delete their own custom rows.
  // ---------------------------------------------------------------------------
  describe('catalogs without settlement-attached references', () => {
    it.each([
      { table: 'character', nameCol: 'character_name' },
      { table: 'constellation', nameCol: 'constellation_name' },
      { table: 'strain_milestone', nameCol: 'strain_milestone_name' },
      {
        table: 'wanderer',
        nameCol: 'wanderer_name',
        extras: { gender: 'FEMALE' }
      }
    ] as Array<{
      table: string
      nameCol: string
      extras?: Record<string, unknown>
    }>)(
      '[$table] author can delete a custom row (no junction to block)',
      async (spec) => {
        const { data: row, error: rowErr } = await admin
          .from(spec.table)
          .insert({
            [spec.nameCol]: `${spec.table} ${Date.now()}-${Math.random()}`,
            custom: true,
            user_id: author.id,
            ...spec.extras
          })
          .select('id')
          .single()
        if (rowErr || !row)
          throw new Error(`seed ${spec.table}: ${rowErr?.message}`)

        const { error: delErr } = await author.client
          .from(spec.table)
          .delete()
          .eq('id', row.id)
        expect(delErr).toBeNull()

        const { data: gone } = await admin
          .from(spec.table)
          .select('id')
          .eq('id', row.id)
          .maybeSingle()
        expect(gone).toBeNull()
      }
    )
  })
})
