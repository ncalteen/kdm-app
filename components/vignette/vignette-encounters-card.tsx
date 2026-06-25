'use client'

import { LanternLoader } from '@/components/generic/lantern-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ERROR_MESSAGE } from '@/lib/messages'
import type {
  VignetteLandingState,
  VignetteEncounterSummary,
  VignetteMonsterSummary
} from '@/lib/types'
import { ReactElement, useCallback } from 'react'

/** Vignette Encounters Card Properties */
interface VignetteEncountersCardProps {
  /** Whether Vignette Landing State Failed to Load */
  hasVignetteLandingStateLoadError: boolean
  /** Whether Vignette Landing State Is Loading */
  isVignetteLandingStateLoading: boolean
  /** Refetch Vignette Landing State */
  refetchVignetteLandingState: () => void
  /** Selected Vignette Encounter ID */
  selectedVignetteEncounterId: string | null
  /** Set Selected Vignette Encounter ID */
  setSelectedVignetteEncounterId: (vignetteEncounterId: string | null) => void
  /** Vignette Landing State */
  vignetteLandingState: VignetteLandingState
}

/**
 * Format Vignette Turn
 *
 * @param turn Vignette Turn
 * @returns Display Turn
 */
function formatVignetteTurn(turn: VignetteEncounterSummary['turn']): string {
  const lower = turn.toLowerCase()
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)} turn`
}

/**
 * Sorted Vignette Levels
 *
 * @param monster Vignette Monster Detail
 * @returns Sorted Vignette Levels
 */
function sortedVignetteLevels(
  monster: VignetteMonsterSummary
): VignetteMonsterSummary['levels'] {
  return [...monster.levels].sort((a, b) => a.level_number - b.level_number)
}

/**
 * Vignette Encounters Card
 *
 * Top-level one-shot surface that is intentionally available without a selected
 * settlement.
 *
 * @param props Vignette Encounters Card Properties
 * @returns Vignette Encounters Card
 */
export function VignetteEncountersCard({
  hasVignetteLandingStateLoadError,
  isVignetteLandingStateLoading,
  refetchVignetteLandingState,
  selectedVignetteEncounterId,
  setSelectedVignetteEncounterId,
  vignetteLandingState
}: VignetteEncountersCardProps): ReactElement {
  const handleSelectVignetteEncounter = useCallback(
    (summary: VignetteEncounterSummary) => {
      setSelectedVignetteEncounterId(summary.id)
    },
    [setSelectedVignetteEncounterId]
  )

  const hasSharedActive = vignetteLandingState.sharedActive.length > 0
  const hasCatalogMonsters = vignetteLandingState.catalogMonsters.length > 0
  const isEmptyLanding =
    !vignetteLandingState.ownedActive && !hasSharedActive && !hasCatalogMonsters
  return (
    <div className="pt-(--header-height) px-2 py-2">
      <Card className="mx-auto max-w-3xl border bg-card/70 mt-2">
        <CardHeader>
          <CardTitle>Vignette Encounters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          {isVignetteLandingStateLoading ? (
            <LanternLoader
              variant="inline"
              title="Kindling the vignette lantern..."
              caption="A one-shot waits beyond the settlement record."
            />
          ) : hasVignetteLandingStateLoadError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-destructive">
              <p className="font-medium">{ERROR_MESSAGE()}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={refetchVignetteLandingState}>
                Try again
              </Button>
            </div>
          ) : isEmptyLanding ? (
            <p className="rounded-md border border-dashed p-3 text-muted-foreground">
              No vignette encounters are available yet.
            </p>
          ) : (
            <>
              {vignetteLandingState.ownedActive ? (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">
                    Active Vignette Encounter
                  </h3>
                  <VignetteSummaryRow
                    summary={vignetteLandingState.ownedActive}
                    badge="Owner"
                    isSelected={
                      selectedVignetteEncounterId ===
                      vignetteLandingState.ownedActive.id
                    }
                    onSelect={handleSelectVignetteEncounter}
                  />
                </section>
              ) : (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">
                    Available Vignette Encounters
                  </h3>
                  {hasCatalogMonsters ? (
                    <div className="grid gap-2">
                      {vignetteLandingState.catalogMonsters.map((monster) => (
                        <VignetteCatalogRow
                          key={monster.id}
                          monster={monster}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed p-3 text-muted-foreground">
                      No available vignette encounters.
                    </p>
                  )}
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Shared With Me</h3>
                {hasSharedActive ? (
                  <div className="grid gap-2">
                    {vignetteLandingState.sharedActive.map((summary) => (
                      <VignetteSummaryRow
                        key={summary.id}
                        summary={summary}
                        badge="Shared"
                        isSelected={selectedVignetteEncounterId === summary.id}
                        onSelect={handleSelectVignetteEncounter}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed p-3 text-muted-foreground">
                    No shared vignette encounters are available.
                  </p>
                )}
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Vignette Summary Row
 *
 * @param props Vignette Summary Row Properties
 * @returns Vignette Summary Row
 */
function VignetteSummaryRow({
  badge,
  isSelected,
  onSelect,
  summary
}: {
  /** Badge Label */
  badge: string
  /** Whether This Vignette Is Selected */
  isSelected: boolean
  /** Select Vignette Encounter */
  onSelect: (summary: VignetteEncounterSummary) => void
  /** Vignette Encounter Summary */
  summary: VignetteEncounterSummary
}): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(summary)}
      className={`flex w-full items-start justify-between gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground ${
        isSelected ? 'border-primary bg-primary/10' : ''
      }`}>
      <div className="min-w-0">
        <p className="font-medium leading-none">{summary.monster_name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Level {summary.level_number} · {formatVignetteTurn(summary.turn)}
        </p>
      </div>
      <Badge variant={badge === 'Owner' ? 'default' : 'outline'}>{badge}</Badge>
    </button>
  )
}

/**
 * Vignette Catalog Row
 *
 * @param props Vignette Catalog Row Properties
 * @returns Vignette Catalog Row
 */
function VignetteCatalogRow({
  monster
}: {
  /** Vignette Monster */
  monster: VignetteMonsterSummary
}): ReactElement {
  const levels = sortedVignetteLevels(monster)

  return (
    <div className="rounded-md border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium leading-none">{monster.monster_name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {monster.source_monster_type.toLowerCase()}
          </p>
        </div>
        {monster.multi_monster && (
          <Badge variant="outline">Multi-monster</Badge>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {levels.map((level) => (
          <Badge key={level.id} variant="secondary">
            Level {level.level_number}
          </Badge>
        ))}
      </div>
    </div>
  )
}
