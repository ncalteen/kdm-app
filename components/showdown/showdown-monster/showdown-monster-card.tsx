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
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import {
  syncMonsterMoods,
  syncMonsterSurvivorStatuses,
  syncMonsterTraits
} from '@/lib/dal/monster-trait-mood'
import { updateShowdownMonster } from '@/lib/dal/showdown-monster'
import {
  ERROR_MESSAGE,
  MOOD_REMOVED_MESSAGE,
  MOOD_UPDATED_MESSAGE,
  SHOWDOWN_MONSTER_KNOCKED_DOWN_MESSAGE,
  SHOWDOWN_NOTES_SAVED_MESSAGE,
  SURVIVOR_STATUS_REMOVED_MESSAGE,
  SURVIVOR_STATUS_UPDATED_MESSAGE,
  TRAIT_REMOVED_MESSAGE,
  TRAIT_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  ShowdownDetail,
  ShowdownMonsterDetail,
  ShowdownStateSetter
} from '@/lib/types'
import { CheckIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Showdown Monster Card Component Properties
 */
interface ShowdownMonsterCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Set Selected Showdown */
  setSelectedShowdown: ShowdownStateSetter
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
  local,
  selectedShowdown,
  selectedShowdownMonsterIndex,
  setSelectedShowdown
}: ShowdownMonsterCardProps): ReactElement {
  const { toast } = useToast(local)

  const monsterIds = useMemo(
    () => Object.keys(selectedShowdown?.showdown_monsters ?? {}),
    [selectedShowdown]
  )

  const currentMonsterId = monsterIds[selectedShowdownMonsterIndex]
  const monster = currentMonsterId
    ? selectedShowdown?.showdown_monsters?.[currentMonsterId]
    : undefined

  // State for managing monster notes. Tracks the last-seen monster id and
  // persisted notes so we can reset the draft when either changes without
  // using an effect (see https://react.dev/learn/you-might-not-need-an-effect).
  const [notesDraft, setNotesDraft] = useState(monster?.notes ?? '')
  const [isNotesDirty, setIsNotesDirty] = useState(false)
  const [lastMonsterId, setLastMonsterId] = useState<string | undefined>(
    currentMonsterId
  )
  const [lastPersistedNotes, setLastPersistedNotes] = useState<string>(
    monster?.notes ?? ''
  )

  if (
    lastMonsterId !== currentMonsterId ||
    lastPersistedNotes !== (monster?.notes ?? '')
  ) {
    setLastMonsterId(currentMonsterId)
    setLastPersistedNotes(monster?.notes ?? '')
    setNotesDraft(monster?.notes ?? '')
    setIsNotesDirty(false)
  }

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

      // Split off traits/moods/survivor_statuses — those map to junction
      // tables, not columns.
      const { traits, moods, survivor_statuses, ...columnUpdates } = updateData
      const writes: Promise<unknown>[] = []
      if (Object.keys(columnUpdates).length > 0)
        writes.push(updateShowdownMonster(currentMonsterId, columnUpdates))
      if (traits !== undefined)
        writes.push(
          syncMonsterTraits(
            'showdown_monster_trait',
            currentMonsterId,
            traits.map((t) => t.trait_name)
          )
        )
      if (moods !== undefined)
        writes.push(
          syncMonsterMoods(
            'showdown_monster_mood',
            currentMonsterId,
            moods.map((m) => m.mood_name)
          )
        )
      if (survivor_statuses !== undefined)
        writes.push(
          syncMonsterSurvivorStatuses(
            'showdown_monster_survivor_status',
            currentMonsterId,
            survivor_statuses.map((s) => s.survivor_status_name)
          )
        )

      Promise.all(writes)
        .then(() => {
          if (successMsg) toast.success(successMsg)
        })
        .catch((err: unknown) => {
          setSelectedShowdown((prev) =>
            prev?.showdown_monsters
              ? {
                  ...prev,
                  showdown_monsters: {
                    ...prev.showdown_monsters,
                    [currentMonsterId]: previousMonster
                  }
                }
              : prev
          )
          console.error('Showdown Monster Save Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedShowdown, currentMonsterId, monster, setSelectedShowdown, toast]
  )

  const onTraitsChange = useCallback(
    (traits: ShowdownMonsterDetail['traits']) => {
      const prevTraits = monster?.traits ?? []
      const successMsg =
        traits.length > prevTraits.length
          ? TRAIT_UPDATED_MESSAGE()
          : TRAIT_REMOVED_MESSAGE()
      saveMonsterData({ traits }, successMsg)
    },
    [monster?.traits, saveMonsterData]
  )

  const onMoodsChange = useCallback(
    (moods: ShowdownMonsterDetail['moods']) => {
      const prevMoods = monster?.moods ?? []
      const successMsg =
        moods.length > prevMoods.length
          ? MOOD_UPDATED_MESSAGE()
          : MOOD_REMOVED_MESSAGE()
      saveMonsterData({ moods }, successMsg)
    },
    [monster?.moods, saveMonsterData]
  )

  const onSurvivorStatusesChange = useCallback(
    (survivor_statuses: ShowdownMonsterDetail['survivor_statuses']) => {
      const prevStatuses = monster?.survivor_statuses ?? []
      const successMsg =
        survivor_statuses.length > prevStatuses.length
          ? SURVIVOR_STATUS_UPDATED_MESSAGE()
          : SURVIVOR_STATUS_REMOVED_MESSAGE()
      saveMonsterData({ survivor_statuses }, successMsg)
    },
    [monster?.survivor_statuses, saveMonsterData]
  )

  const handleSaveNotes = useCallback(() => {
    if (!monster) return
    setIsNotesDirty(false)
    saveMonsterData({ notes: notesDraft }, SHOWDOWN_NOTES_SAVED_MESSAGE())
  }, [monster, notesDraft, saveMonsterData])

  if (!selectedShowdown || !monster) return <></>

  return (
    <Card className="w-full border-2 rounded-xl p-0 gap-0 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="flex p-3 border-b bg-red-100/50 dark:bg-red-950/30">
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
          <div className="flex flex-col flex-1 max-w-100">
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
              onTraitsChange={onTraitsChange}
              onMoodsChange={onMoodsChange}
              onSurvivorStatusesChange={onSurvivorStatusesChange}
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
