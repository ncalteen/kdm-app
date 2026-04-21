'use client'

import { PhilosophyDialog } from '@/components/custom/dialogs/philosophy-dialog'
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
import { getKnowledges } from '@/lib/dal/knowledge'
import {
  addPhilosophy,
  getPhilosophies,
  removePhilosophy,
  updatePhilosophy
} from '@/lib/dal/philosophy'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  PHILOSOPHY_CREATED_MESSAGE,
  PHILOSOPHY_REMOVED_MESSAGE,
  PHILOSOPHY_UPDATED_MESSAGE
} from '@/lib/messages'
import { KnowledgeDetail, PhilosophyDetail } from '@/lib/types'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Philosophies Card Component Properties
 */
interface CustomPhilosophiesCardProps {
  /** Local State */
  local: LocalStateType
  /** Callback when philosophies are created, edited, or deleted */
  onPhilosophiesChange?: () => void
}

/**
 * Custom Philosophies Card Component
 *
 * Lists user's custom philosophies with options to create, edit, and delete.
 * Each philosophy has a name, hunt XP milestones, optional tenet knowledge,
 * and tier. Entries are displayed alphabetically. UI updates are optimistic
 * and roll back on database failure.
 *
 * @param props Custom Philosophies Card Properties
 * @returns Custom Philosophies Card Component
 */
export function CustomPhilosophiesCard({
  local,
  onPhilosophiesChange
}: CustomPhilosophiesCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<PhilosophyDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [availableKnowledges, setAvailableKnowledges] = useState<{
    [key: string]: KnowledgeDetail
  }>({})

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PhilosophyDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: PhilosophyDetail[]): PhilosophyDetail[] =>
      [...list].sort((a, b) =>
        a.philosophy_name.localeCompare(b.philosophy_name)
      ),
    []
  )

  /** Load custom philosophies and available knowledges */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const [philosophyData, knowledgeData] = await Promise.all([
        getPhilosophies(),
        getKnowledges()
      ])

      const custom = Object.values(philosophyData).filter((i) => i.custom)
      setItems(sortItems(custom))
      setAvailableKnowledges(knowledgeData)
    } catch (err: unknown) {
      console.error('Load Philosophies Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Handle Create Philosophy
   *
   * Optimistically adds a new philosophy, then persists to the database.
   * Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: {
      philosophy_name: string
      hunt_xp_milestones: number[]
      tenet_knowledge_id: string | null
      tier: number | null
    }) => {
      if (saving) return
      if (!data.philosophy_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('philosophy'))

      setSaving(true)

      const tempId = `temp-${Date.now()}`
      const temp: PhilosophyDetail = {
        id: tempId,
        custom: true,
        philosophy_name: data.philosophy_name,
        hunt_xp_milestones: data.hunt_xp_milestones,
        tenet_knowledge_id: data.tenet_knowledge_id,
        tier: data.tier
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addPhilosophy({
          custom: true,
          philosophy_name: data.philosophy_name,
          hunt_xp_milestones: data.hunt_xp_milestones,
          tenet_knowledge_id: data.tenet_knowledge_id,
          tier: data.tier
        })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )

        toast.success(PHILOSOPHY_CREATED_MESSAGE())
        onPhilosophiesChange?.()
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Philosophy Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, toast, onPhilosophiesChange]
  )

  /**
   * Handle Edit Philosophy
   *
   * Optimistically updates the philosophy, then persists to the database.
   * Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: {
      philosophy_name: string
      hunt_xp_milestones: number[]
      tenet_knowledge_id: string | null
      tier: number | null
    }) => {
      if (saving || !editingItem) return
      if (!data.philosophy_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('philosophy'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  philosophy_name: data.philosophy_name,
                  hunt_xp_milestones: data.hunt_xp_milestones,
                  tenet_knowledge_id: data.tenet_knowledge_id,
                  tier: data.tier
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)

      try {
        await updatePhilosophy(editingItem.id, {
          philosophy_name: data.philosophy_name,
          hunt_xp_milestones: data.hunt_xp_milestones,
          tenet_knowledge_id: data.tenet_knowledge_id,
          tier: data.tier
        })

        toast.success(PHILOSOPHY_UPDATED_MESSAGE())
        onPhilosophiesChange?.()
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Philosophy Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems, toast, onPhilosophiesChange]
  )

  const handleDelete = useCallback(
    (item: PhilosophyDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removePhilosophy(item.id)
        .then(() => {
          toast.success(PHILOSOPHY_REMOVED_MESSAGE())
          onPhilosophiesChange?.()
        })
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Philosophy Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items, toast, onPhilosophiesChange]
  )

  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((item: PhilosophyDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Philosophies</span>
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
                No custom philosophies have emerged yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom philosophy to see it appear here.
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
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.philosophy_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.philosophy_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.philosophy_name}`}>
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

      <PhilosophyDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        knowledges={availableKnowledges}
        title="Create Custom Philosophy"
        description="A new school of thought takes form."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <PhilosophyDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        knowledges={availableKnowledges}
        initialName={editingItem?.philosophy_name}
        initialHuntXpMilestones={editingItem?.hunt_xp_milestones ?? []}
        initialTenetKnowledgeId={editingItem?.tenet_knowledge_id}
        initialTier={editingItem?.tier}
        title="Edit Philosophy"
        description="Reshape the school of thought."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
