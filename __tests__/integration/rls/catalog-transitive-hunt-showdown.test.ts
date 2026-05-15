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
 * RLS — Catalog Transitive SELECT via Hunt / Showdown / Armor ([E2.1.c])
 *
 * Locks in the policies added in
 * `20260516000000_catalog_transitive_hunt_showdown.sql`:
 *   * `trait`         — readable when referenced by a hunt_monster_trait,
 *                       showdown_monster_trait, quarry_level_trait, or
 *                       nemesis_level_trait whose owning settlement the
 *                       caller can see.
 *   * `mood`          — symmetric to `trait` (mood halves of the same
 *                       junctions).
 *   * `armor_set`     — readable when selected on a gear_grid whose
 *                       survivor's settlement the caller can see.
 *   * `armor_set_slot`— readable iff parent armor_set is visible via the
 *                       same chain.
 *   * `quarry_level`  — readable when parent custom quarry is attached to
 *                       a settlement the caller can see.
 *   * `nemesis_level` — symmetric to quarry_level.
 *
 * Architecture: docs/sharing-architecture.md §5.2 Decision 2 / Appendix A.
 */
describe('RLS: catalog transitive SELECT via hunt/showdown/armor', () => {
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
      'Hunt/Showdown Transitive Test Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)

    const { data: sv, error: svErr } = await admin
      .from('survivor')
      .insert({
        settlement_id: settlementId,
        gender: 'FEMALE',
        survivor_name: 'Hunt/Showdown Test Survivor'
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
   * Helper: insert a custom trait owned by the collaborator.
   */
  async function makeTrait(): Promise<string> {
    const { data, error } = await admin
      .from('trait')
      .insert({
        trait_name: `Trait ${Date.now()}-${Math.random()}`,
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (error || !data) throw new Error(`seed trait: ${error?.message}`)
    return data.id
  }

  /**
   * Helper: insert a custom mood owned by the collaborator.
   */
  async function makeMood(): Promise<string> {
    const { data, error } = await admin
      .from('mood')
      .insert({
        mood_name: `Mood ${Date.now()}-${Math.random()}`,
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (error || !data) throw new Error(`seed mood: ${error?.message}`)
    return data.id
  }

  describe('trait via hunt junction', () => {
    let traitId: string
    let huntId: string
    let huntMonsterId: string

    beforeAll(async () => {
      traitId = await makeTrait()

      const { data: hunt, error: huntErr } = await admin
        .from('hunt')
        .insert({ settlement_id: settlementId, monster_level: 1 })
        .select('id')
        .single()
      if (huntErr || !hunt) throw new Error(`seed hunt: ${huntErr?.message}`)
      huntId = hunt.id

      const { data: ad, error: adErr } = await admin
        .from('hunt_ai_deck')
        .insert({ hunt_id: huntId, settlement_id: settlementId })
        .select('id')
        .single()
      if (adErr || !ad) throw new Error(`seed hunt_ai_deck: ${adErr?.message}`)

      const { data: hm, error: hmErr } = await admin
        .from('hunt_monster')
        .insert({
          ai_deck_id: ad.id,
          hunt_id: huntId,
          settlement_id: settlementId
        })
        .select('id')
        .single()
      if (hmErr || !hm) throw new Error(`seed hunt_monster: ${hmErr?.message}`)
      huntMonsterId = hm.id

      await admin
        .from('hunt_monster_trait')
        .insert({ hunt_monster_id: huntMonsterId, trait_id: traitId })
    })

    it('owner can read the custom trait referenced by their hunt monster', async () => {
      const { data, error } = await owner.client
        .from('trait')
        .select('id, trait_name')
        .eq('id', traitId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('collaborator (author) can read the trait', async () => {
      const { data, error } = await collaborator.client
        .from('trait')
        .select('id')
        .eq('id', traitId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read the trait', async () => {
      const { data, error } = await stranger.client
        .from('trait')
        .select('id')
        .eq('id', traitId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('trait via showdown junction', () => {
    let traitId: string
    let showdownSettlementId: string

    beforeAll(async () => {
      // Showdown has a unique constraint on settlement_id, so use a fresh
      // settlement (also shared with the collaborator).
      showdownSettlementId = await seedSettlement(
        owner.id,
        `Showdown Transitive Test ${Date.now()}`
      )
      await shareSettlement(showdownSettlementId, collaborator.id, owner.id)

      traitId = await makeTrait()

      const { data: showdown } = await admin
        .from('showdown')
        .insert({ settlement_id: showdownSettlementId, monster_level: 1 })
        .select('id')
        .single()
      const { data: ad } = await admin
        .from('showdown_ai_deck')
        .insert({
          settlement_id: showdownSettlementId,
          showdown_id: showdown!.id
        })
        .select('id')
        .single()
      const { data: sm } = await admin
        .from('showdown_monster')
        .insert({
          ai_deck_id: ad!.id,
          settlement_id: showdownSettlementId,
          showdown_id: showdown!.id
        })
        .select('id')
        .single()

      await admin
        .from('showdown_monster_trait')
        .insert({ showdown_monster_id: sm!.id, trait_id: traitId })
    })

    it('collaborator reads the trait referenced by the shared showdown', async () => {
      const { data, error } = await collaborator.client
        .from('trait')
        .select('id')
        .eq('id', traitId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read the trait', async () => {
      const { data } = await stranger.client
        .from('trait')
        .select('id')
        .eq('id', traitId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })

  describe('trait via quarry_level junction', () => {
    let traitId: string

    beforeAll(async () => {
      traitId = await makeTrait()

      const { data: q } = await admin
        .from('quarry')
        .insert({
          monster_name: `Quarry ${Date.now()}`,
          custom: true,
          user_id: collaborator.id,
          node: 'NQ1'
        })
        .select('id')
        .single()
      const { data: ql } = await admin
        .from('quarry_level')
        .insert({ quarry_id: q!.id, level_number: 1 })
        .select('id')
        .single()
      await admin
        .from('quarry_level_trait')
        .insert({ quarry_level_id: ql!.id, trait_id: traitId })

      // Attach the quarry to the shared settlement so the chain resolves.
      await admin
        .from('settlement_quarry')
        .insert({ settlement_id: settlementId, quarry_id: q!.id })
    })

    it('owner reads the trait referenced through quarry_level_trait', async () => {
      const { data, error } = await owner.client
        .from('trait')
        .select('id')
        .eq('id', traitId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read the trait', async () => {
      const { data } = await stranger.client
        .from('trait')
        .select('id')
        .eq('id', traitId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })

  describe('trait via nemesis_level junction', () => {
    let traitId: string

    beforeAll(async () => {
      traitId = await makeTrait()

      const { data: n } = await admin
        .from('nemesis')
        .insert({
          monster_name: `Nemesis ${Date.now()}`,
          custom: true,
          user_id: collaborator.id,
          node: 'NN1'
        })
        .select('id')
        .single()
      const { data: nl } = await admin
        .from('nemesis_level')
        .insert({ nemesis_id: n!.id, level_number: 1 })
        .select('id')
        .single()
      await admin
        .from('nemesis_level_trait')
        .insert({ nemesis_level_id: nl!.id, trait_id: traitId })

      await admin
        .from('settlement_nemesis')
        .insert({ settlement_id: settlementId, nemesis_id: n!.id })
    })

    it('owner reads the trait referenced through nemesis_level_trait', async () => {
      const { data, error } = await owner.client
        .from('trait')
        .select('id')
        .eq('id', traitId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read the trait', async () => {
      const { data } = await stranger.client
        .from('trait')
        .select('id')
        .eq('id', traitId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })

  describe('mood via hunt junction (smoke for `mood` parallel policy)', () => {
    let moodId: string

    beforeAll(async () => {
      moodId = await makeMood()

      // Reuse a fresh hunt graph (hunt.settlement_id is unique, so use a
      // second shared settlement).
      const moodSettlementId = await seedSettlement(
        owner.id,
        `Mood Hunt Test ${Date.now()}`
      )
      await shareSettlement(moodSettlementId, collaborator.id, owner.id)

      const { data: hunt } = await admin
        .from('hunt')
        .insert({ settlement_id: moodSettlementId, monster_level: 1 })
        .select('id')
        .single()
      const { data: ad } = await admin
        .from('hunt_ai_deck')
        .insert({ hunt_id: hunt!.id, settlement_id: moodSettlementId })
        .select('id')
        .single()
      const { data: hm } = await admin
        .from('hunt_monster')
        .insert({
          ai_deck_id: ad!.id,
          hunt_id: hunt!.id,
          settlement_id: moodSettlementId
        })
        .select('id')
        .single()
      await admin
        .from('hunt_monster_mood')
        .insert({ hunt_monster_id: hm!.id, mood_id: moodId })
    })

    it('collaborator reads the mood', async () => {
      const { data, error } = await collaborator.client
        .from('mood')
        .select('id')
        .eq('id', moodId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read the mood', async () => {
      const { data } = await stranger.client
        .from('mood')
        .select('id')
        .eq('id', moodId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })

  describe('quarry_level — visibility tied to parent quarry attachment', () => {
    let quarryId: string
    let quarryLevelId: string

    beforeAll(async () => {
      const { data: q } = await admin
        .from('quarry')
        .insert({
          monster_name: `QL Parent ${Date.now()}`,
          custom: true,
          user_id: collaborator.id,
          node: 'NQ1'
        })
        .select('id')
        .single()
      quarryId = q!.id
      const { data: ql } = await admin
        .from('quarry_level')
        .insert({ quarry_id: quarryId, level_number: 1 })
        .select('id')
        .single()
      quarryLevelId = ql!.id
    })

    it('owner cannot read quarry_level before the parent quarry is attached to any settlement', async () => {
      const { data, error } = await owner.client
        .from('quarry_level')
        .select('id')
        .eq('id', quarryLevelId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('owner can read quarry_level after the parent quarry is attached to a shared settlement', async () => {
      await admin
        .from('settlement_quarry')
        .insert({ settlement_id: settlementId, quarry_id: quarryId })

      const { data, error } = await owner.client
        .from('quarry_level')
        .select('id')
        .eq('id', quarryLevelId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })
  })

  describe('nemesis_level — visibility tied to parent nemesis attachment', () => {
    let nemesisId: string
    let nemesisLevelId: string

    beforeAll(async () => {
      const { data: n } = await admin
        .from('nemesis')
        .insert({
          monster_name: `NL Parent ${Date.now()}`,
          custom: true,
          user_id: collaborator.id,
          node: 'NN1'
        })
        .select('id')
        .single()
      nemesisId = n!.id
      const { data: nl } = await admin
        .from('nemesis_level')
        .insert({ nemesis_id: nemesisId, level_number: 1 })
        .select('id')
        .single()
      nemesisLevelId = nl!.id
    })

    it('owner cannot read nemesis_level before the parent nemesis is attached', async () => {
      const { data } = await owner.client
        .from('nemesis_level')
        .select('id')
        .eq('id', nemesisLevelId)
        .maybeSingle()
      expect(data).toBeNull()
    })

    it('owner can read nemesis_level after the parent nemesis is attached', async () => {
      await admin
        .from('settlement_nemesis')
        .insert({ settlement_id: settlementId, nemesis_id: nemesisId })

      const { data, error } = await owner.client
        .from('nemesis_level')
        .select('id')
        .eq('id', nemesisLevelId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })
  })

  describe('armor_set & armor_set_slot via gear_grid', () => {
    let armorSetId: string
    let armorSetSlotId: string
    let gearGridId: string

    beforeAll(async () => {
      // Collaborator authors a custom armor_set with one optional slot.
      const { data: a } = await admin
        .from('armor_set')
        .insert({
          armor_set_name: `Armor ${Date.now()}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      armorSetId = a!.id

      const { data: slot } = await admin
        .from('armor_set_slot')
        .insert({
          armor_set_id: armorSetId,
          slot_name: 'Head',
          slot_order: 0,
          // `required = true` would cause `armor_set_qualifies` to return
          // false and the BEFORE-trigger on gear_grid to clear our
          // selection. Use `required = false` so the chain stays linked.
          required: false
        })
        .select('id')
        .single()
      armorSetSlotId = slot!.id

      // Create gear_grid for the shared survivor and select the armor_set.
      const { data: gg, error: ggErr } = await admin
        .from('gear_grid')
        .insert({
          survivor_id: survivorId,
          selected_armor_set_id: armorSetId
        })
        .select('id, selected_armor_set_id')
        .single()
      if (ggErr || !gg) throw new Error(`seed gear_grid: ${ggErr?.message}`)
      gearGridId = gg.id
      if (gg.selected_armor_set_id !== armorSetId)
        throw new Error(
          'gear_grid.selected_armor_set_id was cleared by the unqualified-armor-set trigger — test setup is incorrect.'
        )
    })

    it("owner can read the armor_set selected on their survivor's gear_grid", async () => {
      const { data, error } = await owner.client
        .from('armor_set')
        .select('id, armor_set_name')
        .eq('id', armorSetId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('owner can read the armor_set_slot for that armor_set', async () => {
      const { data, error } = await owner.client
        .from('armor_set_slot')
        .select('id')
        .eq('id', armorSetSlotId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read the armor_set nor its slot', async () => {
      const { data: a } = await stranger.client
        .from('armor_set')
        .select('id')
        .eq('id', armorSetId)
        .maybeSingle()
      expect(a).toBeNull()

      const { data: s } = await stranger.client
        .from('armor_set_slot')
        .select('id')
        .eq('id', armorSetSlotId)
        .maybeSingle()
      expect(s).toBeNull()
    })

    it('owner loses armor_set visibility after the gear_grid selection is cleared (EC-4)', async () => {
      await admin
        .from('gear_grid')
        .update({ selected_armor_set_id: null })
        .eq('id', gearGridId)

      const { data: a } = await owner.client
        .from('armor_set')
        .select('id')
        .eq('id', armorSetId)
        .maybeSingle()
      expect(a).toBeNull()
    })
  })

  describe('negative cases', () => {
    it('owner cannot SELECT a custom trait that no junction references', async () => {
      const orphanTraitId = await makeTrait()
      const { data, error } = await owner.client
        .from('trait')
        .select('id')
        .eq('id', orphanTraitId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('transitive SELECT does not grant UPDATE on a referenced trait', async () => {
      const tid = await makeTrait()
      // Reuse the hunt-monster junction graph created earlier; instead
      // create a fresh quarry attachment so the trait is visible to the
      // owner.
      const { data: q } = await admin
        .from('quarry')
        .insert({
          monster_name: `Read-only Q ${Date.now()}`,
          custom: true,
          user_id: collaborator.id,
          node: 'NQ1'
        })
        .select('id')
        .single()
      const { data: ql } = await admin
        .from('quarry_level')
        .insert({ quarry_id: q!.id, level_number: 1 })
        .select('id')
        .single()
      await admin
        .from('quarry_level_trait')
        .insert({ quarry_level_id: ql!.id, trait_id: tid })
      await admin
        .from('settlement_quarry')
        .insert({ settlement_id: settlementId, quarry_id: q!.id })

      await owner.client
        .from('trait')
        .update({ trait_name: 'HACKED' })
        .eq('id', tid)

      const { data: check } = await admin
        .from('trait')
        .select('trait_name')
        .eq('id', tid)
        .single()
      expect(check?.trait_name).not.toBe('HACKED')
    })
  })
})
