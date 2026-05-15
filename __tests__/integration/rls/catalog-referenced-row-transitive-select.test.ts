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
 *      monster (`gear` / `pattern` / `seed_pattern` / `quarry` / `nemesis`)
 *      AND a custom referenced catalog row (`gear` / `resource` /
 *      `innovation` / `location` / `collective_cognition_reward`). A cost
 *      / requirement / quarry-nemesis junction row links the two.
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
 *   - `owner loses access after the referenced row's author is unshared`:
 *     EC-7 variant flipping the referenced row's author membership off.
 *   - `owner loses access after the PARENT recipe's author is unshared`:
 *     PR #230 reviewer-flagged variant — the parent recipe is no longer
 *     settlement-visible, so the transitive helper must also collapse
 *     even when the referenced row's author is still a settlement member.
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

      const { data } = await pAuthOwner.client
        .from('gear')
        .select('id')
        .eq('id', pAuthCostGearId)
        .maybeSingle()
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
})
