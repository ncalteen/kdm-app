'use client'

import { SurvivorCard } from '@/components/survivor/survivor-card'
import { Card, CardContent } from '@/components/ui/card'
import { LocalStateType } from '@/contexts/local-context'
import { SurvivorCardMode } from '@/lib/enums'
import {
  SettlementDetail,
  SurvivorDetail,
  SurvivorsStateSetter
} from '@/lib/types'
import { ReactElement } from 'react'

/**
 * Settlement Phase Survivor Card Properties
 */
interface SettlementPhaseSurvivorCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
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
  local,
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: SettlementPhaseSurvivorCardProps): ReactElement {
  if (!selectedSurvivor) return <></>

  return (
    <Card className="w-full border-0 p-0">
      <CardContent className="p-0">
        <SurvivorCard
          local={local}
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
