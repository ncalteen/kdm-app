'use client'

import { HuntMonsterAttributes } from '@/components/hunt/hunt-monster/hunt-monster-attributes'
import { HuntMonsterBaseStats } from '@/components/hunt/hunt-monster/hunt-monster-base-stats'
import { TraitsMoods } from '@/components/monster/traits-moods/traits-moods'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { updateHuntMonster } from '@/lib/dal/hunt-monster'
import {
  syncMonsterMoods,
  syncMonsterSurvivorStatuses,
  syncMonsterTraits
} from '@/lib/dal/monster-trait-mood'
import { ERROR_MESSAGE } from '@/lib/messages'
import { HuntDetail, HuntMonsterDetail, HuntStateSetter } from '@/lib/types'
import { CheckIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * Hunt Monster Card Component Properties
 */
interface HuntMonsterCardProps {
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Set Selected Hunt */
  setSelectedHunt: HuntStateSetter
}

/**
 * Hunt Monster Card Component
 *
 * Displays updatable monster information during a hunt, including base stats,
 * attributes, traits, moods, and notes. Uses optimistic UI updates with
 * rollback on database error.
 *
 * @param props Hunt Monster Card Properties
 * @returns Hunt Monster Card Component
 */
export function HuntMonsterCard({
  selectedHunt,
  selectedHuntMonsterIndex,
  setSelectedHunt
}: HuntMonsterCardProps): ReactElement {
  /** Monster IDs as an ordered array */
  const monsterIds = useMemo(
    () => Object.keys(selectedHunt?.hunt_monsters ?? {}),
    [selectedHunt]
  )

  /** Currently selected monster */
  const currentMonsterId = monsterIds[selectedHuntMonsterIndex]
  const monster = currentMonsterId
    ? selectedHunt?.hunt_monsters?.[currentMonsterId]
    : undefined

  // State for managing monster notes. Tracks the last-seen monster id and
  // persisted notes so we can reset the draft when either changes without
  // using an effect (see https://react.dev/learn/you-might-not-need-an-effect).
  const [notesDraft, setNotesDraft] = useState<string>(monster?.notes ?? '')
  const [isNotesDirty, setIsNotesDirty] = useState<boolean>(false)
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

  /**
   * Save Monster Data
   *
   * Optimistically updates the monster in local state, then persists to the
   * database. Rolls back on error.
   *
   * @param updateData Partial Monster Data
   * @param successMsg Optional Success Message
   */
  const saveMonsterData = useCallback(
    (updateData: Partial<HuntMonsterDetail>, successMsg?: string) => {
      if (!selectedHunt?.hunt_monsters || !currentMonsterId || !monster) return

      const previousMonster = { ...monster }

      // Optimistic update
      setSelectedHunt({
        ...selectedHunt,
        hunt_monsters: {
          ...selectedHunt.hunt_monsters,
          [currentMonsterId]: { ...monster, ...updateData }
        }
      })

      // Split off traits/moods/survivor_statuses — those map to junction
      // tables, not columns.
      const { traits, moods, survivor_statuses, ...columnUpdates } = updateData
      const writes: Promise<unknown>[] = []
      if (Object.keys(columnUpdates).length > 0)
        writes.push(updateHuntMonster(currentMonsterId, columnUpdates))
      if (traits !== undefined)
        writes.push(
          syncMonsterTraits(
            'hunt_monster_trait',
            currentMonsterId,
            traits.map((t) => t.trait_name)
          )
        )
      if (moods !== undefined)
        writes.push(
          syncMonsterMoods(
            'hunt_monster_mood',
            currentMonsterId,
            moods.map((m) => m.mood_name)
          )
        )
      if (survivor_statuses !== undefined)
        writes.push(
          syncMonsterSurvivorStatuses(
            'hunt_monster_survivor_status',
            currentMonsterId,
            survivor_statuses.map((s) => s.survivor_status_name)
          )
        )

      Promise.all(writes)
        .then(() => {
          if (successMsg) toast.success(successMsg)
        })
        .catch((err: unknown) => {
          // Rollback
          setSelectedHunt((prev) =>
            prev?.hunt_monsters
              ? {
                  ...prev,
                  hunt_monsters: {
                    ...prev.hunt_monsters,
                    [currentMonsterId]: previousMonster
                  }
                }
              : prev
          )
          console.error('Hunt Monster Save Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedHunt, currentMonsterId, monster, setSelectedHunt]
  )

  /**
   * Handle Trait List Change
   *
   * @param traits New list of selected traits
   */
  const onTraitsChange = useCallback(
    (traits: HuntMonsterDetail['traits']) => {
      saveMonsterData({ traits })
    },
    [saveMonsterData]
  )

  /**
   * Handle Mood List Change
   *
   * @param moods New list of selected moods
   */
  const onMoodsChange = useCallback(
    (moods: HuntMonsterDetail['moods']) => {
      saveMonsterData({ moods })
    },
    [saveMonsterData]
  )

  /**
   * Handle Survivor Status List Change
   *
   * @param survivor_statuses New list of selected survivor statuses
   */
  const onSurvivorStatusesChange = useCallback(
    (survivor_statuses: HuntMonsterDetail['survivor_statuses']) => {
      saveMonsterData({ survivor_statuses })
    },
    [saveMonsterData]
  )

  /**
   * Handle Save Notes
   */
  const handleSaveNotes = useCallback(() => {
    if (!monster) return
    setIsNotesDirty(false)
    saveMonsterData({ notes: notesDraft })
  }, [monster, notesDraft, saveMonsterData])

  if (!selectedHunt || !monster) return <></>

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
              Level {selectedHunt.monster_level}
            </Badge>
          </div>

          <div className="flex items-center space-x-1">
            <Checkbox
              id="knocked-down"
              checked={monster.knocked_down}
              onCheckedChange={(checked) =>
                saveMonsterData({ knocked_down: !!checked })
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
          <div className="flex flex-col flex-1">
            <HuntMonsterBaseStats
              monster={monster}
              saveMonsterData={saveMonsterData}
            />

            <Separator className="my-1" />

            <HuntMonsterAttributes
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
                name="hunt-monster-notes"
                id="hunt-monster-notes"
                onChange={(e) => {
                  setNotesDraft(e.target.value)
                  setIsNotesDirty(e.target.value !== monster.notes)
                }}
                placeholder="Add notes about your quarry..."
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
                  title="Save hunt monster notes">
                  <CheckIcon className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
