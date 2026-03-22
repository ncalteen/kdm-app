'use client'

import { TimelineEventBadge } from '@/components/settlement/timeline/timeline-event-badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { CheckIcon, PlusCircleIcon, ScrollIcon, TrashIcon } from 'lucide-react'
import { KeyboardEvent } from 'react'

/**
 * Timeline Row Props
 */
export interface TimelineRowProps {
  /** Row Index */
  index: number
  /** Completed */
  completed: boolean
  /** Entries */
  entries: string[]
  /** Add Event Handler */
  handleAddEventInput: (yearIndex: number) => void
  /** Edit Event Handler */
  handleEditEventInputToggle: (yearIndex: number, entryIndex: number) => void
  /** Key Down Handler */
  handleKeyDown: (
    e: KeyboardEvent<HTMLInputElement>,
    yearIndex: number,
    entryIndex: number
  ) => void
  /** Remove Event Handler */
  handleRemoveEvent: (yearIndex: number, eventIndex: number) => void
  /** Save Event Handler */
  handleSaveEvent: (yearIndex: number, entryIndex: number) => void
  /** Handler for Year Completion Change */
  handleSaveYearCompletion: (yearIndex: number, completed: boolean) => void
  /** Check if an event is being edited */
  isEventBeingEdited: (yearIndex: number, entryIndex: number) => boolean
  /** Set Input Reference */
  setInputRef: (
    element: HTMLInputElement | null,
    yearIndex: number,
    entryIndex: number
  ) => void
  /** Show Story Event Icon */
  showStoryEventIcon: boolean
  /** Use Normal Year Numbering */
  usesNormalNumbering: boolean
}

/**
 * Timeline Year Row Component
 *
 * @param props Timeline Row Properties
 * @returns Timeline Year Row Component
 */
export const TimelineYearRow = ({
  index,
  completed,
  entries,
  handleAddEventInput,
  handleEditEventInputToggle,
  handleKeyDown,
  handleRemoveEvent,
  handleSaveEvent,
  handleSaveYearCompletion,
  isEventBeingEdited,
  setInputRef,
  showStoryEventIcon,
  usesNormalNumbering
}: TimelineRowProps) => {
  const allEntryIndices = new Set([...entries.map((_, i) => i)])

  // Also include any entry indices that are being edited but don't exist in
  // the entries array yet
  for (let i = 0; i <= entries.length; i++)
    if (isEventBeingEdited(index, i)) allEntryIndices.add(i)

  const sortedIndices = Array.from(allEntryIndices).sort((a, b) => a - b)

  return (
    <div
      className={`grid ${
        showStoryEventIcon
          ? 'grid-cols-[60px_30px_1fr_auto]'
          : 'grid-cols-[60px_1fr_auto]'
      } items-start border-t py-1 min-h-9`}>
      {/* Year Number and Completion Checkbox */}
      <div className="flex gap-1 items-center">
        <Checkbox
          checked={completed}
          onCheckedChange={(checked) =>
            handleSaveYearCompletion(index, !!checked)
          }
          id={`timeline.${index}.completed`}
          name={`timeline.${index}.completed`}
        />
        <span
          className={`text-xs leading-none ${completed ? 'text-muted-foreground' : ''}`}>
          {index === 0 && !usesNormalNumbering
            ? 'Prologue'
            : usesNormalNumbering
              ? index + 1
              : index}
        </span>
      </div>

      {/* Story Event Icon */}
      {showStoryEventIcon && (
        <div className="flex items-center justify-center">
          {index !== 0 && (
            <ScrollIcon className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      )}

      {/* Events Section */}
      <div className="flex flex-col gap-0.5">
        {/* Saved Event Badges and Add Event Button (mobile) */}
        {entries.length > 0 && (
          <div className="flex flex-wrap gap-0.5 items-center">
            {entries.map((entry: string, entryIndex: number) =>
              !isEventBeingEdited(index, entryIndex) &&
              entry &&
              entry.trim() !== '' ? (
                <TimelineEventBadge
                  key={entryIndex}
                  entry={entry}
                  yearIndex={index}
                  entryIndex={entryIndex}
                  handleEditEventInputToggle={
                    !completed ? handleEditEventInputToggle : () => {}
                  }
                  isCompleted={completed}
                />
              ) : null
            )}
            {!completed && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddEventInput(index)}
                className="h-6 px-2 text-xs sm:hidden ml-auto">
                <PlusCircleIcon className="h-3 w-3" />
                <span className="text-xs hidden">Add Event</span>
              </Button>
            )}
          </div>
        )}

        {/* Empty State */}
        {entries.length === 0 && (
          <div className="flex justify-between gap-2">
            <div className="text-xs text-muted-foreground italic leading-none">
              No events recorded.
            </div>

            {!completed && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddEventInput(index)}
                className="h-6 px-2 text-xs sm:hidden">
                <PlusCircleIcon className="h-3 w-3" />
                <span className="text-xs hidden">Add Event</span>
              </Button>
            )}
          </div>
        )}

        {/* Edit Event Input Fields */}
        {sortedIndices.map((entryIndex: number) =>
          isEventBeingEdited(index, entryIndex) ? (
            <div key={entryIndex} className="flex items-center gap-1">
              <Input
                placeholder={`${
                  index === 0 && !usesNormalNumbering
                    ? 'Prologue'
                    : usesNormalNumbering
                      ? `Year ${index + 1}`
                      : `Year ${index}`
                } event...`}
                defaultValue={entries[entryIndex] ?? ''}
                ref={(element) => setInputRef(element, index, entryIndex)}
                onKeyDown={(e) => handleKeyDown(e, index, entryIndex)}
                className="h-7 text-xs"
                id={`timeline.${index}.entries.${entryIndex}`}
                name={`timeline.${index}.entries.${entryIndex}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleSaveEvent(index, entryIndex)}
                title="Save event">
                <CheckIcon className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemoveEvent(index, entryIndex)}
                title="Remove event">
                <TrashIcon className="h-3 w-3" />
              </Button>
            </div>
          ) : null
        )}
      </div>

      {/* Add Event Button (Desktop) */}
      {!completed && (
        <div className="justify-end pr-2 hidden sm:flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddEventInput(index)}
            className="h-6 px-2 text-xs">
            <PlusCircleIcon className="h-3 w-3" />
            <span className="text-xs">Add Event</span>
          </Button>
        </div>
      )}
    </div>
  )
}
