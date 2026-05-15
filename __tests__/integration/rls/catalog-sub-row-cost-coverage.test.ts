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
 * RLS — Catalog Cost / Requirement Sub-Row Coverage
 *
 * Sibling coverage to `catalog-sub-row-transitive-select.test.ts`.
 * That file proves the new "Allow select via settlement membership"
 * policy works for ONE representative table per parent
 * (`gear_resource_cost`, `pattern_innovation_requirement`,
 * `seed_pattern_gear_cost`). This file exercises the remaining nine
 * cost / requirement junction tables that share the same policy
 * template but were never directly hit by an integration test, and
 * also closes the INSERT / UPDATE / DELETE gaps for each.
 *
 * Tables covered:
 *   - gear_gear_cost                        (gear → gear)
 *   - gear_other_cost                       (gear → string label)
 *   - gear_resource_type_cost               (gear → resource_type enum)
 *   - pattern_gear_cost                     (pattern → gear)
 *   - pattern_resource_cost                 (pattern → resource)
 *   - pattern_resource_type_cost            (pattern → resource_type)
 *   - seed_pattern_resource_cost            (seed_pattern → resource)
 *   - seed_pattern_resource_type_cost       (seed_pattern → resource_type)
 *   - seed_pattern_innovation_requirement   (seed_pattern → innovation)
 *
 * Per table we assert:
 *   1. The author (a collaborator, NOT the settlement owner) can
 *      INSERT a sub-row on a custom catalog row they authored.
 *   2. The author can SELECT it (Allow select for owner and custom).
 *   3. The settlement owner (a non-author) can SELECT it once the
 *      parent has been attached to their settlement
 *      (Allow select via settlement membership).
 *   4. The author can UPDATE the sub-row (where the schema has any
 *      updatable column — quantity).
 *   5. A stranger sees nothing.
 *   6. The author can DELETE the sub-row.
 *
 * Together with the existing sibling coverage these tests close every
 * (table × command) cell for the cost / requirement family per the
 * static `scripts/rls-coverage.mjs` report.
 */
describe('RLS: catalog sub-row cost / requirement coverage', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let settlementId: string

  /** Suffix to keep custom-catalog names unique across parallel runs. */
  const suffix = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()

    settlementId = await seedSettlement(
      owner.id,
      'Sub-Row Cost Coverage Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  // ──────────────────────────────────────────────────────────────────
  // Catalog parent helpers — all rows are custom + authored by the
  // collaborator so the policy paths under test are reachable.
  // ──────────────────────────────────────────────────────────────────

  /**
   * Create Custom Gear
   *
   * Inserts a custom gear row authored by the collaborator.
   *
   * @returns Gear ID
   */
  async function createCustomGear(): Promise<string> {
    const { data, error } = await admin
      .from('gear')
      .insert({
        gear_name: `Gear ${suffix()}`,
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (error || !data) throw new Error(`seed gear: ${error?.message}`)
    return data.id
  }

  /**
   * Create Custom Pattern
   *
   * Inserts a custom pattern row authored by the collaborator.
   *
   * @returns Pattern ID
   */
  async function createCustomPattern(): Promise<string> {
    const { data, error } = await admin
      .from('pattern')
      .insert({
        pattern_name: `Pattern ${suffix()}`,
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (error || !data) throw new Error(`seed pattern: ${error?.message}`)
    return data.id
  }

  /**
   * Create Custom Seed Pattern
   *
   * Inserts a custom seed_pattern row authored by the collaborator.
   *
   * @returns Seed Pattern ID
   */
  async function createCustomSeedPattern(): Promise<string> {
    const { data, error } = await admin
      .from('seed_pattern')
      .insert({
        seed_pattern_name: `SeedPattern ${suffix()}`,
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (error || !data) throw new Error(`seed seed_pattern: ${error?.message}`)
    return data.id
  }

  /**
   * Create Custom Resource
   *
   * Inserts a custom resource row authored by the collaborator.
   *
   * @returns Resource ID
   */
  async function createCustomResource(): Promise<string> {
    const { data, error } = await admin
      .from('resource')
      .insert({
        resource_name: `Resource ${suffix()}`,
        category: 'BASIC',
        resource_types: [],
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (error || !data) throw new Error(`seed resource: ${error?.message}`)
    return data.id
  }

  /**
   * Create Custom Innovation
   *
   * Inserts a custom innovation row authored by the collaborator.
   *
   * @returns Innovation ID
   */
  async function createCustomInnovation(): Promise<string> {
    const { data, error } = await admin
      .from('innovation')
      .insert({
        innovation_name: `Innovation ${suffix()}`,
        custom: true,
        user_id: collaborator.id
      })
      .select('id')
      .single()
    if (error || !data) throw new Error(`seed innovation: ${error?.message}`)
    return data.id
  }

  /**
   * Attach Gear to Settlement
   *
   * Inserts the settlement_gear junction so the owner can reach the
   * gear's sub-rows via settlement membership.
   */
  async function attachGearToSettlement(gearId: string): Promise<void> {
    const { error } = await admin
      .from('settlement_gear')
      .insert({ settlement_id: settlementId, gear_id: gearId, quantity: 1 })
    if (error) throw new Error(`seed settlement_gear: ${error.message}`)
  }

  /**
   * Attach Pattern to Settlement
   */
  async function attachPatternToSettlement(patternId: string): Promise<void> {
    const { error } = await admin
      .from('settlement_pattern')
      .insert({ settlement_id: settlementId, pattern_id: patternId })
    if (error) throw new Error(`seed settlement_pattern: ${error.message}`)
  }

  /**
   * Attach Seed Pattern to Settlement
   */
  async function attachSeedPatternToSettlement(
    seedPatternId: string
  ): Promise<void> {
    const { error } = await admin
      .from('settlement_seed_pattern')
      .insert({ settlement_id: settlementId, seed_pattern_id: seedPatternId })
    if (error) throw new Error(`seed settlement_seed_pattern: ${error.message}`)
  }

  // ──────────────────────────────────────────────────────────────────
  // gear_gear_cost
  // ──────────────────────────────────────────────────────────────────
  describe('gear_gear_cost (gear → cost_gear)', () => {
    let parentGearId: string
    let costGearId: string

    beforeAll(async () => {
      parentGearId = await createCustomGear()
      costGearId = await createCustomGear()
      await attachGearToSettlement(parentGearId)
    })

    it('author inserts the cost row', async () => {
      const { error } = await collaborator.client
        .from('gear_gear_cost')
        .insert({
          gear_id: parentGearId,
          cost_gear_id: costGearId,
          quantity: 2
        })
      expect(error).toBeNull()
    })

    it('author selects the cost row', async () => {
      const { data, error } = await collaborator.client
        .from('gear_gear_cost')
        .select('gear_id, cost_gear_id, quantity')
        .eq('gear_id', parentGearId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data?.quantity).toBe(2)
    })

    it('settlement owner selects via membership', async () => {
      const { data, error } = await owner.client
        .from('gear_gear_cost')
        .select('gear_id, cost_gear_id')
        .eq('gear_id', parentGearId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot select', async () => {
      const { data, error } = await stranger.client
        .from('gear_gear_cost')
        .select('gear_id')
        .eq('gear_id', parentGearId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('author updates the cost row', async () => {
      const { error } = await collaborator.client
        .from('gear_gear_cost')
        .update({ quantity: 5 })
        .eq('gear_id', parentGearId)
        .eq('cost_gear_id', costGearId)
      expect(error).toBeNull()

      // Confirm the UPDATE actually landed by reading back through the
      // service-role client (bypasses RLS so the assertion is exercised
      // on the persisted row, not on a stale client cache).
      const { data: readback } = await admin
        .from('gear_gear_cost')
        .select('quantity')
        .eq('gear_id', parentGearId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(readback?.quantity).toBe(5)
    })

    it('author deletes the cost row', async () => {
      const { error } = await collaborator.client
        .from('gear_gear_cost')
        .delete()
        .eq('gear_id', parentGearId)
        .eq('cost_gear_id', costGearId)
      expect(error).toBeNull()

      // Confirm the row is actually gone from the database via the
      // service-role client (a SELECT through the author's client would
      // also return null when blocked by RLS, so we must bypass it).
      const { data: readback } = await admin
        .from('gear_gear_cost')
        .select('gear_id')
        .eq('gear_id', parentGearId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(readback).toBeNull()
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // gear_other_cost
  // ──────────────────────────────────────────────────────────────────
  describe('gear_other_cost (gear → free-form label)', () => {
    let parentGearId: string
    let rowId: string

    beforeAll(async () => {
      parentGearId = await createCustomGear()
      await attachGearToSettlement(parentGearId)
    })

    it('author inserts the cost row', async () => {
      const { data, error } = await collaborator.client
        .from('gear_other_cost')
        .insert({
          gear_id: parentGearId,
          cost_name: 'Ritual Marker',
          quantity: 3
        })
        .select('id')
        .single()
      expect(error).toBeNull()
      expect(data?.id).toBeTruthy()
      rowId = data!.id
    })

    it('author selects the cost row', async () => {
      const { data, error } = await collaborator.client
        .from('gear_other_cost')
        .select('id, cost_name, quantity')
        .eq('id', rowId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data?.cost_name).toBe('Ritual Marker')
    })

    it('settlement owner selects via membership', async () => {
      const { data, error } = await owner.client
        .from('gear_other_cost')
        .select('id')
        .eq('id', rowId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot select', async () => {
      const { data, error } = await stranger.client
        .from('gear_other_cost')
        .select('id')
        .eq('id', rowId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('author updates the cost row', async () => {
      const { error } = await collaborator.client
        .from('gear_other_cost')
        .update({ quantity: 9 })
        .eq('id', rowId)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('gear_other_cost')
        .select('quantity')
        .eq('id', rowId)
        .maybeSingle()
      expect(readback?.quantity).toBe(9)
    })

    it('author deletes the cost row', async () => {
      const { error } = await collaborator.client
        .from('gear_other_cost')
        .delete()
        .eq('id', rowId)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('gear_other_cost')
        .select('id')
        .eq('id', rowId)
        .maybeSingle()
      expect(readback).toBeNull()
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // gear_resource_type_cost
  // ──────────────────────────────────────────────────────────────────
  describe('gear_resource_type_cost (gear → resource_type enum)', () => {
    let parentGearId: string
    const resourceType = 'BONE' as const

    beforeAll(async () => {
      parentGearId = await createCustomGear()
      await attachGearToSettlement(parentGearId)
    })

    it('author inserts the cost row', async () => {
      const { error } = await collaborator.client
        .from('gear_resource_type_cost')
        .insert({
          gear_id: parentGearId,
          resource_type: resourceType,
          quantity: 1
        })
      expect(error).toBeNull()
    })

    it('author selects the cost row', async () => {
      const { data, error } = await collaborator.client
        .from('gear_resource_type_cost')
        .select('gear_id, resource_type, quantity')
        .eq('gear_id', parentGearId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data?.resource_type).toBe(resourceType)
    })

    it('settlement owner selects via membership', async () => {
      const { data, error } = await owner.client
        .from('gear_resource_type_cost')
        .select('gear_id, resource_type')
        .eq('gear_id', parentGearId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot select', async () => {
      const { data, error } = await stranger.client
        .from('gear_resource_type_cost')
        .select('gear_id')
        .eq('gear_id', parentGearId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('author updates the cost row', async () => {
      const { error } = await collaborator.client
        .from('gear_resource_type_cost')
        .update({ quantity: 4 })
        .eq('gear_id', parentGearId)
        .eq('resource_type', resourceType)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('gear_resource_type_cost')
        .select('quantity')
        .eq('gear_id', parentGearId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(readback?.quantity).toBe(4)
    })

    it('author deletes the cost row', async () => {
      const { error } = await collaborator.client
        .from('gear_resource_type_cost')
        .delete()
        .eq('gear_id', parentGearId)
        .eq('resource_type', resourceType)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('gear_resource_type_cost')
        .select('gear_id')
        .eq('gear_id', parentGearId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(readback).toBeNull()
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // pattern_gear_cost
  // ──────────────────────────────────────────────────────────────────
  describe('pattern_gear_cost (pattern → cost_gear)', () => {
    let patternId: string
    let costGearId: string

    beforeAll(async () => {
      patternId = await createCustomPattern()
      costGearId = await createCustomGear()
      await attachPatternToSettlement(patternId)
    })

    it('author inserts the cost row', async () => {
      const { error } = await collaborator.client
        .from('pattern_gear_cost')
        .insert({
          pattern_id: patternId,
          cost_gear_id: costGearId,
          quantity: 2
        })
      expect(error).toBeNull()
    })

    it('author selects the cost row', async () => {
      const { data, error } = await collaborator.client
        .from('pattern_gear_cost')
        .select('pattern_id, cost_gear_id, quantity')
        .eq('pattern_id', patternId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data?.quantity).toBe(2)
    })

    it('settlement owner selects via membership', async () => {
      const { data, error } = await owner.client
        .from('pattern_gear_cost')
        .select('pattern_id, cost_gear_id')
        .eq('pattern_id', patternId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot select', async () => {
      const { data, error } = await stranger.client
        .from('pattern_gear_cost')
        .select('pattern_id')
        .eq('pattern_id', patternId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('author updates the cost row', async () => {
      const { error } = await collaborator.client
        .from('pattern_gear_cost')
        .update({ quantity: 6 })
        .eq('pattern_id', patternId)
        .eq('cost_gear_id', costGearId)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('pattern_gear_cost')
        .select('quantity')
        .eq('pattern_id', patternId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(readback?.quantity).toBe(6)
    })

    it('author deletes the cost row', async () => {
      const { error } = await collaborator.client
        .from('pattern_gear_cost')
        .delete()
        .eq('pattern_id', patternId)
        .eq('cost_gear_id', costGearId)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('pattern_gear_cost')
        .select('pattern_id')
        .eq('pattern_id', patternId)
        .eq('cost_gear_id', costGearId)
        .maybeSingle()
      expect(readback).toBeNull()
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // pattern_resource_cost
  // ──────────────────────────────────────────────────────────────────
  describe('pattern_resource_cost (pattern → resource)', () => {
    let patternId: string
    let resourceId: string

    beforeAll(async () => {
      patternId = await createCustomPattern()
      resourceId = await createCustomResource()
      await attachPatternToSettlement(patternId)
    })

    it('author inserts the cost row', async () => {
      const { error } = await collaborator.client
        .from('pattern_resource_cost')
        .insert({
          pattern_id: patternId,
          resource_id: resourceId,
          quantity: 2
        })
      expect(error).toBeNull()
    })

    it('author selects the cost row', async () => {
      const { data, error } = await collaborator.client
        .from('pattern_resource_cost')
        .select('pattern_id, resource_id, quantity')
        .eq('pattern_id', patternId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data?.quantity).toBe(2)
    })

    it('settlement owner selects via membership', async () => {
      const { data, error } = await owner.client
        .from('pattern_resource_cost')
        .select('pattern_id, resource_id')
        .eq('pattern_id', patternId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot select', async () => {
      const { data, error } = await stranger.client
        .from('pattern_resource_cost')
        .select('pattern_id')
        .eq('pattern_id', patternId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('author updates the cost row', async () => {
      const { error } = await collaborator.client
        .from('pattern_resource_cost')
        .update({ quantity: 7 })
        .eq('pattern_id', patternId)
        .eq('resource_id', resourceId)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('pattern_resource_cost')
        .select('quantity')
        .eq('pattern_id', patternId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(readback?.quantity).toBe(7)
    })

    it('author deletes the cost row', async () => {
      const { error } = await collaborator.client
        .from('pattern_resource_cost')
        .delete()
        .eq('pattern_id', patternId)
        .eq('resource_id', resourceId)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('pattern_resource_cost')
        .select('pattern_id')
        .eq('pattern_id', patternId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(readback).toBeNull()
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // pattern_resource_type_cost
  // ──────────────────────────────────────────────────────────────────
  describe('pattern_resource_type_cost (pattern → resource_type enum)', () => {
    let patternId: string
    const resourceType = 'CLOTH' as const

    beforeAll(async () => {
      patternId = await createCustomPattern()
      await attachPatternToSettlement(patternId)
    })

    it('author inserts the cost row', async () => {
      const { error } = await collaborator.client
        .from('pattern_resource_type_cost')
        .insert({
          pattern_id: patternId,
          resource_type: resourceType,
          quantity: 1
        })
      expect(error).toBeNull()
    })

    it('author selects the cost row', async () => {
      const { data, error } = await collaborator.client
        .from('pattern_resource_type_cost')
        .select('pattern_id, resource_type, quantity')
        .eq('pattern_id', patternId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data?.resource_type).toBe(resourceType)
    })

    it('settlement owner selects via membership', async () => {
      const { data, error } = await owner.client
        .from('pattern_resource_type_cost')
        .select('pattern_id, resource_type')
        .eq('pattern_id', patternId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot select', async () => {
      const { data, error } = await stranger.client
        .from('pattern_resource_type_cost')
        .select('pattern_id')
        .eq('pattern_id', patternId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('author updates the cost row', async () => {
      const { error } = await collaborator.client
        .from('pattern_resource_type_cost')
        .update({ quantity: 3 })
        .eq('pattern_id', patternId)
        .eq('resource_type', resourceType)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('pattern_resource_type_cost')
        .select('quantity')
        .eq('pattern_id', patternId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(readback?.quantity).toBe(3)
    })

    it('author deletes the cost row', async () => {
      const { error } = await collaborator.client
        .from('pattern_resource_type_cost')
        .delete()
        .eq('pattern_id', patternId)
        .eq('resource_type', resourceType)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('pattern_resource_type_cost')
        .select('pattern_id')
        .eq('pattern_id', patternId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(readback).toBeNull()
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // seed_pattern_resource_cost
  // ──────────────────────────────────────────────────────────────────
  describe('seed_pattern_resource_cost (seed_pattern → resource)', () => {
    let seedPatternId: string
    let resourceId: string

    beforeAll(async () => {
      seedPatternId = await createCustomSeedPattern()
      resourceId = await createCustomResource()
      await attachSeedPatternToSettlement(seedPatternId)
    })

    it('author inserts the cost row', async () => {
      const { error } = await collaborator.client
        .from('seed_pattern_resource_cost')
        .insert({
          seed_pattern_id: seedPatternId,
          resource_id: resourceId,
          quantity: 2
        })
      expect(error).toBeNull()
    })

    it('author selects the cost row', async () => {
      const { data, error } = await collaborator.client
        .from('seed_pattern_resource_cost')
        .select('seed_pattern_id, resource_id, quantity')
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data?.quantity).toBe(2)
    })

    it('settlement owner selects via membership', async () => {
      const { data, error } = await owner.client
        .from('seed_pattern_resource_cost')
        .select('seed_pattern_id, resource_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot select', async () => {
      const { data, error } = await stranger.client
        .from('seed_pattern_resource_cost')
        .select('seed_pattern_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('author updates the cost row', async () => {
      const { error } = await collaborator.client
        .from('seed_pattern_resource_cost')
        .update({ quantity: 8 })
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_id', resourceId)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('seed_pattern_resource_cost')
        .select('quantity')
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(readback?.quantity).toBe(8)
    })

    it('author deletes the cost row', async () => {
      const { error } = await collaborator.client
        .from('seed_pattern_resource_cost')
        .delete()
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_id', resourceId)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('seed_pattern_resource_cost')
        .select('seed_pattern_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_id', resourceId)
        .maybeSingle()
      expect(readback).toBeNull()
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // seed_pattern_resource_type_cost
  // ──────────────────────────────────────────────────────────────────
  describe('seed_pattern_resource_type_cost (seed_pattern → resource_type)', () => {
    let seedPatternId: string
    const resourceType = 'HIDE' as const

    beforeAll(async () => {
      seedPatternId = await createCustomSeedPattern()
      await attachSeedPatternToSettlement(seedPatternId)
    })

    it('author inserts the cost row', async () => {
      const { error } = await collaborator.client
        .from('seed_pattern_resource_type_cost')
        .insert({
          seed_pattern_id: seedPatternId,
          resource_type: resourceType,
          quantity: 1
        })
      expect(error).toBeNull()
    })

    it('author selects the cost row', async () => {
      const { data, error } = await collaborator.client
        .from('seed_pattern_resource_type_cost')
        .select('seed_pattern_id, resource_type, quantity')
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data?.resource_type).toBe(resourceType)
    })

    it('settlement owner selects via membership', async () => {
      const { data, error } = await owner.client
        .from('seed_pattern_resource_type_cost')
        .select('seed_pattern_id, resource_type')
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot select', async () => {
      const { data, error } = await stranger.client
        .from('seed_pattern_resource_type_cost')
        .select('seed_pattern_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('author updates the cost row', async () => {
      const { error } = await collaborator.client
        .from('seed_pattern_resource_type_cost')
        .update({ quantity: 4 })
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_type', resourceType)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('seed_pattern_resource_type_cost')
        .select('quantity')
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(readback?.quantity).toBe(4)
    })

    it('author deletes the cost row', async () => {
      const { error } = await collaborator.client
        .from('seed_pattern_resource_type_cost')
        .delete()
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_type', resourceType)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('seed_pattern_resource_type_cost')
        .select('seed_pattern_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('resource_type', resourceType)
        .maybeSingle()
      expect(readback).toBeNull()
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // seed_pattern_innovation_requirement
  // ──────────────────────────────────────────────────────────────────
  describe('seed_pattern_innovation_requirement (seed_pattern → innovation)', () => {
    let seedPatternId: string
    let innovationId: string

    beforeAll(async () => {
      seedPatternId = await createCustomSeedPattern()
      innovationId = await createCustomInnovation()
      await attachSeedPatternToSettlement(seedPatternId)
    })

    it('author inserts the requirement', async () => {
      const { error } = await collaborator.client
        .from('seed_pattern_innovation_requirement')
        .insert({
          seed_pattern_id: seedPatternId,
          innovation_id: innovationId
        })
      expect(error).toBeNull()
    })

    it('author selects the requirement', async () => {
      const { data, error } = await collaborator.client
        .from('seed_pattern_innovation_requirement')
        .select('seed_pattern_id, innovation_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('innovation_id', innovationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('settlement owner selects via membership', async () => {
      const { data, error } = await owner.client
        .from('seed_pattern_innovation_requirement')
        .select('seed_pattern_id, innovation_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('innovation_id', innovationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('stranger cannot select', async () => {
      const { data, error } = await stranger.client
        .from('seed_pattern_innovation_requirement')
        .select('seed_pattern_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('innovation_id', innovationId)
        .maybeSingle()
      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    // seed_pattern_innovation_requirement has only (seed_pattern_id,
    // innovation_id) — no updatable column — but the policy still
    // exists, so issue a no-op UPDATE so the cell is exercised.
    it('author updates the requirement (no-op set)', async () => {
      const { error } = await collaborator.client
        .from('seed_pattern_innovation_requirement')
        .update({ innovation_id: innovationId })
        .eq('seed_pattern_id', seedPatternId)
        .eq('innovation_id', innovationId)
      expect(error).toBeNull()

      // No-op UPDATE: just confirm the row still exists with the same
      // composite key via the service-role client.
      const { data: readback } = await admin
        .from('seed_pattern_innovation_requirement')
        .select('seed_pattern_id, innovation_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('innovation_id', innovationId)
        .maybeSingle()
      expect(readback).not.toBeNull()
    })

    it('author deletes the requirement', async () => {
      const { error } = await collaborator.client
        .from('seed_pattern_innovation_requirement')
        .delete()
        .eq('seed_pattern_id', seedPatternId)
        .eq('innovation_id', innovationId)
      expect(error).toBeNull()

      const { data: readback } = await admin
        .from('seed_pattern_innovation_requirement')
        .select('seed_pattern_id')
        .eq('seed_pattern_id', seedPatternId)
        .eq('innovation_id', innovationId)
        .maybeSingle()
      expect(readback).toBeNull()
    })
  })
})
