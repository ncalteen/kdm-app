'use client'

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Constants } from '@/lib/database.types'
import {
  GearDetail,
  InnovationDetail,
  PatternGearCostDetail,
  PatternResourceCostDetail,
  PatternResourceTypeCostDetail,
  ResourceDetail
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, PlusIcon, Trash2Icon } from 'lucide-react'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useMemo,
  useState
} from 'react'

/** Resource type enum */
type ResourceType = (typeof Constants.public.Enums.resource_type)[number]

/**
 * Pattern Dialog Save Payload
 */
export interface PatternDialogPayload {
  /** Pattern Name */
  pattern_name: string
  /** Crafting Limit */
  crafting_limit: number | null
  /** Endeavor Cost */
  endeavor_cost: number | null
  /** Crafted Gear ID */
  crafted_gear_id: string | null
  /** Gear Costs */
  gear_costs: PatternGearCostDetail[]
  /** Resource Costs */
  resource_costs: PatternResourceCostDetail[]
  /** Resource Type Costs */
  resource_type_costs: PatternResourceTypeCostDetail[]
  /** Innovation Requirement IDs */
  innovation_requirement_ids: string[]
}

/**
 * Pattern Dialog Properties
 */
interface PatternDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when pattern is saved */
  onSave: (data: PatternDialogPayload) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Available gear */
  gear: { [key: string]: GearDetail }
  /** Available resources */
  resources: { [key: string]: ResourceDetail }
  /** Available innovations */
  innovations: { [key: string]: InnovationDetail }
  /** Initial pattern name (for editing) */
  initialName?: string
  /** Initial crafting limit (for editing) */
  initialCraftingLimit?: number | null
  /** Initial endeavor cost (for editing) */
  initialEndeavorCost?: number | null
  /** Initial crafted gear ID (for editing) */
  initialCraftedGearId?: string | null
  /** Initial gear costs (for editing) */
  initialGearCosts?: PatternGearCostDetail[]
  /** Initial resource costs (for editing) */
  initialResourceCosts?: PatternResourceCostDetail[]
  /** Initial resource type costs (for editing) */
  initialResourceTypeCosts?: PatternResourceTypeCostDetail[]
  /** Initial innovation requirements (for editing) */
  initialInnovationRequirementIds?: string[]
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
 * Format an enum key like RAW_HIDE into "Raw Hide".
 *
 * @param value Enum key to format
 * @returns Formatted string
 */
function formatEnumLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Pattern Dialog Component
 *
 * Dialog form for creating or editing a custom pattern. Supports name,
 * crafting limit, endeavor cost, crafted gear, gear costs, specific resource
 * costs, generic resource type costs, and innovation requirements.
 *
 * @param props Pattern Dialog Properties
 * @returns Pattern Dialog Component
 */
export function PatternDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  gear,
  resources,
  innovations,
  initialName = '',
  initialCraftingLimit = null,
  initialEndeavorCost = null,
  initialCraftedGearId = null,
  initialGearCosts = [],
  initialResourceCosts = [],
  initialResourceTypeCosts = [],
  initialInnovationRequirementIds = [],
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: PatternDialogProps): ReactElement {
  const [name, setName] = useState(initialName)
  const [craftingLimit, setCraftingLimit] = useState<string>(
    initialCraftingLimit?.toString() ?? ''
  )
  const [endeavorCost, setEndeavorCost] = useState<string>(
    initialEndeavorCost?.toString() ?? ''
  )
  const [craftedGearId, setCraftedGearId] = useState<string | null>(
    initialCraftedGearId
  )
  const [craftedGearOpen, setCraftedGearOpen] = useState(false)

  const [gearCosts, setGearCosts] =
    useState<PatternGearCostDetail[]>(initialGearCosts)
  const [costGearOpen, setCostGearOpen] = useState<number | null>(null)

  const [resourceCosts, setResourceCosts] =
    useState<PatternResourceCostDetail[]>(initialResourceCosts)
  const [costResourceOpen, setCostResourceOpen] = useState<number | null>(null)

  const [resourceTypeCosts, setResourceTypeCosts] = useState<
    PatternResourceTypeCostDetail[]
  >(initialResourceTypeCosts)

  const [innovationIds, setInnovationIds] = useState<string[]>(
    initialInnovationRequirementIds
  )
  const [innovationsOpen, setInnovationsOpen] = useState(false)

  /** Sorted gear for dropdowns */
  const sortedGear = useMemo(
    () =>
      Object.values(gear).sort((a, b) =>
        a.gear_name.localeCompare(b.gear_name)
      ),
    [gear]
  )

  /** Sorted resources for dropdowns */
  const sortedResources = useMemo(
    () =>
      Object.values(resources).sort((a, b) =>
        a.resource_name.localeCompare(b.resource_name)
      ),
    [resources]
  )

  /** Sorted innovations for dropdowns */
  const sortedInnovations = useMemo(
    () =>
      Object.values(innovations).sort((a, b) =>
        a.innovation_name.localeCompare(b.innovation_name)
      ),
    [innovations]
  )

  /** Parse a string into a non-negative integer, or null when blank/invalid. */
  const parseIntOrNull = useCallback((value: string): number | null => {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = Number.parseInt(trimmed, 10)
    if (Number.isNaN(parsed) || parsed < 0) return null
    return parsed
  }, [])

  const toggleInnovation = useCallback((id: string) => {
    setInnovationIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    onSave({
      pattern_name: trimmed,
      crafting_limit: parseIntOrNull(craftingLimit),
      endeavor_cost: parseIntOrNull(endeavorCost),
      crafted_gear_id: craftedGearId,
      gear_costs: gearCosts.filter((c) => c.cost_gear_id && c.quantity >= 1),
      resource_costs: resourceCosts.filter(
        (c) => c.resource_id && c.quantity >= 1
      ),
      resource_type_costs: resourceTypeCosts.filter(
        (c) => c.resource_type && c.quantity >= 1
      ),
      innovation_requirement_ids: innovationIds
    })
  }, [
    name,
    saving,
    parseIntOrNull,
    craftingLimit,
    endeavorCost,
    craftedGearId,
    gearCosts,
    resourceCosts,
    resourceTypeCosts,
    innovationIds,
    onSave
  ])

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
            <Label htmlFor="pattern-name">Pattern Name</Label>
            <Input
              id="pattern-name"
              name="pattern-name"
              placeholder="Enter pattern name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
            />
          </div>

          {/* Numeric fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pattern-crafting-limit">Crafting Limit</Label>
              <Input
                id="pattern-crafting-limit"
                type="number"
                min={0}
                value={craftingLimit}
                onChange={(e) => setCraftingLimit(e.target.value)}
                placeholder="—"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pattern-endeavor-cost">Endeavor Cost</Label>
              <Input
                id="pattern-endeavor-cost"
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
            <Popover
              modal={true}
              open={craftedGearOpen}
              onOpenChange={setCraftedGearOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={craftedGearOpen}
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
                        value="__none__"
                        onSelect={() => {
                          setCraftedGearId(null)
                          setCraftedGearOpen(false)
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
                            setCraftedGearOpen(false)
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
                No gear is required to craft this pattern.
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

          {/* Resource Costs */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Resource Costs (optional)</Label>
              <Button
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
                No specific resources are required to craft this pattern.
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
                        onOpenChange={(open) =>
                          setCostResourceOpen(open ? index : null)
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
                                    value={r.resource_name}
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
                No generic resource type requirements.
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

          {/* Innovation Requirements */}
          <div className="flex flex-col gap-2">
            <Label>Innovation Requirements (optional)</Label>
            <p className="text-xs text-muted-foreground">
              The settlement must have all selected innovations to craft this
              pattern.
            </p>
            <Popover
              modal={true}
              open={innovationsOpen}
              onOpenChange={setInnovationsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={innovationsOpen}
                  aria-label="Innovation requirements selector"
                  className="justify-between w-full">
                  {innovationIds.length === 0
                    ? 'Select innovations...'
                    : `${innovationIds.length} selected`}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search innovations..." />
                  <CommandList>
                    <CommandEmpty>No innovations found.</CommandEmpty>
                    <CommandGroup>
                      {sortedInnovations.map((innovation) => {
                        const selected = innovationIds.includes(innovation.id)
                        return (
                          <CommandItem
                            key={innovation.id}
                            value={innovation.innovation_name}
                            onSelect={() => toggleInnovation(innovation.id)}>
                            <Check
                              className={cn(
                                'h-4 w-4',
                                selected ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {innovation.innovation_name}
                            {innovation.custom && (
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
            {innovationIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {innovationIds.map((id) => {
                  const innovation = innovations[id]
                  if (!innovation) return null
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="text-xs flex items-center gap-1">
                      {innovation.innovation_name}
                      <button
                        type="button"
                        aria-label={`Remove ${innovation.innovation_name}`}
                        className="hover:text-destructive"
                        onClick={() => toggleInnovation(id)}>
                        <Trash2Icon className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
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
          <Button onClick={handleSubmit} disabled={!name.trim() || saving}>
            {saving ? savingLabel : saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
