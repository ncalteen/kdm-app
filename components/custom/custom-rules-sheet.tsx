'use client'

import { SafeMarkdownPreview } from '@/components/generic/safe-markdown-editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { getGear } from '@/lib/dal/gear'
import { getLocations } from '@/lib/dal/location'
import { getNeuroses } from '@/lib/dal/neurosis'
import { getPhilosophies } from '@/lib/dal/philosophy'
import { getPhilosophyRanks } from '@/lib/dal/philosophy-rank'
import { getResources } from '@/lib/dal/resource'
import { getWeaponTypes } from '@/lib/dal/weapon-type'
import { Database } from '@/lib/database.types'
import {
  GearDetail,
  LocationDetail,
  NeurosisDetail,
  PhilosophyDetail,
  PhilosophyRankDetail,
  ResourceDetail,
  WeaponTypeDetail
} from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  FootprintsIcon,
  HandMetalIcon,
  HardHatIcon,
  PuzzleIcon,
  RibbonIcon,
  Search,
  ShirtIcon
} from 'lucide-react'
import { ReactElement, ReactNode, useEffect, useState } from 'react'

/**
 * Custom Rules Section Entry
 *
 * Represents a single key/value stat rendered inside a section's stat grid.
 */
export interface CustomRulesSectionEntry {
  /** Stat Label */
  label: string
  /** Stat Value */
  value: ReactNode
}

/**
 * Custom Rules Section
 *
 * Represents a single labelled block rendered in the sheet. Sections may
 * present their data as one of three mutually exclusive forms (checked in
 * order):
 *
 * 1. **Stat Grid** — when `entries` is non-empty, the section renders a tidy
 *    grid of key/value tiles. Use this for short structured facts such as
 *    "Endeavor Cost: 1" or "Tier 3".
 * 2. **Badge Row** — when `badges` is non-empty, the section renders the
 *    values as small chips. Ideal for keyword-style lists.
 * 3. **Markdown** — when `content` has non-empty text, it is rendered as a
 *    sanitized markdown block tuned for compact reading.
 *
 * When all three are empty/null, the section renders a thematic empty state.
 */
export interface CustomRulesSection {
  /** Section Label */
  label: string
  /**
   * Markdown Section Content
   *
   * May be null/undefined to indicate "no rules recorded."
   */
  content?: string | null
  /**
   * Stat Entries
   *
   * When provided, renders as a grid of key/value tiles instead of markdown.
   */
  entries?: CustomRulesSectionEntry[]
  /**
   * Badge Values
   *
   * When provided, renders as a wrap of small chip badges (e.g. for keyword
   * lists) instead of markdown.
   */
  badges?: string[]
}

/**
 * Custom Item Display
 *
 * Shared bundle of properties used by item components to drive the custom rules
 * sheet. When `custom` is `false` (or the bundle is omitted), the surrounding
 * UI should render plain text instead of a sheet trigger.
 */
export interface CustomItemDisplay {
  /** Item is User-Defined */
  custom: boolean
  /** Sections to Render */
  sections: CustomRulesSection[]
  /** Sheet Description (Optional) */
  description?: string
  /**
   * Sheet Title (Optional)
   *
   * Defaults to the item's name.
   */
  title?: string
}

/**
 * Base Custom Rules Sheet Component Properties
 */
interface BaseCustomRulesSheetProps {
  /** Sheet Description */
  description?: string
  /** Sheet Sections (Rules Content) */
  sections: CustomRulesSection[]
  /** Sheet Title */
  title: string
}

/**
 * Markdown Body Class Names
 *
 * Tailwind class string applied to every {@link SafeMarkdownPreview} used
 * inside the rules sheet. The overrides:
 *
 * - Pin the body to `text-sm` with relaxed leading so prose reads at the same
 *   density as the surrounding chrome.
 * - Re-scale every heading level so authored markdown headings sit between
 *   `text-base` and `text-sm` rather than ballooning to display sizes.
 * - Tighten paragraph, list, code, and blockquote spacing to keep sections
 *   compact inside the constrained sheet width.
 */
const MARKDOWN_BODY_CLASS = cn(
  'bg-transparent !text-sm !leading-relaxed',
  '[&_h1]:!text-base [&_h1]:!font-semibold [&_h1]:!mt-0 [&_h1]:!mb-1.5 [&_h1]:!border-b-0 [&_h1]:!pb-0',
  '[&_h2]:!text-sm [&_h2]:!font-semibold [&_h2]:!mt-2 [&_h2]:!mb-1 [&_h2]:!border-b-0 [&_h2]:!pb-0',
  '[&_h3]:!text-sm [&_h3]:!font-semibold [&_h3]:!mt-2 [&_h3]:!mb-1',
  '[&_h4]:!text-sm [&_h4]:!font-semibold [&_h4]:!mt-2 [&_h4]:!mb-1',
  '[&_h5]:!text-sm [&_h5]:!font-semibold [&_h5]:!mt-2 [&_h5]:!mb-1',
  '[&_h6]:!text-sm [&_h6]:!font-semibold [&_h6]:!mt-2 [&_h6]:!mb-1',
  '[&_p]:!text-sm [&_p]:!leading-relaxed [&_p]:!my-1.5',
  '[&_p:first-child]:!mt-0 [&_p:last-child]:!mb-0',
  '[&_strong]:!font-semibold [&_strong]:!text-foreground',
  '[&_em]:!italic',
  '[&_ul]:!my-1 [&_ul]:!pl-5 [&_ul]:!list-disc',
  '[&_ol]:!my-1 [&_ol]:!pl-5 [&_ol]:!list-decimal',
  '[&_li]:!text-sm [&_li]:!leading-relaxed [&_li]:!my-0.5',
  '[&_li>p]:!my-0',
  '[&_code]:!text-xs [&_code]:!px-1 [&_code]:!py-0.5 [&_code]:!rounded',
  '[&_pre]:!text-xs [&_pre]:!my-1.5',
  '[&_table]:!text-xs [&_table]:!my-2',
  '[&_blockquote]:!my-1.5 [&_blockquote]:!border-l-2 [&_blockquote]:!pl-3 [&_blockquote]:!italic'
)

/**
 * Custom Rules Section Block
 *
 * Renders the heading and body for a single section of the rules sheet.
 * Picks a presentation strategy based on which optional content the section
 * provides; see {@link CustomRulesSection} for the precedence rules.
 *
 * @param props Section Block Properties
 * @returns Section Block Component
 */
function CustomRulesSectionBlock({
  section
}: {
  section: CustomRulesSection
}): ReactElement {
  const hasEntries = !!section.entries && section.entries.length > 0
  const hasBadges = !!section.badges && section.badges.length > 0
  const hasContent = !!section.content && section.content.trim().length > 0

  return (
    <section className="flex flex-col gap-2 px-6 py-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-px w-3 bg-muted-foreground/50 shrink-0"
        />
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {section.label}
        </h4>
      </div>

      {hasEntries ? (
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2">
          {section.entries!.map((entry, idx) => (
            <div
              key={`${entry.label}-${idx}`}
              className="flex flex-col gap-0.5 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {entry.label}
              </dt>
              <dd className="text-sm font-semibold text-foreground tabular-nums">
                {entry.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : hasBadges ? (
        <div className="flex flex-wrap gap-1.5">
          {section.badges!.map((badge, idx) => (
            <Badge
              key={`${badge}-${idx}`}
              variant="secondary"
              className="font-normal">
              {badge}
            </Badge>
          ))}
        </div>
      ) : hasContent ? (
        <SafeMarkdownPreview
          source={section.content!}
          className={MARKDOWN_BODY_CLASS}
          style={{ backgroundColor: 'transparent' }}
        />
      ) : (
        <p className="text-xs italic text-muted-foreground">
          The lantern reveals nothing here.
        </p>
      )}
    </section>
  )
}

/**
 * Custom Rules Sheet Body
 *
 * Internal renderer that draws the sheet's header and section list. The header
 * pairs the title with a subtle `Custom` pill, and the body uses hairline
 * dividers between sections so each block of authored content reads as its
 * own block without competing with the title.
 *
 * @param props Base Custom Rules Sheet Component Properties
 * @returns Sheet Body Component
 */
function CustomRulesSheetBody({
  description,
  sections,
  title
}: BaseCustomRulesSheetProps): ReactElement {
  // Stable-sort sections so any stat-tile (entries) blocks float to the top of
  // the sheet. The philosophy sheet's `Tier` / `Hunt XP Milestones` overview
  // sets the visual standard for numeric data, so we apply that treatment
  // uniformly: integers (and other structured key/value facts) read first,
  // followed by free-form rule text. Within each group the original ordering
  // from the caller is preserved.
  const orderedSections = sections
    .map((section, index) => ({ section, index }))
    .sort((a, b) => {
      const aHasEntries = !!a.section.entries && a.section.entries.length > 0
      const bHasEntries = !!b.section.entries && b.section.entries.length > 0
      if (aHasEntries === bHasEntries) return a.index - b.index
      return aHasEntries ? -1 : 1
    })
    .map(({ section }) => section)

  return (
    <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
      <SheetHeader className="gap-2 border-b border-border/60 px-6 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3 pr-8">
          <SheetTitle className="text-lg font-semibold leading-tight tracking-tight break-words">
            {title}
          </SheetTitle>
          <Badge
            variant="outline"
            className="mt-0.5 shrink-0 text-[10px] uppercase tracking-[0.2em]">
            Custom
          </Badge>
        </div>
        {description && (
          <SheetDescription className="text-xs italic text-muted-foreground">
            {description}
          </SheetDescription>
        )}
      </SheetHeader>

      <div className="flex flex-col divide-y divide-border/40 overflow-y-auto pb-2">
        {orderedSections.map((section, index) => (
          <CustomRulesSectionBlock
            key={`${section.label}-${index}`}
            section={section}
          />
        ))}
      </div>
    </SheetContent>
  )
}

/**
 * Custom Rules Text Trigger Component Properties
 */
interface CustomRulesTextProps extends BaseCustomRulesSheetProps {
  /** User-Defined Flag */
  custom: boolean | null | undefined
  /**
   * Trigger Label
   *
   * Typically the item's display name.
   */
  label: ReactNode
  /** Class Name (Optional) */
  className?: string
  /**
   * Show Custom Badge
   *
   * When true and the item is custom, a small "Custom" badge is rendered as
   * a sibling next to the label.
   */
  showCustomBadge?: boolean
}

/**
 * Custom Rules Text
 *
 * Renders the item's name. When the item is custom, the name becomes a
 * clickable trigger that opens a sheet displaying the custom rules. When the
 * item is not custom, the name is rendered as plain inline text and clicking
 * does nothing.
 *
 * @param props Custom Rules Text Component Properties
 * @returns Custom Rules Text Component
 */
export function CustomRulesText({
  className,
  custom,
  description,
  label,
  sections,
  showCustomBadge,
  title
}: CustomRulesTextProps): ReactElement {
  const showBadge = !!(showCustomBadge && custom)

  if (!custom) {
    if (showBadge)
      return (
        <span className={cn('inline-flex items-center gap-2', className)}>
          <span className="text-sm">{label}</span>
        </span>
      )

    return <span className={cn('text-sm', className)}>{label}</span>
  }

  const trigger = (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            'text-sm text-left hover:underline focus:outline-none focus-visible:underline cursor-pointer',
            !showBadge && className
          )}>
          {label}
        </button>
      </SheetTrigger>
      <CustomRulesSheetBody
        description={description}
        sections={sections}
        title={title}
      />
    </Sheet>
  )

  if (showBadge)
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        {trigger}
        <Badge variant="outline" className="text-xs shrink-0">
          Custom
        </Badge>
      </span>
    )

  return trigger
}

/**
 * Custom Rules Icon Button Component Properties
 */
interface CustomRulesIconButtonProps extends BaseCustomRulesSheetProps {
  /** User-Defined Flag */
  custom: boolean | null | undefined
  /** Aria Label (Optional) */
  ariaLabel?: string
  /** Class Name (Optional) */
  className?: string
  /**
   * Show Custom Badge
   *
   * When true and the item is custom, a small "Custom" badge is rendered as
   * a sibling next to the icon button.
   */
  showCustomBadge?: boolean
}

/**
 * Custom Rules Icon Button
 *
 * Renders a magnifying glass icon button that opens a sheet displaying the
 * custom rules. When the underlying item is not custom (or missing), the
 * component renders nothing so the surrounding layout remains undisturbed.
 *
 * @param props Custom Rules Icon Button Component Properties
 * @returns Custom Rules Icon Button Component (or null)
 */
export function CustomRulesIconButton({
  ariaLabel,
  className,
  custom,
  description,
  sections,
  showCustomBadge,
  title
}: CustomRulesIconButtonProps): ReactElement | null {
  if (!custom) return null

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={ariaLabel ?? `View custom rules for ${title}`}
            title={ariaLabel ?? `View custom rules for ${title}`}
            className={cn('h-8 w-8 shrink-0', className)}>
            <Search className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <CustomRulesSheetBody
          description={description}
          sections={sections}
          title={title}
        />
      </Sheet>
      {showCustomBadge && (
        <Badge variant="outline" className="text-xs shrink-0">
          Custom
        </Badge>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Custom Gear Sheet
// ---------------------------------------------------------------------------
//
// Unlike the other custom data sheets — which list label/markdown sections
// using {@link CustomRulesSheetBody} — the gear sheet renders a read-only
// card that mirrors the layout of the custom gear creation dialog. Affinity
// slots, the weapon/armor stat tower, name, keywords, rules, and affinity
// bonus all sit inside a single decorated card so the player sees the gear
// "as it would appear" rather than as a list of stat tiles.
//
// ---------------------------------------------------------------------------

/** Affinity Enum */
type GearAffinity = Database['public']['Enums']['affinity']
/** Armor Location Enum */
type GearArmorLocation = Database['public']['Enums']['armor_location']

/**
 * Format Gear Enum Label
 *
 * Format an enum key like RAW_HIDE into "Raw Hide". Mirrors the dialog's
 * helper so authored copy reads consistently between the editor and the
 * read-only sheet.
 *
 * @param value Enum Key
 * @returns Formatted Enum Label
 */
function formatGearEnumLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}

/** Tailwind background classes for affinity values. */
const GEAR_AFFINITY_BG: { [key in GearAffinity]: string } = {
  BLUE: 'bg-blue-500',
  GREEN: 'bg-green-500',
  RED: 'bg-red-500'
}

/** Tailwind text-color classes for affinity values (used for puzzle icons). */
const GEAR_AFFINITY_TEXT: { [key in GearAffinity]: string } = {
  BLUE: 'text-blue-500',
  GREEN: 'text-green-500',
  RED: 'text-red-500'
}

/** Lucide icon component for each armor location. */
const GEAR_ARMOR_LOCATION_ICONS: {
  [key in GearArmorLocation]: typeof HandMetalIcon
} = {
  ARMS: HandMetalIcon,
  CHEST: ShirtIcon,
  FEET: FootprintsIcon,
  HEAD: HardHatIcon,
  WAIST: RibbonIcon
}

/**
 * Inferred Gear Category
 *
 * Lightweight local copy of the dialog's `inferGearCategory` so the gear
 * sheet can pick the right stat-tower layout without importing the dialog
 * (which would pull its full editor surface into every consumer's bundle).
 */
type InferredGearCategory = 'OTHER' | 'WEAPON' | 'ARMOR'

/**
 * Infer Gear Category
 *
 * Picks WEAPON, ARMOR, or OTHER from the populated columns on a gear row.
 * Weapon-specific fields take precedence over armor-specific fields.
 *
 * @param detail Gear Detail to Inspect
 * @returns Inferred Gear Category
 */
function inferGearCategoryFromDetail(detail: GearDetail): InferredGearCategory {
  if (
    detail.weapon_type_id != null ||
    detail.accuracy != null ||
    detail.speed != null ||
    detail.strength != null
  )
    return 'WEAPON'

  if (
    detail.armor_location != null ||
    detail.armor_points != null ||
    detail.accessory === true
  )
    return 'ARMOR'

  return 'OTHER'
}

/**
 * Gear Sheet Affinity Square
 *
 * Read-only sibling of the dialog's `renderAffinitySquare`. Renders a small
 * colored square (or a puzzle-tinted variant) to represent a single affinity
 * slot or affinity bonus requirement.
 *
 * @param props Affinity Square Props
 * @returns Affinity Square Element
 */
function GearSheetAffinitySquare({
  affinity,
  puzzle,
  className,
  label
}: {
  affinity: GearAffinity | null
  puzzle?: boolean | null
  className?: string
  label?: string
}): ReactElement {
  const isPuzzle = puzzle === true
  return (
    <span
      role="img"
      aria-label={
        affinity
          ? `${formatGearEnumLabel(affinity)}${isPuzzle ? ' puzzle' : ''} ${label ?? 'affinity'}`
          : `Empty ${label ?? 'affinity'} slot`
      }
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-sm border-2 border-background shadow ring-1 ring-border',
        isPuzzle
          ? 'bg-background'
          : affinity
            ? GEAR_AFFINITY_BG[affinity]
            : 'bg-muted',
        className
      )}>
      {isPuzzle && affinity && (
        <PuzzleIcon
          className={cn('h-4 w-4', GEAR_AFFINITY_TEXT[affinity])}
          aria-hidden="true"
        />
      )}
    </span>
  )
}

/**
 * Gear Sheet Stat Slot
 *
 * Read-only stat tile rendered inside the weapon/armor stat tower. Mirrors the
 * compact rounded-input look the dialog uses, but renders a plain number so
 * the card can be admired without inviting edits.
 *
 * @param props Stat Slot Props
 * @returns Stat Slot Element
 */
function GearSheetStatSlot({
  label,
  value
}: {
  label: string
  value: number | null | undefined
}): ReactElement {
  return (
    <div
      className="flex h-8 w-10 sm:h-9 sm:w-12 flex-col items-center justify-center rounded-md border border-input bg-background/60 text-xs sm:text-sm font-semibold shadow-xs"
      title={label}
      aria-label={`${label}: ${value ?? 0}`}>
      <span className="tabular-nums leading-none">{value ?? 0}</span>
      <span className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground leading-none mt-0.5">
        {label}
      </span>
    </div>
  )
}

/**
 * Gear Sheet Body Properties
 */
export interface GearSheetBodyProps {
  /** Gear Detail (null while loading or when not found) */
  detail: GearDetail | null
  /** Loaded Flag */
  loaded: boolean
  /** Loading Flag */
  loading: boolean
  /** Gear Map (used to resolve gear cost names) */
  gearMap: { [id: string]: GearDetail }
  /** Locations Map (used to resolve location FK) */
  locations: { [id: string]: LocationDetail }
  /** Resources Map (used to resolve resource cost names) */
  resources: { [id: string]: ResourceDetail }
  /** Weapon Types Map (used to resolve weapon type FK) */
  weaponTypes: { [id: string]: WeaponTypeDetail }
  /** Trigger Label */
  gearName: string
  /**
   * Custom Gear Flag
   *
   * When true, the header renders the "Custom" badge and a description
   * indicating the item is user-defined. Defaults to false so catalog gear
   * renders without the badge.
   */
  custom?: boolean
  /**
   * Description Override
   *
   * Replaces the default sheet description ("A custom gear item defined by
   * you." for custom gear, otherwise omitted). Useful for surfacing the slot
   * label when the sheet is opened from a gear grid cell.
   */
  description?: ReactNode
  /**
   * Footer Slot
   *
   * Optional content rendered in a pinned footer below the scrollable body.
   * The gear grid uses this to surface an "Unequip" action without forcing
   * the user to scroll past the rules text.
   */
  footer?: ReactNode
}

/**
 * Gear Sheet Body
 *
 * Read-only card-shaped renderer for a gear item. Lays out the same sections
 * the {@link GearDialog} editor renders — affinity slots, stat tower, name,
 * keywords, rules, affinity bonus, and crafting costs — without any inputs or
 * controls. Used by both the custom-gear rules trigger (lazy-loads the detail)
 * and the gear grid slot view (which already has the catalog maps in scope).
 *
 * @param props Gear Sheet Body Properties
 * @returns Gear Sheet Body
 */
export function GearSheetBody({
  custom = false,
  description,
  detail,
  footer,
  gearMap,
  gearName,
  loaded,
  loading,
  locations,
  resources,
  weaponTypes
}: GearSheetBodyProps): ReactElement {
  const showSkeleton = loading || !loaded
  const category = detail ? inferGearCategoryFromDetail(detail) : 'OTHER'
  const categoryLabel =
    category === 'WEAPON' ? 'Weapon' : category === 'ARMOR' ? 'Armor' : 'Other'

  const locationName = detail?.location_id
    ? (locations[detail.location_id]?.location_name ?? null)
    : null
  const weaponTypeName = detail?.weapon_type_id
    ? (weaponTypes[detail.weapon_type_id]?.weapon_type_name ?? null)
    : null

  // Mobile narrative-text override layered on top of MARKDOWN_BODY_CLASS so
  // the rules text in the gear card stays readable inside the constrained
  // sheet width without forcing aggressive line wrapping. Desktop preserves
  // the existing 14px sizing.
  const gearMarkdownClass = cn(
    MARKDOWN_BODY_CLASS,
    '!text-xs sm:!text-sm',
    '[&_p]:!text-xs sm:[&_p]:!text-sm',
    '[&_li]:!text-xs sm:[&_li]:!text-sm'
  )

  // Resolve the description text once so the header can omit the element
  // entirely when no description should be shown for catalog gear.
  const resolvedDescription: ReactNode =
    description ?? (custom ? 'A custom gear item defined by you.' : null)

  return (
    <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
      <SheetHeader className="gap-2 border-b border-border/60 px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
        <div className="flex items-start justify-between gap-3 pr-8">
          <SheetTitle className="text-base sm:text-lg font-semibold leading-tight tracking-tight break-words">
            {detail?.gear_name ?? gearName}
          </SheetTitle>
          {custom && (
            <Badge
              variant="outline"
              className="mt-0.5 shrink-0 text-[10px] uppercase tracking-[0.2em]">
              Custom
            </Badge>
          )}
        </div>
        {resolvedDescription !== null && (
          <SheetDescription className="text-xs italic text-muted-foreground">
            {resolvedDescription}
          </SheetDescription>
        )}
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-3 sm:gap-4 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
        {showSkeleton ? (
          <p className="text-xs italic text-muted-foreground">
            Staring at the stars...
          </p>
        ) : !detail ? (
          <p className="text-xs italic text-muted-foreground">
            The lantern reveals nothing here.
          </p>
        ) : (
          <>
            {/* Meta Row: Type + Location */}
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2">
              <div className="flex flex-col gap-0.5 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Type
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {categoryLabel}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Location
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {locationName ?? '—'}
                </dd>
              </div>
            </dl>

            {/* Card-Shaped Body (read-only mirror of the dialog) */}
            <div className="relative mx-auto mt-2 w-full rounded-xl border-2 bg-muted/10 px-3 py-6 sm:px-6 sm:py-8 shadow-inner">
              {/* Affinity Slots (edges) */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <GearSheetAffinitySquare
                  affinity={detail.affinity_top}
                  label="top affinity slot"
                />
              </div>
              <div className="absolute top-1/2 -left-3 -translate-y-1/2">
                <GearSheetAffinitySquare
                  affinity={detail.affinity_left}
                  label="left affinity slot"
                />
              </div>
              <div className="absolute top-1/2 -right-3 -translate-y-1/2">
                <GearSheetAffinitySquare
                  affinity={detail.affinity_right}
                  label="right affinity slot"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                <GearSheetAffinitySquare
                  affinity={detail.affinity_bottom}
                  label="bottom affinity slot"
                />
              </div>

              {/* Header Row: Stat Tower + Name/Keywords/Rules */}
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex w-12 sm:w-16 shrink-0 flex-col items-center gap-1">
                  {category === 'WEAPON' && (
                    <>
                      <GearSheetStatSlot label="Spd" value={detail.speed} />
                      <GearSheetStatSlot label="Acc" value={detail.accuracy} />
                      <GearSheetStatSlot label="Str" value={detail.strength} />
                    </>
                  )}
                  {category === 'ARMOR' && (
                    <>
                      <GearSheetStatSlot
                        label="Arm"
                        value={detail.armor_points}
                      />
                      {(() => {
                        const ArmorIcon = detail.armor_location
                          ? GEAR_ARMOR_LOCATION_ICONS[detail.armor_location]
                          : null
                        const armorLabel = detail.armor_location
                          ? `Armor location: ${formatGearEnumLabel(detail.armor_location)}`
                          : 'Armor location (none)'
                        return (
                          <div
                            className="flex h-8 w-10 sm:h-9 sm:w-12 items-center justify-center rounded-md border border-input bg-background/60 shadow-xs"
                            aria-label={armorLabel}
                            title={armorLabel}>
                            {ArmorIcon ? (
                              <ArmorIcon
                                className="h-4 w-4 sm:h-5 sm:w-5"
                                aria-hidden="true"
                              />
                            ) : (
                              <span aria-hidden="true">—</span>
                            )}
                          </div>
                        )
                      })()}
                    </>
                  )}
                </div>

                {/* Center: Name + Keywords + Rules */}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <h5 className="text-center text-base sm:text-lg font-bold leading-tight">
                      {detail.gear_name}
                    </h5>
                    {detail.keywords && detail.keywords.length > 0 && (
                      <p className="text-center text-[11px] sm:text-xs italic text-muted-foreground">
                        {detail.keywords
                          .map((k) => formatGearEnumLabel(k))
                          .join(', ')}
                      </p>
                    )}
                  </div>

                  {detail.rules && detail.rules.trim().length > 0 ? (
                    <SafeMarkdownPreview
                      source={detail.rules}
                      className={gearMarkdownClass}
                      style={{ backgroundColor: 'transparent' }}
                    />
                  ) : (
                    <p className="text-center text-[11px] sm:text-xs italic text-muted-foreground">
                      No special rules.
                    </p>
                  )}
                </div>

                {/* Right Spacer (balance stat tower width on desktop only) */}
                <div className="hidden sm:block sm:w-16 shrink-0" />
              </div>

              {/* Affinity Bonus + Requirements */}
              {((detail.affinity_bonus_requirements ?? []).length > 0 ||
                (detail.affinity_bonus &&
                  detail.affinity_bonus.trim().length > 0)) && (
                <div className="mt-3 flex items-start gap-2 sm:gap-3 border-t border-muted pt-3">
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    {(detail.affinity_bonus_requirements ?? []).length === 0 ? (
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        —
                      </span>
                    ) : (
                      (detail.affinity_bonus_requirements ?? []).map(
                        (req, index) => (
                          <GearSheetAffinitySquare
                            key={index}
                            affinity={req.affinity}
                            puzzle={req.puzzle}
                            label={`requirement ${index + 1}`}
                          />
                        )
                      )
                    )}
                  </div>
                  {detail.affinity_bonus &&
                  detail.affinity_bonus.trim().length > 0 ? (
                    <p className="flex-1 text-xs sm:text-sm italic">
                      {detail.affinity_bonus}
                    </p>
                  ) : (
                    <p className="flex-1 text-[11px] sm:text-xs italic text-muted-foreground">
                      Requirements without a bonus.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Below-Card Facts: Weapon Type / Accessory */}
            {(category === 'WEAPON' || category === 'ARMOR') && (
              <dl className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2">
                {category === 'WEAPON' && (
                  <div className="flex flex-col gap-0.5 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Weapon Type
                    </dt>
                    <dd className="text-sm font-semibold text-foreground">
                      {weaponTypeName ?? '—'}
                    </dd>
                  </div>
                )}
                {category === 'ARMOR' && (
                  <div className="flex flex-col gap-0.5 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Accessory
                    </dt>
                    <dd className="text-sm font-semibold text-foreground">
                      {detail.accessory === true ? 'Yes' : 'No'}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {/* Crafting Costs */}
            {((detail.gear_costs ?? []).length > 0 ||
              (detail.resource_costs ?? []).length > 0 ||
              (detail.resource_type_costs ?? []).length > 0) && (
              <section className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-px w-3 bg-muted-foreground/50 shrink-0"
                  />
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Crafting Costs
                  </h4>
                </div>
                <ul className="flex flex-col gap-1">
                  {(detail.gear_costs ?? []).map((cost, idx) => {
                    const costGear = cost.cost_gear_id
                      ? gearMap[cost.cost_gear_id]
                      : null
                    const name = costGear?.gear_name ?? 'Unknown gear'
                    return (
                      <li
                        key={`gear-${idx}`}
                        className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 text-sm">
                        <span className="truncate">{name}</span>
                        <span className="ml-2 font-semibold tabular-nums">
                          ×{cost.quantity}
                        </span>
                      </li>
                    )
                  })}
                  {(detail.resource_costs ?? []).map((cost, idx) => {
                    const resource = cost.resource_id
                      ? resources[cost.resource_id]
                      : null
                    const name = resource?.resource_name ?? 'Unknown resource'
                    return (
                      <li
                        key={`resource-${idx}`}
                        className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 text-sm">
                        <span className="truncate">{name}</span>
                        <span className="ml-2 font-semibold tabular-nums">
                          ×{cost.quantity}
                        </span>
                      </li>
                    )
                  })}
                  {(detail.resource_type_costs ?? []).map((cost, idx) => (
                    <li
                      key={`resource-type-${idx}`}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 text-sm">
                      <span className="truncate">
                        {formatGearEnumLabel(cost.resource_type)}
                        <span className="ml-1 text-xs italic text-muted-foreground">
                          (any)
                        </span>
                      </span>
                      <span className="ml-2 font-semibold tabular-nums">
                        ×{cost.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>

      {footer && (
        <SheetFooter className="border-t border-border/60 px-6 py-4">
          {footer}
        </SheetFooter>
      )}
    </SheetContent>
  )
}

/**
 * Custom Gear Rules Trigger Component Properties
 */
interface CustomGearRulesTriggerProps {
  /** Gear ID */
  gearId: string
  /** Gear Name */
  gearName: string
  /** User-Defined Flag */
  custom: boolean | null | undefined
  /** Class Name (Optional) */
  className?: string
  /** Trigger Variant */
  variant?: 'text' | 'icon'
  /** Aria Label (Optional) */
  ariaLabel?: string
  /**
   * Show Custom Badge
   *
   * When true and the gear is custom, a small "Custom" badge is rendered as
   * a sibling next to the trigger.
   */
  showCustomBadge?: boolean
}

/**
 * Custom Gear Rules Trigger
 *
 * Custom gear stored on a survivor only carries `id` and `gear_name`, so the
 * full rules text is fetched lazily from the DAL the first time the sheet is
 * opened. Subsequent opens reuse the cached gear detail.
 *
 * @param props Custom Gear Rules Trigger Component Properties
 * @returns Custom Gear Rules Trigger Component (or Plaintext)
 */
export function CustomGearRulesTrigger({
  ariaLabel,
  className,
  custom,
  gearId,
  gearName,
  showCustomBadge,
  variant = 'text'
}: CustomGearRulesTriggerProps): ReactElement | null {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<GearDetail | null>(null)
  const [gearMap, setGearMap] = useState<{ [id: string]: GearDetail }>({})
  const [locations, setLocations] = useState<{
    [id: string]: LocationDetail
  }>({})
  const [resources, setResources] = useState<{
    [id: string]: ResourceDetail
  }>({})
  const [weaponTypes, setWeaponTypes] = useState<{
    [id: string]: WeaponTypeDetail
  }>({})
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  /**
   * Handle Open Change
   *
   * Lazily fetches the gear's full detail (and the supporting maps used to
   * resolve location, weapon type, and crafting-cost foreign keys) the first
   * time the sheet is opened. Subsequent opens reuse the cached data.
   *
   * @param next Next Open State
   */
  const handleOpenChange = (next: boolean) => {
    setOpen(next)

    if (!next || loaded || loading || !custom) return

    setLoading(true)
    Promise.all([getGear(), getLocations(), getResources(), getWeaponTypes()])
      .then(([nextGearMap, nextLocations, nextResources, nextWeaponTypes]) => {
        setGearMap(nextGearMap)
        setDetail(nextGearMap[gearId] ?? null)
        setLocations(nextLocations)
        setResources(nextResources)
        setWeaponTypes(nextWeaponTypes)
        setLoaded(true)
      })
      .catch((error) => console.error('Custom Gear Rules Fetch Error:', error))
      .finally(() => setLoading(false))
  }

  if (!custom) {
    if (variant === 'icon') return null

    return <span className={cn('text-sm', className)}>{gearName}</span>
  }

  const showBadge = !!showCustomBadge

  const sheet = (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {variant === 'icon' ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={ariaLabel ?? `View custom rules for ${gearName}`}
            title={ariaLabel ?? `View custom rules for ${gearName}`}
            className={cn('h-8 w-8 shrink-0', !showBadge && className)}>
            <Search className="h-4 w-4" />
          </Button>
        ) : (
          <button
            type="button"
            className={cn(
              'text-sm text-left hover:underline focus:outline-none focus-visible:underline cursor-pointer truncate',
              !showBadge && className
            )}>
            {gearName}
          </button>
        )}
      </SheetTrigger>
      <GearSheetBody
        custom
        detail={detail}
        gearMap={gearMap}
        gearName={gearName}
        loaded={loaded}
        loading={loading}
        locations={locations}
        resources={resources}
        weaponTypes={weaponTypes}
      />
    </Sheet>
  )

  if (showBadge)
    return (
      <span className={cn('inline-flex items-center gap-2 min-w-0', className)}>
        {sheet}
        <Badge variant="outline" className="text-xs shrink-0">
          Custom
        </Badge>
      </span>
    )

  return sheet
}

/**
 * Custom Weapon Type Rules Icon Button Component Properties
 */
interface CustomWeaponTypeRulesIconButtonProps {
  /** Weapon Type ID */
  weaponTypeId: string | null | undefined
  /** Class Name (Optional) */
  className?: string
}

/**
 * Custom Weapon Type Rules Icon Button
 *
 * Renders a magnifying glass icon button next to the weapon-type select. The
 * weapon type detail (custom flag, name, proficiency rules) is loaded the first
 * time the button mounts; the icon only renders if the weapon type is
 * user-defined. Clicking opens a sheet displaying the custom specialist and
 * master proficiency rules.
 *
 * @param props Custom Weapon Type Rules Icon Button Component Properties
 * @returns Custom Weapon Type Rules Icon Button (or null)
 */
export function CustomWeaponTypeRulesIconButton({
  className,
  weaponTypeId
}: CustomWeaponTypeRulesIconButtonProps): ReactElement | null {
  const [open, setOpen] = useState(false)
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(
    undefined
  )
  const [detail, setDetail] = useState<WeaponTypeDetail | null>(null)

  // Fetch weapon type detail when weaponTypeId changes. All state writes are
  // performed asynchronously inside Promise callbacks to avoid render-time
  // setState (which can cause render loops and behave poorly under Strict
  // Mode).
  useEffect(() => {
    let cancelled = false

    const fetchDetail: Promise<WeaponTypeDetail | null> = weaponTypeId
      ? getWeaponTypes().then((map) => map[weaponTypeId] ?? null)
      : Promise.resolve(null)

    fetchDetail
      .then((next) => {
        if (cancelled) return
        setDetail(next)
        setLoadedFor(weaponTypeId ?? null)
      })
      .catch((error) => {
        if (cancelled) return
        console.error('Custom Weapon Type Rules Fetch Error:', error)
        setDetail(null)
        setLoadedFor(weaponTypeId ?? null)
      })

    return () => {
      cancelled = true
    }
  }, [weaponTypeId])

  // Only render once the loaded detail matches the current weaponTypeId. This
  // avoids briefly showing stale data when the prop changes, and implicitly
  // closes the sheet while a new id is loading.
  const isLoadedForCurrentId = loadedFor === weaponTypeId

  if (!isLoadedForCurrentId || !detail?.custom) return null

  const title = detail.weapon_type_name

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`View custom rules for ${title}`}
          title={`View custom rules for ${title}`}
          className={cn('h-8 w-8 shrink-0', className)}>
          <Search className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <CustomRulesSheetBody
        title={title}
        description="A custom weapon type defined by you."
        sections={[
          {
            label: 'Specialist',
            content: detail.specialist_proficiency_rules
          },
          {
            label: 'Master',
            content: detail.master_proficiency_rules
          }
        ]}
      />
    </Sheet>
  )
}

/**
 * Custom Philosophy Rules Icon Button Component Properties
 */
interface CustomPhilosophyRulesIconButtonProps {
  /** User-Defined Flag */
  custom: boolean | null | undefined
  /** Philosophy ID */
  philosophyId: string | null | undefined
  /** Philosophy Name */
  philosophyName: string | null | undefined
  /** Tier */
  tier?: number | null
  /** Hunt XP Milestones */
  huntXpMilestones?: number[] | null
  /** Class Name (Optional) */
  className?: string
}

/**
 * Custom Philosophy Rules Icon Button
 *
 * Renders a magnifying glass icon button next to the philosophy select. When
 * the selected philosophy is user-defined, opens a sheet displaying the
 * philosophy's tier, hunt XP milestones, and per-rank rules (lazily fetched).
 * Renders nothing if the philosophy is missing or not custom.
 *
 * @param props Custom Philosophy Rules Icon Button Component Properties
 * @returns Custom Philosophy Rules Icon Button (or null)
 */
export function CustomPhilosophyRulesIconButton({
  className,
  custom,
  huntXpMilestones,
  philosophyId,
  philosophyName,
  tier
}: CustomPhilosophyRulesIconButtonProps): ReactElement | null {
  const [open, setOpen] = useState(false)
  const [ranks, setRanks] = useState<PhilosophyRankDetail[] | null>(null)
  const [loading, setLoading] = useState(false)

  /**
   * Handle Open Change
   *
   * Lazily fetches the philosophy's ranks the first time the sheet is opened.
   * Subsequent opens reuse the cached ranks.
   *
   * @param next Next Open State
   */
  const handleOpenChange = (next: boolean) => {
    setOpen(next)

    if (!next || ranks || loading || !custom || !philosophyId) return

    setLoading(true)
    getPhilosophyRanks(philosophyId)
      .then((data) => setRanks(data))
      .catch((error) =>
        console.error('Custom Philosophy Ranks Fetch Error:', error)
      )
      .finally(() => setLoading(false))
  }

  if (!custom || !philosophyId) return null

  const title = philosophyName ?? 'Philosophy'

  const overviewEntries: CustomRulesSectionEntry[] = []
  if (tier != null) overviewEntries.push({ label: 'Tier', value: tier })
  if (huntXpMilestones && huntXpMilestones.length > 0)
    overviewEntries.push({
      label: 'Hunt XP Milestones',
      value: huntXpMilestones.join(', ')
    })

  const sections: CustomRulesSection[] = [
    {
      label: 'Overview',
      entries: overviewEntries.length > 0 ? overviewEntries : undefined
    }
  ]

  if (loading) {
    sections.push({ label: 'Ranks', content: '_Staring at the stars..._' })
  } else if (ranks && ranks.length > 0) {
    for (const rank of ranks)
      sections.push({
        label: `Rank ${rank.rank_number}`,
        content: rank.rules
      })
  } else if (ranks) {
    sections.push({ label: 'Ranks', content: null })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`View custom rules for ${title}`}
          title={`View custom rules for ${title}`}
          className={cn('h-8 w-8 shrink-0', className)}>
          <Search className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <CustomRulesSheetBody
        title={title}
        description="A custom philosophy defined by you."
        sections={sections}
      />
    </Sheet>
  )
}

/**
 * Custom Knowledge Rules Icon Button Component Properties
 */
interface CustomKnowledgeRulesIconButtonProps {
  /** User-Defined Flag */
  custom: boolean | null | undefined
  /** Knowledge Name */
  knowledgeName: string | null | undefined
  /** Catalog Rules (from Settlement Knowledge Entry) */
  rules?: string | null
  /** Observation Conditions */
  observationConditions?: string | null
  /** Observation Rank-Up Milestone */
  observationRankUpMilestone?: number | null
  /**
   * Philosophy ID
   *
   * When provided, the philosophy detail is lazily fetched the first time the
   * sheet opens and surfaced as an additional section. Pass `null`/`undefined`
   * for knowledges that aren't tied to a philosophy.
   */
  philosophyId?: string | null
  /** Optional Class Name */
  className?: string
}

/**
 * Custom Knowledge Rules Icon Button
 *
 * Renders a magnifying glass icon button next to a knowledge select. When the
 * selected knowledge is user-defined, opens a sheet displaying the knowledge's
 * catalog rules, observation conditions, rank-up milestone, and (when linked)
 * the parent philosophy. Renders nothing if the knowledge is missing or not
 * custom.
 *
 * @param props Custom Knowledge Rules Icon Button Component Properties
 * @returns Custom Knowledge Rules Icon Button (or null)
 */
export function CustomKnowledgeRulesIconButton({
  className,
  custom,
  knowledgeName,
  observationConditions,
  observationRankUpMilestone,
  philosophyId,
  rules
}: CustomKnowledgeRulesIconButtonProps): ReactElement | null {
  const [open, setOpen] = useState(false)
  const [philosophy, setPhilosophy] = useState<PhilosophyDetail | null>(null)
  const [philosophyLoading, setPhilosophyLoading] = useState(false)

  /**
   * Handle Open Change
   *
   * Lazily fetches the linked philosophy the first time the sheet is opened.
   * Subsequent opens reuse the cached detail.
   *
   * @param next Next Open State
   */
  const handleOpenChange = (next: boolean) => {
    setOpen(next)

    if (!next || philosophy || philosophyLoading || !philosophyId) return

    setPhilosophyLoading(true)
    getPhilosophies()
      .then((map) => setPhilosophy(map[philosophyId] ?? null))
      .catch((error) =>
        console.error('Custom Knowledge Philosophy Fetch Error:', error)
      )
      .finally(() => setPhilosophyLoading(false))
  }

  if (!custom || !knowledgeName) return null

  const sections: CustomRulesSection[] = []

  if (philosophyId)
    sections.push({
      label: 'Philosophy',
      entries: philosophyLoading
        ? [{ label: 'Name', value: 'Staring at the stars...' }]
        : philosophy
          ? [{ label: 'Name', value: philosophy.philosophy_name }]
          : undefined
    })

  sections.push(
    { label: 'Rules', content: rules },
    { label: 'Observation Conditions', content: observationConditions },
    {
      label: 'Observation Rank-Up Milestone',
      entries:
        observationRankUpMilestone != null
          ? [{ label: 'Rank', value: observationRankUpMilestone }]
          : undefined
    }
  )

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`View custom rules for ${knowledgeName}`}
          title={`View custom rules for ${knowledgeName}`}
          className={cn('h-8 w-8 shrink-0', className)}>
          <Search className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <CustomRulesSheetBody
        title={knowledgeName}
        description="A custom knowledge defined by you."
        sections={sections}
      />
    </Sheet>
  )
}

/**
 * Custom Philosophy Rules Text Component Properties
 */
interface CustomPhilosophyRulesTextProps {
  /** User-Defined Flag */
  custom: boolean | null | undefined
  /** Philosophy ID */
  philosophyId: string | null | undefined
  /** Philosophy Name (also used as trigger label) */
  philosophyName: string
  /** Tier */
  tier?: number | null
  /** Hunt XP Milestones */
  huntXpMilestones?: number[] | null
  /** Class Name (Optional) */
  className?: string
  /**
   * Show Custom Badge
   *
   * When true and the philosophy is custom, a small "Custom" badge is rendered
   * as a sibling next to the trigger.
   */
  showCustomBadge?: boolean
}

/**
 * Custom Philosophy Rules Text
 *
 * Renders the philosophy's name as a clickable trigger when the philosophy is
 * user-defined; otherwise renders a plain inline label. The opened sheet
 * surfaces an `Overview` stat tile (tier, hunt XP milestones) and lazily
 * fetches the philosophy's ranks so each rank's rules render as its own
 * markdown section using the same styling as every other rules section.
 *
 * @param props Custom Philosophy Rules Text Component Properties
 * @returns Custom Philosophy Rules Text Component
 */
export function CustomPhilosophyRulesText({
  className,
  custom,
  huntXpMilestones,
  philosophyId,
  philosophyName,
  showCustomBadge,
  tier
}: CustomPhilosophyRulesTextProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [ranks, setRanks] = useState<PhilosophyRankDetail[] | null>(null)
  const [loading, setLoading] = useState(false)

  /**
   * Handle Open Change
   *
   * Lazily fetches the philosophy's ranks the first time the sheet is opened.
   * Subsequent opens reuse the cached ranks.
   *
   * @param next Next Open State
   */
  const handleOpenChange = (next: boolean) => {
    setOpen(next)

    if (!next || ranks || loading || !custom || !philosophyId) return

    setLoading(true)
    getPhilosophyRanks(philosophyId)
      .then((data) => setRanks(data))
      .catch((error) =>
        console.error('Custom Philosophy Ranks Fetch Error:', error)
      )
      .finally(() => setLoading(false))
  }

  if (!custom) {
    if (showCustomBadge)
      return (
        <span className={cn('inline-flex items-center gap-2', className)}>
          <span className="text-sm">{philosophyName}</span>
        </span>
      )

    return <span className={cn('text-sm', className)}>{philosophyName}</span>
  }

  const overviewEntries: CustomRulesSectionEntry[] = []
  if (tier != null) overviewEntries.push({ label: 'Tier', value: tier })
  if (huntXpMilestones && huntXpMilestones.length > 0)
    overviewEntries.push({
      label: 'Hunt XP Milestones',
      value: huntXpMilestones.join(', ')
    })

  const sections: CustomRulesSection[] = [
    {
      label: 'Overview',
      entries: overviewEntries.length > 0 ? overviewEntries : undefined
    }
  ]

  if (loading) {
    sections.push({ label: 'Ranks', content: '_Staring at the stars..._' })
  } else if (ranks && ranks.length > 0) {
    for (const rank of ranks)
      sections.push({
        label: `Rank ${rank.rank_number}`,
        content: rank.rules
      })
  } else if (ranks) {
    sections.push({ label: 'Ranks', content: null })
  }

  const trigger = (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            'text-sm text-left hover:underline focus:outline-none focus-visible:underline cursor-pointer',
            !showCustomBadge && className
          )}>
          {philosophyName}
        </button>
      </SheetTrigger>
      <CustomRulesSheetBody
        title={philosophyName}
        description="A custom philosophy defined by you."
        sections={sections}
      />
    </Sheet>
  )

  if (showCustomBadge)
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        {trigger}
        <Badge variant="outline" className="text-xs shrink-0">
          Custom
        </Badge>
      </span>
    )

  return trigger
}

/**
 * Custom Knowledge Rules Text Component Properties
 */
interface CustomKnowledgeRulesTextProps {
  /** User-Defined Flag */
  custom: boolean | null | undefined
  /** Knowledge Name (also used as trigger label) */
  knowledgeName: string
  /** Catalog Rules */
  rules?: string | null
  /** Observation Conditions */
  observationConditions?: string | null
  /** Observation Rank-Up Milestone */
  observationRankUpMilestone?: number | null
  /**
   * Philosophy ID
   *
   * When provided, the philosophy detail is lazily fetched the first time the
   * sheet opens and surfaced as an additional section. Pass `null`/`undefined`
   * for knowledges that aren't tied to a philosophy.
   */
  philosophyId?: string | null
  /** Class Name (Optional) */
  className?: string
  /**
   * Show Custom Badge
   *
   * When true and the knowledge is custom, a small "Custom" badge is rendered
   * as a sibling next to the trigger.
   */
  showCustomBadge?: boolean
}

/**
 * Custom Knowledge Rules Text
 *
 * Renders the knowledge's name as a clickable trigger when the knowledge is
 * user-defined; otherwise renders a plain inline label. The opened sheet
 * displays the knowledge's rules, observation conditions, observation rank-up
 * milestone, and (when linked) the parent philosophy's name (lazily fetched).
 *
 * @param props Custom Knowledge Rules Text Component Properties
 * @returns Custom Knowledge Rules Text Component
 */
export function CustomKnowledgeRulesText({
  className,
  custom,
  knowledgeName,
  observationConditions,
  observationRankUpMilestone,
  philosophyId,
  rules,
  showCustomBadge
}: CustomKnowledgeRulesTextProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [philosophy, setPhilosophy] = useState<PhilosophyDetail | null>(null)
  const [philosophyLoading, setPhilosophyLoading] = useState(false)

  /**
   * Handle Open Change
   *
   * Lazily fetches the linked philosophy the first time the sheet is opened.
   * Subsequent opens reuse the cached detail.
   *
   * @param next Next Open State
   */
  const handleOpenChange = (next: boolean) => {
    setOpen(next)

    if (!next || philosophy || philosophyLoading || !custom || !philosophyId)
      return

    setPhilosophyLoading(true)
    getPhilosophies()
      .then((map) => setPhilosophy(map[philosophyId] ?? null))
      .catch((error) =>
        console.error('Custom Knowledge Philosophy Fetch Error:', error)
      )
      .finally(() => setPhilosophyLoading(false))
  }

  if (!custom) {
    if (showCustomBadge)
      return (
        <span className={cn('inline-flex items-center gap-2', className)}>
          <span className="text-sm">{knowledgeName}</span>
        </span>
      )

    return <span className={cn('text-sm', className)}>{knowledgeName}</span>
  }

  const sections: CustomRulesSection[] = []

  if (philosophyId)
    sections.push({
      label: 'Philosophy',
      entries: philosophyLoading
        ? [{ label: 'Name', value: 'Staring at the stars...' }]
        : philosophy
          ? [{ label: 'Name', value: philosophy.philosophy_name }]
          : undefined
    })

  sections.push(
    { label: 'Rules', content: rules },
    { label: 'Observation Conditions', content: observationConditions },
    {
      label: 'Observation Rank-Up Milestone',
      entries:
        observationRankUpMilestone != null
          ? [{ label: 'Rank', value: observationRankUpMilestone }]
          : undefined
    }
  )

  const trigger = (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            'text-sm text-left hover:underline focus:outline-none focus-visible:underline cursor-pointer',
            !showCustomBadge && className
          )}>
          {knowledgeName}
        </button>
      </SheetTrigger>
      <CustomRulesSheetBody
        title={knowledgeName}
        description="A custom knowledge defined by you."
        sections={sections}
      />
    </Sheet>
  )

  if (showCustomBadge)
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        {trigger}
        <Badge variant="outline" className="text-xs shrink-0">
          Custom
        </Badge>
      </span>
    )

  return trigger
}

/**
 * Custom Neurosis Rules Icon Button Component Properties
 */
interface CustomNeurosisRulesIconButtonProps {
  /** User-Defined Flag */
  custom: boolean | null | undefined
  /** Neurosis ID */
  neurosisId: string | null | undefined
  /** Neurosis Name */
  neurosisName: string | null | undefined
  /** Class Name (Optional) */
  className?: string
}

/**
 * Custom Neurosis Rules Icon Button
 *
 * Renders a magnifying glass icon button next to a neurosis select. When the
 * selected neurosis is user-defined, opens a sheet displaying the neurosis's
 * rules (lazily fetched from the DAL on first open). Renders nothing if the
 * neurosis is missing or not custom.
 *
 * @param props Custom Neurosis Rules Icon Button Component Properties
 * @returns Custom Neurosis Rules Icon Button (or null)
 */
export function CustomNeurosisRulesIconButton({
  className,
  custom,
  neurosisId,
  neurosisName
}: CustomNeurosisRulesIconButtonProps): ReactElement | null {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<NeurosisDetail | null>(null)
  const [loading, setLoading] = useState(false)

  /**
   * Handle Open Change
   *
   * Lazily fetches the neurosis's full detail the first time the sheet is
   * opened. Subsequent opens reuse the cached detail.
   *
   * @param next Next Open State
   */
  const handleOpenChange = (next: boolean) => {
    setOpen(next)

    if (!next || detail || loading || !custom || !neurosisId) return

    setLoading(true)
    getNeuroses()
      .then((map) => setDetail(map[neurosisId] ?? null))
      .catch((error) =>
        console.error('Custom Neurosis Rules Fetch Error:', error)
      )
      .finally(() => setLoading(false))
  }

  if (!custom || !neurosisId) return null

  const title = neurosisName ?? 'Neurosis'

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`View custom rules for ${title}`}
          title={`View custom rules for ${title}`}
          className={cn('h-8 w-8 shrink-0', className)}>
          <Search className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <CustomRulesSheetBody
        title={title}
        description="A custom neurosis defined by you."
        sections={[
          {
            label: 'Rules',
            content: loading
              ? '_Staring at the stars..._'
              : (detail?.rules ?? null)
          }
        ]}
      />
    </Sheet>
  )
}
