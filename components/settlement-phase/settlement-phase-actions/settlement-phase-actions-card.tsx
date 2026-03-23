'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { removeSettlementPhase } from '@/lib/dal/settlement-phase'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  DatabaseSettlementPhaseStep,
  SettlementPhaseStep,
  TabType
} from '@/lib/enums'
import {
  ERROR_MESSAGE,
  SETTLEMENT_PHASE_ENDED_MESSAGE,
  SURVIVORS_HEALED_MESSAGE
} from '@/lib/messages'
import {
  SettlementDetail,
  SettlementPhaseDetail,
  SurvivorDetail
} from '@/lib/types'
import { CircleXIcon, HeartPlusIcon, SwordsIcon } from 'lucide-react'
import { ReactElement, useCallback } from 'react'
import { toast } from 'sonner'

/**
 * Settlement Phase Actions Card Properties
 */
interface SettlementPhaseActionsCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (phase: SettlementPhaseDetail | null) => void
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Settlement Phase Actions Card Component
 *
 * Displays contextual action buttons based on the current settlement phase
 * step. Includes healing returning survivors, proceeding to special showdowns,
 * and ending the settlement phase.
 *
 * @param props Settlement Phase Actions Card Properties
 * @returns Settlement Phase Actions Card Component
 */
export function SettlementPhaseActionsCard({
  selectedSettlement,
  selectedSettlementPhase,
  setSelectedSettlementPhase,
  setSelectedTab,
  setSurvivors,
  survivors
}: SettlementPhaseActionsCardProps): ReactElement {
  const currentStep = selectedSettlementPhase
    ? DatabaseSettlementPhaseStep[selectedSettlementPhase.step]
    : undefined

  /**
   * Heal Returning Survivors
   *
   * Resets damage and armor for all alive returning survivors. Updates each
   * survivor individually via the DAL with optimistic updates.
   */
  const healReturningSurvivors = useCallback(() => {
    if (!selectedSettlement || !selectedSettlementPhase) return

    const returningIds = [
      ...selectedSettlementPhase.returning_survivor_ids,
      ...(selectedSettlementPhase.returning_scout_id
        ? [selectedSettlementPhase.returning_scout_id]
        : [])
    ]

    const aliveSurvivors = survivors.filter(
      (s) => returningIds.includes(s.id) && !s.dead
    )

    if (aliveSurvivors.length === 0) return

    const healUpdates: Partial<SurvivorDetail> = {
      brain_light_damage: false,
      head_armor: 0,
      head_heavy_damage: false,
      arm_armor: 0,
      arm_light_damage: false,
      arm_heavy_damage: false,
      body_armor: 0,
      body_light_damage: false,
      body_heavy_damage: false,
      waist_armor: 0,
      waist_light_damage: false,
      waist_heavy_damage: false,
      leg_armor: 0,
      leg_light_damage: false,
      leg_heavy_damage: false
    }

    // Optimistic update
    const previousSurvivors = [...survivors]
    setSurvivors(
      survivors.map((s) =>
        returningIds.includes(s.id) && !s.dead ? { ...s, ...healUpdates } : s
      )
    )

    // Persist each survivor update
    Promise.all(aliveSurvivors.map((s) => updateSurvivor(s.id, healUpdates)))
      .then(() => toast.success(SURVIVORS_HEALED_MESSAGE()))
      .catch((err: unknown) => {
        // Rollback
        setSurvivors(previousSurvivors)
        console.error('Heal Survivors Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedSettlement, selectedSettlementPhase, survivors, setSurvivors])

  /**
   * Proceed to Special Showdown
   *
   * Navigates to the showdown tab.
   */
  const proceedToSpecialShowdown = useCallback(() => {
    if (!selectedSettlement || !selectedSettlementPhase) return
    setSelectedTab(TabType.SHOWDOWN)
  }, [selectedSettlement, selectedSettlementPhase, setSelectedTab])

  /**
   * End Settlement Phase
   *
   * Deletes the settlement phase from the database and navigates to the
   * timeline tab.
   */
  const endSettlementPhase = useCallback(() => {
    if (!selectedSettlement || !selectedSettlementPhase) return

    removeSettlementPhase(selectedSettlementPhase.id)
      .then(() => {
        setSelectedSettlementPhase(null)
        setSelectedTab(TabType.TIMELINE)
        toast.success(SETTLEMENT_PHASE_ENDED_MESSAGE())
      })
      .catch((err: unknown) => {
        console.error('End Settlement Phase Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [
    selectedSettlement,
    selectedSettlementPhase,
    setSelectedSettlementPhase,
    setSelectedTab
  ])

  return (
    <Card className="p-0 py-2 border-0 flex items-center">
      <CardContent className="text-xs">
        {/* Heal Returning Survivors */}
        {(currentStep === SettlementPhaseStep.SURVIVORS_RETURN ||
          currentStep === SettlementPhaseStep.UPDATE_DEATH_COUNT) && (
          <Button
            className="h-12 w-60"
            variant="default"
            size="icon"
            onClick={healReturningSurvivors}>
            <HeartPlusIcon className="size-8" />
            Heal Returning Survivors
          </Button>
        )}

        {/* Proceed to Special Showdown */}
        {currentStep === SettlementPhaseStep.SPECIAL_SHOWDOWN && (
          <Button
            className="h-12 w-60"
            variant="default"
            size="icon"
            onClick={proceedToSpecialShowdown}>
            <SwordsIcon className="size-8" />
            Proceed to Special Showdown
          </Button>
        )}

        {/* End Settlement Phase */}
        {currentStep === SettlementPhaseStep.END_SETTLEMENT_PHASE && (
          <Button
            className="h-12 w-60"
            variant="destructive"
            size="icon"
            onClick={endSettlementPhase}>
            <CircleXIcon className="size-8" />
            End Settlement Phase
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
