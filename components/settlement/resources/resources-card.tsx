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
import { getResources } from '@/lib/dal/resource'
import {
  addSettlementResources,
  removeSettlementResource,
  updateSettlementResource
} from '@/lib/dal/settlement-resource'
import {
  ERROR_MESSAGE,
  RESOURCE_REMOVED_MESSAGE,
  RESOURCE_UPDATED_MESSAGE
} from '@/lib/messages'
import {
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
        resource_types: resourceInfo.resource_types
      }

      const updatedResources = [...selectedSettlement.resources, optimisticRow]

      setSelectedSettlement({
        ...selectedSettlement,
        resources: updatedResources
      })

      void mutate({
        context: 'Resource Add',
        persist: () =>
          addSettlementResources([resourceId], selectedSettlement.id),
        onSuccess: (row) => {
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
        },
        rollback: () => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  resources: prev.resources.filter((r) => r.id !== tempId)
                }
              : null
          )
        },
        successMessage: RESOURCE_UPDATED_MESSAGE()
      })
    },
    [selectedSettlement, availableResources, setSelectedSettlement, mutate]
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
    <Card className="p-0 border-1 gap-0">
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
        <div className="flex flex-col h-[240px]">
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
