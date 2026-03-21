'use client'

import {
  NewPhilosophyItem,
  PhilosophyItem
} from '@/components/settlement/arc/philosophy-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPhilosophies } from '@/lib/dal/philosophy'
import {
  addSettlementPhilosophies,
  removeSettlementPhilosophy
} from '@/lib/dal/settlement-philosophy'
import {
  ERROR_MESSAGE,
  PHILOSOPHY_CREATED_MESSAGE,
  PHILOSOPHY_REMOVED_MESSAGE
} from '@/lib/messages'
import { PhilosophyDetail, SettlementDetail } from '@/lib/types'
import { BrainCogIcon, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Philosophies Card Properties
 */
interface PhilosophiesCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Philosophies Card Component
 *
 * Displays the philosophies linked to a settlement and allows users to add and
 * remove them. All mutations are applied optimistically so the UI updates
 * before the database transaction completes.
 *
 * @param props Philosophies Card Properties
 * @returns Philosophies Card Component
 */
export function PhilosophiesCard({
  selectedSettlement,
  setSelectedSettlement
}: PhilosophiesCardProps): ReactElement {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  // Available philosophies for the select dropdown (fetched once per settlement).
  const [availablePhilosophies, setAvailablePhilosophies] = useState<{
    [key: string]: PhilosophyDetail
  }>({})

  // Track the previous settlement ID to reset state on settlement change.
  const [prevSettlementId, setPrevSettlementId] = useState<string | null>(
    selectedSettlement?.id ?? null
  )

  if (selectedSettlement?.id !== prevSettlementId) {
    setPrevSettlementId(selectedSettlement?.id ?? null)
    setIsAddingNew(false)
    setHasFetched(false)
  }

  // Fetch available philosophy options when settlement changes.
  useEffect(() => {
    if (!selectedSettlement?.id || hasFetched) return

    let cancelled = false

    getPhilosophies()
      .then((philosophies) => {
        if (cancelled) return

        setAvailablePhilosophies(philosophies)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        setAvailablePhilosophies({})
        setHasFetched(true)

        console.error('Philosophies Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched])

  /**
   * Sorted Philosophies
   *
   * Alphabetically sorted view of the settlement's philosophies, preserving
   * original indices so handlers operate on the correct source array element.
   */
  const sortedPhilosophies = useMemo(
    () =>
      (selectedSettlement?.philosophies ?? [])
        .map((item, originalIndex) => ({
          item,
          originalIndex
        }))
        .sort((a, b) =>
          a.item.philosophy_name.localeCompare(b.item.philosophy_name)
        ),
    [selectedSettlement?.philosophies]
  )

  /**
   * Handle Add Philosophy
   *
   * Optimistically adds a philosophy to the settlement, then persists to the
   * DB.
   *
   * @param philosophyId Philosophy ID
   */
  const handleAdd = useCallback(
    (philosophyId: string | undefined) => {
      if (!philosophyId || !selectedSettlement) return setIsAddingNew(false)

      const philosophyInfo = availablePhilosophies[philosophyId]
      if (!philosophyInfo) return setIsAddingNew(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementDetail['philosophies'][0] = {
        id: tempId,
        philosophy_id: philosophyId,
        philosophy_name: philosophyInfo.philosophy_name
      }

      const updatedPhilosophies = [
        ...(selectedSettlement.philosophies ?? []),
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        philosophies: updatedPhilosophies
      })
      setIsAddingNew(false)

      addSettlementPhilosophies([philosophyId], selectedSettlement.id)
        .then((rows) => {
          // Replace the placeholder with the real row from the DB.
          setSelectedSettlement({
            ...selectedSettlement,
            philosophies: updatedPhilosophies.map((p) =>
              p.id === tempId ? { ...p, id: rows[0].id } : p
            )
          })

          toast.success(PHILOSOPHY_CREATED_MESSAGE())
        })
        .catch((err: unknown) => {
          // Revert to the original philosophies (before the optimistic add).
          setSelectedSettlement({
            ...selectedSettlement,
            philosophies: selectedSettlement.philosophies
          })

          console.error('Philosophy Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availablePhilosophies, setSelectedSettlement]
  )

  /**
   * Handle Remove Philosophy
   *
   * Optimistically removes a philosophy from the settlement, then persists to
   * the DB.
   *
   * @param index Settlement Philosophy Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = (selectedSettlement.philosophies ?? [])[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        philosophies: (selectedSettlement.philosophies ?? []).filter(
          (p) => p.id !== removed.id
        )
      })

      removeSettlementPhilosophy(removed.id)
        .then(() => toast.success(PHILOSOPHY_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          // Revert the optimistic removal.
          setSelectedSettlement({
            ...selectedSettlement,
            philosophies: [
              ...(selectedSettlement.philosophies ?? []).slice(0, index),
              removed,
              ...(selectedSettlement.philosophies ?? []).slice(index)
            ]
          })

          console.error('Philosophy Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <BrainCogIcon className="h-4 w-4" />
          Philosophies
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {/* Philosophies List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[200px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.philosophies ||
              selectedSettlement.philosophies.length === 0) &&
              !isAddingNew &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No philosophies yet
                </p>
              )}

            {!hasFetched && !selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading philosophies...
              </p>
            )}

            {hasFetched &&
              sortedPhilosophies.map(({ item, originalIndex }) => (
                <PhilosophyItem
                  key={item.id}
                  index={originalIndex}
                  onRemove={handleRemove}
                  philosophy={item}
                />
              ))}

            {isAddingNew && (
              <NewPhilosophyItem
                availablePhilosophiesMap={availablePhilosophies}
                excludeIds={(selectedSettlement?.philosophies ?? []).map(
                  (p) => p.philosophy_id
                )}
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
