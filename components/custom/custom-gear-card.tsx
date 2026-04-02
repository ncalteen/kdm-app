'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
import { addGear, getGear, removeGear, updateGear } from '@/lib/dal/gear'
import { getLocations } from '@/lib/dal/location'
import {
  ERROR_MESSAGE,
  GEAR_CREATED_MESSAGE,
  GEAR_REMOVED_MESSAGE,
  GEAR_UPDATED_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE
} from '@/lib/messages'
import { GearDetail, LocationDetail } from '@/lib/types'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

/** No location sentinel value */
const NO_LOCATION = '__none__'

/**
 * Custom Gear Card Component Properties
 */
interface CustomGearCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Gear Card Component
 *
 * Lists user's custom gear with options to create, edit, and delete.
 * Gear can optionally be associated with a location. Entries are displayed
 * alphabetically. UI updates are optimistic and roll back on database failure.
 *
 * @param props Custom Gear Card Properties
 * @returns Custom Gear Card Component
 */
export function CustomGearCard({ local }: CustomGearCardProps): ReactElement {
  const { toast } = useToast(local)

  const [items, setItems] = useState<GearDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [availableLocations, setAvailableLocations] = useState<{
    [key: string]: LocationDetail
  }>({})

  // Create form state
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLocationId, setNewLocationId] = useState<string | null>(null)

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingLocationId, setEditingLocationId] = useState<string | null>(
    null
  )

  const newInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  /** Sort items alphabetically by name */
  const sortItems = useCallback(
    (list: GearDetail[]): GearDetail[] =>
      [...list].sort((a, b) => a.gear_name.localeCompare(b.gear_name)),
    []
  )

  /** Sorted locations for dropdown */
  const sortedLocations = useMemo(
    () =>
      Object.values(availableLocations).sort((a, b) =>
        a.location_name.localeCompare(b.location_name)
      ),
    [availableLocations]
  )

  /** Load custom gear and available locations from the database */
  const loadItems = useCallback(async () => {
    setIsLoading(true)

    try {
      const [gearData, locationData] = await Promise.all([
        getGear(),
        getLocations()
      ])

      const custom = Object.values(gearData).filter((i) => i.custom)
      setItems(sortItems(custom))
      setAvailableLocations(locationData)
    } catch (err: unknown) {
      console.error('Load Gear Error:', err)
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
   * Handle Add Gear
   *
   * Optimistically adds new gear, then persists to the database.
   * Rolls back on failure.
   */
  const handleAdd = useCallback(async () => {
    const trimmedName = newName.trim()

    if (!trimmedName) return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('gear'))

    const tempId = `temp-${Date.now()}`
    const temp: GearDetail = {
      id: tempId,
      custom: true,
      gear_name: trimmedName,
      location_id: newLocationId
    }

    const previous = [...items]
    setItems(sortItems([...items, temp]))
    setNewName('')
    setNewLocationId(null)
    setIsAdding(false)

    try {
      const created = await addGear({
        custom: true,
        gear_name: trimmedName,
        location_id: newLocationId
      })

      setItems((prev) =>
        sortItems(prev.map((i) => (i.id === tempId ? created : i)))
      )

      toast.success(GEAR_CREATED_MESSAGE())
    } catch (err: unknown) {
      setItems(previous)
      console.error('Add Gear Error:', err)
      toast.error(ERROR_MESSAGE())
    }
  }, [items, newName, newLocationId, sortItems, toast])

  /**
   * Handle Delete Gear
   *
   * Optimistically removes the gear, then deletes from the database.
   * Rolls back on failure.
   *
   * @param item Gear to delete
   */
  const handleDelete = useCallback(
    (item: GearDetail) => {
      const previous = [...items]
      setItems(items.filter((i) => i.id !== item.id))

      removeGear(item.id)
        .then(() => toast.success(GEAR_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Delete Gear Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [items, toast]
  )

  /** Enter edit mode for gear */
  const handleStartEdit = useCallback((item: GearDetail) => {
    setEditingId(item.id)
    setEditingName(item.gear_name)
    setEditingLocationId(item.location_id)
  }, [])

  /** Cancel edit mode */
  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingName('')
    setEditingLocationId(null)
  }, [])

  /**
   * Handle Save Edit
   *
   * Optimistically updates the gear, then persists to the database.
   * Rolls back on failure.
   */
  const handleSaveEdit = useCallback(() => {
    const trimmedName = editingName.trim()

    if (!trimmedName) return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('gear'))
    if (!editingId) return

    const previous = [...items]

    setItems(
      sortItems(
        items.map((i) =>
          i.id === editingId
            ? {
                ...i,
                gear_name: trimmedName,
                location_id: editingLocationId
              }
            : i
        )
      )
    )

    setEditingId(null)
    setEditingName('')
    setEditingLocationId(null)

    updateGear(editingId, {
      gear_name: trimmedName,
      location_id: editingLocationId
    })
      .then(() => toast.success(GEAR_UPDATED_MESSAGE()))
      .catch((err: unknown) => {
        setItems(previous)
        console.error('Update Gear Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [items, editingId, editingName, editingLocationId, sortItems, toast])

  const handleNewKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleAdd()
      else if (e.key === 'Escape') {
        setIsAdding(false)
        setNewName('')
        setNewLocationId(null)
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

  /** Get location name by ID */
  const getLocationName = useCallback(
    (locationId: string | null): string => {
      if (!locationId) return '-'
      return availableLocations[locationId]?.location_name ?? '-'
    },
    [availableLocations]
  )

  /** Reset the add form and open it */
  const handleStartAdd = useCallback(() => {
    setNewName('')
    setNewLocationId(null)
    setIsAdding(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Gear</span>
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
                No custom gear has been crafted yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create custom gear to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Add form */}
            {isAdding && (
              <div className="mb-2 rounded-md border p-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="new-gear-name">Gear Name</Label>
                  <Input
                    ref={newInputRef}
                    id="new-gear-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleNewKeyDown}
                    placeholder="Gear name"
                    aria-label="New gear name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-gear-location">Location (optional)</Label>
                  <Select
                    value={newLocationId ?? NO_LOCATION}
                    onValueChange={(v) =>
                      setNewLocationId(v === NO_LOCATION ? null : v)
                    }>
                    <SelectTrigger id="new-gear-location">
                      <SelectValue placeholder="No location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_LOCATION}>No location</SelectItem>
                      {sortedLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.location_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false)
                      setNewName('')
                      setNewLocationId(null)
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
                  <Label htmlFor="edit-gear-name">Gear Name</Label>
                  <Input
                    ref={editInputRef}
                    id="edit-gear-name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder="Gear name"
                    aria-label="Edit gear name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-gear-location">
                    Location (optional)
                  </Label>
                  <Select
                    value={editingLocationId ?? NO_LOCATION}
                    onValueChange={(v) =>
                      setEditingLocationId(v === NO_LOCATION ? null : v)
                    }>
                    <SelectTrigger id="edit-gear-location">
                      <SelectValue placeholder="No location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_LOCATION}>No location</SelectItem>
                      {sortedLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.location_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        Location
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
                          <div className="font-medium">{item.gear_name}</div>
                          {/* Show location on mobile below the name */}
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {getLocationName(item.location_id)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {getLocationName(item.location_id)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(item)}
                              disabled={!!editingId}
                              title={`Edit ${item.gear_name}`}>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item)}
                              disabled={!!editingId}
                              title={`Delete ${item.gear_name}`}>
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
