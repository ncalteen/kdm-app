'use client'

import { PatternItem } from '@/components/settlement/patterns/pattern-item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { LocalStateType } from '@/contexts/local-context'
import { useCatalogFetch } from '@/hooks/use-catalog-fetch'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { useToast } from '@/hooks/use-toast'
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
import {
  PatternDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { PlusIcon, ScissorsLineDashedIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Patterns Card Properties
 */
interface PatternsCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
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
  local,
  selectedSettlement,
  setSelectedSettlement
}: PatternsCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')

  const { data: availablePatterns, isLoaded: hasFetched } = useCatalogFetch<{
    [key: string]: PatternDetail
  }>(selectedSettlement?.id, () => getPatterns(), {
    initial: {},
    errorContext: 'Settlement Patterns Fetch Error',
    onReset: () => setAddOpen(false),
    onError: () => toast.error(ERROR_MESSAGE())
  })

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
      if (!patternId || !selectedSettlement) return

      const patternInfo = availablePatterns[patternId]
      if (!patternInfo) return

      setAddOpen(false)

      const tempId = `temp-${crypto.randomUUID()}`
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

      void mutate({
        context: 'Pattern Add',
        persist: () =>
          addSettlementPatterns([patternId], selectedSettlement.id),
        onSuccess: (row) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  patterns: prev.patterns.map((p) =>
                    p.id === tempId ? { ...p, id: row[0].id } : p
                  )
                }
              : null
          )
        },
        rollback: () => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  patterns: prev.patterns.filter((p) => p.id !== tempId)
                }
              : null
          )
        },
        successMessage: PATTERN_UPDATED_MESSAGE()
      })
    },
    [selectedSettlement, availablePatterns, setSelectedSettlement, mutate]
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

      void mutate({
        context: 'Pattern Remove',
        persist: () => removeSettlementPattern(removed.id),
        rollback: () => {
          setSelectedSettlement((prev) => {
            if (!prev || prev.patterns.some((p) => p.id === removed.id))
              return prev
            return { ...prev, patterns: [...prev.patterns, removed] }
          })
        },
        successMessage: PATTERN_REMOVED_MESSAGE()
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <ScissorsLineDashedIcon className="h-4 w-4" />
          Patterns
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-0 h-8 w-8"
                disabled={selectablePatterns.length === 0}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search patterns..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>No patterns found.</CommandEmpty>
                  <CommandGroup>
                    {selectablePatterns.map((pattern) => (
                      <CommandItem
                        key={pattern.id}
                        value={pattern.pattern_name}
                        onSelect={() => handleAdd(pattern.id)}>
                        {pattern.pattern_name}
                        {pattern.custom && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Custom
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[200px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.patterns ||
              selectedSettlement.patterns.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No patterns yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
