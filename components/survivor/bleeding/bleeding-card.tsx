'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { updateEncounterSurvivor } from '@/lib/dal/encounter-survivor'
import { updateHuntSurvivor } from '@/lib/dal/hunt-survivor'
import { updateShowdownSurvivor } from '@/lib/dal/showdown-survivor'
import { SurvivorCardMode } from '@/lib/enums'
import {
  EncounterDetail,
  EncounterStateSetter,
  HuntDetail,
  HuntStateSetter,
  ShowdownDetail,
  ShowdownStateSetter,
  SurvivorDetail
} from '@/lib/types'
import { ReactElement } from 'react'

/**
 * Bleeding Card Properties
 */
interface BleedingCardProps {
  /** Mode */
  mode: SurvivorCardMode
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Encounter */
  selectedEncounter: EncounterDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Hunt */
  setSelectedHunt?: HuntStateSetter
  /** Set Selected Encounter */
  setSelectedEncounter?: EncounterStateSetter
  /** Set Selected Showdown */
  setSelectedShowdown?: ShowdownStateSetter
}

/**
 * Bleeding Card Component
 *
 * Displays a standalone bleeding token control during an active showdown.
 *
 * @param props Bleeding Card Properties
 * @returns Bleeding Card Component
 */
export function BleedingCard({
  mode,
  selectedHunt,
  selectedEncounter,
  selectedShowdown,
  selectedSurvivor,
  setSelectedHunt,
  setSelectedEncounter,
  setSelectedShowdown
}: BleedingCardProps): ReactElement {
  const mutate = useOptimisticMutation()

  const huntSurvivorRecord =
    mode !== SurvivorCardMode.HUNT_CARD ||
    !selectedHunt?.hunt_survivors ||
    !selectedSurvivor?.id
      ? undefined
      : Object.values(selectedHunt.hunt_survivors).find(
          (hs) => hs.survivor_id === selectedSurvivor.id
        )

  const encounterSurvivorRecord =
    mode !== SurvivorCardMode.ENCOUNTER_CARD ||
    !selectedEncounter?.encounter_survivors ||
    !selectedSurvivor?.id
      ? undefined
      : Object.values(selectedEncounter.encounter_survivors).find(
          (es) => es.survivor_id === selectedSurvivor.id
        )

  const showdownSurvivorRecord =
    mode !== SurvivorCardMode.SHOWDOWN_CARD ||
    !selectedShowdown?.showdown_survivors ||
    !selectedSurvivor?.id
      ? undefined
      : Object.values(selectedShowdown.showdown_survivors).find(
          (ss) => ss.survivor_id === selectedSurvivor.id
        )

  const bleedingTokens =
    huntSurvivorRecord?.bleeding_tokens ??
    encounterSurvivorRecord?.bleeding_tokens ??
    showdownSurvivorRecord?.bleeding_tokens

  if (!selectedSurvivor?.id || bleedingTokens === undefined) return <></>

  const saveBleedingTokens = (value: number) => {
    if (
      mode === SurvivorCardMode.HUNT_CARD &&
      huntSurvivorRecord &&
      selectedHunt?.hunt_survivors &&
      setSelectedHunt
    ) {
      const previousValue = huntSurvivorRecord.bleeding_tokens
      const hsKey = Object.entries(selectedHunt.hunt_survivors).find(
        ([, hs]) => hs.id === huntSurvivorRecord.id
      )?.[0]
      if (!hsKey) return

      setSelectedHunt({
        ...selectedHunt,
        hunt_survivors: {
          ...selectedHunt.hunt_survivors,
          [hsKey]: { ...huntSurvivorRecord, bleeding_tokens: value }
        }
      })

      void mutate({
        context: 'Bleeding Tokens Update',
        persist: () =>
          updateHuntSurvivor(huntSurvivorRecord.id, {
            bleeding_tokens: value
          }),
        rollback: () => {
          setSelectedHunt({
            ...selectedHunt,
            hunt_survivors: {
              ...selectedHunt.hunt_survivors,
              [hsKey]: { ...huntSurvivorRecord, bleeding_tokens: previousValue }
            }
          })
        }
      })
    } else if (
      mode === SurvivorCardMode.ENCOUNTER_CARD &&
      encounterSurvivorRecord &&
      selectedEncounter?.encounter_survivors &&
      setSelectedEncounter
    ) {
      const previousValue = encounterSurvivorRecord.bleeding_tokens
      const esKey = Object.entries(selectedEncounter.encounter_survivors).find(
        ([, es]) => es.id === encounterSurvivorRecord.id
      )?.[0]
      if (!esKey) return

      setSelectedEncounter({
        ...selectedEncounter,
        encounter_survivors: {
          ...selectedEncounter.encounter_survivors,
          [esKey]: { ...encounterSurvivorRecord, bleeding_tokens: value }
        }
      })

      void mutate({
        context: 'Bleeding Tokens Update',
        persist: () =>
          updateEncounterSurvivor(encounterSurvivorRecord.id, {
            bleeding_tokens: value
          }),
        rollback: () => {
          setSelectedEncounter({
            ...selectedEncounter,
            encounter_survivors: {
              ...selectedEncounter.encounter_survivors,
              [esKey]: {
                ...encounterSurvivorRecord,
                bleeding_tokens: previousValue
              }
            }
          })
        }
      })
    } else if (
      mode === SurvivorCardMode.SHOWDOWN_CARD &&
      showdownSurvivorRecord &&
      selectedShowdown?.showdown_survivors &&
      setSelectedShowdown
    ) {
      const previousValue = showdownSurvivorRecord.bleeding_tokens
      const ssKey = Object.entries(selectedShowdown.showdown_survivors).find(
        ([, ss]) => ss.id === showdownSurvivorRecord.id
      )?.[0]
      if (!ssKey) return

      setSelectedShowdown({
        ...selectedShowdown,
        showdown_survivors: {
          ...selectedShowdown.showdown_survivors,
          [ssKey]: { ...showdownSurvivorRecord, bleeding_tokens: value }
        }
      })

      void mutate({
        context: 'Bleeding Tokens Update',
        persist: () =>
          updateShowdownSurvivor(showdownSurvivorRecord.id, {
            bleeding_tokens: value
          }),
        rollback: () => {
          setSelectedShowdown({
            ...selectedShowdown,
            showdown_survivors: {
              ...selectedShowdown.showdown_survivors,
              [ssKey]: {
                ...showdownSurvivorRecord,
                bleeding_tokens: previousValue
              }
            }
          })
        }
      })
    }
  }

  return (
    <Card className="p-2 border-0 flex flex-row justify-between items-center">
      <CardTitle className="text-sm">Bleeding Tokens</CardTitle>
      <CardContent className="p-0">
        <NumericInput
          label="Bleeding Tokens"
          value={bleedingTokens}
          min={0}
          onChange={saveBleedingTokens}
          className="w-20"
        />
      </CardContent>
    </Card>
  )
}
