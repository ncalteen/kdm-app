'use client'

import { KnowledgeDialog } from '@/components/custom/dialogs/knowledge-dialog'
import { KnowledgeItem } from '@/components/settlement/arc/knowledge-item'
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
import { addKnowledge, getKnowledges } from '@/lib/dal/knowledge'
import { getPhilosophies } from '@/lib/dal/philosophy'
import {
  addSettlementKnowledges,
  removeSettlementKnowledge
} from '@/lib/dal/settlement-knowledge'
import {
  ERROR_MESSAGE,
  KNOWLEDGE_CREATED_MESSAGE,
  KNOWLEDGE_REMOVED_MESSAGE
} from '@/lib/messages'
import {
  KnowledgeDetail,
  PhilosophyDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { GraduationCapIcon, Plus, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Knowledges Card Properties
 */
interface KnowledgesCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
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
  local,
  selectedSettlement,
  setSelectedSettlement
}: KnowledgesCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  // Available knowledges for the select dropdown (fetched once per settlement).
  const {
    data: availableKnowledges,
    isLoaded: hasFetched,
    setData: setAvailableKnowledges
  } = useCatalogFetch<{
    [key: string]: KnowledgeDetail
  }>(selectedSettlement?.id, () => getKnowledges(), {
    initial: {},
    errorContext: 'Knowledges Fetch Error',
    onReset: () => setAddOpen(false),
    onError: () => toast.error(ERROR_MESSAGE())
  })

  // Available philosophies for the create dialog dropdown.
  const { data: availablePhilosophies } = useCatalogFetch<{
    [key: string]: PhilosophyDetail
  }>(selectedSettlement?.id, () => getPhilosophies(), {
    initial: {},
    errorContext: 'Philosophies Fetch Error'
  })

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
      if (!knowledgeId || !selectedSettlement) return

      const knowledgeInfo = availableKnowledges[knowledgeId]
      if (!knowledgeInfo) return

      setAddOpen(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['knowledges'][0] = {
        id: tempId,
        knowledge_id: knowledgeId,
        knowledge_name: knowledgeInfo.knowledge_name,
        philosophy_id: knowledgeInfo.philosophy_id ?? null,
        rules: knowledgeInfo.rules ?? null,
        observation_conditions: knowledgeInfo.observation_conditions ?? null,
        observation_rank_up_milestone:
          knowledgeInfo.observation_rank_up_milestone ?? null,
        custom: knowledgeInfo.custom ?? false
      }

      const updatedKnowledges = [
        ...(selectedSettlement.knowledges ?? []),
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        knowledges: updatedKnowledges
      })

      void mutate({
        context: 'Knowledge Add',
        persist: () =>
          addSettlementKnowledges([knowledgeId], selectedSettlement.id),
        onSuccess: (rows) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  knowledges: (prev.knowledges ?? []).map((k) =>
                    k.id === tempId ? { ...k, id: rows[0].id } : k
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
                  knowledges: (prev.knowledges ?? []).filter(
                    (k) => k.id !== tempId
                  )
                }
              : null
          )
        },
        successMessage: KNOWLEDGE_CREATED_MESSAGE()
      })
    },
    [selectedSettlement, availableKnowledges, setSelectedSettlement, mutate]
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

      void mutate({
        context: 'Knowledge Remove',
        persist: () => removeSettlementKnowledge(removed.id),
        rollback: () => {
          setSelectedSettlement((prev) => {
            if (
              !prev ||
              (prev.knowledges ?? []).some((k) => k.id === removed.id)
            )
              return prev
            return {
              ...prev,
              knowledges: [...(prev.knowledges ?? []), removed]
            }
          })
        },
        successMessage: KNOWLEDGE_REMOVED_MESSAGE()
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /** Check if an exact match for the search term already exists. */
  const exactMatchExists = Object.values(availableKnowledges).some(
    (k) => k.knowledge_name.toLowerCase() === search.trim().toLowerCase()
  )

  /**
   * Handle Create Custom Knowledge
   *
   * Creates a custom knowledge via DAL, adds it to the available list, then
   * adds it to the settlement.
   */
  const handleCreate = useCallback(
    async (data: {
      knowledge_name: string
      philosophy_id: string | null
      rules: string
      observation_conditions: string
      observation_rank_up_milestone: number | null
    }) => {
      if (creating || !selectedSettlement) return

      setCreating(true)

      try {
        const newKnowledge = await addKnowledge({
          custom: true,
          knowledge_name: data.knowledge_name,
          philosophy_id: data.philosophy_id,
          rules: data.rules || null,
          observation_conditions: data.observation_conditions || null,
          observation_rank_up_milestone: data.observation_rank_up_milestone
        })

        setAvailableKnowledges((prev) => ({
          ...prev,
          [newKnowledge.id]: newKnowledge
        }))
        setCreateDialogOpen(false)
        setSearch('')
        setAddOpen(false)
        toast.success(KNOWLEDGE_CREATED_MESSAGE())

        // Add to settlement immediately.
        const tempId = `temp-${crypto.randomUUID()}`
        const optimisticRow: SettlementDetail['knowledges'][0] = {
          id: tempId,
          knowledge_id: newKnowledge.id,
          knowledge_name: newKnowledge.knowledge_name,
          philosophy_id: newKnowledge.philosophy_id ?? null,
          rules: newKnowledge.rules ?? null,
          observation_conditions: newKnowledge.observation_conditions ?? null,
          observation_rank_up_milestone:
            newKnowledge.observation_rank_up_milestone ?? null,
          custom: newKnowledge.custom ?? true
        }

        const updatedKnowledges = [
          ...(selectedSettlement.knowledges ?? []),
          optimisticRow
        ]

        setSelectedSettlement({
          ...selectedSettlement,
          knowledges: updatedKnowledges
        })

        void mutate({
          context: 'Knowledge Add',
          persist: () =>
            addSettlementKnowledges([newKnowledge.id], selectedSettlement.id),
          onSuccess: (rows) => {
            setSelectedSettlement((prev) =>
              prev
                ? {
                    ...prev,
                    knowledges: (prev.knowledges ?? []).map((k) =>
                      k.id === tempId ? { ...k, id: rows[0].id } : k
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
                    knowledges: (prev.knowledges ?? []).filter(
                      (k) => k.id !== tempId
                    )
                  }
                : null
            )
          }
        })
      } catch (error) {
        console.error('Knowledge Create Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setCreating(false)
      }
    },
    [
      creating,
      selectedSettlement,
      setSelectedSettlement,
      toast,
      mutate,
      setAvailableKnowledges
    ]
  )

  /** Open the create dialog with the current search term pre-filled. */
  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <GraduationCapIcon className="h-4 w-4" />
          Knowledges
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
                  placeholder="Search knowledges..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {search.trim() ? (
                      <button
                        type="button"
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm justify-center"
                        onClick={openCreateDialog}>
                        <Plus className="h-4 w-4" />
                        Create &quot;{search.trim()}&quot;
                      </button>
                    ) : (
                      'No knowledges found.'
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {Object.values(availableKnowledges)
                      .filter(
                        (k) =>
                          !(selectedSettlement?.knowledges ?? []).some(
                            (existing) => existing.knowledge_id === k.id
                          )
                      )
                      .sort((a, b) =>
                        a.knowledge_name.localeCompare(b.knowledge_name)
                      )
                      .map((knowledge) => (
                        <CommandItem
                          key={knowledge.id}
                          value={knowledge.knowledge_name}
                          onSelect={() => handleAdd(knowledge.id)}>
                          {knowledge.knowledge_name}
                          {knowledge.custom && (
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs">
                              Custom
                            </Badge>
                          )}
                        </CommandItem>
                      ))}
                    {search.trim() && !exactMatchExists && (
                      <CommandItem
                        value={`__create__${search.trim()}`}
                        onSelect={openCreateDialog}>
                        <Plus className="h-4 w-4" />
                        Create &quot;{search.trim()}&quot;
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>

      {/* Knowledges List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[200px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.knowledges ||
              selectedSettlement.knowledges.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No knowledges yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
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
          </div>
        </div>
      </CardContent>

      <KnowledgeDialog
        key={dialogKey}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={creating}
        philosophies={availablePhilosophies}
        initialName={search.trim()}
        title="Create Custom Knowledge"
        description="New knowledge illuminates the settlement."
        saveLabel="Create"
        savingLabel="Creating..."
      />
    </Card>
  )
}
