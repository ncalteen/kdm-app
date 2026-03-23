'use client'

import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/core'
import { HouseIcon } from 'lucide-react'
import { ReactElement } from 'react'

/**
 * Settlement Phase Board Token Component
 *
 * A draggable token representing the stage on the settlement phase board.
 *
 * @param props Settlement Phase Board Token Properties
 * @returns Settlement Phase Board Token Component
 */
export function SettlementPhaseBoardToken(): ReactElement {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: 'settlement-phase-token' })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'absolute z-10 flex items-center justify-center',
        'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-500',
        'text-white rounded-full cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-shadow z-1',
        isDragging && 'opacity-50 scale-110'
      )}
      title={`Drag to move the token on the settlement phase board`}>
      <HouseIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
    </div>
  )
}
