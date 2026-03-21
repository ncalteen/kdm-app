'use client'

import {
  NewResourceItem,
  ResourceItem
} from '@/components/settlement/resources/resource-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ResourceDetail, SettlementDetail } from '@/lib/types'
import { BeefIcon, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Resources Card Properties
 */
interface ResourcesCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
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
  selectedSettlement,
  setSelectedSettlement
}: ResourcesCardProps): ReactElement {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  const [availableResources, setAvailableResources] = useState<{
    [key: string]: ResourceDetail
  }>({})

  const [prevSettlementId, setPrevSettlementId] = useState<string | null>(
    selectedSettlement?.id ?? null
  )

  if (selectedSettlement?.id !== prevSettlementId) {
    setPrevSettlementId(selectedSettlement?.id ?? null)
    setIsAddingNew(false)
    setHasFetched(false)
  }

  useEffect(() => {
    if (!selectedSettlement?.id || hasFetched) return

    let cancelled = false

    getResources()
      .then((resources) => {
        if (cancelled) return
        setAvailableResources(resources)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setAvailableResources({})
        setHasFetched(true)
        console.error('Settlement Resources Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched])

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
      if (!resourceId || !selectedSettlement) return setIsAddingNew(false)

      const resourceInfo = availableResources[resourceId]
      if (!resourceInfo) return setIsAddingNew(false)

      const tempId = `temp-${Date.now()}`

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
      setIsAddingNew(false)

      addSettlementResources([resourceId], selectedSettlement.id)
        .then((row) => {
          setSelectedSettlement({
            ...selectedSettlement,
            resources: updatedResources.map((r) =>
              r.id === tempId ? { ...r, id: row[0].id } : r
            )
          })
          toast.success(RESOURCE_UPDATED_MESSAGE())
        })
        .catch((err: unknown) => {
          setSelectedSettlement({
            ...selectedSettlement,
            resources: selectedSettlement.resources
          })
          console.error('Resource Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availableResources, setSelectedSettlement]
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

      removeSettlementResource(removed.id)
        .then(() => toast.success(RESOURCE_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setSelectedSettlement({
            ...selectedSettlement,
            resources: [
              ...selectedSettlement.resources.slice(0, index),
              removed,
              ...selectedSettlement.resources.slice(index)
            ]
          })
          console.error('Resource Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
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

      updateSettlementResource(target.id, { quantity })
        .then(() => toast.success(RESOURCE_UPDATED_MESSAGE(index)))
        .catch((err: unknown) => {
          setSelectedSettlement({
            ...selectedSettlement,
            resources: selectedSettlement.resources.map((r, i) =>
              i === index ? { ...r, quantity: oldQuantity } : r
            )
          })
          console.error('Resource Quantity Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <BeefIcon className="h-4 w-4" />
          Resource Storage
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew || selectableResources.length === 0}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[240px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.resources ||
              selectedSettlement.resources.length === 0) &&
              !isAddingNew &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No resources yet
                </p>
              )}

            {!hasFetched && !selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading resources...
              </p>
            )}

            {hasFetched &&
              sortedResources.map(({ item, originalIndex }) => (
                <ResourceItem
                  key={item.id}
                  index={originalIndex}
                  resource={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}

            {isAddingNew && (
              <NewResourceItem
                availableResources={selectableResources}
                onCancel={() => setIsAddingNew(false)}
                onSave={handleAdd}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
