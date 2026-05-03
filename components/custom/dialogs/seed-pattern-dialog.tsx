'use client'

import { MarkdownSyntaxHelp } from '@/components/generic/markdown-syntax-help'
import { SafeMarkdownEditor } from '@/components/generic/safe-markdown-editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  GearDetail,
  NemesisDetail,
  QuarryDetail,
  SeedPatternGearCostDetail
} from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Check,
  ChevronsUpDown,
  PlusIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useMemo,
  useState
} from 'react'

/** No selection sentinel value */
const NO_SELECTION = '__none__'

/**
 * Seed Pattern Dialog Save Payload
 */
export interface SeedPatternDialogPayload {
  /** Seed Pattern Name */
  seed_pattern_name: string
  /** Crafting Limit */
  crafting_limit: number | null
  /** Crafting Steps */
  crafting_steps: string | null
  /** Endeavor Cost */
  endeavor_cost: number | null
  /** Era */
  era: number | null
  /** Keywords */
  keywords: string[]
  /** Requirements */
  requirements: string | null
  /** Crafted Gear ID */
  crafted_gear_id: string | null
  /** Gear Costs Required to Craft the Seed Pattern */
  gear_costs: SeedPatternGearCostDetail[]
}

/**
 * Seed Pattern Dialog Properties
 */
interface SeedPatternDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when seed pattern is saved */
  onSave: (data: SeedPatternDialogPayload) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Available gear to choose from */
  gear: { [key: string]: GearDetail }
  /** Available quarries to populate keyword choices */
  quarries: { [key: string]: QuarryDetail }
  /** Available nemeses to populate keyword choices */
  nemeses: { [key: string]: NemesisDetail }
  /** Initial seed pattern name (for editing) */
  initialName?: string
  /** Initial crafting limit (for editing) */
  initialCraftingLimit?: number | null
  /** Initial crafting steps (for editing) */
  initialCraftingSteps?: string
  /** Initial endeavor cost (for editing) */
  initialEndeavorCost?: number | null
  /** Initial era (for editing) */
  initialEra?: number | null
  /** Initial keywords (for editing) */
  initialKeywords?: string[]
  /** Initial requirements (for editing) */
  initialRequirements?: string
  /** Initial crafted gear ID (for editing) */
  initialCraftedGearId?: string | null
  /** Initial gear costs (for editing) */
  initialGearCosts?: SeedPatternGearCostDetail[]
  /** Dialog title */
  title: string
  /** Dialog description */
  description: string
  /** Save button label */
  saveLabel?: string
  /** Saving button label */
  savingLabel?: string
}

/**
 * Seed Pattern Dialog Component
 *
 * Dialog form for creating or editing a custom seed pattern. Supports name,
 * crafting limit, crafting steps, endeavor cost, era, keywords, requirements,
 * and crafted gear.
 *
 * @param props Seed Pattern Dialog Properties
 * @returns Seed Pattern Dialog Component
 */
export function SeedPatternDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  gear,
  quarries,
  nemeses,
  initialName = '',
  initialCraftingLimit = null,
  initialCraftingSteps = '',
  initialEndeavorCost = null,
  initialEra = null,
  initialKeywords = [],
  initialRequirements = '',
  initialCraftedGearId = null,
  initialGearCosts = [],
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: SeedPatternDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [craftingLimit, setCraftingLimit] = useState<string>(
    initialCraftingLimit?.toString() ?? ''
  )
  const [craftingSteps, setCraftingSteps] = useState(initialCraftingSteps)
  const [endeavorCost, setEndeavorCost] = useState<string>(
    initialEndeavorCost?.toString() ?? ''
  )
  const [era, setEra] = useState<string>(initialEra?.toString() ?? '')
  const [keywords, setKeywords] = useState<string[]>(initialKeywords)
  const [keywordsOpen, setKeywordsOpen] = useState(false)
  const [requirements, setRequirements] = useState(initialRequirements)
  const [craftedGearId, setCraftedGearId] = useState<string | null>(
    initialCraftedGearId
  )
  const [gearOpen, setGearOpen] = useState(false)
  const [gearCosts, setGearCosts] =
    useState<SeedPatternGearCostDetail[]>(initialGearCosts)
  const [costGearOpen, setCostGearOpen] = useState<number | null>(null)

  /** Sorted gear for dropdown */
  const sortedGear = useMemo(
    () =>
      Object.values(gear).sort((a, b) =>
        a.gear_name.localeCompare(b.gear_name)
      ),
    [gear]
  )

  /**
   * De-duplicated, alphabetically sorted union of quarry and nemesis monster
   * names. Used to populate the keywords selector.
   */
  const monsterNameOptions = useMemo(() => {
    // Map of monster name -> whether any source for that name is custom.
    const map = new Map<string, boolean>()
    const setOrUpgrade = (name: string, custom: boolean) => {
      map.set(name, (map.get(name) ?? false) || custom)
    }
    for (const q of Object.values(quarries))
      setOrUpgrade(q.monster_name, !!q.custom)
    for (const n of Object.values(nemeses))
      setOrUpgrade(n.monster_name, !!n.custom)
    // Preserve any pre-existing keywords that no longer match a known monster
    // so users can still see and remove them.
    for (const k of keywords) if (!map.has(k)) map.set(k, false)
    return [...map.entries()]
      .map(([name, custom]) => ({ name, custom }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [quarries, nemeses, keywords])

  const toggleKeyword = useCallback((name: string) => {
    setKeywords((prev) =>
      prev.includes(name) ? prev.filter((k) => k !== name) : [...prev, name]
    )
  }, [])

  const handleRemoveKeyword = useCallback(
    (keyword: string) => {
      setKeywords(keywords.filter((k) => k !== keyword))
    },
    [keywords]
  )

  /** Parse a string into a non-negative integer, or null when blank/invalid. */
  const parseIntOrNull = useCallback((value: string): number | null => {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = Number.parseInt(trimmed, 10)
    if (Number.isNaN(parsed) || parsed < 0) return null
    return parsed
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    // Era is constrained to 1-4 in the database; clamp to that window.
    const parsedEra = parseIntOrNull(era)
    const clampedEra =
      parsedEra !== null ? Math.min(4, Math.max(1, parsedEra)) : null

    // Filter out incomplete or invalid gear cost rows.
    const cleanedGearCosts = gearCosts.filter(
      (c) => c.cost_gear_id && c.quantity >= 1
    )

    onSave({
      seed_pattern_name: trimmed,
      crafting_limit: parseIntOrNull(craftingLimit),
      crafting_steps: craftingSteps.trim() ? craftingSteps.trim() : null,
      endeavor_cost: parseIntOrNull(endeavorCost),
      era: clampedEra,
      keywords,
      requirements: requirements.trim() ? requirements.trim() : null,
      crafted_gear_id: craftedGearId,
      gear_costs: cleanedGearCosts
    })
  }, [
    name,
    saving,
    parseIntOrNull,
    era,
    onSave,
    craftingLimit,
    craftingSteps,
    endeavorCost,
    keywords,
    requirements,
    craftedGearId,
    gearCosts
  ])

  /** Save on Enter in the name field */
  const handleNameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit()
    },
    [handleSubmit]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="seed-pattern-name">Seed Pattern Name</Label>
            <Input
              id="seed-pattern-name"
              name="seed-pattern-name"
              placeholder="Enter seed pattern name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
            />
          </div>

          {/* Numeric fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="seed-pattern-era">Era (1-4)</Label>
              <Input
                id="seed-pattern-era"
                type="number"
                min={1}
                max={4}
                value={era}
                onChange={(e) => setEra(e.target.value)}
                placeholder="—"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="seed-pattern-crafting-limit">
                Crafting Limit
              </Label>
              <Input
                id="seed-pattern-crafting-limit"
                type="number"
                min={0}
                value={craftingLimit}
                onChange={(e) => setCraftingLimit(e.target.value)}
                placeholder="—"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="seed-pattern-endeavor-cost">Endeavor Cost</Label>
              <Input
                id="seed-pattern-endeavor-cost"
                type="number"
                min={0}
                value={endeavorCost}
                onChange={(e) => setEndeavorCost(e.target.value)}
                placeholder="—"
              />
            </div>
          </div>

          {/* Crafted Gear */}
          <div className="flex flex-col gap-2">
            <Label>Crafted Gear</Label>
            <Popover modal={true} open={gearOpen} onOpenChange={setGearOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={gearOpen}
                  aria-label="Crafted gear selector"
                  className="justify-between w-full">
                  {craftedGearId && gear[craftedGearId]
                    ? gear[craftedGearId].gear_name
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
                      <CommandItem
                        value={NO_SELECTION}
                        onSelect={() => {
                          setCraftedGearId(null)
                          setGearOpen(false)
                        }}>
                        <Check
                          className={cn(
                            'h-4 w-4',
                            craftedGearId === null ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        None
                      </CommandItem>
                      {sortedGear.map((g) => (
                        <CommandItem
                          key={g.id}
                          value={g.gear_name}
                          onSelect={() => {
                            setCraftedGearId(g.id)
                            setGearOpen(false)
                          }}>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              craftedGearId === g.id
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
          </div>

          {/* Gear Costs */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Gear Costs (optional)</Label>
              <Button
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
                No gear is required to craft this seed pattern.
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
                        onOpenChange={(open) =>
                          setCostGearOpen(open ? index : null)
                        }>
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
                                    value={g.gear_name}
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

          {/* Keywords */}
          <div className="flex flex-col gap-2">
            <Label>Keywords (optional)</Label>
            <p className="text-xs text-muted-foreground">
              Choose the quarries and nemeses this seed pattern is associated
              with. Settlements use these keywords to determine which seed
              patterns are available based on the monsters they hunt.
            </p>
            <Popover
              modal={true}
              open={keywordsOpen}
              onOpenChange={setKeywordsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={keywordsOpen}
                  aria-label="Keywords selector"
                  className="justify-between w-full">
                  {keywords.length === 0
                    ? 'Select monsters...'
                    : `${keywords.length} selected`}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search monsters..." />
                  <CommandList>
                    <CommandEmpty>No monsters found.</CommandEmpty>
                    <CommandGroup>
                      {monsterNameOptions.map(({ name, custom }) => {
                        const selected = keywords.includes(name)
                        return (
                          <CommandItem
                            key={name}
                            value={name}
                            onSelect={() => toggleKeyword(name)}>
                            <Check
                              className={cn(
                                'h-4 w-4',
                                selected ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {name}
                            {custom && (
                              <Badge
                                variant="outline"
                                className="ml-auto text-xs">
                                Custom
                              </Badge>
                            )}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {keywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="text-xs flex items-center gap-1">
                    {keyword}
                    <button
                      type="button"
                      aria-label={`Remove keyword ${keyword}`}
                      className="hover:text-destructive"
                      onClick={() => handleRemoveKeyword(keyword)}>
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Crafting Steps */}
          <div className="flex flex-col gap-2" data-color-mode={resolvedTheme}>
            <Label>Crafting Steps (optional)</Label>
            <SafeMarkdownEditor
              value={craftingSteps}
              onChange={(val) => setCraftingSteps(val ?? '')}
              height={200}
              preview="edit"
            />
            <MarkdownSyntaxHelp />
          </div>

          {/* Requirements */}
          <div className="flex flex-col gap-2" data-color-mode={resolvedTheme}>
            <Label>Requirements (optional)</Label>
            <SafeMarkdownEditor
              value={requirements}
              onChange={(val) => setRequirements(val ?? '')}
              height={200}
              preview="edit"
            />
            <MarkdownSyntaxHelp />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || saving}>
            {saving ? savingLabel : saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
