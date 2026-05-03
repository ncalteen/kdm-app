'use client'

import { CustomGearRulesTrigger } from '@/components/custom/custom-rules-sheet'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Database } from '@/lib/database.types'
import { GearDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  EyeIcon,
  FootprintsIcon,
  HandMetalIcon,
  HardHatIcon,
  PuzzleIcon,
  RibbonIcon,
  ShirtIcon,
  XIcon
} from 'lucide-react'
import { ReactElement } from 'react'

/** Affinity Enum */
type Affinity = Database['public']['Enums']['affinity']
/** Armor Location Enum */
type ArmorLocation = Database['public']['Enums']['armor_location']

/** Tailwind background color classes for affinity values. */
const AFFINITY_BG: { [key in Affinity]: string } = {
  BLUE: 'bg-blue-500',
  GREEN: 'bg-green-500',
  RED: 'bg-red-500'
}

/** Tailwind text color classes for affinity values (used for icons). */
const AFFINITY_TEXT: { [key in Affinity]: string } = {
  BLUE: 'text-blue-500',
  GREEN: 'text-green-500',
  RED: 'text-red-500'
}

/** Lucide icon component for each armor location. */
const ARMOR_LOCATION_ICONS: {
  [key in ArmorLocation]: typeof HandMetalIcon
} = {
  ARMS: HandMetalIcon,
  CHEST: ShirtIcon,
  FEET: FootprintsIcon,
  HEAD: HardHatIcon,
  WAIST: RibbonIcon
}

/**
 * Format Enum Label
 *
 * Format an enum key like RAW_HIDE into "Raw Hide". Splits by underscores,
 * capitalizes the first letter of each word, and lowercases the rest.
 *
 * @param value Enum Key
 * @returns Formatted Enum Label
 */
function formatEnumLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Gear Grid Cell Component Properties
 */
interface GearGridCellProps {
  /** Gear Item (null when slot is empty) */
  gear: GearDetail | null
  /** Slot Label (e.g. "Top Left") */
  slotLabel: string
  /** Read-Only (disables edit controls) */
  readOnly?: boolean
  /** Open Equip Picker for this Slot */
  onEquip?: () => void
  /** Clear this Slot */
  onClear?: () => void
}

/**
 * Gear Grid Cell Component
 *
 * Renders a single 3x3 grid cell. When occupied, shows the gear's affinity
 * slots, stats, name, accessory icon, keywords, armor info, and bonus details
 * inspired by the custom gear creation interface. When empty, shows an "Equip"
 * call-to-action.
 *
 * @param props Gear Grid Cell Component Properties
 * @returns Gear Grid Cell Component
 */
export function GearGridCell({
  gear,
  slotLabel,
  readOnly = false,
  onEquip,
  onClear
}: GearGridCellProps): ReactElement {
  if (!gear)
    return (
      <button
        type="button"
        disabled={readOnly}
        aria-label={`Equip ${slotLabel}`}
        title={`Equip ${slotLabel}`}
        onClick={() => onEquip?.()}
        className={cn(
          'relative flex aspect-square w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-xs text-muted-foreground transition-colors',
          !readOnly && 'hover:border-primary hover:bg-muted/40',
          readOnly && 'cursor-not-allowed opacity-60'
        )}>
        <span className="text-[10px] uppercase tracking-wide opacity-70">
          {slotLabel}
        </span>
        {!readOnly && <span className="mt-1 text-xs font-medium">+ Equip</span>}
      </button>
    )

  const isWeapon =
    gear.weapon_type_id != null ||
    gear.accuracy != null ||
    gear.speed != null ||
    gear.strength != null
  const isArmor =
    !isWeapon &&
    (gear.armor_location != null ||
      gear.armor_points != null ||
      gear.accessory === true)

  const ArmorLocationIcon = gear.armor_location
    ? ARMOR_LOCATION_ICONS[gear.armor_location]
    : null

  return (
    <div
      className="relative flex aspect-square w-full flex-col rounded-md border-2 bg-background p-1 shadow-sm"
      aria-label={`${slotLabel}: ${gear.gear_name}`}>
      {/* Affinity slots */}
      <AffinitySquare
        affinity={gear.affinity_top}
        className="absolute -top-1.5 left-1/2 h-3 w-6 -translate-x-1/2"
        ariaLabel="Top affinity"
      />
      <AffinitySquare
        affinity={gear.affinity_left}
        className="absolute top-1/2 -left-1.5 h-6 w-3 -translate-y-1/2"
        ariaLabel="Left affinity"
      />
      <AffinitySquare
        affinity={gear.affinity_right}
        className="absolute top-1/2 -right-1.5 h-6 w-3 -translate-y-1/2"
        ariaLabel="Right affinity"
      />
      <AffinitySquare
        affinity={gear.affinity_bottom}
        className="absolute -bottom-1.5 left-1/2 h-3 w-6 -translate-x-1/2"
        ariaLabel="Bottom affinity"
      />

      {/* Top row: name + keywords centered across the full cell width. */}
      <div className="flex min-w-0 flex-col items-center text-center">
        <CustomGearRulesTrigger
          className="text-xs font-bold"
          custom={gear.custom}
          gearId={gear.id}
          gearName={gear.gear_name}
        />
        {gear.keywords && gear.keywords.length > 0 && (
          <span className="truncate text-[9px] italic text-muted-foreground">
            {gear.keywords.map((k) => formatEnumLabel(k)).join(', ')}
          </span>
        )}
      </div>

      {/* Bottom region: anchored to the cell's lower edge. The stat tower
          (weapon SPD/ACC/STR or armor ARM + location + accessory) sits on its
          own row above an affinity-bonus row that hosts the requirement
          swatches and the bonus rules text, so neither overlaps the gear name
          nor compresses the bonus details. */}
      {(isWeapon ||
        isArmor ||
        gear.affinity_bonus ||
        (gear.affinity_bonus_requirements ?? []).length > 0) && (
        <div className="mt-auto flex flex-col gap-1 border-t border-muted pt-1">
          {(isWeapon || isArmor) && (
            <div className="flex items-center gap-0.5 text-[10px] font-bold leading-none">
              {isWeapon && (
                <>
                  <StatTile label="SPD" value={gear.speed} />
                  <StatTile label="ACC" value={gear.accuracy} />
                  <StatTile label="STR" value={gear.strength} />
                </>
              )}
              {isArmor && (
                <>
                  <StatTile label="ARM" value={gear.armor_points} />
                  {ArmorLocationIcon && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-sm border bg-muted/60"
                            aria-label={
                              gear.armor_location
                                ? `Armor: ${formatEnumLabel(gear.armor_location)}`
                                : undefined
                            }>
                            <ArmorLocationIcon className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {gear.armor_location
                            ? formatEnumLabel(gear.armor_location)
                            : ''}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {gear.accessory && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-sm border bg-muted/60"
                            aria-label="Accessory">
                            <RibbonIcon className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">Accessory</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </>
              )}
            </div>
          )}

          {(gear.affinity_bonus ||
            (gear.affinity_bonus_requirements ?? []).length > 0) && (
            <div
              className={cn(
                'flex items-start gap-1',
                (isWeapon || isArmor) && 'border-t border-muted pt-1'
              )}>
              {(gear.affinity_bonus_requirements ?? []).length > 0 && (
                <div className="flex shrink-0 flex-col items-center gap-0.5">
                  {gear.affinity_bonus_requirements.map((req, i) => (
                    <span
                      key={i}
                      className={cn(
                        'flex h-3 w-3 items-center justify-center rounded-sm ring-1 ring-border',
                        req.puzzle ? 'bg-background' : AFFINITY_BG[req.affinity]
                      )}
                      aria-label={`Requirement ${i + 1}: ${formatEnumLabel(req.affinity)}${req.puzzle ? ' (puzzle)' : ''}`}>
                      {req.puzzle && (
                        <PuzzleIcon
                          className={cn('h-2 w-2', AFFINITY_TEXT[req.affinity])}
                        />
                      )}
                    </span>
                  ))}
                </div>
              )}
              {gear.affinity_bonus && (
                <p
                  className="min-w-0 flex-1 text-[9px] italic text-muted-foreground"
                  title={gear.affinity_bonus}>
                  {gear.affinity_bonus}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hover/focus actions */}
      {!readOnly && (
        <div className="absolute inset-x-1 top-1 z-10 flex justify-end gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 hover:opacity-100">
          {onEquip && (
            <Button
              variant="secondary"
              size="icon"
              type="button"
              className="h-5 w-5"
              onClick={onEquip}
              aria-label={`Replace ${slotLabel}`}
              title={`Replace ${slotLabel}`}>
              <EyeIcon className="h-3 w-3" />
            </Button>
          )}
          {onClear && (
            <Button
              variant="destructive"
              size="icon"
              type="button"
              className="h-5 w-5"
              onClick={onClear}
              aria-label={`Clear ${slotLabel}`}
              title={`Clear ${slotLabel}`}>
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Affinity Square Component Properties
 */
interface AffinitySquareProps {
  /** Affinity Color (null for empty) */
  affinity: Affinity | null
  /** Position Class Name */
  className?: string
  /** Accessibility Label */
  ariaLabel: string
}

/**
 * Affinity Square
 *
 * Decorative coloured swatch positioned on the cell border to convey one of
 * the four directional affinity slots. Nothing is rendered when the gear has
 * no color in that slot.
 *
 * @param props Affinity Square Component Properties
 * @returns Affinity Square Component or null
 */
function AffinitySquare({
  affinity,
  className,
  ariaLabel
}: AffinitySquareProps): ReactElement | null {
  if (!affinity) return null

  return (
    <span
      aria-label={`${ariaLabel}: ${formatEnumLabel(affinity)}`}
      className={cn(
        'rounded-sm border-2 border-background ring-1 ring-border',
        AFFINITY_BG[affinity],
        className
      )}
    />
  )
}

/**
 * Stat Tile Component Properties
 */
interface StatTileProps {
  /** Short Label (e.g. "SPD") */
  label: string
  /** Numeric Value */
  value: number | null
}

/**
 * Stat Tile
 *
 * Compact stat readout used in the corner stat tower. Renders 0 when value is
 * null so weapons/armor without a particular stat still occupy the slot
 * consistently.
 *
 * @param props Stat Tile Component Properties
 * @returns Stat Tile Component
 */
function StatTile({ label, value }: StatTileProps): ReactElement {
  return (
    <span
      className="flex h-5 w-5 flex-col items-center justify-center rounded-sm border bg-muted/60 text-[8px] leading-none"
      aria-label={`${label}: ${value ?? 0}`}>
      <span className="font-bold">{value ?? 0}</span>
      <span className="text-[6px] text-muted-foreground">{label}</span>
    </span>
  )
}
