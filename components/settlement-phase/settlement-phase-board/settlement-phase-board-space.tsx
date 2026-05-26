'use client'

import { cn } from '@/lib/utils'
import { useDroppable } from '@dnd-kit/core'
import { ReactElement, ReactNode } from 'react'

/**
 * Settlement Phase Board Space Component Properties
 */
interface SettlementPhaseBoardSpaceProps {
  /** Accessible Label */
  ariaLabel: string
  /** Children */
  children?: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Space Index (0-12) */
  index: number
  /** Space Label */
  label: string | ReactElement | null | undefined
  /** Click handler */
  onClick?: () => void
}

/**
 * Settlement Phase Board Space Component
 *
 * Represents a single space on the settlement phase board that can accept
 * dropped tokens.
 *
 * @param props Settlement Phase Board Space Properties
 * @returns Settlement Phase Board Space Component
 */
export function SettlementPhaseBoardSpace({
  ariaLabel,
  children,
  className,
  index,
  label,
  onClick
}: SettlementPhaseBoardSpaceProps): ReactElement {
  const { isOver, setNodeRef } = useDroppable({
    id: `space-${index}`
  })

  return (
    <div
      aria-label={ariaLabel}
      role="button"
      tabIndex={0}
      ref={setNodeRef}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onClick?.()
      }}
      className={cn(
        'py-3 relative flex flex-col items-center justify-center w-full h-full border-2 rounded-lg transition-colors border-border bg-card hover:bg-accent/50',
        isOver && 'border-primary bg-primary/10',
        className
      )}>
      <div className="text-[10px] sm:text-xs font-medium text-center wrap-break-word px-1 sm:px-2 leading-tight">
        {label ?? index}
      </div>
      <div className="mt-auto flex flex-col items-center">{children}</div>
    </div>
  )
}
