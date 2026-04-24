'use client'

import { NeurosisDialog } from '@/components/custom/dialogs/neurosis-dialog'
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
  addNeurosis,
  getNeuroses,
  removeNeurosis,
  updateNeurosis
} from '@/lib/dal/neurosis'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  NEUROSIS_CREATED_MESSAGE,
  NEUROSIS_REMOVED_MESSAGE,
  NEUROSIS_UPDATED_MESSAGE
} from '@/lib/messages'
import { NeurosisDetail } from '@/lib/types'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Neuroses Card Component Properties
 */
interface CustomNeurosesCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Neuroses Card Component
 *
 * Lists user's custom neuroses with options to create, edit, and delete.
 * Entries are displayed alphabetically. UI updates are optimistic and roll back
 * on database failure.
 *
 * @param props Custom Neuroses Card Properties
 * @returns Custom Neuroses Card Component
 */
export function CustomNeurosesCard({
  local
}: CustomNeurosesCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<NeurosisDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NeurosisDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: NeurosisDetail[]): NeurosisDetail[] =>
      [...list].sort((a, b) => a.neurosis_name.localeCompare(b.neurosis_name)),
    []
  )

  /** Load custom neuroses */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const neurosisData = await getNeuroses()

      const custom = Object.values(neurosisData).filter((i) => i.custom)
      setItems(sortItems(custom))
    } catch (err: unknown) {
      console.error('Load Neuroses Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Handle Create Neurosis
   *
   * Optimistically adds a new neurosis, then persists to the database.
   * Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: { neurosis_name: string; rules: string }) => {
      if (saving) return
      if (!data.neurosis_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('neurosis'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: NeurosisDetail = {
        id: tempId,
        custom: true,
        neurosis_name: data.neurosis_name,
        rules: data.rules || null
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addNeurosis({
          custom: true,
          neurosis_name: data.neurosis_name,
          rules: data.rules || null
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )

        toast.success(NEUROSIS_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Neurosis Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, toast]
  )

  /**
   * Handle Edit Neurosis
   *
   * Optimistically updates the neurosis, then persists to the database.
   * Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: { neurosis_name: string; rules: string }) => {
      if (saving || !editingItem) return
      if (!data.neurosis_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('neurosis'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  neurosis_name: data.neurosis_name,
                  rules: data.rules || null
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateNeurosis(editingItem.id, {
          neurosis_name: data.neurosis_name,
          rules: data.rules || null
        })

        toast.success(NEUROSIS_UPDATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Neurosis Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems, toast]
  )

  const handleDelete = useCallback(
    (item: NeurosisDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeNeurosis(item.id)
        .then(() => toast.success(NEUROSIS_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Neurosis Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((item: NeurosisDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Neuroses</span>
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
                No custom neuroses have taken hold yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom neurosis to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[100px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.neurosis_name}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.neurosis_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.neurosis_name}`}>
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

      <NeurosisDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        title="Create Custom Neurosis"
        description="A new compulsion takes root in the mind."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <NeurosisDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        initialName={editingItem?.neurosis_name}
        initialRules={editingItem?.rules ?? ''}
        title="Edit Neurosis"
        description="Reshape the compulsion."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
