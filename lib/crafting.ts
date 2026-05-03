import { Database } from '@/lib/database.types'
import {
  GearDetail,
  GearGearCostDetail,
  GearResourceCostDetail,
  GearResourceTypeCostDetail,
  PatternDetail,
  PatternGearCostDetail,
  PatternResourceCostDetail,
  PatternResourceTypeCostDetail,
  SeedPatternDetail,
  SeedPatternGearCostDetail,
  SettlementDetail
} from '@/lib/types'

/**
 * Resource Type
 *
 * Resource type enum value as defined by the database. Used here as the
 * canonical type for resource-type crafting costs.
 */
export type ResourceType = Database['public']['Enums']['resource_type']

/**
 * Crafting Costs Specification
 *
 * Generic, item-agnostic representation of the cost to craft a single unit of
 * an item (gear, pattern, seed pattern, etc.). All quantities are per craft.
 */
export interface CraftingCostsSpec {
  /** Specific Gear Items Required (ID + Quantity) */
  gearCosts: { gearId: string; quantity: number }[]
  /** Specific Resource Items Required (ID + Quantity) */
  resourceCosts: { resourceId: string; quantity: number }[]
  /** Resource Types Required (Type + Quantity) */
  resourceTypeCosts: { resourceType: ResourceType; quantity: number }[]
}

/**
 * Crafting Resource Allocation
 *
 * A single allocation entry indicating how much of a settlement resource row to
 * spend toward satisfying a crafting cost. Used both for direct resource costs
 * and for resource-type costs (where the user selects which specific
 * resource(s) to draw from).
 */
export interface CraftingResourceAllocation {
  /** Settlement Resource Row ID */
  settlementResourceId: string
  /** Quantity to Deduct */
  quantity: number
}

/**
 * Crafting Gear Allocation
 *
 * A single allocation entry indicating how much of a settlement gear row to
 * spend toward satisfying a gear-cost requirement.
 */
export interface CraftingGearAllocation {
  /** Settlement Gear Row ID */
  settlementGearId: string
  /** Quantity to Deduct */
  quantity: number
}

/**
 * Crafting Allocation
 *
 * The user's chosen distribution of settlement gear/resources to satisfy a
 * {@link CraftingCostsSpec}. The dialog produces this. The caller applies it
 * via {@link applyCraftingAllocationToSettlementState} and the matching DAL
 * mutations.
 */
export interface CraftingAllocation {
  /** Gear Deductions */
  gearDeductions: CraftingGearAllocation[]
  /** Resource Deductions */
  resourceDeductions: CraftingResourceAllocation[]
  /**
   * Endeavor Deduction
   *
   * Total endeavors to deduct from the settlement phase. Always 0 when the
   * caller chose to add the item without spending costs, when the item has no
   * endeavor cost, or when the settlement is not currently in a settlement
   * phase. Endeavors live on `settlement_phase`, so callers must persist this
   * via the settlement phase DAL rather than
   * {@link applyCraftingAllocationToSettlementState}.
   */
  endeavorDeduction: number
}

/**
 * Empty Crafting Costs
 *
 * Convenience helper returning a {@link CraftingCostsSpec} with no costs.
 *
 * @returns Empty Crafting Costs Spec
 */
export function emptyCraftingCosts(): CraftingCostsSpec {
  return { gearCosts: [], resourceCosts: [], resourceTypeCosts: [] }
}

/**
 * Has Crafting Costs
 *
 * Indicates whether the spec defines any non-empty cost.
 *
 * @param spec Crafting Costs Spec
 * @returns True if Cost is Present
 */
export function hasCraftingCosts(spec: CraftingCostsSpec): boolean {
  return (
    spec.gearCosts.length > 0 ||
    spec.resourceCosts.length > 0 ||
    spec.resourceTypeCosts.length > 0
  )
}

/**
 * Gear To Crafting Costs Spec
 *
 * Normalizes the cost junction arrays on a {@link GearDetail} into the generic
 * {@link CraftingCostsSpec} shape. Quantities below 1 are dropped.
 *
 * @param gear Gear Detail
 * @returns Crafting Costs Spec
 */
export function gearToCraftingCostsSpec(gear: GearDetail): CraftingCostsSpec {
  return {
    // Flatten the gear_costs junction array into the generic {gearId, quantity}
    // shape, dropping entries with missing IDs or quantities below 1
    gearCosts: (gear.gear_costs ?? [])
      .filter(
        (c: GearGearCostDetail) => !!c.cost_gear_id && (c.quantity ?? 0) >= 1
      )
      .map((c: GearGearCostDetail) => ({
        gearId: c.cost_gear_id,
        quantity: c.quantity
      })),
    // Flatten the resource_costs junction array into the generic
    // {resourceId, quantity} shape, dropping entries with missing IDs or
    // quantities below 1
    resourceCosts: (gear.resource_costs ?? [])
      .filter(
        (c: GearResourceCostDetail) => !!c.resource_id && (c.quantity ?? 0) >= 1
      )
      .map((c: GearResourceCostDetail) => ({
        resourceId: c.resource_id,
        quantity: c.quantity
      })),
    // Flatten the resource_type_costs junction array into the generic
    // {resourceType, quantity} shape, dropping entries with missing IDs or
    // quantities below 1
    resourceTypeCosts: (gear.resource_type_costs ?? [])
      .filter(
        (c: GearResourceTypeCostDetail) =>
          !!c.resource_type && (c.quantity ?? 0) >= 1
      )
      .map((c: GearResourceTypeCostDetail) => ({
        resourceType: c.resource_type,
        quantity: c.quantity
      }))
  }
}

/**
 * Apply Crafting Allocation To Settlement State
 *
 * Returns a new gear/resource list pair with the allocation deducted. Pure
 * function; suitable for optimistic state updates. Rows whose remaining
 * quantity reaches zero remain in the list (their quantity is just zero) so the
 * user can refill them later, mirroring the manual quantity controls in the
 * existing UI.
 *
 * @param allocation Crafting Allocation
 * @param gear Current Settlement Gear Rows
 * @param resources Current Settlement Resource Rows
 * @returns Updated Gear and Resource Rows
 */
export function applyCraftingAllocationToSettlementState(
  allocation: CraftingAllocation,
  gear: SettlementDetail['gear'],
  resources: SettlementDetail['resources']
): {
  gear: SettlementDetail['gear']
  resources: SettlementDetail['resources']
} {
  const gearDeductionsById = new Map<string, number>()
  const resourceDeductionsById = new Map<string, number>()

  for (const d of allocation.gearDeductions)
    gearDeductionsById.set(
      d.settlementGearId,
      (gearDeductionsById.get(d.settlementGearId) ?? 0) + d.quantity
    )

  for (const d of allocation.resourceDeductions)
    resourceDeductionsById.set(
      d.settlementResourceId,
      (resourceDeductionsById.get(d.settlementResourceId) ?? 0) + d.quantity
    )

  return {
    gear: gear.map((row) => {
      const dec = gearDeductionsById.get(row.id) ?? 0

      if (dec === 0) return row

      return { ...row, quantity: Math.max(0, row.quantity - dec) }
    }),
    resources: resources.map((row) => {
      const dec = resourceDeductionsById.get(row.id) ?? 0

      if (dec === 0) return row

      return { ...row, quantity: Math.max(0, row.quantity - dec) }
    })
  }
}

/**
 * Pattern To Crafting Costs Spec
 *
 * Normalizes the cost junction arrays on a {@link PatternDetail} into the
 * generic {@link CraftingCostsSpec} shape. Quantities below 1 are dropped.
 *
 * @param pattern Pattern Detail
 * @returns Crafting Costs Spec
 */
export function patternToCraftingCostsSpec(
  pattern: PatternDetail
): CraftingCostsSpec {
  return {
    gearCosts: (pattern.gear_costs ?? [])
      .filter(
        (c: PatternGearCostDetail) => !!c.cost_gear_id && (c.quantity ?? 0) >= 1
      )
      .map((c: PatternGearCostDetail) => ({
        gearId: c.cost_gear_id,
        quantity: c.quantity
      })),
    resourceCosts: (pattern.resource_costs ?? [])
      .filter(
        (c: PatternResourceCostDetail) =>
          !!c.resource_id && (c.quantity ?? 0) >= 1
      )
      .map((c: PatternResourceCostDetail) => ({
        resourceId: c.resource_id,
        quantity: c.quantity
      })),
    resourceTypeCosts: (pattern.resource_type_costs ?? [])
      .filter(
        (c: PatternResourceTypeCostDetail) =>
          !!c.resource_type && (c.quantity ?? 0) >= 1
      )
      .map((c: PatternResourceTypeCostDetail) => ({
        resourceType: c.resource_type,
        quantity: c.quantity
      }))
  }
}

/**
 * Seed Pattern To Crafting Costs Spec
 *
 * Normalizes the gear cost junction array on a {@link SeedPatternDetail} into
 * the generic {@link CraftingCostsSpec} shape. Quantities below 1 are dropped.
 * Resource and resource-type costs are not currently exposed on
 * {@link SeedPatternDetail}; when added later, this helper will need to mirror
 * {@link patternToCraftingCostsSpec}.
 *
 * @param seedPattern Seed Pattern Detail
 * @returns Crafting Costs Spec
 */
export function seedPatternToCraftingCostsSpec(
  seedPattern: SeedPatternDetail
): CraftingCostsSpec {
  return {
    gearCosts: (seedPattern.gear_costs ?? [])
      .filter(
        (c: SeedPatternGearCostDetail) =>
          !!c.cost_gear_id && (c.quantity ?? 0) >= 1
      )
      .map((c: SeedPatternGearCostDetail) => ({
        gearId: c.cost_gear_id,
        quantity: c.quantity
      })),
    resourceCosts: [],
    resourceTypeCosts: []
  }
}

/**
 * Are Crafting Costs Affordable
 *
 * Best-effort check that a settlement currently has enough gear/resources to
 * satisfy the spec. Returns false when any specific gear/resource is short, or
 * when any resource-type total cannot be covered by the sum of matching
 * settlement_resource quantities. Does *not* solve the bin-packing problem
 * across overlapping types, so it errs toward optimistic when a single
 * settlement_resource row's quantity is shared across multiple type costs.
 *
 * @param spec Crafting Costs Spec
 * @param gear Settlement Gear Rows
 * @param resources Settlement Resource Rows
 * @returns True if every cost can be met from the settlement's stores
 */
export function areCraftingCostsAffordable(
  spec: CraftingCostsSpec,
  gear: SettlementDetail['gear'],
  resources: SettlementDetail['resources']
): boolean {
  const gearByGearId = new Map<string, number>()
  for (const row of gear)
    gearByGearId.set(
      row.gear_id,
      (gearByGearId.get(row.gear_id) ?? 0) + row.quantity
    )

  for (const c of spec.gearCosts)
    if ((gearByGearId.get(c.gearId) ?? 0) < c.quantity) return false

  const resourceByResourceId = new Map<string, number>()
  for (const row of resources)
    resourceByResourceId.set(
      row.resource_id,
      (resourceByResourceId.get(row.resource_id) ?? 0) + row.quantity
    )

  for (const c of spec.resourceCosts)
    if ((resourceByResourceId.get(c.resourceId) ?? 0) < c.quantity) return false

  if (spec.resourceTypeCosts.length > 0) {
    const totalsByType = new Map<ResourceType, number>()
    for (const row of resources) {
      for (const t of row.resource_types ?? []) {
        const key = t as ResourceType
        totalsByType.set(key, (totalsByType.get(key) ?? 0) + row.quantity)
      }
    }
    for (const c of spec.resourceTypeCosts)
      if ((totalsByType.get(c.resourceType) ?? 0) < c.quantity) return false
  }

  return true
}

/**
 * Format Resource Type Label
 *
 * Converts a database resource type enum value (e.g. `'BONE'`, `'ORGAN'`) into
 * a human-friendly title-cased label (e.g. `'Bone'`, `'Organ'`).
 *
 * @param resourceType Resource Type Enum Value
 * @returns Display Label
 */
function formatResourceTypeLabel(resourceType: ResourceType): string {
  const text = String(resourceType)
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Format Crafting Costs For Display
 *
 * Renders a {@link CraftingCostsSpec} as a markdown bullet list suitable for
 * the custom rules sheet. Resolves gear and resource IDs to their display
 * names when catalogs are provided. Returns `null` when the spec defines no
 * costs.
 *
 * @param spec Crafting Costs Spec
 * @param options Catalog Lookups
 * @returns Markdown String, or `null` When No Costs Are Defined
 */
export function formatCraftingCostsForDisplay(
  spec: CraftingCostsSpec,
  options: {
    /** Gear Catalog Keyed by Gear ID */
    gearCatalog?: { [id: string]: { gear_name: string } | undefined }
    /** Resource Catalog Keyed by Resource ID */
    resourceCatalog?: { [id: string]: { resource_name: string } | undefined }
  } = {}
): string | null {
  if (!hasCraftingCosts(spec)) return null

  const lines: string[] = []

  if (spec.gearCosts.length > 0) {
    const parts = spec.gearCosts.map((c) => {
      const name = options.gearCatalog?.[c.gearId]?.gear_name ?? 'Unknown Gear'
      return `${c.quantity}× ${name}`
    })
    lines.push(`- **Required Gear:** ${parts.join(', ')}`)
  }

  if (spec.resourceCosts.length > 0) {
    const parts = spec.resourceCosts.map((c) => {
      const name =
        options.resourceCatalog?.[c.resourceId]?.resource_name ??
        'Unknown Resource'
      return `${c.quantity}× ${name}`
    })
    lines.push(`- **Required Resources:** ${parts.join(', ')}`)
  }

  if (spec.resourceTypeCosts.length > 0) {
    const parts = spec.resourceTypeCosts.map(
      (c) => `${c.quantity}× ${formatResourceTypeLabel(c.resourceType)}`
    )
    lines.push(`- **Required Resource Types:** ${parts.join(', ')}`)
  }

  return lines.join('\n')
}
