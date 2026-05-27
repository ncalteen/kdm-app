'use client'

import { ActiveEncounterCard } from '@/components/encounter/active-encounter-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabType } from '@/lib/enums'
import {
  EncounterDetail,
  EncounterStateSetter,
  HuntDetail,
  HuntStateSetter,
  SettlementDetail,
  SettlementPhaseDetail,
  SurvivorDetail,
  SurvivorsStateSetter,
  SurvivorStateSetter
} from '@/lib/types'
import { SwordsIcon } from 'lucide-react'
import { ReactElement } from 'react'

/** Encounter Card Properties */
interface EncounterCardProps {
  /** Selected Encounter */
  selectedEncounter: EncounterDetail | null
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Encounter */
  setSelectedEncounter: EncounterStateSetter
  /** Set Selected Hunt */
  setSelectedHunt: HuntStateSetter
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (
    settlementPhase: SettlementPhaseDetail | null
  ) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: SurvivorStateSetter
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Encounter Card Component
 *
 * Displays the active encounter surface, or a small empty state when no
 * encounter is currently pausing the hunt.
 *
 * @param props Encounter Card Properties
 * @returns Encounter Card Component
 */
export function EncounterCard({
  selectedEncounter,
  selectedHunt,
  selectedSettlement,
  selectedSettlementPhase,
  selectedSurvivor,
  setSelectedEncounter,
  setSelectedHunt,
  setSelectedHuntMonsterIndex,
  setSelectedSettlementPhase,
  setSelectedSurvivor,
  setSelectedTab,
  setSurvivors,
  survivors
}: EncounterCardProps): ReactElement {
  if (selectedEncounter)
    return (
      <ActiveEncounterCard
        selectedEncounter={selectedEncounter}
        selectedHunt={selectedHunt}
        selectedSettlement={selectedSettlement}
        selectedSettlementPhase={selectedSettlementPhase}
        selectedSurvivor={selectedSurvivor}
        setSelectedEncounter={setSelectedEncounter}
        setSelectedHunt={setSelectedHunt}
        setSelectedHuntMonsterIndex={setSelectedHuntMonsterIndex}
        setSelectedSettlementPhase={setSelectedSettlementPhase}
        setSelectedSurvivor={setSelectedSurvivor}
        setSelectedTab={setSelectedTab}
        setSurvivors={setSurvivors}
        survivors={survivors}
      />
    )

  return (
    <Card className="mx-auto mt-10 w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SwordsIcon className="h-5 w-5" />
          No Encounter
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Encounters can only be initiated during an active hunt.
      </CardContent>
    </Card>
  )
}
