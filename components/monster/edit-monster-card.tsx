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
import { getNemesis, updateNemesis } from '@/lib/dal/nemesis'
import { getNemesisLevels, removeNemesisLevel } from '@/lib/dal/nemesis-level'
import { getQuarry, updateQuarry } from '@/lib/dal/quarry'
import {
  addQuarryHuntBoard,
  getQuarryHuntBoard,
  updateQuarryHuntBoard
} from '@/lib/dal/quarry-hunt-board'
import {
  addQuarryLevel,
  getQuarryLevels,
  removeQuarryLevel
} from '@/lib/dal/quarry-level'
import { MonsterNode, MonsterType } from '@/lib/enums'
import { CUSTOM_MONSTER_UPDATED_MESSAGE, ERROR_MESSAGE } from '@/lib/messages'
import {
  ChevronDownIcon,
  PlusIcon,
  SkullIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

/** Per-level sub-monster form data */
interface LevelFormData {
  /** DB record ID (null for new) */
  dbId: string | null
  subMonsterName: string
  basicCards: number
  advancedCards: number
  legendaryCards: number
  overtoneCards: number
  accuracy: number
  damage: number
  evasion: number
  luck: number
  movement: number
  speed: number
  strength: number
  toughness: number
  huntPos: number
  survivorHuntPos: number
  life: number
  traits: string[]
  moods: string[]
}

type HuntEventType = 'ARC' | 'BASIC' | 'MONSTER' | 'SCOUT'
type HuntBoardPositions = {
  [key in 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9 | 10 | 11]: HuntEventType
}

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

const defaultLevelData = (): LevelFormData => ({
  dbId: null,
  subMonsterName: '',
  basicCards: 0,
  advancedCards: 0,
  legendaryCards: 0,
  overtoneCards: 0,
  accuracy: 0,
  damage: 0,
  evasion: 0,
  luck: 0,
  movement: 1,
  speed: 0,
  strength: 0,
  toughness: 0,
  huntPos: 12,
  survivorHuntPos: 0,
  life: 0,
  traits: [],
  moods: []
})

/**
 * Edit Monster Card Properties
 */
interface EditMonsterCardProps {
  /** Monster ID */
  monsterId: string
  /** Monster Type */
  monsterType: MonsterType
  /** Cancel Callback */
  onCancel: () => void
  /** Monster Updated Callback */
  onMonsterUpdated: () => void
}

/**
 * Edit Monster Card Component
 *
 * Loads existing monster data and allows editing with optimistic persistence.
 *
 * @param props Edit Monster Card Properties
 * @returns Edit Monster Card Component
 */
export function EditMonsterCard({
  monsterId,
  monsterType,
  onCancel,
  onMonsterUpdated
}: EditMonsterCardProps): ReactElement {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [name, setName] = useState('')
  const [node, setNode] = useState<MonsterNode>(MonsterNode.NQ1)
  const [isPrologue, setIsPrologue] = useState(false)
  const [isMultiMonster, setIsMultiMonster] = useState(false)

  const [levels, setLevels] = useState<{ [key: number]: LevelFormData[] }>({})
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())

  const [huntBoardId, setHuntBoardId] = useState<string | null>(null)
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

  // IDs of levels to delete on save
  const [deletedLevelIds, setDeletedLevelIds] = useState<string[]>([])

  /** Load monster data from DB */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        if (monsterType === MonsterType.QUARRY) {
          const [detail, qLevels, board] = await Promise.all([
            getQuarry(monsterId),
            getQuarryLevels(monsterId),
            getQuarryHuntBoard(monsterId)
          ])

          if (detail) {
            setName(detail.monster_name)
            setNode(detail.node as MonsterNode)
            setIsPrologue(detail.prologue)
            setIsMultiMonster(detail.multi_monster)
          }

          // Group levels by level_number
          const grouped: { [key: number]: LevelFormData[] } = {}
          for (const l of qLevels) {
            const n = l.level_number
            if (!grouped[n]) grouped[n] = []
            grouped[n].push({
              dbId: l.id,
              subMonsterName: l.sub_monster_name ?? '',
              basicCards: l.basic_cards,
              advancedCards: l.advanced_cards,
              legendaryCards: l.legendary_cards,
              overtoneCards: l.overtone_cards,
              accuracy: l.accuracy,
              damage: l.damage,
              evasion: l.evasion,
              luck: l.luck,
              movement: l.movement,
              speed: l.speed,
              strength: l.strength,
              toughness: l.toughness,
              huntPos: l.hunt_pos,
              survivorHuntPos: l.survivor_hunt_pos,
              life: 0,
              traits: l.traits,
              moods: l.moods
            })
          }
          setLevels(grouped)
          setExpandedLevels(new Set(Object.keys(grouped).map(Number)))

          if (board) {
            setHuntBoardId(board.id)
            setHuntBoard({
              1: board.pos_1,
              2: board.pos_2,
              3: board.pos_3,
              4: board.pos_4,
              5: board.pos_5,
              7: board.pos_7,
              8: board.pos_8,
              9: board.pos_9,
              10: board.pos_10,
              11: board.pos_11
            })
          }
        } else {
          const [detail, nLevels] = await Promise.all([
            getNemesis(monsterId),
            getNemesisLevels(monsterId)
          ])

          if (detail) {
            setName(detail.monster_name)
            setNode(detail.node as MonsterNode)
            setIsMultiMonster(detail.multi_monster)
          }

          const grouped: { [key: number]: LevelFormData[] } = {}
          for (const l of nLevels) {
            const n = l.level_number
            if (!grouped[n]) grouped[n] = []
            grouped[n].push({
              dbId: l.id,
              subMonsterName: l.sub_monster_name ?? '',
              basicCards: l.basic_cards,
              advancedCards: l.advanced_cards,
              legendaryCards: l.legendary_cards,
              overtoneCards: l.overtone_cards,
              accuracy: l.accuracy,
              damage: l.damage,
              evasion: l.evasion,
              luck: l.luck,
              movement: l.movement,
              speed: l.speed,
              strength: l.strength,
              toughness: l.toughness,
              huntPos: 12,
              survivorHuntPos: 0,
              life: l.life ?? 0,
              traits: l.traits,
              moods: l.moods
            })
          }
          setLevels(grouped)
          setExpandedLevels(new Set(Object.keys(grouped).map(Number)))
        }
      } catch (err: unknown) {
        console.error('Load Monster Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [monsterId, monsterType])

  const toggleLevel = useCallback((level: number) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }, [])

  const addSubMonster = useCallback((level: number) => {
    setLevels((prev) => ({
      ...prev,
      [level]: [...(prev[level] ?? []), defaultLevelData()]
    }))
    setExpandedLevels((prev) => new Set(prev).add(level))
  }, [])

  const removeSubMonster = useCallback((level: number, index: number) => {
    setLevels((prev) => {
      const levelData = [...(prev[level] ?? [])]
      const removed = levelData[index]
      if (removed?.dbId) setDeletedLevelIds((ids) => [...ids, removed.dbId!])
      levelData.splice(index, 1)
      if (levelData.length === 0) {
        const next = { ...prev }
        delete next[level]
        return next
      }
      return { ...prev, [level]: levelData }
    })
  }, [])

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

  const cycleHuntBoardPos = useCallback((pos: keyof HuntBoardPositions) => {
    setHuntBoard((prev) => ({
      ...prev,
      [pos]: prev[pos] === 'BASIC' ? 'MONSTER' : 'BASIC'
    }))
  }, [])

  /**
   * Handle Save
   *
   * Updates the monster record and reconciles levels (add new, delete removed).
   */
  const handleSave = useCallback(async () => {
    if (!name.trim())
      return toast.error('A nameless monster cannot be recorded.')

    setIsSaving(true)

    try {
      if (monsterType === MonsterType.QUARRY) {
        // Update quarry record
        await updateQuarry(monsterId, {
          monster_name: name.trim(),
          multi_monster: isMultiMonster,
          node,
          prologue: isPrologue
        })

        // Update or create hunt board
        if (huntBoardId) {
          await updateQuarryHuntBoard(huntBoardId, {
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
        } else {
          await addQuarryHuntBoard({
            quarry_id: monsterId,
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
        }

        // Delete removed levels
        for (const id of deletedLevelIds) await removeQuarryLevel(id)

        // Add/update levels
        for (const [levelNum, subMonsters] of Object.entries(levels)) {
          for (const sub of subMonsters) {
            const levelData = {
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
              damage: sub.damage,
              evasion: sub.evasion,
              luck: sub.luck,
              movement: sub.movement,
              speed: sub.speed,
              strength: sub.strength,
              toughness: sub.toughness,
              hunt_pos: sub.huntPos,
              survivor_hunt_pos: sub.survivorHuntPos,
              traits: sub.traits,
              moods: sub.moods
            }

            if (sub.dbId) {
              const { updateQuarryLevel } =
                await import('@/lib/dal/quarry-level')
              await updateQuarryLevel(sub.dbId, levelData)
            } else {
              await addQuarryLevel({ quarry_id: monsterId, ...levelData })
            }
          }
        }
      } else {
        // Nemesis
        await updateNemesis(monsterId, {
          monster_name: name.trim(),
          multi_monster: isMultiMonster,
          node
        })

        for (const id of deletedLevelIds) await removeNemesisLevel(id)

        for (const [levelNum, subMonsters] of Object.entries(levels)) {
          for (const sub of subMonsters) {
            const levelData = {
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
              damage: sub.damage,
              evasion: sub.evasion,
              luck: sub.luck,
              movement: sub.movement,
              speed: sub.speed,
              strength: sub.strength,
              toughness: sub.toughness,
              life: sub.life || null,
              traits: sub.traits,
              moods: sub.moods
            }

            if (sub.dbId) {
              const { updateNemesisLevel } =
                await import('@/lib/dal/nemesis-level')
              await updateNemesisLevel(sub.dbId, levelData)
            } else {
              const { addNemesisLevel: addLevel } =
                await import('@/lib/dal/nemesis-level')
              await addLevel({ nemesis_id: monsterId, ...levelData })
            }
          }
        }
      }

      toast.success(CUSTOM_MONSTER_UPDATED_MESSAGE(monsterType))
      onMonsterUpdated()
    } catch (error) {
      console.error('Update Monster Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsSaving(false)
    }
  }, [
    name,
    monsterType,
    monsterId,
    node,
    isPrologue,
    isMultiMonster,
    levels,
    huntBoard,
    huntBoardId,
    deletedLevelIds,
    onMonsterUpdated
  ])

  if (isLoading)
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading monster data...</p>
      </Card>
    )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span className="flex items-center gap-2">
            <SkullIcon className="h-5 w-5" />
            Edit Monster
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
            <Label htmlFor="edit-monster-name">Monster Name</Label>
            <Input
              id="edit-monster-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Monster Type</Label>
              <Input value={monsterType} disabled />
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
                  id="edit-prologue"
                  checked={isPrologue}
                  onCheckedChange={(c) => setIsPrologue(!!c)}
                />
                <Label htmlFor="edit-prologue">Prologue Monster</Label>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-multi"
                checked={isMultiMonster}
                onCheckedChange={(c) => setIsMultiMonster(!!c)}
              />
              <Label htmlFor="edit-multi">Multi-Monster Encounter</Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Levels */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Monster Levels</Label>

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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          addSubMonster(levelNum)
                        }}>
                        <PlusIcon className="h-3 w-3 mr-1" /> Add
                      </Button>
                    )}
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {isExpanded && levelData && (
                  <div className="p-3 pt-0 space-y-3">
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
                            {[
                              ['basicCards', 'B'],
                              ['advancedCards', 'A'],
                              ['legendaryCards', 'L'],
                              ['overtoneCards', 'O']
                            ].map(([field, label]) => (
                              <div key={field} className="space-y-1">
                                <Label className="text-xs">{label}</Label>
                                <NumericInput
                                  label={label as string}
                                  value={
                                    sub[field as keyof LevelFormData] as number
                                  }
                                  min={0}
                                  onChange={(v) =>
                                    updateSubMonster(levelNum, subIdx, {
                                      [field]: v
                                    })
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Attributes */}
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Attributes
                          </Label>
                          <div className="grid grid-cols-4 gap-2 mt-1">
                            {[
                              'movement',
                              'accuracy',
                              'damage',
                              'strength',
                              'evasion',
                              'luck',
                              'speed',
                              'toughness'
                            ].map((attr) => (
                              <div key={attr} className="space-y-1">
                                <Label className="text-xs capitalize">
                                  {attr}
                                </Label>
                                <NumericInput
                                  label={attr}
                                  value={
                                    sub[attr as keyof LevelFormData] as number
                                  }
                                  onChange={(v) =>
                                    updateSubMonster(levelNum, subIdx, {
                                      [attr]: v
                                    })
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {monsterType === MonsterType.QUARRY && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Hunt Position</Label>
                              <NumericInput
                                label="Hunt Pos"
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
                              <Label className="text-xs">
                                Survivor Hunt Position
                              </Label>
                              <NumericInput
                                label="Surv Hunt Pos"
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

                        {monsterType === MonsterType.NEMESIS && (
                          <div className="space-y-1">
                            <Label className="text-xs">Life</Label>
                            <NumericInput
                              label="Life"
                              value={sub.life}
                              min={0}
                              onChange={(v) =>
                                updateSubMonster(levelNum, subIdx, { life: v })
                              }
                            />
                          </div>
                        )}

                        {/* Traits & Moods - simplified inline editors */}
                        {['traits', 'moods'].map((arrayField) => (
                          <div key={arrayField} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground capitalize">
                                {arrayField}
                              </Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateSubMonster(levelNum, subIdx, {
                                    [arrayField]: [
                                      ...sub[arrayField as 'traits' | 'moods'],
                                      ''
                                    ]
                                  })
                                }>
                                <PlusIcon className="h-3 w-3" />
                              </Button>
                            </div>
                            {sub[arrayField as 'traits' | 'moods'].map(
                              (item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1">
                                  <Input
                                    value={item}
                                    placeholder={
                                      arrayField === 'traits' ? 'Trait' : 'Mood'
                                    }
                                    onChange={(e) => {
                                      const next = [
                                        ...sub[arrayField as 'traits' | 'moods']
                                      ]
                                      next[idx] = e.target.value
                                      updateSubMonster(levelNum, subIdx, {
                                        [arrayField]: next
                                      })
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const next = sub[
                                        arrayField as 'traits' | 'moods'
                                      ].filter((_, i) => i !== idx)
                                      updateSubMonster(levelNum, subIdx, {
                                        [arrayField]: next
                                      })
                                    }}>
                                    <Trash2Icon className="h-3 w-3" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSubMonster(levelNum)}
                      className="w-full">
                      <PlusIcon className="h-3 w-3 mr-1" /> Add Sub-Monster
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

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
