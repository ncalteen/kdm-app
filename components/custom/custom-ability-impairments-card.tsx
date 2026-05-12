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
  addAbilityImpairment,
  getAbilityImpairments,
  removeAbilityImpairment,
  updateAbilityImpairment
} from '@/lib/dal/ability-impairment'
import {
  ABILITY_IMPAIRMENT_CREATED_MESSAGE,
  ABILITY_IMPAIRMENT_REMOVED_MESSAGE,
  ABILITY_IMPAIRMENT_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import { AbilityImpairmentDetail } from '@/lib/types'
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Abilities & Impairments Card Component Properties
 */
interface CustomAbilityImpairmentsCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Abilities & Impairments Card Component
 *
 * Lists user's custom abilities and impairments with options to create, edit,
 * and delete. Entries are displayed alphabetically. Name and rules are entered
 * via a dialog. UI updates are optimistic and roll back on database failure.
 *
 * @param props Custom Abilities & Impairments Card Properties
 * @returns Custom Abilities & Impairments Card Component
 */
export function CustomAbilityImpairmentsCard({
  local
}: CustomAbilityImpairmentsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<AbilityImpairmentDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] =
    useState<AbilityImpairmentDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: AbilityImpairmentDetail[]): AbilityImpairmentDetail[] =>
      [...list].sort((a, b) =>
        a.ability_impairment_name.localeCompare(b.ability_impairment_name)
      ),
    []
  )

  /** Load custom abilities/impairments from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getAbilityImpairments()
      const custom = Object.values(data).filter((i) => i.custom)
      setItems(sortItems(custom))
    } catch (err: unknown) {
      console.error('Load Abilities/Impairments Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Handle Create Ability/Impairment
   *
   * Optimistically adds a new ability/impairment, then persists to the
   * database. Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('ability/impairment'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: AbilityImpairmentDetail = {
        id: tempId,
        custom: true,
        ability_impairment_name: data.name,
        rules: data.rules || null
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addAbilityImpairment({
          custom: true,
          ability_impairment_name: data.name,
          rules: data.rules || null
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )

        toast.success(ABILITY_IMPAIRMENT_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Ability/Impairment Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, toast]
  )

  /**
   * Handle Edit Ability/Impairment
   *
   * Optimistically updates the ability/impairment, then persists to the
   * database. Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving || !editingItem) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('ability/impairment'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  ability_impairment_name: data.name,
                  rules: data.rules || null
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateAbilityImpairment(editingItem.id, {
          ability_impairment_name: data.name,
          rules: data.rules || null
        })

        toast.success(ABILITY_IMPAIRMENT_UPDATED_MESSAGE(false))
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Ability/Impairment Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems, toast]
  )

  /**
   * Handle Delete Ability/Impairment
   *
   * Optimistically removes the ability or impairment from the list, then
   * persists the deletion. Restores the previous list on failure.
   */
  const handleDelete = useCallback(
    (item: AbilityImpairmentDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeAbilityImpairment(item.id)
        .then(() => toast.success(ABILITY_IMPAIRMENT_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          const guard = getCatalogDeleteGuardMessage(err)
          if (!guard) console.error('Delete Ability/Impairment Error:', err)
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
   * dialog seeded with the target ability or impairment's values.
   */
  const openEditDialog = useCallback((item: AbilityImpairmentDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Abilities & Impairments</span>
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
                No custom abilities or impairments have emerged yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom ability or impairment to see it appear here.
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
                      {item.ability_impairment_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.ability_impairment_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.ability_impairment_name}`}>
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
        title="Create Custom Ability/Impairment"
        description="A new trait manifests from the struggle."
        nameLabel="Ability/Impairment Name"
        namePlaceholder="Enter ability or impairment name"
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
        initialName={editingItem?.ability_impairment_name}
        initialRules={editingItem?.rules ?? ''}
        title="Edit Ability/Impairment"
        description="Reshape the trait."
        nameLabel="Ability/Impairment Name"
        namePlaceholder="Enter ability or impairment name"
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
