'use client'

import { CraftItemDialog } from '@/components/crafting/craft-item-dialog'
import { SeedPatternItem } from '@/components/settlement/seed-patterns/seed-pattern-item'
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
  seedPatternToCraftingCostsSpec
} from '@/lib/crafting'
import { getGear } from '@/lib/dal/gear'
import { getResources } from '@/lib/dal/resource'
import { getSeedPatterns } from '@/lib/dal/seed-pattern'
import {
  addSettlementSeedPatterns,
  removeSettlementSeedPattern
} from '@/lib/dal/settlement-seed-pattern'
import {
  ERROR_MESSAGE,
  GEAR_UPDATED_MESSAGE,
  SEED_PATTERN_CRAFTED_MESSAGE,
  SEED_PATTERN_REMOVED_MESSAGE,
  SEED_PATTERN_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  GearDetail,
  ResourceDetail,
  SeedPatternDetail,
  SettlementDetail,
  SettlementPhaseDetail,
  SettlementStateSetter
} from '@/lib/types'
import { BeanIcon, PlusIcon } from 'lucide-react'
import { ReactElement, ReactNode, useCallback, useMemo, useState } from 'react'

/**
 * Seed Patterns Card Properties
 */
interface SeedPatternsCardProps {
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
 * Seed Patterns Card Component
 *
 * Displays the seed patterns linked to a settlement and allows users to add,
 * remove, and craft from seed patterns. All mutations are applied
 * optimistically so the UI updates before the database transaction completes.
 *
 * @param props Seed Patterns Card Properties
 * @returns Seed Patterns Card Component
 */
export function SeedPatternsCard({
  local,
  selectedSettlement,
  setSelectedSettlement,
  selectedSettlementPhase,
  setSelectedSettlementPhase
}: SeedPatternsCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')

  const [craftDialogOpen, setCraftDialogOpen] = useState<boolean>(false)
  const [pendingCraftSeedPattern, setPendingCraftSeedPattern] =
    useState<SeedPatternDetail | null>(null)
  const [pendingCraftGear, setPendingCraftGear] = useState<GearDetail | null>(
    null
  )
  const [pendingCraftCosts, setPendingCraftCosts] =
    useState<CraftingCostsSpec>(emptyCraftingCosts())

  const { data: availableSeedPatterns, isLoaded: hasFetched } =
    useCatalogFetch<{
      [key: string]: SeedPatternDetail
    }>(selectedSettlement?.id, () => getSeedPatterns(), {
      initial: {},
      errorContext: 'Settlement Seed Patterns Fetch Error',
      onReset: () => setAddOpen(false),
      onError: () => toast.error(ERROR_MESSAGE())
    })

  const { data: availableGear } = useCatalogFetch<{
    [key: string]: GearDetail
  }>(selectedSettlement?.id, () => getGear(), {
    initial: {},
    errorContext: 'Seed Pattern Gear Catalog Fetch Error',
    onError: () => toast.error(ERROR_MESSAGE())
  })

  const { data: availableResources } = useCatalogFetch<{
    [key: string]: ResourceDetail
  }>(selectedSettlement?.id, () => getResources(), {
    initial: {},
    errorContext: 'Seed Pattern Resource Catalog Fetch Error',
    onError: () => toast.error(ERROR_MESSAGE())
  })

  const { persistGearAddition } = useCraftGearPersistence({
    local,
    selectedSettlement,
    setSelectedSettlement,
    selectedSettlementPhase,
    setSelectedSettlementPhase
  })

  const selectableSeedPatterns = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.seed_patterns ?? []).map((sp) => sp.seed_pattern_id)
    )
    return Object.values(availableSeedPatterns)
      .filter((sp) => !linkedIds.has(sp.id))
      .sort((a, b) => a.seed_pattern_name.localeCompare(b.seed_pattern_name))
  }, [availableSeedPatterns, selectedSettlement?.seed_patterns])

  const sortedSeedPatterns = useMemo(
    () =>
      (selectedSettlement?.seed_patterns ?? [])
        .map((item, originalIndex) => ({ item, originalIndex }))
        .sort((a, b) =>
          a.item.seed_pattern_name.localeCompare(b.item.seed_pattern_name)
        ),
    [selectedSettlement?.seed_patterns]
  )

  /**
   * Handle Add Seed Pattern
   *
   * Adds a seed pattern to the selected settlement optimistically, updating the
   * UI immediately while the database transaction is pending.
   *
   * @param seedPatternId Seed Pattern ID to Add
   */
  const handleAdd = useCallback(
    (seedPatternId: string | undefined) => {
      if (!seedPatternId || !selectedSettlement) return

      const seedPatternInfo = availableSeedPatterns[seedPatternId]
      if (!seedPatternInfo) return

      setAddOpen(false)

      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['seed_patterns'][0] = {
        id: tempId,
        seed_pattern_id: seedPatternId,
        seed_pattern_name: seedPatternInfo.seed_pattern_name,
        custom: seedPatternInfo.custom
      }

      const updatedSeedPatterns = [
        ...selectedSettlement.seed_patterns,
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        seed_patterns: updatedSeedPatterns
      })

      void mutate({
        context: 'Seed Pattern Add',
        persist: () =>
          addSettlementSeedPatterns([seedPatternId], selectedSettlement.id),
        onSuccess: (row) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  seed_patterns: prev.seed_patterns.map((sp) =>
                    sp.id === tempId ? { ...sp, id: row[0].id } : sp
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
                  seed_patterns: prev.seed_patterns.filter(
                    (sp) => sp.id !== tempId
                  )
                }
              : null
          )
        },
        successMessage: SEED_PATTERN_UPDATED_MESSAGE()
      })
    },
    [selectedSettlement, availableSeedPatterns, setSelectedSettlement, mutate]
  )

  /**
   * Handle Remove Seed Pattern
   *
   * Removes a seed pattern from the selected settlement optimistically,
   * updating the UI immediately while the database transaction is pending.
   *
   * @param index Index of the seed pattern to remove
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.seed_patterns[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        seed_patterns: selectedSettlement.seed_patterns.filter(
          (sp) => sp.id !== removed.id
        )
      })

      void mutate({
        context: 'Seed Pattern Remove',
        persist: () => removeSettlementSeedPattern(removed.id),
        rollback: () => {
          setSelectedSettlement((prev) => {
            if (!prev || prev.seed_patterns.some((sp) => sp.id === removed.id))
              return prev
            return {
              ...prev,
              seed_patterns: [...prev.seed_patterns, removed]
            }
          })
        },
        successMessage: SEED_PATTERN_REMOVED_MESSAGE()
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /**
   * Handle Craft From Seed Pattern
   *
   * Resolves the seed pattern's catalog entry and the gear it produces, then
   * opens the crafting dialog with the appropriate cost spec.
   *
   * @param index Settlement Seed Pattern Index
   */
  const handleCraft = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const settlementRow = selectedSettlement.seed_patterns[index]
      if (!settlementRow) return

      const seedPatternInfo =
        availableSeedPatterns[settlementRow.seed_pattern_id]
      if (!seedPatternInfo || !seedPatternInfo.crafted_gear_id) return

      const gearInfo = availableGear[seedPatternInfo.crafted_gear_id]
      if (!gearInfo) return

      setPendingCraftSeedPattern(seedPatternInfo)
      setPendingCraftGear(gearInfo)
      setPendingCraftCosts(seedPatternToCraftingCostsSpec(seedPatternInfo))
      setCraftDialogOpen(true)
    },
    [selectedSettlement, availableSeedPatterns, availableGear]
  )

  /**
   * Handle Craft Confirm
   *
   * Invoked when the user confirms the crafting dialog. Closes the dialog and
   * adds the produced gear to the settlement.
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
        ? SEED_PATTERN_CRAFTED_MESSAGE()
        : GEAR_UPDATED_MESSAGE()
      persistGearAddition(pendingCraftGear, allocation, successMessage)
      setPendingCraftSeedPattern(null)
      setPendingCraftGear(null)
      setPendingCraftCosts(emptyCraftingCosts())
    },
    [pendingCraftGear, persistGearAddition]
  )

  // Suppress unused warning; search is bound to CommandInput state.
  void search

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <BeanIcon className="h-4 w-4" />
          Seed Patterns
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-0 h-8 w-8"
                disabled={selectableSeedPatterns.length === 0}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search seed patterns..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>No seed patterns found.</CommandEmpty>
                  <CommandGroup>
                    {selectableSeedPatterns.map((sp) => (
                      <CommandItem
                        key={sp.id}
                        value={sp.seed_pattern_name}
                        onSelect={() => handleAdd(sp.id)}>
                        {sp.seed_pattern_name}
                        {sp.custom && (
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
        <div className="flex flex-col h-[200px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.seed_patterns ||
              selectedSettlement.seed_patterns.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No seed patterns yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading seed patterns...
              </p>
            )}

            {hasFetched &&
              sortedSeedPatterns.map(({ item, originalIndex }) => {
                const detail = availableSeedPatterns[item.seed_pattern_id]

                // Build the same overview and crafting-cost sections used by
                // the patterns card so the sheet surfaces every cost the
                // settlement will pay when crafting.
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

                const craftingCostsContent = detail
                  ? formatCraftingCostsForDisplay(
                      seedPatternToCraftingCostsSpec(detail),
                      {
                        gearCatalog: availableGear,
                        resourceCatalog: availableResources
                      }
                    )
                  : null

                // The craft button is only meaningful when the seed pattern
                // produces gear. Cost/endeavor/phase shortfalls do NOT disable
                // the button — the craft dialog exposes a "deduct costs"
                // toggle so survivors can record an off-book craft, and that
                // escape hatch is unreachable while the button is disabled.
                const canShowCraft = !!detail?.crafted_gear_id

                let craftDisabled = false
                let craftDisabledReason: string | undefined

                if (canShowCraft && detail) {
                  const producedGear = availableGear[detail.crafted_gear_id!]

                  if (!producedGear) {
                    craftDisabled = true

                    craftDisabledReason =
                      'The crafted gear is not available in the catalog.'
                  }
                }

                return (
                  <SeedPatternItem
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
                                label: 'Requirements',
                                content: detail.requirements
                              },
                              {
                                label: 'Crafting Steps',
                                content: detail.crafting_steps
                              },
                              {
                                label: 'Crafting Costs',
                                content: craftingCostsContent
                              },
                              {
                                label: 'Keywords',
                                badges:
                                  detail.keywords && detail.keywords.length > 0
                                    ? detail.keywords
                                    : undefined
                              }
                            ]
                          }
                        : null
                    }
                    index={originalIndex}
                    seedPattern={item}
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
        key={pendingCraftSeedPattern?.id ?? 'craft-seed-pattern-dialog-empty'}
        open={craftDialogOpen}
        onOpenChange={(next) => {
          setCraftDialogOpen(next)
          if (!next) {
            setPendingCraftSeedPattern(null)
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
          pendingCraftSeedPattern
            ? `From: ${pendingCraftSeedPattern.seed_pattern_name}`
            : null
        }
        targetGear={pendingCraftGear}
        costs={pendingCraftCosts}
        gearCatalog={availableGear}
        resourceCatalog={availableResources}
        settlementGear={selectedSettlement?.gear ?? []}
        settlementResources={selectedSettlement?.resources ?? []}
        endeavorCost={pendingCraftSeedPattern?.endeavor_cost ?? null}
        settlementPhase={selectedSettlementPhase}
        craftingLimit={
          pendingCraftSeedPattern?.crafting_limit != null
            ? { total: pendingCraftSeedPattern.crafting_limit, used: 0 }
            : null
        }
        onConfirm={handleCraftConfirm}
      />
    </Card>
  )
}
