'use client'

import { PhilosophyItem } from '@/components/settlement/arc/philosophy-item'
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
import {
  PhilosophyDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { BrainCogIcon, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Philosophies Card Properties
 */
interface PhilosophiesCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
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
  local,
  selectedSettlement,
  setSelectedSettlement
}: PhilosophiesCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')

  // Available philosophies for the select dropdown (fetched once per settlement).
  const { data: availablePhilosophies, isLoaded: hasFetched } =
    useCatalogFetch<{
      [key: string]: PhilosophyDetail
    }>(selectedSettlement?.id, () => getPhilosophies(), {
      initial: {},
      errorContext: 'Philosophies Fetch Error',
      onReset: () => setAddOpen(false),
      onError: () => toast.error(ERROR_MESSAGE())
    })

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
      if (!philosophyId || !selectedSettlement) return

      const philosophyInfo = availablePhilosophies[philosophyId]
      if (!philosophyInfo) return

      // Prevent duplicates
      const alreadyAdded = (selectedSettlement.philosophies ?? []).some(
        (p) => p.philosophy_id === philosophyId
      )
      if (alreadyAdded) return

      setAddOpen(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['philosophies'][0] = {
        hunt_xp_milestones: null,
        id: tempId,
        neurosis_id: null,
        philosophy_id: philosophyId,
        philosophy_name: philosophyInfo.philosophy_name,
        tenet_knowledge_id: null,
        tier: null,
        custom: philosophyInfo.custom ?? false
      }

      const updatedPhilosophies = [
        ...(selectedSettlement.philosophies ?? []),
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        philosophies: updatedPhilosophies
      })

      void mutate({
        context: 'Philosophy Add',
        persist: () =>
          addSettlementPhilosophies([philosophyId], selectedSettlement.id),
        onSuccess: (rows) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  philosophies: (prev.philosophies ?? []).map((p) =>
                    p.id === tempId ? { ...p, id: rows[0].id } : p
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
                  philosophies: (prev.philosophies ?? []).filter(
                    (p) => p.id !== tempId
                  )
                }
              : null
          )
        },
        successMessage: PHILOSOPHY_CREATED_MESSAGE()
      })
    },
    [selectedSettlement, availablePhilosophies, setSelectedSettlement, mutate]
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

      void mutate({
        context: 'Philosophy Remove',
        persist: () => removeSettlementPhilosophy(removed.id),
        rollback: () => {
          setSelectedSettlement((prev) => {
            if (
              !prev ||
              (prev.philosophies ?? []).some((p) => p.id === removed.id)
            )
              return prev
            return {
              ...prev,
              philosophies: [...(prev.philosophies ?? []), removed]
            }
          })
        },
        successMessage: PHILOSOPHY_REMOVED_MESSAGE()
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <BrainCogIcon className="h-4 w-4" />
          Philosophies
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-0 h-8 w-8">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search philosophies..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>No philosophies found.</CommandEmpty>
                  <CommandGroup>
                    {Object.values(availablePhilosophies)
                      .filter(
                        (p) =>
                          !(selectedSettlement?.philosophies ?? []).some(
                            (existing) => existing.philosophy_id === p.id
                          )
                      )
                      .sort((a, b) =>
                        a.philosophy_name.localeCompare(b.philosophy_name)
                      )
                      .map((philosophy) => (
                        <CommandItem
                          key={philosophy.id}
                          value={philosophy.philosophy_name}
                          onSelect={() => handleAdd(philosophy.id)}>
                          {philosophy.philosophy_name}
                          {philosophy.custom && (
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs">
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

      {/* Philosophies List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[200px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.philosophies ||
              selectedSettlement.philosophies.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No philosophies yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading philosophies...
              </p>
            )}

            {hasFetched &&
              sortedPhilosophies.map(({ item, originalIndex }) => {
                const overviewParts: string[] = []
                if (item.tier != null) overviewParts.push(`Tier ${item.tier}`)
                if (
                  item.hunt_xp_milestones &&
                  item.hunt_xp_milestones.length > 0
                )
                  overviewParts.push(
                    `Hunt XP Milestones: ${item.hunt_xp_milestones.join(', ')}`
                  )

                return (
                  <PhilosophyItem
                    key={item.id}
                    customDetail={
                      item.custom
                        ? {
                            custom: true,
                            sections: [
                              {
                                label: 'Overview',
                                content:
                                  overviewParts.length > 0
                                    ? overviewParts.join('\n')
                                    : null
                              }
                            ]
                          }
                        : null
                    }
                    index={originalIndex}
                    onRemove={handleRemove}
                    philosophy={item}
                  />
                )
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
