import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CheckIcon, GripVertical, PencilIcon, TrashIcon } from 'lucide-react'
import { KeyboardEvent, ReactElement, useEffect, useState } from 'react'

/**
 * List Item Component Properties
 */
export interface ListItemProps {
  /** Edit Handler */
  handleEdit: (index: number) => void
  /** Remove Handler */
  handleRemove: (index: number) => void
  /** Save Handler */
  handleSave: (value?: string, index?: number) => void
  /** Item ID */
  id: string
  /** Index */
  index: number
  /** Is Disabled */
  isDisabled: boolean
  /** List Items */
  listItems: string[]
  /** Placeholder Text */
  placeholder: string
}

/**
 * New List Item Component Properties
 */
export interface NewListItemProps {
  /** Cancel Handler */
  handleCancel: () => void
  /** Save Handler */
  handleSave: (value?: string) => void
}

/**
 * List Item Component
 *
 * Provides a generic list item component with edit, save, and remove
 * functionalities. It also supports drag-and-drop sorting using the useSortable
 * hook from @dnd-kit/sortable.
 *
 * @param props Item Component Properties
 * @returns Item Component
 */
export function ListItem({
  handleEdit,
  handleRemove,
  handleSave,
  id,
  index,
  isDisabled,
  listItems,
  placeholder
}: ListItemProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const [value, setValue] = useState<string>(listItems[index])

  // Keep local value in sync when items are reordered externally.
  useEffect(() => {
    setValue(listItems[index])
  }, [listItems, index])

  /**
   * Handle Key Down Event
   *
   * If the Enter key is pressed, it calls the save function with the current
   * index and value.
   *
   * @param e Key Down Event
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value) {
      e.preventDefault()
      handleSave(value, index)
    } else setValue((e.target as HTMLInputElement).value)
  }

  if (index >= listItems.length) return <></>

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Input Field */}
      {isDisabled ? (
        <span className="text-sm ml-1">{value}</span>
      ) : (
        <Input
          placeholder={placeholder}
          defaultValue={value}
          disabled={isDisabled}
          onKeyDown={handleKeyDown}
        />
      )}

      {/* Interaction Buttons */}
      <div className="flex items-center gap-1 ml-auto">
        {isDisabled ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(index)}
            title="Edit item">
            <PencilIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleSave(value, index)}
            title="Save item">
            <CheckIcon className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => handleRemove(index)}
          title="Delete item">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

/**
 * New List Item Component
 *
 * @param props New List Item Component Properties
 */
export function NewListItem({
  handleCancel,
  handleSave
}: NewListItemProps): ReactElement {
  const [value, setValue] = useState<string | null>(null)

  /**
   * Handle Key Down Event
   *
   * If the Enter key is pressed, calls the save function with the current
   * value. If the Escape key is pressed, it calls the cancel function.
   *
   * @param e Key Down Event
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value) {
      e.preventDefault()
      handleSave(value)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    } else setValue((e.target as HTMLInputElement).value)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Drag Handle */}
      <div className="p-1">
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-50" />
      </div>

      {/* Input Field */}
      <Input
        placeholder="Add an item..."
        onKeyDown={handleKeyDown}
        className="flex-1"
      />

      <div className="flex items-center gap-1 ml-auto">
        {/* Interaction Buttons */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            if (value) handleSave(value)
          }}
          title="Save item">
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          title="Cancel">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
