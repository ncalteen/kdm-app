'use client'

import { CollectiveCognitionRewardDialog } from '@/components/custom/dialogs/collective-cognition-reward-dialog'
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
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

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
 * edit, and delete. Each reward has a name, collective cognition value, and
 * rules. Entries are displayed alphabetically. Create and edit are handled
 * via a dialog. UI updates are optimistic and roll back on database failure.
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

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] =
    useState<CollectiveCognitionRewardDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

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
      console.error('Load Collective Cognition Rewards Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Handle Create Reward
   *
   * Optimistically adds a new reward, then persists to the database.
   * Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: {
      reward_name: string
      collective_cognition: number
      rules: string
    }) => {
      if (saving) return
      if (!data.reward_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('reward'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: CollectiveCognitionRewardDetail = {
        id: tempId,
        custom: true,
        reward_name: data.reward_name,
        collective_cognition: data.collective_cognition,
        rules: data.rules || null
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addCollectiveCognitionReward({
          custom: true,
          reward_name: data.reward_name,
          collective_cognition: data.collective_cognition,
          rules: data.rules || null
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )

        toast.success(COLLECTIVE_COGNITION_REWARD_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Collective Cognition Reward Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, toast]
  )

  /**
   * Handle Edit Reward
   *
   * Optimistically updates the reward, then persists to the database.
   * Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: {
      reward_name: string
      collective_cognition: number
      rules: string
    }) => {
      if (saving || !editingItem) return
      if (!data.reward_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('reward'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  reward_name: data.reward_name,
                  collective_cognition: data.collective_cognition,
                  rules: data.rules || null
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateCollectiveCognitionReward(editingItem.id, {
          reward_name: data.reward_name,
          collective_cognition: data.collective_cognition,
          rules: data.rules || null
        })

        toast.success(COLLECTIVE_COGNITION_REWARD_UPDATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Collective Cognition Reward Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems, toast]
  )

  /**
   * Handle Delete Reward
   *
   * Optimistically removes the reward, then deletes from the database.
   * Rolls back on failure.
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
          const guard = getCatalogDeleteGuardMessage(err)
          if (!guard)
            console.error('Delete Collective Cognition Reward Error:', err)
          toast.error(guard ?? ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  /** Open the create dialog with a fresh key to reset state */
  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  /** Open the edit dialog for a specific reward */
  const openEditDialog = useCallback(
    (item: CollectiveCognitionRewardDetail) => {
      setDialogKey((k) => k + 1)
      setEditingItem(item)
      setEditDialogOpen(true)
    },
    []
  )

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Collective Cognition Rewards</span>
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
                No custom collective cognition rewards have been forged yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom reward to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-100 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-20 text-center">CC</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-25 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
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
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.reward_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
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
      </CardContent>

      {/* Create Reward Dialog */}
      <CollectiveCognitionRewardDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        title="Create Custom Reward"
        description="A new collective cognition reward is forged."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      {/* Edit Reward Dialog */}
      <CollectiveCognitionRewardDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        initialName={editingItem?.reward_name}
        initialCollectiveCognition={editingItem?.collective_cognition}
        initialRules={editingItem?.rules ?? ''}
        title="Edit Reward"
        description="Reshape the reward."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
