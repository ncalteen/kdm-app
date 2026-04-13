'use client'

import { ActiveShowdownCard } from '@/components/showdown/active-showdown/active-showdown-card'
import { CreateShowdownCard } from '@/components/showdown/create-showdown/create-showdown-card'
import { LocalStateType } from '@/contexts/local-context'
import { TabType } from '@/lib/enums'
import {
  HuntDetail,
  SettlementDetail,
  SettlementPhaseDetail,
  ShowdownDetail,
  ShowdownStateSetter,
  SurvivorDetail,
  SurvivorsStateSetter,
  SurvivorStateSetter,
  UserSettingsDetail
} from '@/lib/types'
import { ReactElement } from 'react'

/**
 * Showdown Card Properties
 */
interface ShowdownCardProps {
  /** Local State */
  local: LocalStateType
  /** Pending Special Showdown */
  pendingSpecialShowdown: boolean
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Pending Special Showdown */
  setPendingSpecialShowdown: (pending: boolean) => void
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (
    settlementPhase: SettlementPhaseDetail | null
  ) => void
  /** Set Selected Showdown */
  setSelectedShowdown: ShowdownStateSetter
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: SurvivorStateSetter
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
  /** Survivors */
  survivors: SurvivorDetail[]
  /** User Settings */
  userSettings: UserSettingsDetail | null
}

/**
 * Showdown Card Component
 *
 * Displays showdown initiation interface when no active showdown exists.
 * When an active showdown exists, displays the showdown monsters, survivors,
 * and turn management.
 *
 * @param props Showdown Card Properties
 * @returns Showdown Card Component
 */
export function ShowdownCard({
  local,
  pendingSpecialShowdown,
  selectedHunt,
  selectedSettlement,
  selectedSettlementPhase,
  selectedShowdown,
  selectedShowdownMonsterIndex,
  selectedSurvivor,
  setPendingSpecialShowdown,
  setSelectedSettlementPhase,
  setSelectedShowdown,
  setSelectedShowdownMonsterIndex,
  setSelectedSurvivor,
  setSelectedTab,
  setSurvivors,
  survivors,
  userSettings
}: ShowdownCardProps): ReactElement {
  return selectedShowdown ? (
    <ActiveShowdownCard
      local={local}
      selectedSettlementPhase={selectedSettlementPhase}
      selectedShowdown={selectedShowdown}
      selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
      selectedSettlement={selectedSettlement}
      selectedSurvivor={selectedSurvivor}
      setSelectedSettlementPhase={setSelectedSettlementPhase}
      setSelectedShowdown={setSelectedShowdown}
      setSelectedShowdownMonsterIndex={setSelectedShowdownMonsterIndex}
      setSelectedSurvivor={setSelectedSurvivor}
      setSelectedTab={setSelectedTab}
      setSurvivors={setSurvivors}
      survivors={survivors}
    />
  ) : (
    <div className="mt-10 flex flex-wrap items-start justify-center gap-4">
      <CreateShowdownCard
        local={local}
        pendingSpecialShowdown={pendingSpecialShowdown}
        selectedHunt={selectedHunt}
        selectedSettlement={selectedSettlement}
        selectedSettlementPhase={selectedSettlementPhase}
        setPendingSpecialShowdown={setPendingSpecialShowdown}
        setSelectedShowdown={setSelectedShowdown}
        survivors={survivors}
        userSettings={userSettings}
      />
    </div>
  )
}
