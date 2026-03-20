import {
  NewNextDepartureItem,
  NextDepartureItem
} from '@/components/survivor/next-departure/next-departure-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  SURVIVOR_NEXT_DEPARTURE_BONUS_REMOVED_MESSAGE,
  SURVIVOR_NEXT_DEPARTURE_BONUS_UPDATED_MESSAGE
} from '@/lib/messages'
import { SurvivorDetail } from '@/lib/types'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Next Departure Card Properties
 */
interface NextDepartureCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Next Departure Card Component
 *
 * @param props Next Departure Card Properties
 * @returns Next Departure Card Component
 */
export function NextDepartureCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: NextDepartureCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [disabledInputs, setDisabledInputs] = useState<{
    [key: number]: boolean
  }>(
    Object.fromEntries(
      (selectedSurvivor?.next_departure ?? []).map((_, i) => [i, true])
    )
  )
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [nextDeparture, setNextDeparture] = useState<string[]>(
    selectedSurvivor?.next_departure ?? []
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id

    setDisabledInputs(
      Object.fromEntries(
        (selectedSurvivor?.next_departure ?? []).map((_, i) => [i, true])
      )
    )
    setNextDeparture(selectedSurvivor?.next_departure ?? [])
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  /**
   * Handle Next Departure Bonus Removal
   *
   * @param index Next Departure Index
   */
  const onRemove = useCallback(
    (index: number) => {
      const oldNextDeparture = [...nextDeparture]
      const updated = [...nextDeparture]
      updated.splice(index, 1)

      // Optimistic update
      setNextDeparture(updated)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, next_departure: updated } : s
        )
      )

      setDisabledInputs((prev) => {
        const next: { [key: number]: boolean } = {}

        Object.keys(prev).forEach((k) => {
          const num = parseInt(k)
          if (num < index) next[num] = prev[num]
          else if (num > index) next[num - 1] = prev[num]
        })

        return next
      })

      updateSurvivor(selectedSurvivor?.id, { next_departure: updated })
        .then(() =>
          toast.success(SURVIVOR_NEXT_DEPARTURE_BONUS_REMOVED_MESSAGE())
        )
        .catch((error) => {
          console.error('Next Departure Remove Error:', error)
          setNextDeparture(oldNextDeparture)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, next_departure: oldNextDeparture }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [nextDeparture, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Handle Next Departure Bonus Addition or Update
   *
   * @param value Next Departure Value
   * @param i Next Departure Index (Updates Only)
   */
  const onSave = useCallback(
    (value?: string, i?: number) => {
      if (!value || value.trim() === '')
        return toast.error(
          NAMELESS_OBJECT_ERROR_MESSAGE('next departure bonus')
        )

      const oldNextDeparture = [...nextDeparture]
      const updated = [...nextDeparture]

      if (i !== undefined) {
        // Updating an existing value
        updated[i] = value
        setDisabledInputs((prev) => ({
          ...prev,
          [i]: true
        }))
      } else {
        // Adding a new value
        updated.push(value)
        setDisabledInputs((prev) => ({
          ...prev,
          [updated.length - 1]: true
        }))
      }

      // Optimistic update
      setNextDeparture(updated)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, next_departure: updated } : s
        )
      )

      setIsAddingNew(false)

      updateSurvivor(selectedSurvivor?.id, { next_departure: updated })
        .then(() =>
          toast.success(
            SURVIVOR_NEXT_DEPARTURE_BONUS_UPDATED_MESSAGE(i === undefined)
          )
        )
        .catch((error) => {
          console.error('Next Departure Save Error:', error)
          setNextDeparture(oldNextDeparture)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, next_departure: oldNextDeparture }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [nextDeparture, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Handle Drag End Event
   *
   * @param event Drag End Event
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = parseInt(active.id.toString())
        const newIndex = parseInt(over.id.toString())
        const oldNextDeparture = [...nextDeparture]
        const newOrder = arrayMove(nextDeparture, oldIndex, newIndex)

        // Optimistic update
        setNextDeparture(newOrder)
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, next_departure: newOrder }
              : s
          )
        )

        setDisabledInputs((prev) => {
          const next: { [key: number]: boolean } = {}

          Object.keys(prev).forEach((k) => {
            const num = parseInt(k)
            if (num === oldIndex) next[newIndex] = prev[num]
            else if (num >= newIndex && num < oldIndex)
              next[num + 1] = prev[num]
            else if (num <= newIndex && num > oldIndex)
              next[num - 1] = prev[num]
            else next[num] = prev[num]
          })

          return next
        })

        updateSurvivor(selectedSurvivor?.id, {
          next_departure: newOrder
        }).catch((error) => {
          console.error('Next Departure Reorder Error:', error)
          setNextDeparture(oldNextDeparture)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, next_departure: oldNextDeparture }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
      }
    },
    [nextDeparture, selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0 gap-0">
      {/* Title */}
      <CardHeader className="p-0">
        <CardTitle className="p-0 text-sm flex flex-row items-center justify-between h-8">
          Next Departure
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="h-6 w-6"
              disabled={
                isAddingNew ||
                Object.values(disabledInputs).some((v) => v === false)
              }>
              <PlusIcon />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {/* Next Departure List */}
      <CardContent className="p-0">
        <div className="flex flex-col">
          {nextDeparture.length !== 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={nextDeparture.map((_, index) => index.toString())}
                strategy={verticalListSortingStrategy}>
                {nextDeparture.map((item, index) => (
                  <NextDepartureItem
                    key={index}
                    id={index.toString()}
                    index={index}
                    onRemove={onRemove}
                    isDisabled={!!disabledInputs[index]}
                    onSave={(value, i) => onSave(value, i)}
                    onEdit={(index: number) =>
                      setDisabledInputs((prev) => ({
                        ...prev,
                        [index]: false
                      }))
                    }
                    selectedSurvivor={selectedSurvivor}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
          {isAddingNew && (
            <NewNextDepartureItem
              onSave={onSave}
              onCancel={() => setIsAddingNew(false)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
