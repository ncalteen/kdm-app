'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Separator } from '@/components/ui/separator'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { baseMonsterLevelData, monsterAttributeTokenMap } from '@/lib/common'
import { getCollectiveCognitionRewards } from '@/lib/dal/collective-cognition-reward'
import { getLocations } from '@/lib/dal/location'
import { getNemesis, updateNemesis } from '@/lib/dal/nemesis'
import {
  addNemesisLevel,
  getNemesisLevels,
  removeNemesisLevel,
  updateNemesisLevel
} from '@/lib/dal/nemesis-level'
import {
  addNemesisLocation,
  getNemesisLocationJunctionIds,
  getNemesisLocations,
  removeNemesisLocation
} from '@/lib/dal/nemesis-location'
import {
  addNemesisTimelineYear,
  getNemesisTimelineYears,
  removeNemesisTimelineYear,
  updateNemesisTimelineYear
} from '@/lib/dal/nemesis-timeline-year'
import { getQuarry, updateQuarry } from '@/lib/dal/quarry'
import {
  addQuarryCollectiveCognitionReward,
  getQuarryCollectiveCognitionRewardJunctionIds,
  getQuarryCollectiveCognitionRewards,
  removeQuarryCollectiveCognitionReward
} from '@/lib/dal/quarry-collective-cognition-reward'
import {
  addQuarryHuntBoard,
  getQuarryHuntBoard,
  updateQuarryHuntBoard
} from '@/lib/dal/quarry-hunt-board'
import {
  getQuarryHuntBoardPositions,
  removeQuarryHuntBoardPosition,
  upsertQuarryHuntBoardPosition
} from '@/lib/dal/quarry-hunt-board-position'
import {
  addQuarryLevel,
  getQuarryLevels,
  removeQuarryLevel,
  updateQuarryLevel
} from '@/lib/dal/quarry-level'
import {
  addQuarryLocation,
  getQuarryLocationJunctionIds,
  getQuarryLocations,
  removeQuarryLocations
} from '@/lib/dal/quarry-location'
import {
  addQuarryTimelineYear,
  getQuarryTimelineYears,
  removeQuarryTimelineYear,
  updateQuarryTimelineYear
} from '@/lib/dal/quarry-timeline-year'
import { HuntEventType, MonsterNode, MonsterType } from '@/lib/enums'
import {
  CUSTOM_MONSTER_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import {
  CollectiveCognitionRewardDetail,
  LocationDetail,
  NemesisLevelDetail,
  QuarryDetail,
  QuarryHuntBoardDetail,
  QuarryLevelDetail,
  QuarryTimelineDetail
} from '@/lib/types'
import { getAvailableNodes } from '@/lib/utils'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  SkullIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

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

  // UI State
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const [expandedSubMonsters, setExpandedSubMonsters] = useState<Set<string>>(
    new Set()
  )
  const [deletedLevelIds, setDeletedLevelIds] = useState<string[]>([])

  // Monster Data
  const [name, setName] = useState<string | null>(null)
  const [node, setNode] = useState<MonsterNode>(MonsterNode.NQ1)
  const [prologue, setPrologue] = useState<boolean>(false)

  // Level Data
  const [levels, setLevels] = useState<{
    [key: number]: (NemesisLevelDetail | QuarryLevelDetail)[]
  }>({})
  const [levelHuntPositions, setLevelHuntPositions] = useState<{
    [key: number]: { huntPos: number; survivorHuntPos: number }
  }>({})
  const [levelPositionIds, setLevelPositionIds] = useState<{
    [key: number]: string
  }>({})

  // Hunt Board Data (Quarry Only)
  const [huntBoard, setHuntBoard] = useState<QuarryHuntBoardDetail>({
    id: '',
    pos_1: HuntEventType.BASIC,
    pos_2: HuntEventType.BASIC,
    pos_3: HuntEventType.BASIC,
    pos_4: HuntEventType.BASIC,
    pos_5: HuntEventType.BASIC,
    pos_7: HuntEventType.BASIC,
    pos_8: HuntEventType.BASIC,
    pos_9: HuntEventType.BASIC,
    pos_10: HuntEventType.BASIC,
    pos_11: HuntEventType.BASIC,
    quarry_id: ''
  })

  // Location Data
  const [locations, setLocations] = useState<LocationDetail[]>([])
  const [locationAddOpen, setLocationAddOpen] = useState(false)
  const [availableLocations, setAvailableLocations] = useState<{
    [key: string]: LocationDetail
  }>({})

  // Timeline Event Data
  const [timelineEvents, setTimelineEvents] = useState<QuarryTimelineDetail[]>(
    []
  )

  // Collective Cognition Rewards (Quarry Only)
  const [collectiveCognitionRewards, setCollectiveCognitionRewards] = useState<
    CollectiveCognitionRewardDetail[]
  >([])
  const [ccRewardAddOpen, setCCRewardAddOpen] = useState(false)
  const [availableCCRewards, setAvailableCCRewards] = useState<{
    [key: string]: CollectiveCognitionRewardDetail
  }>({})

  /** Locations not yet selected */
  const selectableLocations = useMemo(() => {
    const selectedIds = new Set(locations.map((l) => l.id))
    return Object.values(availableLocations).filter(
      (l) => !selectedIds.has(l.id)
    )
  }, [availableLocations, locations])

  /** CC rewards not yet selected */
  const selectableCCRewards = useMemo(() => {
    const selectedIds = new Set(collectiveCognitionRewards.map((c) => c.id))
    return Object.values(availableCCRewards).filter(
      (c) => !selectedIds.has(c.id)
    )
  }, [availableCCRewards, collectiveCognitionRewards])

  /**
   * Load monster data from DB
   */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)

      try {
        // Fetch available locations and CC rewards for the dropdown
        setAvailableLocations(await getLocations())
        setAvailableCCRewards(await getCollectiveCognitionRewards())

        const functionMap = (monsterType: MonsterType) => ({
          getMonsterData:
            monsterType === MonsterType.QUARRY ? getQuarry : getNemesis,
          getMonsterLevels:
            monsterType === MonsterType.QUARRY
              ? getQuarryLevels
              : getNemesisLevels,
          getMonsterLocations:
            monsterType === MonsterType.QUARRY
              ? getQuarryLocations
              : getNemesisLocations,
          getMonsterTimelineEvents:
            monsterType === MonsterType.QUARRY
              ? getQuarryTimelineYears
              : getNemesisTimelineYears
        })

        const [
          monsterData,
          monsterLevels,
          monsterLocations,
          monsterTimelineEvents
        ] = await Promise.all([
          functionMap(monsterType).getMonsterData(monsterId),
          functionMap(monsterType).getMonsterLevels(monsterId),
          functionMap(monsterType).getMonsterLocations(monsterId),
          functionMap(monsterType).getMonsterTimelineEvents(monsterId)
        ])

        // Set base monster data
        if (monsterData) {
          setName(monsterData.monster_name)
          setNode(monsterData.node as MonsterNode)

          if (monsterType === MonsterType.QUARRY)
            setPrologue((monsterData as QuarryDetail).prologue)
        }

        // Set level data (grouped by level number)
        const grouped: {
          [key: number]: (NemesisLevelDetail | QuarryLevelDetail)[]
        } = {}

        for (const monsterLevel of monsterLevels) {
          if (!grouped[monsterLevel.level_number])
            grouped[monsterLevel.level_number] = []

          grouped[monsterLevel.level_number].push(monsterLevel)
        }
        setLevels(grouped)
        setExpandedLevels(new Set(Object.keys(grouped).map(Number)))

        // Set location data
        setLocations(monsterLocations)

        // Set timeline data
        setTimelineEvents(monsterTimelineEvents)

        if (monsterType === MonsterType.QUARRY) {
          // Set hunt board data
          setHuntBoard(await getQuarryHuntBoard(monsterId))

          // Extract per-level hunt positions from dedicated quarry positions.
          const quarryLevelPositions = await getQuarryHuntBoardPositions(
            monsterId
          )

          const huntPositions: {
            [key: number]: { huntPos: number; survivorHuntPos: number }
          } = {}
          const positionIds: { [key: number]: string } = {}

          for (const levelPosition of quarryLevelPositions) {
            huntPositions[levelPosition.level_number] = {
              huntPos: levelPosition.monster_hunt_pos,
              survivorHuntPos: levelPosition.survivor_hunt_pos
            }
            positionIds[levelPosition.level_number] = levelPosition.id
          }

          for (const monsterLevel of monsterLevels) {
            if (!huntPositions[monsterLevel.level_number])
              huntPositions[monsterLevel.level_number] = {
                huntPos: 12,
                survivorHuntPos: 0
              }
          }

          setLevelHuntPositions(huntPositions)
          setLevelPositionIds(positionIds)

          // Load collective cognition rewards
          setCollectiveCognitionRewards(
            await getQuarryCollectiveCognitionRewards(monsterId)
          )
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

  /**
   * Toggle Sub-Monster Expansion
   *
   * Uses a unique key of `${level}-${index}` to track expansion state of each
   * sub-monster across levels.
   *
   * @param key Unique Key
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
   * Toggle Level Expansion
   *
   * Expanding a level shows all sub-monsters for that level. Expansion state is
   * tracked by level number in a Set.
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
   * Add Sub-Monster
   *
   * Adds a new sub-monster to the specified level with default values. Also
   * expands the level to show the new sub-monster. New sub-monsters have a null
   * database ID to indicate they don't exist in the DB yet.
   *
   * @param level Level Number
   */
  const addSubMonster = useCallback((level: number) => {
    setLevels((prev) => ({
      ...prev,
      [level]: [
        ...(prev[level] ?? []),
        {
          ...baseMonsterLevelData,
          id: `temp-${Date.now()}`,
          ai_deck_remaining: 0,
          level_number: level,
          survivor_statuses: []
        }
      ]
    }))

    setExpandedLevels((prev) => new Set(prev).add(level))
  }, [])

  /**
   * Remove Sub-Monster
   *
   * Removes the specified sub-monster from the specified level. If the
   * sub-monster has a database ID, it is added to the deletedLevelIds state to
   * be removed from the DB on save. If removing the sub-monster results in no
   * sub-monsters left for the level, the level is removed from the levels state
   * entirely.
   *
   * @param level Level Number
   */
  const removeSubMonster = useCallback(
    (level: number, index: number) =>
      setLevels((prev) => {
        const levelData = [...(prev[level] ?? [])]
        const removed = levelData[index]

        if (removed.id) setDeletedLevelIds((ids) => [...ids, removed.id])

        levelData.splice(index, 1)

        if (levelData.length === 0) {
          const next = { ...prev }
          delete next[level]
          return next
        }

        return { ...prev, [level]: levelData }
      }),
    []
  )

  /**
   * Update Sub-Monster
   *
   * Updates the specified sub-monster with the provided changes. Changes are
   * merged with existing sub-monster data, allowing for partial updates. The
   * levels state is updated immutably to trigger re-renders.
   *
   * @param level Level Number
   * @param index Sub-Monster Index
   * @param updates Partial Sub-Monster Data to Update
   */
  const updateSubMonster = useCallback(
    (
      level: number,
      index: number,
      updates: Partial<NemesisLevelDetail | QuarryLevelDetail>
    ) =>
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
   * Cycles the specified hunt board position through the available event types
   * (Basic -> Monster -> Basic). This allows users to easily configure the hunt
   * board layout for the quarry. The huntBoard state is updated immutably to
   * trigger re-renders.
   *
   * @param pos Hunt Board Position (1-5, 7-11)
   */
  const cycleHuntBoardPos = useCallback(
    (pos: `pos_${1 | 2 | 3 | 4 | 5 | 7 | 8 | 9 | 10 | 11}`) => {
      setHuntBoard((prev) => ({
        ...prev,
        [pos]:
          prev[pos] === HuntEventType.BASIC
            ? HuntEventType.MONSTER
            : HuntEventType.BASIC
      }))
    },
    []
  )

  /**
   * Handle Save
   *
   * Updates the monster record and reconciles levels (add new, delete removed).
   */
  const handleSave = useCallback(async () => {
    if (!name?.trim())
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('monster'))

    setIsSaving(true)

    const isQuarry = monsterType === MonsterType.QUARRY

    const fns = {
      addLevel: isQuarry ? addQuarryLevel : addNemesisLevel,
      removeLevel: isQuarry ? removeQuarryLevel : removeNemesisLevel,
      updateMonster: isQuarry ? updateQuarry : updateNemesis,
      updateLevel: isQuarry ? updateQuarryLevel : updateNemesisLevel,
      addLocation: isQuarry
        ? (locId: string) =>
            addQuarryLocation({ quarry_id: monsterId, location_id: locId })
        : (locId: string) =>
            addNemesisLocation({ nemesis_id: monsterId, location_id: locId }),
      getLocationJunctionIds: isQuarry
        ? () => getQuarryLocationJunctionIds(monsterId)
        : () => getNemesisLocationJunctionIds(monsterId),
      removeLocationJunction: isQuarry
        ? (ids: string[]) => removeQuarryLocations(ids)
        : async (ids: string[]) => {
            for (const id of ids) await removeNemesisLocation(id)
          },
      addTimelineYear: isQuarry
        ? (data: { year_number: number; entries: string[] }) =>
            addQuarryTimelineYear({
              quarry_id: monsterId,
              ...data,
              campaign_types: []
            })
        : (data: { year_number: number; entries: string[] }) =>
            addNemesisTimelineYear({
              nemesis_id: monsterId,
              ...data,
              campaign_types: []
            }),
      updateTimelineYear: isQuarry
        ? updateQuarryTimelineYear
        : updateNemesisTimelineYear,
      removeTimelineYear: isQuarry
        ? removeQuarryTimelineYear
        : removeNemesisTimelineYear
    }

    try {
      // Update the monster record
      await fns.updateMonster(monsterId, {
        monster_name: name.trim(),
        multi_monster: Object.values(levels).some((l) => l.length > 1),
        node,
        ...(isQuarry ? { prologue } : {})
      })

      // Delete removed levels
      for (const id of deletedLevelIds) await fns.removeLevel(id)

      // Add/update levels
      for (const [levelNum, subMonsters] of Object.entries(levels)) {
        for (const sub of subMonsters) {
          const levelParsed = parseInt(levelNum)
          const levelData = {
            ...sub,
            level_number: sub.level_number || levelParsed,
            ai_deck_remaining:
              sub.basic_cards +
              sub.advanced_cards +
              sub.legendary_cards +
              sub.overtone_cards
          }

          if (sub.id && !sub.id.startsWith('temp-')) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...updateData } = levelData
            await fns.updateLevel(sub.id, updateData)
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...insertData } = levelData
            const idKey = isQuarry ? 'quarry_id' : 'nemesis_id'
            await (
              fns.addLevel as (
                data: Record<string, unknown>
              ) => Promise<unknown>
            )({ ...insertData, [idKey]: monsterId })
          }
        }
      }

      if (isQuarry) {
        const currentLevelNumbers = Object.entries(levels)
          .filter(([, subMonsters]) => subMonsters.length > 0)
          .map(([levelNum]) => parseInt(levelNum, 10))

        for (const levelNum of currentLevelNumbers) {
          await upsertQuarryHuntBoardPosition({
            quarry_id: monsterId,
            level_number: levelNum,
            monster_hunt_pos: levelHuntPositions[levelNum]?.huntPos ?? 12,
            survivor_hunt_pos:
              levelHuntPositions[levelNum]?.survivorHuntPos ?? 0
          })
        }

        for (const [levelNum, positionId] of Object.entries(levelPositionIds)) {
          if (!currentLevelNumbers.includes(parseInt(levelNum, 10)))
            await removeQuarryHuntBoardPosition(positionId)
        }
      }

      // Reconcile locations: delete all existing junction records, re-add
      const existingLocJunctionIds = await fns.getLocationJunctionIds()
      if (existingLocJunctionIds.length > 0)
        await fns.removeLocationJunction(existingLocJunctionIds)

      for (const location of locations) await fns.addLocation(location.id)

      // Reconcile timeline events: update existing, add new, delete removed
      const deletedTimelineIds = new Set<string>()
      for (const te of timelineEvents) {
        if (te.id) {
          const validEntries = te.entries.filter((e) => e.trim())

          if (validEntries.length === 0) {
            await fns.removeTimelineYear(te.id)
            deletedTimelineIds.add(te.id)
          } else {
            await fns.updateTimelineYear(te.id, {
              year_number: te.year_number,
              entries: validEntries
            })
          }
        } else {
          const validEntries = te.entries.filter((e) => e.trim())
          if (validEntries.length === 0) continue
          await fns.addTimelineYear({
            year_number: te.year_number,
            entries: validEntries
          })
        }
      }

      if (isQuarry) {
        // Update or create hunt board
        if (huntBoard.id) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, quarry_id, ...boardData } = huntBoard
          await updateQuarryHuntBoard(huntBoard.id, boardData)
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...boardData } = huntBoard
          await (
            addQuarryHuntBoard as (
              data: Record<string, unknown>
            ) => Promise<unknown>
          )({
            ...boardData,
            quarry_id: monsterId
          })
        }

        // Reconcile CC rewards: delete all junction records, re-add
        const existingCCRJunctionIds =
          await getQuarryCollectiveCognitionRewardJunctionIds(monsterId)

        for (const jId of existingCCRJunctionIds)
          await removeQuarryCollectiveCognitionReward(jId)

        for (const ccr of collectiveCognitionRewards) {
          await addQuarryCollectiveCognitionReward({
            quarry_id: monsterId,
            collective_cognition_reward_id: ccr.id
          })
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
    prologue,
    levels,
    levelHuntPositions,
    levelPositionIds,
    locations,
    timelineEvents,
    huntBoard,
    deletedLevelIds,
    onMonsterUpdated,
    collectiveCognitionRewards,
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
                value={name ?? ''}
                onChange={(e) => setName(e.target.value)}
              />
              {monsterType === MonsterType.QUARRY && (
                <div className="flex items-center gap-2 shrink-0">
                  <Checkbox
                    id="edit-prologue"
                    checked={prologue}
                    onCheckedChange={(c) => setPrologue(!!c)}
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
                {([1, 2, 3, 4, 5] as const).map((pos) => {
                  const key = `pos_${pos}` as const
                  return (
                    <button
                      key={pos}
                      type="button"
                      className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center text-xs cursor-pointer ${
                        huntBoard[key] === HuntEventType.MONSTER
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-blue-500 bg-blue-500/10'
                      }`}
                      onClick={() => cycleHuntBoardPos(key)}>
                      {huntBoard[key] === HuntEventType.MONSTER
                        ? 'Monster'
                        : 'Basic'}
                    </button>
                  )
                })}
                <div className="w-16 h-16 border-2 rounded-lg border-amber-500 bg-amber-500/10 flex items-center justify-center text-xs">
                  OD
                </div>
                {([7, 8, 9, 10, 11] as const).map((pos) => {
                  const key = `pos_${pos}` as const
                  return (
                    <button
                      key={pos}
                      type="button"
                      className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center text-xs cursor-pointer ${
                        huntBoard[key] === HuntEventType.MONSTER
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-blue-500 bg-blue-500/10'
                      }`}
                      onClick={() => cycleHuntBoardPos(key)}>
                      {huntBoard[key] === HuntEventType.MONSTER
                        ? 'Monster'
                        : 'Basic'}
                    </button>
                  )
                })}
                <div className="w-16 h-16 border-2 rounded-lg border-red-500 bg-red-500/10 flex items-center justify-center text-xs">
                  Starvation
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Locations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Locations</Label>
            <Popover open={locationAddOpen} onOpenChange={setLocationAddOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={selectableLocations.length === 0}>
                  <PlusIcon className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search locations..." />
                  <CommandList>
                    <CommandEmpty>No locations found.</CommandEmpty>
                    <CommandGroup>
                      {selectableLocations.map((loc) => (
                        <CommandItem
                          key={loc.id}
                          value={loc.location_name}
                          onSelect={() => {
                            setLocations((prev) => [...prev, loc])
                            setLocationAddOpen(false)
                          }}>
                          {loc.location_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          {locations.map((loc) => (
            <div key={loc.id} className="flex items-center gap-1">
              <Input value={loc.location_name} disabled />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setLocations(locations.filter((l) => l.id !== loc.id))
                }>
                <Trash2Icon className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <Separator />

        {/* Timeline Events */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Timeline Events</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setTimelineEvents((prev) => [
                  ...prev,
                  { id: `temp-${Date.now()}`, year_number: 0, entries: [''] }
                ])
              }>
              <PlusIcon className="h-3 w-3" />
            </Button>
          </div>
          {timelineEvents.map((te, teIdx) => (
            <div key={teIdx} className="border rounded-lg p-3">
              <div className="flex gap-3">
                {/* Year number and delete button */}
                <div className="flex flex-col items-start gap-1 shrink-0">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs pr-2">Year</Label>
                    <NumericInput
                      label="Year"
                      value={te.year_number}
                      min={0}
                      onChange={(v) => {
                        const next = [...timelineEvents]
                        next[teIdx] = { ...next[teIdx], year_number: v }
                        setTimelineEvents(next)
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setTimelineEvents(
                          timelineEvents.filter((_, i) => i !== teIdx)
                        )
                      }>
                      <Trash2Icon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Entries column */}
                <div className="flex-1 space-y-1">
                  {te.entries.map((entry, eIdx) => (
                    <div key={eIdx} className="flex items-center gap-1">
                      <Input
                        value={entry}
                        placeholder="Timeline entry"
                        onChange={(e) => {
                          const next = [...timelineEvents]
                          const entries = [...next[teIdx].entries]
                          entries[eIdx] = e.target.value
                          next[teIdx] = { ...next[teIdx], entries }
                          setTimelineEvents(next)
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const next = [...timelineEvents]
                          next[teIdx] = {
                            ...next[teIdx],
                            entries: next[teIdx].entries.filter(
                              (_, i) => i !== eIdx
                            )
                          }
                          setTimelineEvents(next)
                        }}>
                        <Trash2Icon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const next = [...timelineEvents]
                      next[teIdx] = {
                        ...next[teIdx],
                        entries: [...next[teIdx].entries, '']
                      }
                      setTimelineEvents(next)
                    }}>
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Add Entry
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CC Rewards (Quarry Only) */}
        {monsterType === MonsterType.QUARRY && (
          <>
            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Collective Cognition Rewards
                </Label>
                <Popover
                  open={ccRewardAddOpen}
                  onOpenChange={setCCRewardAddOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={selectableCCRewards.length === 0}>
                      <PlusIcon className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="end">
                    <Command>
                      <CommandInput placeholder="Search rewards..." />
                      <CommandList>
                        <CommandEmpty>No rewards found.</CommandEmpty>
                        <CommandGroup>
                          {selectableCCRewards.map((ccr) => (
                            <CommandItem
                              key={ccr.id}
                              value={ccr.reward_name}
                              onSelect={() => {
                                setCollectiveCognitionRewards((prev) => [
                                  ...prev,
                                  ccr
                                ])
                                setCCRewardAddOpen(false)
                              }}>
                              {ccr.reward_name} (CC: {ccr.collective_cognition})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {collectiveCognitionRewards.map((ccr) => (
                <div key={ccr.id} className="flex items-center gap-1">
                  <Input
                    value={`${ccr.reward_name} (CC: ${ccr.collective_cognition})`}
                    disabled
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setCollectiveCognitionRewards(
                        collectiveCognitionRewards.filter(
                          (c) => c.id !== ccr.id
                        )
                      )
                    }>
                    <Trash2Icon className="h-3 w-3" />
                  </Button>
                </div>
              ))}
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
                            sub.sub_monster_name || `Sub-Monster ${subIdx + 1}`

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
                                      value={sub.sub_monster_name ?? ''}
                                      onChange={(e) =>
                                        updateSubMonster(levelNum, subIdx, {
                                          sub_monster_name: e.target.value
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
                                          value={
                                            (sub as NemesisLevelDetail).life ??
                                            0
                                          }
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
                                          key: 'basic_cards' as const,
                                          full: 'Basic'
                                        },
                                        {
                                          label: 'A',
                                          key: 'advanced_cards' as const,
                                          full: 'Advanced'
                                        },
                                        {
                                          label: 'L',
                                          key: 'legendary_cards' as const,
                                          full: 'Legendary'
                                        },
                                        {
                                          label: 'O',
                                          key: 'overtone_cards' as const,
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
                                            value={
                                              (sub as Record<string, unknown>)[
                                                deck.key
                                              ] as number
                                            }
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

                                      {monsterAttributeTokenMap.map((attr) => {
                                        const subRecord = sub as Record<
                                          string,
                                          unknown
                                        >

                                        return (
                                          <div
                                            key={attr.key}
                                            className="grid grid-cols-subgrid col-span-4 items-center">
                                            <Label className="text-xs text-muted-foreground">
                                              {attr.label}
                                            </Label>
                                            <NumericInput
                                              label={attr.label}
                                              value={
                                                (subRecord[
                                                  attr.key
                                                ] as number) ?? 0
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
                                                (subRecord[
                                                  attr.tokenKey
                                                ] as number) ?? 0
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
                                                ((subRecord[
                                                  attr.key
                                                ] as number) ?? 0) +
                                                ((subRecord[
                                                  attr.tokenKey
                                                ] as number) ?? 0)
                                              }
                                              disabled
                                            />
                                          </div>
                                        )
                                      })}
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
          <Button onClick={handleSave} disabled={!name?.trim() || isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
