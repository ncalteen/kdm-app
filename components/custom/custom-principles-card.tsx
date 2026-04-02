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
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

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
 * Each principle has a name, two option names, and campaign type associations.
 * Entries are displayed alphabetically. UI updates are optimistic and roll
 * back on database failure.
 *
 * Campaign types are intentionally omitted here.
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

  // Create form state
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newOption1, setNewOption1] = useState('')
  const [newOption2, setNewOption2] = useState('')

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingOption1, setEditingOption1] = useState('')
  const [editingOption2, setEditingOption2] = useState('')

  const newInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (isAdding) newInputRef.current?.focus()
  }, [isAdding])

  useEffect(() => {
    if (editingId) editInputRef.current?.focus()
  }, [editingId])

  /**
   * Handle Add Principle
   *
   * Optimistically adds a new principle, then persists to the database.
   * Rolls back on failure.
   */
  const handleAdd = useCallback(async () => {
    const trimmedName = newName.trim()
    const trimmedOption1 = newOption1.trim()
    const trimmedOption2 = newOption2.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('principle'))
    if (!trimmedOption1 || !trimmedOption2)
      return toast.error('Both principle options must be named.')

    const tempId = `temp-${Date.now()}`
    const temp: PrincipleDetail = {
      id: tempId,
      custom: true,
      principle_name: trimmedName,
      option_1_name: trimmedOption1,
      option_2_name: trimmedOption2,
      campaign_types: []
    }

    const previous = [...items]
    setItems(sortItems([...items, temp]))
    setNewName('')
    setNewOption1('')
    setNewOption2('')
    setIsAdding(false)

    try {
      const created = await addPrinciple({
        custom: true,
        principle_name: trimmedName,
        option_1_name: trimmedOption1,
        option_2_name: trimmedOption2,
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
    }
  }, [items, newName, newOption1, newOption2, sortItems, toast])

  /**
   * Handle Delete Principle
   *
   * Optimistically removes the principle, then deletes from the database.
   * Rolls back on failure.
   *
   * @param item Principle to delete
   */
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

  /** Enter edit mode for a principle */
  const handleStartEdit = useCallback((item: PrincipleDetail) => {
    setEditingId(item.id)
    setEditingName(item.principle_name)
    setEditingOption1(item.option_1_name)
    setEditingOption2(item.option_2_name)
  }, [])

  /** Cancel edit mode */
  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingName('')
    setEditingOption1('')
    setEditingOption2('')
  }, [])

  /**
   * Handle Save Edit
   *
   * Optimistically updates the principle, then persists to the database.
   * Rolls back on failure.
   */
  const handleSaveEdit = useCallback(() => {
    const trimmedName = editingName.trim()
    const trimmedOption1 = editingOption1.trim()
    const trimmedOption2 = editingOption2.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('principle'))
    if (!trimmedOption1 || !trimmedOption2)
      return toast.error('Both principle options must be named.')
    if (!editingId) return

    const previous = [...items]

    setItems(
      sortItems(
        items.map((i) =>
          i.id === editingId
            ? {
                ...i,
                principle_name: trimmedName,
                option_1_name: trimmedOption1,
                option_2_name: trimmedOption2,
                campaign_types: []
              }
            : i
        )
      )
    )

    setEditingId(null)
    setEditingName('')
    setEditingOption1('')
    setEditingOption2('')

    updatePrinciple(editingId, {
      principle_name: trimmedName,
      option_1_name: trimmedOption1,
      option_2_name: trimmedOption2,
      campaign_types: []
    })
      .then(() => toast.success(PRINCIPLE_UPDATED_MESSAGE(false)))
      .catch((err: unknown) => {
        setItems(previous)
        console.error('Update Principle Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [
    items,
    editingId,
    editingName,
    editingOption1,
    editingOption2,
    sortItems,
    toast
  ])

  const handleNewKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleAdd()
      else if (e.key === 'Escape') {
        setIsAdding(false)
        setNewName('')
        setNewOption1('')
        setNewOption2('')
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
    setNewOption1('')
    setNewOption2('')
    setIsAdding(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Principles</span>
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
                No custom principles guide the settlement yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom principle to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Add form */}
            {isAdding && (
              <div className="mb-2 rounded-md border p-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="new-principle-name">Principle Name</Label>
                  <Input
                    ref={newInputRef}
                    id="new-principle-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleNewKeyDown}
                    placeholder="Principle name"
                    aria-label="New principle name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="new-principle-option1">Option 1</Label>
                    <Input
                      id="new-principle-option1"
                      value={newOption1}
                      onChange={(e) => setNewOption1(e.target.value)}
                      onKeyDown={handleNewKeyDown}
                      placeholder="Option 1 name"
                      aria-label="New principle option 1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-principle-option2">Option 2</Label>
                    <Input
                      id="new-principle-option2"
                      value={newOption2}
                      onChange={(e) => setNewOption2(e.target.value)}
                      onKeyDown={handleNewKeyDown}
                      placeholder="Option 2 name"
                      aria-label="New principle option 2"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false)
                      setNewName('')
                      setNewOption1('')
                      setNewOption2('')
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
                  <Label htmlFor="edit-principle-name">Principle Name</Label>
                  <Input
                    ref={editInputRef}
                    id="edit-principle-name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder="Principle name"
                    aria-label="Edit principle name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="edit-principle-option1">Option 1</Label>
                    <Input
                      id="edit-principle-option1"
                      value={editingOption1}
                      onChange={(e) => setEditingOption1(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      placeholder="Option 1 name"
                      aria-label="Edit principle option 1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-principle-option2">Option 2</Label>
                    <Input
                      id="edit-principle-option2"
                      value={editingOption2}
                      onChange={(e) => setEditingOption2(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      placeholder="Option 2 name"
                      aria-label="Edit principle option 2"
                    />
                  </div>
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
                        Options
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
                            {item.principle_name}
                          </div>
                          {/* Show options on mobile below the name */}
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
                              onClick={() => handleStartEdit(item)}
                              disabled={!!editingId}
                              title={`Edit ${item.principle_name}`}>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item)}
                              disabled={!!editingId}
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
