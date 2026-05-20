'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { LocalStateType } from '@/contexts/local-context'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { updateShowdownSurvivor } from '@/lib/dal/showdown-survivor'
import {
  ShowdownDetail,
  ShowdownStateSetter,
  SurvivorDetail
} from '@/lib/types'
import { ReactElement } from 'react'

/**
 * Bleeding Card Properties
 */
interface BleedingCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
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
  local,
  selectedShowdown,
  selectedSurvivor,
  setSelectedShowdown
}: BleedingCardProps): ReactElement {
  const mutate = useOptimisticMutation()

  const showdownSurvivorRecord =
    !selectedShowdown?.showdown_survivors || !selectedSurvivor?.id
      ? undefined
      : Object.values(selectedShowdown.showdown_survivors).find(
          (ss) => ss.survivor_id === selectedSurvivor.id
        )

  if (
    !selectedSurvivor?.id ||
    !selectedShowdown?.showdown_survivors ||
    !showdownSurvivorRecord
  )
    return <></>

  const bleedingTokens = showdownSurvivorRecord.bleeding_tokens

  const saveBleedingTokens = (value: number) => {
    if (selectedShowdown?.showdown_survivors && setSelectedShowdown) {
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
