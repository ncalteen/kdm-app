'use client'

import { NumericInput } from '@/components/menu/numeric-input'
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
  addCollectiveCognitionReward,
  getCollectiveCognitionRewards,
  removeCollectiveCognitionReward,
  updateCollectiveCognitionReward
} from '@/lib/dal/collective-cognition-reward'
import {
  COLLECTIVE_COGNITION_REWARD_CREATED_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_REMOVED_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import { CollectiveCognitionRewardDetail } from '@/lib/types'
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
 * Custom Collective Cognition Rewards Card Component Properties
 */
interface CustomCollectiveCognitionRewardsCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Collective Cognition Rewards Card Component
 *
 * Lists user's custom collective cognition rewards with options to create,
 * edit, and delete. Each reward has a name and a collective cognition value.
 * Entries are displayed alphabetically. UI updates are optimistic and roll
 * back on database failure.
 *
 * @param props Custom Collective Cognition Rewards Card Properties
 * @returns Custom Collective Cognition Rewards Card Component
 */
export function CustomCollectiveCognitionRewardsCard({
  local
}: CustomCollectiveCognitionRewardsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<CollectiveCognitionRewardDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Create form state
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCC, setNewCC] = useState(0)

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingCC, setEditingCC] = useState(0)

  const newInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (
      list: CollectiveCognitionRewardDetail[]
    ): CollectiveCognitionRewardDetail[] =>
      [...list].sort((a, b) => a.reward_name.localeCompare(b.reward_name)),
    []
  )

  /** Load custom rewards from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getCollectiveCognitionRewards()
      const custom = Object.values(data).filter((i) => i.custom)
      setItems(sortItems(custom))
    } catch (err: unknown) {
      console.error('Load CC Rewards Error:', err)
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
   * Handle Add Reward
   *
   * Optimistically adds a new reward, then persists to the database.
   * Rolls back on failure.
   */
  const handleAdd = useCallback(async () => {
    const trimmedName = newName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('reward'))

    const tempId = `temp-${Date.now()}`
    const temp: CollectiveCognitionRewardDetail = {
      id: tempId,
      custom: true,
      reward_name: trimmedName,
      collective_cognition: newCC
    }

    const previous = [...items]
    setItems(sortItems([...items, temp]))
    setNewName('')
    setNewCC(0)
    setIsAdding(false)

    try {
      const created = await addCollectiveCognitionReward({
        custom: true,
        reward_name: trimmedName,
        collective_cognition: newCC
      })

      setItems((prev) =>
        sortItems(prev.map((i) => (i.id === tempId ? created : i)))
      )

      toast.success(COLLECTIVE_COGNITION_REWARD_CREATED_MESSAGE())
    } catch (err: unknown) {
      setItems(previous)
      console.error('Add CC Reward Error:', err)
      toast.error(ERROR_MESSAGE())
    }
  }, [items, newName, newCC, sortItems, toast])

  /**
   * Handle Delete Reward
   *
   * Optimistically removes the reward, then deletes from the database.
   * Rolls back on failure.
   *
   * @param item Reward to delete
   */
  const handleDelete = useCallback(
    (item: CollectiveCognitionRewardDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeCollectiveCognitionReward(item.id)
        .then(() =>
          toast.success(COLLECTIVE_COGNITION_REWARD_REMOVED_MESSAGE())
        )
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete CC Reward Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  /** Enter edit mode for a reward */
  const handleStartEdit = useCallback(
    (item: CollectiveCognitionRewardDetail) => {
      setEditingId(item.id)
      setEditingName(item.reward_name)
      setEditingCC(item.collective_cognition)
    },
    []
  )

  /** Cancel edit mode */
  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingName('')
    setEditingCC(0)
  }, [])

  /**
   * Handle Save Edit
   *
   * Optimistically updates the reward, then persists to the database.
   * Rolls back on failure.
   */
  const handleSaveEdit = useCallback(() => {
    const trimmedName = editingName.trim()

    if (!trimmedName)
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('reward'))
    if (!editingId) return

    const previous = [...items]

    setItems(
      sortItems(
        items.map((i) =>
          i.id === editingId
            ? {
                ...i,
                reward_name: trimmedName,
                collective_cognition: editingCC
              }
            : i
        )
      )
    )

    setEditingId(null)
    setEditingName('')
    setEditingCC(0)

    updateCollectiveCognitionReward(editingId, {
      reward_name: trimmedName,
      collective_cognition: editingCC
    })
      .then(() => toast.success(COLLECTIVE_COGNITION_REWARD_UPDATED_MESSAGE()))
      .catch((err: unknown) => {
        setItems(previous)
        console.error('Update CC Reward Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [items, editingId, editingName, editingCC, sortItems, toast])

  const handleNewKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleAdd()
      else if (e.key === 'Escape') {
        setIsAdding(false)
        setNewName('')
        setNewCC(0)
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

  /** Reset the add form and open it */
  const handleStartAdd = useCallback(() => {
    setNewName('')
    setNewCC(0)
    setIsAdding(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Collective Cognition Rewards</span>
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
                No custom collective cognition rewards have been forged yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom reward to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Add form */}
            {isAdding && (
              <div className="mb-2 rounded-md border p-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="new-ccr-name">Reward Name</Label>
                  <Input
                    ref={newInputRef}
                    id="new-ccr-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleNewKeyDown}
                    placeholder="Reward name"
                    aria-label="New reward name"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Collective Cognition</Label>
                  <NumericInput
                    label="Collective Cognition"
                    value={newCC}
                    min={0}
                    onChange={(value) => setNewCC(value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false)
                      setNewName('')
                      setNewCC(0)
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
                  <Label htmlFor="edit-ccr-name">Reward Name</Label>
                  <Input
                    ref={editInputRef}
                    id="edit-ccr-name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder="Reward name"
                    aria-label="Edit reward name"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Collective Cognition</Label>
                  <NumericInput
                    label="Collective Cognition"
                    value={editingCC}
                    min={0}
                    onChange={(value) => setEditingCC(value)}
                  />
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
                      <TableHead className="w-[80px] text-center">CC</TableHead>
                      <TableHead>Name</TableHead>
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
                        <TableCell className="text-center">
                          {item.collective_cognition}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.reward_name}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(item)}
                              disabled={!!editingId}
                              title={`Edit ${item.reward_name}`}>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item)}
                              disabled={!!editingId}
                              title={`Delete ${item.reward_name}`}>
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
