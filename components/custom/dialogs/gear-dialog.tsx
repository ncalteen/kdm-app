'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { Constants, Database } from '@/lib/database.types'
import { ERROR_MESSAGE } from '@/lib/messages'
import {
  GearAffinityRequirementDetail,
  GearDetail,
  GearGearCostDetail,
  GearResourceCostDetail,
  GearResourceTypeCostDetail,
  LocationDetail,
  ResourceDetail,
  WeaponTypeDetail
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { GearInputSchema } from '@/schemas/gear'
import {
  Check,
  ChevronsUpDown,
  FootprintsIcon,
  HandMetalIcon,
  HardHatIcon,
  PlusIcon,
  PuzzleIcon,
  RibbonIcon,
  ShirtIcon,
  Trash2Icon
} from 'lucide-react'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useMemo,
  useState
} from 'react'
import { toast } from 'sonner'
import { ZodError } from 'zod'

// Utility Types

/** Affinity Enum */
type Affinity = Database['public']['Enums']['affinity']
/** Armor Location Enum */
type ArmorLocation = Database['public']['Enums']['armor_location']
/** Gear Keyword Enum */
type GearKeyword = Database['public']['Enums']['gear_keyword']
/** Resource Type Enum */
type ResourceType = Database['public']['Enums']['resource_type']

/**
 * Gear Category
 *
 * Drives which conditional fields are shown in the dialog. Persisted as the
 * combination of populated columns (weapon_type_id / armor_location /
 * armor_points / accessory / weapon stats) on the gear row.
 */
export type GearCategory = 'OTHER' | 'WEAPON' | 'ARMOR'

/**
 * Infer the {@link GearCategory} for an existing gear item based on its
 * populated fields. Weapon-specific fields take precedence over armor.
 *
 * @param args Gear Fields to Drive Inference
 * @returns Inferred Gear Category
 */
export function inferGearCategory(args: {
  weapon_type_id?: string | null
  accuracy?: number | null
  speed?: number | null
  strength?: number | null
  armor_location?: ArmorLocation | null
  armor_points?: number | null
  accessory?: boolean | null
}): GearCategory {
  if (
    args.weapon_type_id != null ||
    args.accuracy != null ||
    args.speed != null ||
    args.strength != null
  )
    return 'WEAPON'

  if (
    args.armor_location != null ||
    args.armor_points != null ||
    args.accessory === true
  )
    return 'ARMOR'

  return 'OTHER'
}

/**
 * Gear Dialog Save Payload
 */
export interface GearDialogPayload {
  /** Gear Name */
  gear_name: string
  /** Location ID */
  location_id: string | null
  /** Accessory */
  accessory: boolean | null
  /** Accuracy */
  accuracy: number | null
  /** Affinity Top */
  affinity_top: Affinity | null
  /** Affinity Left */
  affinity_left: Affinity | null
  /** Affinity Right */
  affinity_right: Affinity | null
  /** Affinity Bottom */
  affinity_bottom: Affinity | null
  /** Affinity Bonus */
  affinity_bonus: string | null
  /** Affinity Bonus Requirements */
  affinity_bonus_requirements: GearAffinityRequirementDetail[]
  /** Armor Points */
  armor_points: number | null
  /** Armor Location */
  armor_location: ArmorLocation | null
  /** Keywords */
  keywords: GearKeyword[]
  /** Rules */
  rules: string | null
  /** Speed */
  speed: number | null
  /** Strength */
  strength: number | null
  /** Weapon Type ID */
  weapon_type_id: string | null
  /** Gear Costs */
  gear_costs: GearGearCostDetail[]
  /** Resource Costs */
  resource_costs: GearResourceCostDetail[]
  /** Resource Type Costs */
  resource_type_costs: GearResourceTypeCostDetail[]
}

/**
 * Gear Dialog Properties
 */
interface GearDialogProps {
  /** Dialog Open State */
  open: boolean
  /** Dialog Open/Close Callback */
  onOpenChange: (open: boolean) => void
  /** Gear Save Callback */
  onSave: (data: GearDialogPayload) => void
  /** Save Operation in Progress State */
  saving: boolean
  /** Available Fear (for Cost Selection; Exclude Self) */
  gear: { [key: string]: GearDetail }
  /** Available Locations */
  locations: { [key: string]: LocationDetail }
  /** Available Resources */
  resources: { [key: string]: ResourceDetail }
  /** Available Weapon Types */
  weaponTypes: { [key: string]: WeaponTypeDetail }
  /** Excluded Gear IDs */
  excludedGearIds?: string[]
  /** Initial Name */
  initialName?: string
  /** Initial Location ID */
  initialLocationId?: string | null
  /** Initial Accessory Flag */
  initialAccessory?: boolean | null
  /** Initial Accuracy */
  initialAccuracy?: number | null
  /** Initial Speed */
  initialAffinityTop?: Affinity | null
  /** Initial Strength */
  initialAffinityLeft?: Affinity | null
  /** Initial Affinity Top */
  initialAffinityRight?: Affinity | null
  /** Initial Affinity Bottom */
  initialAffinityBottom?: Affinity | null
  /** Initial Affinity Bonus */
  initialAffinityBonus?: string | null
  /** Initial Affinity Bonus Requirements */
  initialAffinityBonusRequirements?: GearAffinityRequirementDetail[]
  /** Initial Armor Points */
  initialArmorPoints?: number | null
  /** Initial Armor Location */
  initialArmorLocation?: ArmorLocation | null
  /** Initial Keywords */
  initialKeywords?: GearKeyword[]
  /** Initial Rules */
  initialRules?: string | null
  /** Initial Speed */
  initialSpeed?: number | null
  /** Initial Strength */
  initialStrength?: number | null
  /** Initial Weapon Type ID */
  initialWeaponTypeId?: string | null
  /** Initial Gear Costs */
  initialGearCosts?: GearGearCostDetail[]
  /** Initial Resource Costs */
  initialResourceCosts?: GearResourceCostDetail[]
  /** Initial Resource Type Costs */
  initialResourceTypeCosts?: GearResourceTypeCostDetail[]
  /** Dialog Title */
  title: string
  /** Dialog Description */
  description: string
  /** Save Button Label */
  saveLabel?: string
  /** Saving Button Label */
  savingLabel?: string
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
 * Gear Dialog Component
 *
 * Dialog form for creating or editing a custom gear item. Supports the full
 * range of gear attributes including affinity slots, affinity bonus
 * requirements, armor info, weapon stats, keywords, and crafting costs (gear,
 * specific resource, and other resource type).
 *
 * @param props Gear Dialog Properties
 * @returns Gear Dialog Component
 */
export function GearDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  gear,
  locations,
  resources,
  weaponTypes,
  excludedGearIds = [],
  initialName = '',
  initialLocationId = null,
  initialAccessory = null,
  initialAccuracy = null,
  initialAffinityTop = null,
  initialAffinityLeft = null,
  initialAffinityRight = null,
  initialAffinityBottom = null,
  initialAffinityBonus = null,
  initialAffinityBonusRequirements = [],
  initialArmorPoints = null,
  initialArmorLocation = null,
  initialKeywords = [],
  initialRules = null,
  initialSpeed = null,
  initialStrength = null,
  initialWeaponTypeId = null,
  initialGearCosts = [],
  initialResourceCosts = [],
  initialResourceTypeCosts = [],
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: GearDialogProps): ReactElement {
  const [name, setName] = useState(initialName)
  const [category, setCategory] = useState<GearCategory>(() =>
    inferGearCategory({
      weapon_type_id: initialWeaponTypeId,
      accuracy: initialAccuracy,
      speed: initialSpeed,
      strength: initialStrength,
      armor_location: initialArmorLocation,
      armor_points: initialArmorPoints,
      accessory: initialAccessory
    })
  )
  const [locationId, setLocationId] = useState<string | null>(initialLocationId)
  const [accessory, setAccessory] = useState<boolean>(initialAccessory ?? false)
  const [accuracy, setAccuracy] = useState<number | null>(initialAccuracy)
  const [affinityTop, setAffinityTop] = useState<Affinity | null>(
    initialAffinityTop
  )
  const [affinityLeft, setAffinityLeft] = useState<Affinity | null>(
    initialAffinityLeft
  )
  const [affinityRight, setAffinityRight] = useState<Affinity | null>(
    initialAffinityRight
  )
  const [affinityBottom, setAffinityBottom] = useState<Affinity | null>(
    initialAffinityBottom
  )
  const [affinityBonus, setAffinityBonus] = useState<string>(
    initialAffinityBonus ?? ''
  )
  const [affinityBonusRequirements, setAffinityBonusRequirements] = useState<
    GearAffinityRequirementDetail[]
  >(initialAffinityBonusRequirements)
  const [armorPoints, setArmorPoints] = useState<number | null>(
    initialArmorPoints
  )
  const [armorLocation, setArmorLocation] = useState<ArmorLocation | null>(
    initialArmorLocation
  )
  const [keywords, setKeywords] = useState<GearKeyword[]>(initialKeywords)
  const [rules, setRules] = useState<string>(initialRules ?? '')
  const [speed, setSpeed] = useState<number | null>(initialSpeed)
  const [strength, setStrength] = useState<number | null>(initialStrength)
  const [weaponTypeId, setWeaponTypeId] = useState<string | null>(
    initialWeaponTypeId
  )

  const [gearCosts, setGearCosts] =
    useState<GearGearCostDetail[]>(initialGearCosts)
  const [resourceCosts, setResourceCosts] =
    useState<GearResourceCostDetail[]>(initialResourceCosts)
  const [resourceTypeCosts, setResourceTypeCosts] = useState<
    GearResourceTypeCostDetail[]
  >(initialResourceTypeCosts)

  // Popover open state
  const [locationOpen, setLocationOpen] = useState(false)
  const [weaponTypeOpen, setWeaponTypeOpen] = useState(false)
  const [keywordsOpen, setKeywordsOpen] = useState(false)
  const [costGearOpen, setCostGearOpen] = useState<number | null>(null)
  const [costResourceOpen, setCostResourceOpen] = useState<number | null>(null)

  /** Sorted gear (excluding self when editing) */
  const sortedGear = useMemo(() => {
    const excluded = new Set(excludedGearIds)
    return Object.values(gear)
      .filter((g) => !excluded.has(g.id))
      .sort((a, b) => a.gear_name.localeCompare(b.gear_name))
  }, [gear, excludedGearIds])

  /** Sorted locations */
  const sortedLocations = useMemo(
    () =>
      Object.values(locations).sort((a, b) =>
        a.location_name.localeCompare(b.location_name)
      ),
    [locations]
  )

  /** Sorted resources */
  const sortedResources = useMemo(
    () =>
      Object.values(resources).sort((a, b) =>
        a.resource_name.localeCompare(b.resource_name)
      ),
    [resources]
  )

  /** Sorted weapon types */
  const sortedWeaponTypes = useMemo(
    () =>
      Object.values(weaponTypes).sort((a, b) =>
        a.weapon_type_name.localeCompare(b.weapon_type_name)
      ),
    [weaponTypes]
  )

  /**
   * Toggle a gear keyword on or off in the current form state. If the keyword
   * is already present in the keywords array, it will be removed; otherwise,
   * it will be added.
   *
   * @param kw Gear keyword to toggle
   */
  const toggleKeyword = useCallback((kw: GearKeyword) => {
    setKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    )
  }, [])

  /**
   * Handle the form submission. Validates the current form state against the
   * GearInputSchema and, if valid, calls the onSave callback with the parsed
   * payload. If validation fails, displays a toast error with the first
   * validation issue or a generic error message.
   */
  const handleSubmit = useCallback(() => {
    if (saving) return

    const trimmedBonus = affinityBonus.trim()
    const trimmedRules = rules.trim()

    const isWeapon = category === 'WEAPON'
    const isArmor = category === 'ARMOR'

    const payload = {
      category,
      gear_name: name.trim(),
      location_id: locationId,
      accessory: isArmor ? accessory : null,
      // Weapon stats and armor points default to 0 when blank — the numeric
      // inputs render `0` as their placeholder value, so an untouched field is
      // treated as a deliberate zero rather than a missing required value.
      accuracy: isWeapon ? (accuracy ?? 0) : null,
      affinity_top: affinityTop,
      affinity_left: affinityLeft,
      affinity_right: affinityRight,
      affinity_bottom: affinityBottom,
      affinity_bonus: trimmedBonus || null,
      affinity_bonus_requirements: affinityBonusRequirements,
      armor_points: isArmor ? (armorPoints ?? 0) : null,
      armor_location: isArmor ? armorLocation : null,
      keywords,
      rules: trimmedRules || null,
      speed: isWeapon ? (speed ?? 0) : null,
      strength: isWeapon ? (strength ?? 0) : null,
      weapon_type_id: isWeapon ? weaponTypeId : null,
      gear_costs: gearCosts.filter((c) => c.cost_gear_id && c.quantity >= 1),
      resource_costs: resourceCosts.filter(
        (c) => c.resource_id && c.quantity >= 1
      ),
      resource_type_costs: resourceTypeCosts.filter(
        (c) => c.resource_type && c.quantity >= 1
      )
    }

    try {
      const parsed = GearInputSchema.parse(payload)

      // The schema includes `category` only to drive conditional validation;
      // strip it before delegating to the save handler.

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { category: _omitCategory, ...savePayload } = parsed

      onSave(savePayload)
    } catch (error) {
      console.error('Gear Save Error:', error)
      const message =
        error instanceof ZodError
          ? (error.issues[0]?.message ?? ERROR_MESSAGE())
          : ERROR_MESSAGE()
      toast.error(message)
    }
  }, [
    name,
    saving,
    affinityBonus,
    rules,
    category,
    onSave,
    locationId,
    accessory,
    accuracy,
    affinityTop,
    affinityLeft,
    affinityRight,
    affinityBottom,
    affinityBonusRequirements,
    armorPoints,
    armorLocation,
    keywords,
    speed,
    strength,
    weaponTypeId,
    gearCosts,
    resourceCosts,
    resourceTypeCosts
  ])

  /**
   * Whether the current form state would pass schema validation. Drives the
   * submit button's disabled state so the user gets immediate visual feedback
   * when a required field for the selected gear category is missing.
   */
  const isPayloadValid = useMemo(() => {
    const isWeapon = category === 'WEAPON'
    const isArmor = category === 'ARMOR'

    return GearInputSchema.safeParse({
      category,
      gear_name: name.trim(),
      location_id: locationId,
      accessory: isArmor ? accessory : null,
      accuracy: isWeapon ? (accuracy ?? 0) : null,
      affinity_top: affinityTop,
      affinity_left: affinityLeft,
      affinity_right: affinityRight,
      affinity_bottom: affinityBottom,
      affinity_bonus: affinityBonus.trim() || null,
      affinity_bonus_requirements: affinityBonusRequirements,
      armor_points: isArmor ? (armorPoints ?? 0) : null,
      armor_location: isArmor ? armorLocation : null,
      keywords,
      rules: rules.trim() || null,
      speed: isWeapon ? (speed ?? 0) : null,
      strength: isWeapon ? (strength ?? 0) : null,
      weapon_type_id: isWeapon ? weaponTypeId : null,
      gear_costs: gearCosts.filter((c) => c.cost_gear_id && c.quantity >= 1),
      resource_costs: resourceCosts.filter(
        (c) => c.resource_id && c.quantity >= 1
      ),
      resource_type_costs: resourceTypeCosts.filter(
        (c) => c.resource_type && c.quantity >= 1
      )
    }).success
  }, [
    category,
    name,
    locationId,
    accessory,
    accuracy,
    affinityTop,
    affinityLeft,
    affinityRight,
    affinityBottom,
    affinityBonus,
    affinityBonusRequirements,
    armorPoints,
    armorLocation,
    keywords,
    rules,
    speed,
    strength,
    weaponTypeId,
    gearCosts,
    resourceCosts,
    resourceTypeCosts
  ])

  /**
   * Handle pressing Enter in the name input to submit the form.
   */
  const handleNameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit()
    },
    [handleSubmit]
  )

  /** Tailwind background color classes for affinity values. */
  const affinityBg: { [key in Affinity]: string } = {
    BLUE: 'bg-blue-500',
    GREEN: 'bg-green-500',
    RED: 'bg-red-500'
  }

  /** Tailwind text color classes for affinity values (used for icons). */
  const affinityText: { [key in Affinity]: string } = {
    BLUE: 'text-blue-500',
    GREEN: 'text-green-500',
    RED: 'text-red-500'
  }

  /**
   * Render a clickable affinity slot. Opens a popover that lets the user pick a
   * color or clear the slot. When `puzzle` support is enabled, the popover also
   * exposes color-tinted puzzle icons for "puzzle" affinity requirements, and
   * the trigger renders a colored puzzle icon when the current selection is a
   * puzzle variant.
   *
   * @param value Current affinity value, or null for empty.
   * @param onChange Callback to update the slot's color (null clears).
   * @param label Accessible label.
   * @param puzzleOptions Optional puzzle support — current puzzle flag and
   *                      setter. When provided, the popover renders puzzle
   *                      swatches alongside the plain swatches.
   * @returns JSX element for the affinity slot.
   */
  const renderAffinitySquare = (
    value: Affinity | null,
    onChange: (next: Affinity | null) => void,
    label: string,
    puzzleOptions?: {
      puzzle: boolean
      onPuzzleChange: (next: boolean) => void
    }
  ) => {
    const isPuzzle = puzzleOptions?.puzzle === true
    const triggerLabel = isPuzzle ? `${label} (puzzle)` : label

    return (
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={triggerLabel}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-sm border-2 border-background shadow ring-1 ring-border transition-transform hover:scale-110',
              isPuzzle
                ? 'bg-background'
                : value
                  ? affinityBg[value]
                  : 'bg-muted'
            )}>
            {isPuzzle && value && (
              <PuzzleIcon
                className={cn('h-4 w-4', affinityText[value])}
                aria-hidden="true"
              />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex flex-col gap-2">
            {/* Plain affinity swatches */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Clear affinity"
                className={cn(
                  'h-6 w-6 rounded-sm border-2 border-background ring-1 ring-border bg-muted',
                  value === null && 'ring-2 ring-primary'
                )}
                onClick={() => {
                  onChange(null)
                  puzzleOptions?.onPuzzleChange(false)
                }}
              />
              {Constants.public.Enums.affinity.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-label={formatEnumLabel(a)}
                  className={cn(
                    'h-6 w-6 rounded-sm border-2 border-background ring-1 ring-border',
                    affinityBg[a],
                    value === a && !isPuzzle && 'ring-2 ring-primary'
                  )}
                  onClick={() => {
                    onChange(a)
                    puzzleOptions?.onPuzzleChange(false)
                  }}
                />
              ))}
            </div>

            {/* Puzzle-variant swatches (only when puzzle support is on) */}
            {puzzleOptions && (
              <div className="flex items-center gap-1">
                <span className="sr-only">Puzzle affinity options</span>
                {/* Spacer to align puzzle swatches under their color
                    counterparts (skip the "Clear" column). */}
                <div className="h-6 w-6" aria-hidden="true" />

                {Constants.public.Enums.affinity.map((a) => (
                  <button
                    key={`puzzle-${a}`}
                    type="button"
                    aria-label={`${formatEnumLabel(a)} puzzle`}
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-sm border-2 border-background bg-background ring-1 ring-border',
                      value === a && isPuzzle && 'ring-2 ring-primary'
                    )}
                    onClick={() => {
                      onChange(a)
                      puzzleOptions.onPuzzleChange(true)
                    }}>
                    <PuzzleIcon
                      className={cn('h-4 w-4', affinityText[a])}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  /**
   * Render a compact stat slot (small round number input for the weapon/armor
   * stat tower at the top-left of the card).
   *
   * @param id Input ID
   * @param label Accessible Label / Tooltip
   * @param value Current Value
   * @param onChange Update Callback
   * @returns JSX Element
   */
  const renderStatSlot = (
    id: string,
    label: string,
    value: number,
    onChange: (next: number | null) => void
  ) => (
    <div className="flex flex-col items-center">
      <NumericInput
        className="w-12 h-9 text-center text-sm"
        label={label}
        min={0}
        value={value ?? 0}
        onChange={onChange}
      />
    </div>
  )

  /** Lucide icon component for each armor location. */
  const armorLocationIcons: {
    [key in ArmorLocation]: typeof HandMetalIcon
  } = {
    ARMS: HandMetalIcon,
    CHEST: ShirtIcon,
    FEET: FootprintsIcon,
    HEAD: HardHatIcon,
    WAIST: RibbonIcon
  }

  /**
   * Render the armor location picker. Mirrors the affinity-bonus popover — the
   * trigger shows the current selection's icon (or a neutral square when
   * cleared) and the popover lets the user pick any location or clear it.
   *
   * @returns JSX Element
   */
  const renderArmorLocationPicker = () => {
    const SelectedIcon = armorLocation
      ? armorLocationIcons[armorLocation]
      : null
    const triggerLabel = armorLocation
      ? `Armor location: ${formatEnumLabel(armorLocation)}`
      : 'Armor location (none)'

    return (
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={triggerLabel}
            title={triggerLabel}
            className={cn(
              'flex h-9 w-12 items-center justify-center rounded-md border border-input bg-transparent text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground'
            )}>
            {SelectedIcon ? (
              <SelectedIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <span aria-hidden="true">—</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Clear armor location"
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-sm border-2 border-background ring-1 ring-border bg-muted text-xs',
                armorLocation === null && 'ring-2 ring-primary'
              )}
              onClick={() => setArmorLocation(null)}>
              —
            </button>
            {Constants.public.Enums.armor_location.map((al) => {
              const Icon = armorLocationIcons[al]
              return (
                <button
                  key={al}
                  type="button"
                  aria-label={formatEnumLabel(al)}
                  title={formatEnumLabel(al)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-sm border-2 border-background bg-background ring-1 ring-border',
                    armorLocation === al && 'ring-2 ring-primary'
                  )}
                  onClick={() => setArmorLocation(al)}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Top Row: Gear Type + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="gear-type">Gear Type</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as GearCategory)}>
                <SelectTrigger
                  id="gear-type"
                  aria-label="Gear type selector"
                  className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OTHER">Other</SelectItem>
                  <SelectItem value="WEAPON">Weapon</SelectItem>
                  <SelectItem value="ARMOR">Armor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Location (optional)</Label>
              <Popover
                modal={true}
                open={locationOpen}
                onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={locationOpen}
                    aria-label="Location selector"
                    className="justify-between w-full">
                    {locationId && locations[locationId]
                      ? locations[locationId].location_name
                      : 'Select location...'}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Search locations..." />
                    <CommandList>
                      <CommandEmpty>No locations found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__none__"
                          onSelect={() => {
                            setLocationId(null)
                            setLocationOpen(false)
                          }}>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              locationId === null ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          None
                        </CommandItem>
                        {sortedLocations.map((l) => (
                          <CommandItem
                            key={l.id}
                            value={l.id}
                            keywords={[l.location_name]}
                            onSelect={() => {
                              setLocationId(l.id)
                              setLocationOpen(false)
                            }}>
                            <Check
                              className={cn(
                                'h-4 w-4',
                                locationId === l.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {l.location_name}
                            {l.custom && (
                              <Badge
                                variant="outline"
                                className="ml-auto text-xs">
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

          {/* Card-Shaped Editor */}
          <div className="relative mx-auto w-full max-w-md rounded-xl border-2 bg-muted/10 px-6 py-8 shadow-inner">
            {/* Top Affinity Slot */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              {renderAffinitySquare(
                affinityTop,
                setAffinityTop,
                'Top affinity slot'
              )}
            </div>
            {/* Left Affinity Slot */}
            <div className="absolute top-1/2 -left-3 -translate-y-1/2">
              {renderAffinitySquare(
                affinityLeft,
                setAffinityLeft,
                'Left affinity slot'
              )}
            </div>
            {/* Right Affinity Slot */}
            <div className="absolute top-1/2 -right-3 -translate-y-1/2">
              {renderAffinitySquare(
                affinityRight,
                setAffinityRight,
                'Right affinity slot'
              )}
            </div>
            {/* Bottom Affinity Slot */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              {renderAffinitySquare(
                affinityBottom,
                setAffinityBottom,
                'Bottom affinity slot'
              )}
            </div>

            {/* Header Row: Stats (Weapon/Armor) + Name/Keywords */}
            <div className="flex items-start gap-3">
              {/* Stats
                  Weapon: Speed/Accuracy/Strength
                  Armor: Armor Points + Armor Location)
              */}
              <div className="flex w-16 shrink-0 flex-col items-center gap-1">
                {category === 'WEAPON' && (
                  <>
                    {renderStatSlot(
                      'gear-speed',
                      'Speed',
                      speed ?? 0,
                      setSpeed
                    )}
                    {renderStatSlot(
                      'gear-accuracy',
                      'Accuracy',
                      accuracy ?? 0,
                      setAccuracy
                    )}
                    {renderStatSlot(
                      'gear-strength',
                      'Strength',
                      strength ?? 0,
                      setStrength
                    )}
                  </>
                )}
                {category === 'ARMOR' && (
                  <>
                    {renderStatSlot(
                      'gear-armor-points',
                      'Armor Points',
                      armorPoints ?? 0,
                      setArmorPoints
                    )}
                    {renderArmorLocationPicker()}
                  </>
                )}
              </div>

              {/* Center Column: Name + Keywords + Rules */}
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-col items-center gap-1">
                  <Input
                    id="gear-name"
                    name="gear-name"
                    placeholder="Gear Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    className="border-0 bg-transparent text-center text-lg font-bold shadow-none focus-visible:bg-background focus-visible:ring-1"
                  />
                  <Popover
                    modal={true}
                    open={keywordsOpen}
                    onOpenChange={setKeywordsOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={keywordsOpen}
                        aria-label="Keywords selector"
                        className="text-center text-xs italic text-muted-foreground hover:text-foreground">
                        {keywords.length === 0
                          ? '+ add keywords'
                          : keywords.map((k) => formatEnumLabel(k)).join(', ')}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Search keywords..." />
                        <CommandList>
                          <CommandEmpty>No keywords found.</CommandEmpty>
                          <CommandGroup>
                            {Constants.public.Enums.gear_keyword.map((kw) => {
                              const selected = keywords.includes(kw)
                              return (
                                <CommandItem
                                  key={kw}
                                  value={kw}
                                  onSelect={() => toggleKeyword(kw)}>
                                  <Check
                                    className={cn(
                                      'h-4 w-4',
                                      selected ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  {formatEnumLabel(kw)}
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Rules */}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="gear-rules" className="sr-only">
                    Rules
                  </Label>
                  <Textarea
                    id="gear-rules"
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    placeholder="Special rules text."
                    rows={3}
                    className="resize-none border-0 bg-transparent text-center text-sm shadow-none focus-visible:bg-background focus-visible:ring-1"
                  />
                </div>
              </div>

              {/* Right Spacer (balance stats tower width) */}
              <div className="w-16 shrink-0" />
            </div>

            {/* Affinity Bonus + Requirements */}
            <div className="mt-3 flex items-start gap-3 border-t border-muted pt-3">
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  aria-label="Add affinity bonus requirement"
                  className="flex h-6 items-center gap-1 rounded border border-dashed border-muted-foreground/30 px-1 text-[10px] uppercase tracking-wide text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setAffinityBonusRequirements((prev) => [
                      ...prev,
                      { affinity: 'BLUE', puzzle: false }
                    ])
                  }>
                  <PlusIcon className="h-3 w-3" />
                  req
                </button>
                {affinityBonusRequirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1"
                    aria-label={`Requirement ${index + 1}`}>
                    {renderAffinitySquare(
                      req.affinity,
                      (next) =>
                        setAffinityBonusRequirements((prev) =>
                          prev.map((r, i) =>
                            i === index && next ? { ...r, affinity: next } : r
                          )
                        ),
                      `Requirement ${index + 1} affinity`,
                      {
                        puzzle: req.puzzle,
                        onPuzzleChange: (next) =>
                          setAffinityBonusRequirements((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, puzzle: next } : r
                            )
                          )
                      }
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setAffinityBonusRequirements((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      aria-label={`Remove requirement ${index + 1}`}
                      className="text-muted-foreground hover:text-destructive">
                      <Trash2Icon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <Textarea
                id="gear-affinity-bonus"
                aria-label="Affinity bonus"
                value={affinityBonus}
                onChange={(e) => setAffinityBonus(e.target.value)}
                placeholder="Affinity bonus granted when requirements are met."
                rows={2}
                className="flex-1 resize-none border-0 bg-transparent text-sm italic shadow-none focus-visible:bg-background focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Below-Card Controls */}
          {category === 'WEAPON' && (
            <div className="flex flex-col gap-2">
              <Label>Weapon Type</Label>
              <Popover
                modal={true}
                open={weaponTypeOpen}
                onOpenChange={setWeaponTypeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={weaponTypeOpen}
                    aria-label="Weapon type selector"
                    className="justify-between w-full">
                    {weaponTypeId && weaponTypes[weaponTypeId]
                      ? weaponTypes[weaponTypeId].weapon_type_name
                      : 'Select weapon type...'}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Search weapon types..." />
                    <CommandList>
                      <CommandEmpty>No weapon types found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__none__"
                          onSelect={() => {
                            setWeaponTypeId(null)
                            setWeaponTypeOpen(false)
                          }}>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              weaponTypeId === null
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          None
                        </CommandItem>
                        {sortedWeaponTypes.map((w) => (
                          <CommandItem
                            key={w.id}
                            value={w.id}
                            keywords={[w.weapon_type_name]}
                            onSelect={() => {
                              setWeaponTypeId(w.id)
                              setWeaponTypeOpen(false)
                            }}>
                            <Check
                              className={cn(
                                'h-4 w-4',
                                weaponTypeId === w.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {w.weapon_type_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {category === 'ARMOR' && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="gear-accessory"
                checked={accessory}
                onCheckedChange={(v) => setAccessory(v === true)}
              />
              <Label htmlFor="gear-accessory" className="cursor-pointer">
                Accessory
              </Label>
            </div>
          )}

          {/* Gear Costs */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Gear Costs (optional)</Label>
              <Button
                aria-label="Add gear cost"
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setGearCosts((prev) => [
                    ...prev,
                    { cost_gear_id: '', quantity: 1 }
                  ])
                }>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {gearCosts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No gear is required to craft this item.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {gearCosts.map((cost, index) => {
                  const selectedGear = cost.cost_gear_id
                    ? gear[cost.cost_gear_id]
                    : null
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <Popover
                        modal={true}
                        open={costGearOpen === index}
                        onOpenChange={(o) => setCostGearOpen(o ? index : null)}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={costGearOpen === index}
                            aria-label={`Cost gear ${index + 1} selector`}
                            className="justify-between flex-1">
                            {selectedGear
                              ? selectedGear.gear_name
                              : 'Select gear...'}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Search gear..." />
                            <CommandList>
                              <CommandEmpty>No gear found.</CommandEmpty>
                              <CommandGroup>
                                {sortedGear.map((g) => (
                                  <CommandItem
                                    key={g.id}
                                    value={g.id}
                                    keywords={[g.gear_name]}
                                    onSelect={() => {
                                      setGearCosts((prev) =>
                                        prev.map((c, i) =>
                                          i === index
                                            ? { ...c, cost_gear_id: g.id }
                                            : c
                                        )
                                      )
                                      setCostGearOpen(null)
                                    }}>
                                    <Check
                                      className={cn(
                                        'h-4 w-4',
                                        cost.cost_gear_id === g.id
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {g.gear_name}
                                    {g.custom && (
                                      <Badge
                                        variant="outline"
                                        className="ml-auto text-xs">
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
                      <Input
                        type="number"
                        min={1}
                        value={cost.quantity}
                        onChange={(e) => {
                          const parsed = Number.parseInt(e.target.value, 10)
                          const next =
                            Number.isNaN(parsed) || parsed < 1 ? 1 : parsed
                          setGearCosts((prev) =>
                            prev.map((c, i) =>
                              i === index ? { ...c, quantity: next } : c
                            )
                          )
                        }}
                        className="w-20"
                        aria-label={`Cost gear ${index + 1} quantity`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setGearCosts((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        aria-label={`Remove cost gear ${index + 1}`}>
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Resource Costs */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Resource Costs (optional)</Label>
              <Button
                aria-label="Add resource cost"
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setResourceCosts((prev) => [
                    ...prev,
                    { resource_id: '', quantity: 1 }
                  ])
                }>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {resourceCosts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No specific resources are required to craft this item.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {resourceCosts.map((cost, index) => {
                  const selectedResource = cost.resource_id
                    ? resources[cost.resource_id]
                    : null
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <Popover
                        modal={true}
                        open={costResourceOpen === index}
                        onOpenChange={(o) =>
                          setCostResourceOpen(o ? index : null)
                        }>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={costResourceOpen === index}
                            aria-label={`Cost resource ${index + 1} selector`}
                            className="justify-between flex-1">
                            {selectedResource
                              ? selectedResource.resource_name
                              : 'Select resource...'}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Search resources..." />
                            <CommandList>
                              <CommandEmpty>No resources found.</CommandEmpty>
                              <CommandGroup>
                                {sortedResources.map((r) => (
                                  <CommandItem
                                    key={r.id}
                                    value={r.id}
                                    keywords={[r.resource_name]}
                                    onSelect={() => {
                                      setResourceCosts((prev) =>
                                        prev.map((c, i) =>
                                          i === index
                                            ? { ...c, resource_id: r.id }
                                            : c
                                        )
                                      )
                                      setCostResourceOpen(null)
                                    }}>
                                    <Check
                                      className={cn(
                                        'h-4 w-4',
                                        cost.resource_id === r.id
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {r.resource_name}
                                    {r.custom && (
                                      <Badge
                                        variant="outline"
                                        className="ml-auto text-xs">
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
                      <Input
                        type="number"
                        min={1}
                        value={cost.quantity}
                        onChange={(e) => {
                          const parsed = Number.parseInt(e.target.value, 10)
                          const next =
                            Number.isNaN(parsed) || parsed < 1 ? 1 : parsed
                          setResourceCosts((prev) =>
                            prev.map((c, i) =>
                              i === index ? { ...c, quantity: next } : c
                            )
                          )
                        }}
                        className="w-20"
                        aria-label={`Cost resource ${index + 1} quantity`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setResourceCosts((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        aria-label={`Remove cost resource ${index + 1}`}>
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Resource Type Costs */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Resource Type Costs (optional)</Label>
              <Button
                aria-label="Add resource type cost"
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setResourceTypeCosts((prev) => [
                    ...prev,
                    {
                      resource_type: Constants.public.Enums
                        .resource_type[0] as ResourceType,
                      quantity: 1
                    }
                  ])
                }>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {resourceTypeCosts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No resource type requirements.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {resourceTypeCosts.map((cost, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={cost.resource_type}
                      onValueChange={(value) =>
                        setResourceTypeCosts((prev) =>
                          prev.map((c, i) =>
                            i === index
                              ? { ...c, resource_type: value as ResourceType }
                              : c
                          )
                        )
                      }>
                      <SelectTrigger
                        className="flex-1"
                        aria-label={`Resource type ${index + 1} selector`}>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Constants.public.Enums.resource_type.map((type) => (
                          <SelectItem key={type} value={type}>
                            {formatEnumLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      value={cost.quantity}
                      onChange={(e) => {
                        const parsed = Number.parseInt(e.target.value, 10)
                        const next =
                          Number.isNaN(parsed) || parsed < 1 ? 1 : parsed
                        setResourceTypeCosts((prev) =>
                          prev.map((c, i) =>
                            i === index ? { ...c, quantity: next } : c
                          )
                        )
                      }}
                      className="w-20"
                      aria-label={`Resource type ${index + 1} quantity`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setResourceTypeCosts((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      aria-label={`Remove resource type ${index + 1}`}>
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isPayloadValid || saving}>
            {saving ? savingLabel : saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
