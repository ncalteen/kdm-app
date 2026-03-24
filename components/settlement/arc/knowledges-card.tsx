'use client'

import {
  KnowledgeItem,
  NewKnowledgeItem
} from '@/components/settlement/arc/knowledge-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getKnowledges } from '@/lib/dal/knowledge'
import {
  addSettlementKnowledges,
  removeSettlementKnowledge
} from '@/lib/dal/settlement-knowledge'
import {
  ERROR_MESSAGE,
  KNOWLEDGE_CREATED_MESSAGE,
  KNOWLEDGE_REMOVED_MESSAGE
} from '@/lib/messages'
import { KnowledgeDetail, SettlementDetail } from '@/lib/types'
import { GraduationCapIcon, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Knowledges Card Properties
 */
interface KnowledgesCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Knowledges Card Component
 *
 * Displays the knowledges linked to a settlement and allows users to add and
 * remove them. All mutations are applied optimistically so the UI updates
 * before the database transaction completes.
 *
 * @param props Knowledges Card Properties
 * @returns Knowledges Card Component
 */
export function KnowledgesCard({
  selectedSettlement,
  setSelectedSettlement
}: KnowledgesCardProps): ReactElement {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  // Available knowledges for the select dropdown (fetched once per settlement).
  const [availableKnowledges, setAvailableKnowledges] = useState<{
    [key: string]: KnowledgeDetail
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

  // Fetch available knowledge options when settlement changes.
  useEffect(() => {
    if (!selectedSettlement?.id || hasFetched) return

    let cancelled = false

    getKnowledges()
      .then((knowledges) => {
        if (cancelled) return

        setAvailableKnowledges(knowledges)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        setAvailableKnowledges({})
        setHasFetched(true)

        console.error('Knowledges Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched])

  /**
   * Sorted Knowledges
   *
   * Alphabetically sorted view of the settlement's knowledges, preserving
   * original indices so handlers operate on the correct source array element.
   */
  const sortedKnowledges = useMemo(
    () =>
      (selectedSettlement?.knowledges ?? [])
        .map((item, originalIndex) => ({
          item,
          originalIndex
        }))
        .sort((a, b) =>
          a.item.knowledge_name.localeCompare(b.item.knowledge_name)
        ),
    [selectedSettlement?.knowledges]
  )

  /**
   * Handle Add Knowledge
   *
   * Optimistically adds a knowledge to the settlement, then persists to the
   * DB.
   *
   * @param knowledgeId Knowledge ID
   */
  const handleAdd = useCallback(
    (knowledgeId: string | undefined) => {
      if (!knowledgeId || !selectedSettlement) return setIsAddingNew(false)

      const knowledgeInfo = availableKnowledges[knowledgeId]
      if (!knowledgeInfo) return setIsAddingNew(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementDetail['knowledges'][0] = {
        id: tempId,
        knowledge_id: knowledgeId,
        knowledge_name: knowledgeInfo.knowledge_name
      }

      const updatedKnowledges = [
        ...(selectedSettlement.knowledges ?? []),
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        knowledges: updatedKnowledges
      })
      setIsAddingNew(false)

      addSettlementKnowledges([knowledgeId], selectedSettlement.id)
        .then((rows) => {
          // Replace the placeholder with the real row from the DB.
          setSelectedSettlement({
            ...selectedSettlement,
            knowledges: updatedKnowledges.map((k) =>
              k.id === tempId ? { ...k, id: rows[0].id } : k
            )
          })

          toast.success(KNOWLEDGE_CREATED_MESSAGE())
        })
        .catch((err: unknown) => {
          // Revert to the original knowledges (before the optimistic add).
          setSelectedSettlement({
            ...selectedSettlement,
            knowledges: selectedSettlement.knowledges
          })

          console.error('Knowledge Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availableKnowledges, setSelectedSettlement]
  )

  /**
   * Handle Remove Knowledge
   *
   * Optimistically removes a knowledge from the settlement, then persists to
   * the DB.
   *
   * @param index Settlement Knowledge Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = (selectedSettlement.knowledges ?? [])[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        knowledges: (selectedSettlement.knowledges ?? []).filter(
          (k) => k.id !== removed.id
        )
      })

      removeSettlementKnowledge(removed.id)
        .then(() => toast.success(KNOWLEDGE_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          // Revert the optimistic removal.
          setSelectedSettlement({
            ...selectedSettlement,
            knowledges: [
              ...(selectedSettlement.knowledges ?? []).slice(0, index),
              removed,
              ...(selectedSettlement.knowledges ?? []).slice(index)
            ]
          })

          console.error('Knowledge Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <GraduationCapIcon className="h-4 w-4" />
          Knowledges
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

      {/* Knowledges List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[200px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.knowledges ||
              selectedSettlement.knowledges.length === 0) &&
              !isAddingNew &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No knowledges yet
                </p>
              )}

            {!hasFetched && !selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading knowledges...
              </p>
            )}

            {hasFetched &&
              sortedKnowledges.map(({ item, originalIndex }) => (
                <KnowledgeItem
                  key={item.id}
                  index={originalIndex}
                  knowledge={item}
                  onRemove={handleRemove}
                />
              ))}

            {isAddingNew && (
              <NewKnowledgeItem
                availableKnowledgesMap={availableKnowledges}
                excludeIds={(selectedSettlement?.knowledges ?? []).map(
                  (k) => k.knowledge_id
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
