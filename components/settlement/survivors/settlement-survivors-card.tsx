'use client'

import { createColumns } from '@/components/settlement/survivors/columns'
import { SurvivorDataTable } from '@/components/settlement/survivors/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { deleteSurvivor } from '@/lib/dal/survivor'
import { DatabaseSurvivorType, SurvivorType } from '@/lib/enums'
import { ERROR_MESSAGE, SURVIVOR_REMOVED_MESSAGE } from '@/lib/messages'
import {
  SettlementDetail,
  SurvivorDetail,
  SurvivorStateSetter,
  SurvivorsStateSetter
} from '@/lib/types'
import { PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Settlement Survivors Card Properties
 */
interface SettlementSurvivorsCardProps {
  /** Local State */
  local: LocalStateType
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
  local,
  selectedSettlement,
  selectedSurvivor,
  setIsCreatingNewSurvivor,
  setSelectedSurvivor,
  setSurvivors,
  survivors
}: SettlementSurvivorsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [deleteId, setDeleteId] = useState<string | undefined>(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

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
      setSurvivors,
      toast
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

  return (
    <Card className="p-0 pb-2 mt-2 border-0">
      <CardContent className="p-0">
        {survivors.length === 0 ? (
          <div className="flex flex-col gap-2 justify-center items-center p-4">
            <div className="text-center text-muted-foreground py-4">
              Lanterns illuminate a silent settlement. No survivors found.
            </div>
            <Button
              variant="outline"
              size="sm"
              title="Create new survivor"
              className="h-9 w-50"
              onClick={handleNewSurvivor}>
              <PlusIcon className="h-4 w-4" />
              New Survivor
            </Button>
          </div>
        ) : (
          <SurvivorDataTable
            columns={columns}
            data={survivors.filter(
              (survivor) => survivor.settlement_id === selectedSettlement?.id
            )}
            initialColumnVisibility={columnVisibility}
            onNewSurvivor={handleNewSurvivor}
          />
        )}
      </CardContent>
    </Card>
  )
}
