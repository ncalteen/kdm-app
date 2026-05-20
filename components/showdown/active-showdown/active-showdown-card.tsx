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
import { LocalStateType } from '@/contexts/local-context'
import {
  addSettlementPhase,
  updateSettlementPhase
} from '@/lib/dal/settlement-phase'
import { removeShowdown } from '@/lib/dal/showdown'
import { TabType } from '@/lib/enums'
import { ERROR_MESSAGE } from '@/lib/messages'
import {
  SettlementDetail,
  SettlementPhaseDetail,
  ShowdownDetail,
  ShowdownStateSetter,
  SurvivorDetail,
  SurvivorsStateSetter,
  SurvivorStateSetter
} from '@/lib/types'
import { ChevronRightIcon, XIcon } from 'lucide-react'
import { ReactElement, useCallback, useState } from 'react'
import { toast } from 'sonner'

/**
 * Active Showdown Card Properties
 */
interface ActiveShowdownCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (
    settlementPhase: SettlementPhaseDetail | null
  ) => void
  /** Set Selected Showdown */
  setSelectedShowdown: ShowdownStateSetter
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: SurvivorStateSetter
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
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
  local,
  selectedSettlementPhase,
  selectedShowdown,
  selectedShowdownMonsterIndex,
  selectedSettlement,
  selectedSurvivor,
  setSelectedSettlementPhase,
  setSelectedShowdown,
  setSelectedShowdownMonsterIndex,
  setSelectedSurvivor,
  setSelectedTab,
  setSurvivors,
  survivors
}: ActiveShowdownCardProps): ReactElement {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false)
  const [isSettlementPhaseDialogOpen, setIsSettlementPhaseDialogOpen] =
    useState<boolean>(false)
  const [isProceedingToSettlementPhase, setIsProceedingToSettlementPhase] =
    useState<boolean>(false)

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
      })
      .catch((err: unknown) => {
        console.error('Delete Showdown Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedShowdown, setSelectedShowdown, setSelectedShowdownMonsterIndex])

  /**
   * Handle Proceed to Settlement Phase (open confirmation dialog)
   */
  const handleSettlementPhase = useCallback(
    () => setIsSettlementPhaseDialogOpen(true),
    []
  )

  /**
   * Handle Proceed to Settlement Phase
   *
   * Creates a new settlement phase from the current showdown data:
   * 1. Creates the settlement phase record and returning survivors
   * 2. Deletes the showdown (cascade removes showdown-related records)
   * 3. Updates local state to reflect the new settlement phase
   */
  const handleProceedToSettlementPhase = useCallback(async () => {
    if (!selectedShowdown || !selectedSettlement) return

    const showdownSurvivors = selectedShowdown.showdown_survivors
    if (!showdownSurvivors) {
      toast.error(ERROR_MESSAGE())
      return
    }

    setIsProceedingToSettlementPhase(true)

    try {
      const isSpecial = selectedShowdown.showdown_type === 'SPECIAL'

      // Special showdowns resume the existing settlement phase at the
      // "Update Death Count" step instead of creating a new one.
      if (isSpecial && selectedSettlementPhase) {
        await updateSettlementPhase(selectedSettlementPhase.id, {
          step: 'UPDATE_DEATH_COUNT'
        })

        await removeShowdown(selectedShowdown.id)

        setSelectedShowdown(null)
        setSelectedShowdownMonsterIndex(0)
        setSelectedSettlementPhase({
          ...selectedSettlementPhase,
          step: 'UPDATE_DEATH_COUNT'
        })
        setSelectedTab(TabType.SETTLEMENT_PHASE)

        setIsSettlementPhaseDialogOpen(false)
        return
      }

      // Determine the returning scout (if any).
      const scoutSurvivor = Object.values(showdownSurvivors).find(
        (s) => s.scout
      )

      // 1. Create the settlement phase record and returning survivors.
      const returningSurvivorIds = Object.values(showdownSurvivors).map(
        (s) => s.survivor_id
      )

      const settlementPhaseId = await addSettlementPhase(
        {
          endeavors: 0,
          returning_scout_id: scoutSurvivor?.survivor_id ?? null,
          settlement_id: selectedSettlement.id
        },
        returningSurvivorIds
      )

      // 2. Delete the showdown (cascade removes all showdown-related records).
      await removeShowdown(selectedShowdown.id)

      // 3. Build the SettlementPhaseDetail and update local state.
      const settlementPhaseDetail: SettlementPhaseDetail = {
        id: settlementPhaseId,
        endeavors: 0,
        returning_scout_id: scoutSurvivor?.survivor_id ?? null,
        settlement_id: selectedSettlement.id,
        step: 'SET_UP_SETTLEMENT',
        returning_survivor_ids: returningSurvivorIds
      }

      // Clear showdown state.
      setSelectedShowdown(null)
      setSelectedShowdownMonsterIndex(0)

      // Set settlement phase state.
      setSelectedSettlementPhase(settlementPhaseDetail)

      // Switch to the settlement phase tab.
      setSelectedTab(TabType.SETTLEMENT_PHASE)

      setIsSettlementPhaseDialogOpen(false)
    } catch (error: unknown) {
      console.error('Proceed to Settlement Phase Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsProceedingToSettlementPhase(false)
    }
  }, [
    selectedSettlementPhase,
    selectedShowdown,
    selectedSettlement,
    setSelectedShowdown,
    setSelectedShowdownMonsterIndex,
    setSelectedSettlementPhase,
    setSelectedTab
  ])

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
          onClick={handleSettlementPhase}
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
          local={local}
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

      {/* Settlement Phase Confirmation Dialog */}
      <AlertDialog
        open={isSettlementPhaseDialogOpen}
        onOpenChange={setIsSettlementPhaseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedShowdown?.showdown_type === 'SPECIAL'
                ? 'Return to Settlement Phase'
                : 'Begin Settlement Phase'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              The showdown will end and surviving members of the hunt party will
              return to the settlement.{' '}
              <strong>
                This action cannot be undone. Any changes to the settlement,
                survivors, or monster will be retained.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProceedToSettlementPhase}
              disabled={isProceedingToSettlementPhase}>
              {isProceedingToSettlementPhase ? 'Proceeding...' : 'Proceed'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
