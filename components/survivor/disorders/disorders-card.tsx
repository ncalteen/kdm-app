'use client'

import { SelectDisorder } from '@/components/menu/select-disorder'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDisorders } from '@/lib/dal/disorder'
import {
  addSurvivorDisorder,
  removeSurvivorDisorder
} from '@/lib/dal/survivor-disorder'
import {
  ERROR_MESSAGE,
  SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE,
  SURVIVOR_DISORDER_REMOVED_MESSAGE,
  SURVIVOR_DISORDER_UPDATED_MESSAGE
} from '@/lib/messages'
import { DisorderDetail, SurvivorDetail } from '@/lib/types'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const MAX_DISORDERS = 3

/**
 * Disorders Card Properties
 */
interface DisordersCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Disorders Card Component
 *
 * @param props Disorders Card Properties
 * @returns Disorders Card Component
 */
export function DisordersCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: DisordersCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [availableDisorders, setAvailableDisorders] = useState<{
    [key: string]: DisorderDetail
  }>({})
  const [disorders, setDisorders] = useState<DisorderDetail[]>(
    selectedSurvivor?.disorders ?? []
  )
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id
    setDisorders(selectedSurvivor?.disorders ?? [])
  }

  useEffect(() => {
    getDisorders()
      .then((disorders) => setAvailableDisorders(disorders))
      .catch((error) => {
        console.error('Disorders Fetch Error:', error)
      })
  }, [])

  /**
   * Handle Add Disorder
   *
   * @param disorderId Disorder ID
   */
  const handleAdd = useCallback(
    (disorderId: string) => {
      if (!selectedSurvivor?.id || !disorderId) {
        setIsAddingNew(false)
        return
      }

      if (disorders.length >= MAX_DISORDERS) {
        toast.error(SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE())
        setIsAddingNew(false)
        return
      }

      const detail = availableDisorders[disorderId]
      if (!detail) {
        setIsAddingNew(false)
        return
      }

      const optimisticItem: DisorderDetail = {
        id: disorderId,
        disorder_name: detail.disorder_name
      }
      const oldDisorders = [...disorders]

      setDisorders([...disorders, optimisticItem])
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor.id
            ? { ...s, disorders: [...s.disorders, optimisticItem] }
            : s
        )
      )
      setIsAddingNew(false)

      addSurvivorDisorder(selectedSurvivor.id, disorderId)
        .then(() => toast.success(SURVIVOR_DISORDER_UPDATED_MESSAGE(true)))
        .catch((error: unknown) => {
          setDisorders(oldDisorders)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, disorders: oldDisorders }
                : s
            )
          )

          console.error('Disorder Add Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [availableDisorders, disorders, selectedSurvivor, setSurvivors, survivors]
  )

  /**
   * Handle Remove Disorder
   *
   * @param index Disorder Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSurvivor?.id) return

      const removed = disorders[index]
      if (!removed) return

      const oldDisorders = [...disorders]
      const updated = disorders.filter((_, i) => i !== index)

      setDisorders(updated)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor.id ? { ...s, disorders: updated } : s
        )
      )

      removeSurvivorDisorder(selectedSurvivor.id, removed.id)
        .then(() => toast.success(SURVIVOR_DISORDER_REMOVED_MESSAGE()))
        .catch((error: unknown) => {
          setDisorders(oldDisorders)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, disorders: oldDisorders }
                : s
            )
          )

          console.error('Disorder Remove Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [disorders, selectedSurvivor, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0 gap-0">
      <CardHeader className="p-0">
        <CardTitle className="p-0 text-sm flex flex-row items-center justify-between h-8">
          Disorders
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="h-6 w-6"
              disabled={isAddingNew || disorders.length >= MAX_DISORDERS}>
              <PlusIcon />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col">
          {disorders.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex items-center gap-2">
              <span className="text-sm ml-1 flex-grow">
                {item.disorder_name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => handleRemove(index)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {isAddingNew && (
            <div className="flex items-center gap-2">
              <SelectDisorder
                disorders={availableDisorders}
                onChange={handleAdd}
                excludeIds={disorders.map((d) => d.id)}
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => setIsAddingNew(false)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
