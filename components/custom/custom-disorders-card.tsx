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
  addDisorder,
  getDisorders,
  removeDisorder,
  updateDisorder
} from '@/lib/dal/disorder'
import {
  DISORDER_CREATED_MESSAGE,
  DISORDER_REMOVED_MESSAGE,
  DISORDER_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import { DisorderDetail } from '@/lib/types'
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
 * Custom Disorders Card Component Properties
 */
interface CustomDisordersCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Disorders Card Component
 *
 * Lists user's custom disorders with options to create, edit, and delete.
 * Entries are displayed alphabetically. UI updates are optimistic and roll
 * back on database failure.
 *
 * @param props Custom Disorders Card Properties
 * @returns Custom Disorders Card Component
 */
export function CustomDisordersCard({
  local
}: CustomDisordersCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<DisorderDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const newInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: DisorderDetail[]): DisorderDetail[] =>
      [...list].sort((a, b) => a.disorder_name.localeCompare(b.disorder_name)),
    []
  )

  /** Load custom disorders from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getDisorders()
      const custom = Object.values(data).filter((i) => i.custom)
      setItems(sortItems(custom))
    } catch (err: unknown) {
      console.error('Load Disorders Error:', err)
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

  const handleAdd = useCallback(async () => {
    const trimmedName = newName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('disorder'))

    const tempId = `temp-${Date.now()}`
    const temp: DisorderDetail = {
      id: tempId,
      custom: true,
      disorder_name: trimmedName
    }

    const previous = [...items]
    setItems(sortItems([...items, temp]))
    setNewName('')
    setIsAdding(false)

    try {
      const created = await addDisorder({
        custom: true,
        disorder_name: trimmedName
      })

      setItems((prev) =>
        sortItems(prev.map((i) => (i.id === tempId ? created : i)))
      )

      toast.success(DISORDER_CREATED_MESSAGE())
    } catch (err: unknown) {
      setItems(previous)
      console.error('Add Disorder Error:', err)
      toast.error(ERROR_MESSAGE())
    }
  }, [items, newName, sortItems, toast])

  const handleDelete = useCallback(
    (item: DisorderDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeDisorder(item.id)
        .then(() => toast.success(DISORDER_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Disorder Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  const handleStartEdit = useCallback((item: DisorderDetail) => {
    setEditingId(item.id)
    setEditingName(item.disorder_name)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingName('')
  }, [])

  const handleSaveEdit = useCallback(() => {
    const trimmedName = editingName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('disorder'))
    if (!editingId) return

    const previous = [...items]

    setItems(
      sortItems(
        items.map((i) =>
          i.id === editingId ? { ...i, disorder_name: trimmedName } : i
        )
      )
    )

    setEditingId(null)
    setEditingName('')

    updateDisorder(editingId, { disorder_name: trimmedName })
      .then(() => toast.success(DISORDER_UPDATED_MESSAGE()))
      .catch((err: unknown) => {
        setItems(previous)
        console.error('Update Disorder Error:', err)
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
          <span>Disorders</span>
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
                No custom disorders have taken root yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom disorder to see it appear here.
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
                        placeholder="Disorder name"
                        aria-label="New disorder name"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleAdd}
                          title="Save disorder">
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
                          placeholder="Disorder name"
                          aria-label={`Edit ${item.disorder_name}`}
                        />
                      ) : (
                        item.disorder_name
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
                              title={`Edit ${item.disorder_name}`}>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item)}
                              title={`Delete ${item.disorder_name}`}>
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
