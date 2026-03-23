'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { ScoutSelectionDrawer } from '@/components/survivor/scout-selection/scout-selection-drawer'
import { SurvivorSelectionDrawer } from '@/components/survivor/survivor-selection/survivor-selection-drawer'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { vignetteUnlockMap } from '@/lib/common'
import { addHunt } from '@/lib/dal/hunt'
import { addHuntAIDeck } from '@/lib/dal/hunt-ai-deck'
import { addHuntHuntBoard } from '@/lib/dal/hunt-hunt-board'
import { addHuntMonster } from '@/lib/dal/hunt-monster'
import { addHuntSurvivor } from '@/lib/dal/hunt-survivor'
import { getQuarry } from '@/lib/dal/quarry'
import { getQuarryHuntBoard } from '@/lib/dal/quarry-hunt-board'
import { getQuarryLevels } from '@/lib/dal/quarry-level'
import { MonsterVersion } from '@/lib/enums'
import {
  ERROR_MESSAGE,
  HUNT_BEGINS_MESSAGE,
  SCOUT_CONFLICT_MESSAGE,
  SCOUT_REQUIRED_MESSAGE,
  SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE
} from '@/lib/messages'
import {
  HuntDetail,
  HuntSurvivorDetail,
  QuarryDetail,
  QuarryLevelDetail,
  SettlementDetail,
  ShowdownDetail,
  SurvivorDetail,
  UserSettingsDetail
} from '@/lib/types'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PawPrintIcon,
  SkullIcon
} from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Create Hunt Card Properties
 */
interface CreateHuntCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Set Selected Hunt */
  setSelectedHunt: (hunt: HuntDetail | null) => void
  /** Survivors */
  survivors: SurvivorDetail[]
  /** User Settings */
  userSettings: UserSettingsDetail | null
}

/**
 * Create Hunt Card Component
 *
 * Allows users to configure and begin a new hunt by selecting a quarry,
 * monster version (original/alternate/vignette), level, survivors, and
 * optionally a scout. Supports multi-monster encounters with carousel
 * navigation between sub-monsters. Monster stats are fetched from the
 * quarry_level table, and the hunt board template from the quarry_hunt_board
 * table.
 *
 * @param props Create Hunt Card Properties
 * @returns Create Hunt Card Component
 */
export function CreateHuntCard({
  selectedSettlement,
  selectedShowdown,
  setSelectedHunt,
  survivors,
  userSettings
}: CreateHuntCardProps): ReactElement {
  // Quarry and level selection state
  const [selectedQuarryId, setSelectedQuarryId] = useState<string | null>(null)
  const [quarryDetail, setQuarryDetail] = useState<QuarryDetail | null>(null)
  const [quarryLevels, setQuarryLevels] = useState<QuarryLevelDetail[]>([])
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number>(1)
  const [isCreating, setIsCreating] = useState<boolean>(false)

  // Monster version state (original, alternate, or vignette)
  const [selectedVersion, setSelectedVersion] = useState<MonsterVersion>(
    MonsterVersion.ORIGINAL
  )
  const [alternateDetail, setAlternateDetail] = useState<QuarryDetail | null>(
    null
  )
  const [alternateLevels, setAlternateLevels] = useState<QuarryLevelDetail[]>(
    []
  )
  const [vignetteDetail, setVignetteDetail] = useState<QuarryDetail | null>(
    null
  )
  const [vignetteLevels, setVignetteLevels] = useState<QuarryLevelDetail[]>([])

  // Multi-monster carousel index
  const [selectedMonsterIndex, setSelectedMonsterIndex] = useState<number>(0)

  // Survivor selection state
  const [selectedSurvivors, setSelectedSurvivors] = useState<string[]>([])
  const [selectedScout, setSelectedScout] = useState<string | null>(null)

  /** Available survivors (excluding dead/retired/skip next hunt) */
  const availableSurvivors = useMemo(
    () =>
      survivors
        .filter(
          (survivor) =>
            survivor.settlement_id === selectedSettlement?.id &&
            !survivor.dead &&
            !survivor.retired &&
            !survivor.skip_next_hunt
        )
        .sort((a, b) => {
          if (!a.survivor_name && !b.survivor_name) return 0
          if (!a.survivor_name) return 1
          if (!b.survivor_name) return -1
          return a.survivor_name.localeCompare(b.survivor_name)
        }),
    [survivors, selectedSettlement?.id]
  )

  /** Available quarries (unlocked) */
  const availableQuarries = useMemo(
    () =>
      (selectedSettlement?.quarries ?? [])
        .filter((quarry) => quarry.unlocked)
        .sort((a, b) => a.monster_name.localeCompare(b.monster_name)),
    [selectedSettlement?.quarries]
  )

  /**
   * Active quarry levels based on selected version
   *
   * When original is selected, uses the main quarry levels. When alternate or
   * vignette is selected, uses the respective version's levels.
   */
  const activeLevels = useMemo(() => {
    if (selectedVersion === MonsterVersion.ALTERNATE) return alternateLevels
    if (selectedVersion === MonsterVersion.VIGNETTE) return vignetteLevels
    return quarryLevels
  }, [selectedVersion, quarryLevels, alternateLevels, vignetteLevels])

  /** Active quarry ID based on selected version */
  const activeQuarryId = useMemo(() => {
    if (selectedVersion === MonsterVersion.ALTERNATE)
      return alternateDetail?.id ?? null
    if (selectedVersion === MonsterVersion.VIGNETTE)
      return vignetteDetail?.id ?? null
    return selectedQuarryId
  }, [
    selectedVersion,
    selectedQuarryId,
    alternateDetail?.id,
    vignetteDetail?.id
  ])

  /** Active monster name based on selected version */
  const activeMonsterName = useMemo(() => {
    if (selectedVersion === MonsterVersion.ALTERNATE)
      return alternateDetail?.monster_name
    if (selectedVersion === MonsterVersion.VIGNETTE)
      return vignetteDetail?.monster_name
    return quarryDetail?.monster_name
  }, [
    selectedVersion,
    quarryDetail?.monster_name,
    alternateDetail?.monster_name,
    vignetteDetail?.monster_name
  ])

  /** Active quarry detail for multi_monster check */
  const activeQuarryDetail = useMemo(() => {
    if (selectedVersion === MonsterVersion.ALTERNATE) return alternateDetail
    if (selectedVersion === MonsterVersion.VIGNETTE) return vignetteDetail
    return quarryDetail
  }, [selectedVersion, quarryDetail, alternateDetail, vignetteDetail])

  /** Unique level numbers for the level selector */
  const uniqueLevelNumbers = useMemo(
    () => [...new Set(activeLevels.map((l) => l.level_number))].sort(),
    [activeLevels]
  )

  /** Currently selected quarry level data (all sub-monsters for this level) */
  const selectedLevels = useMemo(
    () => activeLevels.filter((l) => l.level_number === selectedLevelNumber),
    [activeLevels, selectedLevelNumber]
  )

  /** Currently displayed sub-monster level */
  const displayedLevel = useMemo(
    () => selectedLevels[selectedMonsterIndex] ?? selectedLevels[0],
    [selectedLevels, selectedMonsterIndex]
  )

  /** Whether alternate/vignette versions are available for the selected level */
  const hasAlternate = useMemo(() => {
    if (!alternateDetail) return false
    return alternateLevels.some((l) => l.level_number === selectedLevelNumber)
  }, [alternateDetail, alternateLevels, selectedLevelNumber])

  const hasVignette = useMemo(() => {
    if (!vignetteDetail) return false
    if (!vignetteLevels.some((l) => l.level_number === selectedLevelNumber))
      return false

    // Check if the vignette requires a user settings unlock
    const unlockKey = vignetteUnlockMap[vignetteDetail.monster_name]
    if (unlockKey && userSettings) {
      const isUnlocked =
        userSettings[unlockKey as keyof typeof userSettings] === true
      if (!isUnlocked) return false
    }

    return true
  }, [vignetteDetail, vignetteLevels, selectedLevelNumber, userSettings])

  const showVersionSelector = hasAlternate || hasVignette

  /**
   * Handle Quarry Selection
   *
   * When a quarry is selected, fetches its levels and alternate/vignette
   * data from the database. Resets level and version selections.
   *
   * @param quarryId Quarry ID
   */
  const handleQuarrySelection = useCallback(async (quarryId: string) => {
    setSelectedQuarryId(quarryId)
    setSelectedLevelNumber(1)
    setQuarryLevels([])
    setSelectedVersion(MonsterVersion.ORIGINAL)
    setAlternateDetail(null)
    setAlternateLevels([])
    setVignetteDetail(null)
    setVignetteLevels([])
    setSelectedMonsterIndex(0)

    try {
      // Fetch the full quarry detail and levels in parallel
      const [detail, levels] = await Promise.all([
        getQuarry(quarryId),
        getQuarryLevels(quarryId)
      ])

      setQuarryDetail(detail)
      setQuarryLevels(levels)
      if (levels.length > 0) setSelectedLevelNumber(levels[0].level_number)

      // Fetch alternate data if available
      if (detail?.alternate_id) {
        const [altDetail, altLevels] = await Promise.all([
          getQuarry(detail.alternate_id),
          getQuarryLevels(detail.alternate_id)
        ])
        setAlternateDetail(altDetail)
        setAlternateLevels(altLevels)
      }

      // Fetch vignette data if available
      if (detail?.vignette_id) {
        const [vigDetail, vigLevels] = await Promise.all([
          getQuarry(detail.vignette_id),
          getQuarryLevels(detail.vignette_id)
        ])
        setVignetteDetail(vigDetail)
        setVignetteLevels(vigLevels)
      }
    } catch (err: unknown) {
      console.error('Quarry Data Fetch Error:', err)
      toast.error(ERROR_MESSAGE())
    }
  }, [])

  /**
   * Handle Level Selection
   *
   * Sets the chosen level number. Resets the selected monster index. If the
   * current version doesn't have this level, falls back to original.
   *
   * @param levelNumber Level Number
   */
  const handleLevelSelection = useCallback(
    (levelNumber: number) => {
      setSelectedLevelNumber(levelNumber)
      setSelectedMonsterIndex(0)

      // Reset version if the current version doesn't support this level
      if (
        selectedVersion === MonsterVersion.ALTERNATE &&
        !alternateLevels.some((l) => l.level_number === levelNumber)
      )
        setSelectedVersion(MonsterVersion.ORIGINAL)

      if (
        selectedVersion === MonsterVersion.VIGNETTE &&
        !vignetteLevels.some((l) => l.level_number === levelNumber)
      )
        setSelectedVersion(MonsterVersion.ORIGINAL)
    },
    [selectedVersion, alternateLevels, vignetteLevels]
  )

  /**
   * Handle Version Selection
   *
   * Sets the monster version (original, alternate, or vignette). Resets the
   * monster index and updates the level number if needed.
   *
   * @param version Monster Version
   */
  const handleVersionSelection = useCallback(
    (version: MonsterVersion) => {
      setSelectedVersion(version)
      setSelectedMonsterIndex(0)

      // Ensure the current level is valid for the new version
      const levels =
        version === MonsterVersion.ALTERNATE
          ? alternateLevels
          : version === MonsterVersion.VIGNETTE
            ? vignetteLevels
            : quarryLevels
      const levelNums = [...new Set(levels.map((l) => l.level_number))]

      if (!levelNums.includes(selectedLevelNumber) && levelNums.length > 0)
        setSelectedLevelNumber(levelNums[0])
    },
    [alternateLevels, vignetteLevels, quarryLevels, selectedLevelNumber]
  )

  /**
   * Handle Previous Monster in Multi-Monster Encounter
   */
  const handlePrevious = useCallback(() => {
    if (selectedLevels.length === 0) return
    const newIndex =
      (selectedMonsterIndex - 1 + selectedLevels.length) % selectedLevels.length
    setSelectedMonsterIndex(newIndex)
  }, [selectedMonsterIndex, selectedLevels.length])

  /**
   * Handle Next Monster in Multi-Monster Encounter
   */
  const handleNext = useCallback(() => {
    if (selectedLevels.length === 0) return
    const newIndex = (selectedMonsterIndex + 1) % selectedLevels.length
    setSelectedMonsterIndex(newIndex)
  }, [selectedMonsterIndex, selectedLevels.length])

  /**
   * Handle Dot Click in Multi-Monster Encounter
   *
   * @param index Clicked Dot Index
   */
  const handleDotClick = useCallback(
    (index: number) => {
      if (index >= 0 && index < selectedLevels.length)
        setSelectedMonsterIndex(index)
    },
    [selectedLevels.length]
  )

  /**
   * Handle Hunt Creation
   *
   * Validates the current selections and creates a new hunt with all related
   * records (hunt board, AI deck, monsters, survivors) in the database.
   */
  const handleCreateHunt = useCallback(async () => {
    if (!selectedSettlement || !activeQuarryId || !displayedLevel) return
    if (selectedSurvivors.length === 0) return

    // Prevent hunt creation if a showdown is already active
    if (
      selectedShowdown &&
      selectedShowdown.settlement_id === selectedSettlement.id
    )
      return toast.error(SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE())

    // Validate scout selection if settlement uses scouts
    if (selectedSettlement.uses_scouts && !selectedScout)
      return toast.error(SCOUT_REQUIRED_MESSAGE('hunt'))

    // Validate that scout is not also a selected survivor
    if (
      selectedSettlement.uses_scouts &&
      selectedScout &&
      selectedSurvivors.includes(selectedScout)
    )
      return toast.error(SCOUT_CONFLICT_MESSAGE())

    const quarry = availableQuarries.find(
      (q) => q.quarry_id === selectedQuarryId
    )
    if (!quarry) return toast.error(ERROR_MESSAGE())

    setIsCreating(true)

    try {
      // 1. Create hunt record
      const huntId = await addHunt({
        monster_level: selectedLevelNumber,
        monster_position: displayedLevel.hunt_pos,
        settlement_id: selectedSettlement.id,
        survivor_position: displayedLevel.survivor_hunt_pos
      })

      // 2. Create hunt board from quarry template (use the active version's ID)
      const quarryHuntBoard = await getQuarryHuntBoard(activeQuarryId)
      const huntBoard = await addHuntHuntBoard({
        hunt_id: huntId,
        pos_1: quarryHuntBoard?.pos_1 ?? 'BASIC',
        pos_2: quarryHuntBoard?.pos_2 ?? 'BASIC',
        pos_3: quarryHuntBoard?.pos_3 ?? 'BASIC',
        pos_4: quarryHuntBoard?.pos_4 ?? 'BASIC',
        pos_5: quarryHuntBoard?.pos_5 ?? 'BASIC',
        pos_7: quarryHuntBoard?.pos_7 ?? 'BASIC',
        pos_8: quarryHuntBoard?.pos_8 ?? 'BASIC',
        pos_9: quarryHuntBoard?.pos_9 ?? 'BASIC',
        pos_10: quarryHuntBoard?.pos_10 ?? 'BASIC',
        pos_11: quarryHuntBoard?.pos_11 ?? 'BASIC',
        settlement_id: selectedSettlement.id
      })

      // 3. Create AI deck(s) and hunt monster(s) for each sub-monster
      const huntMonsters: HuntDetail['hunt_monsters'] = {}

      for (const level of selectedLevels) {
        const aiDeck = await addHuntAIDeck({
          basic_cards: level.basic_cards,
          advanced_cards: level.advanced_cards,
          legendary_cards: level.legendary_cards,
          overtone_cards: level.overtone_cards,
          hunt_id: huntId,
          settlement_id: selectedSettlement.id
        })

        const monsterName =
          level.sub_monster_name ?? activeMonsterName ?? quarry.monster_name

        const huntMonster = {
          accuracy: level.accuracy,
          accuracy_tokens: level.accuracy_tokens,
          ai_deck_id: aiDeck.id,
          ai_deck_remaining: level.ai_deck_remaining,
          damage: level.damage,
          damage_tokens: level.damage_tokens,
          evasion: level.evasion,
          evasion_tokens: level.evasion_tokens,
          hunt_id: huntId,
          knocked_down: false,
          luck: level.luck,
          luck_tokens: level.luck_tokens,
          monster_name: monsterName,
          moods: level.moods,
          movement: level.movement,
          movement_tokens: level.movement_tokens,
          notes: '',
          settlement_id: selectedSettlement.id,
          speed: level.speed,
          speed_tokens: level.speed_tokens,
          strength: level.strength,
          strength_tokens: level.strength_tokens,
          toughness: level.toughness,
          traits: level.traits,
          wounds: 0
        }
        const huntMonsterId = await addHuntMonster(huntMonster)

        huntMonsters[huntMonsterId] = {
          ai_deck: {
            id: aiDeck.id,
            basic_cards: aiDeck.basic_cards,
            advanced_cards: aiDeck.advanced_cards,
            legendary_cards: aiDeck.legendary_cards,
            overtone_cards: aiDeck.overtone_cards
          },
          id: huntMonsterId,
          ...huntMonster
        }
      }

      // 4. Create hunt survivors
      const huntSurvivorMap: { [key: string]: HuntSurvivorDetail } = {}

      for (const survivorId of selectedSurvivors) {
        const huntSurvivor = {
          accuracy_tokens: 0,
          evasion_tokens: 0,
          hunt_id: huntId,
          insanity_tokens: 0,
          luck_tokens: 0,
          movement_tokens: 0,
          notes: '',
          scout: false,
          settlement_id: selectedSettlement.id,
          speed_tokens: 0,
          strength_tokens: 0,
          survival_tokens: 0,
          survivor_id: survivorId
        }
        const hsId = await addHuntSurvivor(huntSurvivor)

        huntSurvivorMap[hsId] = {
          id: hsId,
          ...huntSurvivor
        }
      }

      // Add scout as hunt survivor if applicable
      if (selectedScout) {
        const huntScout = {
          accuracy_tokens: 0,
          evasion_tokens: 0,
          hunt_id: huntId,
          insanity_tokens: 0,
          luck_tokens: 0,
          movement_tokens: 0,
          notes: '',
          scout: true,
          settlement_id: selectedSettlement.id,
          speed_tokens: 0,
          strength_tokens: 0,
          survival_tokens: 0,
          survivor_id: selectedScout
        }
        const scoutHsId = await addHuntSurvivor(huntScout)
        huntSurvivorMap[scoutHsId] = {
          id: scoutHsId,
          ...huntScout
        }
      }

      // Build the HuntDetail object for local state
      const huntDetail: HuntDetail = {
        id: huntId,
        monster_level: selectedLevelNumber,
        monster_position: displayedLevel.hunt_pos,
        settlement_id: selectedSettlement.id,
        survivor_position: displayedLevel.survivor_hunt_pos,
        hunt_board: huntBoard,
        hunt_monsters: huntMonsters,
        hunt_survivors: huntSurvivorMap
      }

      setSelectedHunt(huntDetail)

      // Reset form state
      setSelectedQuarryId(null)
      setQuarryDetail(null)
      setQuarryLevels([])
      setSelectedLevelNumber(1)
      setSelectedVersion(MonsterVersion.ORIGINAL)
      setAlternateDetail(null)
      setAlternateLevels([])
      setVignetteDetail(null)
      setVignetteLevels([])
      setSelectedMonsterIndex(0)
      setSelectedSurvivors([])
      setSelectedScout(null)

      toast.success(HUNT_BEGINS_MESSAGE(quarry.monster_name))
    } catch (error) {
      console.error('Hunt Creation Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsCreating(false)
    }
  }, [
    activeMonsterName,
    activeQuarryId,
    availableQuarries,
    displayedLevel,
    selectedLevelNumber,
    selectedLevels,
    selectedQuarryId,
    selectedScout,
    selectedSettlement,
    selectedShowdown,
    selectedSurvivors,
    setSelectedHunt
  ])

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PawPrintIcon className="h-5 w-5" />
          Begin Hunt
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 w-full">
        {/* Hunt Quarry */}
        <div className="flex items-center justify-between">
          <Label className="text-left whitespace-nowrap min-w-[90px]">
            Quarry
          </Label>

          {availableQuarries.length > 0 ? (
            <Select
              value={selectedQuarryId ?? ''}
              onValueChange={handleQuarrySelection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a quarry..." />
              </SelectTrigger>

              <SelectContent>
                {availableQuarries.map((quarry) => (
                  <SelectItem key={quarry.quarry_id} value={quarry.quarry_id}>
                    {quarry.monster_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              No available/unlocked quarries
            </p>
          )}
        </div>

        {/* Monster Level */}
        <div className="flex items-center justify-between">
          <Label className="text-left whitespace-nowrap min-w-[90px]">
            Level
          </Label>

          <Select
            value={String(selectedLevelNumber)}
            onValueChange={(value) => handleLevelSelection(Number(value))}
            disabled={activeLevels.length === 0}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose level..." />
            </SelectTrigger>

            <SelectContent>
              {uniqueLevelNumbers.map((levelNum) => (
                <SelectItem key={levelNum} value={String(levelNum)}>
                  Level {levelNum}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Monster Version */}
        {showVersionSelector && (
          <div className="flex items-center justify-between">
            <Label className="text-left whitespace-nowrap min-w-[90px]">
              Version
            </Label>

            <Select
              value={selectedVersion}
              onValueChange={(value) =>
                handleVersionSelection(value as MonsterVersion)
              }>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose version..." />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={MonsterVersion.ORIGINAL}>
                  {quarryDetail?.monster_name ?? 'Original'}
                </SelectItem>
                {hasAlternate && (
                  <SelectItem value={MonsterVersion.ALTERNATE}>
                    {alternateDetail?.monster_name} (Alternate)
                  </SelectItem>
                )}
                {hasVignette && (
                  <SelectItem value={MonsterVersion.VIGNETTE}>
                    {vignetteDetail?.monster_name} (Vignette)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator className="my-2" />

        {/* Multi-Monster Name */}
        {activeQuarryDetail?.multi_monster && selectedLevels.length > 1 && (
          <h3 className="text-sm font-semibold text-muted-foreground text-center">
            {displayedLevel?.sub_monster_name ?? 'Unknown Monster'}
          </h3>
        )}

        {/* Multi-Monster Carousel Controls */}
        {activeQuarryDetail?.multi_monster && selectedLevels.length > 1 && (
          <div className="monster_carousel_controls">
            <div className="monster_carousel_buttons">
              <Button
                className="h-8 w-8"
                variant="ghost"
                size="icon"
                onClick={handlePrevious}>
                <ArrowLeftIcon className="size-8" />
              </Button>

              <Button
                className="h-8 w-8"
                variant="ghost"
                size="icon"
                onClick={handleNext}>
                <ArrowRightIcon className="size-8" />
              </Button>
            </div>

            <div className="monster_carousel_dots">
              {selectedLevels.map((_, index) => {
                const isSelected = index === selectedMonsterIndex

                return (
                  <Avatar
                    key={selectedLevels[index].id}
                    className={`monster_carousel_dot${isSelected ? ' monster_carousel_dot--selected' : ''} bg-red-500 items-center justify-center cursor-pointer`}
                    style={{
                      ['--dot-color' as string]: isSelected
                        ? 'hsl(var(--foreground))'
                        : 'transparent',
                      ['--dot-bg' as string]: 'hsl(var(--destructive))'
                    }}
                    onClick={() => handleDotClick(index)}>
                    <AvatarFallback className="bg-transparent">
                      <SkullIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )
              })}
            </div>
          </div>
        )}

        {activeQuarryDetail?.multi_monster && selectedLevels.length > 1 && (
          <Separator className="my-2" />
        )}

        {/* AI Deck */}
        <h3 className="text-xs font-semibold text-muted-foreground text-center">
          AI Deck
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex gap-2 w-full">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-center block">A Cards</Label>
              <NumericInput
                label="A Cards"
                value={displayedLevel?.advanced_cards ?? 0}
                min={0}
                disabled={true}
              />
            </div>

            <div className="flex-1 space-y-1">
              <Label className="text-xs text-center block">B Cards</Label>
              <NumericInput
                label="B Cards"
                value={displayedLevel?.basic_cards ?? 0}
                min={0}
                disabled={true}
              />
            </div>

            <div className="flex-1 space-y-1">
              <Label className="text-xs text-center block">L Cards</Label>
              <NumericInput
                label="L Cards"
                value={displayedLevel?.legendary_cards ?? 0}
                min={0}
                disabled={true}
              />
            </div>

            <div className="flex-1 space-y-1">
              <Label className="text-xs text-center block">O Cards</Label>
              <NumericInput
                label="O Cards"
                value={displayedLevel?.overtone_cards ?? 0}
                min={0}
                disabled={true}
              />
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Monster Attributes */}
        <h3 className="text-xs font-semibold text-muted-foreground text-center">
          Attributes
        </h3>

        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <Label className="text-xs justify-center">Movement</Label>
            <NumericInput
              label="Movement"
              value={displayedLevel?.movement ?? 0}
              disabled={true}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs justify-center">Toughness</Label>
            <NumericInput
              label="Toughness"
              value={displayedLevel?.toughness ?? 0}
              disabled={true}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs justify-center">Speed</Label>
            <NumericInput
              label="Speed"
              value={displayedLevel?.speed ?? 0}
              disabled={true}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs justify-center">Damage</Label>
            <NumericInput
              label="Damage"
              value={displayedLevel?.damage ?? 0}
              disabled={true}
            />
          </div>
        </div>

        <Separator className="my-2" />

        {/* Survivor Selection */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-muted-foreground text-center">
            Survivors
          </h3>
        </div>

        <SurvivorSelectionDrawer
          title="Select Hunt Party"
          description="Up to 4 survivors may embark on a hunt."
          survivors={availableSurvivors}
          selectedSurvivors={selectedSurvivors}
          selectedScout={selectedScout}
          onSelectionChange={setSelectedSurvivors}
          maxSelection={4}
        />

        {selectedSettlement?.uses_scouts && (
          <ScoutSelectionDrawer
            title="Select Scout"
            description="Choose a single scout. Their skills will help navigate the dangers ahead."
            survivors={availableSurvivors}
            selectedSurvivors={selectedSurvivors}
            selectedScout={selectedScout}
            onSelectionChange={setSelectedScout}
          />
        )}

        {availableSurvivors.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {survivors.filter((s) => s.settlement_id === selectedSettlement?.id)
              .length === 0
              ? 'No survivors available. Create survivors first.'
              : 'All survivors are dead or retired.'}
          </p>
        )}

        <Button
          onClick={handleCreateHunt}
          disabled={
            !activeQuarryId ||
            activeLevels.length === 0 ||
            availableSurvivors.length === 0 ||
            selectedSurvivors.length === 0 ||
            (selectedSettlement?.uses_scouts === true && !selectedScout) ||
            isCreating
          }
          className="w-full mt-2">
          {isCreating ? 'Creating...' : 'Begin Hunt'}
        </Button>
      </CardContent>
    </Card>
  )
}
