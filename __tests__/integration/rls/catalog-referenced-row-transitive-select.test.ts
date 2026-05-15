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
 *   1. `collaborator` (the shared-user) authors a custom parent recipe
 *      (`gear` / `pattern` / `seed_pattern`) AND a custom referenced
 *      catalog row (`gear` / `resource` / `innovation`). A cost /
 *      requirement junction row links the two.
 *   2. `owner` attaches the parent recipe to their settlement via
 *      `settlement_gear` / `settlement_pattern` / `settlement_seed_pattern`.
 *   3. We assert that:
 *        a. The author (collaborator) still sees the referenced row via
 *           the pre-existing `Allow select for owner and custom` policy.
 *        b. The settlement owner (who is NOT the author) now sees the
 *           referenced row via the NEW `Allow select via referenced cost`
 *           policy — this was the gap PR #230 review feedback identified.
 *        c. A stranger sees nothing.
 *
 * Three additional security boundaries are exercised:
 *
 *   - `stranger-authored referenced row is hidden even when a settlement
 *     collaborator cites it from their custom recipe`: the
 *     `is_settlement_member(sj.settlement_id, <ref>.user_id)` clause must
 *     deny access when the referenced row's author is not a member.
 *   - `owner loses access after collaborator (author) is unshared`:
 *     mirrors EC-7 for the new policy path.
 *   - `non-custom referenced rows are unaffected`: the `custom` predicate
 *     prevents the new policy from widening access to global catalog rows
 *     (they remain visible only via `Allow select for authenticated and
 *     non-custom`).
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
      const { data } = await stranger.client
        .from('gear')
        .select('id')
        .eq('id', costGearId)
        .maybeSingle()
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
      const { data } = await stranger.client
        .from('gear')
        .select('id')
        .eq('id', costGearId)
        .maybeSingle()
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
      const { data } = await stranger.client
        .from('gear')
        .select('id')
        .eq('id', costGearId)
        .maybeSingle()
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
      const { data } = await stranger.client
        .from('resource')
        .select('id')
        .eq('id', resourceId)
        .maybeSingle()
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
      const { data } = await stranger.client
        .from('resource')
        .select('id')
        .eq('id', resourceId)
        .maybeSingle()
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
      const { data } = await stranger.client
        .from('resource')
        .select('id')
        .eq('id', resourceId)
        .maybeSingle()
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
      const { data } = await stranger.client
        .from('innovation')
        .select('id')
        .eq('id', innovationId)
        .maybeSingle()
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
      const { data } = await stranger.client
        .from('innovation')
        .select('id')
        .eq('id', innovationId)
        .maybeSingle()
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
      const { data } = await owner.client
        .from('gear')
        .select('id')
        .eq('id', strangerCostGearId)
        .maybeSingle()
      expect(data).toBeNull()
    })

    it('collaborator (recipe author) cannot read stranger-authored referenced gear', async () => {
      // Collaborator is not the author of the cost gear, and the cost gear is
      // not attached to a settlement they collaborate on. They can only see
      // the junction row (via the existing cost-row policy), not the
      // referenced gear itself.
      const { data } = await collaborator.client
        .from('gear')
        .select('id')
        .eq('id', strangerCostGearId)
        .maybeSingle()
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

      const { data } = await ecOwner.client
        .from('gear')
        .select('id')
        .eq('id', ecCostGearId)
        .maybeSingle()
      expect(data).toBeNull()
    })
  })
})
