'use client'

import {
  NewOncePerLifetimeItem,
  OncePerLifetimeItem
} from '@/components/survivor/once-per-lifetime/once-per-lifetime-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  SURVIVOR_LIFETIME_REROLL_USED_UPDATED_MESSAGE,
  SURVIVOR_ONCE_PER_LIFETIME_EVENT_REMOVED_MESSAGE,
  SURVIVOR_ONCE_PER_LIFETIME_EVENT_UPDATED_MESSAGE
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
 * Once Per Lifetime Card Properties
 */
interface OncePerLifetimeCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Once Per Lifetime Card Component
 *
 * @param props Once Per Lifetime Card Properties
 * @returns Once Per Lifetime Card Component
 */
export function OncePerLifetimeCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: OncePerLifetimeCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [disabledInputs, setDisabledInputs] = useState<{
    [key: number]: boolean
  }>(
    Object.fromEntries(
      (selectedSurvivor?.once_per_lifetime ?? []).map((_, i) => [i, true])
    )
  )
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [oncePerLifetime, setOncePerLifetime] = useState<string[]>(
    selectedSurvivor?.once_per_lifetime ?? []
  )
  const [rerollUsed, setRerollUsed] = useState<boolean>(
    selectedSurvivor?.reroll_used ?? false
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id

    setDisabledInputs(
      Object.fromEntries(
        (selectedSurvivor?.once_per_lifetime ?? []).map((_, i) => [i, true])
      )
    )
    setOncePerLifetime(selectedSurvivor?.once_per_lifetime ?? [])
    setRerollUsed(selectedSurvivor?.reroll_used ?? false)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  /**
   * Handle Removal of an Event
   *
   * @param index Event Index
   */
  const onRemove = useCallback(
    (index: number) => {
      const oldOncePerLifetime = [...oncePerLifetime]
      const updated = [...oncePerLifetime]
      updated.splice(index, 1)

      setOncePerLifetime(updated)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, once_per_lifetime: updated }
            : s
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

      updateSurvivor(selectedSurvivor?.id, { once_per_lifetime: updated })
        .then(() =>
          toast.success(SURVIVOR_ONCE_PER_LIFETIME_EVENT_REMOVED_MESSAGE())
        )
        .catch((error) => {
          console.error('Once Per Lifetime Remove Error:', error)
          setOncePerLifetime(oldOncePerLifetime)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, once_per_lifetime: oldOncePerLifetime }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })

      setIsAddingNew(false)
    },
    [oncePerLifetime, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Handle Saving of an Event
   *
   * Used for both new and updated events.
   *
   * @param value Event Value
   * @param i Event Index (Updates Only)
   */
  const onSave = useCallback(
    (value?: string, i?: number) => {
      if (!value || value.trim() === '')
        return toast.error(
          NAMELESS_OBJECT_ERROR_MESSAGE('once per lifetime event')
        )

      const oldOncePerLifetime = [...oncePerLifetime]
      const updated = [...oncePerLifetime]

      if (i !== undefined) {
        updated[i] = value
        setDisabledInputs((prev) => ({
          ...prev,
          [i]: true
        }))
      } else {
        updated.push(value)
        setDisabledInputs((prev) => ({
          ...prev,
          [updated.length - 1]: true
        }))
      }

      setOncePerLifetime(updated)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, once_per_lifetime: updated }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { once_per_lifetime: updated })
        .then(() =>
          toast.success(SURVIVOR_ONCE_PER_LIFETIME_EVENT_UPDATED_MESSAGE())
        )
        .catch((error) => {
          console.error('Once Per Lifetime Save Error:', error)
          setOncePerLifetime(oldOncePerLifetime)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, once_per_lifetime: oldOncePerLifetime }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })

      setIsAddingNew(false)
    },
    [oncePerLifetime, selectedSurvivor?.id, setSurvivors, survivors]
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
        const oldOncePerLifetime = [...oncePerLifetime]
        const newOrder = arrayMove(oncePerLifetime, oldIndex, newIndex)

        setOncePerLifetime(newOrder)
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, once_per_lifetime: newOrder }
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
          once_per_lifetime: newOrder
        }).catch((error) => {
          console.error('Once Per Lifetime Reorder Error:', error)
          setOncePerLifetime(oldOncePerLifetime)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, once_per_lifetime: oldOncePerLifetime }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
      }
    },
    [oncePerLifetime, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Handle Reroll Used Toggle
   *
   * @param checked Whether Reroll Used is Checked
   */
  const handleRerollUsedToggle = useCallback(
    (checked: boolean) => {
      const old = rerollUsed

      setRerollUsed(checked)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, reroll_used: checked } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { reroll_used: checked })
        .then(() =>
          toast.success(SURVIVOR_LIFETIME_REROLL_USED_UPDATED_MESSAGE(checked))
        )
        .catch((error) => {
          console.error('Reroll Used Update Error:', error)
          setRerollUsed(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, reroll_used: old } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [rerollUsed, selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0 gap-0">
      {/* Title */}
      <CardHeader className="p-0">
        <CardTitle className="p-0 text-sm flex flex-row items-center justify-between h-8">
          Once Per Lifetime
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

      {/* Once Per Lifetime List */}
      <CardContent className="p-0">
        <div className="flex flex-col">
          {oncePerLifetime.length !== 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={oncePerLifetime.map((_, index) => index.toString())}
                strategy={verticalListSortingStrategy}>
                {oncePerLifetime.map((event, index) => (
                  <OncePerLifetimeItem
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
                    value={event}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
          {isAddingNew && (
            <NewOncePerLifetimeItem
              onSave={onSave}
              onCancel={() => setIsAddingNew(false)}
            />
          )}
        </div>

        {/* Reroll Used - Bottom Right */}
        <div className="flex justify-end mt-2 pr-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="rerollUsed"
              checked={rerollUsed}
              onCheckedChange={handleRerollUsedToggle}
            />
            <Label htmlFor="rerollUsed" className="text-xs cursor-pointer">
              Reroll Used
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
