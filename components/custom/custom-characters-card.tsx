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
  addCharacter,
  getUserCustomCharacters,
  removeCharacter,
  updateCharacter
} from '@/lib/dal/character'
import {
  CHARACTER_CREATED_MESSAGE,
  CHARACTER_DELETED_MESSAGE,
  CHARACTER_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import { CharacterDetail } from '@/lib/types'
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Characters Card Component Properties
 */
interface CustomCharactersCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Characters Card Component
 *
 * Lists user's custom characters with options to create, edit, and delete.
 * Entries are displayed alphabetically. Character name and rules are entered
 * via a dialog. UI updates are optimistic and roll back on database failure.
 *
 * @param props Custom Characters Card Properties
 * @returns Custom Characters Card Component
 */
export function CustomCharactersCard({
  local
}: CustomCharactersCardProps): ReactElement {
  const { toast } = useToast(local)

  const [characters, setCharacters] = useState<CharacterDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] =
    useState<CharacterDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort characters alphabetically by name */
  const sortCharacters = useCallback(
    (chars: CharacterDetail[]): CharacterDetail[] =>
      [...chars].sort((a, b) =>
        a.character_name.localeCompare(b.character_name)
      ),
    []
  )

  // Load custom characters on mount.
  useEffect(() => {
    let cancelled = false

    getUserCustomCharacters()
      .then((data) => {
        if (cancelled) return

        setCharacters(sortCharacters(Object.values(data)))
      })
      .catch((err: unknown) => {
        if (cancelled) return

        console.error('Load Characters Error:', err)
        toast.error(ERROR_MESSAGE())
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [sortCharacters, toast])

  /**
   * Handle Create Character
   *
   * Optimistically adds a new character to the list, then persists to the
   * database. Rolls back on failure.
   *
   * @param data Character name and rules
   */
  const handleCreate = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('character'))

      setSaving(true)

      // Optimistically add with a temp ID
      const tempId = `temp-${crypto.randomUUID()}`
      const tempCharacter: CharacterDetail = {
        id: tempId,
        custom: true,
        character_name: data.name,
        rules: data.rules || null
      }

      const previousCharacters = [...characters]
      setCharacters(sortCharacters([...characters, tempCharacter]))
      setCreateDialogOpen(false)

      try {
        const created = await addCharacter({
          custom: true,
          character_name: data.name,
          rules: data.rules || null
        })

        // Replace temp entry with the real one
        setCharacters((prev) =>
          sortCharacters(prev.map((c) => (c.id === tempId ? created : c)))
        )

        toast.success(CHARACTER_CREATED_MESSAGE())
      } catch (err: unknown) {
        setCharacters(previousCharacters)
        console.error('Add Character Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [characters, saving, sortCharacters, toast]
  )

  /**
   * Handle Edit Character
   *
   * Optimistically updates the character, then persists to the database.
   * Rolls back on failure.
   *
   * @param data Updated character name and rules
   */
  const handleEdit = useCallback(
    async (data: { name: string; rules: string }) => {
      if (saving || !editingCharacter) return
      if (!data.name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('character'))

      setSaving(true)

      const previousCharacters = [...characters]

      setCharacters(
        sortCharacters(
          characters.map((c) =>
            c.id === editingCharacter.id
              ? {
                  ...c,
                  character_name: data.name,
                  rules: data.rules || null
                }
              : c
          )
        )
      )

      setEditDialogOpen(false)
      setEditingCharacter(null)

      try {
        await updateCharacter(editingCharacter.id, {
          character_name: data.name,
          rules: data.rules || null
        })

        toast.success(CHARACTER_UPDATED_MESSAGE(data.name))
      } catch (err: unknown) {
        setCharacters(previousCharacters)
        console.error('Update Character Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [characters, editingCharacter, saving, sortCharacters, toast]
  )

  /**
   * Handle Delete Character
   *
   * Optimistically removes the character from the list, then deletes from
   * the database. Rolls back on failure.
   *
   * @param character Character to delete
   */
  const handleDelete = useCallback(
    (character: CharacterDetail) => {
      const previousCharacters = [...characters]
      setCharacters(characters.filter((c) => c.id !== character.id))

      removeCharacter(character.id)
        .then(() =>
          toast.success(CHARACTER_DELETED_MESSAGE(character.character_name))
        )
        .catch((err: unknown) => {
          setCharacters(previousCharacters)
          const guard = getCatalogDeleteGuardMessage(err)
          if (!guard) console.error('Delete Character Error:', err)
          toast.error(guard ?? ERROR_MESSAGE())
        })
    },
    [characters, toast]
  )

  /** Open the create dialog with a fresh key to reset state */
  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  /** Open the edit dialog for a specific character */
  const openEditDialog = useCallback((character: CharacterDetail) => {
    setDialogKey((k) => k + 1)
    setEditingCharacter(character)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Characters</span>
          <Button
            variant="outline"
            size="sm"
            onClick={openCreateDialog}
            name="add-character"
            id="add-character">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Character
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
        ) : characters.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                No custom characters have emerged yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom character to see it appear here.
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
                {characters.map((character) => (
                  <TableRow key={character.id}>
                    <TableCell className="font-medium">
                      {character.character_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(character)}
                          title={`Edit ${character.character_name}`}
                          name={`edit-character-${character.id}`}
                          id={`edit-character-${character.id}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(character)}
                          title={`Delete ${character.character_name}`}
                          name={`delete-character-${character.id}`}
                          id={`delete-character-${character.id}`}>
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

      {/* Create Character Dialog */}
      <CustomItemDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        title="Create Custom Character"
        description="A new face emerges from the darkness."
        nameLabel="Character Name"
        namePlaceholder="Enter character name"
        saveLabel="Create"
        savingLabel="Creating..."
      />

      {/* Edit Character Dialog */}
      <CustomItemDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingCharacter(null)
        }}
        onSave={handleEdit}
        saving={saving}
        initialName={editingCharacter?.character_name}
        initialRules={editingCharacter?.rules ?? ''}
        title="Edit Character"
        description="Rewrite this survivor's tale."
        nameLabel="Character Name"
        namePlaceholder="Enter character name"
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
