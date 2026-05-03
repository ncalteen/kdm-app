'use client'

import { TimelineYearRow } from '@/components/settlement/timeline/timeline-year-row'

/**
 * Timeline Content Component Properties
 */
export interface TimelineContentProps {
  /** Add Event Handler */
  handleAddEventInput: (yearIndex: number) => void
  /** Edit Event Handler */
  handleEditEventInputToggle: (yearIndex: number, entryIndex: number) => void
  /** Key Press Handler */
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    yearIndex: number,
    entryIndex: number
  ) => void
  /** Remove Event from Year Handler */
  handleRemoveEvent: (yearIndex: number, entryIndex: number) => void
  /** Event Save Handler */
  handleSaveEvent: (yearIndex: number, entryIndex: number) => void
  /** Year Completion Change Handler */
  handleSaveYearCompletion: (yearIndex: number, completed: boolean) => void
  /** Event Edit Status */
  isEventBeingEdited: (yearIndex: number, entryIndex: number) => boolean
  /** Set Input Reference Function */
  setInputRef: (
    element: HTMLInputElement | null,
    yearIndex: number,
    entryIndex: number
  ) => void
  /** Show Story Event Icon */
  showStoryEventIcon: boolean
  /** Timeline */
  timeline: {
    [key: number]: {
      entries: string[]
      completed: boolean
    }
  }
  /** Use Normal Year Numbering */
  usesNormalNumbering: boolean
}

/**
 * Timeline Content Component
 *
 * @param props Timeline Content Component Properties
 * @returns Timeline Content Component
 */
export const TimelineContent = ({
  handleAddEventInput,
  handleEditEventInputToggle,
  handleKeyDown,
  handleRemoveEvent,
  handleSaveEvent,
  handleSaveYearCompletion,
  isEventBeingEdited,
  setInputRef,
  showStoryEventIcon,
  timeline,
  usesNormalNumbering
}: TimelineContentProps) => {
  return (
    <div className="flex flex-col h-full">
      <div
        className={`grid ${showStoryEventIcon ? 'grid-cols-[60px_30px_1fr_auto]' : 'grid-cols-[60px_1fr_auto]'} px-2 py-0.5 text-sm text-left border-b`}>
        <div>Year</div>
        {showStoryEventIcon && <div />}
        <div>Events</div>
        <div />
      </div>
      <div className="flex-1 overflow-y-auto">
        {(() => {
          // Determine the highest completed year index so we can flag any
          // earlier years that have not yet been checked off. Mirrors the
          // highlighting used on the collective cognition rewards card to call
          // out items the user has visibly skipped past.
          const lastCompletedIndex = Object.entries(timeline).reduce<number>(
            (last, [yearString, { completed }]) =>
              completed ? Math.max(last, parseInt(yearString, 10)) : last,
            -1
          )

          return Object.entries(timeline).map(
            ([yearString, { completed, entries }]) => {
              const yearIndex = parseInt(yearString, 10)

              return (
                <TimelineYearRow
                  key={yearString}
                  index={yearIndex}
                  completed={completed}
                  entries={entries}
                  handleAddEventInput={handleAddEventInput}
                  handleEditEventInputToggle={handleEditEventInputToggle}
                  handleKeyDown={handleKeyDown}
                  handleRemoveEvent={handleRemoveEvent}
                  handleSaveEvent={handleSaveEvent}
                  handleSaveYearCompletion={handleSaveYearCompletion}
                  isEventBeingEdited={isEventBeingEdited}
                  setInputRef={setInputRef}
                  shouldHighlight={!completed && yearIndex < lastCompletedIndex}
                  showStoryEventIcon={showStoryEventIcon}
                  usesNormalNumbering={usesNormalNumbering}
                />
              )
            }
          )
        })()}
      </div>
    </div>
  )
}
