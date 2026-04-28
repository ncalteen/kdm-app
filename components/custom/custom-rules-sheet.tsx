'use client'

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
import { ReactElement, ReactNode, useState } from 'react'

/**
 * Custom Rules Section
 *
 * Represents a single labelled block of rules text rendered in the sheet.
 */
export interface CustomRulesSection {
  /** Section Label */
  label: string
  /**
   * Section Content
   *
   * May be null/undefined to indicate "no rules recorded."
   */
  content?: string | null
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
 * Custom Rules Sheet Body
 *
 * Internal renderer that draws the sheet's title, description, and sections.
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
    <SheetContent className="flex flex-col gap-0 sm:max-w-md">
      <SheetHeader className="gap-2">
        <SheetTitle className="flex items-center gap-2 pr-6">
          <span className="truncate">{title}</span>
        </SheetTitle>
        {description && <SheetDescription>{description}</SheetDescription>}
      </SheetHeader>

      <div className="flex flex-col gap-4 px-4 pb-4 overflow-y-auto">
        {sections.map((section, index) => (
          <div
            key={`${section.label}-${index}`}
            className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold">{section.label}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {section.content && section.content.trim().length > 0
                ? section.content
                : 'No rules recorded.'}
            </p>
          </div>
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
  title
}: CustomRulesTextProps): ReactElement {
  if (!custom) return <span className={cn('text-sm', className)}>{label}</span>

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            'text-sm text-left hover:underline focus:outline-none focus-visible:underline cursor-pointer',
            className
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
  title
}: CustomRulesIconButtonProps): ReactElement | null {
  if (!custom) return null

  return (
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

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {variant === 'icon' ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={ariaLabel ?? `View custom rules for ${gearName}`}
            title={ariaLabel ?? `View custom rules for ${gearName}`}
            className={cn('h-8 w-8 shrink-0', className)}>
            <Search className="h-4 w-4" />
          </Button>
        ) : (
          <button
            type="button"
            className={cn(
              'text-sm text-left hover:underline focus:outline-none focus-visible:underline cursor-pointer',
              className
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
            content: loading ? 'Loading...' : (detail?.rules ?? null)
          }
        ]}
      />
    </Sheet>
  )
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
  const [detail, setDetail] = useState<WeaponTypeDetail | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [prevId, setPrevId] = useState<string | null | undefined>(undefined)

  // Fetch weapon type detail when weaponTypeId changes.
  if (prevId !== weaponTypeId) {
    setPrevId(weaponTypeId)
    setDetail(null)
    setLoaded(false)

    if (weaponTypeId)
      getWeaponTypes()
        .then((map) => setDetail(map[weaponTypeId] ?? null))
        .catch((error) =>
          console.error('Custom Weapon Type Rules Fetch Error:', error)
        )
        .finally(() => setLoaded(true))
    else setLoaded(true)
  }

  if (!loaded || !detail?.custom) return null

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

  const overviewParts: string[] = []
  if (tier != null) overviewParts.push(`Tier ${tier}`)
  if (huntXpMilestones && huntXpMilestones.length > 0)
    overviewParts.push(`Hunt XP Milestones: ${huntXpMilestones.join(', ')}`)

  const sections: CustomRulesSection[] = [
    {
      label: 'Overview',
      content: overviewParts.length > 0 ? overviewParts.join('\n') : null
    }
  ]

  if (loading) {
    sections.push({ label: 'Ranks', content: 'Loading...' })
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
      content:
        observationRankUpMilestone != null
          ? `Rank ${observationRankUpMilestone}`
          : null
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
            content: loading ? 'Loading...' : (detail?.rules ?? null)
          }
        ]}
      />
    </Sheet>
  )
}
