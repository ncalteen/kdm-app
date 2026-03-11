'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  CheckIcon,
  GripVertical,
  PencilIcon,
  TrashIcon,
  XIcon
} from 'lucide-react'
import {
  ChangeEvent,
  KeyboardEvent,
  memo,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

/**
 * List Item Component Properties
 */
export interface ListItemProps {
  /** Cancel Edit Handler */
  handleCancelEdit: (index: number) => void
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
  /** Item Value */
  itemValue: string
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
 * Provides a generic list item component with edit, save, cancel, and remove
 * functionalities. It also supports drag-and-drop sorting using the useSortable
 * hook from @dnd-kit/sortable.
 *
 * @param props Item Component Properties
 * @returns Item Component
 */
export const ListItem = memo(function ListItem({
  handleCancelEdit,
  handleEdit,
  handleRemove,
  handleSave,
  id,
  index,
  isDisabled,
  itemValue,
  placeholder
}: ListItemProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const [value, setValue] = useState<string>(itemValue)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync local value when the canonical item value changes (e.g. reorder).
  useEffect(() => {
    setValue(itemValue)
  }, [itemValue])

  // Auto-focus when entering edit mode.
  useEffect(() => {
    if (!isDisabled) inputRef.current?.focus()
  }, [isDisabled])

  /**
   * Handle Change
   *
   * Updates local value state when the input changes.
   *
   * @param e Input Change Event
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value.trim()),
    []
  )

  /**
   * Handle Key Down
   *
   * Handles Enter and Escape keys for saving or canceling edits, respectively.
   *
   * @param e Input Keyboard Event
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (value) handleSave(value, index)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        // Revert to canonical value and exit edit mode.
        setValue(itemValue)
        handleCancelEdit(index)
      }
    },
    [value, index, itemValue, handleSave, handleCancelEdit]
  )

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing p-1">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Input Field */}
      {isDisabled ? (
        <span className="text-sm ml-1 truncate">{value}</span>
      ) : (
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      )}

      {/* Interaction Buttons */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
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
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleSave(value, index)}
              title="Save item">
              <CheckIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setValue(itemValue)
                handleCancelEdit(index)
              }}
              title="Cancel edit">
              <XIcon className="h-4 w-4" />
            </Button>
          </>
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
})

/**
 * New List Item Component
 *
 * @param props New List Item Component Properties
 */
export const NewListItem = memo(function NewListItem({
  handleCancel,
  handleSave
}: NewListItemProps): ReactElement {
  const [value, setValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the input when the component mounts.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (value) handleSave(value)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    },
    [value, handleSave, handleCancel]
  )

  return (
    <div className="flex items-center gap-2">
      {/* Drag Handle */}
      <div className="p-1">
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-50" />
      </div>

      {/* Input Field */}
      <Input
        ref={inputRef}
        placeholder="Add an item..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1"
      />

      <div className="flex items-center gap-1 ml-auto shrink-0">
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
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
