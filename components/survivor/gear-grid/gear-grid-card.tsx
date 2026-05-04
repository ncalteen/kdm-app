'use client'

import { GearGridCell } from '@/components/survivor/gear-grid/gear-grid-cell'
import {
  GearCandidate,
  GearGridPickerDialog
} from '@/components/survivor/gear-grid/gear-grid-picker-dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { LocalStateType } from '@/contexts/local-context'
import { useCatalogFetch } from '@/hooks/use-catalog-fetch'
import { useToast } from '@/hooks/use-toast'
import { getArmorSets } from '@/lib/dal/armor-set'
import { getGear } from '@/lib/dal/gear'
import {
  applyGearGridSlot,
  POSITION_TO_COLUMN,
  setGearGridSlot
} from '@/lib/dal/gear-grid'
import {
  AFFINITIES,
  Affinity,
  computeAffinityCounts,
  EffectiveArmorSetBonus,
  getEffectiveArmorSetBonuses,
  getEquippedGearIds,
  GRID_POSITIONS
} from '@/lib/gear-grid'
import {
  ERROR_MESSAGE,
  GEAR_GRID_SETTLEMENT_REQUIRED_ERROR_MESSAGE,
  GEAR_GRID_SLOT_CLEARED_MESSAGE,
  GEAR_GRID_SLOT_EQUIPPED_MESSAGE
} from '@/lib/messages'
import {
  ArmorSetDetail,
  GearDetail,
  GearGridDetail,
  GearGridPosition,
  SettlementDetail,
  SurvivorDetail,
  SurvivorsStateSetter
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { ShieldCheckIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/** Display label for each grid position. */
const POSITION_LABELS: { [key in GearGridPosition]: string } = {
  top_left: 'Top Left',
  top_center: 'Top Center',
  top_right: 'Top Right',
  mid_left: 'Middle Left',
  mid_center: 'Middle Center',
  mid_right: 'Middle Right',
  bottom_left: 'Bottom Left',
  bottom_center: 'Bottom Center',
  bottom_right: 'Bottom Right'
}

/** Tailwind background color classes for affinity totals. */
const AFFINITY_BG: { [key in Affinity]: string } = {
  BLUE: 'bg-blue-500',
  GREEN: 'bg-green-500',
  RED: 'bg-red-500'
}

/**
 * Gear Grid Card Component Properties
 */
interface GearGridCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Gear Grid Card Component
 *
 * Renders the survivor's 3x3 gear grid alongside the running totals of
 * matched affinity colors. Each slot can be equipped, replaced, or cleared
 * via a picker dialog seeded from the settlement's gear stock. Validation
 * (item must exist in stock, total equipped across all survivors cannot
 * exceed the settlement's quantity) is handled both client-side (the picker
 * disables exhausted candidates) and server-side (the
 * `validate_gear_grid_positions` trigger). UI updates are optimistic and
 * roll back on database failure.
 *
 * @param props Gear Grid Card Component Properties
 * @returns Gear Grid Card Component
 */
export function GearGridCard({
  local,
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: GearGridCardProps): ReactElement {
  const { toast } = useToast(local)

  const [pickerSlot, setPickerSlot] = useState<GearGridPosition | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeBonus, setActiveBonus] = useState<EffectiveArmorSetBonus | null>(
    null
  )

  // Lazily fetch the gear catalog so we can render full GearDetail content in
  // each cell. The settlement's gear list only carries id+name+quantity, but
  // cells need affinity slots, stats, keywords, etc.
  const { data: gearMap } = useCatalogFetch<{ [key: string]: GearDetail }>(
    selectedSettlement?.id,
    () => getGear(),
    {
      initial: {},
      errorContext: 'Gear Grid Catalog Fetch Error',
      onError: () => toast.error(ERROR_MESSAGE())
    }
  )

  // Lazily fetch the armor set catalog so qualifying bonuses can be displayed
  // alongside the grid. Built-in sets, owned custom sets, and shared custom
  // sets are all covered by `getArmorSets`.
  const { data: armorSets } = useCatalogFetch<ArmorSetDetail[]>(
    selectedSettlement?.id,
    () => getArmorSets(),
    {
      initial: [],
      errorContext: 'Armor Set Catalog Fetch Error',
      onError: () => toast.error(ERROR_MESSAGE())
    }
  )

  const grid = selectedSurvivor?.gear_grid ?? null

  /**
   * Equipped Counts
   *
   * Map of gear ID → number of grid slots that piece occupies across every
   * survivor in the settlement (including the current survivor). Used to derive
   * the per-candidate `remaining` value the picker shows.
   */
  const equippedCounts = useMemo(() => {
    const counts: { [gearId: string]: number } = {}

    for (const survivor of survivors) {
      const g = survivor.gear_grid
      if (!g) continue

      for (const position of GRID_POSITIONS) {
        const column = POSITION_TO_COLUMN[position]
        const value = g[column]

        if (typeof value === 'string') counts[value] = (counts[value] ?? 0) + 1
      }
    }

    return counts
  }, [survivors])

  /** Pre-computed list of candidates the picker will display. */
  const candidates = useMemo<GearCandidate[]>(
    () =>
      (selectedSettlement?.gear ?? []).map((g) => ({
        gear_id: g.gear_id,
        gear_name: g.gear_name,
        quantity: g.quantity,
        remaining: g.quantity - (equippedCounts[g.gear_id] ?? 0),
        custom: g.custom
      })),
    [selectedSettlement?.gear, equippedCounts]
  )

  /** Affinity totals derived from the current grid and gear catalog. */
  const affinityCounts = useMemo(
    () => computeAffinityCounts(grid, gearMap),
    [grid, gearMap]
  )

  /**
   * Effective Armor Set Bonuses
   *
   * Catalog armor sets the survivor's grid currently qualifies for. When no
   * catalog set qualifies but the grid still has three pieces of armor in
   * different locations, the synthetic Clothed & Satiated fallback is surfaced
   * as the sole entry.
   */
  const effectiveBonuses = useMemo(
    () => getEffectiveArmorSetBonuses(grid, armorSets, gearMap),
    [grid, armorSets, gearMap]
  )

  /**
   * Apply Optimistic Grid
   *
   * Updates the survivor's `gear_grid` in local state without touching the
   * database, returning the previous grid so callers can roll back on a
   * database failure.
   */
  const applyOptimisticGrid = useCallback(
    (next: GearGridDetail | null) => {
      if (!selectedSurvivor) return null
      const previous = selectedSurvivor.gear_grid
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor.id ? { ...s, gear_grid: next } : s
        )
      )
      return previous
    },
    [selectedSurvivor, setSurvivors]
  )

  /**
   * Persist Slot Change
   *
   * Optimistically updates the cell, then writes the entire grid via the
   * gear-grid DAL. Rolls back state on failure.
   */
  const persistSlotChange = useCallback(
    async (position: GearGridPosition, gearId: string | null) => {
      if (!selectedSurvivor) return
      if (!selectedSettlement)
        return toast.error(GEAR_GRID_SETTLEMENT_REQUIRED_ERROR_MESSAGE())
      if (saving) return

      setSaving(true)

      const optimistic = applyGearGridSlot(grid, position, gearId)
      const previous = applyOptimisticGrid(optimistic)

      try {
        const persisted = await setGearGridSlot(
          selectedSurvivor.id,
          grid,
          position,
          gearId
        )

        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor.id ? { ...s, gear_grid: persisted } : s
          )
        )

        toast.success(
          gearId
            ? GEAR_GRID_SLOT_EQUIPPED_MESSAGE(
                selectedSurvivor.survivor_name ?? undefined
              )
            : GEAR_GRID_SLOT_CLEARED_MESSAGE(
                selectedSurvivor.survivor_name ?? undefined
              )
        )
      } catch (error) {
        applyOptimisticGrid(previous)
        console.error('Gear Grid Save Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [
      applyOptimisticGrid,
      grid,
      saving,
      selectedSettlement,
      selectedSurvivor,
      setSurvivors,
      toast
    ]
  )

  /**
   * Open Picker for the Given Slot
   */
  const openPicker = useCallback((position: GearGridPosition) => {
    setPickerSlot(position)
  }, [])

  /**
   * Handle Picker Selection
   */
  const handlePickerSelect = useCallback(
    (gearId: string) => {
      if (!pickerSlot) return
      const slot = pickerSlot

      setPickerSlot(null)

      void persistSlotChange(slot, gearId)
    },
    [persistSlotChange, pickerSlot]
  )

  /**
   * Get Gear at Slot
   */
  const gearAtSlot = useCallback(
    (position: GearGridPosition): GearDetail | null => {
      if (!grid) return null

      const column = POSITION_TO_COLUMN[position]
      const value = grid[column]

      if (typeof value !== 'string') return null

      return gearMap[value] ?? null
    },
    [grid, gearMap]
  )

  const currentSlotGearId = pickerSlot
    ? ((grid?.[POSITION_TO_COLUMN[pickerSlot]] as string | null) ?? null)
    : null

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center justify-between gap-2">
          {/*
            Affinity totals and qualifying armor set badges share the header row
            with the title and clear action so the card body can devote all its
            space to the grid. 
          */}
          <div className="flex items-center gap-3" aria-label="Affinity totals">
            {AFFINITIES.map((color) => (
              <div
                key={color}
                className="flex items-center gap-1"
                aria-label={`${color.toLowerCase()} affinity total`}>
                <span
                  className={cn(
                    'h-3 w-3 rounded-sm ring-1 ring-border',
                    AFFINITY_BG[color]
                  )}
                />
                <span className="text-sm font-bold tabular-nums">
                  {affinityCounts[color]}
                </span>
              </div>
            ))}
          </div>

          {selectedSurvivor && effectiveBonuses.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-1.5"
              aria-label="Qualifying armor set bonuses">
              {effectiveBonuses.map((bonus) => (
                <Badge
                  key={bonus.armorSet?.id ?? bonus.name}
                  variant={bonus.isFallback ? 'outline' : 'default'}
                  className="cursor-pointer gap-1"
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveBonus(bonus)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setActiveBonus(bonus)
                    }
                  }}
                  aria-label={`Show rules for ${bonus.name}`}>
                  <ShieldCheckIcon className="h-3 w-3" />
                  {bonus.name}
                </Badge>
              ))}
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-2">
        {/* 3x3 grid */}
        <div className="grid grid-cols-3 gap-2">
          {GRID_POSITIONS.map((position) => {
            const gear = gearAtSlot(position)
            return (
              <GearGridCell
                key={position}
                gear={gear}
                slotLabel={POSITION_LABELS[position]}
                readOnly={!selectedSurvivor || !selectedSettlement}
                onEquip={() => openPicker(position)}
                onClear={
                  gear
                    ? () => void persistSlotChange(position, null)
                    : undefined
                }
              />
            )
          })}
        </div>
      </CardContent>

      {pickerSlot && (
        <GearGridPickerDialog
          open={pickerSlot !== null}
          onOpenChange={(open) => !open && setPickerSlot(null)}
          slotLabel={POSITION_LABELS[pickerSlot]}
          candidates={candidates}
          gearMap={gearMap}
          currentGearId={currentSlotGearId}
          onSelect={handlePickerSelect}
        />
      )}

      <Sheet
        open={activeBonus !== null}
        onOpenChange={(open) => !open && setActiveBonus(null)}>
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="gap-2 border-b border-border/60 px-6 pt-6 pb-4">
            <div className="flex items-start justify-between gap-3 pr-8">
              <SheetTitle className="text-lg font-semibold leading-tight tracking-tight break-words">
                {activeBonus?.name ?? ''}
              </SheetTitle>
              {activeBonus?.isFallback && (
                <Badge
                  variant="outline"
                  className="mt-0.5 shrink-0 text-[10px] uppercase tracking-[0.2em]">
                  Fallback
                </Badge>
              )}
            </div>
            <SheetDescription className="text-xs italic text-muted-foreground">
              Armor Set Bonus
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
            {activeBonus?.bonuses ? (
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {activeBonus.bonuses}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No bonus rules recorded for this set.
              </p>
            )}

            {activeBonus?.armorSet && activeBonus.armorSet.slots.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Required Slots
                </div>
                <ul className="flex flex-col gap-2">
                  {activeBonus.armorSet.slots.map((slot) => {
                    const equipped = getEquippedGearIds(grid)
                    const satisfiedBy = slot.gear_ids.find((id) =>
                      equipped.has(id)
                    )

                    return (
                      <li
                        key={slot.id}
                        className="flex flex-col gap-1 rounded-md border border-border/60 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {slot.slot_name}
                          </span>
                          {!slot.required && (
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase tracking-[0.2em]">
                              Optional
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {slot.gear_ids.length === 0 ? (
                            <span className="text-xs italic text-muted-foreground">
                              No candidate gear listed.
                            </span>
                          ) : (
                            slot.gear_ids.map((gearId) => {
                              const gear = gearMap[gearId]
                              const isEquipped = gearId === satisfiedBy
                              return (
                                <Badge
                                  key={gearId}
                                  variant={isEquipped ? 'default' : 'outline'}
                                  className="text-xs">
                                  {gear?.gear_name ?? 'Unknown Gear'}
                                </Badge>
                              )
                            })
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  )
}
