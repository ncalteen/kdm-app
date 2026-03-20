'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  getCollectiveCognition,
  getDeathCount,
  getLostSettlementCount,
  getPopulation,
  updateSettlement
} from '@/lib/dal/settlement'
import { updateSettlementPhase } from '@/lib/dal/settlement-phase'
import { DatabaseCampaignType, DatabaseSurvivorType } from '@/lib/enums'
import {
  ENDEAVORS_MINIMUM_ERROR_MESSAGE,
  ENDEAVORS_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  LANTERN_RESEARCH_LEVEL_MINIMUM_ERROR,
  LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE,
  SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE,
  SURVIVAL_LIMIT_UPDATED_MESSAGE
} from '@/lib/messages'
import { SettlementDetail, SettlementPhaseDetail } from '@/lib/types'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

/**
 * Overview Card Properties
 */
interface OverviewCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Overview Card Component
 *
 * Displays and manages high-level information for the settlement including
 * survival limit, population count, death count, and lost settlements.
 *
 * @param props Overview Card Properties
 * @returns Overview Card Component
 */
export function OverviewCard({
  selectedSettlement,
  selectedSettlementPhase,
  setSelectedSettlement
}: OverviewCardProps): ReactElement {
  const [collectiveCognition, setCollectiveCognition] = useState<number>(0)
  const [deathCount, setDeathCount] = useState<number>(0)
  const [lostSettlementCount, setLostSettlementCount] = useState<number>(0)
  const [population, setPopulation] = useState<number>(0)

  /**
   * Handle Component Loading
   *
   * Load the various data used in this component.
   */
  useEffect(() => {
    Promise.all([
      getCollectiveCognition(selectedSettlement?.id),
      getDeathCount(selectedSettlement?.id),
      getLostSettlementCount(selectedSettlement?.id),
      getPopulation(selectedSettlement?.id)
    ])
      .then(
        ([
          collectiveCognition,
          deathCount,
          lostSettlementCount,
          population
        ]) => {
          setCollectiveCognition(collectiveCognition ?? 0)
          setDeathCount(deathCount ?? 0)
          setLostSettlementCount(lostSettlementCount ?? 0)
          setPopulation(population ?? 0)
        }
      )
      .catch((err: unknown) => {
        console.error('Overview Load Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedSettlement?.id])

  /**
   * Handle Endeavors Change
   *
   * @param value New Endeavors Value
   */
  const handleEndeavorsChange = useCallback(
    (value: number) => {
      if (isNaN(value)) return
      if (selectedSettlementPhase?.endeavors === value) return

      if (value < 0) return toast.error(ENDEAVORS_MINIMUM_ERROR_MESSAGE())

      const previous = selectedSettlementPhase?.endeavors ?? 0

      updateSettlementPhase(selectedSettlementPhase?.id, {
        endeavors: value
      })
        .then(() => toast.success(ENDEAVORS_UPDATED_MESSAGE(previous, value)))
        .catch((error: unknown) => {
          console.error('Endeavors Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlementPhase?.endeavors, selectedSettlementPhase?.id]
  )

  /**
   * Handle Lantern Research Level Change
   *
   * @param value New Lantern Research Level
   */
  const handleLanternResearchLevelChange = useCallback(
    (value: number) => {
      if (isNaN(value)) return
      if (selectedSettlement?.lantern_research === value) return

      if (value < 0) return toast.error(LANTERN_RESEARCH_LEVEL_MINIMUM_ERROR())

      const previous = selectedSettlement?.lantern_research ?? 0

      updateSettlement(selectedSettlement?.id, { lantern_research: value })
        .then(() => {
          if (selectedSettlement)
            setSelectedSettlement({
              ...selectedSettlement,
              lantern_research: value
            })
          toast.success(LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE(previous, value))
        })
        .catch((error: unknown) => {
          console.error('Lantern Research Level Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  /**
   * Handle Survival Limit Change
   *
   * @param value New Survival Limit
   */
  const handleSurvivalLimitChange = useCallback(
    (value: number) => {
      if (isNaN(value)) return
      if (selectedSettlement?.survival_limit === value) return

      if (value < 1) return toast.error(SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE())

      const previous = selectedSettlement?.survival_limit ?? 0

      updateSettlement(selectedSettlement?.id, { survival_limit: value })
        .then(() => {
          if (selectedSettlement)
            setSelectedSettlement({
              ...selectedSettlement,
              survival_limit: value
            })
          toast.success(SURVIVAL_LIMIT_UPDATED_MESSAGE(previous, value))
        })
        .catch((error: unknown) => {
          console.error('Survival Limit Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="border-0 p-0 py-2">
      <CardContent>
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-row items-start justify-between gap-4">
          {/* Survival Limit */}
          <div className="flex flex-col items-center gap-1">
            <Input
              type="number"
              min="1"
              placeholder="1"
              className="w-12 h-12 text-center no-spinners text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              defaultValue={selectedSettlement?.survival_limit ?? 1}
              key={`survival-limit-${selectedSettlement?.id ?? ''}-${selectedSettlement?.survival_limit ?? 1}`}
              onBlur={(e) =>
                handleSurvivalLimitChange(parseInt(e.target.value, 10))
              }
              name="survival-limit-desktop"
              id="survival-limit-desktop"
            />
            <Label className="text-center text-xs">Survival Limit</Label>
          </div>

          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-12"
          />

          {/* Population */}
          <div className="flex flex-col items-center gap-1">
            <Input
              type="number"
              className="w-12 h-12 text-center no-spinners text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={population}
              disabled
              name="population-desktop"
              id="population-desktop"
            />
            <Label className="text-center text-xs">Population</Label>
          </div>

          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-12"
          />

          {/* Death Count */}
          <div className="flex flex-col items-center gap-1">
            <Input
              type="number"
              className="w-12 h-12 text-center no-spinners text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={deathCount}
              disabled
              name="death-count-desktop"
              id="death-count-desktop"
            />
            <Label className="text-center text-xs">Death Count</Label>
          </div>

          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-12"
          />

          {/* Lost Settlement Count */}
          <div className="flex flex-col items-center gap-1">
            <Input
              type="number"
              min="0"
              placeholder="0"
              className="w-12 h-12 text-center no-spinners text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              defaultValue={lostSettlementCount}
              key={`lost-settlements-${selectedSettlement?.id ?? ''}-${lostSettlementCount}`}
              disabled
              name="lost-settlements-desktop"
              id="lost-settlements-desktop"
            />
            <Label className="text-center text-xs">Lost Settlements</Label>
          </div>

          {/* Collective Cognition (ARC only) */}
          {selectedSettlement?.survivor_type ===
            DatabaseSurvivorType['Arc'] && (
            <>
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-12"
              />

              <div className="flex flex-col items-center gap-1">
                <Input
                  type="number"
                  className="w-12 h-12 text-center no-spinners text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={collectiveCognition}
                  disabled
                  name="collective-cognition-desktop"
                  id="collective-cognition-desktop"
                />
                <Label className="text-center text-xs">
                  Collective Cognition
                </Label>
              </div>
            </>
          )}

          {/* Lantern Research Level (People of the Lantern/Sun only) */}
          {(selectedSettlement?.campaign_type ===
            DatabaseCampaignType['People of the Lantern'] ||
            selectedSettlement?.campaign_type ===
              DatabaseCampaignType['People of the Sun']) && (
            <>
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-12"
              />

              <div className="flex flex-col items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-12 h-12 text-center no-spinners text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  defaultValue={selectedSettlement?.lantern_research ?? 0}
                  key={`lantern-research-${selectedSettlement?.id ?? ''}-${selectedSettlement?.lantern_research ?? 0}`}
                  onBlur={(e) =>
                    handleLanternResearchLevelChange(
                      parseInt(e.target.value, 10)
                    )
                  }
                  name="lantern-research-desktop"
                  id="lantern-research-desktop"
                />
                <Label className="text-center text-xs">Lantern Research</Label>
              </div>
            </>
          )}

          {/* Endeavors (Settlement Phase Only) */}
          {selectedSettlementPhase?.id && (
            <>
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-12"
              />

              <div className="flex flex-col items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-12 h-12 text-center no-spinners text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  defaultValue={selectedSettlementPhase?.endeavors ?? 0}
                  key={`endeavors-${selectedSettlement?.id ?? ''}-${selectedSettlementPhase?.id ?? ''}-${selectedSettlementPhase?.endeavors ?? 0}`}
                  onBlur={(e) =>
                    handleEndeavorsChange(parseInt(e.target.value, 10))
                  }
                  name="endeavors-desktop"
                  id="endeavors-desktop"
                />
                <Label className="text-center text-xs">Endeavors</Label>
              </div>
            </>
          )}
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-2">
          {/* Survival Limit */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Survival Limit</Label>
            <NumericInput
              label="Survival Limit"
              value={selectedSettlement?.survival_limit ?? 1}
              min={1}
              onChange={(value) => handleSurvivalLimitChange(value)}
              className="w-16 h-8 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Population */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Population</Label>
            <Input
              type="number"
              className="w-16 h-8 text-center no-spinners text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={population}
              disabled
              name="population-mobile"
              id="population-mobile"
            />
          </div>

          {/* Death Count */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Death Count</Label>
            <Input
              type="number"
              className="w-16 h-8 text-center no-spinners text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={deathCount}
              disabled
              name="death-count-mobile"
              id="death-count-mobile"
            />
          </div>

          {/* Lost Settlement Count */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Lost Settlements</Label>
            <Input
              type="number"
              className="w-16 h-8 text-center no-spinners text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={lostSettlementCount}
              disabled
              name="lost-settlements-mobile"
              id="lost-settlements-mobile"
            />
          </div>

          {/* Collective Cognition (ARC only) */}
          {selectedSettlement?.survivor_type ===
            DatabaseSurvivorType['Arc'] && (
            <div className="flex items-center justify-between">
              <Label className="text-sm">Collective Cognition</Label>
              <Input
                type="number"
                className="w-16 h-8 text-center no-spinners text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={collectiveCognition}
                disabled
                name="collective-cognition-mobile"
                id="collective-cognition-mobile"
              />
            </div>
          )}

          {/* Lantern Research Level (People of the Lantern/Sun only) */}
          {(selectedSettlement?.campaign_type ===
            DatabaseCampaignType['People of the Lantern'] ||
            selectedSettlement?.campaign_type ===
              DatabaseCampaignType['People of the Sun']) && (
            <div className="flex items-center justify-between">
              <Label className="text-sm">Lantern Research</Label>
              <NumericInput
                label="Lantern Research"
                value={selectedSettlement?.lantern_research ?? 0}
                min={0}
                onChange={(value) => handleLanternResearchLevelChange(value)}
                className="w-16 h-8 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          )}

          {/* Endeavors (Settlement Phase Only) */}
          {selectedSettlementPhase?.id && (
            <div className="flex items-center justify-between">
              <Label className="text-sm">Endeavors</Label>
              <NumericInput
                label="Endeavors"
                value={selectedSettlementPhase?.endeavors ?? 0}
                min={0}
                onChange={(value) => handleEndeavorsChange(value)}
                className="w-16 h-8 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
