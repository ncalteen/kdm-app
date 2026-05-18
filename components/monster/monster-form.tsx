'use client'

import { MarkdownSyntaxHelp } from '@/components/generic/markdown-syntax-help'
import { SafeMarkdownEditor } from '@/components/generic/safe-markdown-editor'
import { NumericInput } from '@/components/menu/numeric-input'
import { Badge } from '@/components/ui/badge'
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
import { baseMonsterLevelData, monsterAttributeTokenMap } from '@/lib/common'
import { getCollectiveCognitionRewards } from '@/lib/dal/collective-cognition-reward'
import { getLocations } from '@/lib/dal/location'
import { getMoods } from '@/lib/dal/mood'
import { getSurvivorStatuses } from '@/lib/dal/survivor-status'
import { getTraits } from '@/lib/dal/trait'
import { HuntEventType, MonsterNode, MonsterType } from '@/lib/enums'
import {
  ERROR_MESSAGE,
  MONSTER_LEVEL_MISSING_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import {
  CollectiveCognitionRewardDetail,
  LocationDetail,
  MonsterLevelData,
  MoodDetail,
  SurvivorStatusDetail,
  TraitDetail
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
import { useTheme } from 'next-themes'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Monster Level Draft
 *
 * Per-level sub-monster shape used inside the form. `id` is present for
 * existing rows loaded from the database, prefixed with `temp-` for newly
 * added rows in edit mode, or absent in pure create flow.
 */
export interface MonsterLevelDraft extends MonsterLevelData {
  /** Existing DB id, `temp-*` for new unsaved, or undefined */
  id?: string
  /** Level Number (mirrors the parent map key for edit mode) */
  level_number?: number
}

/**
 * Timeline Event Draft
 *
 * Form-shape for a timeline year. `id` follows the same convention as
 * `MonsterLevelDraft.id`.
 */
export interface TimelineEventDraft {
  /** Existing DB id, `temp-*` for new unsaved, or undefined */
  id?: string
  /** Year Number */
  year_number: number
  /** Timeline Entries */
  entries: string[]
}

/**
 * Hunt Board Draft
 *
 * Mirrors the `quarry_hunt_board` row shape (snake_case `pos_*` keys) so the
 * payload can be persisted directly without translation.
 */
export interface HuntBoardDraft {
  /** Position 1 */
  pos_1: HuntEventType
  /** Position 2 */
  pos_2: HuntEventType
  /** Position 3 */
  pos_3: HuntEventType
  /** Position 4 */
  pos_4: HuntEventType
  /** Position 5 */
  pos_5: HuntEventType
  /** Position 7 */
  pos_7: HuntEventType
  /** Position 8 */
  pos_8: HuntEventType
  /** Position 9 */
  pos_9: HuntEventType
  /** Position 10 */
  pos_10: HuntEventType
  /** Position 11 */
  pos_11: HuntEventType
}

/** Default hunt board with all positions set to BASIC. */
const defaultHuntBoard: HuntBoardDraft = {
  pos_1: HuntEventType.BASIC,
  pos_2: HuntEventType.BASIC,
  pos_3: HuntEventType.BASIC,
  pos_4: HuntEventType.BASIC,
  pos_5: HuntEventType.BASIC,
  pos_7: HuntEventType.BASIC,
  pos_8: HuntEventType.BASIC,
  pos_9: HuntEventType.BASIC,
  pos_10: HuntEventType.BASIC,
  pos_11: HuntEventType.BASIC
}

/**
 * Monster Form Initial Data
 *
 * Optional pre-populated form values. In create mode this is omitted entirely;
 * in edit mode it carries the loaded monster record.
 */
export interface MonsterFormInitialData {
  /** Monster Type (selectable in create mode, read-only in edit) */
  monsterType: MonsterType
  /** Monster Name */
  name?: string
  /** Monster Node */
  node?: MonsterNode
  /** Prologue Flag (quarry only) */
  prologue?: boolean
  /** Instinct Markdown */
  instinct?: string
  /** Basic Action Markdown */
  basicAction?: string
  /** Blind Spot Markdown */
  blindSpot?: string
  /** Defeat Outcome Markdown */
  defeatOutcome?: string
  /** Deployment Rules Markdown */
  deploymentRules?: string
  /** Victory Outcome Markdown */
  victoryOutcome?: string
  /** Levels grouped by level number */
  levels?: { [key: number]: MonsterLevelDraft[] }
  /** Per-level hunt positions (quarry only) */
  levelHuntPositions?: {
    [key: number]: { huntPos: number; survivorHuntPos: number }
  }
  /** Hunt board (quarry only) */
  huntBoard?: HuntBoardDraft
  /** Linked locations */
  locations?: LocationDetail[]
  /** Timeline events */
  timelineEvents?: TimelineEventDraft[]
  /** Linked collective cognition rewards (quarry only) */
  ccRewards?: CollectiveCognitionRewardDetail[]
}

/**
 * Monster Form Payload
 *
 * Snapshot of the form passed to the parent's `onSubmit`. Includes deletion
 * tracking lists used by edit mode.
 */
export interface MonsterFormPayload {
  /** Monster Name (trimmed, non-empty) */
  name: string
  /** Monster Type */
  monsterType: MonsterType
  /** Monster Node */
  node: MonsterNode
  /** Prologue Flag (quarry only; always present, ignored for nemesis) */
  prologue: boolean
  /** Instinct Markdown (trimmed; empty string when blank) */
  instinct: string
  /** Basic Action Markdown */
  basicAction: string
  /** Blind Spot Markdown */
  blindSpot: string
  /** Defeat Outcome Markdown */
  defeatOutcome: string
  /** Deployment Rules Markdown */
  deploymentRules: string
  /** Victory Outcome Markdown */
  victoryOutcome: string
  /** Levels grouped by level number */
  levels: { [key: number]: MonsterLevelDraft[] }
  /** Per-level hunt positions (quarry only) */
  levelHuntPositions: {
    [key: number]: { huntPos: number; survivorHuntPos: number }
  }
  /** Hunt board (quarry only) */
  huntBoard: HuntBoardDraft
  /** Linked locations */
  locations: LocationDetail[]
  /** Timeline events */
  timelineEvents: TimelineEventDraft[]
  /** Linked collective cognition rewards (quarry only) */
  ccRewards: CollectiveCognitionRewardDetail[]
  /** IDs of existing levels that were removed (edit mode) */
  deletedLevelIds: string[]
  /** IDs of existing timeline events that were removed (edit mode) */
  deletedTimelineIds: string[]
}

/**
 * Monster Form Properties
 */
export interface MonsterFormProps {
  /** Local State */
  local: LocalStateType
  /** Form Mode */
  mode: 'create' | 'edit'
  /** Card Title */
  title: string
  /** Submit Button Label (idle state) */
  submitLabel: string
  /** Submit Button Label (in-flight) */
  submittingLabel: string
  /** Optional Initial Data */
  initialData?: MonsterFormInitialData
  /** Whether the submit handler is currently running */
  isSubmitting: boolean
  /** Cancel Callback */
  onCancel: () => void
  /** Submit Callback */
  onSubmit: (payload: MonsterFormPayload) => void | Promise<void>
}

/** Hunt board position keys used for the layout buttons. */
const huntBoardLeftPositions = [1, 2, 3, 4, 5] as const
const huntBoardRightPositions = [7, 8, 9, 10, 11] as const
type HuntBoardPosKey = keyof HuntBoardDraft

/** AI deck card configuration. */
const aiDeckCards = [
  { label: 'B', key: 'basic_cards' as const, full: 'Basic' },
  { label: 'A', key: 'advanced_cards' as const, full: 'Advanced' },
  { label: 'L', key: 'legendary_cards' as const, full: 'Legendary' },
  { label: 'O', key: 'overtone_cards' as const, full: 'Overtone' }
]

/**
 * Monster Form Component
 *
 * Unified form used by both the create-monster and edit-monster cards. The
 * caller owns persistence — the form just collects state and emits a
 * `MonsterFormPayload` via `onSubmit`. Deletion tracking (`deletedLevelIds`,
 * `deletedTimelineIds`) is populated for edit mode and ignored by create.
 *
 * @param props Monster Form Properties
 * @returns Monster Form Component
 */
export function MonsterForm({
  local,
  mode,
  title,
  submitLabel,
  submittingLabel,
  initialData,
  isSubmitting,
  onCancel,
  onSubmit
}: MonsterFormProps): ReactElement {
  const { toast } = useToast(local)
  const { resolvedTheme } = useTheme()

  // Basic Info
  const [monsterType, setMonsterType] = useState<MonsterType>(
    initialData?.monsterType ?? MonsterType.QUARRY
  )
  const [name, setName] = useState(initialData?.name ?? '')
  const [node, setNode] = useState<MonsterNode>(
    initialData?.node ?? MonsterNode.NQ1
  )
  const [prologue, setPrologue] = useState(initialData?.prologue ?? false)

  // Monster Detail Fields
  const [instinct, setInstinct] = useState(initialData?.instinct ?? '')
  const [basicAction, setBasicAction] = useState(initialData?.basicAction ?? '')
  const [blindSpot, setBlindSpot] = useState(initialData?.blindSpot ?? '')
  const [defeatOutcome, setDefeatOutcome] = useState(
    initialData?.defeatOutcome ?? ''
  )
  const [deploymentRules, setDeploymentRules] = useState(
    initialData?.deploymentRules ?? ''
  )
  const [victoryOutcome, setVictoryOutcome] = useState(
    initialData?.victoryOutcome ?? ''
  )

  // Levels and Sub-Monster UI
  const [levels, setLevels] = useState<{ [key: number]: MonsterLevelDraft[] }>(
    initialData?.levels ?? {}
  )
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(
    new Set(Object.keys(initialData?.levels ?? {}).map(Number))
  )
  const [expandedSubMonsters, setExpandedSubMonsters] = useState<Set<string>>(
    new Set()
  )
  const [levelHuntPositions, setLevelHuntPositions] = useState<{
    [key: number]: { huntPos: number; survivorHuntPos: number }
  }>(initialData?.levelHuntPositions ?? {})
  const [deletedLevelIds, setDeletedLevelIds] = useState<string[]>([])

  // Hunt Board
  const [huntBoard, setHuntBoard] = useState<HuntBoardDraft>(
    initialData?.huntBoard ?? defaultHuntBoard
  )

  // Locations
  const [locations, setLocations] = useState<LocationDetail[]>(
    initialData?.locations ?? []
  )
  const [locationAddOpen, setLocationAddOpen] = useState(false)
  const [availableLocations, setAvailableLocations] = useState<{
    [key: string]: LocationDetail
  }>({})

  // Timeline Events
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventDraft[]>(
    initialData?.timelineEvents ?? []
  )
  const [deletedTimelineIds, setDeletedTimelineIds] = useState<string[]>([])

  // CC Rewards
  const [ccRewards, setCCRewards] = useState<CollectiveCognitionRewardDetail[]>(
    initialData?.ccRewards ?? []
  )
  const [ccRewardAddOpen, setCCRewardAddOpen] = useState(false)
  const [availableCCRewards, setAvailableCCRewards] = useState<{
    [key: string]: CollectiveCognitionRewardDetail
  }>({})

  // Traits / Moods catalogs (per-sub-monster selection is handled inline)
  const [availableTraits, setAvailableTraits] = useState<{
    [key: string]: TraitDetail
  }>({})
  const [availableMoods, setAvailableMoods] = useState<{
    [key: string]: MoodDetail
  }>({})
  const [availableSurvivorStatuses, setAvailableSurvivorStatuses] = useState<{
    [key: string]: SurvivorStatusDetail
  }>({})
  // Track which sub-monster's trait/mood popover is open, keyed by
  // `${levelNum}-${subIdx}`. Only one popover is open at a time.
  const [openTraitPicker, setOpenTraitPicker] = useState<string | null>(null)
  const [openMoodPicker, setOpenMoodPicker] = useState<string | null>(null)
  const [openSurvivorStatusPicker, setOpenSurvivorStatusPicker] = useState<
    string | null
  >(null)

  // Fetch dropdown options on mount
  useEffect(() => {
    Promise.all([
      getLocations(),
      getCollectiveCognitionRewards(),
      getTraits(),
      getMoods(),
      getSurvivorStatuses()
    ])
      .then(([locs, ccrs, traits, moods, statuses]) => {
        setAvailableLocations(locs)
        setAvailableCCRewards(ccrs)
        setAvailableTraits(traits)
        setAvailableMoods(moods)
        setAvailableSurvivorStatuses(statuses)
      })
      .catch((err: unknown) => {
        console.error('Fetch Options Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [toast])

  /** Locations not yet selected */
  const selectableLocations = useMemo(() => {
    const selectedIds = new Set(locations.map((l) => l.id))
    return Object.values(availableLocations)
      .filter((l) => !selectedIds.has(l.id))
      .sort((a, b) => a.location_name.localeCompare(b.location_name))
  }, [availableLocations, locations])

  /** CC rewards not yet selected */
  const selectableCCRewards = useMemo(() => {
    const selectedIds = new Set(ccRewards.map((c) => c.id))
    return Object.values(availableCCRewards)
      .filter((c) => !selectedIds.has(c.id))
      .sort((a, b) => a.reward_name.localeCompare(b.reward_name))
  }, [availableCCRewards, ccRewards])

  /**
   * Handle Monster Type Change
   *
   * Switches the monster type and resets the node to the first valid option
   * for the new type. Only invokable in create mode.
   */
  const handleMonsterTypeChange = useCallback((type: MonsterType) => {
    setMonsterType(type)
    setNode(getAvailableNodes(type)[0])
  }, [])

  /**
   * Toggle Level Expansion
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
   * @param key Sub-Monster Key (`${levelNum}-${subIdx}`)
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
   * Initializes hunt positions for the level if not already set, expands the
   * level, and stamps the new draft with a `temp-` id in edit mode (so the
   * parent can distinguish new from existing rows).
   */
  const addSubMonster = useCallback(
    (level: number) => {
      setLevels((prev) => {
        const newDraft: MonsterLevelDraft =
          mode === 'edit'
            ? {
                ...baseMonsterLevelData,
                id: `temp-${crypto.randomUUID()}`,
                level_number: level
              }
            : { ...baseMonsterLevelData }
        return { ...prev, [level]: [...(prev[level] ?? []), newDraft] }
      })
      setLevelHuntPositions((prev) => ({
        ...prev,
        [level]: prev[level] ?? { huntPos: 12, survivorHuntPos: 0 }
      }))
      setExpandedLevels((prev) => new Set(prev).add(level))
    },
    [mode]
  )

  /**
   * Remove Sub-Monster from Level
   *
   * Tracks removed existing IDs (non-`temp-`) for edit-mode deletion, and
   * cleans up hunt positions if the level becomes empty.
   */
  const removeSubMonster = useCallback(
    (level: number, index: number) =>
      setLevels((prev) => {
        const levelData = [...(prev[level] ?? [])]
        const removed = levelData[index]

        if (removed?.id && !removed.id.startsWith('temp-'))
          setDeletedLevelIds((ids) => [...ids, removed.id as string])

        levelData.splice(index, 1)

        if (levelData.length === 0) {
          const next = { ...prev }
          delete next[level]
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
   */
  const updateSubMonster = useCallback(
    (level: number, index: number, updates: Partial<MonsterLevelDraft>) =>
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
   * Toggles between BASIC and MONSTER event types.
   */
  const cycleHuntBoardPos = useCallback(
    (pos: HuntBoardPosKey) =>
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
   * Handle Submit
   *
   * Validates the form and emits a `MonsterFormPayload` to the parent. In
   * create mode the form additionally enforces that at least one level is
   * defined.
   */
  const handleSubmit = useCallback(async () => {
    if (!name.trim())
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('monster'))

    if (mode === 'create' && Object.keys(levels).length === 0)
      return toast.error(MONSTER_LEVEL_MISSING_MESSAGE())

    await onSubmit({
      name: name.trim(),
      monsterType,
      node,
      prologue,
      instinct,
      basicAction,
      blindSpot,
      defeatOutcome,
      deploymentRules,
      victoryOutcome,
      levels,
      levelHuntPositions,
      huntBoard,
      locations,
      timelineEvents,
      ccRewards,
      deletedLevelIds,
      deletedTimelineIds
    })
  }, [
    basicAction,
    blindSpot,
    ccRewards,
    deletedLevelIds,
    deletedTimelineIds,
    defeatOutcome,
    deploymentRules,
    huntBoard,
    instinct,
    levelHuntPositions,
    levels,
    locations,
    mode,
    monsterType,
    name,
    node,
    onSubmit,
    prologue,
    timelineEvents,
    toast,
    victoryOutcome
  ])

  const isQuarry = monsterType === MonsterType.QUARRY
  const submitDisabled =
    !name.trim() ||
    isSubmitting ||
    (mode === 'create' && Object.keys(levels).length === 0)

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span className="flex items-center gap-2">
            <SkullIcon className="h-5 w-5" />
            {title}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close monster form"
            title="Close">
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
              {isQuarry && (
                <div className="flex items-center gap-2 shrink-0">
                  <Checkbox
                    id="is-prologue"
                    checked={prologue}
                    onCheckedChange={(c) => setPrologue(!!c)}
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
              {mode === 'create' ? (
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
              ) : (
                <Input value={monsterType} disabled />
              )}
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
              <SafeMarkdownEditor
                value={instinct}
                onChange={(val) => setInstinct(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
            <TabsContent value="basicAction">
              <SafeMarkdownEditor
                value={basicAction}
                onChange={(val) => setBasicAction(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
            <TabsContent value="blindSpot">
              <SafeMarkdownEditor
                value={blindSpot}
                onChange={(val) => setBlindSpot(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
            <TabsContent value="defeatOutcome">
              <SafeMarkdownEditor
                value={defeatOutcome}
                onChange={(val) => setDefeatOutcome(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
            <TabsContent value="deploymentRules">
              <SafeMarkdownEditor
                value={deploymentRules}
                onChange={(val) => setDeploymentRules(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
            <TabsContent value="victoryOutcome">
              <SafeMarkdownEditor
                value={victoryOutcome}
                onChange={(val) => setVictoryOutcome(val ?? '')}
                height={200}
                preview="edit"
              />
            </TabsContent>
          </Tabs>
          <MarkdownSyntaxHelp />
        </div>

        {/* Hunt Board (Quarry Only) */}
        {isQuarry && (
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
                {huntBoardLeftPositions.map((pos) => {
                  const key = `pos_${pos}` as HuntBoardPosKey
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
                {huntBoardRightPositions.map((pos) => {
                  const key = `pos_${pos}` as HuntBoardPosKey
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
                  disabled={selectableLocations.length === 0}
                  aria-label="Add location"
                  title="Add location">
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
                          value={loc.id}
                          keywords={[loc.location_name]}
                          onSelect={() => {
                            setLocations((prev) => [...prev, loc])
                            setLocationAddOpen(false)
                          }}>
                          {loc.location_name}
                          {loc.custom && (
                            <Badge variant="outline" className="ml-auto">
                              Custom
                            </Badge>
                          )}
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
                }
                aria-label="Remove location"
                title="Remove location">
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
                  mode === 'edit'
                    ? {
                        id: `temp-${crypto.randomUUID()}`,
                        year_number: 0,
                        entries: []
                      }
                    : { year_number: 0, entries: [] }
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
                        value={te.year_number}
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
                        className="h-6 w-6"
                        onClick={() => {
                          const removed = timelineEvents[teIdx]
                          if (removed.id && !removed.id.startsWith('temp-'))
                            setDeletedTimelineIds((ids) => [
                              ...ids,
                              removed.id as string
                            ])
                          setTimelineEvents(
                            timelineEvents.filter((_, i) => i !== teIdx)
                          )
                        }}
                        title="Remove year"
                        aria-label="Remove timeline year">
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
                            aria-label={`Year ${te.year_number} entry ${eIdx + 1}`}
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
                            title="Remove entry"
                            aria-label="Remove timeline entry">
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
        {isQuarry && (
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
                      disabled={selectableCCRewards.length === 0}
                      aria-label="Add collective cognition reward"
                      title="Add reward">
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
                              value={ccr.id}
                              keywords={[ccr.reward_name]}
                              onSelect={() => {
                                setCCRewards((prev) => [...prev, ccr])
                                setCCRewardAddOpen(false)
                              }}>
                              {ccr.reward_name} (CC: {ccr.collective_cognition})
                              {ccr.custom && (
                                <Badge variant="outline" className="ml-auto">
                                  Custom
                                </Badge>
                              )}
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
                    }
                    aria-label="Remove collective cognition reward"
                    title="Remove reward">
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
                  className="w-full flex items-center justify-between p-3 hover:bg-accent/50 rounded-t-lg h-11"
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
                {isExpanded && isQuarry && (
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

                                    {!isQuarry && (
                                      <div className="flex items-center gap-1 shrink-0">
                                        <Label className="text-xs whitespace-nowrap pr-1">
                                          Life
                                        </Label>
                                        <NumericInput
                                          label="Life"
                                          value={sub.life ?? 0}
                                          className="max-w-18.75"
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
                                      {aiDeckCards.map((deck) => (
                                        <div
                                          key={deck.key}
                                          className="space-y-1">
                                          <Label className="text-xs text-center block text-muted-foreground">
                                            {deck.label} Cards
                                          </Label>
                                          <NumericInput
                                            label={deck.full}
                                            value={sub[deck.key] ?? 0}
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
                                        const subRecord =
                                          sub as unknown as Record<
                                            string,
                                            unknown
                                          >
                                        const baseVal =
                                          (subRecord[attr.key] as number) ?? 0
                                        const tokenVal =
                                          (subRecord[
                                            attr.tokenKey
                                          ] as number) ?? 0
                                        return (
                                          <div
                                            key={attr.key}
                                            className="grid grid-cols-subgrid col-span-4 items-center">
                                            <Label className="text-xs text-muted-foreground">
                                              {attr.label}
                                            </Label>
                                            <NumericInput
                                              label={attr.label}
                                              value={baseVal}
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
                                              value={tokenVal}
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
                                              value={baseVal + tokenVal}
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
                                      <Popover
                                        open={
                                          openTraitPicker ===
                                          `${levelNum}-${subIdx}`
                                        }
                                        onOpenChange={(open) =>
                                          setOpenTraitPicker(
                                            open
                                              ? `${levelNum}-${subIdx}`
                                              : null
                                          )
                                        }>
                                        <PopoverTrigger asChild>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={
                                              Object.keys(availableTraits)
                                                .length === sub.traits.length
                                            }>
                                            <PlusIcon className="h-3 w-3" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="p-0"
                                          align="end">
                                          <Command>
                                            <CommandInput placeholder="Search traits..." />
                                            <CommandList>
                                              <CommandEmpty>
                                                No traits found.
                                              </CommandEmpty>
                                              <CommandGroup>
                                                {Object.values(availableTraits)
                                                  .filter(
                                                    (t) =>
                                                      !sub.traits.some(
                                                        (st) => st.id === t.id
                                                      )
                                                  )
                                                  .sort((a, b) =>
                                                    a.trait_name.localeCompare(
                                                      b.trait_name
                                                    )
                                                  )
                                                  .map((trait) => (
                                                    <CommandItem
                                                      key={trait.id}
                                                      value={trait.id}
                                                      keywords={[
                                                        trait.trait_name
                                                      ]}
                                                      onSelect={() => {
                                                        updateSubMonster(
                                                          levelNum,
                                                          subIdx,
                                                          {
                                                            traits: [
                                                              ...sub.traits,
                                                              trait
                                                            ]
                                                          }
                                                        )
                                                        setOpenTraitPicker(null)
                                                      }}>
                                                      {trait.trait_name}
                                                      {trait.custom && (
                                                        <Badge
                                                          variant="outline"
                                                          className="ml-auto">
                                                          Custom
                                                        </Badge>
                                                      )}
                                                    </CommandItem>
                                                  ))}
                                              </CommandGroup>
                                            </CommandList>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    {sub.traits.map((trait) => (
                                      <div
                                        key={trait.id}
                                        className="flex items-center gap-1">
                                        <Input
                                          value={trait.trait_name}
                                          disabled
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            updateSubMonster(levelNum, subIdx, {
                                              traits: sub.traits.filter(
                                                (t) => t.id !== trait.id
                                              )
                                            })
                                          }>
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
                                      <Popover
                                        open={
                                          openMoodPicker ===
                                          `${levelNum}-${subIdx}`
                                        }
                                        onOpenChange={(open) =>
                                          setOpenMoodPicker(
                                            open
                                              ? `${levelNum}-${subIdx}`
                                              : null
                                          )
                                        }>
                                        <PopoverTrigger asChild>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={
                                              Object.keys(availableMoods)
                                                .length === sub.moods.length
                                            }>
                                            <PlusIcon className="h-3 w-3" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="p-0"
                                          align="end">
                                          <Command>
                                            <CommandInput placeholder="Search moods..." />
                                            <CommandList>
                                              <CommandEmpty>
                                                No moods found.
                                              </CommandEmpty>
                                              <CommandGroup>
                                                {Object.values(availableMoods)
                                                  .filter(
                                                    (m) =>
                                                      !sub.moods.some(
                                                        (sm) => sm.id === m.id
                                                      )
                                                  )
                                                  .sort((a, b) =>
                                                    a.mood_name.localeCompare(
                                                      b.mood_name
                                                    )
                                                  )
                                                  .map((mood) => (
                                                    <CommandItem
                                                      key={mood.id}
                                                      value={mood.id}
                                                      keywords={[
                                                        mood.mood_name
                                                      ]}
                                                      onSelect={() => {
                                                        updateSubMonster(
                                                          levelNum,
                                                          subIdx,
                                                          {
                                                            moods: [
                                                              ...sub.moods,
                                                              mood
                                                            ]
                                                          }
                                                        )
                                                        setOpenMoodPicker(null)
                                                      }}>
                                                      {mood.mood_name}
                                                      {mood.custom && (
                                                        <Badge
                                                          variant="outline"
                                                          className="ml-auto">
                                                          Custom
                                                        </Badge>
                                                      )}
                                                    </CommandItem>
                                                  ))}
                                              </CommandGroup>
                                            </CommandList>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    {sub.moods.map((mood) => (
                                      <div
                                        key={mood.id}
                                        className="flex items-center gap-1">
                                        <Input
                                          value={mood.mood_name}
                                          disabled
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            updateSubMonster(levelNum, subIdx, {
                                              moods: sub.moods.filter(
                                                (m) => m.id !== mood.id
                                              )
                                            })
                                          }>
                                          <Trash2Icon className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>

                                  <Separator />

                                  {/* Survivor Statuses */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <Label>Survivor Statuses</Label>
                                      <Popover
                                        open={
                                          openSurvivorStatusPicker ===
                                          `${levelNum}-${subIdx}`
                                        }
                                        onOpenChange={(open) =>
                                          setOpenSurvivorStatusPicker(
                                            open
                                              ? `${levelNum}-${subIdx}`
                                              : null
                                          )
                                        }>
                                        <PopoverTrigger asChild>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={
                                              Object.keys(
                                                availableSurvivorStatuses
                                              ).length ===
                                              sub.survivor_statuses.length
                                            }>
                                            <PlusIcon className="h-3 w-3" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="p-0"
                                          align="end">
                                          <Command>
                                            <CommandInput placeholder="Search statuses..." />
                                            <CommandList>
                                              <CommandEmpty>
                                                No survivor statuses found.
                                              </CommandEmpty>
                                              <CommandGroup>
                                                {Object.values(
                                                  availableSurvivorStatuses
                                                )
                                                  .filter(
                                                    (s) =>
                                                      !sub.survivor_statuses.some(
                                                        (ss) => ss.id === s.id
                                                      )
                                                  )
                                                  .sort((a, b) =>
                                                    a.survivor_status_name.localeCompare(
                                                      b.survivor_status_name
                                                    )
                                                  )
                                                  .map((status) => (
                                                    <CommandItem
                                                      key={status.id}
                                                      value={status.id}
                                                      keywords={[
                                                        status.survivor_status_name
                                                      ]}
                                                      onSelect={() => {
                                                        updateSubMonster(
                                                          levelNum,
                                                          subIdx,
                                                          {
                                                            survivor_statuses: [
                                                              ...sub.survivor_statuses,
                                                              status
                                                            ]
                                                          }
                                                        )
                                                        setOpenSurvivorStatusPicker(
                                                          null
                                                        )
                                                      }}>
                                                      {
                                                        status.survivor_status_name
                                                      }
                                                      {status.custom && (
                                                        <Badge
                                                          variant="outline"
                                                          className="ml-auto">
                                                          Custom
                                                        </Badge>
                                                      )}
                                                    </CommandItem>
                                                  ))}
                                              </CommandGroup>
                                            </CommandList>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    {sub.survivor_statuses.map((status) => (
                                      <div
                                        key={status.id}
                                        className="flex items-center gap-1">
                                        <Input
                                          value={status.survivor_status_name}
                                          disabled
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            updateSubMonster(levelNum, subIdx, {
                                              survivor_statuses:
                                                sub.survivor_statuses.filter(
                                                  (s) => s.id !== status.id
                                                )
                                            })
                                          }>
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
          <Button onClick={handleSubmit} disabled={submitDisabled}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
