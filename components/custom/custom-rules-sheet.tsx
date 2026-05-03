'use client'

import { SafeMarkdownPreview } from '@/components/generic/safe-markdown-editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { getGear } from '@/lib/dal/gear'
import { getNeuroses } from '@/lib/dal/neurosis'
import { getPhilosophyRanks } from '@/lib/dal/philosophy-rank'
import { getWeaponTypes } from '@/lib/dal/weapon-type'
import {
  GearDetail,
  NeurosisDetail,
  PhilosophyRankDetail,
  WeaponTypeDetail
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
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
        {sections.map((section, index) => (
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
  const [loading, setLoading] = useState(false)

  /**
   * Handle Open Change
   *
   * Lazily fetches the gear's full detail the first time the sheet is opened.
   * Subsequent opens reuse the cached detail.
   *
   * @param next Next Open State
   */
  const handleOpenChange = (next: boolean) => {
    setOpen(next)

    if (!next || detail || loading || !custom) return

    setLoading(true)
    getGear()
      .then((map) => setDetail(map[gearId] ?? null))
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
      <CustomRulesSheetBody
        title={gearName}
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
  /** Optional Class Name */
  className?: string
}

/**
 * Custom Knowledge Rules Icon Button
 *
 * Renders a magnifying glass icon button next to a knowledge select. When the
 * selected knowledge is user-defined, opens a sheet displaying the knowledge's
 * catalog rules, observation conditions, and rank-up milestone. Renders nothing
 * if the knowledge is missing or not custom.
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
  rules
}: CustomKnowledgeRulesIconButtonProps): ReactElement | null {
  if (!custom || !knowledgeName) return null

  const sections: CustomRulesSection[] = [
    { label: 'Rules', content: rules },
    { label: 'Observation Conditions', content: observationConditions },
    {
      label: 'Observation Rank-Up Milestone',
      entries:
        observationRankUpMilestone != null
          ? [{ label: 'Rank', value: observationRankUpMilestone }]
          : undefined
    }
  ]

  return (
    <Sheet>
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
