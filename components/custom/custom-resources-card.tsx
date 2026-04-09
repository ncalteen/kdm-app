'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
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
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { getQuarries } from '@/lib/dal/quarry'
import {
  addResource,
  getResources,
  removeResource,
  updateResource
} from '@/lib/dal/resource'
import { Constants, Database } from '@/lib/database.types'
import { ResourceCategory } from '@/lib/enums'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  RESOURCE_CREATED_MESSAGE,
  RESOURCE_REMOVED_MESSAGE,
  RESOURCE_UPDATED_MESSAGE
} from '@/lib/messages'
import { QuarryDetail, ResourceDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Check,
  ChevronsUpDown,
  PencilIcon,
  PlusIcon,
  Trash2Icon
} from 'lucide-react'
import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

/** Database types */
type DbResourceCategory = Database['public']['Enums']['resource_category']
type DbResourceType = Database['public']['Enums']['resource_type']

/** No quarry sentinel value */
const NO_QUARRY = '__none__'

/**
 * Custom Resources Card Component Properties
 */
interface CustomResourcesCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Resources Card Component
 *
 * Lists user's custom resources with options to create, edit, and delete.
 * Each resource has a name, category, resource types, and an optional quarry.
 * Entries are displayed alphabetically. UI updates are optimistic and roll
 * back on database failure.
 *
 * @param props Custom Resources Card Properties
 * @returns Custom Resources Card Component
 */
export function CustomResourcesCard({
  local
}: CustomResourcesCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<ResourceDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quarries, setQuarries] = useState<{ [key: string]: QuarryDetail }>({})

  // Create form state
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<DbResourceCategory>('BASIC')
  const [newTypes, setNewTypes] = useState<DbResourceType[]>([])
  const [newQuarryId, setNewQuarryId] = useState<string | null>(null)
  const [newQuarryOpen, setNewQuarryOpen] = useState(false)

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingCategory, setEditingCategory] =
    useState<DbResourceCategory>('BASIC')
  const [editingTypes, setEditingTypes] = useState<DbResourceType[]>([])
  const [editingQuarryId, setEditingQuarryId] = useState<string | null>(null)
  const [editingQuarryOpen, setEditingQuarryOpen] = useState(false)

  const newInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: ResourceDetail[]): ResourceDetail[] =>
      [...list].sort((a, b) => a.resource_name.localeCompare(b.resource_name)),
    []
  )

  /** Sorted quarries for dropdown */
  const sortedQuarries = useMemo(
    () =>
      Object.values(quarries).sort((a, b) =>
        a.monster_name.localeCompare(b.monster_name)
      ),
    [quarries]
  )

  /** Load custom resources and quarries from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const [resourceData, quarryData] = await Promise.all([
        getResources(),
        getQuarries()
      ])

      const custom = Object.values(resourceData).filter((i) => i.custom)
      setItems(sortItems(custom))
      setQuarries(quarryData)
    } catch (err: unknown) {
      console.error('Load Resources Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  useEffect(() => {
    if (isAdding) newInputRef.current?.focus()
  }, [isAdding])

  useEffect(() => {
    if (editingId) editInputRef.current?.focus()
  }, [editingId])

  /** Format a category DB key for display */
  const formatCategory = useCallback(
    (cat: DbResourceCategory): string =>
      cat.charAt(0) + cat.slice(1).toLowerCase(),
    []
  )

  /** Format a type DB key for display */
  const formatType = useCallback(
    (type: DbResourceType): string =>
      type.charAt(0) + type.slice(1).toLowerCase(),
    []
  )

  /**
   * Handle Add Resource
   *
   * Optimistically adds a new resource, then persists to the database.
   * Rolls back on failure.
   */
  const handleAdd = useCallback(async () => {
    const trimmedName = newName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('resource'))

    const effectiveQuarryId = newCategory === 'MONSTER' ? newQuarryId : null

    const tempId = `temp-${Date.now()}`
    const temp: ResourceDetail = {
      id: tempId,
      custom: true,
      resource_name: trimmedName,
      category: newCategory,
      resource_types: newTypes,
      quarry_id: effectiveQuarryId,
      quarry_monster_name: effectiveQuarryId
        ? (quarries[effectiveQuarryId]?.monster_name ?? null)
        : null,
      quarry_node: effectiveQuarryId
        ? (quarries[effectiveQuarryId]?.node ?? null)
        : null
    }

    const previous = [...items]
    setItems(sortItems([...items, temp]))
    setNewName('')
    setNewCategory('BASIC')
    setNewTypes([])
    setNewQuarryId(null)
    setIsAdding(false)

    try {
      const created = await addResource({
        custom: true,
        resource_name: trimmedName,
        category: newCategory,
        resource_types: newTypes,
        quarry_id: effectiveQuarryId
      })

      setItems((prev) =>
        sortItems(prev.map((i) => (i.id === tempId ? created : i)))
      )

      toast.success(RESOURCE_CREATED_MESSAGE())
    } catch (err: unknown) {
      setItems(previous)
      console.error('Add Resource Error:', err)
      toast.error(ERROR_MESSAGE())
    }
  }, [
    items,
    newName,
    newCategory,
    newTypes,
    newQuarryId,
    quarries,
    sortItems,
    toast
  ])

  /**
   * Handle Delete Resource
   *
   * Optimistically removes the resource, then deletes from the database.
   * Rolls back on failure.
   *
   * @param item Resource to delete
   */
  const handleDelete = useCallback(
    (item: ResourceDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeResource(item.id)
        .then(() => toast.success(RESOURCE_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Resource Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  /** Enter edit mode for a resource */
  const handleStartEdit = useCallback((item: ResourceDetail) => {
    setEditingId(item.id)
    setEditingName(item.resource_name)
    setEditingCategory(item.category)
    setEditingTypes([...item.resource_types])
    setEditingQuarryId(item.quarry_id)
  }, [])

  /** Cancel edit mode */
  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingName('')
    setEditingCategory('BASIC')
    setEditingTypes([])
    setEditingQuarryId(null)
  }, [])

  /**
   * Handle Save Edit
   *
   * Optimistically updates the resource, then persists to the database.
   * Rolls back on failure.
   */
  const handleSaveEdit = useCallback(() => {
    const trimmedName = editingName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('resource'))
    if (!editingId) return

    const effectiveQuarryId =
      editingCategory === 'MONSTER' ? editingQuarryId : null

    const previous = [...items]

    setItems(
      sortItems(
        items.map((i) =>
          i.id === editingId
            ? {
                ...i,
                resource_name: trimmedName,
                category: editingCategory,
                resource_types: editingTypes,
                quarry_id: effectiveQuarryId,
                quarry_monster_name: effectiveQuarryId
                  ? (quarries[effectiveQuarryId]?.monster_name ?? null)
                  : null,
                quarry_node: effectiveQuarryId
                  ? (quarries[effectiveQuarryId]?.node ?? null)
                  : null
              }
            : i
        )
      )
    )

    setEditingId(null)
    setEditingName('')
    setEditingCategory('BASIC')
    setEditingTypes([])
    setEditingQuarryId(null)

    updateResource(editingId, {
      resource_name: trimmedName,
      category: editingCategory,
      resource_types: editingTypes,
      quarry_id: effectiveQuarryId
    })
      .then(() => toast.success(RESOURCE_UPDATED_MESSAGE()))
      .catch((err: unknown) => {
        setItems(previous)
        console.error('Update Resource Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [
    items,
    editingId,
    editingName,
    editingCategory,
    editingTypes,
    editingQuarryId,
    quarries,
    sortItems,
    toast
  ])

  /** Toggle a resource type in a list */
  const toggleType = useCallback(
    (
      type: DbResourceType,
      current: DbResourceType[],
      setter: (types: DbResourceType[]) => void
    ) => {
      setter(
        current.includes(type)
          ? current.filter((t) => t !== type)
          : [...current, type]
      )
    },
    []
  )

  /** Reset and open the add form */
  const handleStartAdd = useCallback(() => {
    setNewName('')
    setNewCategory('BASIC')
    setNewTypes([])
    setNewQuarryId(null)
    setIsAdding(true)
  }, [])

  /** Quarry selector component for reuse in add/edit forms */
  const QuarrySelector = ({
    quarryId,
    setQuarryIdFn,
    open,
    setOpenFn,
    prefix
  }: {
    quarryId: string | null
    setQuarryIdFn: (id: string | null) => void
    open: boolean
    setOpenFn: (open: boolean) => void
    prefix: string
  }) => (
    <Popover modal={true} open={open} onOpenChange={setOpenFn}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={`${prefix} quarry selector`}
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
                value={NO_QUARRY}
                onSelect={() => {
                  setQuarryIdFn(null)
                  setOpenFn(false)
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
                    setQuarryIdFn(q.id)
                    setOpenFn(false)
                  }}>
                  <Check
                    className={cn(
                      'h-4 w-4',
                      quarryId === q.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {q.monster_name}
                  {q.custom && (
                    <Badge variant="outline" className="ml-auto text-xs">
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
  )

  /** Resource type multi-select dropdown for reuse in add/edit forms */
  const ResourceTypeSelect = ({
    selected,
    onToggle,
    prefix
  }: {
    selected: DbResourceType[]
    onToggle: (type: DbResourceType) => void
    prefix: string
  }) => {
    const [open, setOpen] = useState(false)

    return (
      <Popover modal={true} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={`${prefix} resource type selector`}
            className="justify-between w-full">
            {selected.length > 0
              ? `${selected.length} selected`
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
                    onSelect={() => onToggle(type)}>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        selected.includes(type) ? 'opacity-100' : 'opacity-0'
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
    )
  }

  /** Category selector for reuse in add/edit forms */
  const CategorySelector = ({
    value,
    onChangeFn,
    id
  }: {
    value: DbResourceCategory
    onChangeFn: (value: string) => void
    id: string
  }) => (
    <Select value={value} onValueChange={onChangeFn}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(ResourceCategory).map((cat) => (
          <SelectItem key={cat.toUpperCase()} value={cat.toUpperCase()}>
            {cat}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Resources</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartAdd}
            disabled={isAdding}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Peering into the darkness...
            </p>
          </div>
        ) : items.length === 0 && !isAdding ? (
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                No custom resources have been discovered yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom resource to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Add form */}
            {isAdding && (
              <div className="mb-2 rounded-md border p-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="new-resource-name">Resource Name</Label>
                  <Input
                    ref={newInputRef}
                    id="new-resource-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Resource name"
                    aria-label="New resource name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-resource-category">Category</Label>
                  <CategorySelector
                    value={newCategory}
                    onChangeFn={(v) => {
                      const cat = v as DbResourceCategory
                      setNewCategory(cat)
                      if (cat !== 'MONSTER') setNewQuarryId(null)
                    }}
                    id="new-resource-category"
                  />
                </div>
                {newCategory === 'MONSTER' && (
                  <div className="space-y-1">
                    <Label>Quarry (optional)</Label>
                    <QuarrySelector
                      quarryId={newQuarryId}
                      setQuarryIdFn={setNewQuarryId}
                      open={newQuarryOpen}
                      setOpenFn={setNewQuarryOpen}
                      prefix="new-resource"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label>Resource Types (optional)</Label>
                  <ResourceTypeSelect
                    selected={newTypes}
                    onToggle={(type) => toggleType(type, newTypes, setNewTypes)}
                    prefix="new-resource"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false)
                      setNewName('')
                      setNewCategory('BASIC')
                      setNewTypes([])
                      setNewQuarryId(null)
                    }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAdd}>
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Edit form */}
            {editingId && (
              <div className="mb-2 rounded-md border p-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-resource-name">Resource Name</Label>
                  <Input
                    ref={editInputRef}
                    id="edit-resource-name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Resource name"
                    aria-label="Edit resource name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-resource-category">Category</Label>
                  <CategorySelector
                    value={editingCategory}
                    onChangeFn={(v) => {
                      const cat = v as DbResourceCategory
                      setEditingCategory(cat)
                      if (cat !== 'MONSTER') setEditingQuarryId(null)
                    }}
                    id="edit-resource-category"
                  />
                </div>
                {editingCategory === 'MONSTER' && (
                  <div className="space-y-1">
                    <Label>Quarry (optional)</Label>
                    <QuarrySelector
                      quarryId={editingQuarryId}
                      setQuarryIdFn={setEditingQuarryId}
                      open={editingQuarryOpen}
                      setOpenFn={setEditingQuarryOpen}
                      prefix="edit-resource"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label>Resource Types (optional)</Label>
                  <ResourceTypeSelect
                    selected={editingTypes}
                    onToggle={(type) =>
                      toggleType(type, editingTypes, setEditingTypes)
                    }
                    prefix="edit-resource"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Items list */}
            {(items.length > 0 || (!isAdding && !editingId)) && (
              <div className="max-h-[400px] overflow-y-auto rounded-md border">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-2 py-1.5 border-b last:border-b-0',
                      editingId === item.id && 'bg-muted/50'
                    )}>
                    {/* Name + quarry info */}
                    <div className="flex flex-col min-w-0">
                      <Label className="text-sm truncate">
                        {item.resource_name}
                      </Label>
                      {item.category === 'MONSTER' &&
                        item.quarry_monster_name && (
                          <span className="text-xs text-muted-foreground truncate">
                            &nbsp;&nbsp;{item.quarry_monster_name}
                            {item.quarry_node && ` (${item.quarry_node})`}
                          </span>
                        )}
                    </div>

                    {/* Category badge */}
                    <div className="flex items-center">
                      <Badge variant="default" className="text-xs">
                        {formatCategory(item.category)}
                      </Badge>
                    </div>

                    {/* Type badges (hidden on mobile) */}
                    <div className="hidden sm:flex items-center gap-1 flex-wrap">
                      {item.resource_types.map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="text-xs">
                          {formatType(type)}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEdit(item)}
                        disabled={!!editingId}
                        title={`Edit ${item.resource_name}`}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
                        disabled={!!editingId}
                        title={`Delete ${item.resource_name}`}>
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
