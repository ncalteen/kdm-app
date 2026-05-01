'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  CraftingAllocation,
  CraftingCostsSpec,
  ResourceType
} from '@/lib/crafting'
import { GearDetail, ResourceDetail, SettlementDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AlertCircleIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Craft Gear Dialog Properties
 */
export interface CraftGearDialogProps {
  /** Dialog Open State */
  open: boolean
  /** Dialog Open/Close Callback */
  onOpenChange: (open: boolean) => void
  /** Gear Being Added */
  gear: GearDetail | null
  /** Crafting Costs for the Gear */
  costs: CraftingCostsSpec
  /** Catalog of All Gear (used to display cost gear names) */
  gearCatalog: { [key: string]: GearDetail }
  /** Catalog of All Resources (used to display cost resource names/types) */
  resourceCatalog: { [key: string]: ResourceDetail }
  /** Settlement Gear Inventory (drives availability for gear costs) */
  settlementGear: SettlementDetail['gear']
  /** Settlement Resource Inventory (drives availability for resource costs) */
  settlementResources: SettlementDetail['resources']
  /**
   * Confirm Callback
   *
   * Invoked when the user confirms. `deductCosts` indicates whether the
   * supplied allocation should be applied; when `false`, the allocation is
   * empty and the caller should add the item without deducting anything.
   */
  onConfirm: (params: {
    deductCosts: boolean
    allocation: CraftingAllocation
  }) => void
}

/**
 * Per-Resource-Type Cost Allocation State
 *
 * Tracks how the user is splitting a single resource-type cost across
 * specific settlement_resource rows of the matching type.
 */
interface ResourceTypeAllocationState {
  /** Resource Type Required */
  resourceType: ResourceType
  /** Total Quantity Required */
  required: number
  /** Settlement Resource Row ID -> Quantity Allocated */
  allocations: { [settlementResourceId: string]: number }
}

/**
 * Craft Gear Dialog Component
 *
 * Optional crafting interface shown when adding gear that defines crafting
 * costs. The user can either:
 *
 * - Toggle the deduction off and add the gear without spending anything, or
 * - Allocate settlement gear/resources to satisfy each cost and confirm the
 *   craft, in which case the matching quantities are deducted.
 *
 * The dialog is intentionally agnostic to gear-specific details on the input
 * side: it consumes a generic {@link CraftingCostsSpec} so the same component
 * can be reused for patterns and seed patterns later.
 *
 * @param props Craft Gear Dialog Properties
 * @returns Craft Gear Dialog Component
 */
export function CraftGearDialog({
  open,
  onOpenChange,
  gear,
  costs,
  gearCatalog,
  resourceCatalog,
  settlementGear,
  settlementResources,
  onConfirm
}: CraftGearDialogProps): ReactElement {
  const [deductCosts, setDeductCosts] = useState<boolean>(true)

  // Allocations for resource-type costs (the only ones requiring user choice).
  // Initialized lazily from `costs`. Callers must remount this component (e.g.
  // via a `key` prop) when the cost spec changes so the state resets.
  const [resourceTypeAllocations, setResourceTypeAllocations] = useState<
    ResourceTypeAllocationState[]
  >(() =>
    costs.resourceTypeCosts.map((c) => ({
      resourceType: c.resourceType,
      required: c.quantity,
      allocations: {}
    }))
  )

  /**
   * Settlement Gear Lookup by Gear ID
   */
  const settlementGearByGearId = useMemo(() => {
    const map = new Map<string, SettlementDetail['gear'][0]>()
    for (const row of settlementGear) map.set(row.gear_id, row)
    return map
  }, [settlementGear])

  /**
   * Settlement Resources Indexed By Type
   *
   * For each resource type, the list of settlement_resource rows whose
   * underlying resource carries that type. A resource may match multiple
   * types and therefore appear in multiple buckets.
   */
  const settlementResourcesByType = useMemo(() => {
    const map = new Map<ResourceType, SettlementDetail['resources']>()
    for (const row of settlementResources) {
      for (const t of row.resource_types ?? []) {
        const list = map.get(t as ResourceType) ?? []
        list.push(row)
        map.set(t as ResourceType, list)
      }
    }
    for (const [k, list] of map)
      map.set(
        k,
        list.sort((a, b) => a.resource_name.localeCompare(b.resource_name))
      )
    return map
  }, [settlementResources])

  /**
   * Settlement Resource Lookup by Resource ID
   */
  const settlementResourceByResourceId = useMemo(() => {
    const map = new Map<string, SettlementDetail['resources'][0]>()
    for (const row of settlementResources) map.set(row.resource_id, row)
    return map
  }, [settlementResources])

  /**
   * Per-Settlement-Resource Quantity Already Pledged Across All Type Costs
   *
   * Used to clamp NumericInput max so the user cannot allocate more than the
   * remaining available units of a row across overlapping type costs.
   */
  const pledgedByResourceId = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of resourceTypeAllocations) {
      for (const [id, qty] of Object.entries(a.allocations)) {
        map.set(id, (map.get(id) ?? 0) + qty)
      }
    }
    return map
  }, [resourceTypeAllocations])

  /**
   * Gear Cost Validation Rows
   */
  const gearCostRows = useMemo(
    () =>
      costs.gearCosts.map((c) => {
        const gearInfo = gearCatalog[c.gearId]
        const settlementRow = settlementGearByGearId.get(c.gearId)
        const available = settlementRow?.quantity ?? 0
        return {
          gearId: c.gearId,
          gearName: gearInfo?.gear_name ?? 'Unknown Gear',
          required: c.quantity,
          available,
          settlementGearId: settlementRow?.id ?? null
        }
      }),
    [costs.gearCosts, gearCatalog, settlementGearByGearId]
  )

  /**
   * Resource Cost Validation Rows
   */
  const resourceCostRows = useMemo(
    () =>
      costs.resourceCosts.map((c) => {
        const resourceInfo = resourceCatalog[c.resourceId]
        const settlementRow = settlementResourceByResourceId.get(c.resourceId)
        const available = settlementRow?.quantity ?? 0
        return {
          resourceId: c.resourceId,
          resourceName: resourceInfo?.resource_name ?? 'Unknown Resource',
          required: c.quantity,
          available,
          settlementResourceId: settlementRow?.id ?? null
        }
      }),
    [costs.resourceCosts, resourceCatalog, settlementResourceByResourceId]
  )

  /**
   * Whether All Costs Can Be Satisfied
   */
  const canCraft = useMemo(() => {
    if (!deductCosts) return true

    for (const row of gearCostRows)
      if (row.available < row.required) return false
    for (const row of resourceCostRows)
      if (row.available < row.required) return false

    for (const a of resourceTypeAllocations) {
      const total = Object.values(a.allocations).reduce(
        (sum, q) => sum + (q || 0),
        0
      )
      if (total !== a.required) return false
    }
    return true
  }, [deductCosts, gearCostRows, resourceCostRows, resourceTypeAllocations])

  /**
   * Update Resource Type Allocation Quantity
   */
  const updateResourceTypeAllocation = useCallback(
    (
      resourceType: ResourceType,
      settlementResourceId: string,
      quantity: number
    ) => {
      setResourceTypeAllocations((prev) =>
        prev.map((a) => {
          if (a.resourceType !== resourceType) return a
          const next = { ...a.allocations }
          if (quantity <= 0) delete next[settlementResourceId]
          else next[settlementResourceId] = quantity
          return { ...a, allocations: next }
        })
      )
    },
    []
  )

  /**
   * Build Final Allocation From Current State
   */
  const buildAllocation = useCallback((): CraftingAllocation => {
    const gearDeductions = gearCostRows
      .filter((r) => r.settlementGearId !== null)
      .map((r) => ({
        settlementGearId: r.settlementGearId as string,
        quantity: r.required
      }))

    const resourceDeductions: CraftingAllocation['resourceDeductions'] = []
    for (const r of resourceCostRows) {
      if (r.settlementResourceId === null) continue
      resourceDeductions.push({
        settlementResourceId: r.settlementResourceId,
        quantity: r.required
      })
    }
    for (const a of resourceTypeAllocations) {
      for (const [settlementResourceId, quantity] of Object.entries(
        a.allocations
      )) {
        if (quantity > 0)
          resourceDeductions.push({ settlementResourceId, quantity })
      }
    }
    return { gearDeductions, resourceDeductions }
  }, [gearCostRows, resourceCostRows, resourceTypeAllocations])

  /**
   * Handle Confirm Action
   */
  const handleConfirm = useCallback(() => {
    if (deductCosts) {
      if (!canCraft) return
      onConfirm({ deductCosts: true, allocation: buildAllocation() })
    } else {
      onConfirm({
        deductCosts: false,
        allocation: { gearDeductions: [], resourceDeductions: [] }
      })
    }
  }, [deductCosts, canCraft, buildAllocation, onConfirm])

  if (!gear) return <></>

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Craft {gear.gear_name}</DialogTitle>
          <DialogDescription>
            Choose what to spend. Toggle off to add it without paying any cost.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="flex flex-col gap-0.5">
            <Label
              htmlFor="craft-deduct-toggle"
              className="text-sm font-medium">
              Deduct crafting costs
            </Label>
            <p className="text-xs text-muted-foreground">
              {deductCosts ? (
                <span>
                  Settlement gear/resources <b>will</b> be spent to craft this
                  item.
                </span>
              ) : (
                <span>
                  Settlement gear/resources <b>will not</b> be spent to craft
                  this item.
                </span>
              )}
            </p>
          </div>
          <Switch
            id="craft-deduct-toggle"
            checked={deductCosts}
            onCheckedChange={setDeductCosts}
          />
        </div>

        <div
          className={cn(
            'flex flex-col gap-4',
            !deductCosts && 'opacity-50 pointer-events-none'
          )}
          aria-disabled={!deductCosts}>
          {gearCostRows.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold">Gear Required</h4>
              <ul className="flex flex-col gap-1 text-sm">
                {gearCostRows.map((r) => {
                  const insufficient = r.available < r.required
                  return (
                    <li
                      key={r.gearId}
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                      <span className="truncate">{r.gearName}</span>
                      <span
                        className={cn(
                          'flex items-center gap-2 text-xs',
                          insufficient && 'text-destructive'
                        )}>
                        {insufficient && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircleIcon
                                className="h-3.5 w-3.5"
                                aria-label={`Settlement does not have enough ${r.gearName}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              The settlement does not have enough of this gear.
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Badge variant="outline">
                          {r.available} / {r.required}
                        </Badge>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {resourceCostRows.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold">Resources Required</h4>
              <ul className="flex flex-col gap-1 text-sm">
                {resourceCostRows.map((r) => {
                  const insufficient = r.available < r.required
                  return (
                    <li
                      key={r.resourceId}
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                      <span className="truncate">{r.resourceName}</span>
                      <span
                        className={cn(
                          'flex items-center gap-2 text-xs',
                          insufficient && 'text-destructive'
                        )}>
                        {insufficient && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircleIcon
                                className="h-3.5 w-3.5"
                                aria-label={`Settlement does not have enough ${r.resourceName}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              The settlement does not have enough of this
                              resource.
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Badge variant="outline">
                          {r.available} / {r.required}
                        </Badge>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {resourceTypeAllocations.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold">Resource Types Required</h4>
              <p className="text-xs text-muted-foreground">
                Allocate from your stores to meet each requirement exactly.
              </p>
              <ul className="flex flex-col gap-3">
                {resourceTypeAllocations.map((a) => {
                  const candidates =
                    settlementResourcesByType.get(a.resourceType) ?? []
                  const allocated = Object.values(a.allocations).reduce(
                    (sum, q) => sum + (q || 0),
                    0
                  )
                  const insufficient = allocated !== a.required
                  return (
                    <li
                      key={a.resourceType}
                      className="flex flex-col gap-2 rounded-md border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {a.resourceType}
                        </span>
                        <span
                          className={cn(
                            'flex items-center gap-2 text-xs',
                            insufficient && 'text-destructive'
                          )}>
                          {insufficient && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertCircleIcon
                                  className="h-3.5 w-3.5"
                                  aria-label={`Allocate ${a.required} ${a.resourceType} resources`}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                Allocate exactly {a.required} resource
                                {a.required === 1 ? '' : 's'} from the
                                settlement to craft this item.
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Badge variant="outline">
                            {allocated} / {a.required}
                          </Badge>
                        </span>
                      </div>

                      {candidates.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No matching resources in storage.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {candidates.map((row) => {
                            const currentForRow = a.allocations[row.id] ?? 0
                            const pledgedElsewhere =
                              (pledgedByResourceId.get(row.id) ?? 0) -
                              currentForRow
                            const remainingAvailable = Math.max(
                              0,
                              row.quantity - pledgedElsewhere
                            )
                            const max = Math.min(remainingAvailable, a.required)
                            return (
                              <div
                                key={row.id}
                                className="flex items-center gap-2 text-sm">
                                <span className="truncate flex-1">
                                  {row.resource_name}
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    ({row.quantity} on hand)
                                  </span>
                                </span>
                                <NumericInput
                                  className="w-20"
                                  label={`Allocate ${row.resource_name}`}
                                  min={0}
                                  max={max}
                                  value={currentForRow}
                                  onChange={(value) =>
                                    updateResourceTypeAllocation(
                                      a.resourceType,
                                      row.id,
                                      value
                                    )
                                  }
                                />
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={deductCosts && !canCraft}>
            {deductCosts ? 'Craft & Deduct' : 'Add Without Cost'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
