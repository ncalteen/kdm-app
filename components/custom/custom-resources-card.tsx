'use client'

import { ResourceDialog } from '@/components/custom/dialogs/resource-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { getPatterns } from '@/lib/dal/pattern'
import { getQuarries } from '@/lib/dal/quarry'
import {
  addResource,
  getResources,
  removeResource,
  updateResource
} from '@/lib/dal/resource'
import { Database } from '@/lib/database.types'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  RESOURCE_CREATED_MESSAGE,
  RESOURCE_REMOVED_MESSAGE,
  RESOURCE_UPDATED_MESSAGE
} from '@/lib/messages'
import { PatternDetail, QuarryDetail, ResourceDetail } from '@/lib/types'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/** Database types */
type DbResourceCategory = Database['public']['Enums']['resource_category']

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
 * Lists user's custom resources with options to create, edit, and delete via
 * a dialog. Each resource has a name, optional category, optional quarry,
 * optional resource types, optional pattern, and optional rules. Entries are
 * displayed alphabetically. UI updates are optimistic and roll back on
 * database failure.
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
  const [patterns, setPatterns] = useState<{ [key: string]: PatternDetail }>({})

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ResourceDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: ResourceDetail[]): ResourceDetail[] =>
      [...list].sort((a, b) => a.resource_name.localeCompare(b.resource_name)),
    []
  )

  /** Load custom resources, quarries, and patterns from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const [resourceData, quarryData, patternData] = await Promise.all([
        getResources(),
        getQuarries(),
        getPatterns()
      ])

      const custom = Object.values(resourceData).filter((i) => i.custom)
      setItems(sortItems(custom))
      setQuarries(quarryData)
      setPatterns(patternData)
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

  /** Format a category DB key for display */
  const formatCategory = useCallback(
    (cat: DbResourceCategory): string =>
      cat.charAt(0) + cat.slice(1).toLowerCase(),
    []
  )

  /**
   * Handle Create Resource
   *
   * Optimistically adds a new resource, then persists to the database. Rolls
   * back on failure.
   */
  const handleCreate = useCallback(
    async (data: {
      resource_name: string
      category: DbResourceCategory | null
      quarry_id: string | null
      resource_types: Database['public']['Enums']['resource_type'][]
      pattern_id: string | null
      rules: string | null
    }) => {
      if (saving) return
      if (!data.resource_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('resource'))

      setSaving(true)

      // Category is non-null in the DB; default to BASIC when not provided.
      const category: DbResourceCategory = data.category ?? 'BASIC'
      const effectiveQuarryId = category === 'MONSTER' ? data.quarry_id : null

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: ResourceDetail = {
        id: tempId,
        custom: true,
        resource_name: data.resource_name,
        category,
        resource_types: data.resource_types,
        quarry_id: effectiveQuarryId,
        quarry_monster_name: effectiveQuarryId
          ? (quarries[effectiveQuarryId]?.monster_name ?? null)
          : null,
        quarry_node: effectiveQuarryId
          ? (quarries[effectiveQuarryId]?.node ?? null)
          : null,
        pattern_id: data.pattern_id,
        rules: data.rules
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addResource({
          custom: true,
          resource_name: data.resource_name,
          category,
          resource_types: data.resource_types,
          quarry_id: effectiveQuarryId,
          pattern_id: data.pattern_id,
          rules: data.rules
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )

        toast.success(RESOURCE_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Resource Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, quarries, saving, sortItems, toast]
  )

  /**
   * Handle Edit Resource
   *
   * Optimistically updates the resource, then persists to the database. Rolls
   * back on failure.
   */
  const handleEdit = useCallback(
    async (data: {
      resource_name: string
      category: DbResourceCategory | null
      quarry_id: string | null
      resource_types: Database['public']['Enums']['resource_type'][]
      pattern_id: string | null
      rules: string | null
    }) => {
      if (saving || !editingItem) return
      if (!data.resource_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('resource'))

      setSaving(true)

      const category: DbResourceCategory = data.category ?? 'BASIC'
      const effectiveQuarryId = category === 'MONSTER' ? data.quarry_id : null

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  resource_name: data.resource_name,
                  category,
                  resource_types: data.resource_types,
                  quarry_id: effectiveQuarryId,
                  quarry_monster_name: effectiveQuarryId
                    ? (quarries[effectiveQuarryId]?.monster_name ?? null)
                    : null,
                  quarry_node: effectiveQuarryId
                    ? (quarries[effectiveQuarryId]?.node ?? null)
                    : null,
                  pattern_id: data.pattern_id,
                  rules: data.rules
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateResource(editingItem.id, {
          resource_name: data.resource_name,
          category,
          resource_types: data.resource_types,
          quarry_id: effectiveQuarryId,
          pattern_id: data.pattern_id,
          rules: data.rules
        })

        toast.success(RESOURCE_UPDATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Resource Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, quarries, saving, sortItems, toast]
  )

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

  /**
   * Open Create Dialog
   *
   * Increments the dialog key to force a fresh form state and opens
   * the create dialog.
   */
  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  /**
   * Open Edit Dialog
   *
   * Increments the dialog key to force a fresh form state and opens
   * the edit dialog seeded with the target resource's values.
   */
  const openEditDialog = useCallback((item: ResourceDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Resources</span>
          <Button variant="outline" size="sm" onClick={openCreateDialog}>
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
        ) : items.length === 0 ? (
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
          <div className="max-h-[400px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[60%]">Name</TableHead>
                  <TableHead className="w-[20%]">Category</TableHead>
                  <TableHead className="w-[20%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{item.resource_name}</span>
                        {item.category === 'MONSTER' &&
                          item.quarry_monster_name && (
                            <span className="text-xs text-muted-foreground truncate">
                              {item.quarry_monster_name}
                              {item.quarry_node && ` (${item.quarry_node})`}
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="text-xs">
                        {formatCategory(item.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.resource_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.resource_name}`}>
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <ResourceDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        quarries={quarries}
        patterns={patterns}
        title="Create Custom Resource"
        description="A new sliver of meaning is wrested from the dark."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <ResourceDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        quarries={quarries}
        patterns={patterns}
        initialName={editingItem?.resource_name}
        initialCategory={editingItem?.category ?? null}
        initialQuarryId={editingItem?.quarry_id ?? null}
        initialResourceTypes={editingItem?.resource_types ?? []}
        initialPatternId={editingItem?.pattern_id ?? null}
        initialRules={editingItem?.rules ?? ''}
        title="Edit Resource"
        description="Reshape what was once known."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
