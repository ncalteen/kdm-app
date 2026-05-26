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
import {
  addDisorder,
  getUserCustomDisorders,
  removeDisorder,
  updateDisorder
} from '@/lib/dal/disorder'
import { ERROR_MESSAGE, NAMELESS_OBJECT_ERROR_MESSAGE } from '@/lib/messages'
import { DisorderDetail } from '@/lib/types'
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

/**
 * Custom Disorders Card Component
 *
 * Lists user's custom disorders with options to create, edit, and delete.
 * Entries are displayed alphabetically. Name and rules are entered via a
 * dialog. UI updates are optimistic and roll back on database failure.
 *
 * @returns Custom Disorders Card Component
 */
export function CustomDisordersCard(): ReactElement {
  const [items, setItems] = useState<DisorderDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DisorderDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: DisorderDetail[]): DisorderDetail[] =>
      [...list].sort((a, b) => a.disorder_name.localeCompare(b.disorder_name)),
    []
  )

  // Load custom disorders on mount.
  useEffect(() => {
    let cancelled = false

    getUserCustomDisorders()
      .then((data) => {
        if (cancelled) return

        setItems(sortItems(Object.values(data)))
      })
      .catch((err: unknown) => {
        if (cancelled) return

        console.error('Load Disorders Error:', err)
        toast.error(ERROR_MESSAGE())
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [sortItems])

  /**
   * Handle Create Disorder
   *
   * Optimistically adds a new disorder, then persists to the database.
   * Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('disorder'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: DisorderDetail = {
        id: tempId,
        custom: true,
        disorder_name: data.name,
        rules: data.rules || null
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addDisorder({
          custom: true,
          disorder_name: data.name,
          rules: data.rules || null
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Disorder Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems]
  )

  /**
   * Handle Edit Disorder
   *
   * Optimistically updates the disorder, then persists to the database.
   * Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving || !editingItem) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('disorder'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? { ...i, disorder_name: data.name, rules: data.rules || null }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateDisorder(editingItem.id, {
          disorder_name: data.name,
          rules: data.rules || null
        })
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Disorder Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems]
  )

  /**
   * Handle Delete Disorder
   *
   * Optimistically removes the disorder from the list, then persists the
   * deletion. Restores the previous list on failure.
   */
  const handleDelete = useCallback(
    (item: DisorderDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeDisorder(item.id).catch((err: unknown) => {
        setItems(previous)
        const guard = getCatalogDeleteGuardMessage(err)
        if (!guard) console.error('Delete Disorder Error:', err)
        toast.error(guard ?? ERROR_MESSAGE())
      })
    },
    [items]
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
   * dialog seeded with the target disorder's values.
   */
  const openEditDialog = useCallback((item: DisorderDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Disorders</span>
          <Button
            aria-label="Add disorder"
            variant="outline"
            size="sm"
            onClick={openCreateDialog}>
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
                No custom disorders have taken root yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom disorder to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-100 overflow-y-auto rounded-md border">
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
                      {item.disorder_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          aria-label={`Edit ${item.disorder_name}`}
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.disorder_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          aria-label={`Delete ${item.disorder_name}`}
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.disorder_name}`}>
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
        title="Create Custom Disorder"
        description="A new affliction takes hold."
        nameLabel="Disorder Name"
        namePlaceholder="Enter disorder name"
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
        initialName={editingItem?.disorder_name}
        initialRules={editingItem?.rules ?? ''}
        title="Edit Disorder"
        description="Reshape the affliction."
        nameLabel="Disorder Name"
        namePlaceholder="Enter disorder name"
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
