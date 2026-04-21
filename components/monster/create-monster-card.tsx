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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import {
  baseMonsterLevelData,
  basicHuntBoard,
  monsterAttributeTokenMap
} from '@/lib/common'
import { getCollectiveCognitionRewards } from '@/lib/dal/collective-cognition-reward'
import { getLocations } from '@/lib/dal/location'
import { addNemesis } from '@/lib/dal/nemesis'
import { addNemesisLevel } from '@/lib/dal/nemesis-level'
import { addNemesisLocation } from '@/lib/dal/nemesis-location'
import { addNemesisTimelineYear } from '@/lib/dal/nemesis-timeline-year'
import { addQuarry } from '@/lib/dal/quarry'
import { addQuarryCollectiveCognitionReward } from '@/lib/dal/quarry-collective-cognition-reward'
import { addQuarryHuntBoard } from '@/lib/dal/quarry-hunt-board'
import { upsertQuarryHuntBoardPosition } from '@/lib/dal/quarry-hunt-board-position'
import { addQuarryLevel } from '@/lib/dal/quarry-level'
import { addQuarryLocation } from '@/lib/dal/quarry-location'
import { addQuarryTimelineYear } from '@/lib/dal/quarry-timeline-year'
import { HuntEventType, MonsterNode, MonsterType } from '@/lib/enums'
import {
  CUSTOM_MONSTER_CREATED_MESSAGE,
  ERROR_MESSAGE,
  MONSTER_LEVEL_MISSING_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import {
  CollectiveCognitionRewardDetail,
  HuntBoard,
  LocationDetail,
  MonsterLevelData
} from '@/lib/types'
import { getAvailableNodes } from '@/lib/utils'
import MDEditor from '@uiw/react-md-editor'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  SkullIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

/** Timeline Event Form Data */
interface TimelineEventData {
  /** Year Number */
  yearNumber: number
  /** Timeline Entries */
  entries: string[]
}

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

  const { resolvedTheme } = useTheme()

  const [isCreating, setIsCreating] = useState(false)

  // Basic Info
  const [monsterType, setMonsterType] = useState<MonsterType>(
    MonsterType.QUARRY
  )
  const [name, setName] = useState('')
  const [node, setNode] = useState<MonsterNode>(MonsterNode.NQ1)
  const [isPrologue, setIsPrologue] = useState(false)

  // Monster Detail Fields
  const [instinct, setInstinct] = useState('')
  const [basicAction, setBasicAction] = useState('')
  const [blindSpot, setBlindSpot] = useState('')
  const [defeatOutcome, setDefeatOutcome] = useState('')
  const [deploymentRules, setDeploymentRules] = useState('')
  const [victoryOutcome, setVictoryOutcome] = useState('')

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

  // Locations, Timeline Events, CC Rewards
  const [locations, setLocations] = useState<LocationDetail[]>([])
  const [locationAddOpen, setLocationAddOpen] = useState(false)
  const [availableLocations, setAvailableLocations] = useState<{
    [key: string]: LocationDetail
  }>({})
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventData[]>([])
  const [ccRewards, setCCRewards] = useState<CollectiveCognitionRewardDetail[]>(
    []
  )
  const [ccRewardAddOpen, setCCRewardAddOpen] = useState(false)
  const [availableCCRewards, setAvailableCCRewards] = useState<{
    [key: string]: CollectiveCognitionRewardDetail
  }>({})

  // Fetch available locations and CC rewards on mount
  useEffect(() => {
    Promise.all([getLocations(), getCollectiveCognitionRewards()])
      .then(([locs, ccrs]) => {
        setAvailableLocations(locs)
        setAvailableCCRewards(ccrs)
      })
      .catch((err: unknown) => {
        console.error('Fetch Options Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [toast])

  /** Locations not yet selected */
  const selectableLocations = useMemo(() => {
    const selectedIds = new Set(locations.map((l) => l.id))
    return Object.values(availableLocations).filter(
      (l) => !selectedIds.has(l.id)
    )
  }, [availableLocations, locations])

  /** CC rewards not yet selected */
  const selectableCCRewards = useMemo(() => {
    const selectedIds = new Set(ccRewards.map((c) => c.id))
    return Object.values(availableCCRewards).filter(
      (c) => !selectedIds.has(c.id)
    )
  }, [availableCCRewards, ccRewards])

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
      const isQuarry = monsterType === MonsterType.QUARRY

      // 1. Create the monster record
      const addMonster = isQuarry ? addQuarry : addNemesis
      const monster = await addMonster({
        custom: true,
        monster_name: name.trim(),
        multi_monster: levelEntries.some((entry) => entry[1].length > 1),
        node,
        instinct: instinct.trim() || null,
        basic_action: basicAction.trim() || null,
        blind_spot: blindSpot.trim() || null,
        defeat_outcome: defeatOutcome.trim() || null,
        deployment_rules: deploymentRules.trim() || null,
        victory_outcome: victoryOutcome.trim() || null,
        ...(isQuarry ? { prologue: isPrologue } : {})
      })

      // 2. Create hunt board (quarry only)
      if (isQuarry) {
        await addQuarryHuntBoard({
          quarry_id: monster.id,
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

      // 3. Create levels
      const addLevel = isQuarry ? addQuarryLevel : addNemesisLevel
      const idKey = isQuarry ? 'quarry_id' : 'nemesis_id'

      for (const [levelStr, subMonsters] of levelEntries) {
        const levelNum = parseInt(levelStr, 10)

        for (const sub of subMonsters) {
          const { life: _life, ...quarryFields } = sub

          await (
            addLevel as (data: Record<string, unknown>) => Promise<unknown>
          )({
            [idKey]: monster.id,
            ...(isQuarry ? quarryFields : sub),
            sub_monster_name: sub.sub_monster_name || null,
            level_number: levelNum,
            ai_deck_remaining:
              sub.basic_cards +
              sub.advanced_cards +
              sub.legendary_cards +
              sub.overtone_cards,
            ...(isQuarry ? {} : { life: _life || null })
          })
        }

        if (isQuarry) {
          await upsertQuarryHuntBoardPosition({
            quarry_id: monster.id,
            level_number: levelNum,
            monster_hunt_pos: levelHuntPositions[levelNum]?.huntPos ?? 12,
            survivor_hunt_pos:
              levelHuntPositions[levelNum]?.survivorHuntPos ?? 0
          })
        }
      }

      // 4. Link locations
      const addLocation = isQuarry
        ? (locId: string) =>
            addQuarryLocation({ quarry_id: monster.id, location_id: locId })
        : (locId: string) =>
            addNemesisLocation({ nemesis_id: monster.id, location_id: locId })

      for (const loc of locations) await addLocation(loc.id)

      // 5. Create timeline events
      const addTimeline = isQuarry
        ? (data: { year_number: number; entries: string[] }) =>
            addQuarryTimelineYear({
              quarry_id: monster.id,
              ...data,
              campaign_types: []
            })
        : (data: { year_number: number; entries: string[] }) =>
            addNemesisTimelineYear({
              nemesis_id: monster.id,
              ...data,
              campaign_types: []
            })

      for (const te of timelineEvents) {
        const validEntries = te.entries.filter((e) => e.trim())
        if (validEntries.length === 0) continue
        await addTimeline({
          year_number: te.yearNumber,
          entries: validEntries
        })
      }

      // 6. Link CC rewards (quarry only)
      if (isQuarry) {
        for (const ccr of ccRewards) {
          await addQuarryCollectiveCognitionReward({
            quarry_id: monster.id,
            collective_cognition_reward_id: ccr.id
          })
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
    instinct,
    basicAction,
    blindSpot,
    defeatOutcome,
    deploymentRules,
    victoryOutcome,
    levels,
    levelHuntPositions,
    locations,
    timelineEvents,
    ccRewards,
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

        {/* Monster Details Tabs */}
        <Separator />

        <div className="space-y-2" data-color-mode={resolvedTheme}>
          <Label className="text-sm font-semibold">Monster Details</Label>
          <Tabs defaultValue="instinct">
            <TabsList className="w-full flex-wrap h-auto">
              <TabsTrigger value="instinct">Instinct</TabsTrigger>
              <TabsTrigger value="basicAction">Basic Action</TabsTrigger>
              <TabsTrigger value="blindSpot">Blind Spot</TabsTrigger>
              <TabsTrigger value="defeatOutcome">Defeat</TabsTrigger>
              <TabsTrigger value="deploymentRules">Deployment</TabsTrigger>
              <TabsTrigger value="victoryOutcome">Victory</TabsTrigger>
            </TabsList>

            <TabsContent value="instinct">
              <MDEditor
                value={instinct}
                onChange={(val) => setInstinct(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
            <TabsContent value="basicAction">
              <MDEditor
                value={basicAction}
                onChange={(val) => setBasicAction(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
            <TabsContent value="blindSpot">
              <MDEditor
                value={blindSpot}
                onChange={(val) => setBlindSpot(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
            <TabsContent value="defeatOutcome">
              <MDEditor
                value={defeatOutcome}
                onChange={(val) => setDefeatOutcome(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
            <TabsContent value="deploymentRules">
              <MDEditor
                value={deploymentRules}
                onChange={(val) => setDeploymentRules(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
            <TabsContent value="victoryOutcome">
              <MDEditor
                value={victoryOutcome}
                onChange={(val) => setVictoryOutcome(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
          </Tabs>
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
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold">Timeline</h5>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setTimelineEvents((prev) => [
                  ...prev,
                  { yearNumber: 0, entries: [] }
                ])
              }>
              <PlusIcon className="h-3 w-3 mr-1" />
              Add Year
            </Button>
          </div>
          {timelineEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No timeline entries defined.
            </p>
          ) : (
            <div className="space-y-3">
              {timelineEvents.map((te, teIdx) => (
                <div key={teIdx} className="rounded-md border p-3">
                  <div className="flex items-start gap-2">
                    {/* Year label + number + delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Label className="text-xs shrink-0">Year</Label>
                      <NumericInput
                        className="w-16 h-8"
                        label="Year number"
                        min={0}
                        max={50}
                        value={te.yearNumber}
                        onChange={(v) => {
                          const next = [...timelineEvents]
                          next[teIdx] = { ...next[teIdx], yearNumber: v }
                          setTimelineEvents(next)
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          setTimelineEvents(
                            timelineEvents.filter((_, i) => i !== teIdx)
                          )
                        }
                        title="Remove year">
                        <Trash2Icon className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Entries */}
                    <div className="flex-1 space-y-1 min-w-0">
                      {te.entries.map((entry, eIdx) => (
                        <div key={eIdx} className="flex items-center gap-1">
                          <Input
                            className="h-8 text-sm"
                            value={entry}
                            placeholder="Timeline entry"
                            onChange={(e) => {
                              const next = [...timelineEvents]
                              const entries = [...next[teIdx].entries]
                              entries[eIdx] = e.target.value
                              next[teIdx] = { ...next[teIdx], entries }
                              setTimelineEvents(next)
                            }}
                            aria-label={`Year ${te.yearNumber} entry ${eIdx + 1}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => {
                              const next = [...timelineEvents]
                              next[teIdx] = {
                                ...next[teIdx],
                                entries: next[teIdx].entries.filter(
                                  (_, i) => i !== eIdx
                                )
                              }
                              setTimelineEvents(next)
                            }}
                            title="Remove entry">
                            <XIcon className="h-3 w-3" />
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
          )}
        </section>

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
                                setCCRewards((prev) => [...prev, ccr])
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
              {ccRewards.map((ccr) => (
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
                      setCCRewards(ccRewards.filter((c) => c.id !== ccr.id))
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
                                          value={sub.life}
                                          className="max-w-[75px]"
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
