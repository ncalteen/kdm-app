'use client'

import { MilestoneItem } from '@/components/settlement/milestones/milestone-item'
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
import { getMilestones } from '@/lib/dal/milestone'
import {
  addSettlementMilestones,
  removeSettlementMilestone,
  updateSettlementMilestone
} from '@/lib/dal/settlement-milestone'
import {
  ERROR_MESSAGE,
  MILESTONE_COMPLETED_MESSAGE,
  MILESTONE_REMOVED_MESSAGE,
  MILESTONE_UPDATED_MESSAGE
} from '@/lib/messages'
import { MilestoneDetail, SettlementDetail } from '@/lib/types'
import { BadgeCheckIcon, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Milestones Card Properties
 */
interface MilestonesCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
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

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  // Available milestones for the select dropdown (fetched once per settlement).
  const [availableMilestones, setAvailableMilestones] = useState<{
    [key: string]: MilestoneDetail
  }>({})

  // Track the previous settlement ID to reset state on settlement change.
  const [prevSettlementId, setPrevSettlementId] = useState<string | null>(
    selectedSettlement?.id ?? null
  )

  if (selectedSettlement?.id !== prevSettlementId) {
    setPrevSettlementId(selectedSettlement?.id ?? null)
    setAddOpen(false)
    setHasFetched(false)
  }

  // Fetch available milestone options when settlement changes.
  useEffect(() => {
    if (!selectedSettlement?.id || hasFetched) return

    let cancelled = false

    getMilestones()
      .then((milestones) => {
        if (cancelled) return

        setAvailableMilestones(milestones)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        setAvailableMilestones({})
        setHasFetched(true)

        console.error('Settlement Milestones Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched, toast])

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
      const tempId = `temp-${Date.now()}`
      const optimisticRow: SettlementDetail['milestones'][0] = {
        complete: false,
        event_name: milestoneInfo.event_name,
        id: tempId,
        milestone_id: milestoneId,
        milestone_name: milestoneInfo.milestone_name
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

      addSettlementMilestones([milestoneId], selectedSettlement.id)
        .then((row) => {
          // Replace the placeholder with the real row from the DB.
          setSelectedSettlement({
            ...selectedSettlement,
            milestones: updatedMilestones.map((m) =>
              m.id === tempId ? { ...m, id: row[0].id } : m
            )
          })

          toast.success(MILESTONE_UPDATED_MESSAGE())
        })
        .catch((err: unknown) => {
          // Revert to the original milestones (before the optimistic add).
          setSelectedSettlement({
            ...selectedSettlement,
            milestones: selectedSettlement.milestones
          })

          console.error('Milestone Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availableMilestones, setSelectedSettlement, toast]
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

      removeSettlementMilestone(removed.id)
        .then(() => toast.success(MILESTONE_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          // Revert the optimistic removal.
          setSelectedSettlement({
            ...selectedSettlement,
            milestones: [
              ...selectedSettlement.milestones.slice(0, index),
              removed,
              ...selectedSettlement.milestones.slice(index)
            ]
          })

          console.error('Milestone Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement, toast]
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

      updateSettlementMilestone(target.id, { complete })
        .then(() => toast.success(MILESTONE_COMPLETED_MESSAGE(complete)))
        .catch((err: unknown) => {
          // Revert the optimistic toggle.
          setSelectedSettlement({
            ...selectedSettlement,
            milestones: selectedSettlement.milestones.map((m, i) =>
              i === index ? { ...m, complete: !complete } : m
            )
          })

          console.error('Milestone Toggle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement, toast]
  )

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
                className="border-0 h-8 w-8"
                disabled={selectableMilestones.length === 0}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search milestones..." />
                <CommandList>
                  <CommandEmpty>No milestones found.</CommandEmpty>
                  <CommandGroup>
                    {selectableMilestones.map((milestone) => (
                      <CommandItem
                        key={milestone.id}
                        value={milestone.milestone_name}
                        onSelect={() => handleAdd(milestone.id)}>
                        {milestone.milestone_name}
                      </CommandItem>
                    ))}
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

            {!hasFetched && !selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading milestones...
              </p>
            )}

            {hasFetched &&
              selectedSettlement?.milestones.map((milestone, index) => (
                <MilestoneItem
                  key={milestone.id}
                  index={index}
                  milestone={milestone}
                  onRemove={handleRemove}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
