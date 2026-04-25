'use client'

import {
  SeedPatternDialog,
  SeedPatternDialogPayload
} from '@/components/custom/dialogs/seed-pattern-dialog'
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
import { getNemeses } from '@/lib/dal/nemesis'
import { getQuarries } from '@/lib/dal/quarry'
import {
  addSeedPattern,
  getSeedPatterns,
  removeSeedPattern,
  replaceSeedPatternGearCosts,
  updateSeedPattern
} from '@/lib/dal/seed-pattern'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  SEED_PATTERN_CREATED_MESSAGE,
  SEED_PATTERN_REMOVED_MESSAGE,
  SEED_PATTERN_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  GearDetail,
  NemesisDetail,
  QuarryDetail,
  SeedPatternDetail
} from '@/lib/types'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Seed Patterns Card Component Properties
 */
interface CustomSeedPatternsCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Seed Patterns Card Component
 *
 * Lists user's custom seed patterns with options to create, edit, and delete
 * via a dialog. Each seed pattern supports name, crafting limit, crafting
 * steps, endeavor cost, era, keywords, requirements, crafted gear, seed
 * pattern number, and gear costs. Entries are displayed alphabetically. UI
 * updates are optimistic and roll back on database failure.
 *
 * @param props Custom Seed Patterns Card Properties
 * @returns Custom Seed Patterns Card Component
 */
export function CustomSeedPatternsCard({
  local
}: CustomSeedPatternsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<SeedPatternDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [gear, setGear] = useState<{ [key: string]: GearDetail }>({})
  const [quarries, setQuarries] = useState<{ [key: string]: QuarryDetail }>({})
  const [nemeses, setNemeses] = useState<{ [key: string]: NemesisDetail }>({})

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SeedPatternDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: SeedPatternDetail[]): SeedPatternDetail[] =>
      [...list].sort((a, b) =>
        a.seed_pattern_name.localeCompare(b.seed_pattern_name)
      ),
    []
  )

  /** Load custom seed patterns and gear from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const [seedPatternData, gearData, quarryData, nemesisData] =
        await Promise.all([
          getSeedPatterns(),
          getGear(),
          getQuarries(),
          getNemeses()
        ])

      const custom = Object.values(seedPatternData).filter((i) => i.custom)
      setItems(sortItems(custom))
      setGear(gearData)
      setQuarries(quarryData)
      setNemeses(nemesisData)
    } catch (err: unknown) {
      console.error('Load Seed Patterns Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [sortItems, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Handle Create Seed Pattern
   *
   * Optimistically adds a new seed pattern (and its gear costs), then persists
   * to the database. Rolls back on failure.
   */
  const handleCreate = useCallback(
    async (data: SeedPatternDialogPayload) => {
      if (saving) return
      if (!data.seed_pattern_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('seed pattern'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: SeedPatternDetail = {
        id: tempId,
        custom: true,
        seed_pattern_name: data.seed_pattern_name,
        crafting_limit: data.crafting_limit,
        crafting_steps: data.crafting_steps,
        endeavor_cost: data.endeavor_cost,
        era: data.era,
        keywords: data.keywords,
        requirements: data.requirements,
        crafted_gear_id: data.crafted_gear_id,
        gear_costs: data.gear_costs
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addSeedPattern({
          custom: true,
          seed_pattern_name: data.seed_pattern_name,
          crafting_limit: data.crafting_limit,
          crafting_steps: data.crafting_steps,
          endeavor_cost: data.endeavor_cost,
          era: data.era,
          keywords: data.keywords,
          requirements: data.requirements,
          crafted_gear_id: data.crafted_gear_id
        })

        if (data.gear_costs.length > 0)
          await replaceSeedPatternGearCosts(created.id, data.gear_costs)

        const finalItem: SeedPatternDetail = {
          ...created,
          gear_costs: data.gear_costs
        }

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? finalItem : i)))
        )

        toast.success(SEED_PATTERN_CREATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Seed Pattern Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, saving, sortItems, toast]
  )

  /**
   * Handle Edit Seed Pattern
   *
   * Optimistically updates the seed pattern (and its gear costs), then
   * persists to the database. Rolls back on failure.
   */
  const handleEdit = useCallback(
    async (data: SeedPatternDialogPayload) => {
      if (saving || !editingItem) return
      if (!data.seed_pattern_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('seed pattern'))

      setSaving(true)

      const previous = [...items]

      setItems(
        sortItems(
          items.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  seed_pattern_name: data.seed_pattern_name,
                  crafting_limit: data.crafting_limit,
                  crafting_steps: data.crafting_steps,
                  endeavor_cost: data.endeavor_cost,
                  era: data.era,
                  keywords: data.keywords,
                  requirements: data.requirements,
                  crafted_gear_id: data.crafted_gear_id,
                  gear_costs: data.gear_costs
                }
              : i
          )
        )
      )

      setEditDialogOpen(false)
      const editingId = editingItem.id
      setEditingItem(null)

      try {
        await updateSeedPattern(editingId, {
          seed_pattern_name: data.seed_pattern_name,
          crafting_limit: data.crafting_limit,
          crafting_steps: data.crafting_steps,
          endeavor_cost: data.endeavor_cost,
          era: data.era,
          keywords: data.keywords,
          requirements: data.requirements,
          crafted_gear_id: data.crafted_gear_id
        })

        await replaceSeedPatternGearCosts(editingId, data.gear_costs)

        toast.success(SEED_PATTERN_UPDATED_MESSAGE())
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Seed Pattern Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, saving, sortItems, toast]
  )

  /**
   * Handle Delete Seed Pattern
   *
   * Optimistically removes the seed pattern, then deletes from the database.
   * Rolls back on failure.
   *
   * @param item Seed Pattern to delete
   */
  const handleDelete = useCallback(
    (item: SeedPatternDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeSeedPattern(item.id)
        .then(() => toast.success(SEED_PATTERN_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Seed Pattern Error:', err)
          toast.error(ERROR_MESSAGE())
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
   * the edit dialog seeded with the target seed pattern's values.
   */
  const openEditDialog = useCallback((item: SeedPatternDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Seed Patterns</span>
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
                No custom seed patterns have been discovered yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom seed pattern to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[70%]">Name</TableHead>
                  <TableHead className="w-[10%]">Era</TableHead>
                  <TableHead className="w-[20%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">
                          {item.seed_pattern_name}
                        </span>
                        {item.crafted_gear_id && gear[item.crafted_gear_id] && (
                          <span className="text-xs text-muted-foreground truncate">
                            Crafts: {gear[item.crafted_gear_id].gear_name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.era ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title={`Edit ${item.seed_pattern_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title={`Delete ${item.seed_pattern_name}`}>
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

      <SeedPatternDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        gear={gear}
        quarries={quarries}
        nemeses={nemeses}
        title="Create Custom Seed Pattern"
        description="A new sliver of meaning is wrested from the dark."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <SeedPatternDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        gear={gear}
        quarries={quarries}
        nemeses={nemeses}
        initialName={editingItem?.seed_pattern_name}
        initialCraftingLimit={editingItem?.crafting_limit ?? null}
        initialCraftingSteps={editingItem?.crafting_steps ?? ''}
        initialEndeavorCost={editingItem?.endeavor_cost ?? null}
        initialEra={editingItem?.era ?? null}
        initialKeywords={editingItem?.keywords ?? []}
        initialRequirements={editingItem?.requirements ?? ''}
        initialCraftedGearId={editingItem?.crafted_gear_id ?? null}
        initialGearCosts={editingItem?.gear_costs ?? []}
        title="Edit Seed Pattern"
        description="Reshape what was once known."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
