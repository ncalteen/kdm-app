'use client'

import {
  NewQuarryItem,
  QuarryItem
} from '@/components/settlement/quarries/quarry-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuarryNames } from '@/lib/dal/quarry'
import {
  addQuarryToSettlement,
  getSettlementQuarries,
  removeQuarryFromSettlement,
  SettlementQuarryRow,
  updateSettlementQuarryUnlocked
} from '@/lib/dal/settlement-quarry'
import {
  ERROR_MESSAGE,
  QUARRY_ADDED_MESSAGE,
  QUARRY_REMOVED_MESSAGE,
  QUARRY_UNLOCKED_MESSAGE
} from '@/lib/messages'
import { sortQuarries } from '@/lib/settlement/quarries'
import { PlusIcon, SwordIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Quarries Card Properties
 */
interface QuarriesCardProps {
  /** Selected Settlement ID */
  selectedSettlementId: string | null
}

/**
 * Quarries Card Component
 *
 * Displays the quarries linked to a settlement and allows users to add, remove,
 * and toggle the unlocked state of each quarry. All mutations are applied
 * optimistically so the UI updates before the database transaction completes.
 *
 * @param props Quarries Card Properties
 * @returns Quarries Card Component
 */
export function QuarriesCard({
  selectedSettlementId
}: QuarriesCardProps): ReactElement {
  const [items, setItems] = useState<SettlementQuarryRow[]>([])
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  // Available quarries for the select dropdown (fetched once per settlement).
  const [availableQuarries, setAvailableQuarries] = useState<
    { id: string; monster_name: string }[]
  >([])

  // Track the previous settlement ID to reset state on settlement change.
  const [prevSettlementId, setPrevSettlementId] = useState(selectedSettlementId)

  if (selectedSettlementId !== prevSettlementId) {
    setPrevSettlementId(selectedSettlementId)
    setItems([])
    setIsAddingNew(false)
    setHasFetched(false)
  }

  // Fetch settlement quarries and available quarry options when settlement
  // changes.
  useEffect(() => {
    if (!selectedSettlementId || hasFetched) return

    let cancelled = false

    Promise.all([getSettlementQuarries(selectedSettlementId), getQuarryNames()])
      .then(([quarries, names]) => {
        if (cancelled) return

        setItems(sortQuarries(quarries))
        setAvailableQuarries(names)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        setItems([])
        setAvailableQuarries([])
        setHasFetched(true)

        console.error('Settlement Quarries Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlementId, hasFetched])

  /**
   * Available Quarries Not Yet Added
   *
   * Filters the full list of available quarries to only those not already
   * linked to the settlement, preventing duplicates in the add dropdown.
   */
  const selectableQuarries = useMemo(() => {
    const linkedIds = new Set(items.map((q) => q.quarry_id))
    return availableQuarries.filter((q) => !linkedIds.has(q.id))
  }, [availableQuarries, items])

  /**
   * Handle Add Quarry
   *
   * Optimistically adds a quarry to the settlement, then persists to the DB.
   *
   * @param quarryId Quarry ID
   */
  const handleAdd = useCallback(
    (quarryId: string | undefined) => {
      if (!quarryId || !selectedSettlementId) return setIsAddingNew(false)

      const quarryInfo = availableQuarries.find((q) => q.id === quarryId)
      if (!quarryInfo) return setIsAddingNew(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementQuarryRow = {
        id: tempId,
        quarry_id: quarryId,
        monster_name: quarryInfo.monster_name,
        node: '',
        unlocked: false
      }

      setItems((prev) => sortQuarries([...prev, optimisticRow]))
      setIsAddingNew(false)

      addQuarryToSettlement(quarryId, selectedSettlementId)
        .then((row) => {
          // Replace the placeholder with the real row from the DB.
          setItems((prev) =>
            sortQuarries(prev.map((item) => (item.id === tempId ? row : item)))
          )

          toast.success(QUARRY_ADDED_MESSAGE())
        })
        .catch((err: unknown) => {
          // Revert the optimistic insert.
          setItems((prev) => prev.filter((item) => item.id !== tempId))

          console.error('Quarry Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlementId, availableQuarries]
  )

  /**
   * Handle Remove Quarry
   *
   * Optimistically removes a quarry from the settlement, then persists to the
   * DB.
   *
   * @param index Quarry Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      const removed = items[index]
      if (!removed) return

      setItems((prev) => prev.filter((_, i) => i !== index))

      removeQuarryFromSettlement(removed.id)
        .then(() => toast.success(QUARRY_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          // Revert the optimistic removal.
          setItems((prev) => {
            const restored = [...prev]
            restored.splice(index, 0, removed)
            return restored
          })

          console.error('Quarry Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items]
  )

  /**
   * Handle Toggle Unlocked
   *
   * Optimistically toggles the unlocked state of a quarry, then persists to
   * the DB.
   *
   * @param index Quarry Index
   * @param unlocked New Unlocked State
   */
  const handleToggleUnlocked = useCallback(
    (index: number, unlocked: boolean) => {
      const target = items[index]
      if (!target) return

      // Optimistic update.
      setItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, unlocked } : item))
      )

      updateSettlementQuarryUnlocked(target.id, unlocked)
        .then(() =>
          toast.success(QUARRY_UNLOCKED_MESSAGE(target.monster_name, unlocked))
        )
        .catch((err: unknown) => {
          // Revert the optimistic toggle.
          setItems((prev) =>
            prev.map((item, i) =>
              i === index ? { ...item, unlocked: !unlocked } : item
            )
          )

          console.error('Quarry Toggle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <SwordIcon className="h-4 w-4" />
          Quarries
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew || selectableQuarries.length === 0}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {/* Quarries List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[240px]">
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 && !isAddingNew && hasFetched && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No quarries yet
              </p>
            )}

            {!hasFetched && selectedSettlementId && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading quarries...
              </p>
            )}

            {items.map((quarry, index) => (
              <QuarryItem
                key={quarry.id}
                index={index}
                monsterName={quarry.monster_name}
                node={quarry.node}
                onRemove={handleRemove}
                onToggleUnlocked={handleToggleUnlocked}
                unlocked={quarry.unlocked}
              />
            ))}

            {isAddingNew && (
              <NewQuarryItem
                availableQuarries={selectableQuarries}
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
