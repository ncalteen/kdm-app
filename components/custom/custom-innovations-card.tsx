'use client'

import { InnovationDialog } from '@/components/custom/dialogs/innovation-dialog'
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
  addInnovation,
  getInnovations,
  removeInnovation,
  updateInnovation
} from '@/lib/dal/innovation'
import {
  ERROR_MESSAGE,
  INNOVATION_CREATED_MESSAGE,
  INNOVATION_REMOVED_MESSAGE,
  INNOVATION_UPDATED_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import { InnovationDetail } from '@/lib/types'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Innovations Card Component Properties
 */
interface CustomInnovationsCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Innovations Card Component
 *
 * Lists user's custom innovations with options to create, edit, and delete.
 * Entries are displayed alphabetically. Name, rules, consequences, and
 * benefits are entered via a tabbed dialog. UI updates are optimistic and
 * roll back on database failure.
 *
 * @param props Custom Innovations Card Properties
 * @returns Custom Innovations Card Component
 */
export function CustomInnovationsCard({
  local
}: CustomInnovationsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<InnovationDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InnovationDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: InnovationDetail[]): InnovationDetail[] =>
      [...list].sort((a, b) =>
        a.innovation_name.localeCompare(b.innovation_name)
      ),
    []
  )

  /** Load custom innovations from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getInnovations()
      const custom = Object.values(data).filter((i) => i.custom)
      setItems(sortItems(custom))
    } catch (err: unknown) {
      console.error('Load Innovations Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Handle Create Innovation
   *
   * Optimistically adds a new innovation, then persists to the database.
   * Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: {
      innovation_name: string
      rules: string
      consequences: string
      benefits: string
    }) => {
      if (saving) return
      if (!data.innovation_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('innovation'))

      setSaving(true)

      const tempId = `temp-${Date.now()}`
      const temp: InnovationDetail = {
        id: tempId,
        custom: true,
        innovation_name: data.innovation_name,
        rules: data.rules || null,
        consequences: data.consequences || null,
        benefits: data.benefits || null
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addInnovation({
          custom: true,
          innovation_name: data.innovation_name,
          rules: data.rules || null,
          consequences: data.consequences || null,
          benefits: data.benefits || null
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )

        toast.success(INNOVATION_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Innovation Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, toast]
  )

  /**
   * Handle Edit Innovation
   *
   * Optimistically updates the innovation, then persists to the database.
   * Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: {
      innovation_name: string
      rules: string
      consequences: string
      benefits: string
    }) => {
      if (saving || !editingItem) return
      if (!data.innovation_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('innovation'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  innovation_name: data.innovation_name,
                  rules: data.rules || null,
                  consequences: data.consequences || null,
                  benefits: data.benefits || null
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateInnovation(editingItem.id, {
          innovation_name: data.innovation_name,
          rules: data.rules || null,
          consequences: data.consequences || null,
          benefits: data.benefits || null
        })

        toast.success(INNOVATION_UPDATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Innovation Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems, toast]
  )

  const handleDelete = useCallback(
    (item: InnovationDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeInnovation(item.id)
        .then(() => toast.success(INNOVATION_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Innovation Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((item: InnovationDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Innovations</span>
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
                No custom innovations have emerged yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom innovation to see it appear here.
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
                      {item.innovation_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.innovation_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.innovation_name}`}>
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

      <InnovationDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        title="Create Custom Innovation"
        description="A breakthrough illuminates the settlement."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <InnovationDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        initialName={editingItem?.innovation_name}
        initialRules={editingItem?.rules ?? ''}
        initialConsequences={editingItem?.consequences ?? ''}
        initialBenefits={editingItem?.benefits ?? ''}
        title="Edit Innovation"
        description="Reshape the breakthrough."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
