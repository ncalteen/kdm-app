'use client'

import {
  GearDialog,
  GearDialogPayload,
  inferGearCategory
} from '@/components/custom/dialogs/gear-dialog'
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
import {
  addGear,
  getGear,
  getUserCustomGear,
  removeGear,
  replaceGearGearCosts,
  replaceGearResourceCosts,
  replaceGearResourceTypeCosts,
  updateGear
} from '@/lib/dal/gear'
import { getLocations } from '@/lib/dal/location'
import { getResources } from '@/lib/dal/resource'
import { getWeaponTypes } from '@/lib/dal/weapon-type'
import { ERROR_MESSAGE, NAMELESS_OBJECT_ERROR_MESSAGE } from '@/lib/messages'
import {
  GearDetail,
  LocationDetail,
  ResourceDetail,
  WeaponTypeDetail
} from '@/lib/types'
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

/**
 * Custom Gear Card Component
 *
 * Lists user's custom gear with options to create, edit, and delete via a
 * dialog. Each gear supports a rich set of attributes (location, accessory
 * flag, weapon stats, affinity slots, affinity bonus, requirements, armor
 * info, keywords, rules, weapon type) and crafting costs (gear, resource,
 * resource type). Entries are displayed alphabetically. UI updates are
 * optimistic and roll back on database failure.
 *
 * @returns Custom Gear Card Component
 */
export function CustomGearCard(): ReactElement {
  const [items, setItems] = useState<GearDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [allGear, setAllGear] = useState<{ [key: string]: GearDetail }>({})
  const [locations, setLocations] = useState<{
    [key: string]: LocationDetail
  }>({})
  const [resources, setResources] = useState<{
    [key: string]: ResourceDetail
  }>({})
  const [weaponTypes, setWeaponTypes] = useState<{
    [key: string]: WeaponTypeDetail
  }>({})

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GearDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: GearDetail[]): GearDetail[] =>
      [...list].sort((a, b) => a.gear_name.localeCompare(b.gear_name)),
    []
  )

  // Load custom gear (and supporting catalogs) on mount.
  useEffect(() => {
    let cancelled = false

    Promise.all([
      getUserCustomGear(),
      getGear(),
      getLocations(),
      getResources(),
      getWeaponTypes()
    ])
      .then(
        ([
          gearData,
          allGearData,
          locationData,
          resourceData,
          weaponTypeData
        ]) => {
          if (cancelled) return

          setItems(sortItems(Object.values(gearData)))
          setAllGear(allGearData)
          setLocations(locationData)
          setResources(resourceData)
          setWeaponTypes(weaponTypeData)
        }
      )
      .catch((err: unknown) => {
        if (cancelled) return

        console.error('Load Gear Error:', err)
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
   * Persist gear junction tables (gear costs, resource costs, resource type
   * costs) for the given gear ID.
   */
  const persistJunctions = useCallback(
    async (gearId: string, data: GearDialogPayload) => {
      await Promise.all([
        replaceGearGearCosts(gearId, data.gear_costs),
        replaceGearResourceCosts(gearId, data.resource_costs),
        replaceGearResourceTypeCosts(gearId, data.resource_type_costs)
      ])
    },
    []
  )

  /**
   * Handle Create Gear
   *
   * Optimistically adds new gear (with junctions), then persists. Rolls back
   * on failure.
   */
  const handleCreate = useCallback(
    async (data: GearDialogPayload) => {
      if (saving) return
      if (!data.gear_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('gear'))

      setSaving(true)

      const tempId = `temp-${crypto.randomUUID()}`
      const temp: GearDetail = {
        id: tempId,
        custom: true,
        gear_name: data.gear_name,
        location_id: data.location_id,
        accessory: data.accessory,
        accuracy: data.accuracy,
        affinity_top: data.affinity_top,
        affinity_left: data.affinity_left,
        affinity_right: data.affinity_right,
        affinity_bottom: data.affinity_bottom,
        affinity_bonus: data.affinity_bonus,
        affinity_bonus_requirements: data.affinity_bonus_requirements,
        armor_points: data.armor_points,
        armor_location: data.armor_location,
        keywords: data.keywords,
        rules: data.rules,
        speed: data.speed,
        strength: data.strength,
        weapon_type_id: data.weapon_type_id,
        gear_costs: data.gear_costs,
        resource_costs: data.resource_costs,
        resource_type_costs: data.resource_type_costs
      }

      const previous = [...items]
      setItems(sortItems([...items, temp]))
      setCreateDialogOpen(false)

      try {
        const created = await addGear({
          custom: true,
          gear_name: data.gear_name,
          location_id: data.location_id,
          accessory: data.accessory,
          accuracy: data.accuracy,
          affinity_top: data.affinity_top,
          affinity_left: data.affinity_left,
          affinity_right: data.affinity_right,
          affinity_bottom: data.affinity_bottom,
          affinity_bonus: data.affinity_bonus,
          affinity_bonus_requirements: data.affinity_bonus_requirements,
          armor_points: data.armor_points,
          armor_location: data.armor_location,
          keywords: data.keywords,
          rules: data.rules,
          speed: data.speed,
          strength: data.strength,
          weapon_type_id: data.weapon_type_id
        })

        await persistJunctions(created.id, data)

        const finalItem: GearDetail = {
          ...created,
          gear_costs: data.gear_costs,
          resource_costs: data.resource_costs,
          resource_type_costs: data.resource_type_costs
        }

        setItems((prev) =>
          sortItems(prev.map((i) => (i.id === tempId ? finalItem : i)))
        )
        setAllGear((prev) => ({ ...prev, [created.id]: finalItem }))
      } catch (err: unknown) {
        setItems(previous)
        console.error('Add Gear Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, persistJunctions, saving, sortItems]
  )

  /**
   * Handle Edit Gear
   *
   * Optimistically updates the gear (with junctions), then persists. Rolls
   * back on failure.
   */
  const handleEdit = useCallback(
    async (data: GearDialogPayload) => {
      if (saving || !editingItem) return
      if (!data.gear_name.trim())
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('gear'))

      setSaving(true)

      const previous = [...items]

      const updatedItem: GearDetail = {
        ...editingItem,
        gear_name: data.gear_name,
        location_id: data.location_id,
        accessory: data.accessory,
        accuracy: data.accuracy,
        affinity_top: data.affinity_top,
        affinity_left: data.affinity_left,
        affinity_right: data.affinity_right,
        affinity_bottom: data.affinity_bottom,
        affinity_bonus: data.affinity_bonus,
        affinity_bonus_requirements: data.affinity_bonus_requirements,
        armor_points: data.armor_points,
        armor_location: data.armor_location,
        keywords: data.keywords,
        rules: data.rules,
        speed: data.speed,
        strength: data.strength,
        weapon_type_id: data.weapon_type_id,
        gear_costs: data.gear_costs,
        resource_costs: data.resource_costs,
        resource_type_costs: data.resource_type_costs
      }

      setItems(
        sortItems(items.map((i) => (i.id === editingItem.id ? updatedItem : i)))
      )
      setAllGear((prev) => ({ ...prev, [editingItem.id]: updatedItem }))

      setEditDialogOpen(false)
      const editingId = editingItem.id
      setEditingItem(null)

      try {
        await updateGear(editingId, {
          gear_name: data.gear_name,
          location_id: data.location_id,
          accessory: data.accessory,
          accuracy: data.accuracy,
          affinity_top: data.affinity_top,
          affinity_left: data.affinity_left,
          affinity_right: data.affinity_right,
          affinity_bottom: data.affinity_bottom,
          affinity_bonus: data.affinity_bonus,
          affinity_bonus_requirements: data.affinity_bonus_requirements,
          armor_points: data.armor_points,
          armor_location: data.armor_location,
          keywords: data.keywords,
          rules: data.rules,
          speed: data.speed,
          strength: data.strength,
          weapon_type_id: data.weapon_type_id
        })

        await persistJunctions(editingId, data)
      } catch (err: unknown) {
        setItems(previous)
        console.error('Update Gear Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setSaving(false)
      }
    },
    [items, editingItem, persistJunctions, saving, sortItems]
  )

  /**
   * Handle Delete Gear
   *
   * Optimistically removes the gear, then deletes from the database. Rolls
   * back on failure.
   *
   * @param item Gear to delete
   */
  const handleDelete = useCallback(
    (item: GearDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeGear(item.id)
        .then(() => {
          setAllGear((prev) => {
            const next = { ...prev }
            delete next[item.id]
            return next
          })
        })
        .catch((err: unknown) => {
          setItems(previous)
          const guard = getCatalogDeleteGuardMessage(err)
          if (!guard) console.error('Delete Gear Error:', err)
          toast.error(guard ?? ERROR_MESSAGE())
        })
    },
    [items]
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
   * dialog seeded with the target gear's values.
   */
  const openEditDialog = useCallback((item: GearDetail) => {
    setDialogKey((k) => k + 1)
    setEditingItem(item)
    setEditDialogOpen(true)
  }, [])

  /** Get location name by ID */
  const getLocationName = useCallback(
    (locationId: string | null): string => {
      if (!locationId) return '—'
      return locations[locationId]?.location_name ?? '—'
    },
    [locations]
  )

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Gear</span>
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
                No custom gear has been crafted yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create custom gear to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-100 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="w-25 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const category = inferGearCategory(item)
                  const categoryLabel =
                    category === 'WEAPON'
                      ? 'Weapon'
                      : category === 'ARMOR'
                        ? 'Armor'
                        : 'Other'
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.gear_name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">
                          {categoryLabel}
                          {' • '}
                          {getLocationName(item.location_id)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {categoryLabel}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {getLocationName(item.location_id)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(item)}
                            title={`Edit ${item.gear_name}`}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item)}
                            title={`Delete ${item.gear_name}`}>
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <GearDialog
        key={`create-${dialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={saving}
        gear={allGear}
        locations={locations}
        resources={resources}
        weaponTypes={weaponTypes}
        title="Create Custom Gear"
        description="A new tool is forged against the dark."
        saveLabel="Create"
        savingLabel="Creating..."
      />

      <GearDialog
        key={`edit-${dialogKey}`}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setEditingItem(null)
        }}
        onSave={handleEdit}
        saving={saving}
        gear={allGear}
        locations={locations}
        resources={resources}
        weaponTypes={weaponTypes}
        excludedGearIds={editingItem ? [editingItem.id] : []}
        initialName={editingItem?.gear_name}
        initialLocationId={editingItem?.location_id ?? null}
        initialAccessory={editingItem?.accessory ?? null}
        initialAccuracy={editingItem?.accuracy ?? null}
        initialAffinityTop={editingItem?.affinity_top ?? null}
        initialAffinityLeft={editingItem?.affinity_left ?? null}
        initialAffinityRight={editingItem?.affinity_right ?? null}
        initialAffinityBottom={editingItem?.affinity_bottom ?? null}
        initialAffinityBonus={editingItem?.affinity_bonus ?? null}
        initialAffinityBonusRequirements={
          editingItem?.affinity_bonus_requirements ?? []
        }
        initialArmorPoints={editingItem?.armor_points ?? null}
        initialArmorLocation={editingItem?.armor_location ?? null}
        initialKeywords={editingItem?.keywords ?? []}
        initialRules={editingItem?.rules ?? null}
        initialSpeed={editingItem?.speed ?? null}
        initialStrength={editingItem?.strength ?? null}
        initialWeaponTypeId={editingItem?.weapon_type_id ?? null}
        initialGearCosts={editingItem?.gear_costs ?? []}
        initialResourceCosts={editingItem?.resource_costs ?? []}
        initialResourceTypeCosts={editingItem?.resource_type_costs ?? []}
        title="Edit Gear"
        description="Reshape what was once known."
        saveLabel="Save"
        savingLabel="Saving..."
      />
    </Card>
  )
}
