'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { KeyboardEvent, ReactElement, useEffect, useRef } from 'react'

/**
 * Mood Item Component
 *
 * @param props Mood Item Component Properties
 * @returns Mood Item Component
 */
export function MoodItem({
  mood,
  index,
  isDisabled,
  onEdit,
  onRemove,
  onSave
}: {
  mood: string
  index: number
  isDisabled: boolean
  onEdit: (index: number) => void
  onRemove: (index: number) => void
  onSave: (value?: string, index?: number) => void
}): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = mood
  }, [mood])

  /**
   * Handle Key Down Event
   *
   * @param e Keyboard Event
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current) {
      e.preventDefault()
      onSave(inputRef.current.value, index)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isDisabled ? (
        <span className="text-sm ml-1">{mood}</span>
      ) : (
        <Input
          ref={inputRef}
          placeholder="Mood"
          defaultValue={mood}
          disabled={isDisabled}
          onKeyDown={handleKeyDown}
        />
      )}

      <div className="flex items-center gap-1 ml-auto">
        {isDisabled ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(index)}
            title="Edit mood">
            <PencilIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onSave(inputRef.current?.value, index)}
            title="Save mood">
            <CheckIcon className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          title="Remove mood">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

/**
 * New Mood Item Component
 *
 * @param props New Mood Item Component Properties
 * @returns New Mood Item Component
 */
export function NewMoodItem({
  onCancel,
  onSave
}: {
  onCancel: () => void
  onSave: (value?: string) => void
}): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle Key Down Event
   *
   * @param e Keyboard Event
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
      <Input
        ref={inputRef}
        placeholder="Mood"
        defaultValue={''}
        onKeyDown={handleKeyDown}
      />

      <div className="flex items-center gap-1 ml-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onSave(inputRef.current?.value)}
          title="Save mood">
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
