'use client'

import { ListItem, NewListItem } from '@/components/generic/list-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ERROR_MESSAGE, NAMELESS_OBJECT_ERROR_MESSAGE } from '@/lib/messages'
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * List Card Properties
 */
interface ListCardProps {
  /** Icon */
  icon: ReactElement
  /** Initial Items */
  initialItems: string[]
  /** Item Name */
  itemName: string
  /** Placeholder */
  placeholder: string
  /** Save List */
  saveList: (updateData: string[]) => Promise<void>
  /** Selected Settlement ID */
  selectedSettlementId: string | null
}

/**
 * List Card Component
 *
 * Renders a sortable, editable list of string items with add, edit, reorder,
 * and remove capabilities. Changes are persisted via the `saveList` callback.
 *
 * @param props List Card Properties
 * @returns Lists Card Component
 */
export function ListCard({
  icon,
  initialItems,
  itemName,
  placeholder,
  saveList,
  selectedSettlementId
}: ListCardProps): ReactElement {
  const [editingIndices, setEditingIndices] = useState<Set<number>>(new Set())
  const [items, setItems] = useState<string[]>(initialItems)
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)

  // Track previous prop values to reset state during render when the source
  // data or settlement changes.
  const [prevInitialItems, setPrevInitialItems] =
    useState<string[]>(initialItems)
  const [prevSettlementId, setPrevSettlementId] = useState(selectedSettlementId)

  if (
    initialItems !== prevInitialItems ||
    selectedSettlementId !== prevSettlementId
  ) {
    setPrevInitialItems(initialItems)
    setPrevSettlementId(selectedSettlementId)
    setItems(initialItems)
    setEditingIndices(new Set())
    setIsAddingNew(false)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  /**
   * Item is Being Edited
   *
   * Returns true when any item is being edited.
   */
  const isEditing = useMemo(() => editingIndices.size > 0, [editingIndices])

  /**
   * Handle Item Removal
   *
   * @param index Item Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      const updated = items.filter((_, i) => i !== index)

      // Update editing indices to reflect removed item.
      setItems(updated)
      setEditingIndices((prev) => {
        const next = new Set<number>()

        for (const idx of prev) {
          if (idx < index) next.add(idx)
          else if (idx > index) next.add(idx - 1)
          // idx === index is removed — skip it
        }

        return next
      })

      // Update the database with the new list order.
      saveList(updated).catch((err: unknown) => {
        // Revert to previous state on error.
        setItems(items)
        setEditingIndices(new Set())

        console.error('Error Saving List:', err)
        toast.error(ERROR_MESSAGE())
      })
    },
    [items, saveList]
  )

  /**
   * Handle Item Save
   *
   * @param value Item Value
   * @param i Item Index (Updates Only)
   */
  const handleSave = useCallback(
    (value?: string, i?: number) => {
      if (!value || value.trim() === '')
        return toast.error(
          NAMELESS_OBJECT_ERROR_MESSAGE(itemName.toLowerCase())
        )

      const updated = [...items]

      if (i !== undefined) {
        // Updating an existing value.
        updated[i] = value.trim()
        setEditingIndices((prev) => {
          const next = new Set(prev)
          next.delete(i)
          return next
        })
      } else
        // Adding a new value.
        updated.push(value.trim())

      setItems(updated)
      setIsAddingNew(false)

      saveList(updated).catch((err: unknown) => {
        // Revert to previous state on error.
        setItems(items)
        setEditingIndices(new Set())

        console.error('Error Saving List:', err)
        toast.error(ERROR_MESSAGE())
      })
    },
    [items, itemName, saveList]
  )

  /**
   * Handle Edit Mode
   *
   * Enters edit mode for an item.
   *
   * @param index Item Index
   */
  const handleEdit = useCallback((index: number) => {
    setEditingIndices((prev) => new Set(prev).add(index))
  }, [])

  /**
   * Handle Cancel Edit
   *
   * Cancel editing and revert an item to its saved value.
   */
  const handleCancelEdit = useCallback((index: number) => {
    setEditingIndices((prev) => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }, [])

  /**
   * Handle Drag End Event
   *
   * @param event Drag End Event
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = parseInt(active.id.toString())
        const newIndex = parseInt(over.id.toString())
        const newOrder = arrayMove(items, oldIndex, newIndex)

        setItems(newOrder)

        // Re-map editing indices to follow their items.
        setEditingIndices((prev) => {
          if (prev.size === 0) return prev

          const next = new Set<number>()

          for (const idx of prev) {
            if (idx === oldIndex) next.add(newIndex)
            else if (oldIndex < newIndex)
              // Item moved forward: indices in (oldIndex, newIndex] shift down.
              next.add(idx > oldIndex && idx <= newIndex ? idx - 1 : idx)
            else
              // Item moved backward: indices in [newIndex, oldIndex) shift up.
              next.add(idx >= newIndex && idx < oldIndex ? idx + 1 : idx)
          }

          return next
        })

        saveList(newOrder).catch((err: unknown) => {
          // Revert to previous state on error.
          setItems(items)
          setEditingIndices(new Set())

          console.error('Error Saving List:', err)
          toast.error(ERROR_MESSAGE())
        })
      }
    },
    [items, saveList]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          {icon}
          {itemName}
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew || isEditing}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {/* Item List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[240px]">
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 && !isAddingNew && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No {itemName.toLowerCase()}s yet
              </p>
            )}

            {items.length !== 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}>
                <SortableContext
                  items={items.map((_, index) => index.toString())}
                  strategy={verticalListSortingStrategy}>
                  {items.map((item, index) => (
                    <ListItem
                      key={`${index}-${item}`}
                      id={index.toString()}
                      index={index}
                      handleCancelEdit={handleCancelEdit}
                      handleEdit={handleEdit}
                      handleRemove={handleRemove}
                      handleSave={handleSave}
                      isDisabled={!editingIndices.has(index)}
                      itemValue={item}
                      placeholder={placeholder}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}

            {isAddingNew && (
              <NewListItem
                handleCancel={() => setIsAddingNew(false)}
                handleSave={handleSave}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
