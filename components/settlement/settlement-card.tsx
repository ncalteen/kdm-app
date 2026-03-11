'use client'

import { ListCard } from '@/components/generic/list-card'
import { CreateSettlementCard } from '@/components/settlement/create-settlement-card'
import { NemesesCard } from '@/components/settlement/nemeses/nemeses-card'
import { OverviewCard } from '@/components/settlement/overview/overview-card'
import { QuarriesCard } from '@/components/settlement/quarries/quarries-card'
import { SquireProgressionCards } from '@/components/settlement/squires/squire-progression-cards'
import { SquireSuspicionsCard } from '@/components/settlement/squires/squire-suspicions-card'
import { TimelineCard } from '@/components/settlement/timeline/timeline-card'
import {
  updateArrivalBonuses,
  updateDepartureBonuses,
  updateMonsterVolumes
} from '@/lib/dal/settlement'
import { Tables } from '@/lib/database.types'
import { CampaignType, TabType } from '@/lib/enums'
import { SurvivorDetail } from '@/lib/types'
import { BookOpenIcon, HousePlusIcon, MapPinPlusIcon } from 'lucide-react'
import { ReactElement, useState } from 'react'

/**
 * Settlement Card Props
 */
interface SettlementCardProps {
  /** New Survivor Being Created */
  isCreatingNewSurvivor: boolean
  /** Selected Hunt */
  selectedHunt: Tables<'hunt'> | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Selected Settlement */
  selectedSettlement: Tables<'settlement'> | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: Tables<'settlement_phase'> | null
  /** Selected Showdown */
  selectedShowdown: Tables<'showdown'> | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
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
  selectedHuntMonsterIndex,
  selectedSettlement,
  selectedSettlementPhase,
  selectedShowdown,
  selectedShowdownMonsterIndex,
  selectedSurvivor,
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
  const [campaignType, setCampaignType] = useState<CampaignType>(
    CampaignType.PEOPLE_OF_THE_LANTERN
  )

  return (
    <>
      <OverviewCard
        campaignType={campaignType}
        selectedSettlement={selectedSettlement}
        selectedSettlementPhase={selectedSettlementPhase}
        setCampaignType={setCampaignType}
      />

      <hr className="pt-2" />

      <div className="flex flex-1 flex-col h-full">
        <div className="flex flex-col gap-2 py-2 px-2 flex-1">
          {/* Create Settlement Form */}
          {!selectedSettlement?.id && selectedTab !== TabType.SETTINGS && (
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
          {selectedSettlement?.id && selectedTab === TabType.TIMELINE && (
            <div className="flex flex-col lg:flex-row gap-2">
              {/* Timeline */}
              <div className="flex-1 order-2 lg:order-1">
                <TimelineCard
                  campaignType={campaignType}
                  selectedSettlementId={selectedSettlement.id}
                />
              </div>

              {/* Departure/Arrival Bonuses */}
              <div className="flex flex-col gap-2 order-1 lg:order-2 lg:flex-1">
                <div className="flex flex-col md:flex-row lg:flex-col gap-2">
                  <div className="flex-1">
                    <ListCard
                      icon={<MapPinPlusIcon className="h-4 w-4" />}
                      initialItems={selectedSettlement.departing_bonuses || []}
                      itemName="Departure Bonus"
                      placeholder="New departure bonus..."
                      saveList={(updateData) =>
                        updateDepartureBonuses(
                          selectedSettlement.id,
                          updateData
                        )
                      }
                      selectedSettlementId={selectedSettlement.id}
                    />
                  </div>
                  <div className="flex-1">
                    <ListCard
                      icon={<HousePlusIcon className="h-4 w-4" />}
                      initialItems={selectedSettlement.arrival_bonuses || []}
                      itemName="Arrival Bonus"
                      placeholder="New arrival bonus..."
                      saveList={(updateData) =>
                        updateArrivalBonuses(selectedSettlement.id, updateData)
                      }
                      selectedSettlementId={selectedSettlement.id}
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
                  <QuarriesCard selectedSettlementId={selectedSettlement.id} />
                </div>
                {/* Nemeses */}
                <div className="flex-1">
                  <NemesesCard selectedSettlementId={selectedSettlement.id} />
                </div>
              </div>

              {/* Monster Volumes (PotL and PotSun) */}
              {(campaignType === CampaignType.PEOPLE_OF_THE_LANTERN ||
                campaignType === CampaignType.PEOPLE_OF_THE_SUN) && (
                <ListCard
                  icon={<BookOpenIcon className="h-4 w-4" />}
                  initialItems={selectedSettlement?.monster_volumes || []}
                  itemName="Monster Volume"
                  placeholder="New monster volume..."
                  saveList={(updateData) =>
                    updateMonsterVolumes(selectedSettlement.id, updateData)
                  }
                  selectedSettlementId={selectedSettlement.id}
                />
              )}
            </div>
          )}

          {/* Squires of the Citadel Tab */}
          {selectedSettlement &&
            selectedTab === TabType.SQUIRES &&
            campaignType === CampaignType.SQUIRES_OF_THE_CITADEL && (
              <>
                <SquireSuspicionsCard
                  setSurvivors={setSurvivors}
                  survivors={survivors}
                />
                <SquireProgressionCards />
              </>
            )}

          {/* Survivors Tab */}

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
