'use client'

import { SurvivorCard } from '@/components/survivor/survivor-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SurvivorCardMode } from '@/lib/enums'
import type {
  ShowdownDetail,
  ShowdownStateSetter,
  ShowdownSurvivorDetail,
  SurvivorDetail,
  SurvivorsStateSetter,
  VignetteEncounterDetail,
  VignetteEncounterStateSetter,
  VignetteEncounterSurvivorDetail,
  VignetteEncounterSurvivorLiveState
} from '@/lib/types'
import { ArrowLeftIcon, ArrowRightIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/** Vignette Survivor Cards Properties */
interface VignetteSurvivorCardsProps {
  /** Selected Vignette Encounter */
  selectedVignetteEncounter: VignetteEncounterDetail
  /** Set Selected Vignette Encounter */
  setSelectedVignetteEncounter: VignetteEncounterStateSetter
}

/** Vignette Showdown Survivor Adapter */
type VignetteShowdownSurvivorAdapter = ShowdownSurvivorDetail &
  VignetteEncounterSurvivorLiveState

/**
 * Vignette Survivor Cards
 *
 * Displays copied active vignette survivors with the existing survivor card
 * component in vignette mode.
 *
 * @param props Vignette Survivor Cards Properties
 * @returns Vignette Survivor Cards
 */
export function VignetteSurvivorCards({
  selectedVignetteEncounter,
  setSelectedVignetteEncounter
}: VignetteSurvivorCardsProps): ReactElement {
  const survivors = useMemo(
    () =>
      Object.values(selectedVignetteEncounter.survivors).sort((a, b) =>
        (a.survivor_name ?? '').localeCompare(b.survivor_name ?? '')
      ),
    [selectedVignetteEncounter.survivors]
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const displayedIndex =
    survivors.length === 0 ? 0 : currentIndex % survivors.length
  const displayedSurvivor = survivors[displayedIndex] ?? null

  const adaptedSurvivors = useMemo(
    () =>
      survivors.map((survivor) => vignetteSurvivorToSurvivorDetail(survivor)),
    [survivors]
  )
  const selectedSurvivor = displayedSurvivor
    ? vignetteSurvivorToSurvivorDetail(displayedSurvivor)
    : null
  const selectedShowdown = useMemo(
    () =>
      vignetteEncounterToShowdownDetail(selectedVignetteEncounter, survivors),
    [selectedVignetteEncounter, survivors]
  )
  const setSurvivors = useCallback<SurvivorsStateSetter>(() => undefined, [])
  const setSelectedShowdown = useCallback<ShowdownStateSetter>(
    (showdownOrUpdater) => {
      setSelectedVignetteEncounter((previousEncounter) => {
        if (!previousEncounter) return previousEncounter

        const previousShowdown = vignetteEncounterToShowdownDetail(
          previousEncounter,
          Object.values(previousEncounter.survivors)
        )
        const nextShowdown =
          typeof showdownOrUpdater === 'function'
            ? showdownOrUpdater(previousShowdown)
            : showdownOrUpdater

        if (!nextShowdown?.showdown_survivors) return previousEncounter

        return {
          ...previousEncounter,
          survivors: Object.fromEntries(
            Object.entries(previousEncounter.survivors).map(
              ([survivorId, survivor]) => {
                const nextSurvivor =
                  nextShowdown.showdown_survivors?.[survivorId]

                return [
                  survivorId,
                  nextSurvivor
                    ? {
                        ...survivor,
                        live_state: {
                          ...survivor.live_state,
                          ...showdownSurvivorToLiveState(
                            nextSurvivor as VignetteShowdownSurvivorAdapter
                          )
                        }
                      }
                    : survivor
                ]
              }
            )
          )
        }
      })
    },
    [setSelectedVignetteEncounter]
  )

  const handlePrevious = useCallback(() => {
    if (survivors.length === 0) return
    setCurrentIndex(
      (index) => (index - 1 + survivors.length) % survivors.length
    )
  }, [survivors.length])

  const handleNext = useCallback(() => {
    if (survivors.length === 0) return
    setCurrentIndex((index) => (index + 1) % survivors.length)
  }, [survivors.length])

  if (survivors.length === 0)
    return (
      <section className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        No active survivors are copied into this vignette.
      </section>
    )

  return (
    <section className="min-w-0 space-y-3">
      <h3 className="text-sm font-semibold">Survivors</h3>
      <div className="p-0">
        {survivors.length > 1 && (
          <div className="survivor_carousel_controls">
            <div className="survivor_carousel_buttons">
              <Button
                className="h-12 w-12"
                variant="ghost"
                size="icon"
                onClick={handlePrevious}>
                <ArrowLeftIcon className="size-8" />
              </Button>
              <Button
                className="h-12 w-12"
                variant="ghost"
                size="icon"
                onClick={handleNext}>
                <ArrowRightIcon className="size-8" />
              </Button>
            </div>
            <div className="survivor_carousel_dots">
              {survivors.map((survivor, index) => {
                const isSelected = index === displayedIndex

                return (
                  <Avatar
                    key={survivor.id}
                    className={`survivor_carousel_dot${isSelected ? ' survivor_carousel_dot--selected' : ''} bg-blue-500 items-center justify-center cursor-pointer`}
                    style={{
                      ['--dot-color' as string]: isSelected
                        ? 'hsl(var(--foreground))'
                        : 'transparent',
                      ['--dot-bg' as string]: 'var(--color-blue-500)'
                    }}
                    onClick={() => setCurrentIndex(index)}>
                    <AvatarFallback className="font-bold text-lg text-white bg-transparent">
                      {(survivor.live_state.dead && (
                        <SkullIcon className="h-4 w-4" />
                      )) ||
                        (survivor.survivor_name &&
                          survivor.survivor_name
                            .split(' ')
                            .map((namePart) => namePart[0])
                            .join('')
                            .slice(0, 2)) ||
                        '??'}
                    </AvatarFallback>
                  </Avatar>
                )
              })}
            </div>
          </div>
        )}

        {selectedSurvivor && (
          <SurvivorCard
            mode={SurvivorCardMode.VIGNETTE_CARD}
            selectedEncounter={null}
            selectedHunt={null}
            selectedSettlement={null}
            selectedShowdown={selectedShowdown}
            selectedSurvivor={selectedSurvivor}
            setSelectedShowdown={setSelectedShowdown}
            setSurvivors={setSurvivors}
            survivors={adaptedSurvivors}
          />
        )}
      </div>
    </section>
  )
}

/**
 * Showdown Survivor To Live State
 *
 * @param survivor Showdown Survivor Adapter
 * @returns Vignette Survivor Live State
 */
function showdownSurvivorToLiveState(
  survivor: VignetteShowdownSurvivorAdapter
): VignetteEncounterSurvivorDetail['live_state'] {
  const {
    accuracy_tokens,
    activation_used,
    arm_heavy_damage,
    arm_light_damage,
    bleeding_tokens,
    block_tokens,
    body_heavy_damage,
    body_light_damage,
    brain_light_damage,
    dead,
    deflect_tokens,
    evasion_tokens,
    head_heavy_damage,
    insanity_tokens,
    knocked_down,
    leg_heavy_damage,
    leg_light_damage,
    luck_tokens,
    movement_tokens,
    movement_used,
    notes,
    priority_target,
    retired,
    scout,
    speed_tokens,
    strength_tokens,
    survival,
    survival_tokens,
    waist_heavy_damage,
    waist_light_damage
  } = survivor

  return {
    accuracy_tokens,
    activation_used,
    arm_heavy_damage,
    arm_light_damage,
    bleeding_tokens,
    block_tokens,
    body_heavy_damage,
    body_light_damage,
    brain_light_damage,
    dead,
    deflect_tokens,
    evasion_tokens,
    head_heavy_damage,
    insanity_tokens,
    knocked_down,
    leg_heavy_damage,
    leg_light_damage,
    luck_tokens,
    movement_tokens,
    movement_used,
    notes,
    priority_target,
    retired,
    scout,
    speed_tokens,
    strength_tokens,
    survival,
    survival_tokens,
    waist_heavy_damage,
    waist_light_damage
  }
}

/**
 * Vignette Survivor To Survivor Detail
 *
 * @param survivor Vignette Encounter Survivor
 * @returns Survivor Detail Adapter
 */
function vignetteSurvivorToSurvivorDetail(
  survivor: VignetteEncounterSurvivorDetail
): SurvivorDetail {
  return {
    ...survivor,
    ...survivor.live_state,
    abilities_impairments: survivor.abilities_impairments.map((item) => ({
      ...item.ability_impairment,
      ability_impairment_name: item.ability_impairment.ability_impairment_name,
      id: item.ability_impairment.id,
      rules: item.ability_impairment.rules ?? ''
    })),
    cursed_gear: [],
    disorders: survivor.disorders.map((item) => ({
      ...item.disorder,
      disorder_name: item.disorder.disorder_name,
      id: item.disorder.id,
      rules: item.disorder.rules ?? ''
    })),
    embarked: true,
    fighting_arts: survivor.fighting_arts.map((item) => item.fighting_art),
    gear_grid: null,
    knowledge_1: null,
    knowledge_2: null,
    neurosis: null,
    philosophy: null,
    secret_fighting_arts: survivor.secret_fighting_arts.map(
      (item) => item.secret_fighting_art
    ),
    tenet_knowledge: null,
    weapon_type: null
  } as unknown as SurvivorDetail
}

/**
 * Vignette Encounter To Showdown Detail
 *
 * @param encounter Vignette Encounter
 * @param survivors Vignette Survivors
 * @returns Showdown Detail Adapter
 */
function vignetteEncounterToShowdownDetail(
  encounter: VignetteEncounterDetail,
  survivors: VignetteEncounterSurvivorDetail[]
): ShowdownDetail {
  return {
    id: encounter.id,
    settlement_id: null,
    monster_id: encounter.vignette_monster_id,
    monster_level: encounter.level_number,
    showdown_type: 'STANDARD',
    turn: encounter.turn,
    showdown_monsters: null,
    showdown_survivors: Object.fromEntries(
      survivors.map((survivor) => [
        survivor.id,
        {
          ...survivor.live_state,
          id: survivor.id,
          settlement_id: null,
          showdown_id: encounter.id,
          survivor_id: survivor.id
        } as unknown as VignetteShowdownSurvivorAdapter
      ])
    )
  } as unknown as ShowdownDetail
}
