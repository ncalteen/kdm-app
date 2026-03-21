'use client'

import { GearItem, NewGearItem } from '@/components/settlement/gear/gear-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGear } from '@/lib/dal/gear'
import {
  addSettlementGear,
  removeSettlementGear,
  updateSettlementGear
} from '@/lib/dal/settlement-gear'
import {
  ERROR_MESSAGE,
  GEAR_REMOVED_MESSAGE,
  GEAR_UPDATED_MESSAGE
} from '@/lib/messages'
import { GearDetail, SettlementDetail } from '@/lib/types'
import { PlusIcon, WrenchIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Gear Card Properties
 */
interface GearCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Gear Card Component
 *
 * Displays the gear linked to a settlement and allows users to add, remove,
 * and adjust quantity. All mutations are applied optimistically so the UI
 * updates before the database transaction completes.
 *
 * @param props Gear Card Properties
 * @returns Gear Card Component
 */
export function GearCard({
  selectedSettlement,
  setSelectedSettlement
}: GearCardProps): ReactElement {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  const [availableGear, setAvailableGear] = useState<{
    [key: string]: GearDetail
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

    getGear()
      .then((gear) => {
        if (cancelled) return
        setAvailableGear(gear)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setAvailableGear({})
        setHasFetched(true)
        console.error('Settlement Gear Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched])

  const selectableGear = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.gear ?? []).map((g) => g.gear_id)
    )
    return Object.values(availableGear)
      .filter((g) => !linkedIds.has(g.id))
      .sort((a, b) => a.gear_name.localeCompare(b.gear_name))
  }, [availableGear, selectedSettlement?.gear])

  const sortedGear = useMemo(
    () =>
      (selectedSettlement?.gear ?? [])
        .map((item, originalIndex) => ({ item, originalIndex }))
        .sort((a, b) => a.item.gear_name.localeCompare(b.item.gear_name)),
    [selectedSettlement?.gear]
  )

  /**
   * Handle Add Gear
   *
   * Optimistically adds a gear item to the settlement, then persists to the
   * DB.
   *
   * @param gearId Gear ID
   */
  const handleAdd = useCallback(
    (gearId: string | undefined) => {
      if (!gearId || !selectedSettlement) return setIsAddingNew(false)

      const gearInfo = availableGear[gearId]
      if (!gearInfo) return setIsAddingNew(false)

      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementDetail['gear'][0] = {
        gear_id: gearId,
        gear_name: gearInfo.gear_name,
        id: tempId,
        quantity: 1
      }

      const updatedGear = [...selectedSettlement.gear, optimisticRow]

      setSelectedSettlement({
        ...selectedSettlement,
        gear: updatedGear
      })
      setIsAddingNew(false)

      addSettlementGear({
        gear_id: gearId,
        quantity: 1,
        settlement_id: selectedSettlement.id
      })
        .then((id) => {
          setSelectedSettlement({
            ...selectedSettlement,
            gear: updatedGear.map((g) => (g.id === tempId ? { ...g, id } : g))
          })
          toast.success(GEAR_UPDATED_MESSAGE())
        })
        .catch((err: unknown) => {
          setSelectedSettlement({
            ...selectedSettlement,
            gear: selectedSettlement.gear
          })
          console.error('Gear Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availableGear, setSelectedSettlement]
  )

  /**
   * Handle Remove Gear
   *
   * Optimistically removes a gear item from the settlement, then persists to
   * the DB.
   *
   * @param index Settlement Gear Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.gear[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        gear: selectedSettlement.gear.filter((g) => g.id !== removed.id)
      })

      removeSettlementGear(removed.id)
        .then(() => toast.success(GEAR_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setSelectedSettlement({
            ...selectedSettlement,
            gear: [
              ...selectedSettlement.gear.slice(0, index),
              removed,
              ...selectedSettlement.gear.slice(index)
            ]
          })
          console.error('Gear Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  /**
   * Handle Quantity Change
   *
   * Optimistically updates the quantity of a gear item, then persists to the
   * DB.
   *
   * @param index Gear Index
   * @param quantity New Quantity
   */
  const handleQuantityChange = useCallback(
    (index: number, quantity: number) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.gear[index]
      if (!target) return

      const oldQuantity = target.quantity

      setSelectedSettlement({
        ...selectedSettlement,
        gear: selectedSettlement.gear.map((g, i) =>
          i === index ? { ...g, quantity } : g
        )
      })

      updateSettlementGear(target.id, { quantity })
        .then(() => toast.success(GEAR_UPDATED_MESSAGE(index)))
        .catch((err: unknown) => {
          setSelectedSettlement({
            ...selectedSettlement,
            gear: selectedSettlement.gear.map((g, i) =>
              i === index ? { ...g, quantity: oldQuantity } : g
            )
          })
          console.error('Gear Quantity Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <WrenchIcon className="h-4 w-4" />
          Gear Storage
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew || selectableGear.length === 0}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[240px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.gear ||
              selectedSettlement.gear.length === 0) &&
              !isAddingNew &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No gear yet
                </p>
              )}

            {!hasFetched && !selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading gear...
              </p>
            )}

            {hasFetched &&
              sortedGear.map(({ item, originalIndex }) => (
                <GearItem
                  key={item.id}
                  index={originalIndex}
                  gear={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}

            {isAddingNew && (
              <NewGearItem
                availableGear={selectableGear}
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
