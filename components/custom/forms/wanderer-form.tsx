'use client'

import { MultiSelectDropdown } from '@/components/generic/multi-select-dropdown'
import { NumericInput } from '@/components/menu/numeric-input'
import { Badge } from '@/components/ui/badge'
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
  addWanderer,
  getCustomWanderers,
  updateWanderer
} from '@/lib/dal/wanderer'
import { setWandererAbilityImpairments } from '@/lib/dal/wanderer-ability-impairment'
import {
  addWandererTimelineYear,
  getWandererTimelineYears,
  removeWandererTimelineYear,
  updateWandererTimelineYear
} from '@/lib/dal/wanderer-timeline-year'
import { Enums } from '@/lib/database.types'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  WANDERER_CREATED_MESSAGE,
  WANDERER_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  AbilityImpairmentDetail,
  FightingArtDetail,
  GearDetail
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowLeftIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

/**
 * Attribute Field Definition
 */
interface StatField {
  /** Accessor Key */
  key: string
  /** Display Label */
  label: string
  /** Minimum Value (optional) */
  min?: number
  /** Maximum Value (optional) */
  max?: number
}

/**
 * Core Attributes
 */
const CORE_ATTRIBUTES: StatField[] = [
  // Movement must be at least 1 — survivors created from this wanderer are
  // validated against the `NewSurvivorInputSchema` which enforces the same.
  { key: 'movement', label: 'Movement', min: 1 },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'strength', label: 'Strength' },
  { key: 'evasion', label: 'Evasion' },
  { key: 'luck', label: 'Luck' },
  { key: 'speed', label: 'Speed' }
]

/**
 * Secondary Attributes
 */
const SECONDARY_ATTRIBUTES: StatField[] = [
  { key: 'survival', label: 'Survival', min: 0 },
  { key: 'insanity', label: 'Insanity', min: 0 },
  { key: 'courage', label: 'Courage', min: 0, max: 9 },
  { key: 'understanding', label: 'Understanding', min: 0, max: 9 },
  { key: 'lumi', label: 'Lumi', min: 0 },
  { key: 'systemic_pressure', label: 'Systemic Pressure' },
  { key: 'torment', label: 'Torment' },
  { key: 'disposition', label: 'Disposition' }
]

/**
 * Wanderer Form Component Properties
 */
interface WandererFormProps {
  /** Local State */
  local: LocalStateType
  /** Form Mode */
  mode: 'create' | 'edit'
  /** Wanderer ID (Edit Only) */
  wandererId: string | null
  /** Available Fighting Arts */
  availableFightingArts: { [key: string]: FightingArtDetail }
  /** Available Gear */
  availableGear: { [key: string]: GearDetail }
  /** Available Abilities/Impairments */
  availableAbilityImpairments: { [key: string]: AbilityImpairmentDetail }
  /** On Done Callback */
  onDone: () => void
  /** On Cancel Callback */
  onCancel: () => void
}

/**
 * Wanderer Form
 *
 * Form component for creating and editing custom wanderers. Supports setting
 * basic info, core and secondary attributes, fighting arts, rare gear,
 * abilities/impairments, and timeline entries. Handles both create and edit
 * modes with appropriate data loading and saving logic.
 *
 * @param props Wanderer Form Component Properties
 * @returns Wanderer Form Component
 */
export function WandererForm({
  local,
  mode,
  wandererId,
  availableFightingArts,
  availableGear,
  availableAbilityImpairments,
  onDone,
  onCancel
}: WandererFormProps): ReactElement {
  const { toast } = useToast(local)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEdit, setIsLoadingEdit] = useState(mode === 'edit')

  // Basic info
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Enums<'gender'>>('FEMALE')
  const [arc, setArc] = useState(false)

  // Core attributes
  const [attributes, setAttributes] = useState<{ [key: string]: number }>({
    // Movement defaults to 5 to match the survivor schema's minimum and the
    // baseline KDM survivor statline. A 0 here would make the created
    // survivor fail validation downstream.
    movement: 5,
    accuracy: 0,
    strength: 0,
    evasion: 0,
    luck: 0,
    speed: 0,
    survival: 0,
    insanity: 0,
    hunt_xp: 0,
    courage: 0,
    understanding: 0,
    lumi: 0,
    systemic_pressure: 0,
    torment: 0,
    disposition: 0
  })

  // Arrays
  const [fightingArtIds, setFightingArtIds] = useState<string[]>([])
  const [rareGearIds, setRareGearIds] = useState<string[]>([])
  const [abilityImpairmentIds, setAbilityImpairmentIds] = useState<string[]>([])
  const [huntXpRankUp, setHuntXpRankUp] = useState<number[]>([])

  // Timeline
  const [timelineEntries, setTimelineEntries] = useState<
    { id: string | null; entries: string[]; year_number: number }[]
  >([])
  const [deletedTimelineIds, setDeletedTimelineIds] = useState<string[]>([])

  const nameInputRef = useRef<HTMLInputElement>(null)

  /** Sorted fighting arts for selection */
  const sortedFightingArts = useMemo(
    () =>
      Object.values(availableFightingArts).sort((a, b) =>
        a.fighting_art_name.localeCompare(b.fighting_art_name)
      ),
    [availableFightingArts]
  )

  /** Sorted gear for selection */
  const sortedGear = useMemo(
    () =>
      Object.values(availableGear).sort((a, b) =>
        a.gear_name.localeCompare(b.gear_name)
      ),
    [availableGear]
  )

  /** Sorted abilities/impairments for selection */
  const sortedAbilityImpairments = useMemo(
    () =>
      Object.values(availableAbilityImpairments).sort((a, b) =>
        a.ability_impairment_name.localeCompare(b.ability_impairment_name)
      ),
    [availableAbilityImpairments]
  )

  // Load existing wanderer data for edit mode
  useEffect(() => {
    if (mode !== 'edit' || !wandererId) return

    let cancelled = false

    Promise.all([getCustomWanderers(), getWandererTimelineYears(wandererId)])
      .then(([wandererData, timelineData]) => {
        if (cancelled) return

        const w = wandererData[wandererId]
        if (!w) {
          toast.error(ERROR_MESSAGE())
          onCancel()
          return
        }

        setName(w.wanderer_name)
        setGender(w.gender)
        setArc(w.arc)
        setAttributes({
          movement: w.movement,
          accuracy: w.accuracy,
          strength: w.strength,
          evasion: w.evasion,
          luck: w.luck,
          speed: w.speed,
          survival: w.survival,
          insanity: w.insanity,
          hunt_xp: w.hunt_xp,
          courage: w.courage,
          understanding: w.understanding,
          lumi: w.lumi,
          systemic_pressure: w.systemic_pressure,
          torment: w.torment,
          disposition: w.disposition
        })
        setFightingArtIds([...w.fighting_art_ids])
        setRareGearIds([...w.rare_gear_ids])
        setAbilityImpairmentIds(w.abilities_impairments.map((ai) => ai.id))
        setHuntXpRankUp([...w.hunt_xp_rank_up])

        const sorted = Object.values(timelineData).sort(
          (a, b) => a.year_number - b.year_number
        )
        setTimelineEntries(sorted)

        setIsLoadingEdit(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        console.error('Load Wanderer Error:', err)
        toast.error(ERROR_MESSAGE())
        onCancel()
      })

    return () => {
      cancelled = true
    }
  }, [mode, wandererId, toast, onCancel])

  useEffect(() => {
    if (!isLoadingEdit && mode === 'create') nameInputRef.current?.focus()
  }, [isLoadingEdit, mode])

  /** Update a single attribute value */
  const updateAttribute = useCallback((key: string, value: number) => {
    setAttributes((prev) => ({ ...prev, [key]: value }))
  }, [])

  /** Toggle a fighting art ID */
  const toggleFightingArt = useCallback((id: string) => {
    setFightingArtIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  /** Toggle a rare gear ID */
  const toggleRareGear = useCallback((id: string) => {
    setRareGearIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  /** Toggle an ability/impairment ID */
  const toggleAbilityImpairment = useCallback((id: string) => {
    setAbilityImpairmentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  // Timeline helpers
  const addTimelineYear = useCallback(() => {
    setTimelineEntries((prev) => [
      ...prev,
      { id: null, year_number: 0, entries: [] }
    ])
  }, [])

  const removeTimelineYear = useCallback(
    (index: number) => {
      const entry = timelineEntries[index]
      if (entry.id) setDeletedTimelineIds((prev) => [...prev, entry.id!])
      setTimelineEntries((prev) => prev.filter((_, i) => i !== index))
    },
    [timelineEntries]
  )

  const updateTimelineYearNumber = useCallback(
    (index: number, yearNumber: number) => {
      setTimelineEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, yearNumber } : e))
      )
    },
    []
  )

  const addTimelineEntry = useCallback((yearIndex: number) => {
    setTimelineEntries((prev) =>
      prev.map((e, i) =>
        i === yearIndex ? { ...e, entries: [...e.entries, ''] } : e
      )
    )
  }, [])

  const removeTimelineEntry = useCallback(
    (yearIndex: number, entryIndex: number) => {
      setTimelineEntries((prev) =>
        prev.map((e, i) =>
          i === yearIndex
            ? { ...e, entries: e.entries.filter((_, j) => j !== entryIndex) }
            : e
        )
      )
    },
    []
  )

  const updateTimelineEntry = useCallback(
    (yearIndex: number, entryIndex: number, value: string) => {
      setTimelineEntries((prev) =>
        prev.map((e, i) =>
          i === yearIndex
            ? {
                ...e,
                entries: e.entries.map((v, j) => (j === entryIndex ? value : v))
              }
            : e
        )
      )
    },
    []
  )

  /** Save handler */
  const handleSave = useCallback(async () => {
    if (!name.trim())
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('wanderer'))

    setIsSaving(true)

    try {
      const wandererData = {
        wanderer_name: name.trim(),
        gender,
        arc,
        ...attributes,
        fighting_art_ids: fightingArtIds,
        rare_gear_ids: rareGearIds,
        permanent_injuries: [], // Not currently supported, but leaving the field in place for future use
        hunt_xp_rank_up: huntXpRankUp
      }

      if (mode === 'create') {
        const created = await addWanderer({
          custom: true,
          ...wandererData
        })

        await setWandererAbilityImpairments(created.id, abilityImpairmentIds)

        // Save timeline entries
        for (const te of timelineEntries) {
          const validEntries = te.entries.filter((e) => e.trim())
          if (validEntries.length === 0) continue
          await addWandererTimelineYear({
            wanderer_id: created.id,
            year_number: te.year_number,
            entries: validEntries
          })
        }

        toast.success(WANDERER_CREATED_MESSAGE())
      } else if (wandererId) {
        await updateWanderer(wandererId, wandererData)

        await setWandererAbilityImpairments(wandererId, abilityImpairmentIds)

        // Delete removed timeline years
        for (const id of deletedTimelineIds) {
          await removeWandererTimelineYear(id)
        }

        // Update/create timeline entries
        for (const te of timelineEntries) {
          const validEntries = te.entries.filter((e) => e.trim())

          if (te.id) {
            if (validEntries.length === 0)
              await removeWandererTimelineYear(te.id)
            else
              await updateWandererTimelineYear(te.id, {
                year_number: te.year_number,
                entries: validEntries
              })
          } else if (validEntries.length > 0) {
            await addWandererTimelineYear({
              wanderer_id: wandererId,
              year_number: te.year_number,
              entries: validEntries
            })
          }
        }

        toast.success(WANDERER_UPDATED_MESSAGE())
      }

      onDone()
    } catch (err: unknown) {
      console.error('Save Wanderer Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsSaving(false)
    }
  }, [
    name,
    gender,
    arc,
    attributes,
    fightingArtIds,
    rareGearIds,
    abilityImpairmentIds,
    huntXpRankUp,
    timelineEntries,
    deletedTimelineIds,
    mode,
    wandererId,
    toast,
    onDone
  ])

  if (isLoadingEdit)
    return (
      <Card className="p-0 border gap-0">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Peering into the darkness...
          </p>
        </CardContent>
      </Card>
    )

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isSaving}
            aria-label="Cancel"
            title="Cancel">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <span>{mode === 'create' ? 'Create Wanderer' : 'Edit Wanderer'}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Row 1: Name, Gender, Hunt XP, Arc */}
        <div className="flex flex-wrap items-end gap-3 justify-between">
          <div className="space-y-1 w-full sm:w-auto sm:min-w-40">
            <Label htmlFor="wanderer-name">Name</Label>
            <Input
              ref={nameInputRef}
              id="wanderer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Wanderer name"
              aria-label="Wanderer name"
            />
          </div>
          <div className="space-y-1 w-25">
            <Label htmlFor="wanderer-gender">Gender</Label>
            <Select
              value={gender}
              onValueChange={(v) => setGender(v as Enums<'gender'>)}>
              <SelectTrigger id="wanderer-gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="MALE">Male</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 pb-0.5">
            <Label className="text-xs text-muted-foreground">
              Hunt XP (right-click for milestones)
            </Label>
            <div className="flex items-center gap-0.5 flex-wrap">
              {Array.from({ length: 16 }, (_, i) => {
                const checked = attributes.hunt_xp > i
                const isRankUp = huntXpRankUp.includes(i)
                const isRetirement = i === 15
                const disabled = i > attributes.hunt_xp

                return (
                  <Checkbox
                    key={i}
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(c) => {
                      const newXp = c ? i + 1 : i
                      updateAttribute('hunt_xp', newXp)
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      if (huntXpRankUp.includes(i)) {
                        setHuntXpRankUp((prev) =>
                          prev.filter((x) => x !== i).sort((a, b) => a - b)
                        )
                      } else {
                        setHuntXpRankUp((prev) =>
                          [...prev, i].sort((a, b) => a - b)
                        )
                      }
                    }}
                    className={cn(
                      'h-4 w-4 rounded-sm',
                      !checked && isRankUp && 'border-2 border-primary',
                      !checked && isRetirement && 'border-4 border-primary'
                    )}
                  />
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <Checkbox
              id="wanderer-arc"
              checked={arc}
              onCheckedChange={(c) => setArc(c === true)}
            />
            <Label
              htmlFor="wanderer-arc"
              className="text-sm font-normal cursor-pointer">
              Arc
            </Label>
          </div>
        </div>

        <Separator />

        {/* Row 2: Core + Secondary Attributes side-by-side */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Core Attributes */}
          <div className="space-y-2 md:w-1/2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Core
            </h5>
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-3 gap-1">
              {CORE_ATTRIBUTES.map((s) => (
                <div key={s.key} className="flex flex-col items-center gap-0.5">
                  <Label className="text-[10px] text-muted-foreground">
                    {s.label}
                  </Label>
                  <NumericInput
                    className="w-12 h-9 text-center text-sm"
                    label={s.label}
                    min={s.min}
                    value={attributes[s.key]}
                    onChange={(v) => updateAttribute(s.key, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Attributes */}
          <div className="space-y-2 md:w-1/2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Secondary
            </h5>
            <div className="grid grid-cols-2 gap-1">
              {SECONDARY_ATTRIBUTES.map((s) => (
                <div key={s.key} className="flex items-center gap-1">
                  <Label className="text-[10px] w-20 shrink-0 truncate">
                    {s.label}
                  </Label>
                  <NumericInput
                    className="w-14 h-8 text-sm"
                    label={s.label}
                    min={s.min}
                    value={attributes[s.key]}
                    onChange={(v) => updateAttribute(s.key, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Row 3: Fighting Arts + Rare Gear + Abilities side-by-side */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Fighting Arts */}
          <div className="space-y-2 md:w-1/3">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Fighting Arts
            </h5>
            <MultiSelectDropdown
              items={sortedFightingArts.map((fa) => ({
                id: fa.id,
                name: fa.fighting_art_name,
                custom: fa.custom
              }))}
              selectedIds={fightingArtIds}
              onToggle={toggleFightingArt}
              placeholder="Search..."
              emptyMessage="No fighting arts found."
              triggerLabel={
                fightingArtIds.length > 0
                  ? `${fightingArtIds.length} selected`
                  : 'Select...'
              }
            />
            {fightingArtIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {fightingArtIds.map((id) => (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {availableFightingArts[id]?.fighting_art_name ?? id}
                    <button
                      type="button"
                      className="ml-1 hover:text-destructive"
                      onClick={() => toggleFightingArt(id)}>
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Rare Gear */}
          <div className="space-y-2 md:w-1/3">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Rare Gear
            </h5>
            <MultiSelectDropdown
              items={sortedGear.map((g) => ({
                id: g.id,
                name: g.gear_name,
                custom: g.custom
              }))}
              selectedIds={rareGearIds}
              onToggle={toggleRareGear}
              placeholder="Search..."
              emptyMessage="No gear found."
              triggerLabel={
                rareGearIds.length > 0
                  ? `${rareGearIds.length} selected`
                  : 'Select...'
              }
            />
            {rareGearIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {rareGearIds.map((id) => (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {availableGear[id]?.gear_name ?? id}
                    <button
                      type="button"
                      className="ml-1 hover:text-destructive"
                      onClick={() => toggleRareGear(id)}>
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Abilities & Impairments */}
          <div className="space-y-2 md:w-1/3">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Abilities & Impairments
            </h5>
            <MultiSelectDropdown
              items={sortedAbilityImpairments.map((a) => ({
                id: a.id,
                name: a.ability_impairment_name,
                custom: a.custom
              }))}
              selectedIds={abilityImpairmentIds}
              onToggle={toggleAbilityImpairment}
              placeholder="Search..."
              emptyMessage="No abilities or impairments found."
              triggerLabel={
                abilityImpairmentIds.length > 0
                  ? `${abilityImpairmentIds.length} selected`
                  : 'Select...'
              }
            />
            {abilityImpairmentIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {abilityImpairmentIds.map((id) => (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {availableAbilityImpairments[id]?.ability_impairment_name ??
                      id}
                    <button
                      type="button"
                      className="ml-1 hover:text-destructive"
                      onClick={() => toggleAbilityImpairment(id)}>
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Row 4: Timeline */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold">Timeline</h5>
            <Button variant="outline" size="sm" onClick={addTimelineYear}>
              <PlusIcon className="h-3 w-3 mr-1" />
              Add Year
            </Button>
          </div>
          {timelineEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No timeline entries defined.
            </p>
          ) : (
            <div className="space-y-3">
              {timelineEntries.map((te, teIdx) => (
                <div key={teIdx} className="rounded-md border p-3">
                  <div className="flex items-start gap-2">
                    {/* Year label + number + delete (fixed left column) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Label className="text-xs shrink-0">Year</Label>
                      <NumericInput
                        className="w-16 h-8"
                        label="Year number"
                        min={0}
                        max={50}
                        value={te.year_number}
                        onChange={(v) => updateTimelineYearNumber(teIdx, v)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeTimelineYear(teIdx)}
                        aria-label="Remove timeline year"
                        title="Remove year">
                        <Trash2Icon className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Entries (right column, grows to fill) */}
                    <div className="flex-1 space-y-1 min-w-0">
                      {te.entries.map((entry, eIdx) => (
                        <div key={eIdx} className="flex items-center gap-1">
                          <Input
                            className="h-8 text-sm"
                            value={entry}
                            onChange={(e) =>
                              updateTimelineEntry(teIdx, eIdx, e.target.value)
                            }
                            placeholder="Timeline entry"
                            aria-label={`Year ${te.year_number} entry ${eIdx + 1}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => removeTimelineEntry(teIdx, eIdx)}
                            aria-label="Remove timeline entry"
                            title="Remove entry">
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => addTimelineEntry(teIdx)}>
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

        {/* Save / Cancel */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? 'Saving...'
              : mode === 'create'
                ? 'Create Wanderer'
                : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
