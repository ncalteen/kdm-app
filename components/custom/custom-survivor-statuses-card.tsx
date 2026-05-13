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
  addSurvivorStatus,
  getUserCustomSurvivorStatuses,
  removeSurvivorStatus,
  updateSurvivorStatus
} from '@/lib/dal/survivor-status'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  SURVIVOR_STATUS_CREATED_MESSAGE,
  SURVIVOR_STATUS_REMOVED_MESSAGE,
  SURVIVOR_STATUS_UPDATED_MESSAGE
} from '@/lib/messages'
import { SurvivorStatusDetail } from '@/lib/types'
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Survivor Statuses Card Component Properties
 */
interface CustomSurvivorStatusesCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Survivor Statuses Card Component
 *
 * Lists user's custom survivor statuses with options to create, edit, and
 * delete. Entries are displayed alphabetically. UI updates are optimistic and
 * roll back on database failure.
 *
 * @param props Custom Survivor Statuses Card Properties
 * @returns Custom Survivor Statuses Card Component
 */
export function CustomSurvivorStatusesCard({
  local
}: CustomSurvivorStatusesCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<SurvivorStatusDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SurvivorStatusDetail | null>(
    null
  )
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: SurvivorStatusDetail[]): SurvivorStatusDetail[] =>
      [...list].sort((a, b) =>
        a.survivor_status_name.localeCompare(b.survivor_status_name)
      ),
    []
  )

  /** Load custom survivor statuses */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const statusData = await getUserCustomSurvivorStatuses()

      setItems(sortItems(Object.values(statusData)))
    } catch (err: unknown) {
      console.error('Load Survivor Statuses Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Handle Create Survivor Status
   *
   * Optimistically adds a new survivor status, then persists to the database.
   * Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('survivor status'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: SurvivorStatusDetail = {
        id: tempId,
        custom: true,
        survivor_status_name: data.name,
        rules: data.rules || null
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addSurvivorStatus({
          custom: true,
          survivor_status_name: data.name,
          rules: data.rules || null
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )

        toast.success(SURVIVOR_STATUS_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Survivor Status Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, toast]
  )

  /**
   * Handle Edit Survivor Status
   *
   * Optimistically updates the survivor status, then persists to the database.
   * Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving || !editingItem) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('survivor status'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  survivor_status_name: data.name,
                  rules: data.rules || null
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateSurvivorStatus(editingItem.id, {
          survivor_status_name: data.name,
          rules: data.rules || null
        })

        toast.success(SURVIVOR_STATUS_UPDATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Survivor Status Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems, toast]
  )

  /**
   * Handle Delete Survivor Status
   *
   * Optimistically removes the survivor status from the list, then persists
   * the deletion. Restores the previous list on failure.
   */
  const handleDelete = useCallback(
    (item: SurvivorStatusDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeSurvivorStatus(item.id)
        .then(() => toast.success(SURVIVOR_STATUS_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          const guard = getCatalogDeleteGuardMessage(err)
          if (!guard) console.error('Delete Survivor Status Error:', err)
          toast.error(guard ?? ERROR_MESSAGE())
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
   * the edit dialog seeded with the target survivor status's values.
   */
  const openEditDialog = useCallback((item: SurvivorStatusDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Survivor Statuses</span>
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
                No custom afflictions haunt the survivors yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom survivor status to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-100 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-25 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">
                        {item.survivor_status_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.survivor_status_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.survivor_status_name}`}>
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
        title="Create Custom Survivor Status"
        description="A new affliction takes hold."
        nameLabel="Status Name"
        namePlaceholder="Enter status name"
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
        initialName={editingItem?.survivor_status_name}
        initialRules={editingItem?.rules ?? ''}
        title="Edit Survivor Status"
        description="Reshape the affliction."
        nameLabel="Status Name"
        namePlaceholder="Enter status name"
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
