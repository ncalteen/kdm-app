'use client'

import { MonsterCalculatedStats } from '@/components/showdown/showdown-monster/monster-calculated-stats'
import { SurvivorCalculatedStats } from '@/components/showdown/showdown-survivors/survivor-calculated-stats'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { updateShowdown } from '@/lib/dal/showdown'
import { updateShowdownMonster } from '@/lib/dal/showdown-monster'
import { updateShowdownSurvivor } from '@/lib/dal/showdown-survivor'
import { TurnType } from '@/lib/enums'
import { ERROR_MESSAGE, SHOWDOWN_TURN_MESSAGE } from '@/lib/messages'
import {
  ShowdownDetail,
  ShowdownMonsterDetail,
  ShowdownSurvivorDetail,
  SurvivorDetail
} from '@/lib/types'
import { CheckCircleIcon, SkullIcon, UsersIcon, ZapIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

/**
 * Turn Card Properties
 */
interface TurnCardProps {
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Showdown */
  setSelectedShowdown: (showdown: ShowdownDetail | null) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Turn Card Component
 *
 * Manages turn alternation between Monster and Survivor turns. During Survivor
 * turns, tracks movement and activation usage for each survivor. Uses the
 * showdown.turn column for whose turn it is, showdown_monster.ai_card_drawn
 * for monster state, and showdown_survivor.movement_used/activation_used for
 * survivor state. All updates use optimistic UI with rollback.
 *
 * @param props Turn Card Properties
 * @returns Turn Card Component
 */
export function TurnCard({
  selectedShowdown,
  selectedShowdownMonsterIndex,
  selectedSurvivor,
  setSelectedShowdown
}: TurnCardProps): ReactElement {
  const isMonsterTurn = selectedShowdown?.turn === 'MONSTER'

  const monsterIds = useMemo(
    () => Object.keys(selectedShowdown?.showdown_monsters ?? {}),
    [selectedShowdown]
  )
  const currentMonsterId = monsterIds[selectedShowdownMonsterIndex]
  const currentMonster = currentMonsterId
    ? selectedShowdown?.showdown_monsters?.[currentMonsterId]
    : undefined

  /** Find the showdown survivor record for the selected survivor */
  const selectedSurvivorRecord: ShowdownSurvivorDetail | undefined =
    useMemo(() => {
      if (!selectedShowdown?.showdown_survivors || !selectedSurvivor?.id)
        return undefined
      return Object.values(selectedShowdown.showdown_survivors).find(
        (ss) => ss.survivor_id === selectedSurvivor.id
      )
    }, [selectedShowdown, selectedSurvivor])

  /**
   * Switch Turn
   *
   * Toggles between monster and survivor turns. When switching to survivor
   * turn, resets all survivor movement_used and activation_used flags.
   */
  const switchTurn = useCallback(() => {
    if (!selectedShowdown) return

    const previousTurn = selectedShowdown.turn
    const nextTurn: 'MONSTER' | 'SURVIVOR' =
      previousTurn === 'MONSTER' ? 'SURVIVOR' : 'MONSTER'

    // Optimistic update
    let updatedSurvivors = selectedShowdown.showdown_survivors
    let updatedMonsters = selectedShowdown.showdown_monsters

    if (nextTurn === 'SURVIVOR' && updatedSurvivors) {
      // Reset survivor movement and activation flags
      const reset: { [key: string]: ShowdownSurvivorDetail } = {}
      for (const [key, ss] of Object.entries(updatedSurvivors))
        reset[key] = { ...ss, movement_used: false, activation_used: false }
      updatedSurvivors = reset
    }

    if (nextTurn === 'MONSTER' && updatedMonsters) {
      // Reset monster ai_card_drawn flags
      const reset: { [key: string]: ShowdownMonsterDetail } = {}
      for (const [key, sm] of Object.entries(updatedMonsters))
        reset[key] = { ...sm, ai_card_drawn: false }
      updatedMonsters = reset
    }

    setSelectedShowdown({
      ...selectedShowdown,
      turn: nextTurn,
      showdown_survivors: updatedSurvivors,
      showdown_monsters: updatedMonsters
    })

    // Persist turn change
    updateShowdown(selectedShowdown.id, { turn: nextTurn })
      .then(() => {
        // Reset survivor flags in DB if switching to survivor turn
        if (nextTurn === 'SURVIVOR' && selectedShowdown.showdown_survivors) {
          const resetPromises = Object.values(
            selectedShowdown.showdown_survivors
          ).map((ss) =>
            updateShowdownSurvivor(ss.id, {
              movement_used: false,
              activation_used: false
            })
          )
          Promise.all(resetPromises).catch((err: unknown) =>
            console.error('Survivor Reset Error:', err)
          )
        }

        // Reset monster ai_card_drawn in DB if switching to monster turn
        if (nextTurn === 'MONSTER' && selectedShowdown.showdown_monsters) {
          const resetPromises = Object.values(
            selectedShowdown.showdown_monsters
          ).map((sm) => updateShowdownMonster(sm.id, { ai_card_drawn: false }))
          Promise.all(resetPromises).catch((err: unknown) =>
            console.error('Monster Reset Error:', err)
          )
        }

        toast.success(
          SHOWDOWN_TURN_MESSAGE(
            nextTurn === 'MONSTER' ? TurnType.MONSTER : TurnType.SURVIVORS
          )
        )
      })
      .catch((err: unknown) => {
        // Rollback
        setSelectedShowdown({
          ...selectedShowdown,
          turn: previousTurn,
          showdown_survivors: selectedShowdown.showdown_survivors
        })
        console.error('Turn Switch Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedShowdown, setSelectedShowdown])

  /**
   * Update Survivor Turn State (movement_used or activation_used)
   */
  const updateSurvivorTurnState = useCallback(
    (
      survivorRecordId: string,
      updates: Partial<
        Pick<ShowdownSurvivorDetail, 'movement_used' | 'activation_used'>
      >
    ) => {
      if (!selectedShowdown?.showdown_survivors) return

      const ssKey = Object.entries(selectedShowdown.showdown_survivors).find(
        ([, ss]) => ss.id === survivorRecordId
      )?.[0]
      if (!ssKey) return

      const previous = selectedShowdown.showdown_survivors[ssKey]

      // Optimistic update
      setSelectedShowdown({
        ...selectedShowdown,
        showdown_survivors: {
          ...selectedShowdown.showdown_survivors,
          [ssKey]: { ...previous, ...updates }
        }
      })

      updateShowdownSurvivor(survivorRecordId, updates).catch(
        (err: unknown) => {
          // Rollback
          setSelectedShowdown({
            ...selectedShowdown,
            showdown_survivors: {
              ...selectedShowdown.showdown_survivors,
              [ssKey]: previous
            }
          })
          console.error('Survivor Turn State Update Error:', err)
          toast.error(ERROR_MESSAGE())
        }
      )
    },
    [selectedShowdown, setSelectedShowdown]
  )

  /**
   * Update Monster AI Card Drawn State
   */
  const updateMonsterAiCardDrawn = useCallback(
    (aiCardDrawn: boolean) => {
      if (
        !selectedShowdown?.showdown_monsters ||
        !currentMonsterId ||
        !currentMonster
      )
        return

      const previousValue = currentMonster.ai_card_drawn

      // Optimistic update
      setSelectedShowdown({
        ...selectedShowdown,
        showdown_monsters: {
          ...selectedShowdown.showdown_monsters,
          [currentMonsterId]: { ...currentMonster, ai_card_drawn: aiCardDrawn }
        }
      })

      updateShowdownMonster(currentMonsterId, {
        ai_card_drawn: aiCardDrawn
      }).catch((err: unknown) => {
        // Rollback
        setSelectedShowdown({
          ...selectedShowdown,
          showdown_monsters: {
            ...selectedShowdown.showdown_monsters,
            [currentMonsterId]: {
              ...currentMonster,
              ai_card_drawn: previousValue
            }
          }
        })
        console.error('AI Card Drawn Update Error:', err)
        toast.error(ERROR_MESSAGE())
      })
    },
    [selectedShowdown, currentMonsterId, currentMonster, setSelectedShowdown]
  )

  /** Get the survivor's display name */
  const survivorName = useMemo(() => {
    if (!selectedSurvivor) return 'No Survivor Selected'
    return selectedSurvivor.survivor_name ?? 'Unnamed Survivor'
  }, [selectedSurvivor])

  /** Check if selected survivor is a scout */
  const isScout = selectedSurvivorRecord?.scout ?? false

  return (
    <Card className="h-full min-w-[300px] border-2 rounded-xl pt-0 pb-2 gap-2 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="flex items-center gap-3 p-3 rounded-t-lg">
        <Avatar className="h-12 w-12 border-2 items-center justify-center">
          <AvatarFallback className="font-bold text-lg text-white bg-slate-500">
            {isMonsterTurn ? (
              <SkullIcon className="h-5 w-5" />
            ) : (
              <UsersIcon className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-lg flex items-center gap-2">
          {isMonsterTurn ? <>Monster Turn</> : <>Survivors&apos; Turn</>}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Survivor Turn Content */}
        {!isMonsterTurn && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="font-medium text-sm text-center h-6">
                {survivorName}
                {isScout && (
                  <Badge variant="outline" className="ml-2">
                    Scout
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Toggle
                    size="sm"
                    variant="outline"
                    className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:outline-green-500 data-[state=on]:*:[svg]:stroke-green-500 w-[120px]"
                    pressed={selectedSurvivorRecord?.movement_used ?? false}
                    onPressedChange={(pressed) =>
                      selectedSurvivorRecord
                        ? updateSurvivorTurnState(selectedSurvivorRecord.id, {
                            movement_used: !!pressed
                          })
                        : null
                    }>
                    <CheckCircleIcon className="h-3 w-3" />
                    Move
                  </Toggle>
                </div>
                <div className="flex items-center space-x-2">
                  <Toggle
                    size="sm"
                    variant="outline"
                    className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:outline-green-500 data-[state=on]:*:[svg]:stroke-green-500 w-[120px]"
                    pressed={selectedSurvivorRecord?.activation_used ?? false}
                    onPressedChange={(pressed) =>
                      selectedSurvivorRecord
                        ? updateSurvivorTurnState(selectedSurvivorRecord.id, {
                            activation_used: !!pressed
                          })
                        : null
                    }>
                    <CheckCircleIcon className="h-3 w-3" />
                    Activate
                  </Toggle>
                </div>
              </div>
            </div>

            <Separator />

            <SurvivorCalculatedStats
              selectedShowdown={selectedShowdown}
              selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
              selectedSurvivor={selectedSurvivor}
            />
          </div>
        )}

        {/* Monster Turn Content */}
        {isMonsterTurn && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="font-medium text-sm text-center h-6">
                Targeting: {survivorName}
                {isScout && (
                  <Badge variant="outline" className="ml-2">
                    Scout
                  </Badge>
                )}
              </div>

              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <Toggle
                    size="sm"
                    variant="outline"
                    className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:outline-green-500 data-[state=on]:*:[svg]:stroke-green-500 w-[120px]"
                    pressed={currentMonster?.ai_card_drawn ?? false}
                    onPressedChange={(pressed) =>
                      updateMonsterAiCardDrawn(!!pressed)
                    }>
                    <CheckCircleIcon className="h-3 w-3" />
                    AI Card
                  </Toggle>
                </div>
              </div>
            </div>

            <Separator />

            <MonsterCalculatedStats
              selectedShowdown={selectedShowdown}
              selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
              selectedSurvivor={selectedSurvivor}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Separator />
        <Button onClick={switchTurn} variant="secondary" className="w-full">
          {isMonsterTurn ? (
            <>
              <UsersIcon className="h-4 w-4 mr-2" />
              End Monster Turn
            </>
          ) : (
            <>
              <ZapIcon className="h-4 w-4 mr-2" />
              End Survivor Turn
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
