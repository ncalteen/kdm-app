'use client'

import { ShowdownMonstersCard } from '@/components/showdown/showdown-monster/showdown-monsters-card'
import { ShowdownSurvivorsCard } from '@/components/showdown/showdown-survivors/showdown-survivors-card'
import { TurnCard } from '@/components/showdown/showdown-turn/showdown-turn-card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { removeShowdown } from '@/lib/dal/showdown'
import { TabType } from '@/lib/enums'
import { ERROR_MESSAGE, SHOWDOWN_DELETED_MESSAGE } from '@/lib/messages'
import { SettlementDetail, ShowdownDetail, SurvivorDetail } from '@/lib/types'
import { ChevronRightIcon, XIcon } from 'lucide-react'
import { ReactElement, useCallback, useState } from 'react'
import { toast } from 'sonner'

/**
 * Active Showdown Card Properties
 */
interface ActiveShowdownCardProps {
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Showdown */
  setSelectedShowdown: (showdown: ShowdownDetail | null) => void
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: (survivor: SurvivorDetail | null) => void
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Active Showdown Card Component
 *
 * Displays the active showdown interface with monsters, turn management,
 * and survivors. Supports showdown cancellation and proceeding to settlement
 * phase.
 *
 * @param props Active Showdown Card Properties
 * @returns Active Showdown Card Component
 */
export function ActiveShowdownCard({
  selectedShowdown,
  selectedShowdownMonsterIndex,
  selectedSettlement,
  selectedSurvivor,
  setSelectedShowdown,
  setSelectedShowdownMonsterIndex,
  setSelectedSurvivor,
  setSurvivors,
  survivors
}: ActiveShowdownCardProps): ReactElement {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false)

  /**
   * Handle Cancel Showdown (open confirmation dialog)
   */
  const handleCancelShowdown = useCallback(
    () => setIsCancelDialogOpen(true),
    []
  )

  /**
   * Handle Delete Showdown
   *
   * Deletes the active showdown from the database and clears local state.
   */
  const handleDeleteShowdown = useCallback(() => {
    if (!selectedShowdown) return

    removeShowdown(selectedShowdown.id)
      .then(() => {
        setSelectedShowdown(null)
        setSelectedShowdownMonsterIndex(0)
        setIsCancelDialogOpen(false)
        toast.success(SHOWDOWN_DELETED_MESSAGE())
      })
      .catch((err: unknown) => {
        console.error('Delete Showdown Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedShowdown, setSelectedShowdown, setSelectedShowdownMonsterIndex])

  /**
   * Handle Proceed to Settlement Phase
   *
   * @todo Implement settlement phase creation from showdown data
   */
  const handleProceedToSettlementPhase = useCallback(() => {
    // TODO: Implement proceed to settlement phase
    toast.error('Proceed to settlement phase is not yet implemented.')
  }, [])

  return (
    <div className="flex flex-col gap-2 h-full relative">
      {/* Action Buttons */}
      <div className="flex justify-between pointer-events-none">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancelShowdown}
          className="pointer-events-auto"
          title="End Showdown">
          <XIcon className="size-4" />
          End Showdown
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleProceedToSettlementPhase}
          className="pointer-events-auto"
          title="Settlement Phase">
          {selectedShowdown?.showdown_type === 'SPECIAL'
            ? 'Return to Settlement Phase'
            : 'Begin Settlement Phase'}
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col lg:flex-row gap-2">
          <ShowdownMonstersCard
            selectedShowdown={selectedShowdown}
            selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
            setSelectedShowdown={setSelectedShowdown}
            setSelectedShowdownMonsterIndex={setSelectedShowdownMonsterIndex}
          />

          <TurnCard
            selectedShowdown={selectedShowdown}
            selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
            selectedSurvivor={selectedSurvivor}
            setSelectedShowdown={setSelectedShowdown}
            survivors={survivors}
          />
        </div>

        <ShowdownSurvivorsCard
          selectedShowdown={selectedShowdown}
          selectedSettlement={selectedSettlement}
          selectedSurvivor={selectedSurvivor}
          setSelectedShowdown={setSelectedShowdown}
          setSelectedSurvivor={setSelectedSurvivor}
          setSurvivors={setSurvivors}
          survivors={survivors}
        />
      </div>

      {/* Cancel Showdown Confirmation Dialog */}
      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Showdown</AlertDialogTitle>
            <AlertDialogDescription>
              The showdown will end and survivors will return to the settlement.{' '}
              <strong>
                This action cannot be undone. Any changes made to your
                settlement or survivors will be retained.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteShowdown}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              End Showdown
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
