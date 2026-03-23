'use client'

import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/core'
import { SkullIcon, UsersIcon } from 'lucide-react'
import { ReactElement } from 'react'

/**
 * Hunt Board Token Component Properties
 */
interface HuntBoardTokenProps {
  /** Token Overlap */
  overlap: boolean
  /** Token Type */
  tokenType: 'quarry' | 'survivors'
}

/**
 * Hunt Board Token Component
 *
 * A draggable token representing the quarry or party on the hunt board.
 *
 * @param props Hunt Board Token Properties
 * @returns Hunt Board Token Component
 */
export function HuntBoardToken({
  overlap,
  tokenType
}: HuntBoardTokenProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${tokenType}-token`
    })

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
        'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12',
        tokenType === 'survivors' ? 'bg-blue-500' : 'bg-red-500',
        'text-white rounded-full cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-shadow z-1',
        overlap
          ? tokenType === 'survivors'
            ? // Survivors go top-left when overlapping
              'top-1 left-1 sm:top-1.5 sm:left-1.5 md:top-2 md:left-2'
            : // Quarry goes bottom-right when overlapping
              'bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 md:bottom-2 md:right-2'
          : // Centered when not overlapping
            'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        isDragging && 'opacity-50 scale-110'
      )}
      title={`Drag to move ${tokenType} on the hunt board`}>
      {tokenType === 'survivors' ? (
        <UsersIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
      ) : (
        <SkullIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
      )}
    </div>
  )
}
