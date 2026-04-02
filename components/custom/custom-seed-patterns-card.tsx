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
  addSeedPattern,
  getSeedPatterns,
  removeSeedPattern,
  updateSeedPattern
} from '@/lib/dal/seed-pattern'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  SEED_PATTERN_CREATED_MESSAGE,
  SEED_PATTERN_REMOVED_MESSAGE,
  SEED_PATTERN_UPDATED_MESSAGE
} from '@/lib/messages'
import { SeedPatternDetail } from '@/lib/types'
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
 * Custom Seed Patterns Card Component Properties
 */
interface CustomSeedPatternsCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Seed Patterns Card Component
 *
 * Lists user's custom seed patterns with options to create, edit, and delete.
 * Entries are displayed alphabetically. UI updates are optimistic and roll
 * back on database failure.
 *
 * @param props Custom Seed Patterns Card Properties
 * @returns Custom Seed Patterns Card Component
 */
export function CustomSeedPatternsCard({
  local
}: CustomSeedPatternsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<SeedPatternDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const newInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: SeedPatternDetail[]): SeedPatternDetail[] =>
      [...list].sort((a, b) =>
        a.seed_pattern_name.localeCompare(b.seed_pattern_name)
      ),
    []
  )

  /** Load custom seed patterns from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getSeedPatterns()
      const custom = Object.values(data).filter((i) => i.custom)
      setItems(sortItems(custom))
    } catch (err: unknown) {
      console.error('Load Seed Patterns Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  useEffect(() => {
    if (isAdding) newInputRef.current?.focus()
  }, [isAdding])

  useEffect(() => {
    if (editingId) editInputRef.current?.focus()
  }, [editingId])

  /**
   * Handle Add Seed Pattern
   *
   * Optimistically adds a new seed pattern, then persists to the database.
   * Rolls back on failure.
   */
  const handleAdd = useCallback(async () => {
    const trimmedName = newName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('seed pattern'))

    const tempId = `temp-${Date.now()}`
    const temp: SeedPatternDetail = {
      id: tempId,
      custom: true,
      seed_pattern_name: trimmedName
    }

    const previous = [...items]
    setItems(sortItems([...items, temp]))
    setNewName('')
    setIsAdding(false)

    try {
      const created = await addSeedPattern({
        custom: true,
        seed_pattern_name: trimmedName
      })

      setItems((prev) =>
        sortItems(prev.map((i) => (i.id === tempId ? created : i)))
      )

      toast.success(SEED_PATTERN_CREATED_MESSAGE())
    } catch (err: unknown) {
      setItems(previous)
      console.error('Add Seed Pattern Error:', err)
      toast.error(ERROR_MESSAGE())
    }
  }, [items, newName, sortItems, toast])

  /**
   * Handle Delete Seed Pattern
   *
   * Optimistically removes the seed pattern, then deletes from the database.
   * Rolls back on failure.
   *
   * @param item Seed Pattern to delete
   */
  const handleDelete = useCallback(
    (item: SeedPatternDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeSeedPattern(item.id)
        .then(() => toast.success(SEED_PATTERN_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Seed Pattern Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  /** Enter edit mode for a seed pattern */
  const handleStartEdit = useCallback((item: SeedPatternDetail) => {
    setEditingId(item.id)
    setEditingName(item.seed_pattern_name)
  }, [])

  /** Cancel edit mode */
  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingName('')
  }, [])

  /**
   * Handle Save Edit
   *
   * Optimistically updates the seed pattern name, then persists to the
   * database. Rolls back on failure.
   */
  const handleSaveEdit = useCallback(() => {
    const trimmedName = editingName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('seed pattern'))
    if (!editingId) return

    const previous = [...items]

    setItems(
      sortItems(
        items.map((i) =>
          i.id === editingId ? { ...i, seed_pattern_name: trimmedName } : i
        )
      )
    )

    setEditingId(null)
    setEditingName('')

    updateSeedPattern(editingId, { seed_pattern_name: trimmedName })
      .then(() => toast.success(SEED_PATTERN_UPDATED_MESSAGE()))
      .catch((err: unknown) => {
        setItems(previous)
        console.error('Update Seed Pattern Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [items, editingId, editingName, sortItems, toast])

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
          <span>Seed Patterns</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}>
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
        ) : items.length === 0 && !isAdding ? (
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                No custom seed patterns have taken root yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom seed pattern to see it appear here.
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
                {isAdding && (
                  <TableRow>
                    <TableCell>
                      <Input
                        ref={newInputRef}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={handleNewKeyDown}
                        placeholder="Seed pattern name"
                        aria-label="New seed pattern name"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleAdd}
                          title="Save seed pattern">
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setIsAdding(false)
                            setNewName('')
                          }}
                          title="Cancel">
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {editingId === item.id ? (
                        <Input
                          ref={editInputRef}
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          placeholder="Seed pattern name"
                          aria-label={`Edit ${item.seed_pattern_name}`}
                        />
                      ) : (
                        item.seed_pattern_name
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === item.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleSaveEdit}
                              title="Save">
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelEdit}
                              title="Cancel">
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(item)}
                              title={`Edit ${item.seed_pattern_name}`}>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item)}
                              title={`Delete ${item.seed_pattern_name}`}>
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
