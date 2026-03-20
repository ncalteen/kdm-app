import { TimelineContent } from '@/components/settlement/timeline/timeline-content'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  addSettlementTimelineYear,
  removeSettlementTimelineYearEntry,
  saveSettlementTimelineYearEntry,
  toggleSettlementYearCompletionStatus
} from '@/lib/dal/settlement-timeline-year'
import { DatabaseCampaignType } from '@/lib/enums'
import {
  ERROR_MESSAGE,
  TIMELINE_EVENT_EMPTY_ERROR_MESSAGE,
  TIMELINE_EVENT_EMPTY_WARNING_MESSAGE,
  TIMELINE_EVENT_REMOVED_MESSAGE,
  TIMELINE_EVENT_SAVED_MESSAGE,
  TIMELINE_YEAR_ADDED_MESSAGE,
  TIMELINE_YEAR_COMPLETED_MESSAGE
} from '@/lib/messages'
import {
  showStoryEventIcon,
  usesNormalNumbering
} from '@/lib/settlement/timeline'
import { SettlementDetail } from '@/lib/types'
import { PlusCircleIcon } from 'lucide-react'
import {
  KeyboardEvent,
  ReactElement,
  startTransition,
  useCallback,
  useRef,
  useState
} from 'react'
import { toast } from 'sonner'

/**
 * Timeline Card Properties
 */
interface TimelineCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Timeline Card Component
 *
 * Displays the lantern years and events for a given settlement. Depending on
 * the campaign type, it may also show a scroll icon to indicate that a story
 * event card should be drawn when updating the settlement's timeline.
 *
 * @param props Timeline Card Properties
 * @returns Timeline Card Component
 */
export function TimelineCard({
  selectedSettlement,
  setSelectedSettlement
}: TimelineCardProps): ReactElement {
  const [editingEvents, setEditingEvents] = useState<{
    [key: string]: boolean
  }>({})

  const inputRefs = useRef<{
    [key: string]: HTMLInputElement | null
  }>({})

  /**
   * Is Event Being Edited
   *
   * @param yearNumber Year Index
   * @param entryIndex Event Entry Index
   * @returns Event is Being Edited
   */
  const isEventBeingEdited = useCallback(
    (yearNumber: number, entryIndex: number) =>
      !!editingEvents[`${yearNumber}-${entryIndex}`],
    [editingEvents]
  )

  /**
   * Add an Event Input
   *
   * Adds an empty input for the user to enter a new timeline entry. Does not
   * save anything to the database.
   *
   * @param yearNumber Year Index
   */
  const handleAddEventInput = useCallback(
    (yearNumber: number) => {
      const currentEntries =
        selectedSettlement?.timeline[yearNumber].entries ?? []

      // Check if any entry in this year is being edited
      const isEditing = Object.keys(editingEvents).some((key) => {
        const [keyYearNumber] = key.split('-').map(Number)

        return keyYearNumber === yearNumber && editingEvents[key]
      })

      // Check if any entry in this year is empty
      const hasEmpty = currentEntries.some((e) => !e || e.trim() === '')

      // Warn the user that there is an empty event or an event being edited
      // and prevent adding another event.
      if (isEditing || hasEmpty)
        return toast.warning(TIMELINE_EVENT_EMPTY_WARNING_MESSAGE())

      const newEntryIndex = currentEntries.length

      // Set this new event as being edited, which will trigger the input to
      // show for this event.
      setEditingEvents((prev) => ({
        ...prev,
        [`${yearNumber}-${newEntryIndex}`]: true
      }))
    },
    [editingEvents, selectedSettlement?.timeline]
  )

  /**
   * Remove an Event
   *
   * @param yearNumber Year Number
   * @param eventIndex Event Index
   */
  const handleRemoveEvent = useCallback(
    (yearNumber: number, eventIndex: number) => {
      if (!selectedSettlement) return

      const currentEntries =
        selectedSettlement?.timeline[yearNumber].entries ?? []
      const inputKey = `${yearNumber}-${eventIndex}`

      // Remove from editingEvents first
      setEditingEvents((prev) => {
        const newEditingEvents = { ...prev }
        delete newEditingEvents[inputKey]
        return newEditingEvents
      })

      // If the entry index is beyond the current entries length, it means we're
      // canceling the creation of a new entry, so we don't need to save
      if (eventIndex >= currentEntries.length) return

      // Remove the entry from the database
      removeSettlementTimelineYearEntry(
        selectedSettlement.timeline[yearNumber].id,
        eventIndex
      )
        .then((updatedEntries) => {
          // Update local state with the new entries for this year
          setSelectedSettlement({
            ...selectedSettlement,
            timeline: {
              ...selectedSettlement.timeline,
              [yearNumber]: {
                completed: selectedSettlement.timeline[yearNumber].completed,
                entries: updatedEntries,
                id: selectedSettlement.timeline[yearNumber].id
              }
            }
          })
          toast.success(TIMELINE_EVENT_REMOVED_MESSAGE())
        })
        .catch((err: unknown) => {
          // Revert the optimistic removal by re-adding the entry to the
          // timeline and setting it as being edited again.
          setSelectedSettlement({
            ...selectedSettlement,
            timeline: {
              ...selectedSettlement.timeline,
              [yearNumber]: {
                completed: selectedSettlement.timeline[yearNumber].completed,
                entries: [
                  ...selectedSettlement.timeline[yearNumber].entries.slice(
                    0,
                    eventIndex
                  ),
                  currentEntries[eventIndex],
                  ...selectedSettlement.timeline[yearNumber].entries.slice(
                    eventIndex
                  )
                ],
                id: selectedSettlement.timeline[yearNumber].id
              }
            }
          })
          setEditingEvents((prev) => ({
            ...prev,
            [inputKey]: true
          }))

          console.error('Timeline Event Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  /**
   * Save an Event
   *
   * Saves an event to the timeline in the database.
   *
   * @param yearNumber Year Number
   * @param entryIndex Event Entry Index
   */
  const handleSaveEvent = useCallback(
    (yearNumber: number, entryIndex: number) => {
      if (!selectedSettlement) return

      const inputKey = `${yearNumber}-${entryIndex}`
      const inputElement = inputRefs.current[inputKey]

      if (!inputElement) return

      const currentEvent = inputElement.value

      if (!currentEvent || currentEvent.trim() === '')
        return toast.warning(TIMELINE_EVENT_EMPTY_ERROR_MESSAGE())

      const newEventValue = currentEvent.trim()

      setEditingEvents((prev) => {
        const newEditingEvents = { ...prev }
        delete newEditingEvents[inputKey]
        return newEditingEvents
      })

      // Save the entry to the database
      saveSettlementTimelineYearEntry(
        selectedSettlement.timeline[yearNumber].id,
        newEventValue,
        entryIndex
      )
        .then((updatedEntries) => {
          // Update local state with the new entries for this year
          setSelectedSettlement({
            ...selectedSettlement,
            timeline: {
              ...selectedSettlement.timeline,
              [yearNumber]: {
                completed: selectedSettlement.timeline[yearNumber].completed,
                entries: updatedEntries,
                id: selectedSettlement.timeline[yearNumber].id
              }
            }
          })
          toast.success(TIMELINE_EVENT_SAVED_MESSAGE())
        })
        .catch((err: unknown) => {
          // Revert the optimistic update by setting the input back to the
          // previous value and re-adding the editing state.
          setSelectedSettlement({
            ...selectedSettlement,
            timeline: {
              ...selectedSettlement.timeline,
              [yearNumber]: {
                completed: selectedSettlement.timeline[yearNumber].completed,
                entries: selectedSettlement.timeline[yearNumber].entries.map(
                  (e: string, i: number) =>
                    i === entryIndex ? currentEvent : e
                ),
                id: selectedSettlement.timeline[yearNumber].id
              }
            }
          })
          setEditingEvents((prev) => ({
            ...prev,
            [inputKey]: true
          }))

          console.error('Timeline Event Save Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [inputRefs, selectedSettlement, setSelectedSettlement]
  )

  /**
   * Save Year Completion
   *
   * Toggles the year completion status on or off based on the completed input.
   *
   * @param yearNumber Year Number
   * @param completed Completion Status
   */
  const handleSaveYearCompletion = useCallback(
    (yearNumber: number, completed: boolean) => {
      if (!selectedSettlement) return

      // Save the entry to the database
      toggleSettlementYearCompletionStatus(
        selectedSettlement.timeline[yearNumber].id,
        yearNumber,
        completed
      )
        .then(() => {
          // Update local state with the new completion status for this year
          setSelectedSettlement({
            ...selectedSettlement,
            timeline: {
              ...selectedSettlement.timeline,
              [yearNumber]: {
                completed,
                entries: selectedSettlement.timeline[yearNumber].entries,
                id: selectedSettlement.timeline[yearNumber].id
              }
            }
          })

          toast.success(TIMELINE_YEAR_COMPLETED_MESSAGE(completed))
        })
        .catch((err: unknown) => {
          // Revert the optimistic update by toggling the completion status back
          // to its previous value.
          if (selectedSettlement) {
            setSelectedSettlement({
              ...selectedSettlement,
              timeline: {
                ...selectedSettlement.timeline,
                [yearNumber]: {
                  completed: !completed,
                  entries: selectedSettlement.timeline[yearNumber].entries,
                  id: selectedSettlement.timeline[yearNumber].id
                }
              }
            })
          }

          console.error('Timeline Year Completion Toggle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  /**
   * Add a Year to the Timeline
   */
  const handleAddYear = useCallback(() => {
    if (!selectedSettlement) return

    const yearKeys = Object.keys(selectedSettlement?.timeline ?? {}).map(
      (key) => parseInt(key, 10)
    )
    const yearNumber = yearKeys.length === 0 ? 0 : Math.max(...yearKeys) + 1

    // Add the year to the database
    addSettlementTimelineYear(selectedSettlement.id, yearNumber)
      .then((id) => {
        // Update local state with the new year
        setSelectedSettlement({
          ...selectedSettlement,
          timeline: {
            ...selectedSettlement.timeline,
            [yearNumber]: {
              completed: false,
              entries: [],
              id
            }
          }
        })
        toast.success(TIMELINE_YEAR_ADDED_MESSAGE())
      })
      .catch((err: unknown) => {
        // Revert the optimistic update by removing the year from local state.
        if (selectedSettlement) {
          const newTimeline = { ...selectedSettlement.timeline }
          delete newTimeline[yearNumber]

          setSelectedSettlement({
            ...selectedSettlement,
            timeline: newTimeline
          })
        }

        console.error('Timeline Year Add Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedSettlement, setSelectedSettlement])

  /**
   * Edit an Event in the Timeline
   *
   * Sets the specified event as being edited, which will trigger the input to
   * show for that event. Only one event can be edited at a time per year, so
   * this will also remove the editing state for any other events in the same
   * year.
   *
   * @param yearNumber Year Number
   * @param entryIndex Event Entry Index
   */
  const handleEditEventInputToggle = useCallback(
    (yearNumber: number, entryIndex: number) => {
      // Remove editing state for all other events in this year...only allow one
      // editing input per year.
      setEditingEvents((prev) => {
        const newEditingEvents = { ...prev }

        Object.keys(newEditingEvents).forEach((key) => {
          if (
            key.startsWith(`${yearNumber}-`) &&
            key !== `${yearNumber}-${entryIndex}`
          )
            delete newEditingEvents[key]
        })

        // Set the selected event as editing.
        newEditingEvents[`${yearNumber}-${entryIndex}`] = true
        return newEditingEvents
      })
    },
    [setEditingEvents]
  )

  /**
   * Handle Key Down Event
   *
   * If the enter key is pressed, save the event.
   *
   * @param e Keyboard Event
   * @param yearNumber Year Number
   * @param entryIndex Event Entry Index
   */
  const handleKeyDown = useCallback(
    (
      e: KeyboardEvent<HTMLInputElement>,
      yearNumber: number,
      entryIndex: number
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSaveEvent(yearNumber, entryIndex)
      }
    },
    [handleSaveEvent]
  )

  /**
   * Set the Input Reference for the Event Input
   *
   * @param element Input Element
   * @param yearNumber Year Number
   * @param entryIndex Event Entry Index
   */
  const setInputRef = useCallback(
    (
      element: HTMLInputElement | null,
      yearNumber: number,
      entryIndex: number
    ) => {
      inputRefs.current[`${yearNumber}-${entryIndex}`] = element
    },
    []
  )

  return (
    <Card className="border-0 w-full h-full pt-0">
      <CardContent className="flex flex-col justify-between h-full">
        {/* Timeline Content */}
        <TimelineContent
          handleAddEventInput={handleAddEventInput}
          handleEditEventInputToggle={handleEditEventInputToggle}
          handleKeyDown={handleKeyDown}
          handleRemoveEvent={handleRemoveEvent}
          handleSaveEvent={handleSaveEvent}
          handleSaveYearCompletion={handleSaveYearCompletion}
          isEventBeingEdited={isEventBeingEdited}
          setInputRef={setInputRef}
          showStoryEventIcon={showStoryEventIcon(
            selectedSettlement?.campaign_type
          )}
          timeline={selectedSettlement?.timeline ?? {}}
          usesNormalNumbering={usesNormalNumbering(
            selectedSettlement?.campaign_type
          )}
        />

        {/* Add Lantern Year Button */}
        {selectedSettlement?.campaign_type !==
          DatabaseCampaignType['Squires of the Citadel'] && (
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full"
            size="lg"
            onClick={() => startTransition(() => handleAddYear())}>
            <PlusCircleIcon className="h-4 w-4" /> Add Lantern Year
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
