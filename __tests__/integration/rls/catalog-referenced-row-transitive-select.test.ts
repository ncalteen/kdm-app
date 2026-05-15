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
 * RLS — Catalog Referenced-Row Transitive SELECT
 *
 * Locks in the policies installed by
 * `20260526000000_catalog_referenced_row_transitive_select.sql`. Each
 * scenario follows the same shape:
 *
 *   1. `collaborator` (the shared-user) authors a custom parent recipe /
 *      monster (`gear` / `pattern` / `seed_pattern` / `quarry` /
 *      `nemesis` / `armor_set`) AND a custom referenced catalog row
 *      (`gear` / `resource` / `innovation` / `location` /
 *      `collective_cognition_reward`). A cost / requirement /
 *      quarry-link / armor-set-slot junction row links the two.
 *   2. `owner` attaches the parent to their settlement via the matching
 *      `settlement_*` link table.
 *   3. We assert that:
 *        a. The author (collaborator) still sees the referenced row via
 *           the pre-existing `Allow select for owner and custom` policy.
 *        b. The settlement owner (who is NOT the author) now sees the
 *           referenced row via the NEW `Allow select via referenced …`
 *           policy — this was the gap PR #230 review feedback identified.
 *        c. A stranger sees nothing.
 *
 * Three additional security boundaries are exercised:
 *
 *   - `stranger-authored referenced row is hidden even when a settlement
 *     collaborator cites it from their custom recipe`: the
 *     `is_settlement_member(sj.settlement_id, <ref>.user_id)` clause must
 *     deny access when the referenced row's author is not a member.
 *     Replicated per helper family (resource / innovation / location /
 *     collective_cognition_reward) so a missing predicate in any one
 *     SECURITY DEFINER helper cannot silently pass.
 *   - `owner loses access after the referenced row's author is unshared`:
 *     EC-7 variant flipping the referenced row's author membership off.
 *   - `owner loses access after the PARENT recipe's author is unshared`:
 *     PR #230 reviewer-flagged variant — the parent recipe is no longer
 *     settlement-visible, so the transitive helper must also collapse
 *     even when the referenced row's author is still a settlement
 *     member. Replicated per helper family for the same reason as the
 *     stranger-author boundary above.
 *   - `gear referenced as an armor_set slot candidate via
 *     armor_set_slot_gear`: the gear helper must also walk the
 *     `armor_set_slot_gear -> armor_set_slot -> armor_set ->
 *     gear_grid.selected_armor_set_id -> survivor.settlement_id` path
 *     because `gearMap` in `lib/dal/armor-set.ts` resolves slot
 *     candidates as referenced gear.
 *
 * Architecture: `docs/settlement-sharing-architecture.md` §10 Phase 2 (2.2),
 * Appendix B EC-6 / EC-7.
 */
describe('RLS: catalog referenced-row transitive SELECT', () => {
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
      'Referenced-Row Transitive Test Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  // ---------------------------------------------------------------------------
  // gear referenced as cost via gear_gear_cost
  // ---------------------------------------------------------------------------
  describe('gear via gear_gear_cost', () => {
    let parentGearId: string
    let costGearId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: parent, error: pErr } = await admin
        .from('gear')
        .insert({
          gear_name: `Parent Gear ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (pErr || !parent) throw new Error(`seed parent gear: ${pErr?.message}`)
      parentGearId = parent.id

      const { data: cost, error: cErr } = await admin
        .from('gear')
        .insert({
          gear_name: `Cost Gear ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (cErr || !cost) throw new Error(`seed cost gear: ${cErr?.message}`)
      costGearId = cost.id

      const { error: jErr } = await admin.from('gear_gear_cost').insert({
        gear_id: parentGearId,
        cost_gear_id: costGearId,
        quantity: 1
      })
      if (jErr) throw new Error(`seed gear_gear_cost: ${jErr.message}`)

      const { error: sjErr } = await admin.from('settlement_gear').insert({
        settlement_id: settlementId,
        gear_id: parentGearId,
        quantity: 1
      })
      if (sjErr) throw new Error(`seed settlement_gear: ${sjErr.message}`)
    })

    it('collaborator (author) reads cost gear via owner-and-custom', async () => {
      const { data, error } = await collaborator.client
        .from('gear')
        .select('id')
        .eq('id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('settlement owner reads referenced cost gear via referenced-cost policy', async () => {
      const { data, error } = await owner.client
        .from('gear')
        .select('id, gear_name')
        .eq('id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read referenced cost gear', async () => {
      const { data, error } = await stranger.client
        .from('gear')
        .select('id')
        .eq('id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // gear referenced as cost via pattern_gear_cost
  // ---------------------------------------------------------------------------
  describe('gear via pattern_gear_cost', () => {
    let patternId: string
    let costGearId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: pat, error: pErr } = await admin
        .from('pattern')
        .insert({
          pattern_name: `Parent Pattern ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (pErr || !pat) throw new Error(`seed parent pattern: ${pErr?.message}`)
      patternId = pat.id

      const { data: cost, error: cErr } = await admin
        .from('gear')
        .insert({
          gear_name: `Pattern Cost Gear ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (cErr || !cost) throw new Error(`seed cost gear: ${cErr?.message}`)
      costGearId = cost.id

      const { error: jErr } = await admin.from('pattern_gear_cost').insert({
        pattern_id: patternId,
        cost_gear_id: costGearId,
        quantity: 1
      })
      if (jErr) throw new Error(`seed pattern_gear_cost: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_pattern')
        .insert({ settlement_id: settlementId, pattern_id: patternId })
      if (sjErr) throw new Error(`seed settlement_pattern: ${sjErr.message}`)
    })

    it('settlement owner reads referenced cost gear via pattern path', async () => {
      const { data, error } = await owner.client
        .from('gear')
        .select('id, gear_name')
        .eq('id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read referenced cost gear', async () => {
      const { data, error } = await stranger.client
        .from('gear')
        .select('id')
        .eq('id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // gear referenced as cost via seed_pattern_gear_cost
  // ---------------------------------------------------------------------------
  describe('gear via seed_pattern_gear_cost', () => {
    let seedPatternId: string
    let costGearId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: sp, error: spErr } = await admin
        .from('seed_pattern')
        .insert({
          seed_pattern_name: `Parent SeedPattern ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (spErr || !sp)
        throw new Error(`seed parent seed_pattern: ${spErr?.message}`)
      seedPatternId = sp.id

      const { data: cost, error: cErr } = await admin
        .from('gear')
        .insert({
          gear_name: `SeedPattern Cost Gear ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (cErr || !cost) throw new Error(`seed cost gear: ${cErr?.message}`)
      costGearId = cost.id

      const { error: jErr } = await admin
        .from('seed_pattern_gear_cost')
        .insert({
          seed_pattern_id: seedPatternId,
          cost_gear_id: costGearId,
          quantity: 1
        })
      if (jErr) throw new Error(`seed seed_pattern_gear_cost: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_seed_pattern')
        .insert({ settlement_id: settlementId, seed_pattern_id: seedPatternId })
      if (sjErr)
        throw new Error(`seed settlement_seed_pattern: ${sjErr.message}`)
    })

    it('settlement owner reads referenced cost gear via seed_pattern path', async () => {
      const { data, error } = await owner.client
        .from('gear')
        .select('id, gear_name')
        .eq('id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read referenced cost gear', async () => {
      const { data, error } = await stranger.client
        .from('gear')
        .select('id')
        .eq('id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // resource referenced as cost via gear_resource_cost
  // ---------------------------------------------------------------------------
  describe('resource via gear_resource_cost', () => {
    let parentGearId: string
    let resourceId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: parent, error: pErr } = await admin
        .from('gear')
        .insert({
          gear_name: `Resource-Parent Gear ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (pErr || !parent) throw new Error(`seed parent gear: ${pErr?.message}`)
      parentGearId = parent.id

      const { data: res, error: rErr } = await admin
        .from('resource')
        .insert({
          resource_name: `Referenced Resource ${suffix}`,
          category: 'BASIC',
          resource_types: [],
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (rErr || !res) throw new Error(`seed resource: ${rErr?.message}`)
      resourceId = res.id

      const { error: jErr } = await admin.from('gear_resource_cost').insert({
        gear_id: parentGearId,
        resource_id: resourceId,
        quantity: 1
      })
      if (jErr) throw new Error(`seed gear_resource_cost: ${jErr.message}`)

      const { error: sjErr } = await admin.from('settlement_gear').insert({
        settlement_id: settlementId,
        gear_id: parentGearId,
        quantity: 1
      })
      if (sjErr) throw new Error(`seed settlement_gear: ${sjErr.message}`)
    })

    it('settlement owner reads referenced resource via referenced-cost policy', async () => {
      const { data, error } = await owner.client
        .from('resource')
        .select('id, resource_name')
        .eq('id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read referenced resource', async () => {
      const { data, error } = await stranger.client
        .from('resource')
        .select('id')
        .eq('id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // resource referenced as cost via pattern_resource_cost
  // ---------------------------------------------------------------------------
  describe('resource via pattern_resource_cost', () => {
    let patternId: string
    let resourceId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: pat, error: pErr } = await admin
        .from('pattern')
        .insert({
          pattern_name: `Resource-Parent Pattern ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (pErr || !pat) throw new Error(`seed parent pattern: ${pErr?.message}`)
      patternId = pat.id

      const { data: res, error: rErr } = await admin
        .from('resource')
        .insert({
          resource_name: `Pattern Referenced Resource ${suffix}`,
          category: 'BASIC',
          resource_types: [],
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (rErr || !res) throw new Error(`seed resource: ${rErr?.message}`)
      resourceId = res.id

      const { error: jErr } = await admin.from('pattern_resource_cost').insert({
        pattern_id: patternId,
        resource_id: resourceId,
        quantity: 1
      })
      if (jErr) throw new Error(`seed pattern_resource_cost: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_pattern')
        .insert({ settlement_id: settlementId, pattern_id: patternId })
      if (sjErr) throw new Error(`seed settlement_pattern: ${sjErr.message}`)
    })

    it('settlement owner reads referenced resource via pattern path', async () => {
      const { data, error } = await owner.client
        .from('resource')
        .select('id, resource_name')
        .eq('id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read referenced resource', async () => {
      const { data, error } = await stranger.client
        .from('resource')
        .select('id')
        .eq('id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // resource referenced as cost via seed_pattern_resource_cost
  // ---------------------------------------------------------------------------
  describe('resource via seed_pattern_resource_cost', () => {
    let seedPatternId: string
    let resourceId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: sp, error: spErr } = await admin
        .from('seed_pattern')
        .insert({
          seed_pattern_name: `Resource-Parent SeedPattern ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (spErr || !sp)
        throw new Error(`seed parent seed_pattern: ${spErr?.message}`)
      seedPatternId = sp.id

      const { data: res, error: rErr } = await admin
        .from('resource')
        .insert({
          resource_name: `SeedPattern Referenced Resource ${suffix}`,
          category: 'BASIC',
          resource_types: [],
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (rErr || !res) throw new Error(`seed resource: ${rErr?.message}`)
      resourceId = res.id

      const { error: jErr } = await admin
        .from('seed_pattern_resource_cost')
        .insert({
          seed_pattern_id: seedPatternId,
          resource_id: resourceId,
          quantity: 1
        })
      if (jErr)
        throw new Error(`seed seed_pattern_resource_cost: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_seed_pattern')
        .insert({ settlement_id: settlementId, seed_pattern_id: seedPatternId })
      if (sjErr)
        throw new Error(`seed settlement_seed_pattern: ${sjErr.message}`)
    })

    it('settlement owner reads referenced resource via seed_pattern path', async () => {
      const { data, error } = await owner.client
        .from('resource')
        .select('id, resource_name')
        .eq('id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read referenced resource', async () => {
      const { data, error } = await stranger.client
        .from('resource')
        .select('id')
        .eq('id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // innovation referenced as requirement via pattern_innovation_requirement
  // ---------------------------------------------------------------------------
  describe('innovation via pattern_innovation_requirement', () => {
    let patternId: string
    let innovationId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: pat, error: pErr } = await admin
        .from('pattern')
        .insert({
          pattern_name: `Innovation-Req Pattern ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (pErr || !pat) throw new Error(`seed parent pattern: ${pErr?.message}`)
      patternId = pat.id

      const { data: inv, error: iErr } = await admin
        .from('innovation')
        .insert({
          innovation_name: `Referenced Innovation ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (iErr || !inv) throw new Error(`seed innovation: ${iErr?.message}`)
      innovationId = inv.id

      const { error: jErr } = await admin
        .from('pattern_innovation_requirement')
        .insert({ pattern_id: patternId, innovation_id: innovationId })
      if (jErr)
        throw new Error(`seed pattern_innovation_requirement: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_pattern')
        .insert({ settlement_id: settlementId, pattern_id: patternId })
      if (sjErr) throw new Error(`seed settlement_pattern: ${sjErr.message}`)
    })

    it('settlement owner reads referenced innovation via referenced-cost policy', async () => {
      const { data, error } = await owner.client
        .from('innovation')
        .select('id, innovation_name')
        .eq('id', innovationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read referenced innovation', async () => {
      const { data, error } = await stranger.client
        .from('innovation')
        .select('id')
        .eq('id', innovationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // innovation referenced as requirement via seed_pattern_innovation_requirement
  // ---------------------------------------------------------------------------
  describe('innovation via seed_pattern_innovation_requirement', () => {
    let seedPatternId: string
    let innovationId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: sp, error: spErr } = await admin
        .from('seed_pattern')
        .insert({
          seed_pattern_name: `Innovation-Req SeedPattern ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (spErr || !sp)
        throw new Error(`seed parent seed_pattern: ${spErr?.message}`)
      seedPatternId = sp.id

      const { data: inv, error: iErr } = await admin
        .from('innovation')
        .insert({
          innovation_name: `SeedPattern Referenced Innovation ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (iErr || !inv) throw new Error(`seed innovation: ${iErr?.message}`)
      innovationId = inv.id

      const { error: jErr } = await admin
        .from('seed_pattern_innovation_requirement')
        .insert({
          seed_pattern_id: seedPatternId,
          innovation_id: innovationId
        })
      if (jErr)
        throw new Error(
          `seed seed_pattern_innovation_requirement: ${jErr.message}`
        )

      const { error: sjErr } = await admin
        .from('settlement_seed_pattern')
        .insert({ settlement_id: settlementId, seed_pattern_id: seedPatternId })
      if (sjErr)
        throw new Error(`seed settlement_seed_pattern: ${sjErr.message}`)
    })

    it('settlement owner reads referenced innovation via seed_pattern path', async () => {
      const { data, error } = await owner.client
        .from('innovation')
        .select('id, innovation_name')
        .eq('id', innovationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read referenced innovation', async () => {
      const { data, error } = await stranger.client
        .from('innovation')
        .select('id')
        .eq('id', innovationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // Security boundary: stranger-authored referenced row is NOT exposed even
  // when a settlement collaborator cites it in their custom recipe.
  //
  // The cost junction INSERT policy allows the recipe owner to reference any
  // gear row regardless of authorship. Without the
  // `is_settlement_member(sj.settlement_id, gear.user_id)` clause, the
  // settlement owner would see the stranger's custom gear. With it, the new
  // policy correctly denies access.
  // ---------------------------------------------------------------------------
  describe('security: stranger-authored referenced row stays hidden', () => {
    let parentGearId: string
    let strangerCostGearId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`

      // Collaborator authors a custom parent recipe.
      const { data: parent, error: pErr } = await admin
        .from('gear')
        .insert({
          gear_name: `Security Parent Gear ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (pErr || !parent) throw new Error(`seed parent gear: ${pErr?.message}`)
      parentGearId = parent.id

      // Stranger authors a custom gear that nobody attached to the settlement.
      const { data: cost, error: cErr } = await admin
        .from('gear')
        .insert({
          gear_name: `Stranger Cost Gear ${suffix}`,
          custom: true,
          user_id: stranger.id
        })
        .select('id')
        .single()
      if (cErr || !cost)
        throw new Error(`seed stranger cost gear: ${cErr?.message}`)
      strangerCostGearId = cost.id

      // Collaborator's recipe references stranger's gear — INSERT policy on
      // gear_gear_cost only checks the parent gear's ownership, so this is
      // permitted.
      const { error: jErr } = await admin.from('gear_gear_cost').insert({
        gear_id: parentGearId,
        cost_gear_id: strangerCostGearId,
        quantity: 1
      })
      if (jErr) throw new Error(`seed gear_gear_cost: ${jErr.message}`)

      // Owner attaches the parent to their settlement.
      const { error: sjErr } = await admin.from('settlement_gear').insert({
        settlement_id: settlementId,
        gear_id: parentGearId,
        quantity: 1
      })
      if (sjErr) throw new Error(`seed settlement_gear: ${sjErr.message}`)
    })

    it('owner cannot read stranger-authored referenced gear', async () => {
      const { data, error } = await owner.client
        .from('gear')
        .select('id')
        .eq('id', strangerCostGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('collaborator (recipe author) cannot read stranger-authored referenced gear', async () => {
      // Collaborator is not the author of the cost gear, and the cost gear is
      // not attached to a settlement they collaborate on. They can only see
      // the junction row (via the existing cost-row policy), not the
      // referenced gear itself.
      const { data, error } = await collaborator.client
        .from('gear')
        .select('id')
        .eq('id', strangerCostGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // EC-7 for referenced rows: after the author (collaborator) is removed
  // from the settlement, the owner loses SELECT on the referenced
  // catalog row via the new transitive path.
  // ---------------------------------------------------------------------------
  describe('EC-7: owner loses referenced-row access after author is unshared', () => {
    let ecOwner: TestUser
    let ecAuthor: TestUser
    let ecSettlementId: string
    let ecCostGearId: string

    beforeAll(async () => {
      ecOwner = await createTestUser()
      ecAuthor = await createTestUser()
      ecSettlementId = await seedSettlement(ecOwner.id, 'EC-7 Referenced Row')
      await shareSettlement(ecSettlementId, ecAuthor.id, ecOwner.id)

      const suffix = `${Date.now()}-${Math.random()}`
      const { data: parent, error: pErr } = await admin
        .from('gear')
        .insert({
          gear_name: `EC-7 Parent ${suffix}`,
          custom: true,
          user_id: ecAuthor.id
        })
        .select('id')
        .single()
      if (pErr || !parent) throw new Error(`ec parent gear: ${pErr?.message}`)

      const { data: cost, error: cErr } = await admin
        .from('gear')
        .insert({
          gear_name: `EC-7 Cost ${suffix}`,
          custom: true,
          user_id: ecAuthor.id
        })
        .select('id')
        .single()
      if (cErr || !cost) throw new Error(`ec cost gear: ${cErr?.message}`)
      ecCostGearId = cost.id

      const { error: jErr } = await admin.from('gear_gear_cost').insert({
        gear_id: parent.id,
        cost_gear_id: ecCostGearId,
        quantity: 1
      })
      if (jErr) throw new Error(`ec gear_gear_cost: ${jErr.message}`)

      const { error: sjErr } = await admin.from('settlement_gear').insert({
        settlement_id: ecSettlementId,
        gear_id: parent.id,
        quantity: 1
      })
      if (sjErr) throw new Error(`ec settlement_gear: ${sjErr.message}`)
    })

    afterAll(async () => {
      await deleteTestUser(ecOwner.id)
      await deleteTestUser(ecAuthor.id)
    })

    it('owner reads referenced cost gear while author is still shared', async () => {
      const { data, error } = await ecOwner.client
        .from('gear')
        .select('id')
        .eq('id', ecCostGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('owner cannot read referenced cost gear after author is unshared', async () => {
      // Revoking the author's membership flips
      // `is_settlement_member(sj.settlement_id, gear.user_id)` to false,
      // so the new referenced-cost path collapses.
      const { error: unshareErr } = await admin
        .from('settlement_shared_user')
        .delete()
        .eq('settlement_id', ecSettlementId)
        .eq('shared_user_id', ecAuthor.id)
      if (unshareErr) throw new Error(`ec-7 unshare: ${unshareErr.message}`)

      const { data, error } = await ecOwner.client
        .from('gear')
        .select('id')
        .eq('id', ecCostGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // EC-7 (parent-author variant): when the PARENT recipe's author is
  // unshared, the owner must also lose access to the referenced row even
  // though the referenced row's author is still a settlement member.
  // PR #230 review feedback flagged this gap (comment 3249906530):
  // SECURITY DEFINER helpers bypass the parent recipe's own RLS, so
  // without an explicit `is_settlement_member(sj.settlement_id,
  // <parent>.user_id)` clause the helper would happily walk a parent
  // whose author was no longer settlement-visible.
  // ---------------------------------------------------------------------------
  describe('EC-7 (parent-author): owner loses access when parent author is unshared', () => {
    let pAuthOwner: TestUser
    let parentAuthor: TestUser
    let costAuthor: TestUser
    let pAuthSettlementId: string
    let pAuthCostGearId: string

    beforeAll(async () => {
      pAuthOwner = await createTestUser()
      parentAuthor = await createTestUser()
      costAuthor = await createTestUser()
      pAuthSettlementId = await seedSettlement(
        pAuthOwner.id,
        'EC-7 Parent-Author Referenced Row'
      )
      await shareSettlement(pAuthSettlementId, parentAuthor.id, pAuthOwner.id)
      await shareSettlement(pAuthSettlementId, costAuthor.id, pAuthOwner.id)

      const suffix = `${Date.now()}-${Math.random()}`
      const { data: parent, error: pErr } = await admin
        .from('gear')
        .insert({
          gear_name: `EC-7 Parent ${suffix}`,
          custom: true,
          user_id: parentAuthor.id
        })
        .select('id')
        .single()
      if (pErr || !parent) throw new Error(`pa parent gear: ${pErr?.message}`)

      const { data: cost, error: cErr } = await admin
        .from('gear')
        .insert({
          gear_name: `EC-7 Cost ${suffix}`,
          custom: true,
          user_id: costAuthor.id
        })
        .select('id')
        .single()
      if (cErr || !cost) throw new Error(`pa cost gear: ${cErr?.message}`)
      pAuthCostGearId = cost.id

      const { error: jErr } = await admin.from('gear_gear_cost').insert({
        gear_id: parent.id,
        cost_gear_id: pAuthCostGearId,
        quantity: 1
      })
      if (jErr) throw new Error(`pa gear_gear_cost: ${jErr.message}`)

      const { error: sjErr } = await admin.from('settlement_gear').insert({
        settlement_id: pAuthSettlementId,
        gear_id: parent.id,
        quantity: 1
      })
      if (sjErr) throw new Error(`pa settlement_gear: ${sjErr.message}`)
    })

    afterAll(async () => {
      await deleteTestUser(pAuthOwner.id)
      await deleteTestUser(parentAuthor.id)
      await deleteTestUser(costAuthor.id)
    })

    it('owner reads referenced cost gear while parent author is still shared', async () => {
      const { data, error } = await pAuthOwner.client
        .from('gear')
        .select('id')
        .eq('id', pAuthCostGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('owner cannot read referenced cost gear after PARENT author is unshared (cost author still shared)', async () => {
      // Unshare the parent recipe's author only. The referenced cost
      // gear's author remains a settlement member, so the
      // ref-author-membership clause is still true — but the new
      // parent-author-membership clause must flip false and collapse the
      // helper.
      const { error: unshareErr } = await admin
        .from('settlement_shared_user')
        .delete()
        .eq('settlement_id', pAuthSettlementId)
        .eq('shared_user_id', parentAuthor.id)
      if (unshareErr) throw new Error(`pa unshare: ${unshareErr.message}`)

      const { data, error } = await pAuthOwner.client
        .from('gear')
        .select('id')
        .eq('id', pAuthCostGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // location referenced as quarry_location.location_id
  // ---------------------------------------------------------------------------
  describe('location via quarry_location', () => {
    let quarryId: string
    let locationId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: q, error: qErr } = await admin
        .from('quarry')
        .insert({
          monster_name: `Parent Quarry ${suffix}`,
          node: 'NQ1',
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (qErr || !q) throw new Error(`seed parent quarry: ${qErr?.message}`)
      quarryId = q.id

      const { data: loc, error: locErr } = await admin
        .from('location')
        .insert({
          location_name: `Quarry-Cited Location ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (locErr || !loc)
        throw new Error(`seed referenced location: ${locErr?.message}`)
      locationId = loc.id

      const { error: jErr } = await admin
        .from('quarry_location')
        .insert({ quarry_id: quarryId, location_id: locationId })
      if (jErr) throw new Error(`seed quarry_location: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_quarry')
        .insert({ settlement_id: settlementId, quarry_id: quarryId })
      if (sjErr) throw new Error(`seed settlement_quarry: ${sjErr.message}`)
    })

    it('collaborator (author) reads location via owner-and-custom', async () => {
      const { data, error } = await collaborator.client
        .from('location')
        .select('id')
        .eq('id', locationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('settlement owner reads referenced location via referenced-quarry policy', async () => {
      const { data, error } = await owner.client
        .from('location')
        .select('id, location_name')
        .eq('id', locationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read referenced location', async () => {
      const { data, error } = await stranger.client
        .from('location')
        .select('id')
        .eq('id', locationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // location referenced as nemesis_location.location_id
  // ---------------------------------------------------------------------------
  describe('location via nemesis_location', () => {
    let nemesisId: string
    let locationId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: n, error: nErr } = await admin
        .from('nemesis')
        .insert({
          monster_name: `Parent Nemesis ${suffix}`,
          node: 'NN1',
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (nErr || !n) throw new Error(`seed parent nemesis: ${nErr?.message}`)
      nemesisId = n.id

      const { data: loc, error: locErr } = await admin
        .from('location')
        .insert({
          location_name: `Nemesis-Cited Location ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (locErr || !loc)
        throw new Error(`seed referenced location: ${locErr?.message}`)
      locationId = loc.id

      const { error: jErr } = await admin
        .from('nemesis_location')
        .insert({ nemesis_id: nemesisId, location_id: locationId })
      if (jErr) throw new Error(`seed nemesis_location: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_nemesis')
        .insert({ settlement_id: settlementId, nemesis_id: nemesisId })
      if (sjErr) throw new Error(`seed settlement_nemesis: ${sjErr.message}`)
    })

    it('collaborator (author) reads location via owner-and-custom', async () => {
      const { data, error } = await collaborator.client
        .from('location')
        .select('id')
        .eq('id', locationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('settlement owner reads referenced location via referenced-nemesis policy', async () => {
      const { data, error } = await owner.client
        .from('location')
        .select('id, location_name')
        .eq('id', locationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read referenced location', async () => {
      const { data, error } = await stranger.client
        .from('location')
        .select('id')
        .eq('id', locationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // collective_cognition_reward referenced as
  // quarry_collective_cognition_reward.collective_cognition_reward_id
  // ---------------------------------------------------------------------------
  describe('collective_cognition_reward via quarry_collective_cognition_reward', () => {
    let quarryId: string
    let ccRewardId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: q, error: qErr } = await admin
        .from('quarry')
        .insert({
          monster_name: `CCR Parent Quarry ${suffix}`,
          node: 'NQ2',
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (qErr || !q)
        throw new Error(`seed ccr parent quarry: ${qErr?.message}`)
      quarryId = q.id

      const { data: cc, error: ccErr } = await admin
        .from('collective_cognition_reward')
        .insert({
          reward_name: `Cited CC Reward ${suffix}`,
          collective_cognition: 1,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (ccErr || !cc)
        throw new Error(`seed referenced ccr: ${ccErr?.message}`)
      ccRewardId = cc.id

      const { error: jErr } = await admin
        .from('quarry_collective_cognition_reward')
        .insert({
          quarry_id: quarryId,
          collective_cognition_reward_id: ccRewardId
        })
      if (jErr)
        throw new Error(
          `seed quarry_collective_cognition_reward: ${jErr.message}`
        )

      const { error: sjErr } = await admin
        .from('settlement_quarry')
        .insert({ settlement_id: settlementId, quarry_id: quarryId })
      if (sjErr) throw new Error(`seed settlement_quarry: ${sjErr.message}`)
    })

    it('collaborator (author) reads collective_cognition_reward via owner-and-custom', async () => {
      const { data, error } = await collaborator.client
        .from('collective_cognition_reward')
        .select('id')
        .eq('id', ccRewardId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('settlement owner reads referenced collective_cognition_reward via referenced-quarry policy', async () => {
      const { data, error } = await owner.client
        .from('collective_cognition_reward')
        .select('id, reward_name')
        .eq('id', ccRewardId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read referenced collective_cognition_reward', async () => {
      const { data, error } = await stranger.client
        .from('collective_cognition_reward')
        .select('id')
        .eq('id', ccRewardId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // gear referenced as armor_set_slot_gear.gear_id
  //
  // PR #230 review feedback flagged that the previous version of the gear
  // helper walked only the three cost-junction paths
  // (gear_gear_cost / pattern_gear_cost / seed_pattern_gear_cost). The UI
  // also renders armor-set slot candidates through `gearMap[gearId]` (see
  // `lib/dal/armor-set.ts`), so a collaborator-authored custom armor set
  // that cites the author's custom gear would surface the slot row while
  // hiding the referenced gear behind an "Unknown" label.
  //
  // The fourth EXISTS branch in `is_gear_visible_via_cost_reference` walks
  // `armor_set_slot_gear -> armor_set_slot -> armor_set ->
  //   gear_grid.selected_armor_set_id -> survivor.settlement_id`,
  // mirroring the parent `Allow select via gear_grid` policies on
  // `armor_set` / `armor_set_slot` from 20260516000000 / 20260524000000.
  // Parent-author here is the armor_set's `user_id`.
  //
  // The seed below mirrors `catalog-sub-row-transitive-select.test.ts`'s
  // `armor_set_slot_gear via gear_grid` block: a required slot needs a
  // matching candidate piece equipped in the grid for the
  // `clear_selected_armor_set_if_unqualified` trigger to keep
  // `selected_armor_set_id` intact, and the equipped piece must exist in
  // `settlement_gear` to satisfy `validate_gear_grid_positions`.
  // ---------------------------------------------------------------------------
  describe('gear via armor_set_slot_gear (armor set slot candidate)', () => {
    let asOwner: TestUser
    let asAuthor: TestUser
    let asStranger: TestUser
    let asSettlementId: string
    let asArmorSetId: string
    let asSlotGearId: string

    beforeAll(async () => {
      asOwner = await createTestUser()
      asAuthor = await createTestUser()
      asStranger = await createTestUser()
      asSettlementId = await seedSettlement(
        asOwner.id,
        'Armor-Set Slot-Gear Referenced Row'
      )
      await shareSettlement(asSettlementId, asAuthor.id, asOwner.id)

      const suffix = `${Date.now()}-${Math.random()}`

      const { data: aset, error: aErr } = await admin
        .from('armor_set')
        .insert({
          armor_set_name: `Slot-Gear ArmorSet ${suffix}`,
          custom: true,
          user_id: asAuthor.id
        })
        .select('id')
        .single()
      if (aErr || !aset) throw new Error(`as seed armor_set: ${aErr?.message}`)
      asArmorSetId = aset.id

      const { data: slot, error: sErr } = await admin
        .from('armor_set_slot')
        .insert({
          armor_set_id: asArmorSetId,
          slot_name: 'helm',
          slot_order: 0,
          required: true
        })
        .select('id')
        .single()
      if (sErr || !slot)
        throw new Error(`as seed armor_set_slot: ${sErr?.message}`)

      const { data: g, error: gErr } = await admin
        .from('gear')
        .insert({
          gear_name: `Slot Candidate Gear ${suffix}`,
          custom: true,
          user_id: asAuthor.id
        })
        .select('id')
        .single()
      if (gErr || !g) throw new Error(`as seed gear: ${gErr?.message}`)
      asSlotGearId = g.id

      const { error: sgErr } = await admin
        .from('armor_set_slot_gear')
        .insert({ armor_set_slot_id: slot.id, gear_id: asSlotGearId })
      if (sgErr)
        throw new Error(`as seed armor_set_slot_gear: ${sgErr.message}`)

      const { data: sv, error: svErr } = await admin
        .from('survivor')
        .insert({
          settlement_id: asSettlementId,
          gender: 'FEMALE',
          survivor_name: `ArmorSet Carrier ${suffix}`
        })
        .select('id')
        .single()
      if (svErr || !sv) throw new Error(`as seed survivor: ${svErr?.message}`)

      // Required-slot trigger needs a candidate piece equipped; equipped
      // piece must exist in `settlement_gear`.
      const { error: sgsErr } = await admin.from('settlement_gear').insert({
        settlement_id: asSettlementId,
        gear_id: asSlotGearId,
        quantity: 1
      })
      if (sgsErr) throw new Error(`as seed settlement_gear: ${sgsErr.message}`)

      const { error: ggErr } = await admin.from('gear_grid').insert({
        survivor_id: sv.id,
        selected_armor_set_id: asArmorSetId,
        pos_top_left: asSlotGearId
      })
      if (ggErr) throw new Error(`as seed gear_grid: ${ggErr.message}`)
    })

    afterAll(async () => {
      await deleteTestUser(asOwner.id)
      await deleteTestUser(asAuthor.id)
      await deleteTestUser(asStranger.id)
    })

    it('settlement owner reads slot-candidate gear via armor_set_slot_gear path', async () => {
      const { data, error } = await asOwner.client
        .from('gear')
        .select('id, gear_name')
        .eq('id', asSlotGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot read slot-candidate gear', async () => {
      const { data, error } = await asStranger.client
        .from('gear')
        .select('id')
        .eq('id', asSlotGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('owner loses access to slot-candidate gear when parent armor_set author is unshared', async () => {
      // Parent author here is the armor_set's `user_id`. Unsharing them
      // must collapse the new EXISTS branch even though no cost junction
      // is involved.
      const { error: unshareErr } = await admin
        .from('settlement_shared_user')
        .delete()
        .eq('settlement_id', asSettlementId)
        .eq('shared_user_id', asAuthor.id)
      if (unshareErr)
        throw new Error(`as parent-author unshare: ${unshareErr.message}`)

      const { data, error } = await asOwner.client
        .from('gear')
        .select('id')
        .eq('id', asSlotGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // Per-helper coverage of the stranger-authored referenced-row boundary.
  //
  // The gear helper variant is already exercised by the top-level
  // `security: stranger-authored referenced row stays hidden` block. The
  // five SECURITY DEFINER helpers each implement their own
  // `is_settlement_member(sj.settlement_id, <ref>.user_id)` check, so a
  // missing predicate in any one of them would silently pass without
  // these per-helper boundary tests. Each block below seeds a
  // collaborator-authored parent and a STRANGER-authored referenced row,
  // attaches the parent, and asserts the owner cannot SELECT the
  // referenced row.
  // ---------------------------------------------------------------------------
  describe('security: stranger-authored referenced resource stays hidden', () => {
    let strangerResourceId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: parent, error: pErr } = await admin
        .from('gear')
        .insert({
          gear_name: `Sec-Resource Parent Gear ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (pErr || !parent) throw new Error(`sec-res parent: ${pErr?.message}`)

      const { data: res, error: rErr } = await admin
        .from('resource')
        .insert({
          resource_name: `Stranger Resource ${suffix}`,
          category: 'BASIC',
          resource_types: [],
          custom: true,
          user_id: stranger.id
        })
        .select('id')
        .single()
      if (rErr || !res) throw new Error(`sec-res stranger: ${rErr?.message}`)
      strangerResourceId = res.id

      const { error: jErr } = await admin.from('gear_resource_cost').insert({
        gear_id: parent.id,
        resource_id: strangerResourceId,
        quantity: 1
      })
      if (jErr) throw new Error(`sec-res junction: ${jErr.message}`)

      const { error: sjErr } = await admin.from('settlement_gear').insert({
        settlement_id: settlementId,
        gear_id: parent.id,
        quantity: 1
      })
      if (sjErr) throw new Error(`sec-res settlement_gear: ${sjErr.message}`)
    })

    it('owner cannot read stranger-authored referenced resource', async () => {
      const { data, error } = await owner.client
        .from('resource')
        .select('id')
        .eq('id', strangerResourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('security: stranger-authored referenced innovation stays hidden', () => {
    let strangerInnovationId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: parent, error: pErr } = await admin
        .from('pattern')
        .insert({
          pattern_name: `Sec-Innovation Parent Pattern ${suffix}`,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (pErr || !parent) throw new Error(`sec-inv parent: ${pErr?.message}`)

      const { data: inv, error: iErr } = await admin
        .from('innovation')
        .insert({
          innovation_name: `Stranger Innovation ${suffix}`,
          custom: true,
          user_id: stranger.id
        })
        .select('id')
        .single()
      if (iErr || !inv) throw new Error(`sec-inv stranger: ${iErr?.message}`)
      strangerInnovationId = inv.id

      const { error: jErr } = await admin
        .from('pattern_innovation_requirement')
        .insert({ pattern_id: parent.id, innovation_id: strangerInnovationId })
      if (jErr) throw new Error(`sec-inv junction: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_pattern')
        .insert({ settlement_id: settlementId, pattern_id: parent.id })
      if (sjErr) throw new Error(`sec-inv settlement_pattern: ${sjErr.message}`)
    })

    it('owner cannot read stranger-authored referenced innovation', async () => {
      const { data, error } = await owner.client
        .from('innovation')
        .select('id')
        .eq('id', strangerInnovationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('security: stranger-authored referenced location stays hidden', () => {
    let strangerLocationId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: q, error: qErr } = await admin
        .from('quarry')
        .insert({
          monster_name: `Sec-Location Parent Quarry ${suffix}`,
          node: 'NQ3',
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (qErr || !q) throw new Error(`sec-loc parent: ${qErr?.message}`)

      const { data: loc, error: lErr } = await admin
        .from('location')
        .insert({
          location_name: `Stranger Location ${suffix}`,
          custom: true,
          user_id: stranger.id
        })
        .select('id')
        .single()
      if (lErr || !loc) throw new Error(`sec-loc stranger: ${lErr?.message}`)
      strangerLocationId = loc.id

      const { error: jErr } = await admin
        .from('quarry_location')
        .insert({ quarry_id: q.id, location_id: strangerLocationId })
      if (jErr) throw new Error(`sec-loc junction: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_quarry')
        .insert({ settlement_id: settlementId, quarry_id: q.id })
      if (sjErr) throw new Error(`sec-loc settlement_quarry: ${sjErr.message}`)
    })

    it('owner cannot read stranger-authored referenced location', async () => {
      const { data, error } = await owner.client
        .from('location')
        .select('id')
        .eq('id', strangerLocationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('security: stranger-authored referenced collective_cognition_reward stays hidden', () => {
    let strangerCcrId: string

    beforeAll(async () => {
      const suffix = `${Date.now()}-${Math.random()}`
      const { data: q, error: qErr } = await admin
        .from('quarry')
        .insert({
          monster_name: `Sec-CCR Parent Quarry ${suffix}`,
          node: 'NQ4',
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (qErr || !q) throw new Error(`sec-ccr parent: ${qErr?.message}`)

      const { data: cc, error: cErr } = await admin
        .from('collective_cognition_reward')
        .insert({
          reward_name: `Stranger CCR ${suffix}`,
          collective_cognition: 1,
          custom: true,
          user_id: stranger.id
        })
        .select('id')
        .single()
      if (cErr || !cc) throw new Error(`sec-ccr stranger: ${cErr?.message}`)
      strangerCcrId = cc.id

      const { error: jErr } = await admin
        .from('quarry_collective_cognition_reward')
        .insert({
          quarry_id: q.id,
          collective_cognition_reward_id: strangerCcrId
        })
      if (jErr) throw new Error(`sec-ccr junction: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_quarry')
        .insert({ settlement_id: settlementId, quarry_id: q.id })
      if (sjErr) throw new Error(`sec-ccr settlement_quarry: ${sjErr.message}`)
    })

    it('owner cannot read stranger-authored referenced collective_cognition_reward', async () => {
      const { data, error } = await owner.client
        .from('collective_cognition_reward')
        .select('id')
        .eq('id', strangerCcrId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // Per-helper coverage of the parent-author EC-7 boundary.
  //
  // The gear-cost variant is already exercised by
  // `EC-7 (parent-author): owner loses access when parent author is
  // unshared` above. Each helper implements its own parent-author
  // membership clause, so a missing predicate in any one of the
  // resource / innovation / location / collective_cognition_reward
  // helpers would silently pass without these per-helper EC-7 tests.
  // Each block below seeds two distinct authors (parentAuthor + ref
  // author), attaches the parent recipe to a settlement they both
  // share, then unshares parentAuthor and asserts the owner loses
  // SELECT access on the referenced row.
  // ---------------------------------------------------------------------------
  describe('EC-7 (parent-author): owner loses access to referenced resource when parent author is unshared', () => {
    let ecOwner: TestUser
    let parentAuthor: TestUser
    let refAuthor: TestUser
    let ecSettlementId: string
    let ecResourceId: string

    beforeAll(async () => {
      ecOwner = await createTestUser()
      parentAuthor = await createTestUser()
      refAuthor = await createTestUser()
      ecSettlementId = await seedSettlement(
        ecOwner.id,
        'EC-7 PA Referenced Resource'
      )
      await shareSettlement(ecSettlementId, parentAuthor.id, ecOwner.id)
      await shareSettlement(ecSettlementId, refAuthor.id, ecOwner.id)

      const suffix = `${Date.now()}-${Math.random()}`
      const { data: parent, error: pErr } = await admin
        .from('gear')
        .insert({
          gear_name: `EC-7-PA Resource Parent ${suffix}`,
          custom: true,
          user_id: parentAuthor.id
        })
        .select('id')
        .single()
      if (pErr || !parent) throw new Error(`pa-res parent: ${pErr?.message}`)

      const { data: res, error: rErr } = await admin
        .from('resource')
        .insert({
          resource_name: `EC-7-PA Resource ${suffix}`,
          category: 'BASIC',
          resource_types: [],
          custom: true,
          user_id: refAuthor.id
        })
        .select('id')
        .single()
      if (rErr || !res) throw new Error(`pa-res ref: ${rErr?.message}`)
      ecResourceId = res.id

      const { error: jErr } = await admin.from('gear_resource_cost').insert({
        gear_id: parent.id,
        resource_id: ecResourceId,
        quantity: 1
      })
      if (jErr) throw new Error(`pa-res junction: ${jErr.message}`)

      const { error: sjErr } = await admin.from('settlement_gear').insert({
        settlement_id: ecSettlementId,
        gear_id: parent.id,
        quantity: 1
      })
      if (sjErr) throw new Error(`pa-res settlement_gear: ${sjErr.message}`)
    })

    afterAll(async () => {
      await deleteTestUser(ecOwner.id)
      await deleteTestUser(parentAuthor.id)
      await deleteTestUser(refAuthor.id)
    })

    it('owner reads referenced resource while parent author is still shared', async () => {
      const { data, error } = await ecOwner.client
        .from('resource')
        .select('id')
        .eq('id', ecResourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('owner cannot read referenced resource after PARENT author is unshared', async () => {
      const { error: unshareErr } = await admin
        .from('settlement_shared_user')
        .delete()
        .eq('settlement_id', ecSettlementId)
        .eq('shared_user_id', parentAuthor.id)
      if (unshareErr) throw new Error(`pa-res unshare: ${unshareErr.message}`)

      const { data, error } = await ecOwner.client
        .from('resource')
        .select('id')
        .eq('id', ecResourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('EC-7 (parent-author): owner loses access to referenced innovation when parent author is unshared', () => {
    let ecOwner: TestUser
    let parentAuthor: TestUser
    let refAuthor: TestUser
    let ecSettlementId: string
    let ecInnovationId: string

    beforeAll(async () => {
      ecOwner = await createTestUser()
      parentAuthor = await createTestUser()
      refAuthor = await createTestUser()
      ecSettlementId = await seedSettlement(
        ecOwner.id,
        'EC-7 PA Referenced Innovation'
      )
      await shareSettlement(ecSettlementId, parentAuthor.id, ecOwner.id)
      await shareSettlement(ecSettlementId, refAuthor.id, ecOwner.id)

      const suffix = `${Date.now()}-${Math.random()}`
      const { data: parent, error: pErr } = await admin
        .from('pattern')
        .insert({
          pattern_name: `EC-7-PA Innovation Parent ${suffix}`,
          custom: true,
          user_id: parentAuthor.id
        })
        .select('id')
        .single()
      if (pErr || !parent) throw new Error(`pa-inv parent: ${pErr?.message}`)

      const { data: inv, error: iErr } = await admin
        .from('innovation')
        .insert({
          innovation_name: `EC-7-PA Innovation ${suffix}`,
          custom: true,
          user_id: refAuthor.id
        })
        .select('id')
        .single()
      if (iErr || !inv) throw new Error(`pa-inv ref: ${iErr?.message}`)
      ecInnovationId = inv.id

      const { error: jErr } = await admin
        .from('pattern_innovation_requirement')
        .insert({ pattern_id: parent.id, innovation_id: ecInnovationId })
      if (jErr) throw new Error(`pa-inv junction: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_pattern')
        .insert({ settlement_id: ecSettlementId, pattern_id: parent.id })
      if (sjErr) throw new Error(`pa-inv settlement_pattern: ${sjErr.message}`)
    })

    afterAll(async () => {
      await deleteTestUser(ecOwner.id)
      await deleteTestUser(parentAuthor.id)
      await deleteTestUser(refAuthor.id)
    })

    it('owner reads referenced innovation while parent author is still shared', async () => {
      const { data, error } = await ecOwner.client
        .from('innovation')
        .select('id')
        .eq('id', ecInnovationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('owner cannot read referenced innovation after PARENT author is unshared', async () => {
      const { error: unshareErr } = await admin
        .from('settlement_shared_user')
        .delete()
        .eq('settlement_id', ecSettlementId)
        .eq('shared_user_id', parentAuthor.id)
      if (unshareErr) throw new Error(`pa-inv unshare: ${unshareErr.message}`)

      const { data, error } = await ecOwner.client
        .from('innovation')
        .select('id')
        .eq('id', ecInnovationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('EC-7 (parent-author): owner loses access to referenced location when parent author is unshared', () => {
    let ecOwner: TestUser
    let parentAuthor: TestUser
    let refAuthor: TestUser
    let ecSettlementId: string
    let ecLocationId: string

    beforeAll(async () => {
      ecOwner = await createTestUser()
      parentAuthor = await createTestUser()
      refAuthor = await createTestUser()
      ecSettlementId = await seedSettlement(
        ecOwner.id,
        'EC-7 PA Referenced Location'
      )
      await shareSettlement(ecSettlementId, parentAuthor.id, ecOwner.id)
      await shareSettlement(ecSettlementId, refAuthor.id, ecOwner.id)

      const suffix = `${Date.now()}-${Math.random()}`
      const { data: parent, error: qErr } = await admin
        .from('quarry')
        .insert({
          monster_name: `EC-7-PA Location Parent Quarry ${suffix}`,
          node: 'NN1',
          custom: true,
          user_id: parentAuthor.id
        })
        .select('id')
        .single()
      if (qErr || !parent) throw new Error(`pa-loc parent: ${qErr?.message}`)

      const { data: loc, error: lErr } = await admin
        .from('location')
        .insert({
          location_name: `EC-7-PA Location ${suffix}`,
          custom: true,
          user_id: refAuthor.id
        })
        .select('id')
        .single()
      if (lErr || !loc) throw new Error(`pa-loc ref: ${lErr?.message}`)
      ecLocationId = loc.id

      const { error: jErr } = await admin
        .from('quarry_location')
        .insert({ quarry_id: parent.id, location_id: ecLocationId })
      if (jErr) throw new Error(`pa-loc junction: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_quarry')
        .insert({ settlement_id: ecSettlementId, quarry_id: parent.id })
      if (sjErr) throw new Error(`pa-loc settlement_quarry: ${sjErr.message}`)
    })

    afterAll(async () => {
      await deleteTestUser(ecOwner.id)
      await deleteTestUser(parentAuthor.id)
      await deleteTestUser(refAuthor.id)
    })

    it('owner reads referenced location while parent author is still shared', async () => {
      const { data, error } = await ecOwner.client
        .from('location')
        .select('id')
        .eq('id', ecLocationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('owner cannot read referenced location after PARENT author is unshared', async () => {
      const { error: unshareErr } = await admin
        .from('settlement_shared_user')
        .delete()
        .eq('settlement_id', ecSettlementId)
        .eq('shared_user_id', parentAuthor.id)
      if (unshareErr) throw new Error(`pa-loc unshare: ${unshareErr.message}`)

      const { data, error } = await ecOwner.client
        .from('location')
        .select('id')
        .eq('id', ecLocationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('EC-7 (parent-author): owner loses access to referenced collective_cognition_reward when parent author is unshared', () => {
    let ecOwner: TestUser
    let parentAuthor: TestUser
    let refAuthor: TestUser
    let ecSettlementId: string
    let ecCcrId: string

    beforeAll(async () => {
      ecOwner = await createTestUser()
      parentAuthor = await createTestUser()
      refAuthor = await createTestUser()
      ecSettlementId = await seedSettlement(
        ecOwner.id,
        'EC-7 PA Referenced CCR'
      )
      await shareSettlement(ecSettlementId, parentAuthor.id, ecOwner.id)
      await shareSettlement(ecSettlementId, refAuthor.id, ecOwner.id)

      const suffix = `${Date.now()}-${Math.random()}`
      const { data: parent, error: qErr } = await admin
        .from('quarry')
        .insert({
          monster_name: `EC-7-PA CCR Parent Quarry ${suffix}`,
          node: 'NN2',
          custom: true,
          user_id: parentAuthor.id
        })
        .select('id')
        .single()
      if (qErr || !parent) throw new Error(`pa-ccr parent: ${qErr?.message}`)

      const { data: cc, error: cErr } = await admin
        .from('collective_cognition_reward')
        .insert({
          reward_name: `EC-7-PA CCR ${suffix}`,
          collective_cognition: 1,
          custom: true,
          user_id: refAuthor.id
        })
        .select('id')
        .single()
      if (cErr || !cc) throw new Error(`pa-ccr ref: ${cErr?.message}`)
      ecCcrId = cc.id

      const { error: jErr } = await admin
        .from('quarry_collective_cognition_reward')
        .insert({
          quarry_id: parent.id,
          collective_cognition_reward_id: ecCcrId
        })
      if (jErr) throw new Error(`pa-ccr junction: ${jErr.message}`)

      const { error: sjErr } = await admin
        .from('settlement_quarry')
        .insert({ settlement_id: ecSettlementId, quarry_id: parent.id })
      if (sjErr) throw new Error(`pa-ccr settlement_quarry: ${sjErr.message}`)
    })

    afterAll(async () => {
      await deleteTestUser(ecOwner.id)
      await deleteTestUser(parentAuthor.id)
      await deleteTestUser(refAuthor.id)
    })

    it('owner reads referenced collective_cognition_reward while parent author is still shared', async () => {
      const { data, error } = await ecOwner.client
        .from('collective_cognition_reward')
        .select('id')
        .eq('id', ecCcrId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('owner cannot read referenced collective_cognition_reward after PARENT author is unshared', async () => {
      const { error: unshareErr } = await admin
        .from('settlement_shared_user')
        .delete()
        .eq('settlement_id', ecSettlementId)
        .eq('shared_user_id', parentAuthor.id)
      if (unshareErr) throw new Error(`pa-ccr unshare: ${unshareErr.message}`)

      const { data, error } = await ecOwner.client
        .from('collective_cognition_reward')
        .select('id')
        .eq('id', ecCcrId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })
})
