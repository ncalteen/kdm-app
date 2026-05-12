'use client'

import { PrincipleDialog } from '@/components/custom/dialogs/principle-dialog'
import { PrincipleItem } from '@/components/settlement/principles/principle-item'
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
import { Separator } from '@/components/ui/separator'
import { LocalStateType } from '@/contexts/local-context'
import { useCatalogFetch } from '@/hooks/use-catalog-fetch'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { useToast } from '@/hooks/use-toast'
import { addPrinciple, getPrinciples } from '@/lib/dal/principle'
import {
  addSettlementPrinciples,
  removeSettlementPrinciple,
  updateSettlementPrinciple
} from '@/lib/dal/settlement-principle'
import {
  ERROR_MESSAGE,
  PRINCIPLE_CREATED_MESSAGE,
  PRINCIPLE_OPTION_SELECTED_MESSAGE,
  PRINCIPLE_REMOVED_MESSAGE,
  PRINCIPLE_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  PrincipleDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { Plus, PlusIcon, StampIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Principles Card Properties
 */
interface PrinciplesCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
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
  local,
  selectedSettlement,
  setSelectedSettlement
}: PrinciplesCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  // Available principles for the select dropdown (fetched once per settlement).
  const {
    data: availablePrinciples,
    isLoaded: hasFetched,
    setData: setAvailablePrinciples
  } = useCatalogFetch<{
    [key: string]: PrincipleDetail
  }>(selectedSettlement?.id, () => getPrinciples(), {
    initial: {},
    errorContext: 'Settlement Principles Fetch Error',
    onReset: () => setAddOpen(false),
    onError: () => toast.error(ERROR_MESSAGE())
  })

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
    return Object.values(availablePrinciples)
      .filter((p) => !linkedIds.has(p.id))
      .sort((a, b) => a.principle_name.localeCompare(b.principle_name))
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
      if (!principleId || !selectedSettlement) return

      const principleInfo = availablePrinciples[principleId]
      if (!principleInfo) return

      setAddOpen(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['principles'][0] = {
        id: tempId,
        option_1_name: principleInfo.option_1_name,
        option_1_rules: principleInfo.option_1_rules ?? null,
        option_1_selected: false,
        option_2_name: principleInfo.option_2_name,
        option_2_rules: principleInfo.option_2_rules ?? null,
        option_2_selected: false,
        principle_id: principleId,
        principle_name: principleInfo.principle_name,
        custom: principleInfo.custom,
        // Optimistic placeholder; the realtime/refetch reconciles
        // `author_username` from the catalog row's `user_id` (E2.8).
        author_username: null
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

      void mutate({
        context: 'Principle Add',
        persist: () =>
          addSettlementPrinciples([principleId], selectedSettlement.id),
        onSuccess: (row) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  principles: prev.principles.map((p) =>
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
                  principles: prev.principles.filter((p) => p.id !== tempId)
                }
              : null
          )
        },
        successMessage: PRINCIPLE_UPDATED_MESSAGE(false)
      })
    },
    [selectedSettlement, availablePrinciples, setSelectedSettlement, mutate]
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

      void mutate({
        context: 'Principle Remove',
        persist: () => removeSettlementPrinciple(removed.id),
        rollback: () => {
          setSelectedSettlement((prev) => {
            if (!prev || prev.principles.some((p) => p.id === removed.id))
              return prev
            return { ...prev, principles: [...prev.principles, removed] }
          })
        },
        successMessage: PRINCIPLE_REMOVED_MESSAGE()
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
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

      const optionName =
        option === 1 ? target.option_1_name : target.option_2_name

      void mutate({
        context: 'Principle Option Select',
        persist: () =>
          updateSettlementPrinciple(target.id, {
            option_1_selected: updatedOption1,
            option_2_selected: updatedOption2
          }),
        rollback: () => {
          // Revert the optimistic toggle.
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  principles: prev.principles.map((p) =>
                    p.id === target.id
                      ? {
                          ...p,
                          option_1_selected: target.option_1_selected,
                          option_2_selected: target.option_2_selected
                        }
                      : p
                  )
                }
              : null
          )
        },
        successMessage: PRINCIPLE_OPTION_SELECTED_MESSAGE(optionName)
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /** Check if an exact match for the search term already exists. */
  const exactMatchExists = Object.values(availablePrinciples).some(
    (p) => p.principle_name.toLowerCase() === search.trim().toLowerCase()
  )

  /**
   * Handle Create Custom Principle
   */
  const handleCreate = useCallback(
    async (data: {
      principle_name: string
      option_1_name: string
      option_2_name: string
      option_1_rules: string
      option_2_rules: string
    }) => {
      if (creating || !selectedSettlement) return

      setCreating(true)

      try {
        const newPrinciple = await addPrinciple({
          custom: true,
          principle_name: data.principle_name,
          option_1_name: data.option_1_name,
          option_2_name: data.option_2_name,
          option_1_rules: data.option_1_rules || null,
          option_2_rules: data.option_2_rules || null,
          campaign_types: []
        })

        setAvailablePrinciples((prev) => ({
          ...prev,
          [newPrinciple.id]: newPrinciple
        }))
        setCreateDialogOpen(false)
        setSearch('')
        setAddOpen(false)
        toast.success(PRINCIPLE_CREATED_MESSAGE())

        // Add to settlement immediately
        const tempId = `temp-${crypto.randomUUID()}`
        const optimisticRow: SettlementDetail['principles'][0] = {
          id: tempId,
          option_1_name: newPrinciple.option_1_name,
          option_1_rules: newPrinciple.option_1_rules ?? null,
          option_1_selected: false,
          option_2_name: newPrinciple.option_2_name,
          option_2_rules: newPrinciple.option_2_rules ?? null,
          option_2_selected: false,
          principle_id: newPrinciple.id,
          principle_name: newPrinciple.principle_name,
          custom: true,
          // Optimistic placeholder; the realtime/refetch reconciles
          // `author_username` from the catalog row's `user_id` (E2.8).
          author_username: null
        }
        const updatedPrinciples = [
          ...(selectedSettlement.principles ?? []),
          optimisticRow
        ]

        setSelectedSettlement({
          ...selectedSettlement,
          principles: updatedPrinciples
        })

        void mutate({
          context: 'Principle Add',
          persist: () =>
            addSettlementPrinciples([newPrinciple.id], selectedSettlement.id),
          onSuccess: (rows) => {
            setSelectedSettlement((prev) =>
              prev
                ? {
                    ...prev,
                    principles: prev.principles.map((p) =>
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
                    principles: prev.principles.filter((p) => p.id !== tempId)
                  }
                : null
            )
          },
          successMessage: PRINCIPLE_UPDATED_MESSAGE(true)
        })
      } catch (error) {
        console.error('Principle Create Error:', error)
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
      setAvailablePrinciples
    ]
  )

  /** Open the create dialog with the current search term pre-filled */
  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <StampIcon className="h-4 w-4" />
          Principles
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
                  placeholder="Search principles..."
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
                      'No principles found.'
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {selectablePrinciples.map((principle) => (
                      <CommandItem
                        key={principle.id}
                        value={principle.principle_name}
                        onSelect={() => handleAdd(principle.id)}>
                        {principle.principle_name}
                        {principle.custom && (
                          <Badge variant="outline" className="ml-auto text-xs">
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

      {/* Principles List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[200px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.principles ||
              selectedSettlement.principles.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No principles yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading principles...
              </p>
            )}

            {hasFetched &&
              sortedPrinciples.map(({ item, originalIndex }) => {
                const detail = availablePrinciples[item.principle_id]

                return (
                  <div key={item.id}>
                    <PrincipleItem
                      customDetail={
                        detail
                          ? {
                              custom: detail.custom,
                              sections: [
                                {
                                  label: detail.option_1_name,
                                  content: detail.option_1_rules
                                },
                                {
                                  label: detail.option_2_name,
                                  content: detail.option_2_rules
                                }
                              ]
                            }
                          : null
                      }
                      index={originalIndex}
                      onOptionSelect={handleOptionSelect}
                      onRemove={handleRemove}
                      principle={item}
                    />
                    <Separator className="my-1" />
                  </div>
                )
              })}
          </div>
        </div>
      </CardContent>

      <PrincipleDialog
        key={dialogKey}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={creating}
        initialName={search.trim()}
        title="Create Custom Principle"
        description="A new tenet takes shape in the lantern's light."
        saveLabel="Create"
        savingLabel="Creating..."
      />
    </Card>
  )
}
