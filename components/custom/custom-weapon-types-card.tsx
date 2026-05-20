'use client'

import { WeaponTypeDialog } from '@/components/custom/dialogs/weapon-type-dialog'
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
  addWeaponType,
  getUserCustomWeaponTypes,
  removeWeaponType,
  updateWeaponType
} from '@/lib/dal/weapon-type'
import { ERROR_MESSAGE, NAMELESS_OBJECT_ERROR_MESSAGE } from '@/lib/messages'
import { WeaponTypeDetail } from '@/lib/types'
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

/**
 * Custom Weapon Types Card Component
 *
 * Lists user's custom weapon types with options to create, edit, and delete.
 * Entries are displayed alphabetically. Name, specialist proficiency rules,
 * and master proficiency rules are entered via a tabbed dialog. UI updates
 * are optimistic and roll back on database failure.
 *
 * @returns Custom Weapon Types Card Component
 */
export function CustomWeaponTypesCard(): ReactElement {
  const [items, setItems] = useState<WeaponTypeDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WeaponTypeDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: WeaponTypeDetail[]): WeaponTypeDetail[] =>
      [...list].sort((a, b) =>
        a.weapon_type_name.localeCompare(b.weapon_type_name)
      ),
    []
  )

  // Load custom weapon types on mount.
  useEffect(() => {
    let cancelled = false

    getUserCustomWeaponTypes()
      .then((data) => {
        if (cancelled) return

        setItems(sortItems(Object.values(data)))
      })
      .catch((err: unknown) => {
        if (cancelled) return

        console.error('Load Weapon Types Error:', err)
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
   * Handle Create Weapon Type
   *
   * Optimistically adds a new weapon type, then persists to the database.
   * Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: {
      weapon_type_name: string
      specialist_proficiency_rules: string
      master_proficiency_rules: string
    }) => {
      if (saving) return
      if (!data.weapon_type_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('weapon type'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: WeaponTypeDetail = {
        id: tempId,
        custom: true,
        weapon_type_name: data.weapon_type_name,
        specialist_proficiency_rules: data.specialist_proficiency_rules || null,
        master_proficiency_rules: data.master_proficiency_rules || null
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addWeaponType({
          custom: true,
          weapon_type_name: data.weapon_type_name,
          specialist_proficiency_rules:
            data.specialist_proficiency_rules || null,
          master_proficiency_rules: data.master_proficiency_rules || null
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Weapon Type Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems]
  )

  /**
   * Handle Edit Weapon Type
   *
   * Optimistically updates the weapon type, then persists to the database.
   * Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: {
      weapon_type_name: string
      specialist_proficiency_rules: string
      master_proficiency_rules: string
    }) => {
      if (saving || !editingItem) return
      if (!data.weapon_type_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('weapon type'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  weapon_type_name: data.weapon_type_name,
                  specialist_proficiency_rules:
                    data.specialist_proficiency_rules || null,
                  master_proficiency_rules:
                    data.master_proficiency_rules || null
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateWeaponType(editingItem.id, {
          weapon_type_name: data.weapon_type_name,
          specialist_proficiency_rules:
            data.specialist_proficiency_rules || null,
          master_proficiency_rules: data.master_proficiency_rules || null
        })
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Weapon Type Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems]
  )

  /**
   * Handle Delete Weapon Type
   *
   * Optimistically removes the weapon type from the list, then persists
   * the deletion. Restores the previous list on failure.
   */
  const handleDelete = useCallback(
    (item: WeaponTypeDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeWeaponType(item.id).catch((err: unknown) => {
        setItems(previous)
        const guard = getCatalogDeleteGuardMessage(err)
        if (!guard) console.error('Delete Weapon Type Error:', err)
        toast.error(guard ?? ERROR_MESSAGE())
      })
    },
    [items]
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
   * the edit dialog seeded with the target weapon type's values.
   */
  const openEditDialog = useCallback((item: WeaponTypeDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Weapon Types</span>
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
                No custom weapon types have been forged yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom weapon type to see it appear here.
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
                      {item.weapon_type_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.weapon_type_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.weapon_type_name}`}>
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

      <WeaponTypeDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        title="Create Custom Weapon Type"
        description="A new weapon discipline emerges."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <WeaponTypeDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        initialName={editingItem?.weapon_type_name}
        initialSpecialistRules={editingItem?.specialist_proficiency_rules ?? ''}
        initialMasterRules={editingItem?.master_proficiency_rules ?? ''}
        title="Edit Weapon Type"
        description="Refine the weapon discipline."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
