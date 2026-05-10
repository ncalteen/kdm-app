'use client'

import { MilestoneDialog } from '@/components/custom/dialogs/milestone-dialog'
import { MilestoneItem } from '@/components/settlement/milestones/milestone-item'
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
import { addMilestone, getMilestones } from '@/lib/dal/milestone'
import {
  addSettlementMilestones,
  removeSettlementMilestone,
  updateSettlementMilestone
} from '@/lib/dal/settlement-milestone'
import {
  ERROR_MESSAGE,
  MILESTONE_COMPLETED_MESSAGE,
  MILESTONE_CREATED_MESSAGE,
  MILESTONE_REMOVED_MESSAGE,
  MILESTONE_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  MilestoneDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { BadgeCheckIcon, Plus, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Milestones Card Properties
 */
interface MilestonesCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
}

/**
 * Milestones Card Component
 *
 * Displays the milestones linked to a settlement and allows users to add,
 * remove, and toggle the completion state. All mutations are applied
 * optimistically so the UI updates before the database transaction completes.
 *
 * @param props Milestones Card Properties
 * @returns Milestones Card Component
 */
export function MilestonesCard({
  local,
  selectedSettlement,
  setSelectedSettlement
}: MilestonesCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  // Available milestones for the select dropdown (fetched once per settlement).
  const {
    data: availableMilestones,
    isLoaded: hasFetched,
    setData: setAvailableMilestones
  } = useCatalogFetch<{
    [key: string]: MilestoneDetail
  }>(selectedSettlement?.id, () => getMilestones(), {
    initial: {},
    errorContext: 'Settlement Milestones Fetch Error',
    onReset: () => setAddOpen(false),
    onError: () => toast.error(ERROR_MESSAGE())
  })

  /**
   * Available Milestones Not Yet Added
   *
   * Filters the full list of available milestones to only those not already
   * linked to the settlement, preventing duplicates in the add dropdown.
   */
  const selectableMilestones = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.milestones ?? []).map((m) => m.milestone_id)
    )
    return Object.values(availableMilestones)
      .filter((m) => !linkedIds.has(m.id))
      .sort((a, b) => a.milestone_name.localeCompare(b.milestone_name))
  }, [availableMilestones, selectedSettlement?.milestones])

  /**
   * Handle Add Milestone
   *
   * Optimistically adds a milestone to the settlement, then persists to the
   * DB.
   *
   * @param milestoneId Milestone ID
   */
  const handleAdd = useCallback(
    (milestoneId: string | undefined) => {
      if (!milestoneId || !selectedSettlement) return

      const milestoneInfo = availableMilestones[milestoneId]
      if (!milestoneInfo) return

      setAddOpen(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['milestones'][0] = {
        complete: false,
        event_name: milestoneInfo.event_name,
        id: tempId,
        milestone_id: milestoneId,
        milestone_name: milestoneInfo.milestone_name,
        requirements: milestoneInfo.requirements ?? null,
        rules: milestoneInfo.rules ?? null,
        custom: milestoneInfo.custom
      }

      // Capture the updated milestones list so async callbacks reference it
      // instead of the stale pre-update closure value.
      const updatedMilestones = [
        ...selectedSettlement.milestones,
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        milestones: updatedMilestones
      })

      void mutate({
        context: 'Milestone Add',
        persist: () =>
          addSettlementMilestones([milestoneId], selectedSettlement.id),
        onSuccess: (row) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  milestones: prev.milestones.map((m) =>
                    m.id === tempId ? { ...m, id: row[0].id } : m
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
                  milestones: prev.milestones.filter((m) => m.id !== tempId)
                }
              : null
          )
        },
        successMessage: MILESTONE_UPDATED_MESSAGE()
      })
    },
    [selectedSettlement, availableMilestones, setSelectedSettlement, mutate]
  )

  /**
   * Handle Remove Milestone
   *
   * Optimistically removes a milestone from the settlement, then persists to
   * the DB.
   *
   * @param index Settlement Milestone Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.milestones[index]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        milestones: selectedSettlement.milestones.filter(
          (m) => m.id !== removed.id
        )
      })

      void mutate({
        context: 'Milestone Remove',
        persist: () => removeSettlementMilestone(removed.id),
        rollback: () => {
          setSelectedSettlement((prev) => {
            if (!prev || prev.milestones.some((m) => m.id === removed.id))
              return prev
            return { ...prev, milestones: [...prev.milestones, removed] }
          })
        },
        successMessage: MILESTONE_REMOVED_MESSAGE()
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /**
   * Handle Toggle Complete
   *
   * Optimistically toggles the completion state of a milestone, then persists
   * to the DB.
   *
   * @param index Milestone Index
   * @param complete New Completion State
   */
  const handleToggleComplete = useCallback(
    (index: number, complete: boolean) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.milestones[index]
      if (!target) return

      setSelectedSettlement({
        ...selectedSettlement,
        milestones: selectedSettlement.milestones.map((m, i) =>
          i === index ? { ...m, complete } : m
        )
      })

      void mutate({
        context: 'Milestone Toggle',
        persist: () => updateSettlementMilestone(target.id, { complete }),
        rollback: () => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  milestones: prev.milestones.map((m) =>
                    m.id === target.id ? { ...m, complete: !complete } : m
                  )
                }
              : null
          )
        },
        successMessage: MILESTONE_COMPLETED_MESSAGE(complete)
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /** Check if an exact match for the search term already exists. */
  const exactMatchExists = Object.values(availableMilestones).some(
    (m) => m.milestone_name.toLowerCase() === search.trim().toLowerCase()
  )

  /**
   * Handle Create Custom Milestone
   *
   * Creates a custom milestone via DAL, adds it to the available list, then
   * adds it to the settlement.
   */
  const handleCreate = useCallback(
    async (data: {
      milestone_name: string
      event_name: string
      requirements: string
      rules: string
    }) => {
      if (creating || !selectedSettlement) return

      setCreating(true)

      try {
        const newMilestone = await addMilestone({
          custom: true,
          milestone_name: data.milestone_name,
          event_name: data.event_name,
          requirements: data.requirements || null,
          rules: data.rules || null,
          campaign_types: []
        })

        setAvailableMilestones((prev) => ({
          ...prev,
          [newMilestone.id]: newMilestone
        }))
        setCreateDialogOpen(false)
        setSearch('')
        setAddOpen(false)
        toast.success(MILESTONE_CREATED_MESSAGE())

        // Add to settlement immediately.
        const tempId = `temp-${crypto.randomUUID()}`
        const optimisticRow: SettlementDetail['milestones'][0] = {
          complete: false,
          event_name: newMilestone.event_name,
          id: tempId,
          milestone_id: newMilestone.id,
          milestone_name: newMilestone.milestone_name,
          requirements: newMilestone.requirements ?? null,
          rules: newMilestone.rules ?? null,
          custom: true
        }

        const updatedMilestones = [
          ...selectedSettlement.milestones,
          optimisticRow
        ]

        setSelectedSettlement({
          ...selectedSettlement,
          milestones: updatedMilestones
        })

        void mutate({
          context: 'Milestone Add',
          persist: () =>
            addSettlementMilestones([newMilestone.id], selectedSettlement.id),
          onSuccess: (row) => {
            setSelectedSettlement((prev) =>
              prev
                ? {
                    ...prev,
                    milestones: prev.milestones.map((m) =>
                      m.id === tempId ? { ...m, id: row[0].id } : m
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
                    milestones: prev.milestones.filter((m) => m.id !== tempId)
                  }
                : null
            )
          }
        })
      } catch (error) {
        console.error('Milestone Create Error:', error)
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
      setAvailableMilestones
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
          <BadgeCheckIcon className="h-4 w-4" />
          Milestones
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
                  placeholder="Search milestones..."
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
                      'No milestones found.'
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {selectableMilestones.map((milestone) => (
                      <CommandItem
                        key={milestone.id}
                        value={milestone.milestone_name}
                        onSelect={() => handleAdd(milestone.id)}>
                        {milestone.milestone_name}
                        {milestone.custom && (
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

      {/* Milestones List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[200px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.milestones ||
              selectedSettlement.milestones.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No milestones yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading milestones...
              </p>
            )}

            {hasFetched &&
              selectedSettlement?.milestones.map((milestone, index) => {
                const detail = availableMilestones[milestone.milestone_id]

                return (
                  <MilestoneItem
                    key={milestone.id}
                    customDetail={
                      detail
                        ? {
                            custom: detail.custom,
                            sections: [
                              { label: 'Rules', content: detail.rules },
                              {
                                label: 'Requirements',
                                content: detail.requirements
                              }
                            ]
                          }
                        : null
                    }
                    index={index}
                    milestone={milestone}
                    onRemove={handleRemove}
                    onToggleComplete={handleToggleComplete}
                  />
                )
              })}
          </div>
        </div>
      </CardContent>

      <MilestoneDialog
        key={dialogKey}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={creating}
        initialName={search.trim()}
        title="Create Custom Milestone"
        description="A new landmark on the path through the darkness."
        saveLabel="Create"
        savingLabel="Creating..."
      />
    </Card>
  )
}
