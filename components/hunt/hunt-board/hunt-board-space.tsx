'use client'

import { cn } from '@/lib/utils'
import { useDroppable } from '@dnd-kit/core'
import { ReactElement } from 'react'

/**
 * Hunt Board Space Component Properties
 */
interface HuntBoardSpaceProps {
  /** Additional CSS classes */
  className?: string
  /** Space Index (0-12) */
  index: number
  /** Space Label */
  label: string | ReactElement | null | undefined
  /** Is Start Space */
  isStart?: boolean
  /** Is Starvation Space */
  isStarvation?: boolean
  /** Click handler */
  onClick?: (e: React.MouseEvent) => void
}

/**
 * Hunt Board Space Component
 *
 * Represents a single space on the hunt board that can accept dropped tokens.
 *
 * @param props Hunt Board Space Properties
 * @returns Hunt Board Space Component
 */
export function HuntBoardSpace({
  className,
  index,
  label,
  isStart = false,
  isStarvation = false,
  onClick
}: HuntBoardSpaceProps): ReactElement {
  const { isOver, setNodeRef } = useDroppable({
    id: `space-${index}`
  })

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center w-full h-full border-2 rounded-lg transition-colors',
        'border-border bg-card hover:bg-accent/50',
        isOver && 'border-primary bg-primary/10',
        isStart && 'border-green-500 bg-green-500/10',
        isStarvation && 'border-red-500 bg-red-500/10',
        className
      )}>
      <div className="text-[10px] sm:text-xs font-medium text-center break-words px-1 sm:px-2 leading-tight">
        {label ?? index}
      </div>
    </div>
  )
}
