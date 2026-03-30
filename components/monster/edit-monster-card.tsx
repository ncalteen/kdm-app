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
import { HuntEventType, MonsterNode, MonsterType } from '@/lib/enums'
import {
  CUSTOM_MONSTER_UPDATED_MESSAGE,
  ERROR_MESSAGE,
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
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Monster Level Data (Editing)
 */
type MonsterLevelDataEditing = MonsterLevelData & {
  dbId: string | null
}

/**
 * Edit Monster Card Properties
 */
interface EditMonsterCardProps {
  /** Local State */
  local: LocalStateType
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
  local,
  monsterId,
  monsterType,
  onCancel,
  onMonsterUpdated
}: EditMonsterCardProps): ReactElement {
  const { toast } = useToast(local)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [name, setName] = useState('')
  const [node, setNode] = useState<MonsterNode>(MonsterNode.NQ1)
  const [isPrologue, setIsPrologue] = useState(false)

  const [levels, setLevels] = useState<{
    [key: number]: MonsterLevelDataEditing[]
  }>({})
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const [expandedSubMonsters, setExpandedSubMonsters] = useState<Set<string>>(
    new Set()
  )

  const [levelHuntPositions, setLevelHuntPositions] = useState<{
    [key: number]: { huntPos: number; survivorHuntPos: number }
  }>({})

  const [huntBoardId, setHuntBoardId] = useState<string | null>(null)
  const [huntBoard, setHuntBoard] = useState<HuntBoard>(basicHuntBoard)

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
          }

          // Group levels by level_number
          const grouped: { [key: number]: MonsterLevelDataEditing[] } = {}
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
              accuracyTokens: l.accuracy_tokens,
              damage: l.damage,
              damageTokens: l.damage_tokens,
              evasion: l.evasion,
              evasionTokens: l.evasion_tokens,
              luck: l.luck,
              luckTokens: l.luck_tokens,
              movement: l.movement,
              movementTokens: l.movement_tokens,
              speed: l.speed,
              speedTokens: l.speed_tokens,
              strength: l.strength,
              strengthTokens: l.strength_tokens,
              toughness: l.toughness,
              toughnessTokens: l.toughness_tokens,
              life: 0,
              traits: l.traits,
              moods: l.moods
            })
          }
          setLevels(grouped)
          setExpandedLevels(new Set(Object.keys(grouped).map(Number)))

          // Extract per-level hunt positions from the first sub-monster
          const huntPositions: {
            [key: number]: { huntPos: number; survivorHuntPos: number }
          } = {}
          for (const l of qLevels) {
            if (!huntPositions[l.level_number]) {
              huntPositions[l.level_number] = {
                huntPos: l.hunt_pos,
                survivorHuntPos: l.survivor_hunt_pos
              }
            }
          }
          setLevelHuntPositions(huntPositions)

          if (board) {
            setHuntBoardId(board.id)
            setHuntBoard({
              1: board.pos_1 as HuntEventType,
              2: board.pos_2 as HuntEventType,
              3: board.pos_3 as HuntEventType,
              4: board.pos_4 as HuntEventType,
              5: board.pos_5 as HuntEventType,
              7: board.pos_7 as HuntEventType,
              8: board.pos_8 as HuntEventType,
              9: board.pos_9 as HuntEventType,
              10: board.pos_10 as HuntEventType,
              11: board.pos_11 as HuntEventType
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
          }

          const grouped: { [key: number]: MonsterLevelDataEditing[] } = {}
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
              accuracyTokens: l.accuracy_tokens,
              damage: l.damage,
              damageTokens: l.damage_tokens,
              evasion: l.evasion,
              evasionTokens: l.evasion_tokens,
              luck: l.luck,
              luckTokens: l.luck_tokens,
              movement: l.movement,
              movementTokens: l.movement_tokens,
              speed: l.speed,
              speedTokens: l.speed_tokens,
              strength: l.strength,
              strengthTokens: l.strength_tokens,
              toughness: l.toughness,
              toughnessTokens: l.toughness_tokens,
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
  }, [monsterId, monsterType, toast])

  const toggleSubMonster = useCallback((key: string) => {
    setExpandedSubMonsters((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

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
      [level]: [...(prev[level] ?? []), { ...baseMonsterLevelData, dbId: null }]
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
    (
      level: number,
      index: number,
      updates: Partial<MonsterLevelDataEditing>
    ) => {
      setLevels((prev) => {
        const levelData = [...(prev[level] ?? [])]
        levelData[index] = { ...levelData[index], ...updates }
        return { ...prev, [level]: levelData }
      })
    },
    []
  )

  const cycleHuntBoardPos = useCallback((pos: keyof HuntBoard) => {
    setHuntBoard((prev) => ({
      ...prev,
      [pos]:
        prev[pos] === HuntEventType.BASIC
          ? HuntEventType.MONSTER
          : HuntEventType.BASIC
    }))
  }, [])

  /**
   * Handle Save
   *
   * Updates the monster record and reconciles levels (add new, delete removed).
   */
  const handleSave = useCallback(async () => {
    if (!name.trim())
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('monster'))

    setIsSaving(true)

    try {
      if (monsterType === MonsterType.QUARRY) {
        // Update quarry record
        await updateQuarry(monsterId, {
          monster_name: name.trim(),
          multi_monster: Object.values(levels).some((l) => l.length > 1),
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
              hunt_pos: levelHuntPositions[parseInt(levelNum)]?.huntPos ?? 12,
              survivor_hunt_pos:
                levelHuntPositions[parseInt(levelNum)]?.survivorHuntPos ?? 0,
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
          multi_monster: Object.values(levels).some((l) => l.length > 1),
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
    levels,
    levelHuntPositions,
    huntBoard,
    huntBoardId,
    deletedLevelIds,
    onMonsterUpdated,
    toast
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
            <div className="flex items-center gap-2">
              <Input
                id="edit-monster-name"
                className="flex-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {monsterType === MonsterType.QUARRY && (
                <div className="flex items-center gap-2 shrink-0">
                  <Checkbox
                    id="edit-prologue"
                    checked={isPrologue}
                    onCheckedChange={(c) => setIsPrologue(!!c)}
                  />
                  <Label htmlFor="edit-prologue" className="whitespace-nowrap">
                    Prologue
                  </Label>
                </div>
              )}
            </div>
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
                                            value={sub[deck.key] as number}
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
                                                attr.key as keyof MonsterLevelDataEditing
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
                                                attr.tokenKey as keyof MonsterLevelDataEditing
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
                                                attr.key as keyof MonsterLevelDataEditing
                                              ] as number) +
                                              (sub[
                                                attr.tokenKey as keyof MonsterLevelDataEditing
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
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
