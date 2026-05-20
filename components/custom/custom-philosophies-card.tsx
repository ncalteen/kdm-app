'use client'

import {
  PhilosophyDialog,
  PhilosophyDialogPayload,
  PhilosophyRankDraft
} from '@/components/custom/dialogs/philosophy-dialog'
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
import { getKnowledges } from '@/lib/dal/knowledge'
import { getNeuroses } from '@/lib/dal/neurosis'
import {
  addPhilosophy,
  getUserCustomPhilosophies,
  removePhilosophy,
  updatePhilosophy
} from '@/lib/dal/philosophy'
import {
  addPhilosophyRank,
  getPhilosophyRanks,
  removePhilosophyRank,
  updatePhilosophyRank
} from '@/lib/dal/philosophy-rank'
import { ERROR_MESSAGE, NAMELESS_OBJECT_ERROR_MESSAGE } from '@/lib/messages'
import { KnowledgeDetail, NeurosisDetail, PhilosophyDetail } from '@/lib/types'
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

/**
 * Custom Philosophies Card Component Properties
 */
interface CustomPhilosophiesCardProps {
  /** Callback when philosophies are created, edited, or deleted */
  onPhilosophiesChange?: () => void
}

/**
 * Custom Philosophies Card Component
 *
 * Lists user's custom philosophies with options to create, edit, and delete.
 * Each philosophy has a name, hunt XP milestones, optional tenet knowledge,
 * tier, optional neurosis link, and 1–5 ranks (each with a rank number and
 * Markdown rules). Entries are displayed alphabetically.
 *
 * @param props Custom Philosophies Card Properties
 * @returns Custom Philosophies Card Component
 */
export function CustomPhilosophiesCard({
  onPhilosophiesChange
}: CustomPhilosophiesCardProps): ReactElement {
  const [items, setItems] = useState<PhilosophyDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [availableKnowledges, setAvailableKnowledges] = useState<{
    [key: string]: KnowledgeDetail
  }>({})
  const [availableNeuroses, setAvailableNeuroses] = useState<{
    [key: string]: NeurosisDetail
  }>({})

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PhilosophyDetail | null>(null)
  const [editingRanks, setEditingRanks] = useState<PhilosophyRankDraft[]>([])
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

  // Load custom philosophies (and supporting catalogs) on mount.
  useEffect(() => {
    let cancelled = false

    Promise.all([getUserCustomPhilosophies(), getKnowledges(), getNeuroses()])
      .then(([philosophyData, knowledgeData, neurosisData]) => {
        if (cancelled) return

        setItems(sortItems(Object.values(philosophyData)))
        setAvailableKnowledges(knowledgeData)
        setAvailableNeuroses(neurosisData)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        console.error('Load Philosophies Error:', err)
        toast.error(ERROR_MESSAGE())
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [sortItems])

  /**
   * Handle Create Philosophy
   *
   * Optimistically adds a temporary philosophy row, then persists the
   * philosophy and its ranks. Replaces the temp row with the saved record on
   * success. On failure, rolls back both the temp row and any partially created
   * database row.
   */
  const handleCreate = useCallback(
    async (data: PhilosophyDialogPayload) => {
      if (saving) return
      if (!data.philosophy_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('philosophy'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: PhilosophyDetail = {
        id: tempId,
        custom: true,
        philosophy_name: data.philosophy_name,
        hunt_xp_milestones: data.hunt_xp_milestones,
        tenet_knowledge_id: data.tenet_knowledge_id,
        tier: data.tier,
        neurosis_id: data.neurosis_id
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      let createdId: string | null = null

      try {
        const created = await addPhilosophy({
          custom: true,
          philosophy_name: data.philosophy_name,
          hunt_xp_milestones: data.hunt_xp_milestones,
          tenet_knowledge_id: data.tenet_knowledge_id,
          tier: data.tier,
          neurosis_id: data.neurosis_id
        })
        createdId = created.id

        // Persist ranks sequentially so a failure halts early and can roll
        // back the philosophy row.
        for (const rank of data.ranks)
          await addPhilosophyRank({
            philosophy_id: created.id,
            rank_number: rank.rank_number,
            rules: rank.rules || null
          })

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? created : i)))
        )
        onPhilosophiesChange?.()
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Philosophy Error:', err)
        if (createdId) {
          try {
            await removePhilosophy(createdId)
          } catch (cleanupErr: unknown) {
            console.error('Add Philosophy Rollback Error:', cleanupErr)
          }
        }
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, onPhilosophiesChange]
  )

  /**
   * Handle Edit Philosophy
   *
   * Optimistically updates the philosophy fields, then reconciles its ranks
   * (add / update / delete) against the submitted draft set. Rolls back the
   * optimistic row state on failure.
   */
  const handleEdit = useCallback(
    async (data: PhilosophyDialogPayload) => {
      if (saving || !editingItem) return
      if (!data.philosophy_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('philosophy'))

      setSaving(true)

      const previous = [...items]
      const previousRanks = editingRanks
      const targetId = editingItem.id

      setItems(
        sortItems(
          items.map((i) =>
            i.id === targetId
              ? {
                  ...i,
                  philosophy_name: data.philosophy_name,
                  hunt_xp_milestones: data.hunt_xp_milestones,
                  tenet_knowledge_id: data.tenet_knowledge_id,
                  tier: data.tier,
                  neurosis_id: data.neurosis_id
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      setEditingItem(null)
      setEditingRanks([])

      try {
        await updatePhilosophy(targetId, {
          philosophy_name: data.philosophy_name,
          hunt_xp_milestones: data.hunt_xp_milestones,
          tenet_knowledge_id: data.tenet_knowledge_id,
          tier: data.tier,
          neurosis_id: data.neurosis_id
        })

        // Reconcile ranks: remove deleted, update existing, insert new.
        const submittedIds = new Set(
          data.ranks.map((r) => r.id).filter((id): id is string => !!id)
        )
        const toRemove = previousRanks.filter(
          (r) => r.id && !submittedIds.has(r.id)
        )
        for (const rank of toRemove)
          if (rank.id) await removePhilosophyRank(rank.id)

        for (const rank of data.ranks) {
          if (rank.id) {
            await updatePhilosophyRank(rank.id, {
              rank_number: rank.rank_number,
              rules: rank.rules || null
            })
          } else {
            await addPhilosophyRank({
              philosophy_id: targetId,
              rank_number: rank.rank_number,
              rules: rank.rules || null
            })
          }
        }

        onPhilosophiesChange?.()
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Philosophy Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, editingRanks, saving, sortItems, onPhilosophiesChange]
  )

  /**
   * Handle Delete Philosophy
   *
   * Optimistically removes the philosophy from the list, then persists the
   * deletion. Restores the previous list on failure.
   */
  const handleDelete = useCallback(
    (item: PhilosophyDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removePhilosophy(item.id)
        .then(() => {
          onPhilosophiesChange?.()
        })
        .catch((err: unknown) => {
          setItems(previous)
          const guard = getCatalogDeleteGuardMessage(err)
          if (!guard) console.error('Delete Philosophy Error:', err)
          toast.error(guard ?? ERROR_MESSAGE())
        })
    },
    [items, onPhilosophiesChange]
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
   * Fetches the target philosophy's ranks before opening so the dialog can
   * render them as tabs. Falls back to an empty rank list on fetch failure
   * so the user can still edit the top-level fields.
   */
  const openEditDialog = useCallback(async (item: PhilosophyDetail) => {
    try {
      const ranks = await getPhilosophyRanks(item.id)
      setEditingRanks(
        ranks.map((r) => ({
          id: r.id,
          rank_number: r.rank_number,
          rules: r.rules ?? ''
        }))
      )
    } catch (err: unknown) {
      console.error('Load Philosophy Ranks Error:', err)
      toast.error(ERROR_MESSAGE())
      setEditingRanks([])
    }

    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border gap-0">
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
          <div className="max-h-100 overflow-y-auto rounded-md border">
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
        neuroses={availableNeuroses}
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
          if (!open) {
            setEditingItem(null)
            setEditingRanks([])
          }
        }}
        onSave={handleEdit}
        saving={saving}
        knowledges={availableKnowledges}
        neuroses={availableNeuroses}
        initialName={editingItem?.philosophy_name}
        initialHuntXpMilestones={editingItem?.hunt_xp_milestones ?? []}
        initialTenetKnowledgeId={editingItem?.tenet_knowledge_id}
        initialTier={editingItem?.tier}
        initialNeurosisId={editingItem?.neurosis_id}
        initialRanks={editingRanks}
        title="Edit Philosophy"
        description="Reshape the school of thought."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
