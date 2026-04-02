'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusIcon, XIcon } from 'lucide-react'
import { ReactElement } from 'react'

/**
 * String Array Section Component Properties
 */
interface StringArraySectionProps {
  /** Section Title */
  title: string
  /** Items */
  items: string[]
  /** Input Placeholder */
  placeholder: string
  /** Add Item Handler */
  onAdd: () => void
  /** Remove Item Handler */
  onRemove: (index: number) => void
  /** Update Item Handler */
  onUpdate: (index: number, value: string) => void
}

/**
 * String Array Section
 *
 * Reusable component for managing a list of strings with add, edit, and remove
 * functionality. Used in various custom entity cards for attributes like
 * traits, effects, etc.
 *
 * @param props String Array Section Properties
 * @returns String Array Section Component
 */
export function StringArraySection({
  title,
  items,
  placeholder,
  onAdd,
  onRemove,
  onUpdate
}: StringArraySectionProps): ReactElement {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-semibold">{title}</h5>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <PlusIcon className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No {title.toLowerCase()} defined.
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <Input
                className="h-8 text-sm"
                value={item}
                onChange={(e) => onUpdate(i, e.target.value)}
                placeholder={placeholder}
                aria-label={`${title} ${i + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => onRemove(i)}
                title="Remove">
                <XIcon className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
