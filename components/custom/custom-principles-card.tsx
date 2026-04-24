'use client'

import { PrincipleDialog } from '@/components/custom/dialogs/principle-dialog'
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
  addPrinciple,
  getPrinciples,
  removePrinciple,
  updatePrinciple
} from '@/lib/dal/principle'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  PRINCIPLE_CREATED_MESSAGE,
  PRINCIPLE_REMOVED_MESSAGE,
  PRINCIPLE_UPDATED_MESSAGE
} from '@/lib/messages'
import { PrincipleDetail } from '@/lib/types'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Principles Card Component Properties
 */
interface CustomPrinciplesCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Principles Card Component
 *
 * Lists user's custom principles with options to create, edit, and delete.
 * Each principle has a name, two options (each with a name and rules), and
 * campaign type associations. Entries are displayed alphabetically. UI updates
 * are optimistic and roll back on database failure.
 *
 * @param props Custom Principles Card Properties
 * @returns Custom Principles Card Component
 */
export function CustomPrinciplesCard({
  local
}: CustomPrinciplesCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<PrincipleDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PrincipleDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: PrincipleDetail[]): PrincipleDetail[] =>
      [...list].sort((a, b) =>
        a.principle_name.localeCompare(b.principle_name)
      ),
    []
  )

  /** Load custom principles from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getPrinciples()
      const custom = Object.values(data).filter((i) => i.custom)
      setItems(sortItems(custom))
    } catch (err: unknown) {
      console.error('Load Principles Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Handle Create Principle
   *
   * Optimistically adds a new principle, then persists to the database.
   * Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: {
      principle_name: string
      option_1_name: string
      option_2_name: string
      option_1_rules: string
      option_2_rules: string
    }) => {
      if (saving) return
      if (!data.principle_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('principle'))
      if (!data.option_1_name.trim() || !data.option_2_name.trim())
        return toast.error('Both principle options must be named.')

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: PrincipleDetail = {
        id: tempId,
        custom: true,
        principle_name: data.principle_name,
        option_1_name: data.option_1_name,
        option_2_name: data.option_2_name,
        option_1_rules: data.option_1_rules || null,
        option_2_rules: data.option_2_rules || null,
        campaign_types: []
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addPrinciple({
          custom: true,
          principle_name: data.principle_name,
          option_1_name: data.option_1_name,
          option_2_name: data.option_2_name,
          option_1_rules: data.option_1_rules || null,
          option_2_rules: data.option_2_rules || null,
          campaign_types: []
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )

        toast.success(PRINCIPLE_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Principle Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, toast]
  )

  /**
   * Handle Edit Principle
   *
   * Optimistically updates the principle, then persists to the database.
   * Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: {
      principle_name: string
      option_1_name: string
      option_2_name: string
      option_1_rules: string
      option_2_rules: string
    }) => {
      if (saving || !editingItem) return
      if (!data.principle_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('principle'))
      if (!data.option_1_name.trim() || !data.option_2_name.trim())
        return toast.error('Both principle options must be named.')

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  principle_name: data.principle_name,
                  option_1_name: data.option_1_name,
                  option_2_name: data.option_2_name,
                  option_1_rules: data.option_1_rules || null,
                  option_2_rules: data.option_2_rules || null
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updatePrinciple(editingItem.id, {
          principle_name: data.principle_name,
          option_1_name: data.option_1_name,
          option_2_name: data.option_2_name,
          option_1_rules: data.option_1_rules || null,
          option_2_rules: data.option_2_rules || null
        })

        toast.success(PRINCIPLE_UPDATED_MESSAGE(false))
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Principle Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems, toast]
  )

  const handleDelete = useCallback(
    (item: PrincipleDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removePrinciple(item.id)
        .then(() => toast.success(PRINCIPLE_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Principle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((item: PrincipleDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Principles</span>
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
                No custom principles guide the settlement yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom principle to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Options
                  </TableHead>
                  <TableHead className="w-[100px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.principle_name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">
                        {item.option_1_name} / {item.option_2_name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {item.option_1_name} / {item.option_2_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.principle_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.principle_name}`}>
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

      <PrincipleDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        title="Create Custom Principle"
        description="A new doctrine shapes the settlement's path."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <PrincipleDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        initialName={editingItem?.principle_name}
        initialOption1Name={editingItem?.option_1_name}
        initialOption2Name={editingItem?.option_2_name}
        initialOption1Rules={editingItem?.option_1_rules ?? ''}
        initialOption2Rules={editingItem?.option_2_rules ?? ''}
        title="Edit Principle"
        description="Reshape the doctrine."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
