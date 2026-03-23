'use client'

import { SurvivorCard } from '@/components/survivor/survivor-card'
import { Card, CardContent } from '@/components/ui/card'
import { SurvivorCardMode } from '@/lib/enums'
import { SettlementDetail, SurvivorDetail } from '@/lib/types'
import { ReactElement } from 'react'

/**
 * Settlement Phase Survivor Card Properties
 */
interface SettlementPhaseSurvivorCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Settlement Phase Survivor Card Component
 *
 * Displays a survivor's details during the settlement phase using the standard
 * SurvivorCard in SETTLEMENT_PHASE_CARD mode.
 *
 * @param props Settlement Phase Survivor Card Properties
 * @returns Settlement Phase Survivor Card Component
 */
export function SettlementPhaseSurvivorCard({
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: SettlementPhaseSurvivorCardProps): ReactElement {
  if (!selectedSurvivor) return <></>

  return (
    <Card className="w-full min-w-[430px] border-0 p-0">
      <CardContent className="p-0">
        <SurvivorCard
          mode={SurvivorCardMode.SETTLEMENT_PHASE_CARD}
          selectedHunt={null}
          selectedSettlement={selectedSettlement}
          selectedShowdown={null}
          selectedSurvivor={selectedSurvivor}
          setSurvivors={setSurvivors}
          survivors={survivors}
        />
      </CardContent>
    </Card>
  )
}
