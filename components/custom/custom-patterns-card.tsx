'use client'

import {
  PatternDialog,
  PatternDialogPayload
} from '@/components/custom/dialogs/pattern-dialog'
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
import { getGear } from '@/lib/dal/gear'
import { getInnovations } from '@/lib/dal/innovation'
import {
  addPattern,
  getUserCustomPatterns,
  removePattern,
  replacePatternGearCosts,
  replacePatternInnovationRequirements,
  replacePatternResourceCosts,
  replacePatternResourceTypeCosts,
  updatePattern
} from '@/lib/dal/pattern'
import { getResources } from '@/lib/dal/resource'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  PATTERN_CREATED_MESSAGE,
  PATTERN_REMOVED_MESSAGE,
  PATTERN_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  GearDetail,
  InnovationDetail,
  PatternDetail,
  ResourceDetail
} from '@/lib/types'
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Patterns Card Component Properties
 */
interface CustomPatternsCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Patterns Card Component
 *
 * Lists user's custom patterns with options to create, edit, and delete via a
 * dialog. Each pattern supports name, crafting limit, endeavor cost, crafted
 * gear, gear costs, resource costs, resource type costs, and innovation
 * requirements. Entries are displayed alphabetically. UI updates are
 * optimistic and roll back on database failure.
 *
 * @param props Custom Patterns Card Properties
 * @returns Custom Patterns Card Component
 */
export function CustomPatternsCard({
  local
}: CustomPatternsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<PatternDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [gear, setGear] = useState<{ [key: string]: GearDetail }>({})
  const [resources, setResources] = useState<{
    [key: string]: ResourceDetail
  }>({})
  const [innovations, setInnovations] = useState<{
    [key: string]: InnovationDetail
  }>({})

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PatternDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: PatternDetail[]): PatternDetail[] =>
      [...list].sort((a, b) => a.pattern_name.localeCompare(b.pattern_name)),
    []
  )

  /** Load custom patterns and supporting data from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const [patternData, gearData, resourceData, innovationData] =
        await Promise.all([
          getUserCustomPatterns(),
          getGear(),
          getResources(),
          getInnovations()
        ])

      setItems(sortItems(Object.values(patternData)))
      setGear(gearData)
      setResources(resourceData)
      setInnovations(innovationData)
    } catch (err: unknown) {
      console.error('Load Patterns Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Persist pattern junction tables (gear costs, resource costs, resource
   * type costs, innovation requirements) for the given pattern ID.
   */
  const persistJunctions = useCallback(
    async (patternId: string, data: PatternDialogPayload) => {
      await Promise.all([
        replacePatternGearCosts(patternId, data.gear_costs),
        replacePatternResourceCosts(patternId, data.resource_costs),
        replacePatternResourceTypeCosts(patternId, data.resource_type_costs),
        replacePatternInnovationRequirements(
          patternId,
          data.innovation_requirement_ids
        )
      ])
    },
    []
  )

  /**
   * Handle Create Pattern
   *
   * Optimistically adds a new pattern (with junctions), then persists. Rolls
   * back on failure.
   */
  const handleCreate = useCallback(
    async (data: PatternDialogPayload) => {
      if (saving) return
      if (!data.pattern_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('pattern'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: PatternDetail = {
        id: tempId,
        custom: true,
        pattern_name: data.pattern_name,
        crafting_limit: data.crafting_limit,
        endeavor_cost: data.endeavor_cost,
        crafted_gear_id: data.crafted_gear_id,
        gear_costs: data.gear_costs,
        resource_costs: data.resource_costs,
        resource_type_costs: data.resource_type_costs,
        innovation_requirement_ids: data.innovation_requirement_ids
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addPattern({
          custom: true,
          pattern_name: data.pattern_name,
          crafting_limit: data.crafting_limit,
          endeavor_cost: data.endeavor_cost,
          crafted_gear_id: data.crafted_gear_id
        })

        await persistJunctions(created.id, data)

        const finalItem: PatternDetail = {
          ...created,
          gear_costs: data.gear_costs,
          resource_costs: data.resource_costs,
          resource_type_costs: data.resource_type_costs,
          innovation_requirement_ids: data.innovation_requirement_ids
        }

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? finalItem : i)))
        )

        toast.success(PATTERN_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Pattern Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, persistJunctions, saving, sortItems, toast]
  )

  /**
   * Handle Edit Pattern
   *
   * Optimistically updates the pattern (with junctions), then persists. Rolls
   * back on failure.
   */
  const handleEdit = useCallback(
    async (data: PatternDialogPayload) => {
      if (saving || !editingItem) return
      if (!data.pattern_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('pattern'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  pattern_name: data.pattern_name,
                  crafting_limit: data.crafting_limit,
                  endeavor_cost: data.endeavor_cost,
                  crafted_gear_id: data.crafted_gear_id,
                  gear_costs: data.gear_costs,
                  resource_costs: data.resource_costs,
                  resource_type_costs: data.resource_type_costs,
                  innovation_requirement_ids: data.innovation_requirement_ids
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      const editingId = editingItem.id
      setEditingItem(null)

      try {
        await updatePattern(editingId, {
          pattern_name: data.pattern_name,
          crafting_limit: data.crafting_limit,
          endeavor_cost: data.endeavor_cost,
          crafted_gear_id: data.crafted_gear_id
        })

        await persistJunctions(editingId, data)

        toast.success(PATTERN_UPDATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Pattern Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, persistJunctions, saving, sortItems, toast]
  )

  /**
   * Handle Delete Pattern
   *
   * Optimistically removes the pattern, then deletes from the database. Rolls
   * back on failure.
   *
   * @param item Pattern to delete
   */
  const handleDelete = useCallback(
    (item: PatternDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removePattern(item.id)
        .then(() => toast.success(PATTERN_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          const guard = getCatalogDeleteGuardMessage(err)
          if (!guard) console.error('Delete Pattern Error:', err)
          toast.error(guard ?? ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  /**
   * Open Create Dialog
   *
   * Increments the dialog key to force a fresh form state and opens
   * the create dialog.
   */
  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  /**
   * Open Edit Dialog
   *
   * Increments the dialog key to force a fresh form state and opens
   * the edit dialog seeded with the target pattern's values.
   */
  const openEditDialog = useCallback((item: PatternDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Patterns</span>
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
                No custom patterns have been woven yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom pattern to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-100 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[80%]">Name</TableHead>
                  <TableHead className="w-[20%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{item.pattern_name}</span>
                        {item.crafted_gear_id && gear[item.crafted_gear_id] && (
                          <span className="text-xs text-muted-foreground truncate">
                            Crafts: {gear[item.crafted_gear_id].gear_name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.pattern_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.pattern_name}`}>
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

      <PatternDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        gear={gear}
        resources={resources}
        innovations={innovations}
        title="Create Custom Pattern"
        description="A new sliver of meaning is wrested from the dark."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <PatternDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        gear={gear}
        resources={resources}
        innovations={innovations}
        initialName={editingItem?.pattern_name}
        initialCraftingLimit={editingItem?.crafting_limit ?? null}
        initialEndeavorCost={editingItem?.endeavor_cost ?? null}
        initialCraftedGearId={editingItem?.crafted_gear_id ?? null}
        initialGearCosts={editingItem?.gear_costs ?? []}
        initialResourceCosts={editingItem?.resource_costs ?? []}
        initialResourceTypeCosts={editingItem?.resource_type_costs ?? []}
        initialInnovationRequirementIds={
          editingItem?.innovation_requirement_ids ?? []
        }
        title="Edit Pattern"
        description="Reshape what was once known."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
