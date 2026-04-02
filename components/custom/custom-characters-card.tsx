'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  getCharacters,
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
import {
  CheckIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

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
 * Entries are displayed alphabetically. UI updates are optimistic and roll
 * back on database failure.
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
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const newInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  /** Sort characters alphabetically by name */
  const sortCharacters = useCallback(
    (chars: CharacterDetail[]): CharacterDetail[] =>
      [...chars].sort((a, b) =>
        a.character_name.localeCompare(b.character_name)
      ),
    []
  )

  /** Load custom characters from the database */
  const loadCharacters = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getCharacters()

      // Only show custom characters
      const customChars = Object.values(data).filter((c) => c.custom)
      setCharacters(sortCharacters(customChars))
    } catch (err: unknown) {
      console.error('Load Characters Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortCharacters, toast])

  useEffect(() => {
    loadCharacters()
  }, [loadCharacters])

  // Auto-focus the new character input when adding
  useEffect(() => {
    if (isAdding) newInputRef.current?.focus()
  }, [isAdding])

  // Auto-focus the edit input when editing
  useEffect(() => {
    if (editingId) editInputRef.current?.focus()
  }, [editingId])

  /**
   * Handle Add Character
   *
   * Optimistically adds a new character to the list, then persists to the
   * database. Rolls back on failure.
   */
  const handleAdd = useCallback(async () => {
    const trimmedName = newName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('character'))

    // Optimistically add with a temp ID
    const tempId = `temp-${Date.now()}`
    const tempCharacter: CharacterDetail = {
      id: tempId,
      custom: true,
      character_name: trimmedName
    }

    const previousCharacters = [...characters]
    setCharacters(sortCharacters([...characters, tempCharacter]))
    setNewName('')
    setIsAdding(false)

    try {
      const created = await addCharacter({
        custom: true,
        character_name: trimmedName
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
    }
  }, [characters, newName, sortCharacters, toast])

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
          console.error('Delete Character Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [characters, toast]
  )

  /**
   * Handle Start Edit
   *
   * Enters edit mode for a character.
   *
   * @param character Character to edit
   */
  const handleStartEdit = useCallback((character: CharacterDetail) => {
    setEditingId(character.id)
    setEditingName(character.character_name)
  }, [])

  /**
   * Handle Cancel Edit
   *
   * Cancels edit mode.
   */
  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingName('')
  }, [])

  /**
   * Handle Save Edit
   *
   * Optimistically updates the character name, then persists to the database.
   * Rolls back on failure.
   */
  const handleSaveEdit = useCallback(() => {
    const trimmedName = editingName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('character'))
    if (!editingId) return

    const previousCharacters = [...characters]

    setCharacters(
      sortCharacters(
        characters.map((c) =>
          c.id === editingId ? { ...c, character_name: trimmedName } : c
        )
      )
    )

    setEditingId(null)
    setEditingName('')

    updateCharacter(editingId, { character_name: trimmedName })
      .then(() => toast.success(CHARACTER_UPDATED_MESSAGE(trimmedName)))
      .catch((err: unknown) => {
        setCharacters(previousCharacters)
        console.error('Update Character Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [characters, editingId, editingName, sortCharacters, toast])

  /**
   * Handle New Character Key Down
   *
   * Saves on Enter, cancels on Escape.
   *
   * @param e Keyboard Event
   */
  const handleNewKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleAdd()
      else if (e.key === 'Escape') {
        setIsAdding(false)
        setNewName('')
      }
    },
    [handleAdd]
  )

  /**
   * Handle Edit Key Down
   *
   * Saves on Enter, cancels on Escape.
   *
   * @param e Keyboard Event
   */
  const handleEditKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSaveEdit()
      else if (e.key === 'Escape') handleCancelEdit()
    },
    [handleCancelEdit, handleSaveEdit]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Characters</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
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
        ) : characters.length === 0 && !isAdding ? (
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
          <div className="max-h-[400px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[70%]">Name</TableHead>
                  <TableHead className="w-[30%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* New character input row */}
                {isAdding && (
                  <TableRow>
                    <TableCell>
                      <Input
                        ref={newInputRef}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={handleNewKeyDown}
                        placeholder="Character name"
                        name="new-character-name"
                        id="new-character-name"
                        aria-label="New character name"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleAdd}
                          title="Save character"
                          name="save-new-character"
                          id="save-new-character">
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setIsAdding(false)
                            setNewName('')
                          }}
                          title="Cancel"
                          name="cancel-new-character"
                          id="cancel-new-character">
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Existing character rows */}
                {characters.map((character) => (
                  <TableRow key={character.id}>
                    <TableCell className="font-medium">
                      {editingId === character.id ? (
                        <Input
                          ref={editInputRef}
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          placeholder="Character name"
                          name={`edit-character-name-${character.id}`}
                          id={`edit-character-name-${character.id}`}
                          aria-label={`Edit ${character.character_name}`}
                        />
                      ) : (
                        character.character_name
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === character.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleSaveEdit}
                              title="Save"
                              name={`save-edit-character-${character.id}`}
                              id={`save-edit-character-${character.id}`}>
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelEdit}
                              title="Cancel"
                              name={`cancel-edit-character-${character.id}`}
                              id={`cancel-edit-character-${character.id}`}>
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(character)}
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
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
