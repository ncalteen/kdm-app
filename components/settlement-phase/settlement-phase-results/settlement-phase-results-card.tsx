'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SettlementPhaseDetail, SurvivorDetail } from '@/lib/types'
import { ReactElement, useMemo } from 'react'

/**
 * Settlement Phase Results Card Properties
 */
interface SettlementPhaseResultsCardProps {
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Settlement Phase Results Card Component
 *
 * Displays a summary of returning and fallen survivors for the current
 * settlement phase.
 *
 * @param props Settlement Phase Results Card Properties
 * @returns Settlement Phase Results Card Component
 */
export function SettlementPhaseResultsCard({
  selectedSettlementPhase,
  survivors
}: SettlementPhaseResultsCardProps): ReactElement {
  const returningIds = useMemo(() => {
    if (!selectedSettlementPhase) return []
    return [
      ...selectedSettlementPhase.returning_survivor_ids,
      ...(selectedSettlementPhase.returning_scout_id
        ? [selectedSettlementPhase.returning_scout_id]
        : [])
    ]
  }, [selectedSettlementPhase])

  const returningSurvivors = useMemo(
    () => survivors.filter((s) => returningIds.includes(s.id)),
    [survivors, returningIds]
  )

  const deadSurvivors = useMemo(
    () => returningSurvivors.filter((s) => s.dead),
    [returningSurvivors]
  )

  const survivingSurvivors = useMemo(
    () => returningSurvivors.filter((s) => !s.dead),
    [returningSurvivors]
  )

  /**
   * Get Survivor Display Name
   *
   * @param survivor Survivor Data
   * @returns Survivor Display Name
   */
  const getSurvivorDisplayName = (survivor: SurvivorDetail): string =>
    survivor.survivor_name?.trim() || `Survivor #${survivor.id.slice(0, 8)}`

  return (
    <Card className="p-0 px-2 border-0 flex items-center">
      <CardContent className="p-1 pb-0 text-xs w-full space-y-2 flex flex-row justify-between">
        <div>
          <p className="font-semibold">
            Fallen Survivors ({deadSurvivors.length})
          </p>
          {deadSurvivors.length === 0 ? (
            <p className="text-muted-foreground">None</p>
          ) : (
            <p className="text-muted-foreground">
              {deadSurvivors.map(getSurvivorDisplayName).join(', ')}
            </p>
          )}
        </div>

        <div>
          <p className="font-semibold">
            Returning Survivors ({survivingSurvivors.length})
          </p>
          {survivingSurvivors.length === 0 ? (
            <p className="text-muted-foreground">None</p>
          ) : (
            <p className="text-muted-foreground">
              {survivingSurvivors.map(getSurvivorDisplayName).join(', ')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
