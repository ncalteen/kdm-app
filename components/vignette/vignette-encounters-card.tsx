'use client'

import { LanternLoader } from '@/components/generic/lantern-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getActiveVignetteEncounterForUser,
  getSharedVignetteEncountersForUser,
  getVignetteMonsterSummaries
} from '@/lib/dal/vignette-encounter'
import { ERROR_MESSAGE } from '@/lib/messages'
import type {
  VignetteEncounterSummary,
  VignetteMonsterSummary
} from '@/lib/types'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

/** Vignette Landing State */
interface VignetteLandingState {
  /** Catalog Monsters */
  catalogMonsters: VignetteMonsterSummary[]
  /** Owned Active Vignette */
  ownedActive: VignetteEncounterSummary | null
  /** Shared Active Vignettes */
  sharedActive: VignetteEncounterSummary[]
}

/** Empty Vignette Landing State */
const EMPTY_VIGNETTE_LANDING_STATE: VignetteLandingState = {
  catalogMonsters: [],
  ownedActive: null,
  sharedActive: []
}

/**
 * Fetch Vignette Landing State
 *
 * Retrieves active owned and shared vignette summaries. Catalog monsters are
 * fetched only when the caller does not own an active vignette so shared
 * vignettes never block owned vignette setup.
 *
 * @returns Vignette Landing State
 */
async function fetchVignetteLandingState(): Promise<VignetteLandingState> {
  const [ownedActive, sharedActive] = await Promise.all([
    getActiveVignetteEncounterForUser(),
    getSharedVignetteEncountersForUser()
  ])

  if (ownedActive) {
    return {
      catalogMonsters: [],
      ownedActive,
      sharedActive
    }
  }

  const catalogMonsters = await getVignetteMonsterSummaries()

  return {
    catalogMonsters,
    ownedActive,
    sharedActive
  }
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
 * Report Vignette Landing Error
 *
 * @param error Error to Report
 */
function reportVignetteLandingError(error: unknown): void {
  console.error('Vignette Landing Fetch Error:', error)
  toast.error(ERROR_MESSAGE())
}

/**
 * Vignette Encounters Card
 *
 * Top-level one-shot surface that is intentionally available without a selected
 * settlement.
 *
 * @returns Vignette Encounters Card
 */
export function VignetteEncountersCard(): ReactElement {
  const [landingState, setLandingState] = useState<VignetteLandingState>(
    EMPTY_VIGNETTE_LANDING_STATE
  )
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)

  const reloadLandingState = useCallback(async () => {
    setIsLoading(true)
    setHasLoadError(false)

    try {
      setLandingState(await fetchVignetteLandingState())
    } catch (error) {
      reportVignetteLandingError(error)
      setHasLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadLandingState(): Promise<void> {
      try {
        const nextLandingState = await fetchVignetteLandingState()
        if (ignore) return

        setLandingState(nextLandingState)
        setHasLoadError(false)
      } catch (error) {
        if (ignore) return

        reportVignetteLandingError(error)
        setHasLoadError(true)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadLandingState()

    return () => {
      ignore = true
    }
  }, [])

  const hasSharedActive = landingState.sharedActive.length > 0
  const hasCatalogMonsters = landingState.catalogMonsters.length > 0
  const isEmptyLanding =
    !landingState.ownedActive && !hasSharedActive && !hasCatalogMonsters

  return (
    <div className="pt-(--header-height) px-2 py-2">
      <Card className="mx-auto max-w-3xl border bg-card/70 mt-2">
        <CardHeader>
          <CardTitle>Vignette Encounters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          {isLoading ? (
            <LanternLoader
              variant="inline"
              title="Kindling the vignette lantern..."
              caption="A one-shot waits beyond the settlement record."
            />
          ) : hasLoadError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-destructive">
              <p className="font-medium">{ERROR_MESSAGE()}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void reloadLandingState()}>
                Try again
              </Button>
            </div>
          ) : isEmptyLanding ? (
            <p className="rounded-md border border-dashed p-3 text-muted-foreground">
              No vignette encounters are available yet.
            </p>
          ) : (
            <>
              {landingState.ownedActive ? (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">
                    Active Vignette Encounter
                  </h3>
                  <VignetteSummaryRow
                    summary={landingState.ownedActive}
                    badge="Owner"
                  />
                </section>
              ) : (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">
                    Available Vignette Encounters
                  </h3>
                  {hasCatalogMonsters ? (
                    <div className="grid gap-2">
                      {landingState.catalogMonsters.map((monster) => (
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
                    {landingState.sharedActive.map((summary) => (
                      <VignetteSummaryRow
                        key={summary.id}
                        summary={summary}
                        badge="Shared"
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
  summary
}: {
  /** Badge Label */
  badge: string
  /** Vignette Encounter Summary */
  summary: VignetteEncounterSummary
}): ReactElement {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border p-3">
      <div className="min-w-0">
        <p className="font-medium leading-none">{summary.monster_name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Level {summary.level_number} · {formatVignetteTurn(summary.turn)}
        </p>
      </div>
      <Badge variant={badge === 'Owner' ? 'default' : 'outline'}>{badge}</Badge>
    </div>
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
