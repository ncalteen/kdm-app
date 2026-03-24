'use client'

import { TraitsMoods } from '@/components/monster/traits-moods/traits-moods'
import { ShowdownMonsterAttributes } from '@/components/showdown/showdown-monster/showdown-monster-attributes'
import { ShowdownMonsterBaseStats } from '@/components/showdown/showdown-monster/showdown-monster-base-stats'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { updateShowdownMonster } from '@/lib/dal/showdown-monster'
import {
  ERROR_MESSAGE,
  MOOD_CREATED_MESSAGE,
  MOOD_REMOVED_MESSAGE,
  MOOD_UPDATED_MESSAGE,
  NAMELESS_OBJECT_ERROR_MESSAGE,
  SHOWDOWN_MONSTER_KNOCKED_DOWN_MESSAGE,
  SHOWDOWN_NOTES_SAVED_MESSAGE,
  TRAIT_CREATED_MESSAGE,
  TRAIT_REMOVED_MESSAGE,
  TRAIT_UPDATED_MESSAGE
} from '@/lib/messages'
import { ShowdownDetail, ShowdownMonsterDetail } from '@/lib/types'
import { CheckIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Showdown Monster Card Component Properties
 */
interface ShowdownMonsterCardProps {
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Set Selected Showdown */
  setSelectedShowdown: (showdown: ShowdownDetail | null) => void
}

/**
 * Showdown Monster Card Component
 *
 * Displays updatable monster information during a showdown with optimistic
 * updates and rollback on database error.
 *
 * @param props Showdown Monster Card Properties
 * @returns Showdown Monster Card Component
 */
export function ShowdownMonsterCard({
  selectedShowdown,
  selectedShowdownMonsterIndex,
  setSelectedShowdown
}: ShowdownMonsterCardProps): ReactElement {
  const monsterIds = useMemo(
    () => Object.keys(selectedShowdown?.showdown_monsters ?? {}),
    [selectedShowdown]
  )

  const currentMonsterId = monsterIds[selectedShowdownMonsterIndex]
  const monster = currentMonsterId
    ? selectedShowdown?.showdown_monsters?.[currentMonsterId]
    : undefined

  const initialDisabledTraits = useMemo(() => {
    const next: { [key: number]: boolean } = {}
    monster?.traits?.forEach((_: string, i: number) => {
      next[i] = true
    })
    return next
  }, [monster?.traits])

  const initialDisabledMoods = useMemo(() => {
    const next: { [key: number]: boolean } = {}
    monster?.moods?.forEach((_: string, i: number) => {
      next[i] = true
    })
    return next
  }, [monster?.moods])

  const [disabledTraits, setDisabledTraits] = useState<{
    [key: number]: boolean
  }>(initialDisabledTraits)
  const [disabledMoods, setDisabledMoods] = useState<{
    [key: number]: boolean
  }>(initialDisabledMoods)
  const [isAddingTrait, setIsAddingTrait] = useState(false)
  const [isAddingMood, setIsAddingMood] = useState(false)
  const [notesDraft, setNotesDraft] = useState(monster?.notes ?? '')
  const [isNotesDirty, setIsNotesDirty] = useState(false)

  useEffect(() => {
    setNotesDraft(monster?.notes ?? '')
    setIsNotesDirty(false)
  }, [monster?.notes, currentMonsterId])
  useEffect(() => {
    setDisabledTraits(initialDisabledTraits)
  }, [initialDisabledTraits])
  useEffect(() => {
    setDisabledMoods(initialDisabledMoods)
  }, [initialDisabledMoods])

  const saveMonsterData = useCallback(
    (updateData: Partial<ShowdownMonsterDetail>, successMsg?: string) => {
      if (!selectedShowdown?.showdown_monsters || !currentMonsterId || !monster)
        return
      const previousMonster = { ...monster }

      setSelectedShowdown({
        ...selectedShowdown,
        showdown_monsters: {
          ...selectedShowdown.showdown_monsters,
          [currentMonsterId]: { ...monster, ...updateData }
        }
      })

      updateShowdownMonster(currentMonsterId, updateData)
        .then(() => {
          if (successMsg) toast.success(successMsg)
        })
        .catch((err: unknown) => {
          setSelectedShowdown({
            ...selectedShowdown,
            showdown_monsters: {
              ...selectedShowdown.showdown_monsters,
              [currentMonsterId]: previousMonster
            }
          })
          console.error('Showdown Monster Save Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedShowdown, currentMonsterId, monster, setSelectedShowdown]
  )

  const onRemoveTrait = useCallback(
    (index: number) => {
      const currentTraits = [...(monster?.traits ?? [])]
      currentTraits.splice(index, 1)
      setDisabledTraits((prev) => {
        const next: { [key: number]: boolean } = {}
        Object.keys(prev).forEach((k) => {
          const num = parseInt(k)
          if (num < index) next[num] = prev[num]
          else if (num > index) next[num - 1] = prev[num]
        })
        return next
      })
      saveMonsterData({ traits: currentTraits }, TRAIT_REMOVED_MESSAGE())
    },
    [monster?.traits, saveMonsterData]
  )

  const onSaveTrait = useCallback(
    (value?: string, i?: number) => {
      if (!value || value.trim() === '')
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('trait'))
      const updatedTraits = [...(monster?.traits ?? [])]
      if (i !== undefined) {
        updatedTraits[i] = value
        setDisabledTraits((prev) => ({ ...prev, [i]: true }))
      } else {
        updatedTraits.push(value)
        setDisabledTraits((prev) => ({
          ...prev,
          [updatedTraits.length - 1]: true
        }))
      }
      saveMonsterData(
        { traits: updatedTraits },
        i !== undefined ? TRAIT_UPDATED_MESSAGE() : TRAIT_CREATED_MESSAGE()
      )
      setIsAddingTrait(false)
    },
    [monster?.traits, saveMonsterData]
  )

  const onRemoveMood = useCallback(
    (index: number) => {
      const currentMoods = [...(monster?.moods ?? [])]
      currentMoods.splice(index, 1)
      setDisabledMoods((prev) => {
        const next: { [key: number]: boolean } = {}
        Object.keys(prev).forEach((k) => {
          const num = parseInt(k)
          if (num < index) next[num] = prev[num]
          else if (num > index) next[num - 1] = prev[num]
        })
        return next
      })
      saveMonsterData({ moods: currentMoods }, MOOD_REMOVED_MESSAGE())
    },
    [monster?.moods, saveMonsterData]
  )

  const onSaveMood = useCallback(
    (value?: string, i?: number) => {
      if (!value || value.trim() === '')
        return toast.error(NAMELESS_OBJECT_ERROR_MESSAGE('mood'))
      const updatedMoods = [...(monster?.moods ?? [])]
      if (i !== undefined) {
        updatedMoods[i] = value
        setDisabledMoods((prev) => ({ ...prev, [i]: true }))
      } else {
        updatedMoods.push(value)
        setDisabledMoods((prev) => ({
          ...prev,
          [updatedMoods.length - 1]: true
        }))
      }
      saveMonsterData(
        { moods: updatedMoods },
        i !== undefined ? MOOD_UPDATED_MESSAGE() : MOOD_CREATED_MESSAGE()
      )
      setIsAddingMood(false)
    },
    [monster?.moods, saveMonsterData]
  )

  const handleSaveNotes = useCallback(() => {
    if (!monster) return
    setIsNotesDirty(false)
    saveMonsterData({ notes: notesDraft }, SHOWDOWN_NOTES_SAVED_MESSAGE())
  }, [monster, notesDraft, saveMonsterData])

  if (!selectedShowdown || !monster) return <></>

  return (
    <Card className="w-full min-w-[430px] border-2 rounded-xl p-0 gap-0 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="flex p-3 border-b-1 bg-red-100/50 dark:bg-red-950/30">
        <div className="flex items-center gap-3 w-full py-0 pb-0 my-0">
          <div className="h-12 w-12 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center">
            <SkullIcon className="h-6 w-6 text-red-700 dark:text-red-300" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="font-semibold text-sm truncate flex gap-2 items-center">
              {monster.monster_name}
            </div>
            <Badge variant="outline" className="text-xs">
              Level {selectedShowdown.monster_level}
            </Badge>
            {selectedShowdown.showdown_type === 'SPECIAL' && (
              <Badge variant="destructive" className="text-xs ml-2">
                Special Showdown
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Checkbox
              id="knocked-down"
              checked={monster.knocked_down}
              onCheckedChange={(checked) =>
                saveMonsterData(
                  { knocked_down: !!checked },
                  SHOWDOWN_MONSTER_KNOCKED_DOWN_MESSAGE(!!checked)
                )
              }
              className="h-4 w-4"
            />
            <Label htmlFor="knocked-down" className="text-xs">
              Knocked Down
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 py-0 mt-0">
        <div className="flex flex-col lg:flex-row lg:gap-2">
          <div className="flex flex-col flex-1 max-w-[400px]">
            <ShowdownMonsterBaseStats
              monster={monster}
              saveMonsterData={saveMonsterData}
            />
            <Separator className="my-1" />
            <ShowdownMonsterAttributes
              monster={monster}
              saveMonsterData={saveMonsterData}
            />
          </div>
          <div className="hidden lg:flex lg:items-stretch">
            <Separator orientation="vertical" className="mx-2" />
          </div>
          <Separator className="my-2 lg:hidden" />
          <div className="flex flex-col flex-1">
            <TraitsMoods
              monster={monster}
              disabledTraits={disabledTraits}
              disabledMoods={disabledMoods}
              isAddingTrait={isAddingTrait}
              isAddingMood={isAddingMood}
              setIsAddingTrait={setIsAddingTrait}
              setIsAddingMood={setIsAddingMood}
              onEditTrait={(index) =>
                setDisabledTraits((prev) => ({ ...prev, [index]: false }))
              }
              onSaveTrait={onSaveTrait}
              onRemoveTrait={onRemoveTrait}
              onEditMood={(index) =>
                setDisabledMoods((prev) => ({ ...prev, [index]: false }))
              }
              onSaveMood={onSaveMood}
              onRemoveMood={onRemoveMood}
            />
            <Separator className="my-2" />
            <div className="flex flex-col gap-2 pb-2">
              <Textarea
                value={notesDraft}
                name="showdown-monster-notes"
                id="showdown-monster-notes"
                onChange={(e) => {
                  setNotesDraft(e.target.value)
                  setIsNotesDirty(e.target.value !== monster.notes)
                }}
                placeholder="Add notes about the showdown monster..."
                className="w-full resize-none"
                style={{ minHeight: '125px' }}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNotes}
                  disabled={!isNotesDirty}
                  title="Save showdown monster notes">
                  <CheckIcon className="h-4 w-4" /> Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
