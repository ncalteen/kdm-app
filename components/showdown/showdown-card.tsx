'use client'

import { ActiveShowdownCard } from '@/components/showdown/active-showdown/active-showdown-card'
import { CreateShowdownCard } from '@/components/showdown/create-showdown/create-showdown-card'
import { TabType } from '@/lib/enums'
import {
  HuntDetail,
  SettlementDetail,
  ShowdownDetail,
  SurvivorDetail
} from '@/lib/types'
import { ReactElement } from 'react'

/**
 * Showdown Card Properties
 */
interface ShowdownCardProps {
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Showdown */
  setSelectedShowdown: (showdown: ShowdownDetail | null) => void
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: (survivor: SurvivorDetail | null) => void
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
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
  selectedHunt,
  selectedShowdown,
  selectedShowdownMonsterIndex,
  selectedSettlement,
  selectedSurvivor,
  setSelectedShowdown,
  setSelectedShowdownMonsterIndex,
  setSelectedSurvivor,
  setSelectedTab,
  setSurvivors,
  survivors
}: ShowdownCardProps): ReactElement {
  return selectedShowdown ? (
    <ActiveShowdownCard
      selectedShowdown={selectedShowdown}
      selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
      selectedSettlement={selectedSettlement}
      selectedSurvivor={selectedSurvivor}
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
        selectedHunt={selectedHunt}
        selectedSettlement={selectedSettlement}
        setSelectedShowdown={setSelectedShowdown}
        survivors={survivors}
      />
    </div>
  )
}
