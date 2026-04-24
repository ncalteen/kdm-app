'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { getLostSettlementCount, updateSettlement } from '@/lib/dal/settlement'
import { updateSettlementPhase } from '@/lib/dal/settlement-phase'
import {
  CampaignType,
  DatabaseCampaignType,
  DatabaseSurvivorType,
  SurvivorType
} from '@/lib/enums'
import {
  ENDEAVORS_MINIMUM_ERROR_MESSAGE,
  ENDEAVORS_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  LANTERN_RESEARCH_LEVEL_MINIMUM_ERROR,
  LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE,
  SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE,
  SURVIVAL_LIMIT_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  SettlementDetail,
  SettlementPhaseDetail,
  SettlementStateSetter,
  SurvivorDetail
} from '@/lib/types'
import { calculateSettlementCollectiveCognition } from '@/lib/utils'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Overview Card Properties
 */
interface OverviewCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (phase: SettlementPhaseDetail | null) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Overview Card Component
 *
 * Displays and manages high-level information for the settlement including
 * survival limit, population count, death count, and lost settlements. Uses
 * optimistic UI updates with rollback on database failure.
 *
 * @param props Overview Card Properties
 * @returns Overview Card Component
 */
export function OverviewCard({
  local,
  selectedSettlement,
  selectedSettlementPhase,
  setSelectedSettlement,
  setSelectedSettlementPhase,
  survivors
}: OverviewCardProps): ReactElement {
  const { toast } = useToast(local)

  const [lostSettlementCount, setLostSettlementCount] = useState<number>(0)
  const [isLoadingLostCount, setIsLoadingLostCount] = useState<boolean>(true)
  const [prevSettlementId, setPrevSettlementId] = useState<string | undefined>(
    selectedSettlement?.id
  )

  // Reset loading state at render time when the selected settlement changes,
  // so the effect below doesn't need to call setState synchronously.
  if (prevSettlementId !== selectedSettlement?.id) {
    setPrevSettlementId(selectedSettlement?.id)
    setIsLoadingLostCount(true)
  }

  /** Death count derived from survivors array */
  const deathCount = useMemo(
    () =>
      survivors.filter(
        (s) => s.settlement_id === selectedSettlement?.id && s.dead
      ).length,
    [survivors, selectedSettlement?.id]
  )

  /** Population derived from survivors array */
  const population = useMemo(
    () =>
      survivors.filter(
        (s) => s.settlement_id === selectedSettlement?.id && !s.dead
      ).length,
    [survivors, selectedSettlement?.id]
  )

  /**
   * Collective Cognition
   *
   * Computed locally from the settlement's quarry and nemesis collective
   * cognition fields so it updates reactively whenever victories are toggled.
   */
  const collectiveCognition = useMemo(
    () => calculateSettlementCollectiveCognition(selectedSettlement),
    [selectedSettlement]
  )

  /**
   * Handle Component Loading
   *
   * Load the various data used in this component.
   */
  useEffect(() => {
    let isCancelled = false

    getLostSettlementCount(selectedSettlement?.id)
      .then((count) => {
        if (!isCancelled) {
          setLostSettlementCount(count ?? 0)
          setIsLoadingLostCount(false)
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          setIsLoadingLostCount(false)
          console.error('Overview Load Error:', err)
          toast.error(ERROR_MESSAGE())
        }
      })

    return () => {
      isCancelled = true
    }
  }, [selectedSettlement?.id, toast])

  /**
   * Handle Endeavors Change
   *
   * Optimistically updates the endeavor count, then persists to the DB.
   * Rolls back on failure.
   *
   * @param value New Endeavors Value
   */
  const handleEndeavorsChange = useCallback(
    (value: number) => {
      if (isNaN(value)) return
      if (!selectedSettlementPhase) return
      if (selectedSettlementPhase.endeavors === value) return

      if (value < 0) return toast.error(ENDEAVORS_MINIMUM_ERROR_MESSAGE())

      const previous = selectedSettlementPhase.endeavors

      // Optimistic update
      setSelectedSettlementPhase({
        ...selectedSettlementPhase,
        endeavors: value
      })

      updateSettlementPhase(selectedSettlementPhase.id, {
        endeavors: value
      })
        .then(() => toast.success(ENDEAVORS_UPDATED_MESSAGE(previous, value)))
        .catch((error: unknown) => {
          // Rollback
          setSelectedSettlementPhase({
            ...selectedSettlementPhase,
            endeavors: previous
          })
          console.error('Endeavors Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlementPhase, setSelectedSettlementPhase, toast]
  )

  /**
   * Handle Lantern Research Level Change
   *
   * Optimistically updates the lantern research level, then persists to the
   * DB. Rolls back on failure.
   *
   * @param value New Lantern Research Level
   */
  const handleLanternResearchLevelChange = useCallback(
    (value: number) => {
      if (isNaN(value)) return
      if (!selectedSettlement) return
      if (selectedSettlement.lantern_research === value) return

      if (value < 0) return toast.error(LANTERN_RESEARCH_LEVEL_MINIMUM_ERROR())

      const previous = selectedSettlement.lantern_research

      // Optimistic update
      setSelectedSettlement({
        ...selectedSettlement,
        lantern_research: value
      })

      updateSettlement(selectedSettlement.id, { lantern_research: value })
        .then(() =>
          toast.success(LANTERN_RESEARCH_LEVEL_UPDATED_MESSAGE(previous, value))
        )
        .catch((error: unknown) => {
          // Rollback
          setSelectedSettlement((prev) =>
            prev ? { ...prev, lantern_research: previous } : null
          )
          console.error('Lantern Research Level Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement, toast]
  )

  /**
   * Handle Survival Limit Change
   *
   * Optimistically updates the survival limit, then persists to the DB.
   * Rolls back on failure.
   *
   * @param value New Survival Limit
   */
  const handleSurvivalLimitChange = useCallback(
    (value: number) => {
      if (isNaN(value)) return
      if (!selectedSettlement) return
      if (selectedSettlement.survival_limit === value) return

      if (value < 1) return toast.error(SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE())

      const previous = selectedSettlement.survival_limit

      // Optimistic update
      setSelectedSettlement({
        ...selectedSettlement,
        survival_limit: value
      })

      updateSettlement(selectedSettlement.id, { survival_limit: value })
        .then(() =>
          toast.success(SURVIVAL_LIMIT_UPDATED_MESSAGE(previous, value))
        )
        .catch((error: unknown) => {
          // Rollback
          setSelectedSettlement((prev) =>
            prev ? { ...prev, survival_limit: previous } : null
          )
          console.error('Survival Limit Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement, toast]
  )

  return (
    <Card className="border-0 p-0 py-2">
      <CardContent className="p-0">
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-row items-start gap-4">
          {/* Survival Limit */}
          <div className="flex flex-1 flex-col items-center gap-1">
            <NumericInput
              label="Survival Limit"
              className="w-12 h-12 text-center no-spinners text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={selectedSettlement?.survival_limit ?? 1}
              min={1}
              onChange={handleSurvivalLimitChange}
            />
            <Label className="text-center text-xs">Survival Limit</Label>
          </div>

          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-12"
          />

          {/* Population (Disabled) */}
          <div className="flex flex-1 flex-col items-center gap-1">
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

          {/* Death Count (Disabled) */}
          <div className="flex flex-1 flex-col items-center gap-1">
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

          {/* Lost Settlement Count (Disabled) */}
          <div className="flex flex-1 flex-col items-center gap-1">
            {isLoadingLostCount ? (
              <Skeleton className="w-12 h-12 rounded-md" />
            ) : (
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
            )}
            <Label className="text-center text-xs">Lost Settlements</Label>
          </div>

          {/* Collective Cognition (Disabled) */}
          {selectedSettlement?.survivor_type ===
            DatabaseSurvivorType[SurvivorType.ARC] && (
            <>
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-12"
              />

              <div className="flex flex-1 flex-col items-center gap-1">
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

          {/* Lantern Research Level (PotL/PotSun) */}
          {(selectedSettlement?.campaign_type ===
            DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_LANTERN] ||
            selectedSettlement?.campaign_type ===
              DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_SUN]) && (
            <>
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-12"
              />

              <div className="flex flex-1 flex-col items-center gap-1">
                <NumericInput
                  label="Lantern Research"
                  className="w-12 h-12 text-center no-spinners text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={selectedSettlement?.lantern_research ?? 0}
                  min={0}
                  onChange={handleLanternResearchLevelChange}
                />
                <Label className="text-center text-xs">Lantern Research</Label>
              </div>
            </>
          )}

          {/* Endeavors (Settlement Phase) */}
          {selectedSettlementPhase?.id && (
            <>
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-12"
              />

              <div className="flex flex-1 flex-col items-center gap-1">
                <NumericInput
                  label="Endeavors"
                  className="w-12 h-12 text-center no-spinners text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={selectedSettlementPhase?.endeavors ?? 0}
                  min={0}
                  onChange={handleEndeavorsChange}
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

          {/* Population (Disabled) */}
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

          {/* Death Count (Disabled) */}
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

          {/* Lost Settlement Count (Disabled) */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Lost Settlements</Label>
            {isLoadingLostCount ? (
              <Skeleton className="w-16 h-8 rounded-md" />
            ) : (
              <Input
                type="number"
                className="w-16 h-8 text-center no-spinners text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={lostSettlementCount}
                disabled
                name="lost-settlements-mobile"
                id="lost-settlements-mobile"
              />
            )}
          </div>

          {/* Collective Cognition (Disabled) */}
          {selectedSettlement?.survivor_type ===
            DatabaseSurvivorType[SurvivorType.ARC] && (
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

          {/* Lantern Research Level (PotL/PotSun) */}
          {(selectedSettlement?.campaign_type ===
            DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_LANTERN] ||
            selectedSettlement?.campaign_type ===
              DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_SUN]) && (
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

          {/* Endeavors (Settlement Phase) */}
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
