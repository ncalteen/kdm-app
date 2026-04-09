'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormItem } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { LongPressCheckbox } from '@/components/ui/long-press-checkbox'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { updateSurvivor } from '@/lib/dal/survivor'
import { DatabaseSurvivorType, SurvivorType } from '@/lib/enums'
import {
  HUNT_XP_RANK_UP_ACHIEVED_MESSAGE,
  HUNT_XP_RANK_UP_MILESTONE_ADDED_MESSAGE,
  HUNT_XP_RANK_UP_MILESTONE_REMOVED_MESSAGE,
  HUNT_XP_UPDATED_MESSAGE
} from '@/lib/messages'
import { SettlementDetail, SurvivorDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { BookOpenIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hunt XP Card Properties
 */
interface HuntXPCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlemenet */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Hunt XP Card Component
 *
 * Displays the Hunt XP and rank up milestones for the survivor. Based on the
 * survivor type, the card will show different options for the Hunt XP and rank
 * up milestones.
 *
 * @param form Form
 * @returns Hunt XP Card Component
 */
export function HuntXPCard({
  local,
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: HuntXPCardProps): ReactElement {
  const { toast } = useToast(local)

  const [prevSurvivor, setPrevSurvivor] = useState(selectedSurvivor)

  const [huntXP, setHuntXP] = useState<number>(selectedSurvivor?.hunt_xp ?? 0)
  const [huntXPRankUp, setHuntXPRankUp] = useState<number[]>(
    selectedSurvivor?.hunt_xp_rank_up ?? []
  )
  const huntXPRankUpRef = useRef(huntXPRankUp)

  if (prevSurvivor !== selectedSurvivor) {
    setPrevSurvivor(selectedSurvivor)
    setHuntXP(selectedSurvivor?.hunt_xp ?? 0)
    setHuntXPRankUp(selectedSurvivor?.hunt_xp_rank_up ?? [])
  }

  // Sync ref after state updates (refs cannot be written during render)
  useEffect(() => {
    huntXPRankUpRef.current = huntXPRankUp
  }, [huntXPRankUp])

  /**
   * Update Hunt XP
   *
   * @param index Checkbox Index (0-based)
   * @param checked Whether the checkbox is checked
   */
  const updateHuntXP = useCallback(
    (index: number, checked: boolean) => {
      const oldHuntXP = huntXP
      const newHuntXP = checked ? index + 1 : index

      if (newHuntXP === oldHuntXP) return

      const oldSurvivors = [...survivors]

      setHuntXP(newHuntXP)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, hunt_xp: newHuntXP } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { hunt_xp: newHuntXP })
        .then(() =>
          checked && huntXPRankUp.includes(index)
            ? toast.success(HUNT_XP_RANK_UP_ACHIEVED_MESSAGE())
            : toast.success(HUNT_XP_UPDATED_MESSAGE())
        )
        .catch((error) => {
          console.error('Hunt XP Update Error:', error)
          setHuntXP(oldHuntXP)
          setSurvivors(oldSurvivors)
        })
    },
    [huntXP, huntXPRankUp, selectedSurvivor?.id, setSurvivors, survivors, toast]
  )

  /**
   * Handles toggling rank up milestones (via right-click or long press)
   *
   * @param index Checkbox Index (0-based)
   */
  const updateHuntXPRankUp = useCallback(
    (index: number) => {
      const currentRankUps = [...huntXPRankUpRef.current]
      const rankUpIndex = currentRankUps.indexOf(index)
      const oldSurvivors = [...survivors]

      if (rankUpIndex >= 0) {
        currentRankUps.splice(rankUpIndex, 1)
        huntXPRankUpRef.current = currentRankUps
        setHuntXPRankUp(currentRankUps)
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, hunt_xp_rank_up: currentRankUps }
              : s
          )
        )

        updateSurvivor(selectedSurvivor?.id, {
          hunt_xp_rank_up: currentRankUps
        })
          .then(() =>
            toast.success(HUNT_XP_RANK_UP_MILESTONE_REMOVED_MESSAGE())
          )
          .catch((error) => {
            console.error(
              `Error Removing Hunt XP Rank Up Milestone: ${error.message}`
            )
            huntXPRankUpRef.current = [...currentRankUps, index]
            setHuntXPRankUp([...currentRankUps, index])
            setSurvivors(oldSurvivors)
          })
      } else {
        currentRankUps.push(index)
        currentRankUps.sort((a, b) => a - b)
        huntXPRankUpRef.current = currentRankUps
        setHuntXPRankUp(currentRankUps)
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, hunt_xp_rank_up: currentRankUps }
              : s
          )
        )

        updateSurvivor(selectedSurvivor?.id, {
          hunt_xp_rank_up: currentRankUps
        })
          .then(() => toast.success(HUNT_XP_RANK_UP_MILESTONE_ADDED_MESSAGE()))
          .catch((error) => {
            console.error(
              `Error Adding Hunt XP Rank Up Milestone: ${error.message}`
            )
            const reverted = currentRankUps.filter((i) => i !== index)
            huntXPRankUpRef.current = reverted
            setHuntXPRankUp(reverted)
            setSurvivors(oldSurvivors)
          })
      }
    },
    [selectedSurvivor?.id, setSurvivors, survivors, toast]
  )

  /**
   * Check if a Checkbox Should be Disabled
   *
   * @param index Checkbox Index (0-based)
   * @returns Checkbox Should be Disabled
   */
  const isDisabled = (index: number) => index > (huntXP ?? 0)

  return (
    <Card className="p-2 border-0">
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="flex items-center">
            <FormItem className="flex-1">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-2 lg:gap-0">
                <Label className="font-bold text-left text-sm self-start lg:self-center">
                  Hunt XP
                </Label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 16 }, (_, i) => {
                    const checked = (huntXP ?? 0) > i

                    return (
                      <div key={i} className="flex">
                        <LongPressCheckbox
                          id={`hunt-xp-${i}`}
                          checked={checked}
                          disabled={isDisabled(i)}
                          onCheckedChange={(checked) =>
                            updateHuntXP(i, !!checked)
                          }
                          onLongPress={() => updateHuntXPRankUp(i)}
                          className={cn(
                            'h-4 w-4 rounded-sm',
                            !checked &&
                              huntXPRankUp.includes(i) &&
                              'border-2 border-primary',
                            !checked && i === 15 && 'border-4 border-primary'
                          )}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </FormItem>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center lg:hidden mt-1">
          Long press for rank-up
        </p>

        <hr className="hidden lg:flex my-2" />

        <div className="hidden lg:flex items-center justify-between">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-1">
              {Array.from({ length: i + 1 }, (_, j) => (
                <Checkbox
                  key={j}
                  disabled
                  className="!bg-white border border-gray-300 h-3 w-3"
                />
              ))}
              <span className="text-xs text-muted-foreground">
                {selectedSettlement?.survivor_type ===
                DatabaseSurvivorType[SurvivorType.CORE] ? (
                  <div className="flex items-center gap-1">
                    <BookOpenIcon className="h-4 w-4" /> Age
                  </div>
                ) : i === 0 ? (
                  'Adopt Philosophy'
                ) : (
                  'Rank +'
                )}
              </span>
            </div>
          ))}

          <div className="flex items-center gap-1">
            <Checkbox disabled className="border-4 border-gray-300 h-3 w-3" />
            <span className="text-xs text-muted-foreground">Retired</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
