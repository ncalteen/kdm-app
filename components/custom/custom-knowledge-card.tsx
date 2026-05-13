'use client'

import { KnowledgeDialog } from '@/components/custom/dialogs/knowledge-dialog'
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
  addKnowledge,
  getUserCustomKnowledges,
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
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

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
 * delete. Each knowledge entry can optionally be linked to a philosophy and
 * includes rules, observation conditions, and a rank up milestone. Entries
 * are displayed alphabetically. UI updates are optimistic and roll back on
 * database failure.
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

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: KnowledgeDetail[]): KnowledgeDetail[] =>
      [...list].sort((a, b) =>
        a.knowledge_name.localeCompare(b.knowledge_name)
      ),
    []
  )

  /** Load custom knowledge and available philosophies */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const [knowledgeData, philosophyData] = await Promise.all([
        getUserCustomKnowledges(),
        getPhilosophies()
      ])

      setItems(sortItems(Object.values(knowledgeData)))
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

  /** Get philosophy name by ID */
  const getPhilosophyName = useCallback(
    (philosophyId: string | null): string => {
      if (!philosophyId) return '-'
      return availablePhilosophies[philosophyId]?.philosophy_name ?? '-'
    },
    [availablePhilosophies]
  )

  /**
   * Handle Create Knowledge
   *
   * Optimistically adds new knowledge, then persists to the database.
   * Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: {
      knowledge_name: string
      philosophy_id: string | null
      rules: string
      observation_conditions: string
      observation_rank_up_milestone: number | null
    }) => {
      if (saving) return
      if (!data.knowledge_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('knowledge'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: KnowledgeDetail = {
        id: tempId,
        custom: true,
        knowledge_name: data.knowledge_name,
        philosophy_id: data.philosophy_id,
        rules: data.rules || null,
        observation_conditions: data.observation_conditions || null,
        observation_rank_up_milestone: data.observation_rank_up_milestone
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addKnowledge({
          custom: true,
          knowledge_name: data.knowledge_name,
          philosophy_id: data.philosophy_id,
          rules: data.rules || null,
          observation_conditions: data.observation_conditions || null,
          observation_rank_up_milestone: data.observation_rank_up_milestone
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )

        toast.success(KNOWLEDGE_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Knowledge Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, toast]
  )

  /**
   * Handle Edit Knowledge
   *
   * Optimistically updates the knowledge, then persists to the database.
   * Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: {
      knowledge_name: string
      philosophy_id: string | null
      rules: string
      observation_conditions: string
      observation_rank_up_milestone: number | null
    }) => {
      if (saving || !editingItem) return
      if (!data.knowledge_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('knowledge'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  knowledge_name: data.knowledge_name,
                  philosophy_id: data.philosophy_id,
                  rules: data.rules || null,
                  observation_conditions: data.observation_conditions || null,
                  observation_rank_up_milestone:
                    data.observation_rank_up_milestone
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updateKnowledge(editingItem.id, {
          knowledge_name: data.knowledge_name,
          philosophy_id: data.philosophy_id,
          rules: data.rules || null,
          observation_conditions: data.observation_conditions || null,
          observation_rank_up_milestone: data.observation_rank_up_milestone
        })

        toast.success(KNOWLEDGE_UPDATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Knowledge Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems, toast]
  )

  /**
   * Handle Delete Knowledge
   *
   * Optimistically removes the knowledge from the list, then persists the
   * deletion. Restores the previous list on failure.
   */
  const handleDelete = useCallback(
    (item: KnowledgeDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeKnowledge(item.id)
        .then(() => toast.success(KNOWLEDGE_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          const guard = getCatalogDeleteGuardMessage(err)
          if (!guard) console.error('Delete Knowledge Error:', err)
          toast.error(guard ?? ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  /**
   * Open Create Dialog
   *
   * Increments the dialog key to force a fresh form state and opens the create
   * dialog.
   */
  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  /**
   * Open Edit Dialog
   *
   * Increments the dialog key to force a fresh form state and opens the edit
   * dialog seeded with the target knowledge's values.
   */
  const openEditDialog = useCallback((item: KnowledgeDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Knowledge</span>
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
                No custom knowledge has been uncovered yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create custom knowledge to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-100 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Philosophy
                  </TableHead>
                  <TableHead className="w-25 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.knowledge_name}</div>
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
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.knowledge_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
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
      </CardContent>

      <KnowledgeDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        philosophies={availablePhilosophies}
        title="Create Custom Knowledge"
        description="A new insight emerges from the lantern's glow."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <KnowledgeDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        philosophies={availablePhilosophies}
        initialName={editingItem?.knowledge_name}
        initialPhilosophyId={editingItem?.philosophy_id}
        initialRules={editingItem?.rules ?? ''}
        initialObservationConditions={editingItem?.observation_conditions ?? ''}
        initialObservationRankUpMilestone={
          editingItem?.observation_rank_up_milestone
        }
        title="Edit Knowledge"
        description="Reshape the insight."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
