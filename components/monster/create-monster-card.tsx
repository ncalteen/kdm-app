'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import {
  baseMonsterLevelData,
  basicHuntBoard,
  monsterAttributeTokenMap
} from '@/lib/common'
import { addNemesis } from '@/lib/dal/nemesis'
import { addNemesisLevel } from '@/lib/dal/nemesis-level'
import { addQuarry } from '@/lib/dal/quarry'
import { addQuarryHuntBoard } from '@/lib/dal/quarry-hunt-board'
import { addQuarryLevel } from '@/lib/dal/quarry-level'
import { HuntEventType, MonsterNode, MonsterType } from '@/lib/enums'
import {
  CUSTOM_MONSTER_CREATED_MESSAGE,
  ERROR_MESSAGE,
  MONSTER_LEVEL_MISSING_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import { HuntBoard, MonsterLevelData } from '@/lib/types'
import { getAvailableNodes } from '@/lib/utils'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  SkullIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react'
import { ReactElement, useCallback, useState } from 'react'

/**
 * Create Monster Card Properties
 */
interface CreateMonsterCardProps {
  /** Local State */
  local: LocalStateType
  /** Cancel Callback */
  onCancel: () => void
  /** Monster Created Callback */
  onMonsterCreated: () => void
}

/**
 * Create Monster Card Component
 *
 * Full form for creating a custom quarry or nemesis monster with levels,
 * hunt board, and all related data. Persists to the database via DAL.
 *
 * @param props Create Monster Card Properties
 * @returns Create Monster Card Component
 */
export function CreateMonsterCard({
  local,
  onCancel,
  onMonsterCreated
}: CreateMonsterCardProps): ReactElement {
  const { toast } = useToast(local)

  const [isCreating, setIsCreating] = useState(false)

  // Basic Info
  const [monsterType, setMonsterType] = useState<MonsterType>(
    MonsterType.QUARRY
  )
  const [name, setName] = useState('')
  const [node, setNode] = useState<MonsterNode>(MonsterNode.NQ1)
  const [isPrologue, setIsPrologue] = useState(false)

  // Monster Level Data
  const [levels, setLevels] = useState<{
    [key: number]: MonsterLevelData[]
  }>({})
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const [expandedSubMonsters, setExpandedSubMonsters] = useState<Set<string>>(
    new Set()
  )
  const [levelHuntPositions, setLevelHuntPositions] = useState<{
    [key: number]: { huntPos: number; survivorHuntPos: number }
  }>({})

  // Hunt Board
  const [huntBoard, setHuntBoard] = useState<HuntBoard>(basicHuntBoard)

  /**
   * Handle Monster Type Change
   *
   * Changes the type of monster being created and the available node options.
   *
   * @param type New Monster Type
   */
  const handleMonsterTypeChange = useCallback((type: MonsterType) => {
    setMonsterType(type)
    setNode(getAvailableNodes(type)[0])
  }, [])

  /**
   * Toggle Level Expansion
   *
   * Expands or collapses the details for a given monster level in the UI.
   *
   * @param level Level Number
   */
  const toggleLevel = useCallback(
    (level: number) =>
      setExpandedLevels((prev) => {
        const next = new Set(prev)
        if (next.has(level)) next.delete(level)
        else next.add(level)
        return next
      }),
    []
  )

  /**
   * Toggle Sub-Monster Expansion
   *
   * Expands or collapses the details for a given sub-monster within a level in
   * the UI.
   *
   * @param key Sub-Monster Key (format: `${levelNum}-${subIdx}`)
   */
  const toggleSubMonster = useCallback(
    (key: string) =>
      setExpandedSubMonsters((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      }),
    []
  )

  /**
   * Add Sub-Monster to Level
   *
   * Adds a new sub-monster with default data to the specified level. Also
   * initializes hunt positions for the level if not already set, and expands
   * the level in the UI.
   *
   * @param level Level Number
   */
  const addSubMonster = useCallback((level: number) => {
    setLevels((prev) => ({
      ...prev,
      [level]: [...(prev[level] ?? []), baseMonsterLevelData]
    }))
    setLevelHuntPositions((prev) => ({
      ...prev,
      [level]: prev[level] ?? { huntPos: 12, survivorHuntPos: 0 }
    }))
    setExpandedLevels((prev) => new Set(prev).add(level))
  }, [])

  /**
   * Remove Sub-Monster from Level
   *
   * Removes a sub-monster at the specified index from the given level. If the
   * level has no more sub-monsters after removal, it also cleans up the level
   * and its hunt positions from the state.
   *
   * @param level Level Number
   * @param index Sub-Monster Index
   */
  const removeSubMonster = useCallback(
    (level: number, index: number) =>
      setLevels((prev) => {
        const levelData = [...(prev[level] ?? [])]
        levelData.splice(index, 1)

        if (levelData.length === 0) {
          const next = { ...prev }
          delete next[level]

          // Also clean up hunt positions for this level
          setLevelHuntPositions((hp) => {
            const nextHp = { ...hp }
            delete nextHp[level]
            return nextHp
          })

          return next
        }

        return { ...prev, [level]: levelData }
      }),
    []
  )

  /**
   * Update Sub-Monster Data
   *
   * Updates the data for a specific sub-monster within a level based on the
   * provided partial updates. This is used for handling changes to sub-monster
   * attributes, traits, moods, etc. in the UI.
   *
   * @param level Level Number
   * @param index Sub-Monster Index
   * @param updates Partial Updates
   */
  const updateSubMonster = useCallback(
    (level: number, index: number, updates: Partial<MonsterLevelData>) =>
      setLevels((prev) => {
        const levelData = [...(prev[level] ?? [])]
        levelData[index] = { ...levelData[index], ...updates }
        return { ...prev, [level]: levelData }
      }),
    []
  )

  /**
   * Cycle Hunt Board Position
   *
   * Toggles a hunt board position between Basic and Monster event types when
   * clicked in the UI.
   *
   * @param pos Position
   */
  const cycleHuntBoardPos = useCallback(
    (pos: keyof HuntBoard) =>
      setHuntBoard((prev) => ({
        ...prev,
        [pos]:
          prev[pos] === HuntEventType.BASIC
            ? HuntEventType.MONSTER
            : HuntEventType.BASIC
      })),
    []
  )

  /**
   * Handle Create Monster
   *
   * Validates and persists the monster to the database.
   */
  const handleCreate = useCallback(async () => {
    if (!name.trim())
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('monster'))

    const levelEntries = Object.entries(levels)
    if (levelEntries.length === 0)
      return toast.error(MONSTER_LEVEL_MISSING_MESSAGE())

    setIsCreating(true)

    try {
      if (monsterType === MonsterType.QUARRY) {
        // 1. Create the quarry record and get the ID
        const quarry = await addQuarry({
          custom: true,
          monster_name: name.trim(),
          // True if any level entry has more than one monster
          multi_monster: levelEntries.some((entry) => entry[1].length > 1),
          node,
          prologue: isPrologue
        })

        // 2. Create the hunt board
        await addQuarryHuntBoard({
          quarry_id: quarry.id,
          pos_1: huntBoard[1],
          pos_2: huntBoard[2],
          pos_3: huntBoard[3],
          pos_4: huntBoard[4],
          pos_5: huntBoard[5],
          pos_7: huntBoard[7],
          pos_8: huntBoard[8],
          pos_9: huntBoard[9],
          pos_10: huntBoard[10],
          pos_11: huntBoard[11]
        })

        // 3. Create each monster level data record linked to the quarry ID
        for (const [levelStr, subMonsters] of levelEntries) {
          const levelNum = parseInt(levelStr, 10)

          for (const sub of subMonsters) {
            await addQuarryLevel({
              quarry_id: quarry.id,
              level_number: levelNum,
              sub_monster_name: sub.subMonsterName || null,
              basic_cards: sub.basicCards,
              advanced_cards: sub.advancedCards,
              legendary_cards: sub.legendaryCards,
              overtone_cards: sub.overtoneCards,
              ai_deck_remaining:
                sub.basicCards +
                sub.advancedCards +
                sub.legendaryCards +
                sub.overtoneCards,
              accuracy: sub.accuracy,
              accuracy_tokens: sub.accuracyTokens,
              damage: sub.damage,
              damage_tokens: sub.damageTokens,
              evasion: sub.evasion,
              evasion_tokens: sub.evasionTokens,
              luck: sub.luck,
              luck_tokens: sub.luckTokens,
              movement: sub.movement,
              movement_tokens: sub.movementTokens,
              speed: sub.speed,
              speed_tokens: sub.speedTokens,
              strength: sub.strength,
              strength_tokens: sub.strengthTokens,
              toughness: sub.toughness,
              toughness_tokens: sub.toughnessTokens,
              hunt_pos: levelHuntPositions[levelNum]?.huntPos ?? 12,
              survivor_hunt_pos:
                levelHuntPositions[levelNum]?.survivorHuntPos ?? 0,
              traits: sub.traits,
              moods: sub.moods
            })
          }
        }
      } else {
        // Nemesis
        // 1. Create nemesis record
        const nemesis = await addNemesis({
          custom: true,
          monster_name: name.trim(),
          // True if any level entry has more than one monster
          multi_monster: levelEntries.some((entry) => entry[1].length > 1),
          node
        })

        // 2. Create levels
        for (const [levelStr, subMonsters] of levelEntries) {
          const levelNum = parseInt(levelStr, 10)

          for (const sub of subMonsters) {
            await addNemesisLevel({
              nemesis_id: nemesis.id,
              level_number: levelNum,
              sub_monster_name: sub.subMonsterName || null,
              basic_cards: sub.basicCards,
              advanced_cards: sub.advancedCards,
              legendary_cards: sub.legendaryCards,
              overtone_cards: sub.overtoneCards,
              ai_deck_remaining:
                sub.basicCards +
                sub.advancedCards +
                sub.legendaryCards +
                sub.overtoneCards,
              accuracy: sub.accuracy,
              accuracy_tokens: sub.accuracyTokens,
              damage: sub.damage,
              damage_tokens: sub.damageTokens,
              evasion: sub.evasion,
              evasion_tokens: sub.evasionTokens,
              luck: sub.luck,
              luck_tokens: sub.luckTokens,
              movement: sub.movement,
              movement_tokens: sub.movementTokens,
              speed: sub.speed,
              speed_tokens: sub.speedTokens,
              strength: sub.strength,
              strength_tokens: sub.strengthTokens,
              toughness: sub.toughness,
              toughness_tokens: sub.toughnessTokens,
              life: sub.life || null,
              traits: sub.traits,
              moods: sub.moods
            })
          }
        }
      }

      toast.success(CUSTOM_MONSTER_CREATED_MESSAGE(monsterType))
      onMonsterCreated()
    } catch (error) {
      console.error('Create Monster Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsCreating(false)
    }
  }, [
    name,
    monsterType,
    node,
    isPrologue,
    levels,
    levelHuntPositions,
    huntBoard,
    onMonsterCreated,
    toast
  ])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span className="flex items-center gap-2">
            <SkullIcon className="h-5 w-5" />
            Create Custom Monster
          </span>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <XIcon className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Basic Information */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="monster-name">Monster Name</Label>
            <div className="flex items-center gap-2">
              <Input
                id="monster-name"
                className="flex-1"
                placeholder="Enter monster name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {monsterType === MonsterType.QUARRY && (
                <div className="flex items-center gap-2 shrink-0">
                  <Checkbox
                    id="is-prologue"
                    checked={isPrologue}
                    onCheckedChange={(c) => setIsPrologue(!!c)}
                  />
                  <Label htmlFor="is-prologue" className="whitespace-nowrap">
                    Prologue
                  </Label>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Monster Type</Label>
              <Select
                value={monsterType}
                onValueChange={(v) =>
                  handleMonsterTypeChange(v as MonsterType)
                }>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MonsterType.QUARRY}>Quarry</SelectItem>
                  <SelectItem value={MonsterType.NEMESIS}>Nemesis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Monster Node</Label>
              <Select
                value={node}
                onValueChange={(v) => setNode(v as MonsterNode)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableNodes(monsterType).map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Hunt Board (Quarry Only) */}
        {monsterType === MonsterType.QUARRY && (
          <>
            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Hunt Board Layout</Label>
              <p className="text-xs text-muted-foreground">
                Click positions to toggle between Basic and Monster events.
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                <div className="w-16 h-16 border-2 rounded-lg border-green-500 bg-green-500/10 flex items-center justify-center text-xs">
                  Start
                </div>
                {([1, 2, 3, 4, 5] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center text-xs cursor-pointer ${
                      huntBoard[pos] === HuntEventType.MONSTER
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-blue-500 bg-blue-500/10'
                    }`}
                    onClick={() => cycleHuntBoardPos(pos)}>
                    {huntBoard[pos] === HuntEventType.MONSTER
                      ? 'Monster'
                      : 'Basic'}
                  </button>
                ))}
                <div className="w-16 h-16 border-2 rounded-lg border-amber-500 bg-amber-500/10 flex items-center justify-center text-xs">
                  OD
                </div>
                {([7, 8, 9, 10, 11] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center text-xs cursor-pointer ${
                      huntBoard[pos] === HuntEventType.MONSTER
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-blue-500 bg-blue-500/10'
                    }`}
                    onClick={() => cycleHuntBoardPos(pos)}>
                    {huntBoard[pos] === HuntEventType.MONSTER
                      ? 'Monster'
                      : 'Basic'}
                  </button>
                ))}
                <div className="w-16 h-16 border-2 rounded-lg border-red-500 bg-red-500/10 flex items-center justify-center text-xs">
                  Starvation
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Levels */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Monster Levels</Label>
          <p className="text-xs text-muted-foreground">
            Add levels (1-4) with attributes, AI deck, traits, and moods.
          </p>

          {[1, 2, 3, 4].map((levelNum) => {
            const levelData = levels[levelNum]
            const isExpanded = expandedLevels.has(levelNum)

            return (
              <div key={levelNum} className="border rounded-lg">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3 hover:bg-accent/50 rounded-t-lg h-[44px]"
                  onClick={() => toggleLevel(levelNum)}>
                  <span className="text-sm font-medium">
                    Level {levelNum}{' '}
                    {levelData
                      ? `(${levelData.length} sub-monster${levelData.length > 1 ? 's' : ''})`
                      : '(empty)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Quarry: Hunt/Survivor Positions (per-level) */}
                {isExpanded && monsterType === MonsterType.QUARRY && (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <div className="space-y-2">
                      <Label className="text-center block">
                        Survivor Hunt Position
                      </Label>
                      <NumericInput
                        label="Survivor Hunt Position"
                        value={
                          levelHuntPositions[levelNum]?.survivorHuntPos ?? 0
                        }
                        min={0}
                        max={12}
                        onChange={(v) =>
                          setLevelHuntPositions((prev) => ({
                            ...prev,
                            [levelNum]: {
                              ...(prev[levelNum] ?? {
                                huntPos: 12,
                                survivorHuntPos: 0
                              }),
                              survivorHuntPos: v
                            }
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-center block">
                        Monster Hunt Position
                      </Label>
                      <NumericInput
                        label="Monster Hunt Position"
                        value={levelHuntPositions[levelNum]?.huntPos ?? 12}
                        min={0}
                        max={12}
                        onChange={(v) =>
                          setLevelHuntPositions((prev) => ({
                            ...prev,
                            [levelNum]: {
                              ...(prev[levelNum] ?? {
                                huntPos: 12,
                                survivorHuntPos: 0
                              }),
                              huntPos: v
                            }
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <>
                    {levelData && (
                      <div className="p-3 pt-2 space-y-3">
                        {levelData.map((sub, subIdx) => {
                          const subKey = `${levelNum}-${subIdx}`
                          const isSubExpanded = expandedSubMonsters.has(subKey)
                          const displayName =
                            sub.subMonsterName || `Sub-Monster ${subIdx + 1}`

                          return (
                            <div
                              key={subIdx}
                              className="border rounded-lg overflow-hidden">
                              {/* Compact Sub-Monster Header */}
                              <div className="flex items-center justify-between px-3 py-2 hover:bg-accent/50 cursor-pointer">
                                <button
                                  type="button"
                                  className="flex items-center gap-2 flex-1 text-left"
                                  onClick={() => toggleSubMonster(subKey)}>
                                  {isSubExpanded ? (
                                    <ChevronDownIcon className="h-3 w-3 shrink-0" />
                                  ) : (
                                    <ChevronRightIcon className="h-3 w-3 shrink-0" />
                                  )}
                                  <span className="text-sm font-medium truncate">
                                    {displayName}
                                  </span>
                                </button>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() =>
                                    removeSubMonster(levelNum, subIdx)
                                  }>
                                  <Trash2Icon className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Expandable sub-monster details */}
                              {isSubExpanded && (
                                <div className="px-3 py-3 space-y-3">
                                  {/* Sub-Monster Name (+ Life for Nemesis) */}
                                  <div className="flex items-center gap-2">
                                    <Input
                                      className="flex-1"
                                      placeholder="Sub-monster name (optional)"
                                      value={sub.subMonsterName}
                                      onChange={(e) =>
                                        updateSubMonster(levelNum, subIdx, {
                                          subMonsterName: e.target.value
                                        })
                                      }
                                    />

                                    {monsterType === MonsterType.NEMESIS && (
                                      <div className="flex items-center gap-1 shrink-0">
                                        <Label className="text-xs whitespace-nowrap pr-1">
                                          Life
                                        </Label>
                                        <NumericInput
                                          label="Life"
                                          value={sub.life}
                                          min={0}
                                          onChange={(v) =>
                                            updateSubMonster(levelNum, subIdx, {
                                              life: v
                                            })
                                          }
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <Separator />

                                  {/* AI Deck */}
                                  <div>
                                    <Label className="text-center block pb-2">
                                      AI Deck
                                    </Label>
                                    <div className="grid grid-cols-4 gap-2 mt-1">
                                      {[
                                        {
                                          label: 'B',
                                          key: 'basicCards' as const,
                                          full: 'Basic'
                                        },
                                        {
                                          label: 'A',
                                          key: 'advancedCards' as const,
                                          full: 'Advanced'
                                        },
                                        {
                                          label: 'L',
                                          key: 'legendaryCards' as const,
                                          full: 'Legendary'
                                        },
                                        {
                                          label: 'O',
                                          key: 'overtoneCards' as const,
                                          full: 'Overtone'
                                        }
                                      ].map((deck) => (
                                        <div
                                          key={deck.key}
                                          className="space-y-1">
                                          <Label className="text-xs text-center block text-muted-foreground">
                                            {deck.label} Cards
                                          </Label>
                                          <NumericInput
                                            label={deck.full}
                                            value={sub[deck.key]}
                                            min={0}
                                            onChange={(v) =>
                                              updateSubMonster(
                                                levelNum,
                                                subIdx,
                                                {
                                                  [deck.key]: v
                                                }
                                              )
                                            }
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Attributes */}
                                  <div>
                                    <Label className="text-center block pb-2">
                                      Attributes
                                    </Label>
                                    <div className="grid grid-cols-4 gap-x-2 gap-y-1 mt-1">
                                      {/* Header row */}
                                      <div />
                                      <Label className="text-xs text-center block text-muted-foreground">
                                        Base
                                      </Label>
                                      <Label className="text-xs text-center block text-muted-foreground">
                                        Tokens
                                      </Label>
                                      <Label className="text-xs text-center block text-muted-foreground">
                                        Total
                                      </Label>

                                      {monsterAttributeTokenMap.map((attr) => (
                                        <div
                                          key={attr.key}
                                          className="grid grid-cols-subgrid col-span-4 items-center">
                                          <Label className="text-xs text-muted-foreground">
                                            {attr.label}
                                          </Label>
                                          <NumericInput
                                            label={attr.label}
                                            value={
                                              sub[
                                                attr.key as keyof MonsterLevelData
                                              ] as number
                                            }
                                            onChange={(v) =>
                                              updateSubMonster(
                                                levelNum,
                                                subIdx,
                                                {
                                                  [attr.key]: v
                                                }
                                              )
                                            }
                                          />
                                          <NumericInput
                                            label={`${attr.label} Tokens`}
                                            value={
                                              sub[
                                                attr.tokenKey as keyof typeof sub
                                              ] as number
                                            }
                                            onChange={(v) =>
                                              updateSubMonster(
                                                levelNum,
                                                subIdx,
                                                {
                                                  [attr.tokenKey]: v
                                                }
                                              )
                                            }
                                            className="bg-muted!"
                                          />
                                          <NumericInput
                                            label={`${attr.label} Total`}
                                            value={
                                              (sub[
                                                attr.key as keyof typeof sub
                                              ] as number) +
                                              (sub[
                                                attr.tokenKey as keyof typeof sub
                                              ] as number)
                                            }
                                            disabled
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Traits */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <Label>Traits</Label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          updateSubMonster(levelNum, subIdx, {
                                            traits: [...sub.traits, '']
                                          })
                                        }>
                                        <PlusIcon className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    {sub.traits.map((trait, tIdx) => (
                                      <div
                                        key={tIdx}
                                        className="flex items-center gap-1">
                                        <Input
                                          value={trait}
                                          placeholder="Trait"
                                          onChange={(e) => {
                                            const next = [...sub.traits]
                                            next[tIdx] = e.target.value
                                            updateSubMonster(levelNum, subIdx, {
                                              traits: next
                                            })
                                          }}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            const next = sub.traits.filter(
                                              (_, i) => i !== tIdx
                                            )
                                            updateSubMonster(levelNum, subIdx, {
                                              traits: next
                                            })
                                          }}>
                                          <Trash2Icon className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>

                                  <Separator />

                                  {/* Moods */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <Label>Moods</Label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          updateSubMonster(levelNum, subIdx, {
                                            moods: [...sub.moods, '']
                                          })
                                        }>
                                        <PlusIcon className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    {sub.moods.map((mood, mIdx) => (
                                      <div
                                        key={mIdx}
                                        className="flex items-center gap-1">
                                        <Input
                                          value={mood}
                                          placeholder="Mood"
                                          onChange={(e) => {
                                            const next = [...sub.moods]
                                            next[mIdx] = e.target.value
                                            updateSubMonster(levelNum, subIdx, {
                                              moods: next
                                            })
                                          }}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            const next = sub.moods.filter(
                                              (_, i) => i !== mIdx
                                            )
                                            updateSubMonster(levelNum, subIdx, {
                                              moods: next
                                            })
                                          }}>
                                          <Trash2Icon className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <div className="p-2 pt-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSubMonster(levelNum)}
                        className="w-full">
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Add Sub-Monster
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              !name.trim() || Object.keys(levels).length === 0 || isCreating
            }>
            {isCreating ? 'Creating...' : 'Create Monster'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
