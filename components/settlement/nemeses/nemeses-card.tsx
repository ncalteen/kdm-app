'use client'

import {
  NemesisItem,
  NewNemesisItem
} from '@/components/settlement/nemeses/nemesis-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getNemesisNames } from '@/lib/dal/nemesis'
import {
  addNemesisToSettlement,
  getSettlementNemeses,
  NemesisDefeatedField,
  removeNemesisFromSettlement,
  SettlementNemesisRow,
  updateSettlementNemesisLevelDefeated,
  updateSettlementNemesisUnlocked
} from '@/lib/dal/settlement-nemesis'
import {
  NEMESIS_ADDED_MESSAGE,
  NEMESIS_REMOVED_MESSAGE,
  NEMESIS_UNLOCKED_MESSAGE
} from '@/lib/messages'
import { PlusIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Nemesis Node Sort Order
 *
 * Defines the display order for nemesis monster nodes.
 */
const NODE_ORDER: Record<string, number> = {
  NN1: 0,
  NN2: 1,
  NN3: 2,
  CO: 3,
  FI: 4
}

/**
 * Sort Nemeses
 *
 * Sorts nemeses by monster node in the defined order (NN1, NN2, NN3, CO, FI),
 * then alphabetically by monster name within the same node.
 *
 * @param rows Settlement Nemesis Rows
 * @returns Sorted Settlement Nemesis Rows
 */
function sortNemeses(rows: SettlementNemesisRow[]): SettlementNemesisRow[] {
  return [...rows].sort((a, b) => {
    const aOrder = NODE_ORDER[a.node] ?? Number.MAX_SAFE_INTEGER
    const bOrder = NODE_ORDER[b.node] ?? Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.monster_name.localeCompare(b.monster_name)
  })
}

/**
 * Nemeses Card Properties
 */
interface NemesesCardProps {
  /** Selected Settlement ID */
  selectedSettlementId: string | null
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
  selectedSettlementId
}: NemesesCardProps): ReactElement {
  const [items, setItems] = useState<SettlementNemesisRow[]>([])
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  // Available nemeses for the select dropdown (fetched once per settlement).
  const [availableNemeses, setAvailableNemeses] = useState<
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

  /**
   * Fetch settlement nemeses and available nemesis options when the settlement
   * changes. Both queries run in parallel to minimize load time.
   */
  useEffect(() => {
    if (!selectedSettlementId || hasFetched) return

    let cancelled = false

    Promise.all([getSettlementNemeses(selectedSettlementId), getNemesisNames()])
      .then(([nemeses, names]) => {
        if (cancelled) return

        setItems(sortNemeses(nemeses))
        setAvailableNemeses(names)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        console.error('Settlement Nemeses Fetch Error:', err)
        toast.error('The darkness swallows your words. Please try again.')
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
    const linkedIds = new Set(items.map((n) => n.nemesis_id))
    return availableNemeses.filter((n) => !linkedIds.has(n.id))
  }, [availableNemeses, items])

  /**
   * Handle Add Nemesis
   *
   * Optimistically adds a nemesis to the settlement, then persists to the DB.
   *
   * @param nemesisId Nemesis ID
   */
  const handleAdd = useCallback(
    (nemesisId: string | undefined) => {
      if (!nemesisId || !selectedSettlementId) {
        setIsAddingNew(false)
        return
      }

      const nemesisInfo = availableNemeses.find((n) => n.id === nemesisId)
      if (!nemesisInfo) {
        setIsAddingNew(false)
        return
      }

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementNemesisRow = {
        id: tempId,
        nemesis_id: nemesisId,
        monster_name: nemesisInfo.monster_name,
        node: '',
        unlocked: false,
        level_1_defeated: false,
        level_2_defeated: false,
        level_3_defeated: false,
        level_4_defeated: false,
        available_levels: []
      }

      setItems((prev) => sortNemeses([...prev, optimisticRow]))
      setIsAddingNew(false)

      addNemesisToSettlement(nemesisId, selectedSettlementId)
        .then((row) => {
          // Replace the placeholder with the real row from the DB.
          setItems((prev) =>
            sortNemeses(prev.map((item) => (item.id === tempId ? row : item)))
          )
          toast.success(NEMESIS_ADDED_MESSAGE())
        })
        .catch((err: unknown) => {
          // Revert the optimistic insert.
          setItems((prev) => prev.filter((item) => item.id !== tempId))
          console.error('Nemesis Add Error:', err)
          toast.error('The darkness swallows your words. Please try again.')
        })
    },
    [selectedSettlementId, availableNemeses]
  )

  /**
   * Handle Remove Nemesis
   *
   * Optimistically removes a nemesis from the settlement, then persists to the
   * DB.
   *
   * @param index Nemesis Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      const removed = items[index]
      if (!removed) return

      setItems((prev) => prev.filter((_, i) => i !== index))

      removeNemesisFromSettlement(removed.id)
        .then(() => toast.success(NEMESIS_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          // Revert the optimistic removal.
          setItems((prev) => {
            const restored = [...prev]
            restored.splice(index, 0, removed)
            return restored
          })
          console.error('Nemesis Remove Error:', err)
          toast.error('The darkness swallows your words. Please try again.')
        })
    },
    [items]
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
      const target = items[index]
      if (!target) return

      setItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, unlocked } : item))
      )

      updateSettlementNemesisUnlocked(target.id, unlocked)
        .then(() =>
          toast.success(NEMESIS_UNLOCKED_MESSAGE(target.monster_name, unlocked))
        )
        .catch((err: unknown) => {
          setItems((prev) =>
            prev.map((item, i) =>
              i === index ? { ...item, unlocked: !unlocked } : item
            )
          )
          console.error('Nemesis Toggle Error:', err)
          toast.error('The darkness swallows your words. Please try again.')
        })
    },
    [items]
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
    (index: number, field: NemesisDefeatedField, defeated: boolean) => {
      const target = items[index]
      if (!target) return

      setItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: defeated } : item
        )
      )

      updateSettlementNemesisLevelDefeated(target.id, field, defeated).catch(
        (err: unknown) => {
          // Revert the optimistic toggle.
          setItems((prev) =>
            prev.map((item, i) =>
              i === index ? { ...item, [field]: !defeated } : item
            )
          )
          console.error('Nemesis Level Toggle Error:', err)
          toast.error('The darkness swallows your words. Please try again.')
        }
      )
    },
    [items]
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
            {items.length === 0 && !isAddingNew && hasFetched && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No nemeses yet
              </p>
            )}

            {!hasFetched && selectedSettlementId && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading nemeses...
              </p>
            )}

            {items.map((nemesis, index) => (
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
