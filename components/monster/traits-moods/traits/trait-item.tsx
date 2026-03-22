'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { KeyboardEvent, ReactElement, useEffect, useRef } from 'react'

/**
 * Trait Item Component
 *
 * @param props Trait Item Component Properties
 * @returns Trait Item Component
 */
export function TraitItem({
  trait,
  index,
  isDisabled,
  onEdit,
  onRemove,
  onSave
}: {
  trait: string
  index: number
  isDisabled: boolean
  onEdit: (index: number) => void
  onRemove: (index: number) => void
  onSave: (value?: string, index?: number) => void
}): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = trait
  }, [trait])

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
        <span className="text-sm ml-1">{trait}</span>
      ) : (
        <Input
          ref={inputRef}
          placeholder="Trait"
          defaultValue={trait}
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
            title="Edit trait">
            <PencilIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onSave(inputRef.current?.value, index)}
            title="Save trait">
            <CheckIcon className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          title="Remove trait">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

/**
 * New Trait Item Component
 *
 * @param props New Trait Item Component Properties
 * @returns New Trait Item Component
 */
export function NewTraitItem({
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
        placeholder="Trait"
        defaultValue={''}
        onKeyDown={handleKeyDown}
      />

      <div className="flex items-center gap-1 ml-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onSave(inputRef.current?.value)}
          title="Save trait">
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
