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
import { addNemesis } from '@/lib/dal/nemesis'
import { addNemesisLevel } from '@/lib/dal/nemesis-level'
import { addQuarry } from '@/lib/dal/quarry'
import { addQuarryHuntBoard } from '@/lib/dal/quarry-hunt-board'
import { addQuarryLevel } from '@/lib/dal/quarry-level'
import { MonsterNode, MonsterType } from '@/lib/enums'
import { CUSTOM_MONSTER_CREATED_MESSAGE, ERROR_MESSAGE } from '@/lib/messages'
import {
  ChevronDownIcon,
  PlusIcon,
  SkullIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react'
import { ReactElement, useCallback, useState } from 'react'
import { toast } from 'sonner'

/** Per-level sub-monster form data */
interface LevelFormData {
  /** Sub-Monster Name (Optional) */
  subMonsterName: string
  /** AI Deck: Basic Cards */
  basicCards: number
  /** AI Deck: Advanced Cards */
  advancedCards: number
  /** AI Deck: Legendary Cards */
  legendaryCards: number
  /** AI Deck: Overtone Cards */
  overtoneCards: number
  /** Accuracy */
  accuracy: number
  /** Accuracy Tokens */
  accuracyTokens: number
  /** Damage */
  damage: number
  /** Damage Tokens */
  damageTokens: number
  /** Evasion */
  evasion: number
  /** Evasion Tokens */
  evasionTokens: number
  /** Luck */
  luck: number
  /** Luck Tokens */
  luckTokens: number
  /** Movement */
  movement: number
  /** Movement Tokens */
  movementTokens: number
  /** Speed */
  speed: number
  /** Speed Tokens */
  speedTokens: number
  /** Strength */
  strength: number
  /** Strength Tokens */
  strengthTokens: number
  /** Toughness */
  toughness: number
  /** Toughness Tokens */
  toughnessTokens: number
  /** Hunt Position (quarry only) */
  huntPos: number
  /** Survivor Hunt Position (quarry only) */
  survivorHuntPos: number
  /** Life (nemesis only) */
  life: number
  /** Traits */
  traits: string[]
  /** Moods */
  moods: string[]
}

/** Default level data */
const defaultLevelData = (): LevelFormData => ({
  subMonsterName: '',
  basicCards: 0,
  advancedCards: 0,
  legendaryCards: 0,
  overtoneCards: 0,
  accuracy: 0,
  accuracyTokens: 0,
  damage: 0,
  damageTokens: 0,
  evasion: 0,
  evasionTokens: 0,
  luck: 0,
  luckTokens: 0,
  movement: 1,
  movementTokens: 0,
  speed: 0,
  speedTokens: 0,
  strength: 0,
  strengthTokens: 0,
  toughness: 0,
  toughnessTokens: 0,
  huntPos: 12,
  survivorHuntPos: 0,
  life: 0,
  traits: [],
  moods: []
})

/** Attribute definitions for the showdown-style grid */
const MONSTER_ATTRIBUTES = [
  { key: 'movement', tokenKey: 'movementTokens', label: 'Movement' },
  { key: 'accuracy', tokenKey: 'accuracyTokens', label: 'Accuracy' },
  { key: 'damage', tokenKey: 'damageTokens', label: 'Damage' },
  { key: 'strength', tokenKey: 'strengthTokens', label: 'Strength' },
  { key: 'evasion', tokenKey: 'evasionTokens', label: 'Evasion' },
  { key: 'luck', tokenKey: 'luckTokens', label: 'Luck' },
  { key: 'speed', tokenKey: 'speedTokens', label: 'Speed' },
  { key: 'toughness', tokenKey: 'toughnessTokens', label: 'Toughness' }
] as const

/** Hunt board position type */
type HuntEventType = 'ARC' | 'BASIC' | 'MONSTER' | 'SCOUT'
type HuntBoardPositions = {
  [key in 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9 | 10 | 11]: HuntEventType
}

/**
 * Get Available Nodes for Monster Type
 *
 * @param type Monster Type
 * @returns Available Monster Nodes
 */
function getAvailableNodes(type: MonsterType): MonsterNode[] {
  return type === MonsterType.QUARRY
    ? [MonsterNode.NQ1, MonsterNode.NQ2, MonsterNode.NQ3, MonsterNode.NQ4]
    : [
        MonsterNode.NN1,
        MonsterNode.NN2,
        MonsterNode.NN3,
        MonsterNode.CO,
        MonsterNode.FI
      ]
}

/**
 * Create Monster Card Properties
 */
interface CreateMonsterCardProps {
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
  onCancel,
  onMonsterCreated
}: CreateMonsterCardProps): ReactElement {
  const [isCreating, setIsCreating] = useState(false)

  // Basic info
  const [monsterType, setMonsterType] = useState<MonsterType>(
    MonsterType.QUARRY
  )
  const [name, setName] = useState('')
  const [node, setNode] = useState<MonsterNode>(MonsterNode.NQ1)
  const [isPrologue, setIsPrologue] = useState(false)
  const [isMultiMonster, setIsMultiMonster] = useState(false)

  // Levels: map of level number to array of sub-monster data
  const [levels, setLevels] = useState<{
    [key: number]: LevelFormData[]
  }>({})
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())

  // Hunt board (quarry only)
  const [huntBoard, setHuntBoard] = useState<HuntBoardPositions>({
    1: 'BASIC',
    2: 'BASIC',
    3: 'BASIC',
    4: 'BASIC',
    5: 'BASIC',
    7: 'BASIC',
    8: 'BASIC',
    9: 'BASIC',
    10: 'BASIC',
    11: 'BASIC'
  })

  /**
   * Handle Monster Type Change
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
   * @param level Level Number
   */
  const toggleLevel = useCallback((level: number) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }, [])

  /**
   * Add Sub-Monster to Level
   *
   * @param level Level Number
   */
  const addSubMonster = useCallback((level: number) => {
    setLevels((prev) => ({
      ...prev,
      [level]: [...(prev[level] ?? []), defaultLevelData()]
    }))
    setExpandedLevels((prev) => new Set(prev).add(level))
  }, [])

  /**
   * Remove Sub-Monster from Level
   *
   * @param level Level Number
   * @param index Sub-Monster Index
   */
  const removeSubMonster = useCallback((level: number, index: number) => {
    setLevels((prev) => {
      const levelData = [...(prev[level] ?? [])]
      levelData.splice(index, 1)
      if (levelData.length === 0) {
        const next = { ...prev }
        delete next[level]
        return next
      }
      return { ...prev, [level]: levelData }
    })
  }, [])

  /**
   * Update Sub-Monster Data
   *
   * @param level Level Number
   * @param index Sub-Monster Index
   * @param updates Partial Updates
   */
  const updateSubMonster = useCallback(
    (level: number, index: number, updates: Partial<LevelFormData>) => {
      setLevels((prev) => {
        const levelData = [...(prev[level] ?? [])]
        levelData[index] = { ...levelData[index], ...updates }
        return { ...prev, [level]: levelData }
      })
    },
    []
  )

  /**
   * Cycle Hunt Board Position
   *
   * @param pos Position
   */
  const cycleHuntBoardPos = useCallback((pos: keyof HuntBoardPositions) => {
    setHuntBoard((prev) => ({
      ...prev,
      [pos]: prev[pos] === 'BASIC' ? 'MONSTER' : 'BASIC'
    }))
  }, [])

  /**
   * Handle Create Monster
   *
   * Validates and persists the monster to the database.
   */
  const handleCreate = useCallback(async () => {
    if (!name.trim())
      return toast.error('A nameless monster cannot be recorded.')

    const levelEntries = Object.entries(levels)
    if (levelEntries.length === 0)
      return toast.error('At least one level is required.')

    setIsCreating(true)

    try {
      if (monsterType === MonsterType.QUARRY) {
        // 1. Create quarry record
        const quarry = await addQuarry({
          custom: true,
          monster_name: name.trim(),
          multi_monster: isMultiMonster,
          node,
          prologue: isPrologue
        })

        // 2. Create hunt board
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

        // 3. Create levels
        for (const [levelNum, subMonsters] of levelEntries) {
          for (const sub of subMonsters) {
            await addQuarryLevel({
              quarry_id: quarry.id,
              level_number: parseInt(levelNum),
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
              hunt_pos: sub.huntPos,
              survivor_hunt_pos: sub.survivorHuntPos,
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
          multi_monster: isMultiMonster,
          node
        })

        // 2. Create levels
        for (const [levelNum, subMonsters] of levelEntries) {
          for (const sub of subMonsters) {
            await addNemesisLevel({
              nemesis_id: nemesis.id,
              level_number: parseInt(levelNum),
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
    isMultiMonster,
    levels,
    huntBoard,
    onMonsterCreated
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
            <Input
              id="monster-name"
              placeholder="Enter monster name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Monster Type</Label>
              <Select
                value={monsterType}
                onValueChange={(v) =>
                  handleMonsterTypeChange(v as MonsterType)
                }>
                <SelectTrigger>
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
                <SelectTrigger>
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

          <div className="flex gap-6">
            {monsterType === MonsterType.QUARRY && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-prologue"
                  checked={isPrologue}
                  onCheckedChange={(c) => setIsPrologue(!!c)}
                />
                <Label htmlFor="is-prologue">Prologue Monster</Label>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="is-multi-monster"
                checked={isMultiMonster}
                onCheckedChange={(c) => setIsMultiMonster(!!c)}
              />
              <Label htmlFor="is-multi-monster">Multi-Monster Encounter</Label>
            </div>
          </div>
        </div>

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
                  className="w-full flex items-center justify-between p-3 hover:bg-accent/50 rounded-t-lg"
                  onClick={() => toggleLevel(levelNum)}>
                  <span className="text-sm font-medium">
                    Level {levelNum}{' '}
                    {levelData
                      ? `(${levelData.length} sub-monster${levelData.length > 1 ? 's' : ''})`
                      : '(empty)'}
                  </span>
                  <div className="flex items-center gap-2">
                    {!levelData && (
                      <span
                        role="button"
                        tabIndex={0}
                        className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          addSubMonster(levelNum)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            e.stopPropagation()
                            addSubMonster(levelNum)
                          }
                        }}>
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Add
                      </span>
                    )}
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {isExpanded && levelData && (
                  <div className="p-3 pt-2 space-y-3">
                    {levelData.map((sub, subIdx) => (
                      <div
                        key={subIdx}
                        className="border rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold">
                            Sub-Monster {subIdx + 1}
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSubMonster(levelNum, subIdx)}>
                            <Trash2Icon className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Sub-Monster Name */}
                        <Input
                          placeholder="Sub-monster name (optional)"
                          value={sub.subMonsterName}
                          onChange={(e) =>
                            updateSubMonster(levelNum, subIdx, {
                              subMonsterName: e.target.value
                            })
                          }
                        />

                        {/* AI Deck */}
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            AI Deck
                          </Label>
                          <div className="grid grid-cols-4 gap-2 mt-1">
                            <div className="space-y-1">
                              <Label className="text-xs text-center block">
                                B
                              </Label>
                              <NumericInput
                                label="Basic"
                                value={sub.basicCards}
                                min={0}
                                onChange={(v) =>
                                  updateSubMonster(levelNum, subIdx, {
                                    basicCards: v
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-center block">
                                A
                              </Label>
                              <NumericInput
                                label="Advanced"
                                value={sub.advancedCards}
                                min={0}
                                onChange={(v) =>
                                  updateSubMonster(levelNum, subIdx, {
                                    advancedCards: v
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-center block">
                                L
                              </Label>
                              <NumericInput
                                label="Legendary"
                                value={sub.legendaryCards}
                                min={0}
                                onChange={(v) =>
                                  updateSubMonster(levelNum, subIdx, {
                                    legendaryCards: v
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-center block">
                                O
                              </Label>
                              <NumericInput
                                label="Overtone"
                                value={sub.overtoneCards}
                                min={0}
                                onChange={(v) =>
                                  updateSubMonster(levelNum, subIdx, {
                                    overtoneCards: v
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Attributes */}
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Attributes
                          </Label>
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex flex-row items-center gap-2">
                              <div className="w-20" />
                              <Label className="text-xs w-20 justify-center">
                                Base
                              </Label>
                              <Label className="text-xs w-20 justify-center">
                                Tokens
                              </Label>
                              <Label className="text-xs w-20 justify-center">
                                Total
                              </Label>
                            </div>

                            {MONSTER_ATTRIBUTES.map((attr) => (
                              <div
                                key={attr.key}
                                className="flex flex-row items-center gap-2">
                                <Label className="text-xs w-20">
                                  {attr.label}
                                </Label>
                                <NumericInput
                                  label={attr.label}
                                  value={
                                    sub[
                                      attr.key as keyof LevelFormData
                                    ] as number
                                  }
                                  onChange={(v) =>
                                    updateSubMonster(levelNum, subIdx, {
                                      [attr.key]: v
                                    })
                                  }
                                  className="w-20"
                                />
                                <NumericInput
                                  label={`${attr.label} Tokens`}
                                  value={
                                    sub[
                                      attr.tokenKey as keyof LevelFormData
                                    ] as number
                                  }
                                  onChange={(v) =>
                                    updateSubMonster(levelNum, subIdx, {
                                      [attr.tokenKey]: v
                                    })
                                  }
                                  className="w-20 bg-muted!"
                                />
                                <NumericInput
                                  label={`${attr.label} Total`}
                                  value={
                                    (sub[
                                      attr.key as keyof LevelFormData
                                    ] as number) +
                                    (sub[
                                      attr.tokenKey as keyof LevelFormData
                                    ] as number)
                                  }
                                  disabled
                                  className="w-20"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quarry: Hunt/Survivor Positions */}
                        {monsterType === MonsterType.QUARRY && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-center block">
                                Hunt Position
                              </Label>
                              <NumericInput
                                label="Hunt Position"
                                value={sub.huntPos}
                                min={0}
                                max={12}
                                onChange={(v) =>
                                  updateSubMonster(levelNum, subIdx, {
                                    huntPos: v
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-center block">
                                Survivor Hunt Position
                              </Label>
                              <NumericInput
                                label="Survivor Hunt Position"
                                value={sub.survivorHuntPos}
                                min={0}
                                max={12}
                                onChange={(v) =>
                                  updateSubMonster(levelNum, subIdx, {
                                    survivorHuntPos: v
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}

                        {/* Nemesis: Life */}
                        {monsterType === MonsterType.NEMESIS && (
                          <div className="space-y-1">
                            <Label className="text-xs text-center block">
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

                        {/* Traits */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">
                              Traits
                            </Label>
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
                            <div key={tIdx} className="flex items-center gap-1">
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

                        {/* Moods */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">
                              Moods
                            </Label>
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
                            <div key={mIdx} className="flex items-center gap-1">
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
                    ))}

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
                )}
              </div>
            )
          })}
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
                      huntBoard[pos] === 'MONSTER'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-blue-500 bg-blue-500/10'
                    }`}
                    onClick={() => cycleHuntBoardPos(pos)}>
                    {huntBoard[pos] === 'MONSTER' ? 'Monster' : 'Basic'}
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
                      huntBoard[pos] === 'MONSTER'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-blue-500 bg-blue-500/10'
                    }`}
                    onClick={() => cycleHuntBoardPos(pos)}>
                    {huntBoard[pos] === 'MONSTER' ? 'Monster' : 'Basic'}
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
