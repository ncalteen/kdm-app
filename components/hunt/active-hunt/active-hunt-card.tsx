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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { addEncounter, removeEncounter } from '@/lib/dal/encounter'
import { addEncounterActiveMonster } from '@/lib/dal/encounter-active-monster'
import { getEncounterMonsters } from '@/lib/dal/encounter-monster'
import { addEncounterSurvivor } from '@/lib/dal/encounter-survivor'
import { removeHunt, updateHunt } from '@/lib/dal/hunt'
import { updateHuntHuntBoard } from '@/lib/dal/hunt-hunt-board'
import { copyMonsterJunctions } from '@/lib/dal/monster-trait-mood'
import { addShowdown } from '@/lib/dal/showdown'
import { addShowdownAIDeck } from '@/lib/dal/showdown-ai-deck'
import { addShowdownMonster } from '@/lib/dal/showdown-monster'
import { addShowdownSurvivor } from '@/lib/dal/showdown-survivor'
import {
  DatabaseSurvivorType,
  HuntEventCount,
  HuntEventType,
  SurvivorType,
  TabType
} from '@/lib/enums'
import { computeEmbarkGearShortages } from '@/lib/gear-grid'
import {
  EMBARK_GEAR_SHORTAGE_ERROR_MESSAGE,
  ERROR_MESSAGE
} from '@/lib/messages'
import {
  EncounterActiveMonsterDetail,
  EncounterDetail,
  EncounterMonsterDetail,
  EncounterStateSetter,
  EncounterSurvivorDetail,
  HuntDetail,
  HuntHuntBoardDetail,
  HuntStateSetter,
  SettlementDetail,
  ShowdownDetail,
  ShowdownMonsterDetail,
  ShowdownStateSetter,
  ShowdownSurvivorDetail,
  SurvivorDetail,
  SurvivorsStateSetter,
  SurvivorStateSetter
} from '@/lib/types'
import { ChevronRightIcon, DicesIcon, SwordsIcon, XIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Active Hunt Card Properties
 */
interface ActiveHuntCardProps {
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Encounter */
  selectedEncounter: EncounterDetail | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Encounter */
  setSelectedEncounter: EncounterStateSetter
  /** Set Selected Hunt */
  setSelectedHunt: HuntStateSetter
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
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
  selectedEncounter,
  selectedHuntMonsterIndex,
  selectedSettlement,
  selectedSurvivor,
  setSelectedEncounter,
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
  const [isEncounterDialogOpen, setIsEncounterDialogOpen] =
    useState<boolean>(false)
  const [isShowdownDialogOpen, setIsShowdownDialogOpen] =
    useState<boolean>(false)
  const [isStartingEncounter, setIsStartingEncounter] = useState<boolean>(false)
  const [isProceedingToShowdown, setIsProceedingToShowdown] =
    useState<boolean>(false)
  const [huntEventPopoverOpen, setHuntEventPopoverOpen] =
    useState<boolean>(false)
  const [encounterMonsters, setEncounterMonsters] = useState<
    EncounterMonsterDetail[]
  >([])
  const [selectedEncounterMonsterId, setSelectedEncounterMonsterId] = useState<
    string | null
  >(null)
  const [selectedEncounterLevelNumber, setSelectedEncounterLevelNumber] =
    useState<number | null>(null)

  const selectedEncounterMonster = useMemo(
    () => encounterMonsters.find((m) => m.id === selectedEncounterMonsterId),
    [encounterMonsters, selectedEncounterMonsterId]
  )

  const selectedEncounterLevelNumbers = useMemo(
    () =>
      [
        ...new Set(
          (selectedEncounterMonster?.levels ?? []).map(
            (level) => level.level_number
          )
        )
      ].sort((a, b) => a - b),
    [selectedEncounterMonster]
  )

  const selectedEncounterLevels = useMemo(
    () =>
      (selectedEncounterMonster?.levels ?? []).filter(
        (level) => level.level_number === selectedEncounterLevelNumber
      ),
    [selectedEncounterMonster, selectedEncounterLevelNumber]
  )

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
      }).catch((err: unknown) => {
        // Rollback
        setSelectedHunt((prev) =>
          prev
            ? {
                ...prev,
                survivor_position: previousSurvivorPos,
                monster_position: previousMonsterPos
              }
            : null
        )

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
        setSelectedHunt((prev) =>
          prev?.hunt_board
            ? {
                ...prev,
                hunt_board: {
                  ...prev.hunt_board,
                  [posKey]: previousValue
                }
              }
            : prev
        )

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
      })
      .catch((err: unknown) => {
        console.error('Delete Hunt Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedHunt, setSelectedHunt, setSelectedHuntMonsterIndex])

  /**
   * Handle Encounter
   *
   * Opens the encounter selection dialog, or returns to an already active
   * encounter.
   */
  const handleEncounter = useCallback(() => {
    if (selectedEncounter) {
      setSelectedTab(TabType.ENCOUNTER)
      return
    }

    setIsEncounterDialogOpen(true)

    if (encounterMonsters.length > 0) return

    getEncounterMonsters()
      .then((monsters) => {
        setEncounterMonsters(monsters)
        const firstMonster = monsters.find((monster) => monster.levels.length)
        setSelectedEncounterMonsterId(firstMonster?.id ?? null)
        setSelectedEncounterLevelNumber(
          firstMonster?.levels[0]?.level_number ?? null
        )
      })
      .catch((err: unknown) => {
        console.error('Encounter Monster Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [encounterMonsters.length, selectedEncounter, setSelectedTab])

  /**
   * Handle Encounter Monster Selection
   *
   * @param monsterId Encounter Monster ID
   */
  const handleEncounterMonsterSelection = useCallback(
    (monsterId: string) => {
      const monster = encounterMonsters.find((m) => m.id === monsterId)
      setSelectedEncounterMonsterId(monsterId)
      setSelectedEncounterLevelNumber(monster?.levels[0]?.level_number ?? null)
    },
    [encounterMonsters]
  )

  /**
   * Handle Start Encounter
   *
   * Creates an active encounter from the current hunt party and selected
   * encounter monster level, preserving the hunt so it can be resumed later.
   */
  const handleStartEncounter = useCallback(async () => {
    if (
      !selectedHunt ||
      !selectedSettlement ||
      !selectedEncounterMonster ||
      !selectedEncounterLevelNumber ||
      selectedEncounterLevels.length === 0
    )
      return

    const huntSurvivors = selectedHunt.hunt_survivors
    if (!huntSurvivors) {
      toast.error(ERROR_MESSAGE())
      return
    }

    setIsStartingEncounter(true)

    let encounterId: string | null = null
    const usedMonsterNames = new Set<string>()
    const getUniqueMonsterName = (baseName: string): string => {
      let monsterName = baseName
      let suffix = 2

      while (usedMonsterNames.has(monsterName)) {
        monsterName = `${baseName} ${suffix}`
        suffix += 1
      }

      usedMonsterNames.add(monsterName)
      return monsterName
    }

    try {
      encounterId = await addEncounter({
        hunt_id: selectedHunt.id,
        monster_level: selectedEncounterLevelNumber,
        settlement_id: selectedSettlement.id,
        turn: 'MONSTER'
      })

      const encounterMonstersById: {
        [key: string]: EncounterActiveMonsterDetail
      } = {}

      for (const [levelIndex, level] of selectedEncounterLevels.entries()) {
        const baseMonsterName =
          level.sub_monster_name?.trim() ||
          (selectedEncounterLevels.length > 1
            ? `${selectedEncounterMonster.monster_name} ${levelIndex + 1}`
            : selectedEncounterMonster.monster_name)
        const encounterMonster = {
          accuracy: level.accuracy,
          accuracy_tokens: 0,
          damage: level.damage,
          damage_tokens: 0,
          encounter_id: encounterId,
          encounter_monster_id: selectedEncounterMonster.id,
          encounter_monster_level_id: level.id,
          evasion: level.evasion,
          evasion_tokens: 0,
          knocked_down: false,
          life: level.life,
          luck: level.luck,
          luck_tokens: 0,
          monster_name: getUniqueMonsterName(baseMonsterName),
          movement: level.movement,
          movement_tokens: 0,
          notes: '',
          settlement_id: selectedSettlement.id,
          speed: level.speed,
          speed_tokens: 0,
          toughness: level.toughness
        }
        const encounterMonsterId =
          await addEncounterActiveMonster(encounterMonster)

        await Promise.all([
          copyMonsterJunctions(
            {
              table: 'encounter_monster_level_trait',
              parentId: level.id
            },
            {
              table: 'encounter_active_monster_trait',
              parentId: encounterMonsterId
            }
          ),
          copyMonsterJunctions(
            {
              table: 'encounter_monster_level_mood',
              parentId: level.id
            },
            {
              table: 'encounter_active_monster_mood',
              parentId: encounterMonsterId
            }
          )
        ])

        encounterMonstersById[encounterMonsterId] = {
          id: encounterMonsterId,
          ...encounterMonster,
          traits: level.traits.map((trait) => ({
            ...trait,
            author_user_id: null,
            author_username: null,
            author_avatar_url: null
          })),
          moods: level.moods.map((mood) => ({
            ...mood,
            author_user_id: null,
            author_username: null,
            author_avatar_url: null
          })),
          survivor_statuses: []
        }
      }

      const encounterSurvivors: { [key: string]: EncounterSurvivorDetail } = {}

      for (const huntSurvivor of Object.values(huntSurvivors)) {
        const encounterSurvivor = {
          accuracy_tokens: huntSurvivor.accuracy_tokens,
          activation_used: false,
          bleeding_tokens: huntSurvivor.bleeding_tokens,
          block_tokens: 0,
          deflect_tokens: 0,
          encounter_id: encounterId,
          evasion_tokens: huntSurvivor.evasion_tokens,
          insanity_tokens: huntSurvivor.insanity_tokens,
          knocked_down: false,
          luck_tokens: huntSurvivor.luck_tokens,
          movement_tokens: huntSurvivor.movement_tokens,
          movement_used: false,
          notes: huntSurvivor.notes,
          scout: huntSurvivor.scout,
          settlement_id: selectedSettlement.id,
          speed_tokens: huntSurvivor.speed_tokens,
          strength_tokens: huntSurvivor.strength_tokens,
          survival_tokens: huntSurvivor.survival_tokens,
          survivor_id: huntSurvivor.survivor_id
        }
        const encounterSurvivorId =
          await addEncounterSurvivor(encounterSurvivor)
        encounterSurvivors[encounterSurvivorId] = {
          id: encounterSurvivorId,
          ...encounterSurvivor
        }
      }

      setSelectedEncounter({
        id: encounterId,
        hunt_id: selectedHunt.id,
        monster_level: selectedEncounterLevelNumber,
        settlement_id: selectedSettlement.id,
        turn: 'MONSTER',
        encounter_monsters: encounterMonstersById,
        encounter_survivors: encounterSurvivors
      })

      setIsEncounterDialogOpen(false)
      setSelectedTab(TabType.ENCOUNTER)
    } catch (error: unknown) {
      console.error('Start Encounter Error:', error)
      if (encounterId) {
        try {
          await removeEncounter(encounterId)
        } catch (cleanupError: unknown) {
          console.error('Start Encounter Cleanup Error:', cleanupError)
        }
      }
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsStartingEncounter(false)
    }
  }, [
    selectedEncounterLevelNumber,
    selectedEncounterLevels,
    selectedEncounterMonster,
    selectedHunt,
    selectedSettlement,
    setSelectedEncounter,
    setSelectedTab
  ])

  /**
   * Handle Showdown (open confirmation dialog)
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

    // Re-validate gear availability before transitioning to a showdown.
    // Settlement gear may have changed during the hunt (e.g. dropped/lost
    // gear), so check that the embarking survivors collectively still fit
    // within the settlement's current stock.
    const embarkingIds = new Set(
      Object.values(huntSurvivors).map((hs) => hs.survivor_id)
    )
    const embarkingSurvivors = survivors.filter((s) => embarkingIds.has(s.id))
    const gearShortages = computeEmbarkGearShortages(
      embarkingSurvivors,
      selectedSettlement.gear
    )
    if (gearShortages.length > 0) {
      toast.error(EMBARK_GEAR_SHORTAGE_ERROR_MESSAGE(gearShortages))
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
          wounds: huntMonster.wounds
        })

        // Copy trait/mood/survivor-status junctions from the hunt monster.
        await Promise.all([
          copyMonsterJunctions(
            { table: 'hunt_monster_trait', parentId: huntMonster.id },
            {
              table: 'showdown_monster_trait',
              parentId: showdownMonsterId
            }
          ),
          copyMonsterJunctions(
            { table: 'hunt_monster_mood', parentId: huntMonster.id },
            {
              table: 'showdown_monster_mood',
              parentId: showdownMonsterId
            }
          ),
          copyMonsterJunctions(
            {
              table: 'hunt_monster_survivor_status',
              parentId: huntMonster.id
            },
            {
              table: 'showdown_monster_survivor_status',
              parentId: showdownMonsterId
            }
          )
        ])

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
          survivor_statuses: huntMonster.survivor_statuses,
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
          bleeding_tokens: huntSurvivor.bleeding_tokens,
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
          bleeding_tokens: huntSurvivor.bleeding_tokens,
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
    setSelectedTab,
    survivors
  ])

  return (
    <div className="flex flex-col gap-2 h-full relative">
      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0 pointer-events-none">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancelHunt}
          className="pointer-events-auto w-full sm:w-auto"
          title="End Hunt">
          <XIcon className="size-4" />
          End Hunt
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleEncounter}
          className="pointer-events-auto w-full sm:w-auto"
          title={selectedEncounter ? 'Open Encounter' : 'Begin Encounter'}>
          <SwordsIcon className="size-4" />
          {selectedEncounter ? 'Open Encounter' : 'Begin Encounter'}
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
                className="pointer-events-auto w-full sm:w-auto"
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
            className="pointer-events-auto w-full sm:w-auto"
            title="Roll Hunt Event">
            Roll Hunt Event <DicesIcon className="size-4" />
          </Button>
        )}

        <Button
          variant="destructive"
          size="sm"
          onClick={handleShowdown}
          disabled={!!selectedEncounter}
          className="pointer-events-auto w-full sm:w-auto"
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

      {/* Encounter Selection Dialog */}
      <AlertDialog
        open={isEncounterDialogOpen}
        onOpenChange={setIsEncounterDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Begin Encounter</AlertDialogTitle>
            <AlertDialogDescription>
              The hunt will pause while the party faces a nearer threat.
              Survivors will carry their wounds and tokens into the encounter.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <Select
              value={selectedEncounterMonsterId ?? ''}
              onValueChange={handleEncounterMonsterSelection}
              disabled={encounterMonsters.length === 0}>
              <SelectTrigger aria-label="Encounter Monster">
                <SelectValue placeholder="Choose an encounter monster..." />
              </SelectTrigger>
              <SelectContent>
                {encounterMonsters
                  .filter((monster) => monster.levels.length > 0)
                  .map((monster) => (
                    <SelectItem key={monster.id} value={monster.id}>
                      {monster.monster_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select
              value={
                selectedEncounterLevelNumber === null
                  ? ''
                  : String(selectedEncounterLevelNumber)
              }
              onValueChange={(value) =>
                setSelectedEncounterLevelNumber(Number(value))
              }
              disabled={selectedEncounterLevelNumbers.length === 0}>
              <SelectTrigger aria-label="Encounter Level">
                <SelectValue placeholder="Choose level..." />
              </SelectTrigger>
              <SelectContent>
                {selectedEncounterLevelNumbers.map((levelNumber) => {
                  const monsterCount =
                    selectedEncounterMonster?.levels.filter(
                      (level) => level.level_number === levelNumber
                    ).length ?? 0

                  return (
                    <SelectItem key={levelNumber} value={String(levelNumber)}>
                      Level {levelNumber}
                      {monsterCount > 1 ? ` (${monsterCount} monsters)` : ''}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {encounterMonsters.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No encounter monsters wait in the dark.
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartEncounter}
              disabled={
                selectedEncounterLevels.length === 0 || isStartingEncounter
              }>
              {isStartingEncounter ? 'Beginning...' : 'Begin Encounter'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
