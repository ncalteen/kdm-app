'use client'

import { CustomRulesText } from '@/components/custom/custom-rules-sheet'
import { NumericInput } from '@/components/menu/numeric-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { getMoods } from '@/lib/dal/mood'
import { getSurvivorStatuses } from '@/lib/dal/survivor-status'
import { getTraits } from '@/lib/dal/trait'
import {
  addVignetteEncounterMonsterMood,
  addVignetteEncounterMonsterSurvivorStatus,
  addVignetteEncounterMonsterTrait,
  removeVignetteEncounterMonsterMood,
  removeVignetteEncounterMonsterSurvivorStatus,
  removeVignetteEncounterMonsterTrait,
  updateVignetteEncounterMonster
} from '@/lib/dal/vignette-encounter'
import { ERROR_MESSAGE } from '@/lib/messages'
import type {
  CatalogAuthorshipDetail,
  MoodDetail,
  SurvivorStatusDetail,
  TraitDetail,
  VignetteEncounterDetail,
  VignetteEncounterMonsterDetail,
  VignetteEncounterMonsterMoodDetail,
  VignetteEncounterMonsterSurvivorStatusDetail,
  VignetteEncounterMonsterTraitDetail,
  VignetteEncounterStateSetter
} from '@/lib/types'
import { CheckIcon, PlusIcon, SkullIcon, Trash2Icon } from 'lucide-react'
import {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import { toast } from 'sonner'

const VIGNETTE_MONSTER_ATTRIBUTE_GRID_CLASS = 'grid items-center gap-1 sm:gap-2'

const VIGNETTE_MONSTER_ATTRIBUTE_GRID_STYLE: CSSProperties = {
  gridTemplateColumns: 'minmax(4.75rem, 5.5rem) repeat(3, minmax(0, 1fr))'
}

const VIGNETTE_MONSTER_NUMERIC_INPUT_CLASS =
  'h-10 min-w-0 w-full px-1 text-sm sm:h-12 sm:text-xl'

/** Vignette Monster Card Properties */
interface VignetteMonsterCardProps {
  /** Selected Vignette Encounter */
  selectedVignetteEncounter: VignetteEncounterDetail
  /** Set Selected Vignette Encounter */
  setSelectedVignetteEncounter: VignetteEncounterStateSetter
}

/** Vignette Monster Rule Type */
type VignetteMonsterRuleType = 'mood' | 'trait' | 'survivor_status'

/** Vignette Monster Numeric Field */
type VignetteMonsterNumericField =
  | 'accuracy'
  | 'accuracy_tokens'
  | 'ai_deck_remaining'
  | 'damage'
  | 'damage_tokens'
  | 'evasion'
  | 'evasion_tokens'
  | 'luck'
  | 'luck_tokens'
  | 'movement'
  | 'movement_tokens'
  | 'speed'
  | 'speed_tokens'
  | 'strength'
  | 'strength_tokens'
  | 'toughness'
  | 'toughness_tokens'
  | 'wounds'

/** Vignette Monster Column Update */
type VignetteMonsterColumnUpdate = Partial<
  Pick<
    VignetteEncounterMonsterDetail,
    VignetteMonsterNumericField | 'ai_card_drawn' | 'knocked_down' | 'notes'
  >
>

/** Vignette Monster Rule Catalog Item */
type VignetteMonsterRuleCatalogItem =
  | ({ type: 'mood' } & MoodDetail)
  | ({ type: 'trait' } & TraitDetail)
  | ({ type: 'survivor_status' } & SurvivorStatusDetail)

/** Vignette Monster Rule Detail */
type VignetteMonsterRuleDetail =
  | VignetteEncounterMonsterMoodDetail
  | VignetteEncounterMonsterTraitDetail
  | VignetteEncounterMonsterSurvivorStatusDetail

/** Vignette Monster Rule Catalog Detail */
type VignetteMonsterRuleCatalogDetail =
  | (MoodDetail & CatalogAuthorshipDetail)
  | (TraitDetail & CatalogAuthorshipDetail)
  | (SurvivorStatusDetail & CatalogAuthorshipDetail)

/**
 * Vignette Monster Card
 *
 * Displays and updates active vignette monster state from copied vignette
 * encounter tables.
 *
 * @param props Vignette Monster Card Properties
 * @returns Vignette Monster Card
 */
export function VignetteMonsterCard({
  selectedVignetteEncounter,
  setSelectedVignetteEncounter
}: VignetteMonsterCardProps): ReactElement {
  const monsters = useMemo(
    () =>
      Object.values(selectedVignetteEncounter.monsters).sort((a, b) =>
        (a.monster_name ?? '').localeCompare(b.monster_name ?? '')
      ),
    [selectedVignetteEncounter.monsters]
  )

  if (monsters.length === 0)
    return (
      <section className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        No active monsters are copied into this vignette.
      </section>
    )

  return (
    <section className="min-w-0 space-y-3">
      <h3 className="text-sm font-semibold">Monsters</h3>
      <div className="grid min-w-0 gap-3">
        {monsters.map((monster) => (
          <VignetteMonsterStateCard
            key={monster.id}
            encounter={selectedVignetteEncounter}
            monster={monster}
            setSelectedVignetteEncounter={setSelectedVignetteEncounter}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Vignette Monster State Card
 *
 * @param props Vignette Monster State Card Properties
 * @returns Vignette Monster State Card
 */
function VignetteMonsterStateCard({
  encounter,
  monster,
  setSelectedVignetteEncounter
}: {
  /** Selected Vignette Encounter */
  encounter: VignetteEncounterDetail
  /** Active Vignette Monster */
  monster: VignetteEncounterMonsterDetail
  /** Set Selected Vignette Encounter */
  setSelectedVignetteEncounter: VignetteEncounterStateSetter
}): ReactElement {
  const [notesDraft, setNotesDraft] = useState(monster.notes ?? '')
  const [isNotesDirty, setIsNotesDirty] = useState(false)
  const [lastMonsterId, setLastMonsterId] = useState(monster.id)
  const [lastPersistedNotes, setLastPersistedNotes] = useState(
    monster.notes ?? ''
  )

  if (lastMonsterId !== monster.id || lastPersistedNotes !== monster.notes) {
    setLastMonsterId(monster.id)
    setLastPersistedNotes(monster.notes ?? '')
    setNotesDraft(monster.notes ?? '')
    setIsNotesDirty(false)
  }

  const updateMonsterState = useCallback(
    (updatedMonster: VignetteEncounterMonsterDetail) => {
      setSelectedVignetteEncounter((prev) => {
        if (!prev?.monsters[monster.id]) return prev

        return {
          ...prev,
          monsters: {
            ...prev.monsters,
            [monster.id]: updatedMonster
          }
        }
      })
    },
    [monster.id, setSelectedVignetteEncounter]
  )

  const saveMonsterData = useCallback(
    (updateData: VignetteMonsterColumnUpdate, successMessage?: string) => {
      const previousMonster = monster
      const updatedMonster = { ...monster, ...updateData }
      updateMonsterState(updatedMonster)

      updateVignetteEncounterMonster({
        ...updateData,
        vignette_encounter_monster_id: monster.id
      })
        .then(() => {
          if (successMessage) toast.success(successMessage)
        })
        .catch((error: unknown) => {
          updateMonsterState(previousMonster)
          console.error('Vignette Monster Save Error:', error)
          toast.error(error instanceof Error ? error.message : ERROR_MESSAGE())
        })
    },
    [monster, updateMonsterState]
  )

  const saveNumericField = useCallback(
    (field: VignetteMonsterNumericField, value: number) => {
      saveMonsterData({ [field]: value })
    },
    [saveMonsterData]
  )

  const handleSaveNotes = useCallback(() => {
    setIsNotesDirty(false)
    saveMonsterData({ notes: notesDraft })
  }, [notesDraft, saveMonsterData])

  return (
    <Card className="w-full min-w-0 overflow-hidden border-2 rounded-xl p-0 gap-0 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="flex p-3 border-b bg-red-100/50 dark:bg-red-950/30">
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-200 dark:bg-red-800">
              <SkullIcon className="h-6 w-6 text-red-700 dark:text-red-300" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm font-semibold">
                {monster.monster_name ??
                  encounter.vignette_monster.monster_name}
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  Level {encounter.level_number}
                </Badge>
                {encounter.vignette_monster.multi_monster && (
                  <Badge variant="secondary" className="text-xs">
                    Multi-monster
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-start gap-3 sm:justify-end">
            <div className="flex items-center space-x-1">
              <Checkbox
                id={`vignette-monster-${monster.id}-ai-card-drawn`}
                checked={monster.ai_card_drawn}
                onCheckedChange={(checked) =>
                  saveMonsterData({ ai_card_drawn: !!checked })
                }
                className="h-4 w-4"
              />
              <Label
                htmlFor={`vignette-monster-${monster.id}-ai-card-drawn`}
                className="text-xs">
                AI Drawn
              </Label>
            </div>
            <div className="flex items-center space-x-1">
              <Checkbox
                id={`vignette-monster-${monster.id}-knocked-down`}
                checked={monster.knocked_down}
                onCheckedChange={(checked) =>
                  saveMonsterData({ knocked_down: !!checked })
                }
                className="h-4 w-4"
              />
              <Label
                htmlFor={`vignette-monster-${monster.id}-knocked-down`}
                className="text-xs">
                Knocked Down
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 p-2 py-0 mt-0">
        <div className="flex min-w-0 flex-col lg:flex-row lg:gap-2">
          <div className="flex w-full min-w-0 flex-1 flex-col lg:max-w-100">
            <VignetteMonsterBaseStats
              monster={monster}
              onNumericChange={saveNumericField}
            />
            <Separator className="my-1" />
            <VignetteMonsterAIDeckStats monster={monster} />
            <Separator className="my-1" />
            <VignetteMonsterAttributes
              monster={monster}
              onNumericChange={saveNumericField}
            />
          </div>
          <div className="hidden lg:flex lg:items-stretch">
            <Separator orientation="vertical" className="mx-2" />
          </div>
          <Separator className="my-2 lg:hidden" />
          <div className="flex min-w-0 flex-1 flex-col">
            <VignetteMonsterRuleLists
              monster={monster}
              updateMonsterState={updateMonsterState}
            />
            <Separator className="my-2" />
            <div className="flex flex-col gap-2 pb-2">
              <Textarea
                value={notesDraft}
                name={`vignette-monster-${monster.id}-notes`}
                id={`vignette-monster-${monster.id}-notes`}
                onChange={(event) => {
                  setNotesDraft(event.target.value)
                  setIsNotesDirty(event.target.value !== monster.notes)
                }}
                placeholder="Add notes about the vignette monster..."
                className="w-full resize-none"
                style={{ minHeight: '125px' }}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNotes}
                  disabled={!isNotesDirty}
                  title="Save vignette monster notes">
                  <CheckIcon className="h-4 w-4" /> Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Vignette Monster Base Stats
 *
 * @param props Vignette Monster Base Stats Properties
 * @returns Vignette Monster Base Stats
 */
function VignetteMonsterBaseStats({
  monster,
  onNumericChange
}: {
  /** Active Vignette Monster */
  monster: VignetteEncounterMonsterDetail
  /** Numeric Change Handler */
  onNumericChange: (field: VignetteMonsterNumericField, value: number) => void
}): ReactElement {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="min-w-0 rounded-lg bg-background/40 p-2 text-center">
        <div className="pb-1 text-xs text-muted-foreground">AI Deck</div>
        <NumericInput
          label="AI Deck Remaining"
          value={monster.ai_deck_remaining}
          onChange={(value) => onNumericChange('ai_deck_remaining', value)}
          min={0}
          className="border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <div className="min-w-0 rounded-lg bg-background/40 p-2 text-center">
        <div className="pb-1 text-xs text-muted-foreground">Wounds</div>
        <NumericInput
          label="Wounds"
          value={monster.wounds}
          onChange={(value) => onNumericChange('wounds', value)}
          min={0}
          className="border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <div className="min-w-0 rounded-lg bg-background/40 p-2 text-center">
        <div className="pb-1 text-xs text-muted-foreground">Toughness</div>
        <NumericInput
          label="Toughness"
          value={monster.toughness}
          onChange={(value) => onNumericChange('toughness', value)}
          min={0}
          className="border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  )
}

/**
 * Vignette Monster AI Deck Stats
 *
 * @param props Vignette Monster AI Deck Stats Properties
 * @returns Vignette Monster AI Deck Stats
 */
function VignetteMonsterAIDeckStats({
  monster
}: {
  /** Active Vignette Monster */
  monster: VignetteEncounterMonsterDetail
}): ReactElement {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 p-2 sm:grid-cols-4">
      <VignetteReadonlyStat label="Basic" value={monster.ai_deck.basic_cards} />
      <VignetteReadonlyStat
        label="Advanced"
        value={monster.ai_deck.advanced_cards}
      />
      <VignetteReadonlyStat
        label="Legendary"
        value={monster.ai_deck.legendary_cards}
      />
      <VignetteReadonlyStat
        label="Overtone"
        value={monster.ai_deck.overtone_cards}
      />
    </div>
  )
}

/**
 * Vignette Readonly Stat
 *
 * @param props Vignette Readonly Stat Properties
 * @returns Vignette Readonly Stat
 */
function VignetteReadonlyStat({
  label,
  value
}: {
  /** Stat Label */
  label: string
  /** Stat Value */
  value: number
}): ReactElement {
  return (
    <div className="min-w-0 rounded-md border bg-background/40 p-2 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium tabular-nums">{value}</div>
    </div>
  )
}

/**
 * Vignette Monster Attributes
 *
 * @param props Vignette Monster Attributes Properties
 * @returns Vignette Monster Attributes
 */
function VignetteMonsterAttributes({
  monster,
  onNumericChange
}: {
  /** Active Vignette Monster */
  monster: VignetteEncounterMonsterDetail
  /** Numeric Change Handler */
  onNumericChange: (field: VignetteMonsterNumericField, value: number) => void
}): ReactElement {
  return (
    <div className="min-w-0 p-2">
      <div className="flex min-w-0 flex-col gap-1">
        <div
          className={VIGNETTE_MONSTER_ATTRIBUTE_GRID_CLASS}
          style={VIGNETTE_MONSTER_ATTRIBUTE_GRID_STYLE}>
          <div></div>
          <Label className="min-w-0 justify-center text-xs">Base</Label>
          <Label className="min-w-0 justify-center text-xs">Tokens</Label>
          <Label className="min-w-0 justify-center text-xs">Total</Label>
        </div>

        <VignetteAttributeRow
          label="Damage"
          base={monster.damage}
          tokens={monster.damage_tokens}
          tokenField="damage_tokens"
          onNumericChange={onNumericChange}
        />
        <Separator className="my-1" />
        <VignetteAttributeRow
          label="Movement"
          base={monster.movement}
          baseField="movement"
          baseMin={1}
          tokens={monster.movement_tokens}
          tokenField="movement_tokens"
          onNumericChange={onNumericChange}
        />
        <VignetteAttributeRow
          label="Accuracy"
          base={monster.accuracy}
          tokens={monster.accuracy_tokens}
          tokenField="accuracy_tokens"
          onNumericChange={onNumericChange}
        />
        <VignetteAttributeRow
          label="Strength"
          base={monster.strength}
          tokens={monster.strength_tokens}
          tokenField="strength_tokens"
          onNumericChange={onNumericChange}
        />
        <VignetteAttributeRow
          label="Evasion"
          base={monster.evasion}
          tokens={monster.evasion_tokens}
          tokenField="evasion_tokens"
          onNumericChange={onNumericChange}
        />
        <VignetteAttributeRow
          label="Luck"
          base={monster.luck}
          tokens={monster.luck_tokens}
          tokenField="luck_tokens"
          onNumericChange={onNumericChange}
        />
        <VignetteAttributeRow
          label="Speed"
          base={monster.speed}
          baseField="speed"
          baseMin={1}
          tokens={monster.speed_tokens}
          tokenField="speed_tokens"
          onNumericChange={onNumericChange}
        />
      </div>
    </div>
  )
}

/**
 * Vignette Attribute Row
 *
 * @param props Vignette Attribute Row Properties
 * @returns Vignette Attribute Row
 */
function VignetteAttributeRow({
  base,
  baseField,
  baseMin,
  label,
  onNumericChange,
  tokenField,
  tokens
}: {
  /** Base Value */
  base: number
  /** Base Field */
  baseField?: VignetteMonsterNumericField
  /** Minimum Base Value */
  baseMin?: number
  /** Row Label */
  label: string
  /** Numeric Change Handler */
  onNumericChange: (field: VignetteMonsterNumericField, value: number) => void
  /** Token Field */
  tokenField: VignetteMonsterNumericField
  /** Token Value */
  tokens: number
}): ReactElement {
  return (
    <div
      className={VIGNETTE_MONSTER_ATTRIBUTE_GRID_CLASS}
      style={VIGNETTE_MONSTER_ATTRIBUTE_GRID_STYLE}>
      <Label className="min-w-0 truncate text-xs">{label}</Label>
      <NumericInput
        label={label}
        value={base}
        min={baseMin}
        onChange={
          baseField ? (value) => onNumericChange(baseField, value) : undefined
        }
        className={VIGNETTE_MONSTER_NUMERIC_INPUT_CLASS}
        disabled={!baseField}
      />
      <NumericInput
        label={`${label} Tokens`}
        value={tokens}
        onChange={(value) => onNumericChange(tokenField, value)}
        className={`${VIGNETTE_MONSTER_NUMERIC_INPUT_CLASS} bg-muted!`}
      />
      <NumericInput
        label={`${label} Total`}
        value={base + tokens}
        className={VIGNETTE_MONSTER_NUMERIC_INPUT_CLASS}
        disabled
      />
    </div>
  )
}

/**
 * Vignette Monster Rule Lists
 *
 * @param props Vignette Monster Rule Lists Properties
 * @returns Vignette Monster Rule Lists
 */
function VignetteMonsterRuleLists({
  monster,
  updateMonsterState
}: {
  /** Active Vignette Monster */
  monster: VignetteEncounterMonsterDetail
  /** Update Monster State */
  updateMonsterState: (monster: VignetteEncounterMonsterDetail) => void
}): ReactElement {
  const [availableTraits, setAvailableTraits] = useState<{
    [key: string]: TraitDetail
  }>({})
  const [availableMoods, setAvailableMoods] = useState<{
    [key: string]: MoodDetail
  }>({})
  const [availableStatuses, setAvailableStatuses] = useState<{
    [key: string]: SurvivorStatusDetail
  }>({})

  useEffect(() => {
    let isCancelled = false

    Promise.all([getTraits(), getMoods(), getSurvivorStatuses()])
      .then(([traits, moods, statuses]) => {
        if (isCancelled) return

        setAvailableTraits(traits)
        setAvailableMoods(moods)
        setAvailableStatuses(statuses)
      })
      .catch((error: unknown) => {
        console.error('Vignette Monster Rules Catalog Fetch Error:', error)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <>
      <VignetteMonsterRuleList
        title="Traits"
        type="trait"
        monster={monster}
        items={monster.traits}
        catalogItems={Object.values(availableTraits).map((trait) => ({
          ...trait,
          type: 'trait' as const
        }))}
        updateMonsterState={updateMonsterState}
      />
      <Separator className="my-2" />
      <VignetteMonsterRuleList
        title="Moods"
        type="mood"
        monster={monster}
        items={monster.moods}
        catalogItems={Object.values(availableMoods).map((mood) => ({
          ...mood,
          type: 'mood' as const
        }))}
        updateMonsterState={updateMonsterState}
      />
      <Separator className="my-2" />
      <VignetteMonsterRuleList
        title="Survivor Statuses"
        type="survivor_status"
        monster={monster}
        items={monster.survivor_statuses}
        catalogItems={Object.values(availableStatuses).map((status) => ({
          ...status,
          type: 'survivor_status' as const
        }))}
        updateMonsterState={updateMonsterState}
      />
    </>
  )
}

/**
 * Vignette Monster Rule List
 *
 * @param props Vignette Monster Rule List Properties
 * @returns Vignette Monster Rule List
 */
function VignetteMonsterRuleList({
  catalogItems,
  items,
  monster,
  title,
  type,
  updateMonsterState
}: {
  /** Catalog Items */
  catalogItems: VignetteMonsterRuleCatalogItem[]
  /** Active Rule Items */
  items: VignetteMonsterRuleDetail[]
  /** Active Vignette Monster */
  monster: VignetteEncounterMonsterDetail
  /** Rule List Title */
  title: string
  /** Rule Type */
  type: VignetteMonsterRuleType
  /** Update Monster State */
  updateMonsterState: (monster: VignetteEncounterMonsterDetail) => void
}): ReactElement {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const selectedCatalogIds = new Set(
    items.map((item) => ruleCatalogId(type, item))
  )
  const selectableItems = catalogItems
    .filter((item) => !selectedCatalogIds.has(item.id))
    .sort((a, b) => ruleName(a).localeCompare(ruleName(b)))

  const handleAdd = useCallback(
    (item: VignetteMonsterRuleCatalogItem) => {
      const previousMonster = monster
      const optimisticId = `optimistic-${type}-${item.id}`
      const optimisticItem = ruleDetail(type, monster.id, optimisticId, item)
      updateMonsterState(
        ruleItemsForType(type, monster, [...items, optimisticItem])
      )
      setIsPickerOpen(false)

      addRule(type, monster.id, item.id)
        .then((createdId) => {
          updateMonsterState(
            ruleItemsForType(
              type,
              {
                ...monster,
                [ruleCollectionName(type)]: [...items, optimisticItem]
              },
              [...items, { ...optimisticItem, id: createdId }]
            )
          )
        })
        .catch((error: unknown) => {
          updateMonsterState(previousMonster)
          console.error('Vignette Monster Rule Add Error:', error)
          toast.error(error instanceof Error ? error.message : ERROR_MESSAGE())
        })
    },
    [items, monster, type, updateMonsterState]
  )

  const handleRemove = useCallback(
    (item: VignetteMonsterRuleDetail) => {
      const previousMonster = monster
      const updatedItems = items.filter(
        (currentItem) => currentItem.id !== item.id
      )
      updateMonsterState(ruleItemsForType(type, monster, updatedItems))

      removeRule(type, item.id).catch((error: unknown) => {
        updateMonsterState(previousMonster)
        console.error('Vignette Monster Rule Remove Error:', error)
        toast.error(error instanceof Error ? error.message : ERROR_MESSAGE())
      })
    },
    [items, monster, type, updateMonsterState]
  )

  return (
    <div className="min-w-0">
      <div className="mb-2 lg:mt-2">
        <div className="flex items-center justify-between">
          <Label className="flex-1 text-center text-sm font-semibold text-muted-foreground">
            {title}
          </Label>
          <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 w-6 border-0"
                disabled={selectableItems.length === 0}
                aria-label={`Add ${title.toLowerCase()}`}
                title={`Add ${title.toLowerCase()}`}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
              <Command>
                <CommandInput
                  placeholder={`Search ${title.toLowerCase()}...`}
                />
                <CommandList>
                  <CommandEmpty>No {title.toLowerCase()} found.</CommandEmpty>
                  <CommandGroup>
                    {selectableItems.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        keywords={[ruleName(item)]}
                        onSelect={() => handleAdd(item)}>
                        {ruleName(item)}
                        {item.custom && (
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
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        {items.length > 0 ? (
          items.map((item) => {
            const catalogItem = ruleCatalogItem(type, item)

            return (
              <div key={item.id} className="flex min-w-0 items-center gap-2">
                <CustomRulesText
                  className="min-w-0 grow"
                  custom={catalogItem.custom}
                  label={ruleName(catalogItem)}
                  title={ruleName(catalogItem)}
                  sections={[{ label: 'Rules', content: catalogItem.rules }]}
                  showCustomBadge
                  authorUserId={catalogItem.author_user_id}
                  authorUsername={catalogItem.author_username}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => handleRemove(item)}
                  aria-label={`Remove ${ruleName(catalogItem)}`}
                  title={`Remove ${ruleName(catalogItem)}`}>
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            )
          })
        ) : (
          <p className="text-xs text-muted-foreground">None.</p>
        )}
      </div>
    </div>
  )
}

/**
 * Rule Collection Name
 *
 * @param type Vignette Monster Rule Type
 * @returns Rule Collection Name
 */
function ruleCollectionName(
  type: VignetteMonsterRuleType
): 'moods' | 'traits' | 'survivor_statuses' {
  if (type === 'mood') return 'moods'
  if (type === 'trait') return 'traits'
  return 'survivor_statuses'
}

/**
 * Rule Items For Type
 *
 * @param type Vignette Monster Rule Type
 * @param monster Active Vignette Monster
 * @param items Updated Rule Items
 * @returns Updated Active Vignette Monster
 */
function ruleItemsForType(
  type: VignetteMonsterRuleType,
  monster: VignetteEncounterMonsterDetail,
  items: VignetteMonsterRuleDetail[]
): VignetteEncounterMonsterDetail {
  if (type === 'mood')
    return { ...monster, moods: items as VignetteEncounterMonsterMoodDetail[] }
  if (type === 'trait')
    return {
      ...monster,
      traits: items as VignetteEncounterMonsterTraitDetail[]
    }
  return {
    ...monster,
    survivor_statuses: items as VignetteEncounterMonsterSurvivorStatusDetail[]
  }
}

/**
 * Rule Detail
 *
 * @param type Vignette Monster Rule Type
 * @param monsterId Active Monster ID
 * @param id Active Rule Row ID
 * @param item Catalog Item
 * @returns Active Rule Detail
 */
function ruleDetail(
  type: VignetteMonsterRuleType,
  monsterId: string,
  id: string,
  item: VignetteMonsterRuleCatalogItem
): VignetteMonsterRuleDetail {
  if (type === 'mood' && item.type === 'mood')
    return {
      id,
      mood_id: item.id,
      source_vignette_monster_level_mood_id: null,
      vignette_encounter_monster_id: monsterId,
      mood: {
        ...item,
        author_user_id: null,
        author_username: null,
        author_avatar_url: null
      }
    }

  if (type === 'trait' && item.type === 'trait')
    return {
      id,
      source_vignette_monster_level_trait_id: null,
      trait_id: item.id,
      vignette_encounter_monster_id: monsterId,
      trait: {
        ...item,
        author_user_id: null,
        author_username: null,
        author_avatar_url: null
      }
    }

  if (type === 'survivor_status' && item.type === 'survivor_status')
    return {
      id,
      source_vignette_monster_level_survivor_status_id: null,
      survivor_status_id: item.id,
      vignette_encounter_monster_id: monsterId,
      survivor_status: {
        ...item,
        author_user_id: null,
        author_username: null,
        author_avatar_url: null
      }
    }

  throw new Error(`Invalid vignette monster rule type: ${type}`)
}

/**
 * Rule Catalog Item
 *
 * @param type Vignette Monster Rule Type
 * @param item Rule Detail
 * @returns Rule Catalog Item
 */
function ruleCatalogItem(
  type: VignetteMonsterRuleType,
  item: VignetteMonsterRuleDetail
): VignetteMonsterRuleCatalogDetail {
  if (type === 'mood' && 'mood' in item) return item.mood
  if (type === 'trait' && 'trait' in item) return item.trait
  if (type === 'survivor_status' && 'survivor_status' in item)
    return item.survivor_status

  throw new Error(`Invalid vignette monster rule item: ${type}`)
}

/**
 * Rule Catalog ID
 *
 * @param type Vignette Monster Rule Type
 * @param item Rule Detail
 * @returns Rule Catalog ID
 */
function ruleCatalogId(
  type: VignetteMonsterRuleType,
  item: VignetteMonsterRuleDetail
): string {
  if (type === 'mood' && 'mood_id' in item) return item.mood_id
  if (type === 'trait' && 'trait_id' in item) return item.trait_id
  if (type === 'survivor_status' && 'survivor_status_id' in item)
    return item.survivor_status_id

  throw new Error(`Invalid vignette monster rule item: ${type}`)
}

/**
 * Rule Name
 *
 * @param item Rule Catalog Item
 * @returns Rule Name
 */
function ruleName(
  item: TraitDetail | MoodDetail | SurvivorStatusDetail
): string {
  if ('trait_name' in item) return item.trait_name
  if ('mood_name' in item) return item.mood_name
  return item.survivor_status_name
}

/**
 * Add Rule
 *
 * @param type Vignette Monster Rule Type
 * @param monsterId Active Monster ID
 * @param catalogId Catalog ID
 * @returns Created Row ID
 */
function addRule(
  type: VignetteMonsterRuleType,
  monsterId: string,
  catalogId: string
): Promise<string> {
  if (type === 'mood')
    return addVignetteEncounterMonsterMood({
      mood_id: catalogId,
      source_vignette_monster_level_mood_id: null,
      vignette_encounter_monster_id: monsterId
    })

  if (type === 'trait')
    return addVignetteEncounterMonsterTrait({
      source_vignette_monster_level_trait_id: null,
      trait_id: catalogId,
      vignette_encounter_monster_id: monsterId
    })

  return addVignetteEncounterMonsterSurvivorStatus({
    source_vignette_monster_level_survivor_status_id: null,
    survivor_status_id: catalogId,
    vignette_encounter_monster_id: monsterId
  })
}

/**
 * Remove Rule
 *
 * @param type Vignette Monster Rule Type
 * @param id Active Rule Row ID
 * @returns Remove Rule Promise
 */
function removeRule(type: VignetteMonsterRuleType, id: string): Promise<void> {
  if (type === 'mood') return removeVignetteEncounterMonsterMood({ id })
  if (type === 'trait') return removeVignetteEncounterMonsterTrait({ id })
  return removeVignetteEncounterMonsterSurvivorStatus({ id })
}
