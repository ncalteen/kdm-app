'use client'

import { LanternLoader } from '@/components/generic/lantern-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  createVignetteEncounter,
  getVignetteMonster
} from '@/lib/dal/vignette-encounter'
import { ERROR_MESSAGE } from '@/lib/messages'
import type {
  VignetteEncounterSummary,
  VignetteLandingState,
  VignetteMonsterDetail,
  VignetteMonsterLevelDetail,
  VignetteMonsterSummary,
  VignetteSurvivorDetail
} from '@/lib/types'
import { VignetteCreateInputSchema } from '@/schemas/vignette-encounter'
import { Loader2Icon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

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
 * Sorted Vignette Monster Detail Levels
 *
 * @param monster Vignette Monster Detail
 * @returns Sorted Vignette Monster Levels
 */
function sortedVignetteMonsterLevels(
  monster: VignetteMonsterDetail
): VignetteMonsterLevelDetail[] {
  return [...monster.levels].sort((a, b) => a.level_number - b.level_number)
}

/**
 * Format Vignette Label
 *
 * @param value Raw Label Value
 * @returns Display Label
 */
function formatVignetteLabel(value: string | null | undefined): string {
  if (!value) return '-'

  return value
    .toLowerCase()
    .split('_')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

/**
 * Format Vignette Number
 *
 * @param value Number Value
 * @returns Display Number
 */
function formatVignetteNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? '-' : value.toString()
}

/**
 * Vignette Stat Row
 *
 * @param props Vignette Stat Row Properties
 * @returns Vignette Stat Row
 */
function VignetteStatRow({
  label,
  value
}: {
  /** Stat Label */
  label: string
  /** Stat Value */
  value: number | null | undefined
}): ReactElement {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">
        {formatVignetteNumber(value)}
      </span>
    </div>
  )
}

/** Vignette Stat Item */
interface VignetteStatItem {
  /** Stat Label */
  label: string
  /** Stat Value */
  value: number | null | undefined
}

/**
 * Vignette Stat Group
 *
 * @param props Vignette Stat Group Properties
 * @returns Vignette Stat Group
 */
function VignetteStatGroup({
  columnsClassName = 'sm:grid-cols-2',
  stats,
  title
}: {
  /** Responsive Grid Columns */
  columnsClassName?: string
  /** Stat Items */
  stats: VignetteStatItem[]
  /** Group Title */
  title: string
}): ReactElement {
  return (
    <div className="space-y-2">
      <h5 className="text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </h5>
      <div className={`grid gap-2 ${columnsClassName}`}>
        {stats.map((stat) => (
          <VignetteStatRow
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>
    </div>
  )
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
  const catalogMonsterRequestRef = useRef(0)
  const [selectedCatalogMonster, setSelectedCatalogMonster] =
    useState<VignetteMonsterDetail | null>(null)
  const [selectedCatalogMonsterId, setSelectedCatalogMonsterId] = useState('')
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number | null>(
    null
  )
  const [isCatalogMonsterLoading, setIsCatalogMonsterLoading] = useState(false)
  const [hasCatalogMonsterLoadError, setHasCatalogMonsterLoadError] =
    useState(false)
  const [isCreatingVignetteEncounter, setIsCreatingVignetteEncounter] =
    useState(false)

  const handleSelectVignetteEncounter = useCallback(
    (summary: VignetteEncounterSummary) => {
      setSelectedVignetteEncounterId(summary.id)
    },
    [setSelectedVignetteEncounterId]
  )

  const handleInspectCatalogMonster = useCallback(
    (monster: VignetteMonsterSummary) => {
      const requestId = catalogMonsterRequestRef.current + 1
      catalogMonsterRequestRef.current = requestId

      setSelectedCatalogMonsterId(monster.id)
      setSelectedCatalogMonster(null)
      setSelectedLevelNumber(null)
      setHasCatalogMonsterLoadError(false)
      setIsCatalogMonsterLoading(true)

      getVignetteMonster(monster.id)
        .then((detail) => {
          if (catalogMonsterRequestRef.current !== requestId) return

          const levels = detail ? sortedVignetteMonsterLevels(detail) : []
          setSelectedCatalogMonster(detail)
          setSelectedLevelNumber(
            levels.length === 1 ? levels[0].level_number : null
          )
          if (!detail) {
            setSelectedCatalogMonsterId('')
            setHasCatalogMonsterLoadError(true)
          }
        })
        .catch((error: unknown) => {
          if (catalogMonsterRequestRef.current !== requestId) return

          console.error('Vignette Monster Detail Fetch Error:', error)
          setSelectedCatalogMonsterId('')
          setSelectedCatalogMonster(null)
          setSelectedLevelNumber(null)
          setHasCatalogMonsterLoadError(true)
          toast.error(ERROR_MESSAGE())
        })
        .finally(() => {
          if (catalogMonsterRequestRef.current === requestId)
            setIsCatalogMonsterLoading(false)
        })
    },
    []
  )

  const handleSelectCatalogMonster = useCallback(
    (vignetteMonsterId: string) => {
      const monster = vignetteLandingState.catalogMonsters.find(
        (catalogMonster) => catalogMonster.id === vignetteMonsterId
      )
      if (!monster) return

      handleInspectCatalogMonster(monster)
    },
    [handleInspectCatalogMonster, vignetteLandingState.catalogMonsters]
  )

  const selectedLevel = useMemo(
    () =>
      selectedCatalogMonster?.levels.find(
        (level) => level.level_number === selectedLevelNumber
      ) ?? null,
    [selectedCatalogMonster?.levels, selectedLevelNumber]
  )

  const handleCreateVignetteEncounter = useCallback(() => {
    if (!selectedCatalogMonster || !selectedLevelNumber) return

    const parsedInput = VignetteCreateInputSchema.safeParse({
      vignette_monster_id: selectedCatalogMonster.id,
      level_number: selectedLevelNumber
    })

    if (!parsedInput.success) {
      toast.error(parsedInput.error.message)
      return
    }

    setIsCreatingVignetteEncounter(true)

    createVignetteEncounter(parsedInput.data)
      .then((vignetteEncounterId) => {
        toast.success('A vignette lantern is lit. The darkness gathers close.')
        setSelectedVignetteEncounterId(vignetteEncounterId)
        refetchVignetteLandingState()
      })
      .catch((error: unknown) => {
        console.error('Vignette Encounter Create Error:', error)
        toast.error(error instanceof Error ? error.message : ERROR_MESSAGE())
      })
      .finally(() => setIsCreatingVignetteEncounter(false))
  }, [
    refetchVignetteLandingState,
    selectedCatalogMonster,
    selectedLevelNumber,
    setSelectedVignetteEncounterId
  ])

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
                    <Select
                      value={selectedCatalogMonsterId}
                      onValueChange={handleSelectCatalogMonster}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a vignette encounter..." />
                      </SelectTrigger>
                      <SelectContent>
                        {vignetteLandingState.catalogMonsters.map((monster) => {
                          const levels = sortedVignetteLevels(monster)

                          return (
                            <SelectItem key={monster.id} value={monster.id}>
                              {monster.monster_name} ·{' '}
                              {formatVignetteLabel(monster.source_monster_type)}
                              {levels.length > 1 && (
                                <>
                                  {' '}
                                  · Levels{' '}
                                  {levels
                                    .map((level) => level.level_number)
                                    .join(', ')}
                                </>
                              )}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="rounded-md border border-dashed p-3 text-muted-foreground">
                      No available vignette encounters.
                    </p>
                  )}
                </section>
              )}

              {!vignetteLandingState.ownedActive && hasCatalogMonsters && (
                <VignetteCatalogDetailPanel
                  hasLoadError={hasCatalogMonsterLoadError}
                  isCreating={isCreatingVignetteEncounter}
                  isLoading={isCatalogMonsterLoading}
                  monster={selectedCatalogMonster}
                  selectedLevel={selectedLevel}
                  selectedLevelNumber={selectedLevelNumber}
                  onCreate={handleCreateVignetteEncounter}
                  onSelectLevel={setSelectedLevelNumber}
                />
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
 * Vignette Catalog Detail Panel
 *
 * @param props Vignette Catalog Detail Panel Properties
 * @returns Vignette Catalog Detail Panel
 */
function VignetteCatalogDetailPanel({
  hasLoadError,
  isCreating,
  isLoading,
  monster,
  onCreate,
  onSelectLevel,
  selectedLevel,
  selectedLevelNumber
}: {
  /** Whether The Detail Load Failed */
  hasLoadError: boolean
  /** Whether A Vignette Is Being Created */
  isCreating: boolean
  /** Whether The Detail Is Loading */
  isLoading: boolean
  /** Vignette Monster Detail */
  monster: VignetteMonsterDetail | null
  /** Create Active Vignette */
  onCreate: () => void
  /** Select Level Number */
  onSelectLevel: (levelNumber: number) => void
  /** Selected Level */
  selectedLevel: VignetteMonsterLevelDetail | null
  /** Selected Level Number */
  selectedLevelNumber: number | null
}): ReactElement {
  if (isLoading)
    return (
      <section className="rounded-md border p-3">
        <LanternLoader
          variant="inline"
          title="Reading the monster record..."
          caption="Ink scratches at the edge of the lantern light."
        />
      </section>
    )

  if (hasLoadError)
    return (
      <section className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-destructive">
        <p className="font-medium">{ERROR_MESSAGE()}</p>
      </section>
    )

  if (!monster)
    return (
      <section className="rounded-md border border-dashed p-3 text-muted-foreground">
        Choose a vignette encounter to inspect its lantern-lit horrors.
      </section>
    )

  const levels = sortedVignetteMonsterLevels(monster)
  const shouldShowLevelSelection = levels.length > 1

  return (
    <section className="space-y-4 rounded-md border p-3">
      <div className="space-y-3 rounded-md border border-primary/30 bg-primary/5 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-primary">
              Monster Details
            </p>
            <h3 className="mt-1 text-sm font-semibold">
              {monster.monster_name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatVignetteLabel(monster.source_monster_type)}
            </p>
          </div>
          {monster.multi_monster && (
            <Badge variant="outline">Multi-monster</Badge>
          )}
        </div>

        {shouldShowLevelSelection && (
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <Button
                key={level.id}
                type="button"
                variant={
                  selectedLevelNumber === level.level_number
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => onSelectLevel(level.level_number)}>
                Level {level.level_number}
              </Button>
            ))}
          </div>
        )}

        {selectedLevel ? (
          <VignetteLevelPreview level={selectedLevel} />
        ) : (
          shouldShowLevelSelection && (
            <p className="rounded-md border border-dashed bg-background/60 p-3 text-muted-foreground">
              Select a level to inspect its cards, stats, moods, traits, and
              survivor statuses.
            </p>
          )
        )}
      </div>

      <VignetteSurvivorPresetList survivors={monster.survivors} />

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!selectedLevel || isCreating}
          onClick={onCreate}>
          {isCreating && <Loader2Icon className="h-4 w-4 animate-spin" />}
          Start vignette
        </Button>
      </div>
    </section>
  )
}

/**
 * Vignette Level Preview
 *
 * @param props Vignette Level Preview Properties
 * @returns Vignette Level Preview
 */
function VignetteLevelPreview({
  level
}: {
  /** Vignette Monster Level */
  level: VignetteMonsterLevelDetail
}): ReactElement {
  return (
    <div className="space-y-3">
      <VignetteStatGroup
        columnsClassName="sm:grid-cols-3"
        title="Stats"
        stats={[
          { label: 'Toughness', value: level.toughness },
          { label: 'Damage', value: level.damage },
          { label: 'Life', value: level.life }
        ]}
      />

      <VignetteStatGroup
        columnsClassName="sm:grid-cols-2 lg:grid-cols-3"
        title="Attributes"
        stats={[
          { label: 'Movement', value: level.movement },
          { label: 'Speed', value: level.speed },
          { label: 'Accuracy', value: level.accuracy },
          { label: 'Strength', value: level.strength },
          { label: 'Evasion', value: level.evasion },
          { label: 'Luck', value: level.luck }
        ]}
      />

      <div className="grid gap-2 lg:grid-cols-3">
        <VignetteCatalogRuleList
          emptyText="No moods."
          items={level.moods.map((mood) => ({
            id: mood.id,
            name: mood.mood.mood_name,
            rules: mood.mood.rules
          }))}
          title="Moods"
        />
        <VignetteCatalogRuleList
          emptyText="No traits."
          items={level.traits.map((trait) => ({
            id: trait.id,
            name: trait.trait.trait_name,
            rules: trait.trait.rules
          }))}
          title="Traits"
        />
        <VignetteCatalogRuleList
          emptyText="No survivor statuses."
          items={level.survivor_statuses.map((survivorStatus) => ({
            id: survivorStatus.id,
            name: survivorStatus.survivor_status.survivor_status_name,
            rules: survivorStatus.survivor_status.rules
          }))}
          title="Survivor Statuses"
        />
      </div>
    </div>
  )
}

/** Vignette Catalog Rule Item */
interface VignetteCatalogRuleItem {
  /** Item ID */
  id: string
  /** Item Name */
  name: string
  /** Item Rules */
  rules: string | null
}

/**
 * Vignette Catalog Rule List
 *
 * @param props Vignette Catalog Rule List Properties
 * @returns Vignette Catalog Rule List
 */
function VignetteCatalogRuleList({
  emptyText,
  items,
  title
}: {
  /** Empty Text */
  emptyText: string
  /** Rule Items */
  items: VignetteCatalogRuleItem[]
  /** List Title */
  title: string
}): ReactElement {
  return (
    <div className="rounded-md border p-3">
      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </h4>
      {items.length > 0 ? (
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="space-y-1">
              <p className="font-medium leading-none">{item.name}</p>
              {item.rules && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.rules}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">{emptyText}</p>
      )}
    </div>
  )
}

/**
 * Vignette Survivor Preset List
 *
 * @param props Vignette Survivor Preset List Properties
 * @returns Vignette Survivor Preset List
 */
function VignetteSurvivorPresetList({
  survivors
}: {
  /** Survivor Presets */
  survivors: VignetteSurvivorDetail[]
}): ReactElement {
  const sortedSurvivors = [...survivors].sort((a, b) =>
    (a.survivor_name ?? '').localeCompare(b.survivor_name ?? '')
  )

  return (
    <div className="space-y-2 rounded-md border border-muted-foreground/20 bg-muted/20 p-3">
      <h4 className="text-sm font-semibold">Survivor Details</h4>
      {sortedSurvivors.length > 0 ? (
        <div className="grid gap-2 lg:grid-cols-2">
          {sortedSurvivors.map((survivor) => (
            <VignetteSurvivorPresetRow key={survivor.id} survivor={survivor} />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-3 text-muted-foreground">
          No survivors are tied to this vignette.
        </p>
      )}
    </div>
  )
}

/**
 * Vignette Survivor Preset Row
 *
 * @param props Vignette Survivor Preset Row Properties
 * @returns Vignette Survivor Preset Row
 */
function VignetteSurvivorPresetRow({
  survivor
}: {
  /** Survivor Preset */
  survivor: VignetteSurvivorDetail
}): ReactElement {
  const disorders = survivor.disorders.map(
    (disorder) => disorder.disorder.disorder_name
  )
  const fightingArts = survivor.fighting_arts.map(
    (fightingArt) => fightingArt.fighting_art.fighting_art_name
  )
  const secretFightingArts = survivor.secret_fighting_arts.map(
    (secretFightingArt) =>
      secretFightingArt.secret_fighting_art.secret_fighting_art_name
  )
  const abilitiesAndImpairments = survivor.abilities_impairments.map(
    (abilityImpairment) =>
      abilityImpairment.ability_impairment.ability_impairment_name
  )

  return (
    <div className="space-y-3 rounded-md border border-l-4 border-l-primary/60 bg-background p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-primary">
            {survivor.survivor_name ?? 'Unnamed survivor'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatVignetteLabel(survivor.survivor_type)}
          </p>
        </div>
        <Badge variant="outline">{formatVignetteLabel(survivor.gender)}</Badge>
      </div>

      <VignetteStatGroup
        title="Stats"
        stats={[
          { label: 'Survival', value: survivor.survival },
          { label: 'Insanity', value: survivor.insanity }
        ]}
      />

      <VignetteStatGroup
        columnsClassName="sm:grid-cols-2 lg:grid-cols-3"
        title="Attributes"
        stats={[
          { label: 'Movement', value: survivor.movement },
          { label: 'Speed', value: survivor.speed },
          { label: 'Accuracy', value: survivor.accuracy },
          { label: 'Strength', value: survivor.strength },
          { label: 'Evasion', value: survivor.evasion },
          { label: 'Luck', value: survivor.luck }
        ]}
      />

      <VignetteStatGroup
        title="Other"
        stats={[
          { label: 'Courage', value: survivor.courage },
          { label: 'Understanding', value: survivor.understanding }
        ]}
      />

      <VignetteTagList title="Abilities" values={abilitiesAndImpairments} />
      <VignetteTagList title="Disorders" values={disorders} />
      <VignetteTagList title="Fighting Arts" values={fightingArts} />
      <VignetteTagList
        title="Secret Fighting Arts"
        values={secretFightingArts}
      />
    </div>
  )
}

/**
 * Vignette Tag List
 *
 * @param props Vignette Tag List Properties
 * @returns Vignette Tag List
 */
function VignetteTagList({
  title,
  values
}: {
  /** Tag List Title */
  title: string
  /** Tag Values */
  values: string[]
}): ReactElement {
  return (
    <div className="space-y-2">
      <h5 className="text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </h5>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <Badge key={value} variant="outline">
              {value}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">None.</p>
      )}
    </div>
  )
}
