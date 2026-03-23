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
import { addShowdown } from '@/lib/dal/showdown'
import { addShowdownAIDeck } from '@/lib/dal/showdown-ai-deck'
import { addShowdownMonster } from '@/lib/dal/showdown-monster'
import { addShowdownSurvivor } from '@/lib/dal/showdown-survivor'
import {
  DatabaseSurvivorType,
  HuntEventCount,
  HuntEventType,
  MonsterType,
  SurvivorType,
  TabType
} from '@/lib/enums'
import {
  ERROR_MESSAGE,
  HUNT_DELETED_MESSAGE,
  MONSTER_MOVED_MESSAGE,
  SHOWDOWN_CREATED_MESSAGE,
  SURVIVORS_MOVED_MESSAGE
} from '@/lib/messages'
import {
  HuntDetail,
  HuntHuntBoardDetail,
  SettlementDetail,
  ShowdownDetail,
  ShowdownMonsterDetail,
  ShowdownSurvivorDetail,
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
  setSelectedShowdown,
  setSelectedShowdownMonsterIndex,
  setSelectedSurvivor,
  setSelectedTab,
  setSurvivors,
  survivors
}: ActiveHuntCardProps): ReactElement {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false)
  const [isShowdownDialogOpen, setIsShowdownDialogOpen] =
    useState<boolean>(false)
  const [isProceedingToShowdown, setIsProceedingToShowdown] =
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
   * Creates a new showdown from the current hunt data:
   * 1. Creates the showdown record
   * 2. Creates showdown AI decks from hunt AI deck data
   * 3. Creates showdown monsters from hunt monsters (with AI deck references)
   * 4. Creates showdown survivors from hunt survivors (carrying over tokens)
   * 5. Deletes the hunt (cascade removes hunt_monster, hunt_survivor, etc.)
   * 6. Updates local state to reflect the new showdown
   */
  const handleProceedToShowdown = useCallback(async () => {
    if (!selectedHunt || !selectedSettlement) return

    const huntMonsters = selectedHunt.hunt_monsters
    const huntSurvivors = selectedHunt.hunt_survivors

    if (!huntMonsters || !huntSurvivors) {
      toast.error(ERROR_MESSAGE())
      return
    }

    setIsProceedingToShowdown(true)

    try {
      // 1. Create the showdown record
      const showdownId = await addShowdown({
        ambush: 'NONE',
        monster_level: selectedHunt.monster_level,
        settlement_id: selectedSettlement.id,
        showdown_type: 'REGULAR',
        turn: 'MONSTER'
      })

      // 2-3. Create showdown AI decks and monsters for each hunt monster
      const showdownMonsters: { [key: string]: ShowdownMonsterDetail } = {}

      for (const huntMonster of Object.values(huntMonsters)) {
        // Create showdown AI deck from the hunt monster's AI deck
        const showdownAIDeck = await addShowdownAIDeck({
          basic_cards: huntMonster.ai_deck.basic_cards,
          advanced_cards: huntMonster.ai_deck.advanced_cards,
          legendary_cards: huntMonster.ai_deck.legendary_cards,
          overtone_cards: huntMonster.ai_deck.overtone_cards,
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId
        })

        // Create showdown monster with all stats carried over from hunt
        const showdownMonsterId = await addShowdownMonster({
          accuracy: huntMonster.accuracy,
          accuracy_tokens: huntMonster.accuracy_tokens,
          ai_card_drawn: false,
          ai_deck_id: showdownAIDeck.id,
          ai_deck_remaining: huntMonster.ai_deck_remaining,
          damage: huntMonster.damage,
          damage_tokens: huntMonster.damage_tokens,
          evasion: huntMonster.evasion,
          evasion_tokens: huntMonster.evasion_tokens,
          knocked_down: huntMonster.knocked_down,
          luck: huntMonster.luck,
          luck_tokens: huntMonster.luck_tokens,
          monster_name: huntMonster.monster_name,
          moods: huntMonster.moods,
          movement: huntMonster.movement,
          movement_tokens: huntMonster.movement_tokens,
          notes: huntMonster.notes,
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId,
          speed: huntMonster.speed,
          speed_tokens: huntMonster.speed_tokens,
          strength: huntMonster.strength,
          strength_tokens: huntMonster.strength_tokens,
          toughness: huntMonster.toughness,
          traits: huntMonster.traits,
          wounds: huntMonster.wounds
        })

        showdownMonsters[showdownMonsterId] = {
          id: showdownMonsterId,
          accuracy: huntMonster.accuracy,
          accuracy_tokens: huntMonster.accuracy_tokens,
          ai_card_drawn: false,
          ai_deck_id: showdownAIDeck.id,
          ai_deck_remaining: huntMonster.ai_deck_remaining,
          damage: huntMonster.damage,
          damage_tokens: huntMonster.damage_tokens,
          evasion: huntMonster.evasion,
          evasion_tokens: huntMonster.evasion_tokens,
          knocked_down: huntMonster.knocked_down,
          luck: huntMonster.luck,
          luck_tokens: huntMonster.luck_tokens,
          monster_name: huntMonster.monster_name,
          moods: huntMonster.moods,
          movement: huntMonster.movement,
          movement_tokens: huntMonster.movement_tokens,
          notes: huntMonster.notes,
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId,
          speed: huntMonster.speed,
          speed_tokens: huntMonster.speed_tokens,
          strength: huntMonster.strength,
          strength_tokens: huntMonster.strength_tokens,
          toughness: huntMonster.toughness,
          traits: huntMonster.traits,
          wounds: huntMonster.wounds,
          ai_deck: showdownAIDeck
        }
      }

      // 4. Create showdown survivors from hunt survivors
      const showdownSurvivors: { [key: string]: ShowdownSurvivorDetail } = {}

      for (const huntSurvivor of Object.values(huntSurvivors)) {
        const showdownSurvivorId = await addShowdownSurvivor({
          accuracy_tokens: huntSurvivor.accuracy_tokens,
          activation_used: false,
          bleeding_tokens: 0,
          block_tokens: 0,
          deflect_tokens: 0,
          evasion_tokens: huntSurvivor.evasion_tokens,
          insanity_tokens: huntSurvivor.insanity_tokens,
          knocked_down: false,
          luck_tokens: huntSurvivor.luck_tokens,
          movement_tokens: huntSurvivor.movement_tokens,
          movement_used: false,
          notes: huntSurvivor.notes,
          priority_target: false,
          scout: huntSurvivor.scout,
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId,
          speed_tokens: huntSurvivor.speed_tokens,
          strength_tokens: huntSurvivor.strength_tokens,
          survival_tokens: huntSurvivor.survival_tokens,
          survivor_id: huntSurvivor.survivor_id
        })

        showdownSurvivors[showdownSurvivorId] = {
          id: showdownSurvivorId,
          accuracy_tokens: huntSurvivor.accuracy_tokens,
          activation_used: false,
          bleeding_tokens: 0,
          block_tokens: 0,
          deflect_tokens: 0,
          evasion_tokens: huntSurvivor.evasion_tokens,
          insanity_tokens: huntSurvivor.insanity_tokens,
          knocked_down: false,
          luck_tokens: huntSurvivor.luck_tokens,
          movement_tokens: huntSurvivor.movement_tokens,
          movement_used: false,
          notes: huntSurvivor.notes,
          priority_target: false,
          scout: huntSurvivor.scout,
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId,
          speed_tokens: huntSurvivor.speed_tokens,
          strength_tokens: huntSurvivor.strength_tokens,
          survival_tokens: huntSurvivor.survival_tokens,
          survivor_id: huntSurvivor.survivor_id
        }
      }

      // 5. Delete the hunt (cascade removes all hunt-related records)
      await removeHunt(selectedHunt.id)

      // 6. Build the ShowdownDetail and update local state
      const showdownDetail: ShowdownDetail = {
        id: showdownId,
        ambush: 'NONE',
        monster_level: selectedHunt.monster_level,
        settlement_id: selectedSettlement.id,
        showdown_type: 'REGULAR',
        turn: 'MONSTER',
        showdown_monsters: showdownMonsters,
        showdown_survivors: showdownSurvivors
      }

      // Clear hunt state
      setSelectedHunt(null)
      setSelectedHuntMonsterIndex(0)

      // Set showdown state
      setSelectedShowdown(showdownDetail)
      setSelectedShowdownMonsterIndex(0)

      // Switch to the showdown tab
      setSelectedTab(TabType.SHOWDOWN)

      setIsShowdownDialogOpen(false)

      // Get the first monster name for the toast message
      const firstMonster = Object.values(showdownMonsters)[0]
      toast.success(
        SHOWDOWN_CREATED_MESSAGE(
          firstMonster?.monster_name ?? 'Unknown Monster',
          MonsterType.QUARRY
        )
      )
    } catch (error: unknown) {
      console.error('Proceed to Showdown Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsProceedingToShowdown(false)
    }
  }, [
    selectedHunt,
    selectedSettlement,
    setSelectedHunt,
    setSelectedHuntMonsterIndex,
    setSelectedShowdown,
    setSelectedShowdownMonsterIndex,
    setSelectedTab
  ])

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

        {selectedSettlement?.survivor_type ===
          DatabaseSurvivorType[SurvivorType.ARC] ||
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
                  DatabaseSurvivorType[SurvivorType.ARC] && (
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
            <AlertDialogAction
              onClick={handleProceedToShowdown}
              disabled={isProceedingToShowdown}>
              {isProceedingToShowdown ? 'Proceeding...' : 'Proceed'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
