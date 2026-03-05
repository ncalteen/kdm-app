'use client'

import { OverviewCard } from '@/components/settlement/overview/overview-card'
import { TabType } from '@/lib/enums'
import { ReactElement } from 'react'

/**
 * Settlement Card Props
 */
interface SettlementCardProps {
  /** New Survivor Being Created */
  isCreatingNewSurvivor: boolean
  /** Selected Hunt ID */
  selectedHuntId: string | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Selected Settlement ID */
  selectedSettlementId: string | null
  /** Selected Settlement Phase ID */
  selectedSettlementPhaseId: string | null
  /** Selected Showdown ID */
  selectedShowdownId: string | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Survivor ID */
  selectedSurvivorId: string | null
  /** Selected Tab */
  selectedTab: TabType
  /** Set New Survivor Being Created */
  setIsCreatingNewSurvivor: (isCreating: boolean) => void
  /** Set Selected Hunt ID */
  setSelectedHuntId: (hunt: string | null) => void
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
  /** Set Selected Settlement ID */
  setSelectedSettlementId: (settlement: string | null) => void
  /** Set Selected Settlement Phase ID */
  setSelectedSettlementPhase: (settlementPhase: string | null) => void
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdown: string | null) => void
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivor: string | null) => void
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void
}

/**
 * Main Page Component
 *
 * @param props Settlement Form Properties
 * @returns Main Page Component
 */
export function SettlementCard({
  isCreatingNewSurvivor,
  selectedHuntId,
  selectedHuntMonsterIndex,
  selectedSettlementId,
  selectedSettlementPhaseId,
  selectedShowdownId,
  selectedShowdownMonsterIndex,
  selectedSurvivorId,
  selectedTab,
  setIsCreatingNewSurvivor,
  setSelectedHuntId,
  setSelectedHuntMonsterIndex,
  setSelectedSettlementId,
  setSelectedSettlementPhase,
  setSelectedShowdownId,
  setSelectedShowdownMonsterIndex,
  setSelectedSurvivorId,
  setSelectedTab
}: SettlementCardProps): ReactElement {
  return (
    <>
      <OverviewCard
        selectedSettlementId={selectedSettlementId}
        selectedSettlementPhaseId={selectedSettlementPhaseId}
      />

      <hr className="pt-2" />
    </>
  )
}
