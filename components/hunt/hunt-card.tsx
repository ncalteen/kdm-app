'use client'

import { ListCard } from '@/components/generic/list-card'
import { ActiveHuntCard } from '@/components/hunt/active-hunt/active-hunt-card'
import { CreateHuntCard } from '@/components/hunt/create-hunt/create-hunt-card'
import { updateSettlement } from '@/lib/dal/settlement'
import { TabType } from '@/lib/enums'
import {
  HuntDetail,
  SettlementDetail,
  ShowdownDetail,
  SurvivorDetail,
  UserSettingsDetail
} from '@/lib/types'
import { MapPinPlusIcon } from 'lucide-react'
import { ReactElement } from 'react'

/**
 * Hunt Card Properties
 */
interface HuntCardProps {
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Hunt */
  setSelectedHunt: (hunt: HuntDetail | null) => void
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
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
  /** User Settings */
  userSettings: UserSettingsDetail | null
}

/**
 * Hunt Card Component
 *
 * Displays hunt initiation interface when no active hunt or showdown exists.
 * When an active hunt exists, displays the hunt board, monster, and survivors.
 *
 * @param props Hunt Card Properties
 * @returns Hunt Card Component
 */
export function HuntCard({
  selectedHunt,
  selectedHuntMonsterIndex,
  selectedSettlement,
  selectedShowdown,
  selectedSurvivor,
  setSelectedHunt,
  setSelectedHuntMonsterIndex,
  setSelectedShowdown,
  setSelectedShowdownMonsterIndex,
  setSelectedSurvivor,
  setSelectedTab,
  setSurvivors,
  survivors,
  userSettings
}: HuntCardProps): ReactElement {
  return selectedHunt ? (
    <ActiveHuntCard
      selectedHunt={selectedHunt}
      selectedHuntMonsterIndex={selectedHuntMonsterIndex}
      selectedSettlement={selectedSettlement}
      selectedSurvivor={selectedSurvivor}
      setSelectedHunt={setSelectedHunt}
      setSelectedHuntMonsterIndex={setSelectedHuntMonsterIndex}
      setSelectedShowdown={setSelectedShowdown}
      setSelectedShowdownMonsterIndex={setSelectedShowdownMonsterIndex}
      setSelectedSurvivor={setSelectedSurvivor}
      setSelectedTab={setSelectedTab}
      setSurvivors={setSurvivors}
      survivors={survivors}
    />
  ) : (
    <div className="mt-10 flex flex-wrap items-start justify-center gap-4">
      <div className="order-2 md:order-1">
        <CreateHuntCard
          selectedSettlement={selectedSettlement}
          selectedShowdown={selectedShowdown}
          setSelectedHunt={setSelectedHunt}
          survivors={survivors}
          userSettings={userSettings}
        />
      </div>
      <div className="w-[400px] order-1 md:order-2">
        <ListCard
          icon={<MapPinPlusIcon className="h-4 w-4" />}
          initialItems={selectedSettlement?.departing_bonuses || []}
          itemName="Departure Bonus"
          placeholder="New departure bonus..."
          saveList={(updateData) =>
            updateSettlement(selectedSettlement?.id, {
              departing_bonuses: updateData
            })
          }
          selectedSettlement={selectedSettlement}
        />
      </div>
    </div>
  )
}
