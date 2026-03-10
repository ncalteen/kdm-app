import { ListItem, NewListItem } from '@/components/generic/list-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NAMELESS_OBJECT_ERROR_MESSAGE } from '@/lib/messages'
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
import { ReactElement, useEffect, useState } from 'react'
import { toast } from 'sonner'

type DisabledInputs = { [key: number]: boolean }

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
  saveList: (updateData: string[]) => void
  /** Selected Settlement ID */
  selectedSettlementId: string | undefined
}

/**
 * List Card Component
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
  const [disabledInputs, setDisabledInputs] = useState<DisabledInputs>(
    Object.fromEntries(initialItems.map((_, i) => [i, true]))
  )
  const [items, setItems] = useState<string[]>(initialItems)
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [settlementId, setSettlementId] = useState<string | undefined>(
    selectedSettlementId
  )

  // Update items and reset disabled inputs when initial list changes.
  useEffect(() => {
    setItems(initialItems)
    setDisabledInputs(Object.fromEntries(initialItems.map((_, i) => [i, true])))
  }, [initialItems])

  // Reset disabled inputs when settlement changes.
  useEffect(() => {
    if (selectedSettlementId !== settlementId) {
      setSettlementId(selectedSettlementId)
      setDisabledInputs(
        Object.fromEntries(initialItems.map((_, i) => [i, true]))
      )
    }
  }, [selectedSettlementId, initialItems, settlementId])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  /**
   * Handle Item Removal
   *
   * @param index Item Index
   */
  const handleRemove = (index: number) => {
    const current = [...items]
    current.splice(index, 1)

    setItems(current)
    setDisabledInputs((prev) => {
      const next: { [key: number]: boolean } = {}

      Object.keys(prev).forEach((k) => {
        const num = parseInt(k)
        if (num < index) next[num] = prev[num]
        else if (num > index) next[num - 1] = prev[num]
      })

      return next
    })
    saveList(current)
  }

  /**
   * Handle Item Save
   *
   * @param value Item Value
   * @param i Item Index (Updates Only)
   */
  const handleSave = (value?: string, i?: number) => {
    if (!value || value.trim() === '')
      return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE(itemName.toLowerCase()))

    const updated = [...items]

    if (i !== undefined) {
      // Updating an existing value
      updated[i] = value
      setDisabledInputs((prev) => ({
        ...prev,
        [i]: true
      }))
    } else {
      // Adding a new value
      updated.push(value)
      setDisabledInputs((prev) => ({
        ...prev,
        [updated.length - 1]: true
      }))
    }

    setItems(updated)
    saveList(updated)
    setIsAddingNew(false)
  }

  /**
   * Handle Drag End Event
   *
   * @param event Drag End Event
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString())
      const newIndex = parseInt(over.id.toString())
      const newOrder = arrayMove(items, oldIndex, newIndex)

      // Batch all local state updates first so React renders the new order
      // before the async save runs.
      setItems(newOrder)
      setDisabledInputs((prev) => {
        const next: { [key: number]: boolean } = {}

        Object.keys(prev).forEach((k) => {
          const num = parseInt(k)
          if (num === oldIndex) next[newIndex] = prev[num]
          else if (num >= newIndex && num < oldIndex) next[num + 1] = prev[num]
          else if (num <= newIndex && num > oldIndex) next[num - 1] = prev[num]
          else next[num] = prev[num]
        })

        return next
      })

      // Persist after state updates are queued.
      saveList(newOrder)
    }
  }

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
              disabled={
                isAddingNew ||
                Object.values(disabledInputs).some((v) => v === false)
              }>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {/* Item List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[240px]">
          <div className="flex-1 overflow-y-auto">
            {items.length !== 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}>
                <SortableContext
                  items={items.map((_, index) => index.toString())}
                  strategy={verticalListSortingStrategy}>
                  {items.map((item, index) => {
                    return (
                      <ListItem
                        key={`${index}-${item}`}
                        id={index.toString()}
                        index={index}
                        handleRemove={handleRemove}
                        isDisabled={!!disabledInputs[index]}
                        handleSave={(value, i) => handleSave(value, i)}
                        handleEdit={() =>
                          setDisabledInputs((prev) => ({
                            ...prev,
                            [index]: false
                          }))
                        }
                        listItems={items}
                        placeholder={placeholder}
                      />
                    )
                  })}
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
