'use client'

import { MilestoneDialog } from '@/components/custom/dialogs/milestone-dialog'
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
  addMilestone,
  getUserCustomMilestones,
  removeMilestone,
  updateMilestone
} from '@/lib/dal/milestone'
import {
  ERROR_MESSAGE,
  MILESTONE_MISSING_EVENT_ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import { MilestoneDetail } from '@/lib/types'
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

/**
 * Custom Milestones Card Component
 *
 * Lists user's custom milestones with options to create, edit, and delete.
 * Each milestone has a name, event name, requirements, and rules. Entries
 * are displayed alphabetically. UI updates are optimistic and roll back on
 * database failure.
 *
 * @returns Custom Milestones Card Component
 */
export function CustomMilestonesCard(): ReactElement {
  const [items, setItems] = useState<MilestoneDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MilestoneDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: MilestoneDetail[]): MilestoneDetail[] =>
      [...list].sort((a, b) =>
        a.milestone_name.localeCompare(b.milestone_name)
      ),
    []
  )

  // Load custom milestones on mount.
  useEffect(() => {
    let cancelled = false

    getUserCustomMilestones()
      .then((data) => {
        if (cancelled) return

        setItems(sortItems(Object.values(data)))
      })
      .catch((err: unknown) => {
        if (cancelled) return

        console.error('Load Milestones Error:', err)
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
   * Handle Create Milestone
   *
   * Optimistically adds a new milestone, then persists to the database.
   * Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: {
      milestone_name: string
      event_name: string
      requirements: string
      rules: string
    }) => {
      if (saving) return
      if (!data.milestone_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('milestone'))
      if (!data.event_name.trim())
        return toast.error(MILESTONE_MISSING_EVENT_ERROR_MESSAGE())

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: MilestoneDetail = {
        id: tempId,
        custom: true,
        milestone_name: data.milestone_name,
        event_name: data.event_name,
        campaign_types: [],
        requirements: data.requirements || null,
        rules: data.rules || null
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addMilestone({
          custom: true,
          milestone_name: data.milestone_name,
          event_name: data.event_name,
          campaign_types: [],
          requirements: data.requirements || null,
          rules: data.rules || null
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Milestone Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems]
  )

  /**
   * Handle Edit Milestone
   *
   * Optimistically updates the milestone, then persists to the database.
   * Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: {
      milestone_name: string
      event_name: string
      requirements: string
      rules: string
    }) => {
      if (saving || !editingItem) return
      if (!data.milestone_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('milestone'))
      if (!data.event_name.trim())
        return toast.error(MILESTONE_MISSING_EVENT_ERROR_MESSAGE())

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  milestone_name: data.milestone_name,
                  event_name: data.event_name,
                  requirements: data.requirements || null,
                  rules: data.rules || null
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateMilestone(editingItem.id, {
          milestone_name: data.milestone_name,
          event_name: data.event_name,
          requirements: data.requirements || null,
          rules: data.rules || null
        })
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Milestone Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems]
  )

  /**
   * Handle Delete Milestone
   *
   * Optimistically removes the milestone from the list, then persists the
   * deletion. Restores the previous list on failure.
   */
  const handleDelete = useCallback(
    (item: MilestoneDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeMilestone(item.id).catch((err: unknown) => {
        setItems(previous)
        const guard = getCatalogDeleteGuardMessage(err)
        if (!guard) console.error('Delete Milestone Error:', err)
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
   * dialog seeded with the target milestone's values.
   */
  const openEditDialog = useCallback((item: MilestoneDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Milestones</span>
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
                No custom milestones loom on the horizon.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom milestone to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-100 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Event</TableHead>
                  <TableHead className="w-25 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.milestone_name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">
                        {item.event_name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {item.event_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.milestone_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.milestone_name}`}>
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

      <MilestoneDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        title="Create Custom Milestone"
        description="A new trial looms on the horizon."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <MilestoneDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        initialName={editingItem?.milestone_name}
        initialEventName={editingItem?.event_name}
        initialRequirements={editingItem?.requirements ?? ''}
        initialRules={editingItem?.rules ?? ''}
        title="Edit Milestone"
        description="Reshape the trial."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
