'use client'

import { SeedPatternItem } from '@/components/settlement/seed-patterns/seed-pattern-item'
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
import { useToast } from '@/hooks/use-toast'
import { addSeedPattern, getSeedPatterns } from '@/lib/dal/seed-pattern'
import {
  addSettlementSeedPatterns,
  removeSettlementSeedPattern
} from '@/lib/dal/settlement-seed-pattern'
import {
  ERROR_MESSAGE,
  SEED_PATTERN_CREATED_MESSAGE,
  SEED_PATTERN_REMOVED_MESSAGE,
  SEED_PATTERN_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  SeedPatternDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { BeanIcon, Plus, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Seed Patterns Card Properties
 */
interface SeedPatternsCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
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
  local,
  selectedSettlement,
  setSelectedSettlement
}: SeedPatternsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  const [availableSeedPatterns, setAvailableSeedPatterns] = useState<{
    [key: string]: SeedPatternDetail
  }>({})

  const [prevSettlementId, setPrevSettlementId] = useState<string | null>(
    selectedSettlement?.id ?? null
  )

  if (selectedSettlement?.id !== prevSettlementId) {
    setPrevSettlementId(selectedSettlement?.id ?? null)
    setAddOpen(false)
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
  }, [selectedSettlement?.id, hasFetched, toast])

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
      if (!seedPatternId || !selectedSettlement) return

      const seedPatternInfo = availableSeedPatterns[seedPatternId]
      if (!seedPatternInfo) return

      setAddOpen(false)

      const tempId = `temp-${crypto.randomUUID()}`
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

      addSettlementSeedPatterns([seedPatternId], selectedSettlement.id)
        .then((row) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  seed_patterns: prev.seed_patterns.map((sp) =>
                    sp.id === tempId ? { ...sp, id: row[0].id } : sp
                  )
                }
              : null
          )
          toast.success(SEED_PATTERN_UPDATED_MESSAGE())
        })
        .catch((err: unknown) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  seed_patterns: prev.seed_patterns.filter(
                    (sp) => sp.id !== tempId
                  )
                }
              : null
          )
          console.error('Seed Pattern Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availableSeedPatterns, setSelectedSettlement, toast]
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
          setSelectedSettlement((prev) => {
            if (!prev || prev.seed_patterns.some((sp) => sp.id === removed.id))
              return prev
            return {
              ...prev,
              seed_patterns: [...prev.seed_patterns, removed]
            }
          })
          console.error('Seed Pattern Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement, toast]
  )

  /** Check if an exact match for the search term already exists. */
  const exactMatchExists = Object.values(availableSeedPatterns).some(
    (sp) => sp.seed_pattern_name.toLowerCase() === search.trim().toLowerCase()
  )

  /**
   * Handle Create Custom Seed Pattern
   */
  const handleCreate = useCallback(async () => {
    const name = search.trim()
    if (!name || creating || !selectedSettlement) return

    setCreating(true)

    try {
      const newSeedPattern = await addSeedPattern({
        custom: true,
        seed_pattern_name: name
      })

      setAvailableSeedPatterns((prev) => ({
        ...prev,
        [newSeedPattern.id]: newSeedPattern
      }))

      setSearch('')
      setAddOpen(false)
      toast.success(SEED_PATTERN_CREATED_MESSAGE())

      // Add to settlement immediately
      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['seed_patterns'][0] = {
        id: tempId,
        seed_pattern_id: newSeedPattern.id,
        seed_pattern_name: newSeedPattern.seed_pattern_name
      }
      const updatedSeedPatterns = [
        ...selectedSettlement.seed_patterns,
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        seed_patterns: updatedSeedPatterns
      })

      addSettlementSeedPatterns([newSeedPattern.id], selectedSettlement.id)
        .then((row) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  seed_patterns: prev.seed_patterns.map((sp) =>
                    sp.id === tempId ? { ...sp, id: row[0].id } : sp
                  )
                }
              : null
          )
          toast.success(SEED_PATTERN_UPDATED_MESSAGE())
        })
        .catch((err: unknown) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  seed_patterns: prev.seed_patterns.filter(
                    (sp) => sp.id !== tempId
                  )
                }
              : null
          )
          console.error('Seed Pattern Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    } catch (error) {
      console.error('Seed Pattern Create Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setCreating(false)
    }
  }, [search, creating, selectedSettlement, setSelectedSettlement, toast])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <BeanIcon className="h-4 w-4" />
          Seed Patterns
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-0 h-8 w-8"
                disabled={selectableSeedPatterns.length === 0}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search seed patterns..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {search.trim() ? (
                      <button
                        type="button"
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm justify-center"
                        disabled={creating}
                        onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        {creating ? 'Creating...' : `Create "${search.trim()}"`}
                      </button>
                    ) : (
                      'No seed patterns found.'
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {selectableSeedPatterns.map((sp) => (
                      <CommandItem
                        key={sp.id}
                        value={sp.seed_pattern_name}
                        onSelect={() => handleAdd(sp.id)}>
                        {sp.seed_pattern_name}
                        {sp.custom && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Custom
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                    {search.trim() && !exactMatchExists && (
                      <CommandItem
                        value={`__create__${search.trim()}`}
                        onSelect={handleCreate}
                        disabled={creating}>
                        <Plus className="h-4 w-4" />
                        {creating ? 'Creating...' : `Create "${search.trim()}"`}
                      </CommandItem>
                    )}
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
            {(!selectedSettlement?.seed_patterns ||
              selectedSettlement.seed_patterns.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No seed patterns yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
