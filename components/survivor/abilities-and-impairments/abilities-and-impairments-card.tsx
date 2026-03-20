import {
  AbilityImpairmentItem,
  NewAbilityImpairmentItem
} from '@/components/survivor/abilities-and-impairments/ability-impairment-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  ABILITY_IMPAIRMENT_REMOVED_MESSAGE,
  ABILITY_IMPAIRMENT_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  SURVIVOR_SKIP_NEXT_HUNT_UPDATED_MESSAGE
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
 * Abilities and Impairments Card Properties
 */
interface AbilitiesAndImpairmentsCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Abilities and Impairments Card Component
 *
 * @param props Abilities and Impairments Card Properties
 * @returns Abilities and Impairments Card Component
 */
export function AbilitiesAndImpairmentsCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: AbilitiesAndImpairmentsCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [abilitiesImpairments, setAbilitiesImpairments] = useState<string[]>(
    selectedSurvivor?.abilities_impairments ?? []
  )
  const [skipNextHunt, setSkipNextHunt] = useState<boolean>(
    selectedSurvivor?.skip_next_hunt ?? false
  )
  const [disabledInputs, setDisabledInputs] = useState<{
    [key: number]: boolean
  }>(
    Object.fromEntries(
      (selectedSurvivor?.abilities_impairments ?? []).map((_, i) => [i, true])
    )
  )
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id

    setAbilitiesImpairments(selectedSurvivor?.abilities_impairments ?? [])
    setSkipNextHunt(selectedSurvivor?.skip_next_hunt ?? false)
    setDisabledInputs(
      Object.fromEntries(
        (selectedSurvivor?.abilities_impairments ?? []).map((_, i) => [i, true])
      )
    )
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  /**
   * Handle Ability/Impairment Removal
   *
   * @param index Ability Index
   */
  const onRemove = useCallback(
    (index: number) => {
      const oldAbilitiesImpairments = [...abilitiesImpairments]
      const updated = [...abilitiesImpairments]
      updated.splice(index, 1)

      setDisabledInputs((prev) => {
        const next: { [key: number]: boolean } = {}

        Object.keys(prev).forEach((k) => {
          const num = parseInt(k)
          if (num < index) next[num] = prev[num]
          else if (num > index) next[num - 1] = prev[num]
        })

        return next
      })

      setAbilitiesImpairments(updated)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, abilities_impairments: updated }
            : s
        )
      )
      setIsAddingNew(false)

      updateSurvivor(selectedSurvivor?.id, { abilities_impairments: updated })
        .then(() => toast.success(ABILITY_IMPAIRMENT_REMOVED_MESSAGE()))
        .catch((error) => {
          console.error('Ability/Impairment Remove Error:', error)
          setAbilitiesImpairments(oldAbilitiesImpairments)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, abilities_impairments: oldAbilitiesImpairments }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [abilitiesImpairments, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Handle Ability/Impairment Save
   *
   * @param value Ability/Impairment Value
   * @param i Ability/Impairment Index (Updates Only)
   */
  const onSave = useCallback(
    (value?: string, i?: number) => {
      if (!value || value.trim() === '')
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('ability/impairment'))

      const oldAbilitiesImpairments = [...abilitiesImpairments]
      const updated = [...abilitiesImpairments]

      if (i !== undefined) {
        updated[i] = value
        setDisabledInputs((prev) => ({ ...prev, [i]: true }))
      } else {
        updated.push(value)
        setDisabledInputs((prev) => ({ ...prev, [updated.length - 1]: true }))
        setIsAddingNew(false)
      }

      setAbilitiesImpairments(updated)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, abilities_impairments: updated }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { abilities_impairments: updated })
        .then(() =>
          toast.success(ABILITY_IMPAIRMENT_UPDATED_MESSAGE(i === undefined))
        )
        .catch((error) => {
          console.error('Ability/Impairment Update Error:', error)
          setAbilitiesImpairments(oldAbilitiesImpairments)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, abilities_impairments: oldAbilitiesImpairments }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [abilitiesImpairments, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Handle Skip Next Hunt Toggle
   *
   * @param checked Checked State
   */
  const handleSkipNextHuntToggle = useCallback(
    (checked: boolean) => {
      const old = skipNextHunt
      setSkipNextHunt(checked)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, skip_next_hunt: checked } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { skip_next_hunt: checked })
        .then(() =>
          toast.success(SURVIVOR_SKIP_NEXT_HUNT_UPDATED_MESSAGE(checked))
        )
        .catch((error) => {
          console.error('Skip Next Hunt Update Error:', error)
          setSkipNextHunt(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, skip_next_hunt: old } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [skipNextHunt, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Handle Drag End Event
   *
   * @param event Drag End Event
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString())
      const newIndex = parseInt(over.id.toString())
      const oldAbilitiesImpairments = [...abilitiesImpairments]
      const newOrder = arrayMove(abilitiesImpairments, oldIndex, newIndex)

      setAbilitiesImpairments(newOrder)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, abilities_impairments: newOrder }
            : s
        )
      )
      setDisabledInputs((prev) => {
        const next: { [key: number]: boolean } = {}

        Object.keys(prev).forEach((k) => {
          const num = parseInt(k)
          if (num === oldIndex) next[newIndex] = prev[num]
          else if (num >= newIndex && num < oldIndex) next[num + 1] = prev[num]
          else if (num <= newIndex && num > oldIndex) next[num - 1] = prev[num]
          else next[num] = prev[num]
        })

        return next
      })

      updateSurvivor(selectedSurvivor?.id, {
        abilities_impairments: newOrder
      }).catch((error) => {
        console.error('Ability/Impairment Reorder Error:', error)
        setAbilitiesImpairments(oldAbilitiesImpairments)
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, abilities_impairments: oldAbilitiesImpairments }
              : s
          )
        )
        toast.error(ERROR_MESSAGE())
      })
    }
  }

  return (
    <Card className="p-2 border-0 gap-0">
      {/* Title */}
      <CardHeader className="p-0">
        <CardTitle className="p-0 text-sm flex flex-row items-center justify-between h-8">
          Abilities & Impairments
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

      {/* Abilities/Impairments List */}
      <CardContent className="p-0">
        <div className="flex flex-col">
          {abilitiesImpairments.length !== 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={abilitiesImpairments.map((_, index) => index.toString())}
                strategy={verticalListSortingStrategy}>
                {abilitiesImpairments.map((ability, index) => (
                  <AbilityImpairmentItem
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
                    value={ability}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
          {isAddingNew && (
            <NewAbilityImpairmentItem
              onSave={onSave}
              onCancel={() => setIsAddingNew(false)}
            />
          )}

          {/* Skip Next Hunt */}
          <div className="flex justify-end mt-2 pr-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="skipNextHunt"
                checked={skipNextHunt}
                onCheckedChange={(checked) =>
                  handleSkipNextHuntToggle(!!checked)
                }
              />
              <Label htmlFor="skipNextHunt" className="text-xs cursor-pointer">
                Skip Next Hunt
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
