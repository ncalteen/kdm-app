'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  getCampaignType,
  getCollectiveCognition,
  getDeathCount,
  getLanternResearch,
  getLostSettlementCount,
  getPopulation,
  getSurvivalLimit,
  getSurvivorType,
  updateLanternResearch,
  updateSurvivalLimit
} from '@/lib/dal/settlement'
import { getEndeavors, updateEndeavors } from '@/lib/dal/settlement-phase'
import { CampaignType, SurvivorType } from '@/lib/enums'
import {
  ENDEAVORS_MINIMUM_ERROR_MESSAGE,
  ENDEAVORS_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  LANTERN_RESEARCH_LEVEL_MINIMUM_ERROR,
  LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE,
  SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE,
  SURVIVAL_LIMIT_UPDATED_MESSAGE
} from '@/lib/messages'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

/**
 * Overview Card Properties
 */
interface OverviewCardProps {
  /** Campaign Type */
  campaignType: CampaignType
  /** Selected Settlement ID */
  selectedSettlementId: string | null
  /** Selected Settlement Phase ID */
  selectedSettlementPhaseId: string | null
  /** Set Campaign Type */
  setCampaignType: (campaignType: CampaignType) => void
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
  campaignType,
  selectedSettlementId,
  selectedSettlementPhaseId,
  setCampaignType
}: OverviewCardProps): ReactElement {
  const [collectiveCognition, setCollectiveCognition] = useState<number>(0)
  const [deathCount, setDeathCount] = useState<number>(0)
  const [endeavors, setEndeavors] = useState<number>(0)
  const [lanternResearch, setLanternResearch] = useState<number>(0)
  const [lostSettlementCount, setLostSettlementCount] = useState<number>(0)
  const [population, setPopulation] = useState<number>(0)
  const [survivalLimit, setSurvivalLimit] = useState<number>(0)
  const [survivorType, setSurvivorType] = useState<SurvivorType>(
    SurvivorType.CORE
  )

  /**
   * Handle Component Loading
   *
   * Load the various data used in this component.
   */
  useEffect(() => {
    Promise.all([
      getCampaignType(selectedSettlementId),
      getCollectiveCognition(selectedSettlementId),
      getDeathCount(selectedSettlementId),
      getEndeavors(selectedSettlementPhaseId),
      getLanternResearch(selectedSettlementId),
      getLostSettlementCount(selectedSettlementId),
      getPopulation(selectedSettlementId),
      getSurvivalLimit(selectedSettlementId),
      getSurvivorType(selectedSettlementId)
    ])
      .then(
        ([
          campaignType,
          collectiveCognition,
          deathCount,
          endeavors,
          lanternResearch,
          lostSettlementCount,
          population,
          survivalLimit,
          survivorType
        ]) => {
          setCampaignType(campaignType ?? CampaignType.PEOPLE_OF_THE_LANTERN)
          setCollectiveCognition(collectiveCognition ?? 0)
          setDeathCount(deathCount ?? 0)
          setEndeavors(endeavors ?? 0)
          setLanternResearch(lanternResearch ?? 0)
          setLostSettlementCount(lostSettlementCount ?? 0)
          setPopulation(population ?? 0)
          setSurvivalLimit(survivalLimit ?? 1)
          setSurvivorType(survivorType ?? SurvivorType.CORE)
        }
      )
      .catch((err: unknown) => {
        console.error('Overview Load Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedSettlementId, selectedSettlementPhaseId, setCampaignType])

  /**
   * Handle Endeavors Change
   *
   * @param value New Endeavors Value
   */
  const handleEndeavorsChange = useCallback(
    (value: number) => {
      if (isNaN(endeavors) || isNaN(value)) return
      if (endeavors === value) return

      if (value < 0) return toast.error(ENDEAVORS_MINIMUM_ERROR_MESSAGE())

      const previous = endeavors
      setEndeavors(value)

      updateEndeavors(selectedSettlementPhaseId, value)
        .then(() => toast.success(ENDEAVORS_UPDATED_MESSAGE(previous, value)))
        .catch((error: unknown) => {
          setEndeavors(previous)

          console.error('Endeavors Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [endeavors, selectedSettlementPhaseId]
  )

  /**
   * Handle Lantern Research Level Change
   *
   * @param value New Lantern Research Level
   */
  const handleLanternResearchLevelChange = useCallback(
    (value: number) => {
      if (isNaN(lanternResearch) || isNaN(value)) return
      if (lanternResearch === value) return

      if (value < 0) return toast.error(LANTERN_RESEARCH_LEVEL_MINIMUM_ERROR())

      const previous = lanternResearch
      setLanternResearch(value)

      updateLanternResearch(selectedSettlementId, value)
        .then(() =>
          toast.success(
            LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE(previous, value)
          )
        )
        .catch((error: unknown) => {
          setLanternResearch(previous)
          console.error('Lantern Research Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [lanternResearch, selectedSettlementId]
  )

  /**
   * Handle Survival Limit Change
   *
   * @param value New Survival Limit
   */
  const handleSurvivalLimitChange = useCallback(
    (value: number) => {
      if (isNaN(survivalLimit) || isNaN(value)) return
      if (survivalLimit === value) return

      if (value < 1) return toast.error(SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE())

      const previous = survivalLimit
      setSurvivalLimit(value)

      updateSurvivalLimit(selectedSettlementId, value)
        .then(() =>
          toast.success(SURVIVAL_LIMIT_UPDATED_MESSAGE(previous, value))
        )
        .catch((error: unknown) => {
          setSurvivalLimit(previous)
          console.error('Survival Limit Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlementId, survivalLimit]
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
              defaultValue={survivalLimit}
              key={`survival-limit-${selectedSettlementId}-${survivalLimit}`}
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
              key={`lost-settlements-${selectedSettlementId}-${lostSettlementCount}`}
              disabled
              name="lost-settlements-desktop"
              id="lost-settlements-desktop"
            />
            <Label className="text-center text-xs">Lost Settlements</Label>
          </div>

          {/* Collective Cognition (ARC only) */}
          {survivorType === SurvivorType.ARC && (
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
          {(campaignType === CampaignType.PEOPLE_OF_THE_LANTERN ||
            campaignType === CampaignType.PEOPLE_OF_THE_SUN) && (
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
                  defaultValue={lanternResearch}
                  key={`lantern-research-${selectedSettlementId}-${lanternResearch}`}
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
          {selectedSettlementPhaseId && (
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
                  defaultValue={endeavors}
                  key={`endeavors-${selectedSettlementId}-${selectedSettlementPhaseId}-${endeavors}`}
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
              value={survivalLimit}
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
          {survivorType === SurvivorType.ARC && (
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
          {(campaignType === CampaignType.PEOPLE_OF_THE_LANTERN ||
            campaignType === CampaignType.PEOPLE_OF_THE_SUN) && (
            <div className="flex items-center justify-between">
              <Label className="text-sm">Lantern Research</Label>
              <NumericInput
                label="Lantern Research"
                value={lanternResearch}
                min={0}
                onChange={(value) => handleLanternResearchLevelChange(value)}
                className="w-16 h-8 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          )}

          {/* Endeavors (Settlement Phase Only) */}
          {selectedSettlementPhaseId && (
            <div className="flex items-center justify-between">
              <Label className="text-sm">Endeavors</Label>
              <NumericInput
                label="Endeavors"
                value={endeavors}
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
