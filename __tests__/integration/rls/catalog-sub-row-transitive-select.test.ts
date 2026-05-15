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
 * RLS — Catalog Sub-Row Transitive SELECT
 *
 * Locks in the policies installed by
 * `20260524000000_catalog_sub_row_transitive_select.sql`. Each sub-row
 * test follows the same shape:
 *
 *   1. `collaborator` (the shared-user) authors a custom parent catalog
 *      row plus a sub-row hanging off it.
 *   2. `owner` attaches the parent to their settlement via the relevant
 *      junction (`settlement_gear`, `settlement_pattern`,
 *      `settlement_seed_pattern`, `settlement_quarry`,
 *      `settlement_nemesis`) or by placing the armor_set on a survivor's
 *      `gear_grid`.
 *   3. We assert that:
 *        a. The author (collaborator) still sees the sub-row via the
 *           pre-existing `Allow select for owner and custom` policy.
 *        b. The settlement owner (who is NOT the author) sees the sub-row
 *           via the NEW `Allow select via settlement membership` policy.
 *        c. A stranger sees nothing.
 *
 * The final block exercises `survivor_status`'s 4-way UNION through the
 * `hunt_monster_survivor_status` arm, which is the most common reachability
 * path during hunt-phase play.
 *
 * Architecture: `docs/sharing-architecture.md` §5.2 Decision 2, §10
 * Phase 2.2.
 */
describe('RLS: catalog sub-row transitive SELECT', () => {
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
      'Sub-Row Transitive Test Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  /**
   * Insert a custom `gear` authored by the collaborator, plus a
   * `gear_resource_cost` row hanging off it. Returns the cost row's
   * compound key so callers can read it back.
   */
  async function makeGearWithResourceCost(): Promise<{
    gearId: string
    resourceId: string
  }> {
    const suffix = `${Date.now()}-${Math.random()}`
    const { data: gear, error: gErr } = await admin
      .from('gear')
      .insert({
        gear_name: `Gear ${suffix}`,
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (gErr || !gear) throw new Error(`seed gear: ${gErr?.message}`)

    const { data: resource, error: rErr } = await admin
      .from('resource')
      .insert({
        resource_name: `Resource ${suffix}`,
        category: 'BASIC',
        resource_types: [],
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (rErr || !resource) throw new Error(`seed resource: ${rErr?.message}`)

    const { error: cErr } = await admin.from('gear_resource_cost').insert({
      gear_id: gear.id,
      resource_id: resource.id,
      quantity: 1
    })
    if (cErr) throw new Error(`seed gear_resource_cost: ${cErr.message}`)

    return { gearId: gear.id, resourceId: resource.id }
  }

  describe('gear sub-rows (gear_resource_cost via settlement_gear)', () => {
    let gearId: string
    let resourceId: string

    beforeAll(async () => {
      const made = await makeGearWithResourceCost()
      gearId = made.gearId
      resourceId = made.resourceId

      const { error: sjErr } = await admin
        .from('settlement_gear')
        .insert({ settlement_id: settlementId, gear_id: gearId, quantity: 1 })
      if (sjErr) throw new Error(`seed settlement_gear: ${sjErr.message}`)
    })

    it('collaborator (author) reads cost row via owner-and-custom', async () => {
      const { data, error } = await collaborator.client
        .from('gear_resource_cost')
        .select('gear_id, resource_id, quantity')
        .eq('gear_id', gearId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('settlement owner reads cost row via settlement membership', async () => {
      const { data, error } = await owner.client
        .from('gear_resource_cost')
        .select('gear_id, resource_id, quantity')
        .eq('gear_id', gearId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read cost row', async () => {
      const { data } = await stranger.client
        .from('gear_resource_cost')
        .select('gear_id, resource_id')
        .eq('gear_id', gearId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })

  describe('pattern sub-rows (pattern_innovation_requirement via settlement_pattern)', () => {
    let patternId: string
    let innovationId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: pat, error: pErr } = await admin
        .from('pattern')
        .insert({
          pattern_name: `Pattern ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (pErr || !pat) throw new Error(`seed pattern: ${pErr?.message}`)
      patternId = pat.id

      const { data: inv, error: iErr } = await admin
        .from('innovation')
        .insert({
          innovation_name: `Innovation ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (iErr || !inv) throw new Error(`seed innovation: ${iErr?.message}`)
      innovationId = inv.id

      const { error: rErr } = await admin
        .from('pattern_innovation_requirement')
        .insert({ pattern_id: patternId, innovation_id: innovationId })
      if (rErr)
        throw new Error(`seed pattern_innovation_requirement: ${rErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_pattern')
        .insert({ settlement_id: settlementId, pattern_id: patternId })
      if (sjErr) throw new Error(`seed settlement_pattern: ${sjErr.message}`)
    })

    it('settlement owner reads requirement via settlement membership', async () => {
      const { data, error } = await owner.client
        .from('pattern_innovation_requirement')
        .select('pattern_id, innovation_id')
        .eq('pattern_id', patternId)
        .eq('innovation_id', innovationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read requirement', async () => {
      const { data } = await stranger.client
        .from('pattern_innovation_requirement')
        .select('pattern_id')
        .eq('pattern_id', patternId)
        .eq('innovation_id', innovationId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })

  describe('seed_pattern sub-rows (seed_pattern_gear_cost via settlement_seed_pattern)', () => {
    let seedPatternId: string
    let costGearId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: sp, error: spErr } = await admin
        .from('seed_pattern')
        .insert({
          seed_pattern_name: `SeedPattern ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (spErr || !sp) throw new Error(`seed seed_pattern: ${spErr?.message}`)
      seedPatternId = sp.id

      const { data: g, error: gErr } = await admin
        .from('gear')
        .insert({
          gear_name: `Cost Gear ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (gErr || !g) throw new Error(`seed cost gear: ${gErr?.message}`)
      costGearId = g.id

      const { error: cErr } = await admin
        .from('seed_pattern_gear_cost')
        .insert({
          seed_pattern_id: seedPatternId,
          cost_gear_id: costGearId,
          quantity: 1
        })
      if (cErr) throw new Error(`seed seed_pattern_gear_cost: ${cErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_seed_pattern')
        .insert({ settlement_id: settlementId, seed_pattern_id: seedPatternId })
      if (sjErr)
        throw new Error(`seed settlement_seed_pattern: ${sjErr.message}`)
    })

    it('settlement owner reads cost row via settlement membership', async () => {
      const { data, error } = await owner.client
        .from('seed_pattern_gear_cost')
        .select('seed_pattern_id, cost_gear_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read cost row', async () => {
      const { data } = await stranger.client
        .from('seed_pattern_gear_cost')
        .select('seed_pattern_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })

  describe('armor_set_slot_gear via gear_grid', () => {
    let armorSetId: string
    let armorSetSlotId: string
    let slotGearId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: aset, error: aErr } = await admin
        .from('armor_set')
        .insert({
          armor_set_name: `ArmorSet ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (aErr || !aset) throw new Error(`seed armor_set: ${aErr?.message}`)
      armorSetId = aset.id

      const { data: slot, error: sErr } = await admin
        .from('armor_set_slot')
        .insert({
          armor_set_id: armorSetId,
          slot_name: 'helm',
          slot_order: 0,
          required: true
        })
        .select('id')
        .single()
      if (sErr || !slot)
        throw new Error(`seed armor_set_slot: ${sErr?.message}`)
      armorSetSlotId = slot.id

      const { data: g, error: gErr } = await admin
        .from('gear')
        .insert({
          gear_name: `Slot Gear ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (gErr || !g) throw new Error(`seed slot gear: ${gErr?.message}`)
      slotGearId = g.id

      const { error: sgErr } = await admin
        .from('armor_set_slot_gear')
        .insert({ armor_set_slot_id: armorSetSlotId, gear_id: slotGearId })
      if (sgErr) throw new Error(`seed armor_set_slot_gear: ${sgErr.message}`)

      // Place the armor_set on a survivor's gear_grid so it is reachable
      // via the settlement chain.
      const { data: sv, error: svErr } = await admin
        .from('survivor')
        .insert({
          settlement_id: settlementId,
          gender: 'FEMALE',
          survivor_name: `ArmorSet Carrier ${suffix}`
        })
        .select('id')
        .single()
      if (svErr || !sv) throw new Error(`seed survivor: ${svErr?.message}`)

      // The `clear_selected_armor_set_if_unqualified` BEFORE-trigger added
      // in 20260505000000_gear_grid_selected_armor_set.sql silently nulls
      // `selected_armor_set_id` unless every required slot has a matching
      // gear piece somewhere in the 9 grid positions. The armor set above
      // has one required slot ('helm') with a single candidate piece, so
      // we equip that piece in `pos_top_left` to keep the link intact —
      // otherwise the RLS chain (gear_grid → armor_set) would have nothing
      // to traverse and the transitive policy could not be exercised.
      //
      // The `validate_gear_grid_positions` BEFORE-trigger from
      // 20260424000009_gear_grid.sql additionally requires every equipped
      // piece to be present in the settlement's storage, so stage the gear
      // in `settlement_gear` first.
      const { error: sgErr2 } = await admin.from('settlement_gear').insert({
        settlement_id: settlementId,
        gear_id: slotGearId,
        quantity: 1
      })
      if (sgErr2)
        throw new Error(`seed settlement_gear (slot gear): ${sgErr2.message}`)

      const { error: ggErr } = await admin.from('gear_grid').insert({
        survivor_id: sv.id,
        selected_armor_set_id: armorSetId,
        pos_top_left: slotGearId
      })
      if (ggErr) throw new Error(`seed gear_grid: ${ggErr.message}`)
    })

    it('settlement owner reads slot_gear row via gear_grid chain', async () => {
      const { data, error } = await owner.client
        .from('armor_set_slot_gear')
        .select('armor_set_slot_id, gear_id')
        .eq('armor_set_slot_id', armorSetSlotId)
        .eq('gear_id', slotGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read slot_gear row', async () => {
      const { data } = await stranger.client
        .from('armor_set_slot_gear')
        .select('armor_set_slot_id')
        .eq('armor_set_slot_id', armorSetSlotId)
        .eq('gear_id', slotGearId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })

  describe('quarry_level_survivor_status via settlement_quarry', () => {
    let quarryId: string
    let quarryLevelId: string
    let survivorStatusId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: q, error: qErr } = await admin
        .from('quarry')
        .insert({
          monster_name: `Quarry ${suffix}`,
          node: 'NQ1',
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (qErr || !q) throw new Error(`seed quarry: ${qErr?.message}`)
      quarryId = q.id

      const { data: ql, error: qlErr } = await admin
        .from('quarry_level')
        .insert({ quarry_id: quarryId, level_number: 1 })
        .select('id')
        .single()
      if (qlErr || !ql) throw new Error(`seed quarry_level: ${qlErr?.message}`)
      quarryLevelId = ql.id

      const { data: ss, error: ssErr } = await admin
        .from('survivor_status')
        .insert({
          survivor_status_name: `Status ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (ssErr || !ss)
        throw new Error(`seed survivor_status: ${ssErr?.message}`)
      survivorStatusId = ss.id

      const { error: jErr } = await admin
        .from('quarry_level_survivor_status')
        .insert({
          quarry_level_id: quarryLevelId,
          survivor_status_id: survivorStatusId
        })
      if (jErr)
        throw new Error(`seed quarry_level_survivor_status: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_quarry')
        .insert({ settlement_id: settlementId, quarry_id: quarryId })
      if (sjErr) throw new Error(`seed settlement_quarry: ${sjErr.message}`)
    })

    it('settlement owner reads quarry_level_survivor_status', async () => {
      const { data, error } = await owner.client
        .from('quarry_level_survivor_status')
        .select('quarry_level_id, survivor_status_id')
        .eq('quarry_level_id', quarryLevelId)
        .eq('survivor_status_id', survivorStatusId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read quarry_level_survivor_status', async () => {
      const { data } = await stranger.client
        .from('quarry_level_survivor_status')
        .select('quarry_level_id')
        .eq('quarry_level_id', quarryLevelId)
        .eq('survivor_status_id', survivorStatusId)
        .maybeSingle()
      expect(data).toBeNull()
    })

    it('settlement owner reads parent survivor_status via UNION', async () => {
      // The 4-way UNION on `survivor_status` should now expose this row to
      // the settlement owner via the quarry_level_survivor_status arm.
      const { data, error } = await owner.client
        .from('survivor_status')
        .select('id, survivor_status_name')
        .eq('id', survivorStatusId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })
  })

  describe('nemesis_level_survivor_status via settlement_nemesis', () => {
    let nemesisId: string
    let nemesisLevelId: string
    let survivorStatusId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: n, error: nErr } = await admin
        .from('nemesis')
        .insert({
          monster_name: `Nemesis ${suffix}`,
          node: 'NN1',
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (nErr || !n) throw new Error(`seed nemesis: ${nErr?.message}`)
      nemesisId = n.id

      const { data: nl, error: nlErr } = await admin
        .from('nemesis_level')
        .insert({ nemesis_id: nemesisId, level_number: 1 })
        .select('id')
        .single()
      if (nlErr || !nl) throw new Error(`seed nemesis_level: ${nlErr?.message}`)
      nemesisLevelId = nl.id

      const { data: ss, error: ssErr } = await admin
        .from('survivor_status')
        .insert({
          survivor_status_name: `Status ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (ssErr || !ss)
        throw new Error(`seed survivor_status: ${ssErr?.message}`)
      survivorStatusId = ss.id

      const { error: jErr } = await admin
        .from('nemesis_level_survivor_status')
        .insert({
          nemesis_level_id: nemesisLevelId,
          survivor_status_id: survivorStatusId
        })
      if (jErr)
        throw new Error(`seed nemesis_level_survivor_status: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_nemesis')
        .insert({ settlement_id: settlementId, nemesis_id: nemesisId })
      if (sjErr) throw new Error(`seed settlement_nemesis: ${sjErr.message}`)
    })

    it('settlement owner reads nemesis_level_survivor_status', async () => {
      const { data, error } = await owner.client
        .from('nemesis_level_survivor_status')
        .select('nemesis_level_id, survivor_status_id')
        .eq('nemesis_level_id', nemesisLevelId)
        .eq('survivor_status_id', survivorStatusId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read nemesis_level_survivor_status', async () => {
      const { data } = await stranger.client
        .from('nemesis_level_survivor_status')
        .select('nemesis_level_id')
        .eq('nemesis_level_id', nemesisLevelId)
        .eq('survivor_status_id', survivorStatusId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })

  describe('survivor_status via hunt_monster_survivor_status (4-way UNION)', () => {
    let survivorStatusId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: ss, error: ssErr } = await admin
        .from('survivor_status')
        .insert({
          survivor_status_name: `Status ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (ssErr || !ss)
        throw new Error(`seed survivor_status: ${ssErr?.message}`)
      survivorStatusId = ss.id

      // Build a hunt -> hunt_monster on the shared settlement, then
      // attach the survivor_status via hunt_monster_survivor_status.
      const { data: hunt, error: hErr } = await admin
        .from('hunt')
        .insert({ settlement_id: settlementId, monster_level: 1 })
        .select('id')
        .single()
      if (hErr || !hunt) throw new Error(`seed hunt: ${hErr?.message}`)

      const { data: ad, error: adErr } = await admin
        .from('hunt_ai_deck')
        .insert({ hunt_id: hunt.id, settlement_id: settlementId })
        .select('id')
        .single()
      if (adErr || !ad) throw new Error(`seed hunt_ai_deck: ${adErr?.message}`)

      const { data: hm, error: hmErr } = await admin
        .from('hunt_monster')
        .insert({
          ai_deck_id: ad.id,
          hunt_id: hunt.id,
          settlement_id: settlementId
        })
        .select('id')
        .single()
      if (hmErr || !hm) throw new Error(`seed hunt_monster: ${hmErr?.message}`)

      const { error: jErr } = await admin
        .from('hunt_monster_survivor_status')
        .insert({
          hunt_monster_id: hm.id,
          survivor_status_id: survivorStatusId
        })
      if (jErr)
        throw new Error(`seed hunt_monster_survivor_status: ${jErr.message}`)
    })

    it('settlement owner reads survivor_status via hunt junction', async () => {
      const { data, error } = await owner.client
        .from('survivor_status')
        .select('id, survivor_status_name')
        .eq('id', survivorStatusId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('collaborator (author) reads survivor_status via owner-and-custom', async () => {
      const { data, error } = await collaborator.client
        .from('survivor_status')
        .select('id')
        .eq('id', survivorStatusId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read survivor_status', async () => {
      const { data } = await stranger.client
        .from('survivor_status')
        .select('id')
        .eq('id', survivorStatusId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })

  /**
   * EC-7 (author-membership revoke) for `survivor_status`.
   *
   * `20260524000000`'s 4-way UNION policy ends every branch with
   * `is_settlement_member(<branch>.settlement_id, survivor_status.user_id)`
   * — mirroring the `trait`/`mood` policies in
   * `20260523000000_catalog_author_membership_select.sql`. This block
   * confirms that branch terminates SELECT visibility the moment the
   * status author loses their `settlement_shared_user` row, even while
   * the parent `hunt_monster_survivor_status` junction is still live.
   *
   * Uses a dedicated settlement + dedicated author so removing the
   * collaborator from `settlement_shared_user` does not leak into the
   * other describe blocks above (which depend on the shared `settlementId`
   * relationship between `owner` and `collaborator`).
   */
  describe('survivor_status author-membership revoke (EC-7)', () => {
    let ecOwner: TestUser
    let ecAuthor: TestUser
    let ecSettlementId: string
    let ecSurvivorStatusId: string

    beforeAll(async () => {
      ecOwner = await createTestUser()
      ecAuthor = await createTestUser()
      ecSettlementId = await seedSettlement(
        ecOwner.id,
        'EC-7 survivor_status author-membership'
      )
      await shareSettlement(ecSettlementId, ecAuthor.id, ecOwner.id)

      const suffix = `${Date.now()}-${Math.random()}`
      const { data: ss, error: ssErr } = await admin
        .from('survivor_status')
        .insert({
          survivor_status_name: `EC7 Status ${suffix}`,
          custom: true,
          user_id: ecAuthor.id
        })
        .select('id')
        .single()
      if (ssErr || !ss)
        throw new Error(`seed ec survivor_status: ${ssErr?.message}`)
      ecSurvivorStatusId = ss.id

      const { data: hunt, error: hErr } = await admin
        .from('hunt')
        .insert({ settlement_id: ecSettlementId, monster_level: 1 })
        .select('id')
        .single()
      if (hErr || !hunt) throw new Error(`seed ec hunt: ${hErr?.message}`)

      const { data: ad, error: adErr } = await admin
        .from('hunt_ai_deck')
        .insert({ hunt_id: hunt.id, settlement_id: ecSettlementId })
        .select('id')
        .single()
      if (adErr || !ad)
        throw new Error(`seed ec hunt_ai_deck: ${adErr?.message}`)

      const { data: hm, error: hmErr } = await admin
        .from('hunt_monster')
        .insert({
          ai_deck_id: ad.id,
          hunt_id: hunt.id,
          settlement_id: ecSettlementId
        })
        .select('id')
        .single()
      if (hmErr || !hm)
        throw new Error(`seed ec hunt_monster: ${hmErr?.message}`)

      const { error: jErr } = await admin
        .from('hunt_monster_survivor_status')
        .insert({
          hunt_monster_id: hm.id,
          survivor_status_id: ecSurvivorStatusId
        })
      if (jErr)
        throw new Error(`seed ec hunt_monster_survivor_status: ${jErr.message}`)
    })

    afterAll(async () => {
      await deleteTestUser(ecOwner.id)
      await deleteTestUser(ecAuthor.id)
    })

    it('owner reads survivor_status while author is still shared', async () => {
      const { data, error } = await ecOwner.client
        .from('survivor_status')
        .select('id')
        .eq('id', ecSurvivorStatusId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('owner cannot read survivor_status after author is unshared', async () => {
      // Revoke the author's settlement membership. The 4-way UNION policy
      // requires `is_settlement_member(hm.settlement_id,
      // survivor_status.user_id)` on the hunt arm, so all branches must
      // now fail for the owner even though the junction row still exists.
      const { error: unshareErr } = await admin
        .from('settlement_shared_user')
        .delete()
        .eq('settlement_id', ecSettlementId)
        .eq('shared_user_id', ecAuthor.id)
      if (unshareErr) throw new Error(`ec-7 unshare: ${unshareErr.message}`)

      const { data } = await ecOwner.client
        .from('survivor_status')
        .select('id')
        .eq('id', ecSurvivorStatusId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })
})
