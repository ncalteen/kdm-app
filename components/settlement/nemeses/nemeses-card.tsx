'use client'

import {
  NemesisItem,
  NewNemesisItem
} from '@/components/settlement/nemeses/nemesis-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getNemeses } from '@/lib/dal/nemesis'
import {
  addSettlementNemeses,
  removeSettlementNemesis,
  updateSettlementNemesis
} from '@/lib/dal/settlement-nemesis'
import {
  ERROR_MESSAGE,
  NEMESIS_ADDED_MESSAGE,
  NEMESIS_DEFEATED_MESSAGE,
  NEMESIS_REMOVED_MESSAGE,
  NEMESIS_UNLOCKED_MESSAGE
} from '@/lib/messages'
import { sortNemeses } from '@/lib/settlement/nemeses'
import { NemesisDetail, SettlementDetail } from '@/lib/types'
import { PlusIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Nemeses Card Properties
 */
interface NemesesCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement ID */
  selectedSettlementId: string | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Nemeses Card Component
 *
 * Displays the nemeses linked to a settlement and allows users to add, remove,
 * toggle the unlocked state, and track defeated levels. All mutations are
 * applied optimistically so the UI updates before the database transaction
 * completes.
 *
 * @param props Nemeses Card Properties
 * @returns Nemeses Card Component
 */
export function NemesesCard({
  selectedSettlement,
  selectedSettlementId,
  setSelectedSettlement
}: NemesesCardProps): ReactElement {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  // Available nemeses for the select dropdown (fetched once per settlement).
  const [availableNemeses, setAvailableNemeses] = useState<{
    [key: string]: NemesisDetail
  }>({})

  // Track the previous settlement ID to reset state on settlement change.
  const [prevSettlementId, setPrevSettlementId] = useState<string | null>(
    selectedSettlementId
  )

  if (selectedSettlementId !== prevSettlementId) {
    setPrevSettlementId(selectedSettlementId)
    setIsAddingNew(false)
    setHasFetched(false)
  }

  /**
   * Fetch settlement nemeses and available nemesis options when the settlement
   * changes. Both queries run in parallel to minimize load time.
   */
  useEffect(() => {
    if (!selectedSettlementId || hasFetched) return

    let cancelled = false

    Promise.all([getNemeses()])
      .then(([nemeses]) => {
        if (cancelled) return

        setAvailableNemeses(nemeses)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        setAvailableNemeses({})
        setHasFetched(true)

        console.error('Settlement Nemeses Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlementId, hasFetched])

  /**
   * Available Nemeses Not Yet Added
   *
   * Filters the full list of available nemeses to only those not already
   * linked to the settlement, preventing duplicates in the add dropdown.
   */
  const selectableNemeses = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.nemeses ?? []).map((n) => n.nemesis_id)
    )
    return Object.values(availableNemeses).filter((n) => !linkedIds.has(n.id))
  }, [availableNemeses, selectedSettlement?.nemeses])

  /**
   * Handle Add Nemesis
   *
   * Optimistically adds a nemesis to the settlement, then persists to the DB.
   *
   * @param nemesisId Nemesis ID
   */
  const handleAdd = useCallback(
    (nemesisId: string | undefined) => {
      if (!nemesisId || !selectedSettlement) return setIsAddingNew(false)

      const nemesisInfo = Object.values(availableNemeses).find(
        (n) => n.id === nemesisId
      )
      if (!nemesisInfo) return setIsAddingNew(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementDetail['nemeses'][0] = {
        available_levels: [],
        collective_cognition_level_1: false,
        collective_cognition_level_2: false,
        collective_cognition_level_3: false,
        id: tempId,
        level_1_defeated: false,
        level_2_defeated: false,
        level_3_defeated: false,
        level_4_defeated: false,
        monster_name: nemesisInfo.monster_name,
        nemesis_id: nemesisId,
        node: '',
        unlocked: false
      }

      setSelectedSettlement({
        ...selectedSettlement,
        nemeses: [...selectedSettlement.nemeses, optimisticRow]
      })
      setIsAddingNew(false)

      addSettlementNemeses([nemesisId], selectedSettlementId)
        .then((row) => {
          // Replace the placeholder with the real row from the DB.
          setSelectedSettlement({
            ...selectedSettlement,
            nemeses: sortNemeses(
              selectedSettlement.nemeses.map((n) =>
                n.id === tempId
                  ? {
                      ...n,
                      available_levels: row[0].available_levels,
                      id: row[0].id,
                      node: nemesisInfo.node
                    }
                  : n
              )
            )
          })

          toast.success(NEMESIS_ADDED_MESSAGE())
        })
        .catch((err: unknown) => {
          // Revert the optimistic insert.
          setSelectedSettlement({
            ...selectedSettlement,
            nemeses: selectedSettlement.nemeses.filter((n) => n.id !== tempId)
          })

          console.error('Nemesis Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      selectedSettlement,
      availableNemeses,
      setSelectedSettlement,
      selectedSettlementId
    ]
  )

  /**
   * Handle Remove Nemesis
   *
   * Optimistically removes a nemesis from the settlement, then persists to the
   * DB.
   *
   * @param index Settlement Nemesis Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.nemeses[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        nemeses: selectedSettlement.nemeses.filter((n) => n.id !== removed.id)
      })

      removeSettlementNemesis(removed.id)
        .then(() => toast.success(NEMESIS_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          // Revert the optimistic removal.
          setSelectedSettlement({
            ...selectedSettlement,
            nemeses: [
              ...selectedSettlement.nemeses.slice(0, index),
              removed,
              ...selectedSettlement.nemeses.slice(index)
            ]
          })

          console.error('Nemesis Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  /**
   * Handle Toggle Unlocked
   *
   * Optimistically toggles the unlocked state of a nemesis, then persists to
   * the DB.
   *
   * @param index Nemesis Index
   * @param unlocked New Unlocked State
   */
  const handleToggleUnlocked = useCallback(
    (index: number, unlocked: boolean) => {
      if (!selectedSettlement) return

      const target = selectedSettlement?.nemeses[index]
      if (!target) return

      setSelectedSettlement({
        ...selectedSettlement,
        nemeses: selectedSettlement.nemeses.map((n, i) =>
          i === index ? { ...n, unlocked } : n
        )
      })

      updateSettlementNemesis(target.id, { unlocked })
        .then(() =>
          toast.success(NEMESIS_UNLOCKED_MESSAGE(target.monster_name, unlocked))
        )
        .catch((err: unknown) => {
          // Revert the optimistic toggle.
          setSelectedSettlement({
            ...selectedSettlement,
            nemeses: selectedSettlement.nemeses.map((n, i) =>
              i === index ? { ...n, unlocked: !unlocked } : n
            )
          })

          console.error('Nemesis Toggle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  /**
   * Handle Toggle Level Defeated
   *
   * Optimistically toggles a defeated-level flag, then persists to the DB.
   *
   * @param index Nemesis Index
   * @param field Defeated Level Field
   * @param defeated Defeated Status
   */
  const handleToggleLevel = useCallback(
    (
      index: number,
      field:
        | 'level_1_defeated'
        | 'level_2_defeated'
        | 'level_3_defeated'
        | 'level_4_defeated',
      defeated: boolean
    ) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.nemeses[index]
      if (!target) return

      setSelectedSettlement({
        ...selectedSettlement,
        nemeses: selectedSettlement.nemeses.map((n, i) =>
          i === index ? { ...n, [field]: defeated } : n
        )
      })

      updateSettlementNemesis(target.id, { [field]: defeated })
        .then(() => toast.success(NEMESIS_DEFEATED_MESSAGE()))
        .catch((err: unknown) => {
          // Revert the optimistic toggle.
          setSelectedSettlement({
            ...selectedSettlement,
            nemeses: selectedSettlement.nemeses.map((n, i) =>
              i === index ? { ...n, [field]: !defeated } : n
            )
          })

          console.error('Nemesis Level Toggle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <SkullIcon className="h-4 w-4" />
          Nemesis Monsters
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew || selectableNemeses.length === 0}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {/* Nemeses List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[240px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement ||
              selectedSettlement?.nemeses.length === 0) &&
              !isAddingNew &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No nemeses yet
                </p>
              )}

            {!hasFetched && selectedSettlementId && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading nemeses...
              </p>
            )}

            {selectedSettlement?.nemeses.map((nemesis, index) => (
              <NemesisItem
                key={nemesis.id}
                index={index}
                monsterName={nemesis.monster_name}
                unlocked={nemesis.unlocked}
                level1Defeated={nemesis.level_1_defeated}
                level2Defeated={nemesis.level_2_defeated}
                level3Defeated={nemesis.level_3_defeated}
                level4Defeated={nemesis.level_4_defeated}
                availableLevels={nemesis.available_levels}
                onRemove={handleRemove}
                onToggleUnlocked={handleToggleUnlocked}
                onToggleLevel={handleToggleLevel}
              />
            ))}

            {isAddingNew && (
              <NewNemesisItem
                availableNemeses={selectableNemeses}
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
