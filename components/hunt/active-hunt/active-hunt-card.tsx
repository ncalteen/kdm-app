'use client'

import { HuntBoard } from '@/components/hunt/hunt-board/hunt-board'
import { HuntMonstersCard } from '@/components/hunt/hunt-monster/hunt-monsters-card'
import { HuntSurvivorsCard } from '@/components/hunt/hunt-survivors/hunt-survivors-card'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { removeHunt, updateHunt } from '@/lib/dal/hunt'
import { updateHuntHuntBoard } from '@/lib/dal/hunt-hunt-board'
import {
  DatabaseSurvivorType,
  HuntEventCount,
  HuntEventType,
  TabType
} from '@/lib/enums'
import {
  ERROR_MESSAGE,
  HUNT_DELETED_MESSAGE,
  MONSTER_MOVED_MESSAGE,
  SURVIVORS_MOVED_MESSAGE
} from '@/lib/messages'
import {
  HuntDetail,
  HuntHuntBoardDetail,
  SettlementDetail,
  ShowdownDetail,
  SurvivorDetail
} from '@/lib/types'
import { ChevronRightIcon, DicesIcon, XIcon } from 'lucide-react'
import { ReactElement, useCallback, useState } from 'react'
import { toast } from 'sonner'

/**
 * Active Hunt Card Properties
 */
interface ActiveHuntCardProps {
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Hunt */
  setSelectedHunt: (hunt: HuntDetail | null) => void
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
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
 * Active Hunt Card Component
 *
 * Displays the active hunt interface with the hunt board, monster details,
 * and survivor details. Supports position updates, hunt board modifications,
 * hunt cancellation, and proceeding to showdown.
 *
 * @param props Active Hunt Card Properties
 * @returns Active Hunt Card Component
 */
export function ActiveHuntCard({
  selectedHunt,
  selectedHuntMonsterIndex,
  selectedSettlement,
  selectedSurvivor,
  setSelectedHunt,
  setSelectedHuntMonsterIndex,
  setSelectedSurvivor,
  setSurvivors,
  survivors
}: ActiveHuntCardProps): ReactElement {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false)
  const [isShowdownDialogOpen, setIsShowdownDialogOpen] =
    useState<boolean>(false)
  const [huntEventPopoverOpen, setHuntEventPopoverOpen] =
    useState<boolean>(false)

  /**
   * Roll Random Hunt Event
   *
   * @param eventType Event Type
   */
  const rollHuntEvent = useCallback((eventType: HuntEventType) => {
    const maxValue =
      eventType === HuntEventType.BASIC || eventType === HuntEventType.MONSTER
        ? HuntEventCount.BASIC
        : HuntEventCount.ARC_SCOUT
    const randomEvent = Math.floor(Math.random() * maxValue) + 1

    toast.success(
      `${eventType === HuntEventType.BASIC ? 'Basic' : eventType === HuntEventType.ARC ? 'Arc' : eventType === HuntEventType.SCOUT ? 'Scout' : 'Monster'} Hunt Event: ${randomEvent}`
    )
    setHuntEventPopoverOpen(false)
  }, [])

  /**
   * Handle Position Update
   *
   * Updates the survivor and monster positions on the hunt board with
   * optimistic UI updates and rollback on error.
   *
   * @param survivorPosition New Survivor Position
   * @param monsterPosition New Monster Position
   */
  const handlePositionUpdate = useCallback(
    (survivorPosition: number, monsterPosition: number) => {
      if (!selectedHunt) return

      const previousSurvivorPos = selectedHunt.survivor_position
      const previousMonsterPos = selectedHunt.monster_position

      // Optimistic update
      setSelectedHunt({
        ...selectedHunt,
        survivor_position: survivorPosition,
        monster_position: monsterPosition
      })

      updateHunt(selectedHunt.id, {
        survivor_position: survivorPosition,
        monster_position: monsterPosition
      })
        .then(() =>
          toast.success(
            survivorPosition !== previousSurvivorPos
              ? SURVIVORS_MOVED_MESSAGE()
              : MONSTER_MOVED_MESSAGE()
          )
        )
        .catch((err: unknown) => {
          // Rollback
          setSelectedHunt({
            ...selectedHunt,
            survivor_position: previousSurvivorPos,
            monster_position: previousMonsterPos
          })

          console.error('Position Update Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedHunt, setSelectedHunt]
  )

  /**
   * Handle Hunt Board Update
   *
   * Updates a single position on the hunt board with optimistic UI updates
   * and rollback on error.
   *
   * @param position Position to Update (1-5, 7-11)
   * @param eventType New Event Type (or undefined to clear)
   */
  const handleHuntBoardUpdate = useCallback(
    (position: number, eventType: HuntEventType | undefined) => {
      if (!selectedHunt?.hunt_board) return

      const posKey = `pos_${position}` as keyof Omit<
        HuntHuntBoardDetail,
        'id' | 'hunt_id' | 'settlement_id'
      >
      const previousValue = selectedHunt.hunt_board[posKey]

      // Optimistic update
      setSelectedHunt({
        ...selectedHunt,
        hunt_board: {
          ...selectedHunt.hunt_board,
          [posKey]: eventType?.toUpperCase() ?? 'BASIC'
        }
      })

      updateHuntHuntBoard(selectedHunt.hunt_board.id, {
        [posKey]: eventType?.toUpperCase() ?? 'BASIC'
      }).catch((err: unknown) => {
        // Rollback
        setSelectedHunt({
          ...selectedHunt,
          hunt_board: {
            ...selectedHunt.hunt_board!,
            [posKey]: previousValue
          }
        })

        console.error('Hunt Board Update Error:', err)
        toast.error(ERROR_MESSAGE())
      })
    },
    [selectedHunt, setSelectedHunt]
  )

  /**
   * Handle Cancel Hunt
   *
   * Opens the confirmation dialog.
   */
  const handleCancelHunt = useCallback(() => setIsCancelDialogOpen(true), [])

  /**
   * Handle Delete Hunt
   *
   * Deletes the active hunt from the database and clears local state.
   */
  const handleDeleteHunt = useCallback(() => {
    if (!selectedHunt) return

    removeHunt(selectedHunt.id)
      .then(() => {
        setSelectedHunt(null)
        setSelectedHuntMonsterIndex(0)
        setIsCancelDialogOpen(false)

        toast.success(HUNT_DELETED_MESSAGE())
      })
      .catch((err: unknown) => {
        console.error('Delete Hunt Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedHunt, setSelectedHunt, setSelectedHuntMonsterIndex])

  /**
   * Handle Showdown (open confirmation dialog)
   *
   * @todo Implement proceed to showdown functionality
   */
  const handleShowdown = useCallback(() => setIsShowdownDialogOpen(true), [])

  /**
   * Handle Proceed to Showdown
   *
   * @todo Implement showdown creation from hunt data
   */
  const handleProceedToShowdown = useCallback(() => {
    toast.error('Proceed to showdown is not yet implemented.')
    setIsShowdownDialogOpen(false)
  }, [])

  return (
    <div className="flex flex-col gap-2 h-full relative">
      {/* Action Buttons */}
      <div className="flex justify-between pointer-events-none">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancelHunt}
          className="pointer-events-auto"
          title="End Hunt">
          <XIcon className="size-4" />
          End Hunt
        </Button>

        {selectedSettlement?.survivor_type === DatabaseSurvivorType['Arc'] ||
        selectedSettlement?.uses_scouts ? (
          <Popover
            open={huntEventPopoverOpen}
            onOpenChange={setHuntEventPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="pointer-events-auto"
                title="Roll Hunt Event">
                Roll Hunt Event <DicesIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => rollHuntEvent(HuntEventType.BASIC)}
                  className="justify-start">
                  Basic
                </Button>
                {selectedSettlement?.survivor_type ===
                  DatabaseSurvivorType['Arc'] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => rollHuntEvent(HuntEventType.ARC)}
                    className="justify-start">
                    Arc
                  </Button>
                )}
                {selectedSettlement?.uses_scouts && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => rollHuntEvent(HuntEventType.SCOUT)}
                    className="justify-start">
                    Scout
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => rollHuntEvent(HuntEventType.BASIC)}
            className="pointer-events-auto"
            title="Roll Hunt Event">
            Roll Hunt Event <DicesIcon className="size-4" />
          </Button>
        )}

        <Button
          variant="destructive"
          size="sm"
          onClick={handleShowdown}
          className="pointer-events-auto"
          title="Begin Showdown">
          Begin Showdown <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      {/* Hunt Board */}
      <HuntBoard
        onHuntBoardUpdate={handleHuntBoardUpdate}
        onPositionUpdate={handlePositionUpdate}
        selectedHunt={selectedHunt}
      />

      {/* Monster(s) Card */}
      <HuntMonstersCard
        selectedHunt={selectedHunt}
        selectedHuntMonsterIndex={selectedHuntMonsterIndex}
        setSelectedHunt={setSelectedHunt}
        setSelectedHuntMonsterIndex={setSelectedHuntMonsterIndex}
      />

      {/* Hunt Party Survivors */}
      <HuntSurvivorsCard
        selectedHunt={selectedHunt}
        selectedSettlement={selectedSettlement}
        selectedSurvivor={selectedSurvivor}
        setSelectedHunt={setSelectedHunt}
        setSelectedSurvivor={setSelectedSurvivor}
        setSurvivors={setSurvivors}
        survivors={survivors}
      />

      {/* Cancel Hunt Confirmation Dialog */}
      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Hunt</AlertDialogTitle>
            <AlertDialogDescription>
              The hunt will end and survivors will return to the settlement.{' '}
              <strong>
                This action cannot be undone. Any changes to the settlement or
                survivors will be retained.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHunt}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              End Hunt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Showdown Confirmation Dialog */}
      <AlertDialog
        open={isShowdownDialogOpen}
        onOpenChange={setIsShowdownDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Proceed to Showdown</AlertDialogTitle>
            <AlertDialogDescription>
              The hunt will end and the showdown will begin.{' '}
              <strong>
                This action cannot be undone. Any changes to the settlement,
                survivors, or monster will be retained.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleProceedToShowdown}>
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
