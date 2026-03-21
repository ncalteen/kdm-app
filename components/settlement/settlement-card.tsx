import { ListCard } from '@/components/generic/list-card'
import { CollectiveCognitionRewardsCard } from '@/components/settlement/arc/collective-cognition-rewards-card'
import { CollectiveCognitionVictoriesCard } from '@/components/settlement/arc/collective-cognition-victories-card'
import { KnowledgesCard } from '@/components/settlement/arc/knowledges-card'
import { PhilosophiesCard } from '@/components/settlement/arc/philosophies-card'
import { CreateSettlementCard } from '@/components/settlement/create-settlement-card'
import { GearCard } from '@/components/settlement/gear/gear-card'
import { InnovationsCard } from '@/components/settlement/innovations/innovations-card'
import { LocationsCard } from '@/components/settlement/locations/locations-card'
import { MilestonesCard } from '@/components/settlement/milestones/milestones-card'
import { NemesesCard } from '@/components/settlement/nemeses/nemeses-card'
import { NotesCard } from '@/components/settlement/notes/notes-card'
import { OverviewCard } from '@/components/settlement/overview/overview-card'
import { PatternsCard } from '@/components/settlement/patterns/patterns-card'
import { PrinciplesCard } from '@/components/settlement/principles/principles-card'
import { QuarriesCard } from '@/components/settlement/quarries/quarries-card'
import { ResourcesCard } from '@/components/settlement/resources/resources-card'
import { SeedPatternsCard } from '@/components/settlement/seed-patterns/seed-patterns-card'
import { SettingsCard } from '@/components/settlement/settings/settings-card'
import { SquireProgressionCards } from '@/components/settlement/squires/squire-progression-cards'
import { SquireSuspicionsCard } from '@/components/settlement/squires/squire-suspicions-card'
import { SettlementSurvivorsCard } from '@/components/settlement/survivors/settlement-survivors-card'
import { TimelineCard } from '@/components/settlement/timeline/timeline-card'
import { CreateSurvivorForm } from '@/components/survivor/create-survivor-form'
import { SurvivorCard } from '@/components/survivor/survivor-card'
import { updateSettlement } from '@/lib/dal/settlement'
import {
  DatabaseCampaignType,
  DatabaseSurvivorType,
  SurvivorCardMode,
  TabType
} from '@/lib/enums'
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
  /** Is Creating New Settlement */
  isCreatingNewSettlement: boolean
  /** New Survivor Being Created */
  isCreatingNewSurvivor: boolean
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
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
  /** Selected Tab */
  selectedTab: TabType
  /** Set Is Creating New Settlement */
  setIsCreatingNewSettlement: (isCreating: boolean) => void
  /** Set New Survivor Being Created */
  setIsCreatingNewSurvivor: (isCreating: boolean) => void
  /** Set Selected Hunt */
  setSelectedHunt: (hunt: HuntDetail | null) => void
  /** Set Selected Hunt ID */
  setSelectedHuntId: (huntId: string | null) => void
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
  /** Set Selected Settlement ID */
  setSelectedSettlementId: (settlementId: string | null) => void
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (
    settlementPhase: SettlementPhaseDetail | null
  ) => void
  /** Set Selected Settlement Phase ID */
  setSelectedSettlementPhaseId: (settlementPhaseId: string | null) => void
  /** Set Selected Showdown */
  setSelectedShowdown: (showdown: ShowdownDetail | null) => void
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdownId: string | null) => void
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: (survivor: SurvivorDetail | null) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivorId: string | null) => void
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
  isCreatingNewSettlement,
  isCreatingNewSurvivor,
  selectedHunt,
  selectedHuntMonsterIndex,
  selectedSettlement,
  selectedSettlementPhase,
  selectedShowdown,
  selectedShowdownMonsterIndex,
  selectedSurvivor,
  selectedTab,
  setIsCreatingNewSettlement,
  setIsCreatingNewSurvivor,
  setSelectedHunt,
  setSelectedHuntId,
  setSelectedHuntMonsterIndex,
  setSelectedSettlement,
  setSelectedSettlementId,
  setSelectedSettlementPhase,
  setSelectedSettlementPhaseId,
  setSelectedShowdown,
  setSelectedShowdownId,
  setSelectedShowdownMonsterIndex,
  setSelectedSurvivor,
  setSelectedSurvivorId,
  setSelectedTab,
  setSurvivors,
  survivors
}: SettlementCardProps): ReactElement {
  // Settings tab is always accessible, regardless of settlement state.
  if (selectedTab === TabType.SETTINGS)
    return (
      <SettingsCard
        selectedHunt={selectedHunt}
        selectedSettlement={selectedSettlement}
        selectedShowdown={selectedShowdown}
        setSelectedHunt={setSelectedHunt}
        setSelectedHuntId={setSelectedHuntId}
        setSelectedSettlement={setSelectedSettlement}
        setSelectedSettlementId={setSelectedSettlementId}
        setSelectedShowdown={setSelectedShowdown}
        setSelectedShowdownId={setSelectedShowdownId}
        setSelectedSurvivorId={setSelectedSurvivorId}
      />
    )

  if (isCreatingNewSettlement)
    return (
      <CreateSettlementCard
        setIsCreatingNewSettlement={setIsCreatingNewSettlement}
        setSelectedHuntId={setSelectedHuntId}
        setSelectedHuntMonsterIndex={setSelectedHuntMonsterIndex}
        setSelectedSettlementId={setSelectedSettlementId}
        setSelectedSettlementPhaseId={setSelectedSettlementPhaseId}
        setSelectedShowdownId={setSelectedShowdownId}
        setSelectedShowdownMonsterIndex={setSelectedShowdownMonsterIndex}
        setSelectedSurvivorId={setSelectedSurvivorId}
      />
    )

  if (!selectedSettlement)
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-sm text-gray-500">No settlement selected</p>
      </div>
    )

  return (
    <>
      {/* Overview Card */}
      <OverviewCard
        selectedSettlement={selectedSettlement}
        selectedSettlementPhase={selectedSettlementPhase}
        setSelectedSettlement={setSelectedSettlement}
      />

      <hr className="pt-2" />

      <div className="flex flex-1 flex-col h-full">
        <div className="flex flex-col gap-2 py-2 px-2 flex-1">
          {/* Timeline Tab */}
          {selectedSettlement && selectedTab === TabType.TIMELINE && (
            <div className="flex flex-col lg:flex-row gap-2">
              {/* Timeline */}
              <div className="flex-1 order-2 lg:order-1">
                <TimelineCard
                  selectedSettlement={selectedSettlement}
                  setSelectedSettlement={setSelectedSettlement}
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
                        updateSettlement(selectedSettlement?.id, {
                          departing_bonuses: updateData
                        })
                      }
                      selectedSettlement={selectedSettlement}
                    />
                  </div>
                  <div className="flex-1">
                    <ListCard
                      icon={<HousePlusIcon className="h-4 w-4" />}
                      initialItems={selectedSettlement?.arrival_bonuses || []}
                      itemName="Arrival Bonus"
                      placeholder="New arrival bonus..."
                      saveList={(updateData) =>
                        updateSettlement(selectedSettlement?.id, {
                          arrival_bonuses: updateData
                        })
                      }
                      selectedSettlement={selectedSettlement}
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
                  <QuarriesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                </div>
                {/* Nemeses */}
                <div className="flex-1">
                  <NemesesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
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
                    updateSettlement(selectedSettlement?.id, {
                      monster_volumes: updateData
                    })
                  }
                  selectedSettlement={selectedSettlement}
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
          {selectedSettlement && selectedTab === TabType.SURVIVORS && (
            <>
              {/* Survivors Table */}
              <SettlementSurvivorsCard
                selectedSettlement={selectedSettlement}
                selectedSurvivor={selectedSurvivor}
                setIsCreatingNewSurvivor={setIsCreatingNewSurvivor}
                setSelectedSurvivor={setSelectedSurvivor}
                setSurvivors={setSurvivors}
                survivors={survivors}
              />

              {/* Selected Survivor */}
              {selectedSurvivor && !isCreatingNewSurvivor && (
                <SurvivorCard
                  mode={SurvivorCardMode.SURVIVOR_CARD}
                  selectedHunt={selectedHunt}
                  selectedSettlement={selectedSettlement}
                  selectedShowdown={selectedShowdown}
                  selectedSurvivor={selectedSurvivor}
                  setSurvivors={setSurvivors}
                  survivors={survivors}
                />
              )}

              {/* Create Survivor */}
              {isCreatingNewSurvivor && (
                <CreateSurvivorForm
                  selectedSettlement={selectedSettlement}
                  setIsCreatingNewSurvivor={setIsCreatingNewSurvivor}
                  setSelectedSurvivorId={setSelectedSurvivorId}
                  setSurvivors={setSurvivors}
                  survivors={survivors}
                />
              )}
            </>
          )}

          {/* Society Tab */}
          {selectedSettlement &&
            selectedTab === TabType.SOCIETY &&
            selectedSettlement.campaign_type !==
              DatabaseCampaignType['Squires of the Citadel'] && (
              <div className="flex flex-col gap-2 pl-2">
                <div className="flex flex-col lg:flex-row gap-2">
                  {/* Milestones */}
                  <div className="flex-1">
                    <MilestonesCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                  </div>
                  {/* Principles */}
                  <div className="flex-1">
                    <PrinciplesCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  {/* Innovations */}
                  <div className="flex-1">
                    <InnovationsCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                  </div>
                  {/* Locations */}
                  <div className="flex-1">
                    <LocationsCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                  </div>
                </div>
              </div>
            )}

          {/* Society Tab - Squires of the Citadel */}
          {selectedSettlement &&
            selectedTab === TabType.SOCIETY &&
            selectedSettlement.campaign_type ===
              DatabaseCampaignType['Squires of the Citadel'] && (
              <LocationsCard
                selectedSettlement={selectedSettlement}
                setSelectedSettlement={setSelectedSettlement}
              />
            )}

          {/* Crafting Tab */}
          {selectedSettlement && selectedTab === TabType.CRAFTING && (
            <div className="flex flex-col gap-2 pl-2">
              {/* Resources */}
              <ResourcesCard
                selectedSettlement={selectedSettlement}
                setSelectedSettlement={setSelectedSettlement}
              />
              {/* Gear */}
              <GearCard
                selectedSettlement={selectedSettlement}
                setSelectedSettlement={setSelectedSettlement}
              />

              {/* Patterns/Seed Patterns */}
              {selectedSettlement?.campaign_type !==
                DatabaseCampaignType['Squires of the Citadel'] && (
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1">
                    <SeedPatternsCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                  </div>
                  <div className="flex-1">
                    <PatternsCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Arc Tab */}
          {selectedSettlement &&
            selectedTab === TabType.ARC &&
            selectedSettlement.survivor_type ===
              DatabaseSurvivorType['Arc'] && (
              <div className="flex flex-col gap-2 pl-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {/* Collective Cognition Victories */}
                  <CollectiveCognitionVictoriesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                  {/* Collective Cognition Rewards */}
                  <CollectiveCognitionRewardsCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {/* Philosophies */}
                  <PhilosophiesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                  {/* Knowledges */}
                  <KnowledgesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                </div>
              </div>
            )}

          {/* Notes Tab */}
          {selectedSettlement && selectedTab === TabType.NOTES && (
            <NotesCard
              selectedSettlement={selectedSettlement}
              setSelectedSettlement={setSelectedSettlement}
            />
          )}

          {/* Hunt Tab */}

          {/* Showdown Tab */}

          {/* Settlement Phase Tab */}
        </div>
      </div>
    </>
  )
}
