import { Database } from '@/lib/database.types'
import {
  GearDetail,
  GearGearCostDetail,
  GearResourceCostDetail,
  GearResourceTypeCostDetail,
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
