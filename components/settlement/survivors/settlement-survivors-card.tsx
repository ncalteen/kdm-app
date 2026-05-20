'use client'

import { LanternMark } from '@/components/generic/lantern-mark'
import { createColumns } from '@/components/settlement/survivors/columns'
import { SurvivorDataTable } from '@/components/settlement/survivors/data-table'
import { FamilyTreeView } from '@/components/settlement/survivors/family-tree/family-tree-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { deleteSurvivor } from '@/lib/dal/survivor'
import { DatabaseSurvivorType, SurvivorType } from '@/lib/enums'
import { ERROR_MESSAGE, SURVIVOR_REMOVED_MESSAGE } from '@/lib/messages'
import {
  SettlementDetail,
  SurvivorDetail,
  SurvivorStateSetter,
  SurvivorsStateSetter
} from '@/lib/types'
import { GitBranchIcon, PlusIcon, TableIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Settlement Survivors Card Properties
 */
interface SettlementSurvivorsCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /* Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Is Creating New Survivor */
  setIsCreatingNewSurvivor: (isCreating: boolean) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: SurvivorStateSetter
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Settlement Survivors Card Component
 *
 * Displays the list of survivors for a given settlement in a table format.
 * Shows survivor details including name, gender, hunt experience, philosophy
 * (for Arc survivors), status, and edit/delete buttons to navigate to the
 * survivor page or remove them from the settlement.
 *
 * @param props Settlement Survivors Card Properties
 * @returns Settlement Survivors Card Component
 */
export function SettlementSurvivorsCard({
  selectedSettlement,
  selectedSurvivor,
  setIsCreatingNewSurvivor,
  setSelectedSurvivor,
  setSurvivors,
  survivors
}: SettlementSurvivorsCardProps): ReactElement {
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table')

  /**
   * Handle View Mode Change
   *
   * The shadcn `ToggleGroup` may emit `''` if the user attempts to deselect the
   * active item. We ignore those values so the survivors view always has a
   * concrete mode rendered.
   *
   * @param next Next View Mode
   */
  const handleViewModeChange = useCallback((next: string) => {
    if (next === 'table' || next === 'tree') setViewMode(next)
  }, [])

  /**
   * Handle New Survivor Creation
   *
   * Clears any selected survivor and sets the state to indicate that a new
   * survivor is being created.
   */
  const handleNewSurvivor = useCallback(() => {
    setSelectedSurvivor(null)
    setIsCreatingNewSurvivor(true)
  }, [setSelectedSurvivor, setIsCreatingNewSurvivor])

  /**
   * Handle Delete Survivor
   *
   * Optimistically removes a survivor from the settlement, then persists to the
   * DB.
   *
   * @param survivorId Survivor ID
   */
  const handleDeleteSurvivor = useCallback(
    (survivorId: string) => {
      if (!selectedSettlement?.id) return

      const originalSurvivors = [...survivors]
      const updatedSurvivors = survivors.filter((s) => s.id !== survivorId)
      const deletedSurvivor = survivors.filter((s) => s.id === survivorId)[0]

      if (!deletedSurvivor) {
        console.error('Survivor Remove Error: Survivor Not Found')
        return toast.error(ERROR_MESSAGE())
      }

      if (selectedSurvivor?.id === deletedSurvivor.id) setSelectedSurvivor(null)

      setSurvivors(updatedSurvivors)

      deleteSurvivor(selectedSettlement?.id, survivorId)
        .then(() =>
          toast.success(
            SURVIVOR_REMOVED_MESSAGE(
              deletedSurvivor.survivor_name ?? 'Survivor'
            )
          )
        )
        .catch((err: unknown) => {
          // Revert the optimistic removal.
          setSurvivors(originalSurvivors)

          console.error('Survivor Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      survivors,
      selectedSettlement?.id,
      selectedSurvivor?.id,
      setSelectedSurvivor,
      setSurvivors
    ]
  )

  const columns = createColumns({
    deleteId,
    handleDeleteSurvivor,
    isDeleteDialogOpen,
    setDeleteId,
    setIsDeleteDialogOpen,
    setSelectedSurvivor
  })

  // Only show the philosophy column if the settlement uses Arc survivors
  const columnVisibility = useMemo(
    () => ({
      philosophy:
        selectedSettlement?.survivor_type ===
        DatabaseSurvivorType[SurvivorType.ARC]
    }),
    [selectedSettlement?.survivor_type]
  )

  const settlementSurvivors = useMemo(
    () =>
      survivors.filter(
        (survivor) => survivor.settlement_id === selectedSettlement?.id
      ),
    [survivors, selectedSettlement?.id]
  )

  const viewModeToggle = (
    <ToggleGroup
      type="single"
      size="sm"
      variant="outline"
      value={viewMode}
      onValueChange={handleViewModeChange}
      aria-label="Survivor view mode">
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem
            value="table"
            aria-label="Show survivors as a table"
            className="h-8 px-3">
            <TableIcon className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Roster</span>
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>Roster table</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem
            value="tree"
            aria-label="Show survivors as a family tree"
            className="h-8 px-3">
            <GitBranchIcon className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Lineage</span>
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>Family tree</TooltipContent>
      </Tooltip>
    </ToggleGroup>
  )

  return (
    <Card className="p-0 pb-2 mt-2 border-0">
      <CardContent className="p-0">
        {survivors.length === 0 ? (
          <Empty className="border bg-card/40">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LanternMark
                  className="h-6 w-6 text-amber-400/90"
                  aria-hidden="true"
                />
              </EmptyMedia>
              <EmptyTitle>The settlement is silent.</EmptyTitle>
              <EmptyDescription>
                Lanterns burn over empty stones. Name a survivor to begin the
                chronicle.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={handleNewSurvivor}>
                <PlusIcon className="h-4 w-4" />
                New Survivor
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            {viewMode === 'table' ? (
              <SurvivorDataTable
                columns={columns}
                data={settlementSurvivors}
                headerActions={viewModeToggle}
                initialColumnVisibility={columnVisibility}
                onNewSurvivor={handleNewSurvivor}
              />
            ) : (
              <FamilyTreeView
                survivors={settlementSurvivors}
                selectedSurvivor={selectedSurvivor}
                onSelectSurvivor={setSelectedSurvivor}
                onNewSurvivor={handleNewSurvivor}
                headerActions={viewModeToggle}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
