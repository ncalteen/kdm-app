'use client'

import { Badge } from '@/components/ui/badge'
import { BookOpenIcon, SwordsIcon } from 'lucide-react'
import { useCallback } from 'react'

/**
 * Timeline Event Badge Component Properties
 */
export interface TimelineEventBadgeProps {
  /** Entry Text */
  entry: string
  /** Entry Index */
  entryIndex: number
  /** Entry Edit Handler */
  handleEditEventInputToggle: (yearIndex: number, entryIndex: number) => void
  /** Entry Completion Status */
  isCompleted?: boolean
  /** Timeline Year Index */
  yearIndex: number
}

/**
 * Timeline Event Badge Component
 *
 * @param props Timeline Event Badge Component Properties
 * @returns Timeline Event Badge Component
 */
export const TimelineEventBadge = ({
  entry,
  entryIndex,
  handleEditEventInputToggle,
  isCompleted,
  yearIndex
}: TimelineEventBadgeProps) => {
  /**
   * Handle Click Event
   *
   * Clicking a badge will trigger the onEdit handler if the entry is not
   * completed.
   */
  const handleClick = useCallback(() => {
    if (!isCompleted) handleEditEventInputToggle(yearIndex, entryIndex)
  }, [yearIndex, entryIndex, isCompleted, handleEditEventInputToggle])

  return (
    <Badge
      key={entryIndex}
      className={`${
        isCompleted
          ? 'opacity-70 cursor-default'
          : 'cursor-pointer hover:bg-accent'
      } text-xs px-1.5 py-0.5 h-5 gap-1`}
      onClick={handleClick}>
      {/*
        Use a sword icon for nemesis encounters/special showdowns. Otherwise,
        use a book icon.
      */}
      {entry.toLowerCase().startsWith('nemesis') ||
      entry.toLowerCase().startsWith('special showdown') ? (
        <SwordsIcon className="h-2.5 w-2.5" />
      ) : (
        <BookOpenIcon className="h-2.5 w-2.5" />
      )}
      <span className="text-xs leading-none">{entry}</span>
    </Badge>
  )
}
