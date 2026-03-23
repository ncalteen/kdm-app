'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { ScoutSelectionDrawer } from '@/components/survivor/scout-selection/scout-selection-drawer'
import { SurvivorSelectionDrawer } from '@/components/survivor/survivor-selection/survivor-selection-drawer'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useLocal } from '@/contexts/local-context'
import { getNemesis } from '@/lib/dal/nemesis'
import { getNemesisLevels } from '@/lib/dal/nemesis-level'
import { getQuarry } from '@/lib/dal/quarry'
import { getQuarryLevels } from '@/lib/dal/quarry-level'
import { addShowdown } from '@/lib/dal/showdown'
import { addShowdownAIDeck } from '@/lib/dal/showdown-ai-deck'
import { addShowdownMonster } from '@/lib/dal/showdown-monster'
import { addShowdownSurvivor } from '@/lib/dal/showdown-survivor'
import { AmbushType, MonsterType, TurnType } from '@/lib/enums'
import {
  ERROR_MESSAGE,
  HUNT_ALREADY_ACTIVE_ERROR_MESSAGE,
  SCOUT_CONFLICT_MESSAGE,
  SCOUT_REQUIRED_MESSAGE,
  SHOWDOWN_CREATED_MESSAGE
} from '@/lib/messages'
import {
  HuntDetail,
  NemesisDetail,
  NemesisLevelDetail,
  QuarryDetail,
  QuarryLevelDetail,
  SettlementDetail,
  ShowdownDetail,
  ShowdownSurvivorDetail,
  SurvivorDetail
} from '@/lib/types'
import { ArrowLeftIcon, ArrowRightIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

/** Vignette monster names that require user setting unlocks */
const VIGNETTE_UNLOCK_MAP: Record<string, string> = {
  'Killenium Butcher': 'unlocked_killenium_butcher',
  'Screaming Nukalope': 'unlocked_screaming_nukalope',
  'White Gigalion': 'unlocked_white_gigalion'
}

/** Monster source type (quarry or nemesis) */
type MonsterSource = 'quarry' | 'nemesis'

/** Monster version */
enum MonsterVersion {
  ORIGINAL = 'original',
  ALTERNATE = 'alternate',
  VIGNETTE = 'vignette'
}

/**
 * Create Showdown Card Properties
 */
interface CreateShowdownCardProps {
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Showdown */
  setSelectedShowdown: (showdown: ShowdownDetail | null) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Create Showdown Card Component
 *
 * Allows users to configure and begin a new showdown by selecting a monster
 * (quarry or nemesis), level, version, survivors, and optionally a scout.
 * Supports multi-monster encounters, alternate/vignette versions, special
 * showdowns, and ambush type selection.
 *
 * @param props Create Showdown Card Properties
 * @returns Create Showdown Card Component
 */
export function CreateShowdownCard({
  selectedHunt,
  selectedSettlement,
  setSelectedShowdown,
  survivors
}: CreateShowdownCardProps): ReactElement {
  const { userSettings } = useLocal()

  // Monster selection state
  const [monsterSource, setMonsterSource] = useState<MonsterSource | null>(null)
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(
    null
  )
  const [monsterDetail, setMonsterDetail] = useState<
    QuarryDetail | NemesisDetail | null
  >(null)
  const [monsterLevels, setMonsterLevels] = useState<
    (QuarryLevelDetail | NemesisLevelDetail)[]
  >([])
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number>(1)
  const [isCreating, setIsCreating] = useState<boolean>(false)

  // Version state
  const [selectedVersion, setSelectedVersion] = useState<MonsterVersion>(
    MonsterVersion.ORIGINAL
  )
  const [alternateDetail, setAlternateDetail] = useState<
    QuarryDetail | NemesisDetail | null
  >(null)
  const [alternateLevels, setAlternateLevels] = useState<
    (QuarryLevelDetail | NemesisLevelDetail)[]
  >([])
  const [vignetteDetail, setVignetteDetail] = useState<
    QuarryDetail | NemesisDetail | null
  >(null)
  const [vignetteLevels, setVignetteLevels] = useState<
    (QuarryLevelDetail | NemesisLevelDetail)[]
  >([])

  // Multi-monster carousel index
  const [selectedMonsterIndex, setSelectedMonsterIndex] = useState<number>(0)

  // Showdown configuration
  const [isSpecialShowdown, setIsSpecialShowdown] = useState<boolean>(false)
  const [ambushType, setAmbushType] = useState<AmbushType>(AmbushType.NONE)
  const [startingTurn, setStartingTurn] = useState<TurnType>(TurnType.MONSTER)

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

  /** Available nemeses (unlocked) */
  const availableNemeses = useMemo(
    () =>
      (selectedSettlement?.nemeses ?? [])
        .filter((nemesis) => nemesis.unlocked)
        .sort((a, b) => a.monster_name.localeCompare(b.monster_name)),
    [selectedSettlement?.nemeses]
  )

  /** Active levels based on selected version */
  const activeLevels = useMemo(() => {
    if (selectedVersion === MonsterVersion.ALTERNATE) return alternateLevels
    if (selectedVersion === MonsterVersion.VIGNETTE) return vignetteLevels
    return monsterLevels
  }, [selectedVersion, monsterLevels, alternateLevels, vignetteLevels])

  /** Active monster ID based on selected version */
  const activeMonsterDetail = useMemo(() => {
    if (selectedVersion === MonsterVersion.ALTERNATE) return alternateDetail
    if (selectedVersion === MonsterVersion.VIGNETTE) return vignetteDetail
    return monsterDetail
  }, [selectedVersion, monsterDetail, alternateDetail, vignetteDetail])

  /** Active monster name */
  const activeMonsterName = activeMonsterDetail?.monster_name

  /** Unique level numbers for the level selector */
  const uniqueLevelNumbers = useMemo(
    () => [...new Set(activeLevels.map((l) => l.level_number))].sort(),
    [activeLevels]
  )

  /** Sub-monsters for the selected level */
  const selectedLevels = useMemo(
    () => activeLevels.filter((l) => l.level_number === selectedLevelNumber),
    [activeLevels, selectedLevelNumber]
  )

  /** Currently displayed sub-monster level */
  const displayedLevel = useMemo(
    () => selectedLevels[selectedMonsterIndex] ?? selectedLevels[0],
    [selectedLevels, selectedMonsterIndex]
  )

  /** Whether alternate/vignette versions are available */
  const hasAlternate = useMemo(() => {
    if (!alternateDetail) return false
    return alternateLevels.some((l) => l.level_number === selectedLevelNumber)
  }, [alternateDetail, alternateLevels, selectedLevelNumber])

  const hasVignette = useMemo(() => {
    if (!vignetteDetail) return false
    if (!vignetteLevels.some((l) => l.level_number === selectedLevelNumber))
      return false
    const unlockKey = VIGNETTE_UNLOCK_MAP[vignetteDetail.monster_name]
    if (unlockKey && userSettings) {
      const isUnlocked =
        userSettings[unlockKey as keyof typeof userSettings] === true
      if (!isUnlocked) return false
    }
    return true
  }, [vignetteDetail, vignetteLevels, selectedLevelNumber, userSettings])

  const showVersionSelector = hasAlternate || hasVignette

  /** Fetch levels for a quarry or nemesis */
  const fetchLevels = useCallback(async (id: string, source: MonsterSource) => {
    return source === 'quarry'
      ? await getQuarryLevels(id)
      : await getNemesisLevels(id)
  }, [])

  /** Fetch detail for a quarry or nemesis */
  const fetchDetail = useCallback(async (id: string, source: MonsterSource) => {
    return source === 'quarry' ? await getQuarry(id) : await getNemesis(id)
  }, [])

  /**
   * Handle Monster Selection
   *
   * @param monsterId Monster ID (quarry_id or nemesis_id)
   * @param source Whether this is a quarry or nemesis
   */
  const handleMonsterSelection = useCallback(
    async (monsterId: string, source: MonsterSource) => {
      setSelectedMonsterId(monsterId)
      setMonsterSource(source)
      setSelectedLevelNumber(1)
      setMonsterLevels([])
      setSelectedVersion(MonsterVersion.ORIGINAL)
      setAlternateDetail(null)
      setAlternateLevels([])
      setVignetteDetail(null)
      setVignetteLevels([])
      setSelectedMonsterIndex(0)

      try {
        const [detail, levels] = await Promise.all([
          fetchDetail(monsterId, source),
          fetchLevels(monsterId, source)
        ])

        setMonsterDetail(detail)
        setMonsterLevels(levels)
        if (levels.length > 0) setSelectedLevelNumber(levels[0].level_number)

        if (detail?.alternate_id) {
          const [altDetail, altLevels] = await Promise.all([
            fetchDetail(detail.alternate_id, source),
            fetchLevels(detail.alternate_id, source)
          ])
          setAlternateDetail(altDetail)
          setAlternateLevels(altLevels)
        }

        if (detail?.vignette_id) {
          const [vigDetail, vigLevels] = await Promise.all([
            fetchDetail(detail.vignette_id, source),
            fetchLevels(detail.vignette_id, source)
          ])
          setVignetteDetail(vigDetail)
          setVignetteLevels(vigLevels)
        }
      } catch (err: unknown) {
        console.error('Monster Data Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      }
    },
    [fetchDetail, fetchLevels]
  )

  /** Handle Level Selection */
  const handleLevelSelection = useCallback(
    (levelNumber: number) => {
      setSelectedLevelNumber(levelNumber)
      setSelectedMonsterIndex(0)
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

  /** Handle Version Selection */
  const handleVersionSelection = useCallback(
    (version: MonsterVersion) => {
      setSelectedVersion(version)
      setSelectedMonsterIndex(0)
      const levels =
        version === MonsterVersion.ALTERNATE
          ? alternateLevels
          : version === MonsterVersion.VIGNETTE
            ? vignetteLevels
            : monsterLevels
      const levelNums = [...new Set(levels.map((l) => l.level_number))]
      if (!levelNums.includes(selectedLevelNumber) && levelNums.length > 0)
        setSelectedLevelNumber(levelNums[0])
    },
    [alternateLevels, vignetteLevels, monsterLevels, selectedLevelNumber]
  )

  /** Multi-monster navigation */
  const handlePrevious = useCallback(() => {
    if (selectedLevels.length === 0) return
    setSelectedMonsterIndex(
      (selectedMonsterIndex - 1 + selectedLevels.length) % selectedLevels.length
    )
  }, [selectedMonsterIndex, selectedLevels.length])

  const handleNext = useCallback(() => {
    if (selectedLevels.length === 0) return
    setSelectedMonsterIndex((selectedMonsterIndex + 1) % selectedLevels.length)
  }, [selectedMonsterIndex, selectedLevels.length])

  const handleDotClick = useCallback(
    (index: number) => {
      if (index >= 0 && index < selectedLevels.length)
        setSelectedMonsterIndex(index)
    },
    [selectedLevels.length]
  )

  /**
   * Handle Showdown Creation
   */
  const handleCreateShowdown = useCallback(async () => {
    if (!selectedSettlement || !selectedMonsterId || !displayedLevel) return
    if (selectedSurvivors.length === 0) return

    if (selectedHunt && selectedHunt.settlement_id === selectedSettlement.id)
      return toast.error(HUNT_ALREADY_ACTIVE_ERROR_MESSAGE())

    if (selectedSettlement.uses_scouts && !selectedScout)
      return toast.error(SCOUT_REQUIRED_MESSAGE('showdown'))

    if (
      selectedSettlement.uses_scouts &&
      selectedScout &&
      selectedSurvivors.includes(selectedScout)
    )
      return toast.error(SCOUT_CONFLICT_MESSAGE())

    // Find monster name from settlement data
    const quarryMatch = availableQuarries.find(
      (q) => q.quarry_id === selectedMonsterId
    )
    const nemesisMatch = availableNemeses.find(
      (n) => n.nemesis_id === selectedMonsterId
    )
    const baseMonsterName =
      quarryMatch?.monster_name ?? nemesisMatch?.monster_name
    if (!baseMonsterName) return toast.error(ERROR_MESSAGE())

    const isNemesis = monsterSource === 'nemesis'

    setIsCreating(true)

    try {
      // Determine the turn based on ambush type
      const turn: 'MONSTER' | 'SURVIVOR' =
        ambushType === AmbushType.SURVIVORS ? 'SURVIVOR' : 'MONSTER'

      // 1. Create showdown record
      const showdownId = await addShowdown({
        ambush: ambushType.toUpperCase() as 'NONE' | 'SURVIVORS' | 'MONSTER',
        monster_level: selectedLevelNumber,
        settlement_id: selectedSettlement.id,
        showdown_type: isSpecialShowdown ? 'SPECIAL' : 'REGULAR',
        turn
      })

      // 2. Create AI deck(s) and showdown monster(s) for each sub-monster
      const showdownMonsters: ShowdownDetail['showdown_monsters'] = {}

      for (const level of selectedLevels) {
        const aiDeck = await addShowdownAIDeck({
          basic_cards: level.basic_cards,
          advanced_cards: level.advanced_cards,
          legendary_cards: level.legendary_cards,
          overtone_cards: level.overtone_cards,
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId
        })

        const monsterName =
          level.sub_monster_name ?? activeMonsterName ?? baseMonsterName

        const showdownMonsterId = await addShowdownMonster({
          accuracy: level.accuracy,
          accuracy_tokens: level.accuracy_tokens,
          ai_card_drawn: false,
          ai_deck_id: aiDeck.id,
          ai_deck_remaining: level.ai_deck_remaining,
          damage: level.damage,
          damage_tokens: level.damage_tokens,
          evasion: level.evasion,
          evasion_tokens: level.evasion_tokens,
          knocked_down: false,
          luck: level.luck,
          luck_tokens: level.luck_tokens,
          monster_name: monsterName,
          moods: level.moods,
          movement: level.movement,
          movement_tokens: level.movement_tokens,
          notes: '',
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId,
          speed: level.speed,
          speed_tokens: level.speed_tokens,
          strength: level.strength,
          strength_tokens: level.strength_tokens,
          toughness: level.toughness,
          traits: level.traits,
          wounds: 0
        })

        showdownMonsters[showdownMonsterId] = {
          id: showdownMonsterId,
          accuracy: level.accuracy,
          accuracy_tokens: level.accuracy_tokens,
          ai_card_drawn: false,
          ai_deck_id: aiDeck.id,
          ai_deck_remaining: level.ai_deck_remaining,
          damage: level.damage,
          damage_tokens: level.damage_tokens,
          evasion: level.evasion,
          evasion_tokens: level.evasion_tokens,
          knocked_down: false,
          luck: level.luck,
          luck_tokens: level.luck_tokens,
          monster_name: monsterName,
          moods: level.moods,
          movement: level.movement,
          movement_tokens: level.movement_tokens,
          notes: '',
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId,
          speed: level.speed,
          speed_tokens: level.speed_tokens,
          strength: level.strength,
          strength_tokens: level.strength_tokens,
          toughness: level.toughness,
          traits: level.traits,
          wounds: 0,
          ai_deck: {
            id: aiDeck.id,
            basic_cards: aiDeck.basic_cards,
            advanced_cards: aiDeck.advanced_cards,
            legendary_cards: aiDeck.legendary_cards,
            overtone_cards: aiDeck.overtone_cards
          }
        }
      }

      // 3. Create showdown survivors
      const showdownSurvivorMap: { [key: string]: ShowdownSurvivorDetail } = {}

      for (const survivorId of selectedSurvivors) {
        const ssId = await addShowdownSurvivor({
          accuracy_tokens: 0,
          activation_used: false,
          bleeding_tokens: 0,
          block_tokens: 0,
          deflect_tokens: 0,
          evasion_tokens: 0,
          insanity_tokens: 0,
          knocked_down: false,
          luck_tokens: 0,
          movement_tokens: 0,
          movement_used: false,
          notes: '',
          priority_target: false,
          scout: false,
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId,
          speed_tokens: 0,
          strength_tokens: 0,
          survival_tokens: 0,
          survivor_id: survivorId
        })
        showdownSurvivorMap[ssId] = {
          id: ssId,
          accuracy_tokens: 0,
          activation_used: false,
          bleeding_tokens: 0,
          block_tokens: 0,
          deflect_tokens: 0,
          evasion_tokens: 0,
          insanity_tokens: 0,
          knocked_down: false,
          luck_tokens: 0,
          movement_tokens: 0,
          movement_used: false,
          notes: '',
          priority_target: false,
          scout: false,
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId,
          speed_tokens: 0,
          strength_tokens: 0,
          survival_tokens: 0,
          survivor_id: survivorId
        }
      }

      if (selectedScout) {
        const scoutSsId = await addShowdownSurvivor({
          accuracy_tokens: 0,
          activation_used: false,
          bleeding_tokens: 0,
          block_tokens: 0,
          deflect_tokens: 0,
          evasion_tokens: 0,
          insanity_tokens: 0,
          knocked_down: false,
          luck_tokens: 0,
          movement_tokens: 0,
          movement_used: false,
          notes: '',
          priority_target: false,
          scout: true,
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId,
          speed_tokens: 0,
          strength_tokens: 0,
          survival_tokens: 0,
          survivor_id: selectedScout
        })
        showdownSurvivorMap[scoutSsId] = {
          id: scoutSsId,
          accuracy_tokens: 0,
          activation_used: false,
          bleeding_tokens: 0,
          block_tokens: 0,
          deflect_tokens: 0,
          evasion_tokens: 0,
          insanity_tokens: 0,
          knocked_down: false,
          luck_tokens: 0,
          movement_tokens: 0,
          movement_used: false,
          notes: '',
          priority_target: false,
          scout: true,
          settlement_id: selectedSettlement.id,
          showdown_id: showdownId,
          speed_tokens: 0,
          strength_tokens: 0,
          survival_tokens: 0,
          survivor_id: selectedScout
        }
      }

      const showdownDetail: ShowdownDetail = {
        id: showdownId,
        ambush: ambushType.toUpperCase() as 'NONE' | 'SURVIVORS' | 'MONSTER',
        monster_level: selectedLevelNumber,
        settlement_id: selectedSettlement.id,
        showdown_type: isSpecialShowdown ? 'SPECIAL' : 'REGULAR',
        turn,
        showdown_monsters: showdownMonsters,
        showdown_survivors: showdownSurvivorMap
      }

      setSelectedShowdown(showdownDetail)

      // Reset form
      setSelectedMonsterId(null)
      setMonsterSource(null)
      setMonsterDetail(null)
      setMonsterLevels([])
      setSelectedLevelNumber(1)
      setSelectedVersion(MonsterVersion.ORIGINAL)
      setAlternateDetail(null)
      setAlternateLevels([])
      setVignetteDetail(null)
      setVignetteLevels([])
      setSelectedMonsterIndex(0)
      setIsSpecialShowdown(false)
      setAmbushType(AmbushType.NONE)
      setStartingTurn(TurnType.MONSTER)
      setSelectedSurvivors([])
      setSelectedScout(null)

      toast.success(
        SHOWDOWN_CREATED_MESSAGE(
          baseMonsterName,
          isNemesis ? MonsterType.NEMESIS : MonsterType.QUARRY
        )
      )
    } catch (error) {
      console.error('Showdown Creation Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsCreating(false)
    }
  }, [
    activeMonsterName,
    ambushType,
    availableNemeses,
    availableQuarries,
    displayedLevel,
    isSpecialShowdown,
    monsterSource,
    selectedHunt,
    selectedLevelNumber,
    selectedLevels,
    selectedMonsterId,
    selectedScout,
    selectedSettlement,
    selectedSurvivors,
    setSelectedShowdown
  ])

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SkullIcon className="h-5 w-5" />
          Begin Showdown
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 w-full">
        {/* Monster Source: Quarry */}
        <div className="flex items-center justify-between">
          <Label className="text-left whitespace-nowrap min-w-[90px]">
            Quarry
          </Label>
          {availableQuarries.length > 0 ? (
            <Select
              value={
                monsterSource === 'quarry' ? (selectedMonsterId ?? '') : ''
              }
              onValueChange={(id) => handleMonsterSelection(id, 'quarry')}>
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
            <p className="text-sm text-muted-foreground">No quarries</p>
          )}
        </div>

        {/* Monster Source: Nemesis */}
        <div className="flex items-center justify-between">
          <Label className="text-left whitespace-nowrap min-w-[90px]">
            Nemesis
          </Label>
          {availableNemeses.length > 0 ? (
            <Select
              value={
                monsterSource === 'nemesis' ? (selectedMonsterId ?? '') : ''
              }
              onValueChange={(id) => handleMonsterSelection(id, 'nemesis')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a nemesis..." />
              </SelectTrigger>
              <SelectContent>
                {availableNemeses.map((nemesis) => (
                  <SelectItem
                    key={nemesis.nemesis_id}
                    value={nemesis.nemesis_id}>
                    {nemesis.monster_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">No nemeses</p>
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
                  {monsterDetail?.monster_name ?? 'Original'}
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

        {/* Special Showdown */}
        <div className="flex items-center justify-between pt-2">
          <Label className="text-left" htmlFor="special-showdown-checkbox">
            Special Showdown
          </Label>
          <Checkbox
            id="special-showdown-checkbox"
            checked={isSpecialShowdown}
            onCheckedChange={(checked) => setIsSpecialShowdown(!!checked)}
          />
        </div>

        {/* Starting Turn */}
        <div className="flex items-center justify-between">
          <Label className="text-left whitespace-nowrap min-w-[90px]">
            First Turn
          </Label>
          <Select
            value={startingTurn}
            onValueChange={(value) => setStartingTurn(value as TurnType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TurnType.MONSTER}>Monster</SelectItem>
              <SelectItem value={TurnType.SURVIVORS}>Survivors</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="my-2" />

        {/* Multi-Monster Name */}
        {activeMonsterDetail &&
          'multi_monster' in activeMonsterDetail &&
          activeMonsterDetail.multi_monster &&
          selectedLevels.length > 1 && (
            <h3 className="text-sm font-semibold text-muted-foreground text-center">
              {displayedLevel?.sub_monster_name ?? 'Unknown Monster'}
            </h3>
          )}

        {/* Multi-Monster Carousel */}
        {activeMonsterDetail &&
          'multi_monster' in activeMonsterDetail &&
          activeMonsterDetail.multi_monster &&
          selectedLevels.length > 1 && (
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

        {activeMonsterDetail &&
          'multi_monster' in activeMonsterDetail &&
          activeMonsterDetail.multi_monster &&
          selectedLevels.length > 1 && <Separator className="my-2" />}

        {/* AI Deck */}
        <h3 className="text-xs font-semibold text-muted-foreground text-center">
          AI Deck
        </h3>
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
          title="Select Showdown Party"
          description="Up to 4 survivors may embark on a showdown."
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
          onClick={handleCreateShowdown}
          disabled={
            !selectedMonsterId ||
            activeLevels.length === 0 ||
            availableSurvivors.length === 0 ||
            selectedSurvivors.length === 0 ||
            (selectedSettlement?.uses_scouts === true && !selectedScout) ||
            isCreating
          }
          className="w-full mt-2">
          {isCreating ? 'Creating...' : 'Begin Showdown'}
        </Button>
      </CardContent>
    </Card>
  )
}
