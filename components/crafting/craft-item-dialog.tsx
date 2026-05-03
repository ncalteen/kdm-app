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
import {
  GearDetail,
  ResourceDetail,
  SettlementDetail,
  SettlementPhaseDetail
} from '@/lib/types'
import { cn, normalizeResourceTypeName } from '@/lib/utils'
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CircleAlertIcon
} from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Innovation Requirement
 *
 * Used to render an extra "Innovations Required" checklist above the cost
 * sections. Each entry indicates whether the settlement currently satisfies the
 * requirement.
 */
export interface CraftInnovationRequirement {
  /** Innovation Display Name */
  innovation_name: string
  /** Settlement has the Innovation */
  met: boolean
}

/**
 * Crafting Limit Hint
 *
 * Read-only display + gating data for items that may only be crafted a fixed
 * number of times per settlement (e.g. patterns).
 */
export interface CraftingLimitHint {
  /** Total Times the Item May Be Crafted (null = unlimited) */
  total: number | null
  /** Times the Item Has Already Been Crafted (best-effort) */
  used: number | null
}

/**
 * Craft Item Dialog Properties
 *
 * Generic crafting confirmation flow shared across gear, patterns, and seed
 * patterns. The dialog is always displaying *the gear that will be added*, even
 * when the trigger was a pattern or seed pattern. Innovations are surfaced as
 * advisory information, while gear, resource, and endeavor costs are
 * auto-deducted when the user confirms the craft. Because endeavors live on
 * the settlement phase, items with an endeavor cost cannot deduct that cost
 * unless a settlement phase currently exists; in that situation the user can
 * still craft the item by toggling the deduction off, which adds the gear
 * without spending anything.
 */
export interface CraftItemDialogProps {
  /** Dialog Open State */
  open: boolean
  /** Dialog Open/Close Callback */
  onOpenChange: (open: boolean) => void
  /**
   * Title
   *
   * E.g. "Craft Lantern Sword"
   */
  title: string
  /**
   * Optional Source Label
   *
   * E.g. "From: Lantern Sword Pattern"
   */
  sourceLabel?: string | null
  /** Gear to Craft */
  targetGear: GearDetail | null
  /** Crafting Costs Required */
  costs: CraftingCostsSpec
  /**
   * Catalog of All Gear
   *
   * Used to display cost gear names
   */
  gearCatalog: { [key: string]: GearDetail }
  /**
   * Catalog of All Resources
   *
   * Used to display cost resource names/types
   */
  resourceCatalog: { [key: string]: ResourceDetail }
  /**
   * Settlement Gear Inventory
   *
   * Drives availability for gear costs
   */
  settlementGear: SettlementDetail['gear']
  /**
   * Settlement Resource Inventory
   *
   * Drives availability for resource costs
   */
  settlementResources: SettlementDetail['resources']
  /** Innovation Requirements (advisory + gating) */
  innovationRequirements?: CraftInnovationRequirement[]
  /**
   * Endeavor Cost
   *
   * Auto-deducted from the settlement phase when present
   */
  endeavorCost?: number | null
  /**
   * Active Settlement Phase
   *
   * Source of available endeavors and target of the endeavor deduction. When
   * `endeavorCost > 0` and this is `null`, the dialog blocks the confirm action
   * while the deduction toggle is on. The user can still craft the item by
   * toggling the deduction off, in which case nothing is spent.
   */
  settlementPhase?: SettlementPhaseDetail | null
  /** Crafting Limit (advisory + gating when used >= total) */
  craftingLimit?: CraftingLimitHint | null
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
 * Tracks how the user is splitting a single resource-type cost across specific
 * settlement_resource rows of the matching type.
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
 * Craft Item Dialog Component
 *
 * Optional crafting interface shown when adding gear (directly or via a pattern
 * or seed pattern) that defines crafting costs. The user can:
 *
 * - Toggle the deduction off and add the gear without spending anything, or
 * - Allocate settlement gear/resources to satisfy each cost and confirm the
 *   craft, in which case the matching quantities are deducted alongside any
 *   endeavor cost.
 *
 * Innovation prerequisites are surfaced as read-only advisory information and
 * gate the confirm button when not met. Endeavor costs are auto-deducted from
 * the active settlement phase; if a settlement phase does not exist and the
 * item has an endeavor cost, the confirm action is blocked while the deduction
 * toggle is on. Toggling the deduction off lets the user bypass the missing
 * phase and add the gear without spending anything.
 *
 * @param props Craft Item Dialog Properties
 * @returns Craft Item Dialog Component
 */
export function CraftItemDialog({
  open,
  onOpenChange,
  title,
  sourceLabel,
  targetGear,
  costs,
  gearCatalog,
  resourceCatalog,
  settlementGear,
  settlementResources,
  innovationRequirements,
  endeavorCost,
  settlementPhase,
  craftingLimit,
  onConfirm
}: CraftItemDialogProps): ReactElement {
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
   * underlying resource carries that type. A resource may match multiple types
   * and therefore appear in multiple buckets.
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
   */
  const pledgedByResourceId = useMemo(() => {
    const map = new Map<string, number>()

    for (const a of resourceTypeAllocations)
      for (const [id, qty] of Object.entries(a.allocations))
        map.set(id, (map.get(id) ?? 0) + qty)

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
   * Whether All Innovations Are Met
   *
   * Gates confirmation
   */
  const innovationsMet = useMemo(
    () => (innovationRequirements ?? []).every((r) => r.met),
    [innovationRequirements]
  )

  /**
   * Whether This Craft Has an Endeavor Cost
   */
  const requiresEndeavors = useMemo(
    () => (endeavorCost ?? 0) > 0,
    [endeavorCost]
  )

  /**
   * Whether the Settlement Phase Is Missing
   *
   * Informational flag. Endeavors only exist during the settlement phase, so
   * when an item demands endeavors but the settlement is not currently in a
   * settlement phase, the cost cannot be paid. The user may still craft the
   * item by toggling the deduction off; see `phaseBlocksConfirm` for the actual
   * gating signal.
   */
  const phaseMissing = useMemo(
    () => requiresEndeavors && !settlementPhase,
    [requiresEndeavors, settlementPhase]
  )

  /**
   * Whether the Missing Phase Blocks Confirmation
   *
   * Endeavors are only spent when the user opts in to deducting costs, so a
   * missing phase only blocks the confirm action while the deduction toggle is
   * enabled. With deductions off, the craft adds the gear without touching the
   * (non-existent) phase.
   */
  const phaseBlocksConfirm = useMemo(
    () => phaseMissing && deductCosts,
    [phaseMissing, deductCosts]
  )

  /**
   * Endeavors Currently Available in the Settlement Phase
   */
  const endeavorsAvailable = settlementPhase?.endeavors ?? 0

  /**
   * Whether the Settlement Has Enough Endeavors
   *
   * Gates confirmation when deducting endeavors
   */
  const endeavorsInsufficient = useMemo(
    () =>
      requiresEndeavors &&
      !!settlementPhase &&
      endeavorsAvailable < (endeavorCost ?? 0),
    [requiresEndeavors, settlementPhase, endeavorsAvailable, endeavorCost]
  )

  /**
   * Whether Crafting Limit Is Exhausted
   *
   * Gates confirmation when checking crafting limit
   */
  const limitExhausted = useMemo(() => {
    if (!craftingLimit) return false
    if (craftingLimit.total == null) return false
    return (craftingLimit.used ?? 0) >= craftingLimit.total
  }, [craftingLimit])

  /**
   * Whether All Costs Can Be Satisfied
   */
  const costsSatisfied = useMemo(() => {
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

    if (endeavorsInsufficient) return false

    return true
  }, [
    deductCosts,
    gearCostRows,
    resourceCostRows,
    resourceTypeAllocations,
    endeavorsInsufficient
  ])

  /**
   * Whether the Confirm Button Should Be Enabled
   */
  const canConfirm = useMemo(
    () =>
      costsSatisfied &&
      innovationsMet &&
      !limitExhausted &&
      !phaseBlocksConfirm,
    [costsSatisfied, innovationsMet, limitExhausted, phaseBlocksConfirm]
  )

  /**
   * Update Resource Type Allocation Quantity
   */
  const updateResourceTypeAllocation = useCallback(
    (
      resourceType: ResourceType,
      settlementResourceId: string,
      quantity: number
    ) =>
      setResourceTypeAllocations((prev) =>
        prev.map((a) => {
          if (a.resourceType !== resourceType) return a
          const next = { ...a.allocations }
          if (quantity <= 0) delete next[settlementResourceId]
          else next[settlementResourceId] = quantity
          return { ...a, allocations: next }
        })
      ),
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
      ))
        if (quantity > 0)
          resourceDeductions.push({ settlementResourceId, quantity })
    }
    return {
      gearDeductions,
      resourceDeductions,
      endeavorDeduction: requiresEndeavors ? (endeavorCost ?? 0) : 0
    }
  }, [
    gearCostRows,
    resourceCostRows,
    resourceTypeAllocations,
    requiresEndeavors,
    endeavorCost
  ])

  /**
   * Handle Confirm Action
   */
  const handleConfirm = useCallback(() => {
    if (!canConfirm) return

    if (deductCosts)
      onConfirm({ deductCosts: true, allocation: buildAllocation() })
    else
      onConfirm({
        deductCosts: false,
        allocation: {
          gearDeductions: [],
          resourceDeductions: [],
          endeavorDeduction: 0
        }
      })
  }, [canConfirm, deductCosts, buildAllocation, onConfirm])

  if (!targetGear) return <></>

  const hasAnyCosts =
    gearCostRows.length > 0 ||
    resourceCostRows.length > 0 ||
    resourceTypeAllocations.length > 0 ||
    requiresEndeavors

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {hasAnyCosts
              ? 'Choose what to spend so the gear may be forged. Toggle off to add it without paying any cost.'
              : 'No costs required. Confirm to add this gear to the settlement.'}
            {sourceLabel ? ` ${sourceLabel}` : ''}
          </DialogDescription>
        </DialogHeader>

        {(innovationRequirements?.length || phaseMissing || craftingLimit) && (
          <div className="flex flex-col gap-2 rounded-md border p-3">
            {innovationRequirements && innovationRequirements.length > 0 && (
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Innovation Requirements
                </h4>
                <ul className="flex flex-col gap-1 text-sm">
                  {innovationRequirements.map((r) => (
                    <li
                      key={r.innovation_name}
                      className={cn(
                        'flex items-center gap-2',
                        !r.met && 'text-destructive'
                      )}>
                      {r.met ? (
                        <CheckCircle2Icon className="h-3.5 w-3.5" />
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CircleAlertIcon
                              className="h-3.5 w-3.5"
                              aria-label={`Missing innovation: ${r.innovation_name}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            The settlement is missing this innovation.
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <span className="truncate">{r.innovation_name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {phaseMissing && (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <CircleAlertIcon
                  className="h-3.5 w-3.5"
                  aria-label="Settlement phase required"
                />
                <span>
                  Endeavors are only available during the settlement phase.
                  Begin a settlement phase before crafting this item, or toggle
                  the deduction off to add it without spending endeavors.
                </span>
              </p>
            )}

            {craftingLimit && craftingLimit.total != null && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge
                  variant={limitExhausted ? 'destructive' : 'outline'}
                  className={cn(limitExhausted && 'text-white')}>
                  Crafted: {craftingLimit.used ?? 0} / {craftingLimit.total}
                </Badge>
              </div>
            )}
          </div>
        )}

        {hasAnyCosts && (
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
                    Settlement gear, resources
                    {requiresEndeavors ? ', and endeavors' : ''} <b>will</b> be
                    spent to craft this item.
                  </span>
                ) : (
                  <span>
                    Settlement gear, resources
                    {requiresEndeavors ? ', and endeavors' : ''} <b>will not</b>{' '}
                    be spent to craft this item.
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
        )}

        {hasAnyCosts && (
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
                                The settlement does not have enough {r.gearName}{' '}
                                to craft this item.
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
                                The settlement does not have enough{' '}
                                {r.resourceName} to craft this item.
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
                <h4 className="text-sm font-semibold">
                  Resource Types Required
                </h4>
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
                            {normalizeResourceTypeName(a.resourceType)}
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
                                  Allocate exactly {a.required} {a.resourceType}{' '}
                                  resource{a.required === 1 ? '' : 's'} from the
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
                          <p className="text-xs text-muted-foreground pl-4">
                            No matching resources in storage.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-1 pl-4">
                            {candidates.map((row) => {
                              const currentForRow = a.allocations[row.id] ?? 0
                              const pledgedElsewhere =
                                (pledgedByResourceId.get(row.id) ?? 0) -
                                currentForRow
                              const remainingAvailable = Math.max(
                                0,
                                row.quantity - pledgedElsewhere
                              )
                              const max = Math.min(
                                remainingAvailable,
                                a.required
                              )
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

            {requiresEndeavors && (
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-semibold">Endeavors Required</h4>
                <ul className="flex flex-col gap-1 text-sm">
                  <li className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                    <span className="truncate">Endeavors</span>
                    <span
                      className={cn(
                        'flex items-center gap-2 text-xs',
                        endeavorsInsufficient && 'text-destructive'
                      )}>
                      {endeavorsInsufficient && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircleIcon
                              className="h-3.5 w-3.5"
                              aria-label="Settlement does not have enough endeavors"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            The settlement does not have enough endeavors to
                            craft this item.
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Badge variant="outline">
                        {endeavorsAvailable} / {endeavorCost ?? 0}
                      </Badge>
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            {phaseBlocksConfirm
              ? 'Settlement Phase Required'
              : !innovationsMet
                ? 'Missing Innovations'
                : limitExhausted
                  ? 'Limit Reached'
                  : deductCosts && hasAnyCosts
                    ? 'Craft & Deduct'
                    : 'Add Without Cost'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
