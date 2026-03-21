'use client'

import {
  NewPrincipleItem,
  PrincipleItem
} from '@/components/settlement/principles/principle-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getPrinciples } from '@/lib/dal/principle'
import {
  addSettlementPrinciples,
  removeSettlementPrinciple,
  updateSettlementPrinciple
} from '@/lib/dal/settlement-principle'
import {
  ERROR_MESSAGE,
  PRINCIPLE_OPTION_SELECTED_MESSAGE,
  PRINCIPLE_REMOVED_MESSAGE,
  PRINCIPLE_UPDATED_MESSAGE
} from '@/lib/messages'
import { PrincipleDetail, SettlementDetail } from '@/lib/types'
import { PlusIcon, StampIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Principles Card Properties
 */
interface PrinciplesCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Principles Card Component
 *
 * Displays the principles linked to a settlement and allows users to add,
 * remove, and toggle option selection. All mutations are applied optimistically
 * so the UI updates before the database transaction completes.
 *
 * @param props Principles Card Properties
 * @returns Principles Card Component
 */
export function PrinciplesCard({
  selectedSettlement,
  setSelectedSettlement
}: PrinciplesCardProps): ReactElement {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  // Available principles for the select dropdown (fetched once per settlement).
  const [availablePrinciples, setAvailablePrinciples] = useState<{
    [key: string]: PrincipleDetail
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

  // Fetch available principle options when settlement changes.
  useEffect(() => {
    if (!selectedSettlement?.id || hasFetched) return

    let cancelled = false

    getPrinciples()
      .then((principles) => {
        if (cancelled) return

        setAvailablePrinciples(principles)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        setAvailablePrinciples({})
        setHasFetched(true)

        console.error('Settlement Principles Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched])

  /**
   * Available Principles Not Yet Added
   *
   * Filters the full list of available principles to only those not already
   * linked to the settlement, preventing duplicates in the add dropdown.
   */
  const selectablePrinciples = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.principles ?? []).map((p) => p.principle_id)
    )
    return Object.values(availablePrinciples).filter(
      (p) => !linkedIds.has(p.id)
    )
  }, [availablePrinciples, selectedSettlement?.principles])

  /**
   * Sorted Principles
   *
   * Alphabetically sorted view of the settlement's principles, preserving
   * original indices so handlers operate on the correct source array element.
   */
  const sortedPrinciples = useMemo(
    () =>
      (selectedSettlement?.principles ?? [])
        .map((item, originalIndex) => ({
          item,
          originalIndex
        }))
        .sort((a, b) =>
          a.item.principle_name.localeCompare(b.item.principle_name)
        ),
    [selectedSettlement?.principles]
  )

  /**
   * Handle Add Principle
   *
   * Optimistically adds a principle to the settlement, then persists to the
   * DB.
   *
   * @param principleId Principle ID
   */
  const handleAdd = useCallback(
    (principleId: string | undefined) => {
      if (!principleId || !selectedSettlement) return setIsAddingNew(false)

      const principleInfo = availablePrinciples[principleId]
      if (!principleInfo) return setIsAddingNew(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementDetail['principles'][0] = {
        id: tempId,
        option_1_name: principleInfo.option_1_name,
        option_1_selected: false,
        option_2_name: principleInfo.option_2_name,
        option_2_selected: false,
        principle_id: principleId,
        principle_name: principleInfo.principle_name
      }

      // Capture the updated principles list so async callbacks reference it
      // instead of the stale pre-update closure value.
      const updatedPrinciples = [
        ...selectedSettlement.principles,
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        principles: updatedPrinciples
      })
      setIsAddingNew(false)

      addSettlementPrinciples([principleId], selectedSettlement.id)
        .then((row) => {
          // Replace the placeholder with the real row from the DB.
          setSelectedSettlement({
            ...selectedSettlement,
            principles: updatedPrinciples.map((p) =>
              p.id === tempId ? { ...p, id: row[0].id } : p
            )
          })

          toast.success(PRINCIPLE_UPDATED_MESSAGE(false))
        })
        .catch((err: unknown) => {
          // Revert to the original principles (before the optimistic add).
          setSelectedSettlement({
            ...selectedSettlement,
            principles: selectedSettlement.principles
          })

          console.error('Principle Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availablePrinciples, setSelectedSettlement]
  )

  /**
   * Handle Remove Principle
   *
   * Optimistically removes a principle from the settlement, then persists to
   * the DB.
   *
   * @param index Settlement Principle Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.principles[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        principles: selectedSettlement.principles.filter(
          (p) => p.id !== removed.id
        )
      })

      removeSettlementPrinciple(removed.id)
        .then(() => toast.success(PRINCIPLE_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          // Revert the optimistic removal.
          setSelectedSettlement({
            ...selectedSettlement,
            principles: [
              ...selectedSettlement.principles.slice(0, index),
              removed,
              ...selectedSettlement.principles.slice(index)
            ]
          })

          console.error('Principle Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  /**
   * Handle Option Select
   *
   * Optimistically toggles the selected option for a principle (mutually
   * exclusive), then persists to the DB.
   *
   * @param index Principle Index
   * @param option Selected Option (1 or 2)
   */
  const handleOptionSelect = useCallback(
    (index: number, option: 1 | 2) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.principles[index]
      if (!target) return

      const updatedOption1 = option === 1
      const updatedOption2 = option === 2

      setSelectedSettlement({
        ...selectedSettlement,
        principles: selectedSettlement.principles.map((p, i) =>
          i === index
            ? {
                ...p,
                option_1_selected: updatedOption1,
                option_2_selected: updatedOption2
              }
            : p
        )
      })

      updateSettlementPrinciple(target.id, {
        option_1_selected: updatedOption1,
        option_2_selected: updatedOption2
      })
        .then(() => {
          const optionName =
            option === 1 ? target.option_1_name : target.option_2_name
          toast.success(PRINCIPLE_OPTION_SELECTED_MESSAGE(optionName))
        })
        .catch((err: unknown) => {
          // Revert the optimistic toggle.
          setSelectedSettlement({
            ...selectedSettlement,
            principles: selectedSettlement.principles.map((p, i) =>
              i === index
                ? {
                    ...p,
                    option_1_selected: target.option_1_selected,
                    option_2_selected: target.option_2_selected
                  }
                : p
            )
          })

          console.error('Principle Option Select Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <StampIcon className="h-4 w-4" />
          Principles
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew || selectablePrinciples.length === 0}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {/* Principles List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[200px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.principles ||
              selectedSettlement.principles.length === 0) &&
              !isAddingNew &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No principles yet
                </p>
              )}

            {!hasFetched && !selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading principles...
              </p>
            )}

            {hasFetched &&
              sortedPrinciples.map(({ item, originalIndex }) => (
                <div key={item.id}>
                  <PrincipleItem
                    index={originalIndex}
                    onOptionSelect={handleOptionSelect}
                    onRemove={handleRemove}
                    principle={item}
                  />
                  <Separator className="my-1" />
                </div>
              ))}

            {isAddingNew && (
              <NewPrincipleItem
                availablePrinciples={selectablePrinciples}
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
