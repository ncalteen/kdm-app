import {
  applyCraftingAllocationToSettlementState,
  areCraftingCostsAffordable,
  emptyCraftingCosts,
  formatCraftingCostsForDisplay,
  gearToCraftingCostsSpec,
  hasCraftingCosts,
  patternToCraftingCostsSpec,
  seedPatternToCraftingCostsSpec
} from '@/lib/crafting'
import {
  GearDetail,
  PatternDetail,
  SeedPatternDetail,
  SettlementDetail
} from '@/lib/types'
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
        ],
        endeavorDeduction: 0
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
        ],
        endeavorDeduction: 0
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
      { gearDeductions: [], resourceDeductions: [], endeavorDeduction: 0 },
      gear,
      resources
    )

    expect(result.gear[0]).toBe(gear[0])
    expect(result.resources[0]).toBe(resources[0])
  })
})

/**
 * Build a minimal {@link PatternDetail} stub with only the fields the crafting
 * helpers consume.
 */
function makePattern(overrides: Partial<PatternDetail> = {}): PatternDetail {
  return {
    custom: false,
    crafted_gear_id: null,
    crafting_limit: null,
    crafting_steps: null,
    endeavor_cost: null,
    era: null,
    gear_costs: [],
    id: 'p1',
    innovation_requirement_ids: [],
    keywords: [],
    pattern_name: 'Pattern',
    requirements: null,
    resource_costs: [],
    resource_type_costs: [],
    ...overrides
  } as unknown as PatternDetail
}

/**
 * Build a minimal {@link SeedPatternDetail} stub with only the fields the
 * crafting helpers consume.
 */
function makeSeedPattern(
  overrides: Partial<SeedPatternDetail> = {}
): SeedPatternDetail {
  return {
    custom: false,
    crafted_gear_id: null,
    crafting_limit: null,
    crafting_steps: null,
    endeavor_cost: null,
    era: null,
    gear_costs: [],
    id: 'sp1',
    keywords: [],
    requirements: null,
    seed_pattern_name: 'Seed',
    ...overrides
  } as unknown as SeedPatternDetail
}

describe('patternToCraftingCostsSpec', () => {
  it('flattens junction arrays and drops zero/missing entries', () => {
    const spec = patternToCraftingCostsSpec(
      makePattern({
        gear_costs: [
          { cost_gear_id: 'g1', quantity: 2 },
          { cost_gear_id: '', quantity: 1 },
          { cost_gear_id: 'g2', quantity: 0 }
        ],
        resource_costs: [
          { resource_id: 'r1', quantity: 3 },
          { resource_id: 'r2', quantity: 0 }
        ],
        resource_type_costs: [
          { resource_type: 'BONE', quantity: 1 },
          { resource_type: 'STONE', quantity: 0 }
        ]
      })
    )

    expect(spec.gearCosts).toEqual([{ gearId: 'g1', quantity: 2 }])
    expect(spec.resourceCosts).toEqual([{ resourceId: 'r1', quantity: 3 }])
    expect(spec.resourceTypeCosts).toEqual([
      { resourceType: 'BONE', quantity: 1 }
    ])
  })

  it('returns empty arrays for a pattern with no costs', () => {
    expect(patternToCraftingCostsSpec(makePattern())).toEqual({
      gearCosts: [],
      resourceCosts: [],
      resourceTypeCosts: []
    })
  })
})

describe('seedPatternToCraftingCostsSpec', () => {
  it('flattens gear costs and drops zero/missing entries', () => {
    const spec = seedPatternToCraftingCostsSpec(
      makeSeedPattern({
        gear_costs: [
          { cost_gear_id: 'g1', quantity: 2 },
          { cost_gear_id: '', quantity: 5 },
          { cost_gear_id: 'g2', quantity: 0 }
        ]
      })
    )

    expect(spec.gearCosts).toEqual([{ gearId: 'g1', quantity: 2 }])
    expect(spec.resourceCosts).toEqual([])
    expect(spec.resourceTypeCosts).toEqual([])
  })

  it('returns empty arrays for a seed pattern with no costs', () => {
    expect(seedPatternToCraftingCostsSpec(makeSeedPattern())).toEqual({
      gearCosts: [],
      resourceCosts: [],
      resourceTypeCosts: []
    })
  })
})

describe('areCraftingCostsAffordable', () => {
  it('returns true when the spec has no costs', () => {
    expect(areCraftingCostsAffordable(emptyCraftingCosts(), [], [])).toBe(true)
  })

  it('aggregates multiple settlement rows that share a gear ID', () => {
    const gear = makeSettlementGear([
      { id: 'sg-1', gear_id: 'g1', quantity: 1 },
      { id: 'sg-2', gear_id: 'g1', quantity: 2 }
    ])
    expect(
      areCraftingCostsAffordable(
        {
          gearCosts: [{ gearId: 'g1', quantity: 3 }],
          resourceCosts: [],
          resourceTypeCosts: []
        },
        gear,
        []
      )
    ).toBe(true)
  })

  it('returns false when a gear cost cannot be met', () => {
    const gear = makeSettlementGear([
      { id: 'sg-1', gear_id: 'g1', quantity: 1 }
    ])
    expect(
      areCraftingCostsAffordable(
        {
          gearCosts: [{ gearId: 'g1', quantity: 2 }],
          resourceCosts: [],
          resourceTypeCosts: []
        },
        gear,
        []
      )
    ).toBe(false)
  })

  it('returns false when a resource cost cannot be met', () => {
    const resources = makeSettlementResources([
      { id: 'sr-1', resource_id: 'r1', quantity: 1 }
    ])
    expect(
      areCraftingCostsAffordable(
        {
          gearCosts: [],
          resourceCosts: [{ resourceId: 'r1', quantity: 5 }],
          resourceTypeCosts: []
        },
        [],
        resources
      )
    ).toBe(false)
  })

  it('checks resource-type totals across matching settlement rows', () => {
    const resources = makeSettlementResources([
      { id: 'sr-1', resource_id: 'r1', quantity: 1, resource_types: ['BONE'] },
      {
        id: 'sr-2',
        resource_id: 'r2',
        quantity: 2,
        resource_types: ['BONE', 'STONE']
      }
    ])

    expect(
      areCraftingCostsAffordable(
        {
          gearCosts: [],
          resourceCosts: [],
          resourceTypeCosts: [{ resourceType: 'BONE', quantity: 3 }]
        },
        [],
        resources
      )
    ).toBe(true)

    expect(
      areCraftingCostsAffordable(
        {
          gearCosts: [],
          resourceCosts: [],
          resourceTypeCosts: [{ resourceType: 'BONE', quantity: 4 }]
        },
        [],
        resources
      )
    ).toBe(false)
  })
})

describe('formatCraftingCostsForDisplay', () => {
  it('returns null when the spec has no costs', () => {
    expect(formatCraftingCostsForDisplay(emptyCraftingCosts())).toBeNull()
  })

  it('renders gear, resource, and resource-type sections with catalogs', () => {
    const result = formatCraftingCostsForDisplay(
      {
        gearCosts: [
          { gearId: 'g1', quantity: 2 },
          { gearId: 'g2', quantity: 1 }
        ],
        resourceCosts: [{ resourceId: 'r1', quantity: 3 }],
        resourceTypeCosts: [
          { resourceType: 'BONE', quantity: 2 },
          { resourceType: 'STONE', quantity: 1 }
        ]
      },
      {
        gearCatalog: {
          g1: { gear_name: 'Bone Sword' },
          g2: { gear_name: 'Cloth' }
        },
        resourceCatalog: {
          r1: { resource_name: 'Bone' }
        }
      }
    )

    expect(result).toBe(
      '- **Required Gear:** 2× Bone Sword, 1× Cloth\n' +
        '- **Required Resources:** 3× Bone\n' +
        '- **Required Resource Types:** 2× Bone, 1× Stone'
    )
  })

  it('falls back to "Unknown" labels when catalogs are missing', () => {
    const result = formatCraftingCostsForDisplay({
      gearCosts: [{ gearId: 'g1', quantity: 1 }],
      resourceCosts: [{ resourceId: 'r1', quantity: 1 }],
      resourceTypeCosts: []
    })

    expect(result).toBe(
      '- **Required Gear:** 1× Unknown Gear\n' +
        '- **Required Resources:** 1× Unknown Resource'
    )
  })

  it('omits sections with no entries', () => {
    const result = formatCraftingCostsForDisplay(
      {
        gearCosts: [],
        resourceCosts: [],
        resourceTypeCosts: [{ resourceType: 'HIDE', quantity: 2 }]
      },
      {}
    )

    expect(result).toBe('- **Required Resource Types:** 2× Hide')
  })
})
