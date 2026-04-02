'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  addMilestone,
  getMilestones,
  removeMilestone,
  updateMilestone
} from '@/lib/dal/milestone'
import {
  ERROR_MESSAGE,
  MILESTONE_CREATED_MESSAGE,
  MILESTONE_MISSING_EVENT_ERROR,
  MILESTONE_REMOVED_MESSAGE,
  MILESTONE_UPDATED_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import { MilestoneDetail } from '@/lib/types'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

/**
 * Custom Milestones Card Component Properties
 */
interface CustomMilestonesCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Milestones Card Component
 *
 * Lists user's custom milestones with options to create, edit, and delete.
 * Each milestone has a name, event name, and campaign type associations.
 * Entries are displayed alphabetically. UI updates are optimistic and roll
 * back on database failure.
 *
 * Campaign types are intentionally omitted here.
 *
 * @param props Custom Milestones Card Properties
 * @returns Custom Milestones Card Component
 */
export function CustomMilestonesCard({
  local
}: CustomMilestonesCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<MilestoneDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Create form state
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEventName, setNewEventName] = useState('')

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingEventName, setEditingEventName] = useState('')

  const newInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: MilestoneDetail[]): MilestoneDetail[] =>
      [...list].sort((a, b) =>
        a.milestone_name.localeCompare(b.milestone_name)
      ),
    []
  )

  /** Load custom milestones from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getMilestones()
      const custom = Object.values(data).filter((i) => i.custom)
      setItems(sortItems(custom))
    } catch (err: unknown) {
      console.error('Load Milestones Error:', err)
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
   * Handle Add Milestone
   *
   * Optimistically adds a new milestone, then persists to the database.
   * Rolls back on failure.
   */
  const handleAdd = useCallback(async () => {
    const trimmedName = newName.trim()
    const trimmedEvent = newEventName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('milestone'))
    if (!trimmedEvent) return toast.error(MILESTONE_MISSING_EVENT_ERROR())

    const tempId = `temp-${Date.now()}`
    const temp: MilestoneDetail = {
      id: tempId,
      custom: true,
      milestone_name: trimmedName,
      event_name: trimmedEvent,
      campaign_types: []
    }

    const previous = [...items]
    setItems(sortItems([...items, temp]))
    setNewName('')
    setNewEventName('')
    setIsAdding(false)

    try {
      const created = await addMilestone({
        custom: true,
        milestone_name: trimmedName,
        event_name: trimmedEvent,
        campaign_types: []
      })

      setItems((prev) =>
        sortItems(prev.map((i) => (i.id === tempId ? created : i)))
      )

      toast.success(MILESTONE_CREATED_MESSAGE())
    } catch (err: unknown) {
      setItems(previous)
      console.error('Add Milestone Error:', err)
      toast.error(ERROR_MESSAGE())
    }
  }, [items, newName, newEventName, sortItems, toast])

  /**
   * Handle Delete Milestone
   *
   * Optimistically removes the milestone, then deletes from the database.
   * Rolls back on failure.
   *
   * @param item Milestone to delete
   */
  const handleDelete = useCallback(
    (item: MilestoneDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeMilestone(item.id)
        .then(() => toast.success(MILESTONE_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Milestone Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  /** Enter edit mode for a milestone */
  const handleStartEdit = useCallback((item: MilestoneDetail) => {
    setEditingId(item.id)
    setEditingName(item.milestone_name)
    setEditingEventName(item.event_name)
  }, [])

  /** Cancel edit mode */
  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingName('')
    setEditingEventName('')
  }, [])

  /**
   * Handle Save Edit
   *
   * Optimistically updates the milestone, then persists to the database.
   * Rolls back on failure.
   */
  const handleSaveEdit = useCallback(() => {
    const trimmedName = editingName.trim()
    const trimmedEvent = editingEventName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('milestone'))
    if (!trimmedEvent) return toast.error(MILESTONE_MISSING_EVENT_ERROR())
    if (!editingId) return

    const previous = [...items]

    setItems(
      sortItems(
        items.map((i) =>
          i.id === editingId
            ? {
                ...i,
                milestone_name: trimmedName,
                event_name: trimmedEvent,
                campaign_types: []
              }
            : i
        )
      )
    )

    setEditingId(null)
    setEditingName('')
    setEditingEventName('')

    updateMilestone(editingId, {
      milestone_name: trimmedName,
      event_name: trimmedEvent,
      campaign_types: []
    })
      .then(() => toast.success(MILESTONE_UPDATED_MESSAGE()))
      .catch((err: unknown) => {
        setItems(previous)
        console.error('Update Milestone Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [items, editingId, editingName, editingEventName, sortItems, toast])

  const handleNewKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleAdd()
      else if (e.key === 'Escape') {
        setIsAdding(false)
        setNewName('')
        setNewEventName('')
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
    setNewEventName('')
    setIsAdding(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Milestones</span>
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
                No custom milestones loom on the horizon.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom milestone to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Add form */}
            {isAdding && (
              <div className="mb-2 rounded-md border p-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="new-milestone-name">Milestone Name</Label>
                  <Input
                    ref={newInputRef}
                    id="new-milestone-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleNewKeyDown}
                    placeholder="Milestone name"
                    aria-label="New milestone name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-milestone-event">Event Name</Label>
                  <Input
                    id="new-milestone-event"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    onKeyDown={handleNewKeyDown}
                    placeholder="Story event name"
                    aria-label="New milestone event name"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false)
                      setNewName('')
                      setNewEventName('')
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
                  <Label htmlFor="edit-milestone-name">Milestone Name</Label>
                  <Input
                    ref={editInputRef}
                    id="edit-milestone-name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder="Milestone name"
                    aria-label="Edit milestone name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-milestone-event">Event Name</Label>
                  <Input
                    id="edit-milestone-event"
                    value={editingEventName}
                    onChange={(e) => setEditingEventName(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder="Story event name"
                    aria-label="Edit milestone event name"
                  />
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
                        Event
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
                            {item.milestone_name}
                          </div>
                          {/* Show event name on mobile below the name */}
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {item.event_name}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {item.event_name}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(item)}
                              disabled={!!editingId}
                              title={`Edit ${item.milestone_name}`}>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item)}
                              disabled={!!editingId}
                              title={`Delete ${item.milestone_name}`}>
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
