import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SurvivorDetail } from '@/lib/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CheckIcon, GripVertical, PencilIcon, TrashIcon } from 'lucide-react'
import { KeyboardEvent, ReactElement, useEffect, useRef } from 'react'

/**
 * Cursed Gear Item Component Properties
 */
export interface CursedGearItemProps {
  /** Cursed Gear ID */
  id: string
  /** Index */
  index: number
  /** Is Disabled */
  isDisabled: boolean
  /** OnEdit Handler */
  onEdit: (index: number) => void
  /** OnRemove Handler */
  onRemove: (index: number) => void
  /** OnSave Handler */
  onSave: (value?: string, index?: number) => void
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
}

/**
 * New Cursed Gear Item Component Properties
 */
export interface NewCursedGearItemProps {
  /** OnCancel Handler */
  onCancel: () => void
  /** OnSave Handler */
  onSave: (value?: string) => void
}

/**
 * Cursed Gear Item Component
 *
 * @param props Cursed Gear Item Component Properties
 * @returns Cursed Gear Item Component
 */
export function CursedGearItem({
  id,
  index,
  isDisabled,
  onEdit,
  onRemove,
  onSave,
  selectedSurvivor
}: CursedGearItemProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.debug('[CursedGearItem] Changed', selectedSurvivor?.cursed_gear)

    if (inputRef.current)
      inputRef.current.value =
        selectedSurvivor?.cursed_gear?.[index]?.gear_name ?? ''
  }, [selectedSurvivor?.cursed_gear, index])

  /**
   * Handle Key Down Event
   *
   * If the Enter key is pressed, it calls the onSave function with the current
   * index and value.
   *
   * @param e Key Down Event
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current) {
      e.preventDefault()
      onSave(inputRef.current.value, index)
    }
  }

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
        <span className="text-sm ml-1">
          {selectedSurvivor?.cursed_gear?.[index]?.gear_name}
        </span>
      ) : (
        <Input
          ref={inputRef}
          placeholder="Cursed Gear"
          defaultValue={selectedSurvivor?.cursed_gear?.[index]?.gear_name}
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
            onClick={() => onEdit(index)}
            title="Edit cursed gear">
            <PencilIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onSave(inputRef.current!.value, index)}
            title="Save cursed gear">
            <CheckIcon className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}>
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

/**
 * New Cursed Gear Item Component
 *
 * @param props New Cursed Gear Item Component Properties
 * @returns New Cursed Gear Item Component
 */
export function NewCursedGearItem({
  onCancel,
  onSave
}: NewCursedGearItemProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle Key Down Event
   *
   * If the Enter key is pressed, calls the onSave function with the current
   * value. If the Escape key is pressed, it calls the onCancel function.
   *
   * @param e Key Down Event
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current) {
      e.preventDefault()
      onSave(inputRef.current.value)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Drag Handle */}
      <div className="p-1">
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-50" />
      </div>

      {/* Input Field */}
      <Input
        ref={inputRef}
        placeholder="Cursed Gear"
        defaultValue={''}
        onKeyDown={handleKeyDown}
      />

      <div className="flex items-center gap-1 ml-auto">
        {/* Interaction Buttons */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onSave(inputRef.current?.value)}
          title="Save cursed gear">
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          title="Cancel">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
