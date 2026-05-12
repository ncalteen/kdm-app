'use client'

import { ResourceItem } from '@/components/settlement/resources/resource-item'
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
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { useToast } from '@/hooks/use-toast'
import { getPatterns } from '@/lib/dal/pattern'
import { getResources } from '@/lib/dal/resource'
import { addSettlementPatterns } from '@/lib/dal/settlement-pattern'
import {
  addSettlementResources,
  removeSettlementResource,
  updateSettlementResource
} from '@/lib/dal/settlement-resource'
import {
  ERROR_MESSAGE,
  PATTERN_UNLOCKED_FROM_RESOURCE_MESSAGE,
  RESOURCE_REMOVED_MESSAGE,
  RESOURCE_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  PatternDetail,
  ResourceDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { BeefIcon, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Resources Card Properties
 */
interface ResourcesCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
}

/**
 * Resources Card Component
 *
 * Displays the resources linked to a settlement and allows users to add,
 * remove, and adjust quantity. All mutations are applied optimistically so the
 * UI updates before the database transaction completes.
 *
 * @param props Resources Card Properties
 * @returns Resources Card Component
 */
export function ResourcesCard({
  local,
  selectedSettlement,
  setSelectedSettlement
}: ResourcesCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')

  const { data: availableResources, isLoaded: hasFetched } = useCatalogFetch<{
    [key: string]: ResourceDetail
  }>(selectedSettlement?.id, () => getResources(), {
    initial: {},
    errorContext: 'Settlement Resources Fetch Error',
    onReset: () => setAddOpen(false),
    onError: () => toast.error(ERROR_MESSAGE())
  })

  // Patterns are loaded alongside resources so that when a freshly-added
  // resource carries a `pattern_id`, the auto-unlock flow can resolve the
  // pattern's display name for the optimistic settlement row and the toast.
  const { data: availablePatterns } = useCatalogFetch<{
    [key: string]: PatternDetail
  }>(selectedSettlement?.id, () => getPatterns(), {
    initial: {},
    errorContext: 'Settlement Resources Patterns Fetch Error',
    onError: () => toast.error(ERROR_MESSAGE())
  })

  const selectableResources = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.resources ?? []).map((r) => r.resource_id)
    )
    return Object.values(availableResources)
      .filter((r) => !linkedIds.has(r.id))
      .sort((a, b) => a.resource_name.localeCompare(b.resource_name))
  }, [availableResources, selectedSettlement?.resources])

  const sortedResources = useMemo(
    () =>
      (selectedSettlement?.resources ?? [])
        .map((item, originalIndex) => ({ item, originalIndex }))
        .sort((a, b) =>
          a.item.resource_name.localeCompare(b.item.resource_name)
        ),
    [selectedSettlement?.resources]
  )

  /**
   * Handle Add Resource
   *
   * Optimistically adds a resource to the settlement, then persists to the DB.
   * If the resource carries a `pattern_id` and the settlement has not yet
   * learned that pattern, the pattern is added optimistically alongside the
   * resource and persisted only after the resource insert resolves
   * successfully. This keeps pattern unlock conditional on resource success:
   *
   * - Resource insert fails -> rollback removes BOTH optimistic rows; the
   *   pattern is never persisted.
   * - Resource insert succeeds, pattern insert fails -> only the optimistic
   *   pattern row is rolled back; the persisted resource is left in place
   *   and the user sees an error toast for the pattern unlock specifically.
   * - Both succeed -> both temp ids are reconciled and the pattern unlock
   *   toast fires alongside the resource success toast.
   *
   * Truly atomic both-succeed-or-both-fail behavior would require an RPC; the
   * remaining divergence (resource added, pattern not) is the smallest
   * possible failure mode given the two-step persistence path.
   *
   * @param resourceId Resource ID
   */
  const handleAdd = useCallback(
    (resourceId: string | undefined) => {
      if (!resourceId || !selectedSettlement) return

      const resourceInfo = availableResources[resourceId]
      if (!resourceInfo) return

      setAddOpen(false)

      const tempId = `temp-${crypto.randomUUID()}`

      const optimisticRow: SettlementDetail['resources'][0] = {
        category: resourceInfo.category,
        id: tempId,
        quarry_id: resourceInfo.quarry_id,
        quarry_monster_name: resourceInfo.quarry_monster_name,
        quarry_node: resourceInfo.quarry_node,
        quantity: 0,
        resource_id: resourceId,
        resource_name: resourceInfo.resource_name,
        resource_types: resourceInfo.resource_types,
        custom: resourceInfo.custom,
        // Optimistic placeholder; the realtime/refetch reconciles
        // `author_username` from the catalog row's `user_id` (E2.8).
        author_username: null
      }

      // Determine whether the resource should also unlock a pattern. Only
      // unlock when the pattern is known in the catalog (so we can show its
      // name) and is not already linked to this settlement.
      const linkedPatternIds = new Set(
        selectedSettlement.patterns.map((p) => p.pattern_id)
      )
      const unlockPatternId = resourceInfo.pattern_id
      const unlockPatternInfo =
        unlockPatternId && !linkedPatternIds.has(unlockPatternId)
          ? (availablePatterns[unlockPatternId] ?? null)
          : null

      const tempPatternId = unlockPatternInfo
        ? `temp-${crypto.randomUUID()}`
        : null
      const optimisticPatternRow: SettlementDetail['patterns'][0] | null =
        unlockPatternInfo && tempPatternId
          ? {
              id: tempPatternId,
              pattern_id: unlockPatternInfo.id,
              pattern_name: unlockPatternInfo.pattern_name,
              custom: unlockPatternInfo.custom,
              // Optimistic placeholder; the realtime/refetch reconciles
              // `author_username` from the catalog row's `user_id` (E2.8).
              author_username: null
            }
          : null

      const updatedResources = [...selectedSettlement.resources, optimisticRow]

      setSelectedSettlement({
        ...selectedSettlement,
        resources: updatedResources,
        patterns: optimisticPatternRow
          ? [...selectedSettlement.patterns, optimisticPatternRow]
          : selectedSettlement.patterns
      })

      void mutate({
        context: 'Resource Add',
        persist: () =>
          addSettlementResources([resourceId], selectedSettlement.id),
        onSuccess: async (row) => {
          // Reconcile the resource's temp id with the persisted id first so
          // the row stays in sync even if the pattern unlock step fails.
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  resources: prev.resources.map((r) =>
                    r.id === tempId ? { ...r, id: row[0].id } : r
                  )
                }
              : null
          )

          if (!unlockPatternInfo || !tempPatternId) return

          // Persist the pattern unlock now that the resource is known to be
          // saved. A failure here is logged and rolled back locally without
          // touching the resource so the two stores cannot diverge in the
          // direction of "pattern saved, resource missing".
          try {
            const patternRow = await addSettlementPatterns(
              [unlockPatternInfo.id],
              selectedSettlement.id
            )
            setSelectedSettlement((prev) =>
              prev
                ? {
                    ...prev,
                    patterns: prev.patterns.map((p) =>
                      p.id === tempPatternId
                        ? { ...p, id: patternRow[0].id }
                        : p
                    )
                  }
                : null
            )
            toast.success(
              PATTERN_UNLOCKED_FROM_RESOURCE_MESSAGE(
                unlockPatternInfo.pattern_name
              )
            )
          } catch (error) {
            console.error('Resource Pattern Unlock Error:', error)
            setSelectedSettlement((prev) =>
              prev
                ? {
                    ...prev,
                    patterns: prev.patterns.filter(
                      (p) => p.id !== tempPatternId
                    )
                  }
                : null
            )
            toast.error(ERROR_MESSAGE())
          }
        },
        rollback: () => {
          // Resource insert failed; the pattern was never persisted, so both
          // optimistic rows must be removed in a single update.
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  resources: prev.resources.filter((r) => r.id !== tempId),
                  patterns: tempPatternId
                    ? prev.patterns.filter((p) => p.id !== tempPatternId)
                    : prev.patterns
                }
              : null
          )
        },
        successMessage: RESOURCE_UPDATED_MESSAGE()
      })
    },
    [
      selectedSettlement,
      availableResources,
      availablePatterns,
      setSelectedSettlement,
      mutate,
      toast
    ]
  )

  /**
   * Handle Remove Resource
   *
   * Optimistically removes a resource from the settlement, then persists to
   * the DB.
   *
   * @param index Settlement Resource Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.resources[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        resources: selectedSettlement.resources.filter(
          (r) => r.id !== removed.id
        )
      })

      void mutate({
        context: 'Resource Remove',
        persist: () => removeSettlementResource(removed.id),
        rollback: () => {
          setSelectedSettlement((prev) => {
            if (!prev || prev.resources.some((r) => r.id === removed.id))
              return prev
            return { ...prev, resources: [...prev.resources, removed] }
          })
        },
        successMessage: RESOURCE_REMOVED_MESSAGE()
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /**
   * Handle Quantity Change
   *
   * Optimistically updates the quantity of a resource, then persists to the
   * DB.
   *
   * @param index Resource Index
   * @param quantity New Quantity
   */
  const handleQuantityChange = useCallback(
    (index: number, quantity: number) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.resources[index]
      if (!target) return

      const oldQuantity = target.quantity

      setSelectedSettlement({
        ...selectedSettlement,
        resources: selectedSettlement.resources.map((r, i) =>
          i === index ? { ...r, quantity } : r
        )
      })

      void mutate({
        context: 'Resource Quantity',
        persist: () => updateSettlementResource(target.id, { quantity }),
        rollback: () => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  resources: prev.resources.map((r) =>
                    r.id === target.id ? { ...r, quantity: oldQuantity } : r
                  )
                }
              : null
          )
        },
        successMessage: RESOURCE_UPDATED_MESSAGE(index)
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <BeefIcon className="h-4 w-4" />
          Resource Storage
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-0 h-8 w-8"
                disabled={selectableResources.length === 0}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search resources..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>No resources found.</CommandEmpty>
                  <CommandGroup>
                    {selectableResources.map((resource) => (
                      <CommandItem
                        key={resource.id}
                        value={resource.resource_name}
                        onSelect={() => handleAdd(resource.id)}>
                        {resource.resource_name}
                        {resource.custom && (
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
        <div className="flex flex-col h-60">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.resources ||
              selectedSettlement.resources.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No resources yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading resources...
              </p>
            )}

            {hasFetched &&
              sortedResources.map(({ item, originalIndex }) => {
                const detail = availableResources[item.resource_id]

                return (
                  <ResourceItem
                    key={item.id}
                    customDetail={
                      detail
                        ? {
                            custom: detail.custom,
                            sections: [
                              { label: 'Rules', content: detail.rules }
                            ]
                          }
                        : null
                    }
                    index={originalIndex}
                    resource={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                )
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
