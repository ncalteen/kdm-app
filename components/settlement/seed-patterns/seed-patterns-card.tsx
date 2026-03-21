'use client'

import {
  NewSeedPatternItem,
  SeedPatternItem
} from '@/components/settlement/seed-patterns/seed-pattern-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSeedPatterns } from '@/lib/dal/seed-pattern'
import {
  addSettlementSeedPatterns,
  removeSettlementSeedPattern
} from '@/lib/dal/settlement-seed-pattern'
import {
  ERROR_MESSAGE,
  SEED_PATTERN_REMOVED_MESSAGE,
  SEED_PATTERN_UPDATED_MESSAGE
} from '@/lib/messages'
import { SeedPatternDetail, SettlementDetail } from '@/lib/types'
import { BeanIcon, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Seed Patterns Card Properties
 */
interface SeedPatternsCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Seed Patterns Card Component
 *
 * Displays the seed patterns linked to a settlement and allows users to add
 * and remove seed patterns. All mutations are applied optimistically so the UI
 * updates before the database transaction completes.
 *
 * @param props Seed Patterns Card Properties
 * @returns Seed Patterns Card Component
 */
export function SeedPatternsCard({
  selectedSettlement,
  setSelectedSettlement
}: SeedPatternsCardProps): ReactElement {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  const [availableSeedPatterns, setAvailableSeedPatterns] = useState<{
    [key: string]: SeedPatternDetail
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

    getSeedPatterns()
      .then((seedPatterns) => {
        if (cancelled) return
        setAvailableSeedPatterns(seedPatterns)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setAvailableSeedPatterns({})
        setHasFetched(true)
        console.error('Settlement Seed Patterns Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched])

  const selectableSeedPatterns = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.seed_patterns ?? []).map((sp) => sp.seed_pattern_id)
    )
    return Object.values(availableSeedPatterns)
      .filter((sp) => !linkedIds.has(sp.id))
      .sort((a, b) => a.seed_pattern_name.localeCompare(b.seed_pattern_name))
  }, [availableSeedPatterns, selectedSettlement?.seed_patterns])

  const sortedSeedPatterns = useMemo(
    () =>
      (selectedSettlement?.seed_patterns ?? [])
        .map((item, originalIndex) => ({ item, originalIndex }))
        .sort((a, b) =>
          a.item.seed_pattern_name.localeCompare(b.item.seed_pattern_name)
        ),
    [selectedSettlement?.seed_patterns]
  )

  const handleAdd = useCallback(
    (seedPatternId: string | undefined) => {
      if (!seedPatternId || !selectedSettlement) return setIsAddingNew(false)

      const seedPatternInfo = availableSeedPatterns[seedPatternId]
      if (!seedPatternInfo) return setIsAddingNew(false)

      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementDetail['seed_patterns'][0] = {
        id: tempId,
        seed_pattern_id: seedPatternId,
        seed_pattern_name: seedPatternInfo.seed_pattern_name
      }

      const updatedSeedPatterns = [
        ...selectedSettlement.seed_patterns,
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        seed_patterns: updatedSeedPatterns
      })
      setIsAddingNew(false)

      addSettlementSeedPatterns([seedPatternId], selectedSettlement.id)
        .then((row) => {
          setSelectedSettlement({
            ...selectedSettlement,
            seed_patterns: updatedSeedPatterns.map((sp) =>
              sp.id === tempId ? { ...sp, id: row[0].id } : sp
            )
          })
          toast.success(SEED_PATTERN_UPDATED_MESSAGE())
        })
        .catch((err: unknown) => {
          setSelectedSettlement({
            ...selectedSettlement,
            seed_patterns: selectedSettlement.seed_patterns
          })
          console.error('Seed Pattern Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availableSeedPatterns, setSelectedSettlement]
  )

  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.seed_patterns[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        seed_patterns: selectedSettlement.seed_patterns.filter(
          (sp) => sp.id !== removed.id
        )
      })

      removeSettlementSeedPattern(removed.id)
        .then(() => toast.success(SEED_PATTERN_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setSelectedSettlement({
            ...selectedSettlement,
            seed_patterns: [
              ...selectedSettlement.seed_patterns.slice(0, index),
              removed,
              ...selectedSettlement.seed_patterns.slice(index)
            ]
          })
          console.error('Seed Pattern Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <BeanIcon className="h-4 w-4" />
          Seed Patterns
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew || selectableSeedPatterns.length === 0}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[200px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.seed_patterns ||
              selectedSettlement.seed_patterns.length === 0) &&
              !isAddingNew &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No seed patterns yet
                </p>
              )}

            {!hasFetched && !selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading seed patterns...
              </p>
            )}

            {hasFetched &&
              sortedSeedPatterns.map(({ item, originalIndex }) => (
                <SeedPatternItem
                  key={item.id}
                  index={originalIndex}
                  seedPattern={item}
                  onRemove={handleRemove}
                />
              ))}

            {isAddingNew && (
              <NewSeedPatternItem
                availableSeedPatterns={selectableSeedPatterns}
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
