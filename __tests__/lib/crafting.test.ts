import {
  applyCraftingAllocationToSettlementState,
  emptyCraftingCosts,
  gearToCraftingCostsSpec,
  hasCraftingCosts
} from '@/lib/crafting'
import { GearDetail, SettlementDetail } from '@/lib/types'
import { describe, expect, it } from 'vitest'

/**
 * Build a minimal {@link GearDetail} stub with only the fields the crafting
 * helpers consume, casting to the full type so call sites stay readable.
 */
function makeGear(overrides: Partial<GearDetail> = {}): GearDetail {
  return {
    affinity_bonus_requirements: [],
    gear_costs: [],
    resource_costs: [],
    resource_type_costs: [],
    ...overrides
  } as unknown as GearDetail
}

function makeSettlementGear(
  rows: Partial<SettlementDetail['gear'][0]>[]
): SettlementDetail['gear'] {
  return rows.map(
    (r) =>
      ({
        custom: false,
        gear_id: 'g',
        gear_name: 'g',
        id: 'sg',
        quantity: 0,
        ...r
      }) as SettlementDetail['gear'][0]
  )
}

function makeSettlementResources(
  rows: Partial<SettlementDetail['resources'][0]>[]
): SettlementDetail['resources'] {
  return rows.map(
    (r) =>
      ({
        category: 'BASIC',
        id: 'sr',
        quantity: 0,
        quarry_id: null,
        quarry_monster_name: null,
        quarry_node: null,
        resource_id: 'r',
        resource_name: 'r',
        resource_types: [],
        ...r
      }) as SettlementDetail['resources'][0]
  )
}

describe('emptyCraftingCosts', () => {
  it('returns an empty spec', () => {
    expect(emptyCraftingCosts()).toEqual({
      gearCosts: [],
      resourceCosts: [],
      resourceTypeCosts: []
    })
  })
})

describe('hasCraftingCosts', () => {
  it('returns false for an empty spec', () => {
    expect(hasCraftingCosts(emptyCraftingCosts())).toBe(false)
  })

  it('returns true when any cost is present', () => {
    expect(
      hasCraftingCosts({
        gearCosts: [{ gearId: 'g1', quantity: 1 }],
        resourceCosts: [],
        resourceTypeCosts: []
      })
    ).toBe(true)
    expect(
      hasCraftingCosts({
        gearCosts: [],
        resourceCosts: [{ resourceId: 'r1', quantity: 1 }],
        resourceTypeCosts: []
      })
    ).toBe(true)
    expect(
      hasCraftingCosts({
        gearCosts: [],
        resourceCosts: [],
        resourceTypeCosts: [{ resourceType: 'BONE', quantity: 2 }]
      })
    ).toBe(true)
  })
})

describe('gearToCraftingCostsSpec', () => {
  it('flattens junction arrays and drops zero/missing entries', () => {
    const spec = gearToCraftingCostsSpec(
      makeGear({
        gear_costs: [
          { cost_gear_id: 'g1', quantity: 2 },
          { cost_gear_id: '', quantity: 1 },
          { cost_gear_id: 'g2', quantity: 0 }
        ],
        resource_costs: [
          { resource_id: 'r1', quantity: 1 },
          { resource_id: 'r2', quantity: 0 }
        ],
        resource_type_costs: [
          { resource_type: 'BONE', quantity: 3 },
          { resource_type: 'STONE', quantity: 0 }
        ]
      })
    )

    expect(spec.gearCosts).toEqual([{ gearId: 'g1', quantity: 2 }])
    expect(spec.resourceCosts).toEqual([{ resourceId: 'r1', quantity: 1 }])
    expect(spec.resourceTypeCosts).toEqual([
      { resourceType: 'BONE', quantity: 3 }
    ])
  })

  it('returns empty arrays for gear with no costs', () => {
    expect(gearToCraftingCostsSpec(makeGear())).toEqual({
      gearCosts: [],
      resourceCosts: [],
      resourceTypeCosts: []
    })
  })
})

describe('applyCraftingAllocationToSettlementState', () => {
  it('deducts allocated quantities and clamps at zero', () => {
    const gear = makeSettlementGear([
      { id: 'sg-1', gear_id: 'g1', gear_name: 'A', quantity: 3 },
      { id: 'sg-2', gear_id: 'g2', gear_name: 'B', quantity: 1 }
    ])
    const resources = makeSettlementResources([
      { id: 'sr-1', resource_id: 'r1', resource_name: 'X', quantity: 5 },
      { id: 'sr-2', resource_id: 'r2', resource_name: 'Y', quantity: 2 }
    ])

    const result = applyCraftingAllocationToSettlementState(
      {
        gearDeductions: [{ settlementGearId: 'sg-1', quantity: 2 }],
        resourceDeductions: [
          { settlementResourceId: 'sr-1', quantity: 4 },
          { settlementResourceId: 'sr-2', quantity: 5 }
        ]
      },
      gear,
      resources
    )

    expect(result.gear.find((g) => g.id === 'sg-1')?.quantity).toBe(1)
    expect(result.gear.find((g) => g.id === 'sg-2')?.quantity).toBe(1)
    expect(result.resources.find((r) => r.id === 'sr-1')?.quantity).toBe(1)
    // Clamped at 0 even though deduction (5) exceeds available (2).
    expect(result.resources.find((r) => r.id === 'sr-2')?.quantity).toBe(0)
  })

  it('aggregates multiple deductions targeting the same row', () => {
    const resources = makeSettlementResources([
      { id: 'sr-1', resource_id: 'r1', resource_name: 'X', quantity: 5 }
    ])

    const result = applyCraftingAllocationToSettlementState(
      {
        gearDeductions: [],
        resourceDeductions: [
          { settlementResourceId: 'sr-1', quantity: 2 },
          { settlementResourceId: 'sr-1', quantity: 1 }
        ]
      },
      [],
      resources
    )

    expect(result.resources[0].quantity).toBe(2)
  })

  it('returns the original rows unchanged when no allocation matches', () => {
    const gear = makeSettlementGear([
      { id: 'sg-1', gear_id: 'g1', gear_name: 'A', quantity: 3 }
    ])
    const resources = makeSettlementResources([
      { id: 'sr-1', resource_id: 'r1', resource_name: 'X', quantity: 5 }
    ])

    const result = applyCraftingAllocationToSettlementState(
      { gearDeductions: [], resourceDeductions: [] },
      gear,
      resources
    )

    expect(result.gear[0]).toBe(gear[0])
    expect(result.resources[0]).toBe(resources[0])
  })
})
