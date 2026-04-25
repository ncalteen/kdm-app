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
  addSecretFightingArt,
  getSecretFightingArts,
  removeSecretFightingArt,
  updateSecretFightingArt
} from '@/lib/dal/secret-fighting-art'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  SECRET_FIGHTING_ART_CREATED_MESSAGE,
  SECRET_FIGHTING_ART_REMOVED_MESSAGE,
  SECRET_FIGHTING_ART_UPDATED_MESSAGE
} from '@/lib/messages'
import { SecretFightingArtDetail } from '@/lib/types'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Secret Fighting Arts Card Component Properties
 */
interface CustomSecretFightingArtsCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Secret Fighting Arts Card Component
 *
 * Lists user's custom secret fighting arts with options to create, edit, and
 * delete. Entries are displayed alphabetically. Name and rules are entered via
 * a dialog. UI updates are optimistic and roll back on database failure.
 *
 * @param props Custom Secret Fighting Arts Card Properties
 * @returns Custom Secret Fighting Arts Card Component
 */
export function CustomSecretFightingArtsCard({
  local
}: CustomSecretFightingArtsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<SecretFightingArtDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] =
    useState<SecretFightingArtDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: SecretFightingArtDetail[]): SecretFightingArtDetail[] =>
      [...list].sort((a, b) =>
        a.secret_fighting_art_name.localeCompare(b.secret_fighting_art_name)
      ),
    []
  )

  /** Load custom secret fighting arts from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getSecretFightingArts()
      const custom = Object.values(data).filter((i) => i.custom)
      setItems(sortItems(custom))
    } catch (err: unknown) {
      console.error('Load Secret Fighting Arts Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Handle Create Secret Fighting Art
   *
   * Optimistically adds a new secret fighting art, then persists to the
   * database. Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('secret fighting art'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: SecretFightingArtDetail = {
        id: tempId,
        custom: true,
        secret_fighting_art_name: data.name,
        rules: data.rules || null
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addSecretFightingArt({
          custom: true,
          secret_fighting_art_name: data.name,
          rules: data.rules || null
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )

        toast.success(SECRET_FIGHTING_ART_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Secret Fighting Art Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, toast]
  )

  /**
   * Handle Edit Secret Fighting Art
   *
   * Optimistically updates the secret fighting art, then persists to the
   * database. Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving || !editingItem) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('secret fighting art'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  secret_fighting_art_name: data.name,
                  rules: data.rules || null
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateSecretFightingArt(editingItem.id, {
          secret_fighting_art_name: data.name,
          rules: data.rules || null
        })

        toast.success(SECRET_FIGHTING_ART_UPDATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Secret Fighting Art Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems, toast]
  )

  /**
   * Handle Delete Secret Fighting Art
   *
   * Optimistically removes the secret fighting art from the list, then persists
   * the deletion. Restores the previous list on failure.
   */
  const handleDelete = useCallback(
    (item: SecretFightingArtDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeSecretFightingArt(item.id)
        .then(() => toast.success(SECRET_FIGHTING_ART_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Secret Fighting Art Error:', err)
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
   * the edit dialog seeded with the target secret fighting art's values.
   */
  const openEditDialog = useCallback((item: SecretFightingArtDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Secret Fighting Arts</span>
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
                No custom secret fighting arts have been discovered yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom secret fighting art to see it appear here.
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
                      {item.secret_fighting_art_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.secret_fighting_art_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.secret_fighting_art_name}`}>
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
        title="Create Custom Secret Fighting Art"
        description="A forbidden technique is unearthed."
        nameLabel="Secret Fighting Art Name"
        namePlaceholder="Enter secret fighting art name"
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
        initialName={editingItem?.secret_fighting_art_name}
        initialRules={editingItem?.rules ?? ''}
        title="Edit Secret Fighting Art"
        description="Refine the forbidden technique."
        nameLabel="Secret Fighting Art Name"
        namePlaceholder="Enter secret fighting art name"
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
