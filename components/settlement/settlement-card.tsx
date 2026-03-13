'use client'

import { ListCard } from '@/components/generic/list-card'
import { CreateSettlementCard } from '@/components/settlement/create-settlement-card'
import { NemesesCard } from '@/components/settlement/nemeses/nemeses-card'
import { OverviewCard } from '@/components/settlement/overview/overview-card'
import { QuarriesCard } from '@/components/settlement/quarries/quarries-card'
import { SquireProgressionCards } from '@/components/settlement/squires/squire-progression-cards'
import { SquireSuspicionsCard } from '@/components/settlement/squires/squire-suspicions-card'
import { SettlementSurvivorsCard } from '@/components/settlement/survivors/settlement-survivors-card'
import { TimelineCard } from '@/components/settlement/timeline/timeline-card'
import { CreateSurvivorForm } from '@/components/survivor/create-survivor-form'
import { updateSettlement } from '@/lib/dal/settlement'
import { DatabaseCampaignType, TabType } from '@/lib/enums'
import {
  HuntDetail,
  SettlementDetail,
  SettlementPhaseDetail,
  ShowdownDetail,
  SurvivorDetail
} from '@/lib/types'
import { BookOpenIcon, HousePlusIcon, MapPinPlusIcon } from 'lucide-react'
import { ReactElement } from 'react'

/**
 * Settlement Card Props
 */
interface SettlementCardProps {
  /** New Survivor Being Created */
  isCreatingNewSurvivor: boolean
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Hunt ID */
  selectedHuntId: string | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement ID */
  selectedSettlementId: string | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Selected Settlement Phase ID */
  selectedSettlementPhaseId: string | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown ID */
  selectedShowdownId: string | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
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
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Main Page Component
 *
 * @param props Settlement Form Properties
 * @returns Main Page Component
 */
export function SettlementCard({
  isCreatingNewSurvivor,
  selectedHunt,
  selectedHuntId,
  selectedHuntMonsterIndex,
  selectedSettlement,
  selectedSettlementId,
  selectedSettlementPhase,
  selectedSettlementPhaseId,
  selectedShowdown,
  selectedShowdownId,
  selectedShowdownMonsterIndex,
  selectedSurvivor,
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
  setSelectedTab,
  setSurvivors,
  survivors
}: SettlementCardProps): ReactElement {
  return (
    <>
      <OverviewCard
        selectedSettlement={selectedSettlement}
        selectedSettlementId={selectedSettlementId}
        selectedSettlementPhase={selectedSettlementPhase}
        selectedSettlementPhaseId={selectedSettlementPhaseId}
      />

      <hr className="pt-2" />

      <div className="flex flex-1 flex-col h-full">
        <div className="flex flex-col gap-2 py-2 px-2 flex-1">
          {/* Create Settlement Form */}
          {!selectedSettlementId && selectedTab !== TabType.SETTINGS && (
            <CreateSettlementCard
              setSelectedHuntId={setSelectedHuntId}
              setSelectedHuntMonsterIndex={setSelectedHuntMonsterIndex}
              setSelectedSettlementId={setSelectedSettlementId}
              setSelectedSettlementPhaseId={setSelectedSettlementPhase}
              setSelectedShowdownId={setSelectedShowdownId}
              setSelectedShowdownMonsterIndex={setSelectedShowdownMonsterIndex}
              setSelectedSurvivorId={setSelectedSurvivorId}
            />
          )}

          {/* Timeline Tab */}
          {selectedSettlementId && selectedTab === TabType.TIMELINE && (
            <div className="flex flex-col lg:flex-row gap-2">
              {/* Timeline */}
              <div className="flex-1 order-2 lg:order-1">
                <TimelineCard
                  selectedSettlement={selectedSettlement}
                  selectedSettlementId={selectedSettlementId}
                />
              </div>

              {/* Departure/Arrival Bonuses */}
              <div className="flex flex-col gap-2 order-1 lg:order-2 lg:flex-1">
                <div className="flex flex-col md:flex-row lg:flex-col gap-2">
                  <div className="flex-1">
                    <ListCard
                      icon={<MapPinPlusIcon className="h-4 w-4" />}
                      initialItems={selectedSettlement?.departing_bonuses || []}
                      itemName="Departure Bonus"
                      placeholder="New departure bonus..."
                      saveList={(updateData) =>
                        updateSettlement(selectedSettlementId, {
                          departing_bonuses: updateData
                        })
                      }
                      selectedSettlementId={selectedSettlementId}
                    />
                  </div>
                  <div className="flex-1">
                    <ListCard
                      icon={<HousePlusIcon className="h-4 w-4" />}
                      initialItems={selectedSettlement?.arrival_bonuses || []}
                      itemName="Arrival Bonus"
                      placeholder="New arrival bonus..."
                      saveList={(updateData) =>
                        updateSettlement(selectedSettlementId, {
                          arrival_bonuses: updateData
                        })
                      }
                      selectedSettlementId={selectedSettlementId}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monsters Tab */}
          {selectedSettlement && selectedTab === TabType.MONSTERS && (
            <div className="flex flex-col pl-2 gap-2">
              <div className="flex flex-col lg:flex-row gap-2">
                {/* Quarries */}
                <div className="flex-1">
                  <QuarriesCard selectedSettlementId={selectedSettlementId} />
                </div>
                {/* Nemeses */}
                <div className="flex-1">
                  <NemesesCard selectedSettlementId={selectedSettlementId} />
                </div>
              </div>

              {/* Monster Volumes (PotL and PotSun) */}
              {(selectedSettlement?.campaign_type ===
                DatabaseCampaignType['People of the Lantern'] ||
                selectedSettlement?.campaign_type ===
                  DatabaseCampaignType['People of the Sun']) && (
                <ListCard
                  icon={<BookOpenIcon className="h-4 w-4" />}
                  initialItems={selectedSettlement?.monster_volumes || []}
                  itemName="Monster Volume"
                  placeholder="New monster volume..."
                  saveList={(updateData) =>
                    updateSettlement(selectedSettlementId, {
                      monster_volumes: updateData
                    })
                  }
                  selectedSettlementId={selectedSettlementId}
                />
              )}
            </div>
          )}

          {/* Squires of the Citadel Tab */}
          {selectedSettlement &&
            selectedTab === TabType.SQUIRES &&
            selectedSettlement?.campaign_type ===
              DatabaseCampaignType['Squires of the Citadel'] && (
              <>
                <SquireSuspicionsCard
                  setSurvivors={setSurvivors}
                  survivors={survivors}
                />
                <SquireProgressionCards />
              </>
            )}

          {/* Survivors Tab */}
          <SettlementSurvivorsCard
            selectedSettlement={selectedSettlement}
            selectedSettlementId={selectedSettlementId}
            selectedSurvivorId={selectedSurvivorId}
            setIsCreatingNewSurvivor={setIsCreatingNewSurvivor}
            setSelectedSurvivorId={setSelectedSurvivorId}
            setSurvivors={setSurvivors}
            survivors={survivors}
          />
          {/* Selected Survivor */}
          {selectedSurvivor && !isCreatingNewSurvivor && (
            // <SurvivorCard
            //   mode={SurvivorCardMode.SURVIVOR_CARD}
            //   saveSelectedShowdown={saveSelectedShowdown}
            //   saveSelectedSurvivor={saveSelectedSurvivor}
            //   selectedHunt={selectedHunt}
            //   selectedSettlement={selectedSettlement}
            //   selectedShowdown={selectedShowdown}
            //   selectedSurvivor={selectedSurvivor}
            // />
            <> </>
          )}
          {/* Create Survivor */}
          {isCreatingNewSurvivor && (
            <CreateSurvivorForm
              selectedSettlement={selectedSettlement}
              selectedSettlementId={selectedSettlementId}
              setIsCreatingNewSurvivor={setIsCreatingNewSurvivor}
              setSelectedSurvivorId={setSelectedSurvivorId}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
          )}

          {/* Society Tab */}

          {/* Society Tab - Squires of the Citadel */}

          {/* Crafting Tab */}

          {/* Arc Tab */}

          {/* Notes Tab */}

          {/* Settings Tab */}

          {/* Hunt Tab */}

          {/* Showdown Tab */}

          {/* Settlement Phase Tab */}
        </div>
      </div>
    </>
  )
}
