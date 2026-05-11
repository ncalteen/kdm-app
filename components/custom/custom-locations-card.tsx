'use client'

import { CustomItemDialog } from '@/components/custom/dialogs/custom-item-dialog'
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
import {
  addLocation,
  getLocations,
  removeLocation,
  updateLocation
} from '@/lib/dal/location'
import {
  ERROR_MESSAGE,
  LOCATION_CREATED_MESSAGE,
  LOCATION_REMOVED_MESSAGE,
  LOCATION_UPDATED_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import { LocationDetail } from '@/lib/types'
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Locations Card Component Properties
 */
interface CustomLocationsCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Locations Card Component
 *
 * Lists user's custom locations with options to create, edit, and delete.
 * Entries are displayed alphabetically. Name and rules are entered via a
 * dialog. UI updates are optimistic and roll back on database failure.
 *
 * @param props Custom Locations Card Properties
 * @returns Custom Locations Card Component
 */
export function CustomLocationsCard({
  local
}: CustomLocationsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<LocationDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LocationDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: LocationDetail[]): LocationDetail[] =>
      [...list].sort((a, b) => a.location_name.localeCompare(b.location_name)),
    []
  )

  /** Load custom locations from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getLocations()
      const custom = Object.values(data).filter((i) => i.custom)
      setItems(sortItems(custom))
    } catch (err: unknown) {
      console.error('Load Locations Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Handle Create Location
   *
   * Optimistically adds a new location, then persists to the database.
   * Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('location'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: LocationDetail = {
        id: tempId,
        custom: true,
        location_name: data.name,
        rules: data.rules || null
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addLocation({
          custom: true,
          location_name: data.name,
          rules: data.rules || null
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )

        toast.success(LOCATION_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Location Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, toast]
  )

  /**
   * Handle Edit Location
   *
   * Optimistically updates the location, then persists to the database.
   * Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving || !editingItem) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('location'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? { ...i, location_name: data.name, rules: data.rules || null }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateLocation(editingItem.id, {
          location_name: data.name,
          rules: data.rules || null
        })

        toast.success(LOCATION_UPDATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Location Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems, toast]
  )

  /**
   * Handle Delete Location
   *
   * Optimistically removes the location from the list, then persists the
   * deletion. Restores the previous list on failure.
   */
  const handleDelete = useCallback(
    (item: LocationDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeLocation(item.id)
        .then(() => toast.success(LOCATION_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          const guard = getCatalogDeleteGuardMessage(err)
          if (!guard) console.error('Delete Location Error:', err)
          toast.error(guard ?? ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  /**
   * Open Create Dialog
   *
   * Increments the dialog key to force a fresh form state and opens the create
   * dialog.
   */
  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  /**
   * Open Edit Dialog
   *
   * Increments the dialog key to force a fresh form state and opens the edit
   * dialog seeded with the target location's values.
   */
  const openEditDialog = useCallback((item: LocationDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Locations</span>
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
                No custom locations have been discovered yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom location to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[70%]">Name</TableHead>
                  <TableHead className="w-[30%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.location_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.location_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.location_name}`}>
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

      <CustomItemDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        title="Create Custom Location"
        description="A new place reveals itself in the darkness."
        nameLabel="Location Name"
        namePlaceholder="Enter location name"
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <CustomItemDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        initialName={editingItem?.location_name}
        initialRules={editingItem?.rules ?? ''}
        title="Edit Location"
        description="Reshape this place."
        nameLabel="Location Name"
        namePlaceholder="Enter location name"
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
