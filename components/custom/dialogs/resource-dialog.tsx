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
import { Constants, Database } from '@/lib/database.types'
import { ResourceCategory } from '@/lib/enums'
import { PatternDetail, QuarryDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import MDEditor from '@uiw/react-md-editor'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useMemo,
  useState
} from 'react'

/** Database types */
type DbResourceCategory = Database['public']['Enums']['resource_category']
type DbResourceType = Database['public']['Enums']['resource_type']

/** No selection sentinel value */
const NO_SELECTION = '__none__'

/**
 * Resource Dialog Save Payload
 */
export interface ResourceDialogPayload {
  /** Resource Name */
  resource_name: string
  /** Resource Category */
  category: DbResourceCategory | null
  /** Quarry ID */
  quarry_id: string | null
  /** Resource Types */
  resource_types: DbResourceType[]
  /** Pattern ID */
  pattern_id: string | null
  /** Rules */
  rules: string | null
}

/**
 * Resource Dialog Properties
 */
interface ResourceDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when resource is saved */
  onSave: (data: ResourceDialogPayload) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Available quarries to choose from */
  quarries: { [key: string]: QuarryDetail }
  /** Available patterns to choose from */
  patterns: { [key: string]: PatternDetail }
  /** Initial resource name (for editing) */
  initialName?: string
  /** Initial category (for editing) */
  initialCategory?: DbResourceCategory | null
  /** Initial quarry ID (for editing) */
  initialQuarryId?: string | null
  /** Initial resource types (for editing) */
  initialResourceTypes?: DbResourceType[]
  /** Initial pattern ID (for editing) */
  initialPatternId?: string | null
  /** Initial rules (for editing) */
  initialRules?: string
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
 * Resource Dialog Component
 *
 * Dialog form for creating or editing a custom resource. Allows selection of
 * the resource name, optional category, optional quarry (from existing
 * quarries), optional resource types, optional pattern (from existing
 * patterns), and optional rules.
 *
 * @param props Resource Dialog Properties
 * @returns Resource Dialog Component
 */
export function ResourceDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  quarries,
  patterns,
  initialName = '',
  initialCategory = null,
  initialQuarryId = null,
  initialResourceTypes = [],
  initialPatternId = null,
  initialRules = '',
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: ResourceDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [category, setCategory] = useState<DbResourceCategory | null>(
    initialCategory
  )
  const [quarryId, setQuarryId] = useState<string | null>(initialQuarryId)
  const [quarryOpen, setQuarryOpen] = useState(false)
  const [resourceTypes, setResourceTypes] =
    useState<DbResourceType[]>(initialResourceTypes)
  const [typesOpen, setTypesOpen] = useState(false)
  const [patternId, setPatternId] = useState<string | null>(initialPatternId)
  const [patternOpen, setPatternOpen] = useState(false)
  const [rules, setRules] = useState(initialRules)

  /** Sorted quarries for dropdown */
  const sortedQuarries = useMemo(
    () =>
      Object.values(quarries).sort((a, b) =>
        a.monster_name.localeCompare(b.monster_name)
      ),
    [quarries]
  )

  /** Sorted patterns for dropdown */
  const sortedPatterns = useMemo(
    () =>
      Object.values(patterns).sort((a, b) =>
        a.pattern_name.localeCompare(b.pattern_name)
      ),
    [patterns]
  )

  /** Format a resource type DB key for display */
  const formatType = useCallback(
    (type: DbResourceType): string =>
      type.charAt(0) + type.slice(1).toLowerCase(),
    []
  )

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    // If category is not MONSTER, drop any quarry selection.
    const effectiveQuarryId = category === 'MONSTER' ? quarryId : null

    onSave({
      resource_name: trimmed,
      category,
      quarry_id: effectiveQuarryId,
      resource_types: resourceTypes,
      pattern_id: patternId,
      rules: rules.trim() ? rules.trim() : null
    })
  }, [
    name,
    category,
    quarryId,
    resourceTypes,
    patternId,
    rules,
    saving,
    onSave
  ])

  /** Save on Enter in the name field */
  const handleNameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit()
    },
    [handleSubmit]
  )

  /** Toggle a resource type */
  const toggleType = useCallback((type: DbResourceType) => {
    setResourceTypes((current) =>
      current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type]
    )
  }, [])

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
            <Label htmlFor="resource-name">Resource Name</Label>
            <Input
              id="resource-name"
              name="resource-name"
              placeholder="Enter resource name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="resource-category">Category (optional)</Label>
            <Select
              value={category ?? NO_SELECTION}
              onValueChange={(v) => {
                if (v === NO_SELECTION) {
                  setCategory(null)
                  setQuarryId(null)
                } else {
                  const cat = v as DbResourceCategory
                  setCategory(cat)
                  if (cat !== 'MONSTER') setQuarryId(null)
                }
              }}>
              <SelectTrigger id="resource-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SELECTION}>None</SelectItem>
                {Object.values(ResourceCategory).map((cat) => (
                  <SelectItem key={cat.toUpperCase()} value={cat.toUpperCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quarry (only shown for MONSTER category) */}
          {category === 'MONSTER' && (
            <div className="flex flex-col gap-2">
              <Label>Quarry (optional)</Label>
              <Popover
                modal={true}
                open={quarryOpen}
                onOpenChange={setQuarryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={quarryOpen}
                    aria-label="Resource quarry selector"
                    className="justify-between w-full">
                    {quarryId && quarries[quarryId]
                      ? quarries[quarryId].monster_name
                      : 'Select quarry...'}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Search quarries..." />
                    <CommandList>
                      <CommandEmpty>No quarries found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value={NO_SELECTION}
                          onSelect={() => {
                            setQuarryId(null)
                            setQuarryOpen(false)
                          }}>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              quarryId === null ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          None
                        </CommandItem>
                        {sortedQuarries.map((q) => (
                          <CommandItem
                            key={q.id}
                            value={q.monster_name}
                            onSelect={() => {
                              setQuarryId(q.id)
                              setQuarryOpen(false)
                            }}>
                            <Check
                              className={cn(
                                'h-4 w-4',
                                quarryId === q.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {q.monster_name}
                            {q.custom && (
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
          )}

          {/* Resource Types */}
          <div className="flex flex-col gap-2">
            <Label>Resource Types (optional)</Label>
            <Popover modal={true} open={typesOpen} onOpenChange={setTypesOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={typesOpen}
                  aria-label="Resource type selector"
                  className="justify-between w-full">
                  {resourceTypes.length > 0
                    ? `${resourceTypes.length} selected`
                    : 'Select types...'}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search types..." />
                  <CommandList>
                    <CommandEmpty>No types found.</CommandEmpty>
                    <CommandGroup>
                      {Constants.public.Enums.resource_type.map((type) => (
                        <CommandItem
                          key={type}
                          value={formatType(type)}
                          onSelect={() => toggleType(type)}>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              resourceTypes.includes(type)
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {formatType(type)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {resourceTypes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {resourceTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {formatType(type)}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Pattern */}
          <div className="flex flex-col gap-2">
            <Label>Pattern (optional)</Label>
            <Popover
              modal={true}
              open={patternOpen}
              onOpenChange={setPatternOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={patternOpen}
                  aria-label="Resource pattern selector"
                  className="justify-between w-full">
                  {patternId && patterns[patternId]
                    ? patterns[patternId].pattern_name
                    : 'Select pattern...'}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search patterns..." />
                  <CommandList>
                    <CommandEmpty>No patterns found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value={NO_SELECTION}
                        onSelect={() => {
                          setPatternId(null)
                          setPatternOpen(false)
                        }}>
                        <Check
                          className={cn(
                            'h-4 w-4',
                            patternId === null ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        None
                      </CommandItem>
                      {sortedPatterns.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.pattern_name}
                          onSelect={() => {
                            setPatternId(p.id)
                            setPatternOpen(false)
                          }}>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              patternId === p.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {p.pattern_name}
                          {p.custom && (
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

          {/* Rules */}
          <div className="flex flex-col gap-2" data-color-mode={resolvedTheme}>
            <Label>Rules (optional)</Label>
            <MDEditor
              value={rules}
              onChange={(val) => setRules(val ?? '')}
              height={200}
              preview="edit"
            />
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
