'use client'

import { ListCard } from '@/components/generic/list-card'
import { SettlementPhaseActionsCard } from '@/components/settlement-phase/settlement-phase-actions/settlement-phase-actions-card'
import { SettlementPhaseBoard } from '@/components/settlement-phase/settlement-phase-board/settlement-phase-board'
import { SettlementPhaseResultsCard } from '@/components/settlement-phase/settlement-phase-results/settlement-phase-results-card'
import { SettlementPhaseSurvivorsCard } from '@/components/settlement-phase/settlement-phase-survivors/settlement-phase-survivors-card'
import { CollectiveCognitionRewardsCard } from '@/components/settlement/arc/collective-cognition-rewards-card'
import { CollectiveCognitionVictoriesCard } from '@/components/settlement/arc/collective-cognition-victories-card'
import { KnowledgesCard } from '@/components/settlement/arc/knowledges-card'
import { PhilosophiesCard } from '@/components/settlement/arc/philosophies-card'
import { GearCard } from '@/components/settlement/gear/gear-card'
import { InnovationsCard } from '@/components/settlement/innovations/innovations-card'
import { LocationsCard } from '@/components/settlement/locations/locations-card'
import { MilestonesCard } from '@/components/settlement/milestones/milestones-card'
import { PatternsCard } from '@/components/settlement/patterns/patterns-card'
import { PrinciplesCard } from '@/components/settlement/principles/principles-card'
import { ResourcesCard } from '@/components/settlement/resources/resources-card'
import { SeedPatternsCard } from '@/components/settlement/seed-patterns/seed-patterns-card'
import { TimelineCard } from '@/components/settlement/timeline/timeline-card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { settlementPhaseSteps } from '@/lib/common'
import { updateSettlement } from '@/lib/dal/settlement'
import { updateSettlementPhase } from '@/lib/dal/settlement-phase'
import {
  DatabaseCampaignType,
  DatabaseSettlementPhaseStep,
  DatabaseSurvivorType,
  SettlementPhaseStep,
  TabType
} from '@/lib/enums'
import {
  ERROR_MESSAGE,
  SETTLEMENT_PHASE_STEP_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  SettlementDetail,
  SettlementPhaseDetail,
  SurvivorDetail
} from '@/lib/types'
import { CircleOffIcon, HousePlusIcon, MapPinPlusIcon } from 'lucide-react'
import { ReactElement, useCallback } from 'react'
import { toast } from 'sonner'

/**
 * Settlement Phase Card Properties
 */
interface SettlementPhaseCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (phase: SettlementPhaseDetail | null) => void
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
 * Settlement Phase Card Component
 *
 * Displays settlement phase management interface including the phase board,
 * action buttons, and contextual settlement sub-components based on the
 * current step.
 *
 * @param props Settlement Phase Card Properties
 * @returns Settlement Phase Card Component
 */
export function SettlementPhaseCard({
  selectedSettlement,
  selectedSettlementPhase,
  selectedSurvivor,
  setSelectedSettlement,
  setSelectedSettlementPhase,
  setSelectedSurvivor,
  setSelectedTab,
  setSurvivors,
  survivors
}: SettlementPhaseCardProps): ReactElement {
  /** Current step as display-friendly enum value */
  const currentStep = selectedSettlementPhase
    ? DatabaseSettlementPhaseStep[selectedSettlementPhase.step]
    : undefined

  /**
   * Handle Position Update
   *
   * Updates the settlement phase step with optimistic UI and rollback.
   *
   * @param tokenPosition Token Position (index into settlementPhaseSteps)
   */
  const handlePositionUpdate = useCallback(
    (tokenPosition: number) => {
      if (!selectedSettlementPhase) return

      const newStep = settlementPhaseSteps[tokenPosition]
      if (!newStep) return

      const previousStep = selectedSettlementPhase.step

      // Map display step back to DB enum value
      const dbStepValue = Object.entries(DatabaseSettlementPhaseStep).find(
        ([, displayStep]) => displayStep === newStep.step
      )?.[0]

      if (!dbStepValue) return

      // Optimistic update
      setSelectedSettlementPhase({
        ...selectedSettlementPhase,
        step: dbStepValue as SettlementPhaseDetail['step']
      })

      updateSettlementPhase(selectedSettlementPhase.id, {
        step: dbStepValue as SettlementPhaseDetail['step']
      })
        .then(() =>
          toast.success(SETTLEMENT_PHASE_STEP_UPDATED_MESSAGE(newStep.step))
        )
        .catch((err: unknown) => {
          // Rollback
          setSelectedSettlementPhase({
            ...selectedSettlementPhase,
            step: previousStep
          })
          console.error('Settlement Phase Step Update Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlementPhase, setSelectedSettlementPhase]
  )

  if (!selectedSettlementPhase)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleOffIcon />
          </EmptyMedia>
          <EmptyTitle>No Settlement Phase in Progress</EmptyTitle>
          <EmptyDescription>
            The settlement phase can only be started by returning from a
            showdown.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Settlement Phase Results */}
      <SettlementPhaseResultsCard
        selectedSettlementPhase={selectedSettlementPhase}
        survivors={survivors}
      />

      {/* Settlement Phase Board */}
      <SettlementPhaseBoard
        onPositionUpdate={handlePositionUpdate}
        selectedSettlementPhase={selectedSettlementPhase}
      />

      {/* Actions Card */}
      {[
        SettlementPhaseStep.SURVIVORS_RETURN,
        SettlementPhaseStep.UPDATE_DEATH_COUNT,
        SettlementPhaseStep.SPECIAL_SHOWDOWN,
        SettlementPhaseStep.END_SETTLEMENT_PHASE
      ].includes(currentStep as SettlementPhaseStep) && (
        <SettlementPhaseActionsCard
          selectedSettlement={selectedSettlement}
          selectedSettlementPhase={selectedSettlementPhase}
          setSelectedSettlementPhase={setSelectedSettlementPhase}
          setSelectedTab={setSelectedTab}
          setSurvivors={setSurvivors}
          survivors={survivors}
        />
      )}

      {/* Set Up the Settlement */}
      {currentStep === SettlementPhaseStep.SET_UP_SETTLEMENT && (
        <div className="text-center text-sm text-muted-foreground">
          Set up the settlement phase board, location cards, innovation decks,
          and so on.
        </div>
      )}

      {/* Survivors Return */}
      {currentStep === SettlementPhaseStep.SURVIVORS_RETURN && (
        <>
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

          <PrinciplesCard
            selectedSettlement={selectedSettlement}
            setSelectedSettlement={setSelectedSettlement}
          />
        </>
      )}

      {/* Gain Endeavors */}
      {currentStep === SettlementPhaseStep.GAIN_ENDEAVORS && (
        <PrinciplesCard
          selectedSettlement={selectedSettlement}
          setSelectedSettlement={setSelectedSettlement}
        />
      )}

      {/* Update Timeline */}
      {currentStep === SettlementPhaseStep.UPDATE_TIMELINE && (
        <TimelineCard
          selectedSettlement={selectedSettlement}
          setSelectedSettlement={setSelectedSettlement}
        />
      )}

      {/* Update Death Count */}
      {currentStep === SettlementPhaseStep.UPDATE_DEATH_COUNT && (
        <div className="text-center text-sm text-muted-foreground">
          Death count is updated automatically as survivor data is updated.
        </div>
      )}

      {/* Check Milestones */}
      {currentStep === SettlementPhaseStep.CHECK_MILESTONES && (
        <MilestonesCard
          selectedSettlement={selectedSettlement}
          setSelectedSettlement={setSelectedSettlement}
        />
      )}

      {/* Develop */}
      {currentStep === SettlementPhaseStep.DEVELOP && (
        <div className="flex flex-col gap-2 pl-2">
          <Tabs defaultValue="innovate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="innovate">Innovate</TabsTrigger>
              <TabsTrigger value="craft">Craft</TabsTrigger>
              {selectedSettlement?.survivor_type ===
                DatabaseSurvivorType['Arc'] && (
                <TabsTrigger value="ponder">Ponder</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="innovate" className="mt-2">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <InnovationsCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                  <LocationsCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="craft" className="mt-2">
              <div className="flex flex-col gap-2">
                <ResourcesCard
                  selectedSettlement={selectedSettlement}
                  setSelectedSettlement={setSelectedSettlement}
                />
                <GearCard
                  selectedSettlement={selectedSettlement}
                  setSelectedSettlement={setSelectedSettlement}
                />
                {selectedSettlement?.campaign_type !==
                  DatabaseCampaignType['Squires of the Citadel'] && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <PatternsCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                    <SeedPatternsCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ponder" className="mt-2">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <CollectiveCognitionVictoriesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                  <CollectiveCognitionRewardsCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <PhilosophiesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                  <KnowledgesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Prepare Departing Survivors */}
      {currentStep === SettlementPhaseStep.PREPARE_DEPARTING_SURVIVORS && (
        <div className="text-center text-sm text-muted-foreground">
          Survivors are prepared for departure when creating a hunt or showdown.
        </div>
      )}

      {/* Special Showdown */}
      {currentStep === SettlementPhaseStep.SPECIAL_SHOWDOWN && (
        <div className="text-center text-sm text-muted-foreground">
          Survivors are prepared for departure when creating a hunt or showdown.
        </div>
      )}

      {/* Record and Archive Resources */}
      {currentStep === SettlementPhaseStep.RECORD_AND_ARCHIVE_RESOURCES && (
        <ResourcesCard
          selectedSettlement={selectedSettlement}
          setSelectedSettlement={setSelectedSettlement}
        />
      )}

      {/* End Settlement Phase */}
      {currentStep === SettlementPhaseStep.END_SETTLEMENT_PHASE && (
        <>
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

          <PrinciplesCard
            selectedSettlement={selectedSettlement}
            setSelectedSettlement={setSelectedSettlement}
          />
        </>
      )}

      {/* Returning Survivors */}
      {currentStep &&
        [
          SettlementPhaseStep.SURVIVORS_RETURN,
          SettlementPhaseStep.GAIN_ENDEAVORS,
          SettlementPhaseStep.UPDATE_DEATH_COUNT,
          SettlementPhaseStep.CHECK_MILESTONES
        ].includes(currentStep) && (
          <SettlementPhaseSurvivorsCard
            selectedSettlement={selectedSettlement}
            selectedSettlementPhase={selectedSettlementPhase}
            selectedSurvivor={selectedSurvivor}
            setSelectedSurvivor={setSelectedSurvivor}
            setSurvivors={setSurvivors}
            survivors={survivors}
          />
        )}
    </div>
  )
}
