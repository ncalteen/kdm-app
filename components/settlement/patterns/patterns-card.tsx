'use client'

import { CraftItemDialog } from '@/components/crafting/craft-item-dialog'
import { PatternItem } from '@/components/settlement/patterns/pattern-item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { LocalStateType } from '@/contexts/local-context'
import { useCatalogFetch } from '@/hooks/use-catalog-fetch'
import { useCraftGearPersistence } from '@/hooks/use-craft-gear-persistence'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { useToast } from '@/hooks/use-toast'
import {
  CraftingAllocation,
  CraftingCostsSpec,
  emptyCraftingCosts,
  formatCraftingCostsForDisplay,
  patternToCraftingCostsSpec
} from '@/lib/crafting'
import { getGear } from '@/lib/dal/gear'
import { getPatterns } from '@/lib/dal/pattern'
import { getResources } from '@/lib/dal/resource'
import {
  addSettlementPatterns,
  removeSettlementPattern
} from '@/lib/dal/settlement-pattern'
import {
  ERROR_MESSAGE,
  GEAR_UPDATED_MESSAGE,
  PATTERN_CRAFTED_MESSAGE,
  PATTERN_REMOVED_MESSAGE,
  PATTERN_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  GearDetail,
  PatternDetail,
  ResourceDetail,
  SettlementDetail,
  SettlementPhaseDetail,
  SettlementStateSetter
} from '@/lib/types'
import { PlusIcon, ScissorsLineDashedIcon } from 'lucide-react'
import { ReactElement, ReactNode, useCallback, useMemo, useState } from 'react'

/**
 * Patterns Card Properties
 */
interface PatternsCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (
    settlementPhase: SettlementPhaseDetail | null
  ) => void
}

/**
 * Patterns Card Component
 *
 * Displays the patterns linked to a settlement and allows users to add, remove,
 * and craft from patterns. All mutations are applied optimistically so the UI
 * updates before the database transaction completes.
 *
 * @param props Patterns Card Properties
 * @returns Patterns Card Component
 */
export function PatternsCard({
  local,
  selectedSettlement,
  setSelectedSettlement,
  selectedSettlementPhase,
  setSelectedSettlementPhase
}: PatternsCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')

  const [craftDialogOpen, setCraftDialogOpen] = useState<boolean>(false)
  const [pendingCraftPattern, setPendingCraftPattern] =
    useState<PatternDetail | null>(null)
  const [pendingCraftGear, setPendingCraftGear] = useState<GearDetail | null>(
    null
  )
  const [pendingCraftCosts, setPendingCraftCosts] =
    useState<CraftingCostsSpec>(emptyCraftingCosts())

  const { data: availablePatterns, isLoaded: hasFetched } = useCatalogFetch<{
    [key: string]: PatternDetail
  }>(selectedSettlement?.id, () => getPatterns(), {
    initial: {},
    errorContext: 'Settlement Patterns Fetch Error',
    onReset: () => setAddOpen(false),
    onError: () => toast.error(ERROR_MESSAGE())
  })

  const { data: availableGear } = useCatalogFetch<{
    [key: string]: GearDetail
  }>(selectedSettlement?.id, () => getGear(), {
    initial: {},
    errorContext: 'Pattern Gear Catalog Fetch Error',
    onError: () => toast.error(ERROR_MESSAGE())
  })

  const { data: availableResources } = useCatalogFetch<{
    [key: string]: ResourceDetail
  }>(selectedSettlement?.id, () => getResources(), {
    initial: {},
    errorContext: 'Pattern Resource Catalog Fetch Error',
    onError: () => toast.error(ERROR_MESSAGE())
  })

  const { persistGearAddition } = useCraftGearPersistence({
    local,
    selectedSettlement,
    setSelectedSettlement,
    selectedSettlementPhase,
    setSelectedSettlementPhase
  })

  const selectablePatterns = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.patterns ?? []).map((p) => p.pattern_id)
    )
    return Object.values(availablePatterns)
      .filter((p) => !linkedIds.has(p.id))
      .sort((a, b) => a.pattern_name.localeCompare(b.pattern_name))
  }, [availablePatterns, selectedSettlement?.patterns])

  const sortedPatterns = useMemo(
    () =>
      (selectedSettlement?.patterns ?? [])
        .map((item, originalIndex) => ({ item, originalIndex }))
        .sort((a, b) => a.item.pattern_name.localeCompare(b.item.pattern_name)),
    [selectedSettlement?.patterns]
  )

  /**
   * Settlement Innovation IDs
   *
   * Snapshot of innovation IDs the settlement currently has, used to validate
   * pattern innovation requirements before crafting.
   */
  const settlementInnovationIds = useMemo(
    () =>
      new Set(
        (selectedSettlement?.innovations ?? []).map((i) => i.innovation_id)
      ),
    [selectedSettlement?.innovations]
  )

  /**
   * Handle Add Pattern
   *
   * Adds a pattern to the settlement optimistically, updating the UI before the
   * database transaction completes. If the mutation fails, the addition is
   * rolled back.
   *
   * @param patternId Pattern ID to Add
   */
  const handleAdd = useCallback(
    (patternId: string | undefined) => {
      if (!patternId || !selectedSettlement) return

      const patternInfo = availablePatterns[patternId]
      if (!patternInfo) return

      setAddOpen(false)

      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['patterns'][0] = {
        id: tempId,
        pattern_id: patternId,
        pattern_name: patternInfo.pattern_name,
        custom: patternInfo.custom,
        // Optimistic placeholder; the realtime/refetch reconciles
        // `author_username` from the catalog row's `user_id` (E2.8).
        author_user_id: null,
        author_username: null,
        author_avatar_url: null
      }

      const updatedPatterns = [...selectedSettlement.patterns, optimisticRow]

      setSelectedSettlement({
        ...selectedSettlement,
        patterns: updatedPatterns
      })

      void mutate({
        context: 'Pattern Add',
        persist: () =>
          addSettlementPatterns([patternId], selectedSettlement.id),
        onSuccess: (row) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  patterns: prev.patterns.map((p) =>
                    p.id === tempId ? { ...p, id: row[0].id } : p
                  )
                }
              : null
          )
        },
        rollback: () => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  patterns: prev.patterns.filter((p) => p.id !== tempId)
                }
              : null
          )
        },
        successMessage: PATTERN_UPDATED_MESSAGE()
      })
    },
    [selectedSettlement, availablePatterns, setSelectedSettlement, mutate]
  )

  /**
   * Handle Remove Pattern
   *
   * Removes a pattern from the settlement optimistically, updating the UI
   * before the database transaction completes. If the mutation fails, the
   * removal is rolled back.
   *
   * @param index Settlement Pattern Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.patterns[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        patterns: selectedSettlement.patterns.filter((p) => p.id !== removed.id)
      })

      void mutate({
        context: 'Pattern Remove',
        persist: () => removeSettlementPattern(removed.id),
        rollback: () => {
          setSelectedSettlement((prev) => {
            if (!prev || prev.patterns.some((p) => p.id === removed.id))
              return prev
            return { ...prev, patterns: [...prev.patterns, removed] }
          })
        },
        successMessage: PATTERN_REMOVED_MESSAGE()
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /**
   * Handle Craft From Pattern
   *
   * Resolves the pattern's catalog entry and the gear it produces, then opens
   * the crafting dialog with the appropriate cost spec and innovation
   * requirements.
   *
   * @param index Settlement Pattern Index
   */
  const handleCraft = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const settlementRow = selectedSettlement.patterns[index]
      if (!settlementRow) return

      const patternInfo = availablePatterns[settlementRow.pattern_id]
      if (!patternInfo || !patternInfo.crafted_gear_id) return

      const gearInfo = availableGear[patternInfo.crafted_gear_id]
      if (!gearInfo) return

      setPendingCraftPattern(patternInfo)
      setPendingCraftGear(gearInfo)
      setPendingCraftCosts(patternToCraftingCostsSpec(patternInfo))
      setCraftDialogOpen(true)
    },
    [selectedSettlement, availablePatterns, availableGear]
  )

  /**
   * Handle Craft Confirm
   *
   * Invoked when the user confirms the crafting dialog. Closes the dialog and
   * adds the produced gear to the settlement (with or without the deductions).
   */
  const handleCraftConfirm = useCallback(
    ({
      deductCosts,
      allocation
    }: {
      deductCosts: boolean
      allocation: CraftingAllocation
    }) => {
      if (!pendingCraftGear) return

      setCraftDialogOpen(false)

      const successMessage = deductCosts
        ? PATTERN_CRAFTED_MESSAGE()
        : GEAR_UPDATED_MESSAGE()

      persistGearAddition(pendingCraftGear, allocation, successMessage)
      setPendingCraftPattern(null)
      setPendingCraftGear(null)
      setPendingCraftCosts(emptyCraftingCosts())
    },
    [pendingCraftGear, persistGearAddition]
  )

  /**
   * Innovation Requirements For Pending Pattern
   */
  const pendingInnovationRequirements = useMemo(() => {
    if (!pendingCraftPattern) return undefined

    return pendingCraftPattern.innovation_requirement_ids.map((id) => {
      const innovation = (selectedSettlement?.innovations ?? []).find(
        (i) => i.innovation_id === id
      )

      return {
        innovation_name: innovation?.innovation_name ?? 'Unknown Innovation',
        met: !!innovation
      }
    })
  }, [pendingCraftPattern, selectedSettlement?.innovations])

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <ScissorsLineDashedIcon className="h-4 w-4" />
          Patterns
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-0 h-8 w-8"
                disabled={selectablePatterns.length === 0}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search patterns..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>No patterns found.</CommandEmpty>
                  <CommandGroup>
                    {selectablePatterns.map((pattern) => (
                      <CommandItem
                        key={pattern.id}
                        value={pattern.id}
                        keywords={[pattern.pattern_name]}
                        onSelect={() => handleAdd(pattern.id)}>
                        {pattern.pattern_name}
                        {pattern.custom && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Custom
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-50">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.patterns ||
              selectedSettlement.patterns.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No patterns yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading patterns...
              </p>
            )}

            {hasFetched &&
              sortedPatterns.map(({ item, originalIndex }) => {
                const detail = availablePatterns[item.pattern_id]
                const overviewEntries: {
                  label: string
                  value: ReactNode
                }[] = []
                if (detail?.endeavor_cost != null)
                  overviewEntries.push({
                    label: 'Endeavor Cost',
                    value: detail.endeavor_cost
                  })
                if (detail?.crafting_limit != null)
                  overviewEntries.push({
                    label: 'Crafting Limit',
                    value: detail.crafting_limit
                  })

                // Resolve innovation requirements to display names so the sheet
                // shows "Bone Smith" rather than the underlying UUID.
                const innovationRequirementLines: string[] = []

                if (detail)
                  for (const id of detail.innovation_requirement_ids) {
                    const linkedInnovation = (
                      selectedSettlement?.innovations ?? []
                    ).find((i) => i.innovation_id === id)

                    innovationRequirementLines.push(
                      `- ${linkedInnovation?.innovation_name ?? 'Unknown Innovation'}`
                    )
                  }

                // Resolved markdown for any gear/resource/type costs.
                const craftingCostsContent = detail
                  ? formatCraftingCostsForDisplay(
                      patternToCraftingCostsSpec(detail),
                      {
                        gearCatalog: availableGear,
                        resourceCatalog: availableResources
                      }
                    )
                  : null

                // The craft button is only meaningful when the pattern produces
                // gear; surface a tooltip explaining why crafting is blocked
                // when prerequisites are unmet. Cost/endeavor/phase shortfalls
                // do NOT disable the button — the craft dialog exposes a
                // "deduct costs" toggle so survivors can record an off-book
                // craft, and that escape hatch is unreachable while the button
                // is disabled.
                const canShowCraft = !!detail?.crafted_gear_id

                let craftDisabled = false
                let craftDisabledReason: string | undefined

                if (canShowCraft && detail) {
                  const producedGear = availableGear[detail.crafted_gear_id!]

                  if (!producedGear) {
                    craftDisabled = true
                    craftDisabledReason =
                      'The crafted gear is not available in the catalog.'
                  } else {
                    const innovationsMet =
                      detail.innovation_requirement_ids.every((id) =>
                        settlementInnovationIds.has(id)
                      )

                    if (!innovationsMet) {
                      craftDisabled = true

                      craftDisabledReason =
                        'The settlement is missing one or more required innovations.'
                    }
                  }
                }

                return (
                  <PatternItem
                    key={item.id}
                    customDetail={
                      detail
                        ? {
                            custom: detail.custom,
                            sections: [
                              {
                                label: 'Overview',
                                entries:
                                  overviewEntries.length > 0
                                    ? overviewEntries
                                    : undefined
                              },
                              {
                                label: 'Innovation Requirements',
                                content:
                                  innovationRequirementLines.length > 0
                                    ? innovationRequirementLines.join('\n')
                                    : null
                              },
                              {
                                label: 'Crafting Costs',
                                content: craftingCostsContent
                              }
                            ]
                          }
                        : null
                    }
                    index={originalIndex}
                    pattern={item}
                    onRemove={handleRemove}
                    onCraft={canShowCraft ? handleCraft : undefined}
                    craftDisabled={craftDisabled}
                    craftDisabledReason={craftDisabledReason}
                  />
                )
              })}
          </div>
        </div>
      </CardContent>

      <CraftItemDialog
        key={pendingCraftPattern?.id ?? 'craft-pattern-dialog-empty'}
        open={craftDialogOpen}
        onOpenChange={(next) => {
          setCraftDialogOpen(next)
          if (!next) {
            setPendingCraftPattern(null)
            setPendingCraftGear(null)
            setPendingCraftCosts(emptyCraftingCosts())
          }
        }}
        title={
          pendingCraftGear
            ? `Craft ${pendingCraftGear.gear_name}`
            : 'Craft Gear'
        }
        sourceLabel={
          pendingCraftPattern
            ? `From: ${pendingCraftPattern.pattern_name}`
            : null
        }
        targetGear={pendingCraftGear}
        costs={pendingCraftCosts}
        gearCatalog={availableGear}
        resourceCatalog={availableResources}
        settlementGear={selectedSettlement?.gear ?? []}
        settlementResources={selectedSettlement?.resources ?? []}
        innovationRequirements={pendingInnovationRequirements}
        endeavorCost={pendingCraftPattern?.endeavor_cost ?? null}
        settlementPhase={selectedSettlementPhase}
        craftingLimit={
          pendingCraftPattern?.crafting_limit != null
            ? { total: pendingCraftPattern.crafting_limit, used: 0 }
            : null
        }
        onConfirm={handleCraftConfirm}
      />
    </Card>
  )
}
