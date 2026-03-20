import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormItem } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { updateSurvivor } from '@/lib/dal/survivor'
import { DatabaseSurvivorType } from '@/lib/enums'
import {
  HUNT_XP_RANK_UP_ACHIEVED_MESSAGE,
  HUNT_XP_RANK_UP_MILESTONE_ADDED_MESSAGE,
  HUNT_XP_RANK_UP_MILESTONE_REMOVED_MESSAGE,
  HUNT_XP_UPDATED_MESSAGE
} from '@/lib/messages'
import { SettlementDetail, SurvivorDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { BookOpenIcon } from 'lucide-react'
import { MouseEvent, ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Hunt XP Card Properties
 */
interface HuntXPCardProps {
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
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: HuntXPCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [huntXP, setHuntXP] = useState<number>(selectedSurvivor?.hunt_xp ?? 0)
  const [huntXPRankUp, setHuntXPRankUp] = useState<number[]>(
    selectedSurvivor?.hunt_xp_rank_up ?? []
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id
    setHuntXP(selectedSurvivor?.hunt_xp ?? 0)
    setHuntXPRankUp(selectedSurvivor?.hunt_xp_rank_up ?? [])
  }

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
          console.error(`Error Updating Hunt XP: ${error.message}`)
          setHuntXP(oldHuntXP)
          setSurvivors(oldSurvivors)
        })
    },
    [huntXP, huntXPRankUp, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Handles right-clicking on Hunt XP checkboxes to toggle rank up milestones
   *
   * @param index Checkbox Index (0-based)
   * @param event Mouse Event
   */
  const updateHuntXPRankUp = useCallback(
    (index: number, event: MouseEvent) => {
      event.preventDefault()

      const currentRankUps = [...huntXPRankUp]
      const rankUpIndex = currentRankUps.indexOf(index)
      const oldSurvivors = [...survivors]

      if (rankUpIndex >= 0) {
        currentRankUps.splice(rankUpIndex, 1)
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
            setHuntXPRankUp([...currentRankUps, index])
            setSurvivors(oldSurvivors)
          })
      } else {
        currentRankUps.push(index)
        currentRankUps.sort((a, b) => a - b)
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
            setHuntXPRankUp(currentRankUps.filter((i) => i !== index))
            setSurvivors(oldSurvivors)
          })
      }
    },
    [huntXPRankUp, selectedSurvivor?.id, setSurvivors, survivors]
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
              <div className="flex justify-between items-center">
                <Label className="font-bold text-left text-sm">Hunt XP</Label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 16 }, (_, i) => {
                    const checked = (huntXP ?? 0) > i

                    return (
                      <div key={i} className="flex">
                        <Checkbox
                          id={`hunt-xp-${i}`}
                          checked={checked}
                          disabled={isDisabled(i)}
                          onCheckedChange={(checked) =>
                            updateHuntXP(i, !!checked)
                          }
                          onContextMenu={(event) =>
                            updateHuntXPRankUp(i, event)
                          }
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
                DatabaseSurvivorType['Core'] ? (
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
