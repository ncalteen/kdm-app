'use client'

import {
  NewPatternItem,
  PatternItem
} from '@/components/settlement/patterns/pattern-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPatterns } from '@/lib/dal/pattern'
import {
  addSettlementPatterns,
  removeSettlementPattern
} from '@/lib/dal/settlement-pattern'
import {
  ERROR_MESSAGE,
  PATTERN_REMOVED_MESSAGE,
  PATTERN_UPDATED_MESSAGE
} from '@/lib/messages'
import { PatternDetail, SettlementDetail } from '@/lib/types'
import { PlusIcon, ScissorsLineDashedIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Patterns Card Properties
 */
interface PatternsCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Patterns Card Component
 *
 * Displays the patterns linked to a settlement and allows users to add and
 * remove patterns. All mutations are applied optimistically so the UI updates
 * before the database transaction completes.
 *
 * @param props Patterns Card Properties
 * @returns Patterns Card Component
 */
export function PatternsCard({
  selectedSettlement,
  setSelectedSettlement
}: PatternsCardProps): ReactElement {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  const [availablePatterns, setAvailablePatterns] = useState<{
    [key: string]: PatternDetail
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

    getPatterns()
      .then((patterns) => {
        if (cancelled) return
        setAvailablePatterns(patterns)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setAvailablePatterns({})
        setHasFetched(true)
        console.error('Settlement Patterns Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched])

  const selectablePatterns = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.patterns ?? []).map((p) => p.pattern_id)
    )
    return Object.values(availablePatterns)
      .filter((p) => !linkedIds.has(p.id))
      .sort((a, b) => a.pattern_name.localeCompare(b.pattern_name))
  }, [availablePatterns, selectedSettlement?.patterns])

  const sortedPatterns = useMemo(
    () =>
      (selectedSettlement?.patterns ?? [])
        .map((item, originalIndex) => ({ item, originalIndex }))
        .sort((a, b) => a.item.pattern_name.localeCompare(b.item.pattern_name)),
    [selectedSettlement?.patterns]
  )

  const handleAdd = useCallback(
    (patternId: string | undefined) => {
      if (!patternId || !selectedSettlement) return setIsAddingNew(false)

      const patternInfo = availablePatterns[patternId]
      if (!patternInfo) return setIsAddingNew(false)

      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementDetail['patterns'][0] = {
        id: tempId,
        pattern_id: patternId,
        pattern_name: patternInfo.pattern_name
      }

      const updatedPatterns = [...selectedSettlement.patterns, optimisticRow]

      setSelectedSettlement({
        ...selectedSettlement,
        patterns: updatedPatterns
      })
      setIsAddingNew(false)

      addSettlementPatterns([patternId], selectedSettlement.id)
        .then((row) => {
          setSelectedSettlement({
            ...selectedSettlement,
            patterns: updatedPatterns.map((p) =>
              p.id === tempId ? { ...p, id: row[0].id } : p
            )
          })
          toast.success(PATTERN_UPDATED_MESSAGE())
        })
        .catch((err: unknown) => {
          setSelectedSettlement({
            ...selectedSettlement,
            patterns: selectedSettlement.patterns
          })
          console.error('Pattern Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availablePatterns, setSelectedSettlement]
  )

  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.patterns[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        patterns: selectedSettlement.patterns.filter((p) => p.id !== removed.id)
      })

      removeSettlementPattern(removed.id)
        .then(() => toast.success(PATTERN_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setSelectedSettlement({
            ...selectedSettlement,
            patterns: [
              ...selectedSettlement.patterns.slice(0, index),
              removed,
              ...selectedSettlement.patterns.slice(index)
            ]
          })
          console.error('Pattern Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <ScissorsLineDashedIcon className="h-4 w-4" />
          Patterns
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew || selectablePatterns.length === 0}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[200px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.patterns ||
              selectedSettlement.patterns.length === 0) &&
              !isAddingNew &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No patterns yet
                </p>
              )}

            {!hasFetched && !selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading patterns...
              </p>
            )}

            {hasFetched &&
              sortedPatterns.map(({ item, originalIndex }) => (
                <PatternItem
                  key={item.id}
                  index={originalIndex}
                  pattern={item}
                  onRemove={handleRemove}
                />
              ))}

            {isAddingNew && (
              <NewPatternItem
                availablePatterns={selectablePatterns}
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
