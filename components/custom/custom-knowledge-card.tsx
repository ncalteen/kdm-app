'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
  addKnowledge,
  getKnowledges,
  removeKnowledge,
  updateKnowledge
} from '@/lib/dal/knowledge'
import { getPhilosophies } from '@/lib/dal/philosophy'
import {
  ERROR_MESSAGE,
  KNOWLEDGE_CREATED_MESSAGE,
  KNOWLEDGE_REMOVED_MESSAGE,
  KNOWLEDGE_UPDATED_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import { KnowledgeDetail, PhilosophyDetail } from '@/lib/types'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

/** No philosophy sentinel value */
const NO_PHILOSOPHY = '__none__'

/**
 * Custom Knowledge Card Component Properties
 */
interface CustomKnowledgeCardProps {
  /** Local State */
  local: LocalStateType
  /** Bumped when philosophies change externally */
  philosophyVersion?: number
}

/**
 * Custom Knowledge Card Component
 *
 * Lists user's custom knowledge entries with options to create, edit, and
 * delete. Each knowledge entry can optionally be linked to a philosophy.
 * Entries are displayed alphabetically. UI updates are optimistic and roll
 * back on database failure.
 *
 * @param props Custom Knowledge Card Properties
 * @returns Custom Knowledge Card Component
 */
export function CustomKnowledgeCard({
  local,
  philosophyVersion
}: CustomKnowledgeCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<KnowledgeDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [availablePhilosophies, setAvailablePhilosophies] = useState<{
    [key: string]: PhilosophyDetail
  }>({})

  // Create form state
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhilosophyId, setNewPhilosophyId] = useState<string | null>(null)

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingPhilosophyId, setEditingPhilosophyId] = useState<string | null>(
    null
  )

  const newInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: KnowledgeDetail[]): KnowledgeDetail[] =>
      [...list].sort((a, b) =>
        a.knowledge_name.localeCompare(b.knowledge_name)
      ),
    []
  )

  /** Sorted philosophies for dropdown */
  const sortedPhilosophies = useMemo(
    () =>
      Object.values(availablePhilosophies).sort((a, b) =>
        a.philosophy_name.localeCompare(b.philosophy_name)
      ),
    [availablePhilosophies]
  )

  /** Load custom knowledge and available philosophies */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const [knowledgeData, philosophyData] = await Promise.all([
        getKnowledges(),
        getPhilosophies()
      ])

      const custom = Object.values(knowledgeData).filter((i) => i.custom)
      setItems(sortItems(custom))
      setAvailablePhilosophies(philosophyData)
    } catch (err: unknown) {
      console.error('Load Knowledge Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Re-fetch philosophies when they change externally
  useEffect(() => {
    if (philosophyVersion === undefined || philosophyVersion === 0) return

    getPhilosophies()
      .then((data) => setAvailablePhilosophies(data))
      .catch((err: unknown) =>
        console.error('Refresh Philosophies Error:', err)
      )
  }, [philosophyVersion])

  useEffect(() => {
    if (isAdding) newInputRef.current?.focus()
  }, [isAdding])

  useEffect(() => {
    if (editingId) editInputRef.current?.focus()
  }, [editingId])

  /** Get philosophy name by ID */
  const getPhilosophyName = useCallback(
    (philosophyId: string | null): string => {
      if (!philosophyId) return '-'
      return availablePhilosophies[philosophyId]?.philosophy_name ?? '-'
    },
    [availablePhilosophies]
  )

  /**
   * Handle Add Knowledge
   *
   * Optimistically adds new knowledge, then persists to the database.
   * Rolls back on failure.
   */
  const handleAdd = useCallback(async () => {
    const trimmedName = newName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('knowledge'))

    const tempId = `temp-${Date.now()}`
    const temp: KnowledgeDetail = {
      id: tempId,
      custom: true,
      knowledge_name: trimmedName,
      philosophy_id: newPhilosophyId
    }

    const previous = [...items]
    setItems(sortItems([...items, temp]))
    setNewName('')
    setNewPhilosophyId(null)
    setIsAdding(false)

    try {
      const created = await addKnowledge({
        custom: true,
        knowledge_name: trimmedName,
        philosophy_id: newPhilosophyId
      })

      setItems((prev) =>
        sortItems(prev.map((i) => (i.id === tempId ? created : i)))
      )

      toast.success(KNOWLEDGE_CREATED_MESSAGE())
    } catch (err: unknown) {
      setItems(previous)
      console.error('Add Knowledge Error:', err)
      toast.error(ERROR_MESSAGE())
    }
  }, [items, newName, newPhilosophyId, sortItems, toast])

  /**
   * Handle Delete Knowledge
   *
   * Optimistically removes the knowledge, then deletes from the database.
   * Rolls back on failure.
   *
   * @param item Knowledge to delete
   */
  const handleDelete = useCallback(
    (item: KnowledgeDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeKnowledge(item.id)
        .then(() => toast.success(KNOWLEDGE_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Knowledge Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  /** Enter edit mode for knowledge */
  const handleStartEdit = useCallback((item: KnowledgeDetail) => {
    setEditingId(item.id)
    setEditingName(item.knowledge_name)
    setEditingPhilosophyId(item.philosophy_id)
  }, [])

  /** Cancel edit mode */
  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingName('')
    setEditingPhilosophyId(null)
  }, [])

  /**
   * Handle Save Edit
   *
   * Optimistically updates the knowledge, then persists to the database.
   * Rolls back on failure.
   */
  const handleSaveEdit = useCallback(() => {
    const trimmedName = editingName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('knowledge'))
    if (!editingId) return

    const previous = [...items]

    setItems(
      sortItems(
        items.map((i) =>
          i.id === editingId
            ? {
                ...i,
                knowledge_name: trimmedName,
                philosophy_id: editingPhilosophyId
              }
            : i
        )
      )
    )

    setEditingId(null)
    setEditingName('')
    setEditingPhilosophyId(null)

    updateKnowledge(editingId, {
      knowledge_name: trimmedName,
      philosophy_id: editingPhilosophyId
    })
      .then(() => toast.success(KNOWLEDGE_UPDATED_MESSAGE()))
      .catch((err: unknown) => {
        setItems(previous)
        console.error('Update Knowledge Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [items, editingId, editingName, editingPhilosophyId, sortItems, toast])

  const handleNewKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleAdd()
      else if (e.key === 'Escape') {
        setIsAdding(false)
        setNewName('')
        setNewPhilosophyId(null)
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

  /** Reset and open the add form */
  const handleStartAdd = useCallback(() => {
    setNewName('')
    setNewPhilosophyId(null)
    setIsAdding(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Knowledge</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartAdd}
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
                No custom knowledge has been uncovered yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create custom knowledge to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Add form */}
            {isAdding && (
              <div className="mb-2 rounded-md border p-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="new-knowledge-name">Knowledge Name</Label>
                  <Input
                    ref={newInputRef}
                    id="new-knowledge-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleNewKeyDown}
                    placeholder="Knowledge name"
                    aria-label="New knowledge name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-knowledge-philosophy">
                    Philosophy (optional)
                  </Label>
                  <Select
                    value={newPhilosophyId ?? NO_PHILOSOPHY}
                    onValueChange={(v) =>
                      setNewPhilosophyId(v === NO_PHILOSOPHY ? null : v)
                    }>
                    <SelectTrigger id="new-knowledge-philosophy">
                      <SelectValue placeholder="No philosophy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PHILOSOPHY}>
                        No philosophy
                      </SelectItem>
                      {sortedPhilosophies.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.philosophy_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false)
                      setNewName('')
                      setNewPhilosophyId(null)
                    }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAdd}>
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Edit form */}
            {editingId && (
              <div className="mb-2 rounded-md border p-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-knowledge-name">Knowledge Name</Label>
                  <Input
                    ref={editInputRef}
                    id="edit-knowledge-name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder="Knowledge name"
                    aria-label="Edit knowledge name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-knowledge-philosophy">
                    Philosophy (optional)
                  </Label>
                  <Select
                    value={editingPhilosophyId ?? NO_PHILOSOPHY}
                    onValueChange={(v) =>
                      setEditingPhilosophyId(v === NO_PHILOSOPHY ? null : v)
                    }>
                    <SelectTrigger id="edit-knowledge-philosophy">
                      <SelectValue placeholder="No philosophy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PHILOSOPHY}>
                        No philosophy
                      </SelectItem>
                      {sortedPhilosophies.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.philosophy_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Items list */}
            {(items.length > 0 || (!isAdding && !editingId)) && (
              <div className="max-h-[400px] overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Philosophy
                      </TableHead>
                      <TableHead className="w-[100px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={item.id}
                        className={
                          editingId === item.id ? 'bg-muted/50' : undefined
                        }>
                        <TableCell>
                          <div className="font-medium">
                            {item.knowledge_name}
                          </div>
                          {/* Show philosophy on mobile below the name */}
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {getPhilosophyName(item.philosophy_id)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {getPhilosophyName(item.philosophy_id)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(item)}
                              disabled={!!editingId}
                              title={`Edit ${item.knowledge_name}`}>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item)}
                              disabled={!!editingId}
                              title={`Delete ${item.knowledge_name}`}>
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
