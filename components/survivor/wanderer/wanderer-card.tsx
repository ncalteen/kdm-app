'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { updateSurvivor } from '@/lib/dal/survivor'
import { AenasState } from '@/lib/enums'
import {
  ERROR_MESSAGE,
  SURVIVOR_DISPOSITION_UPDATED_MESSAGE,
  SURVIVOR_STATE_UPDATED_MESSAGE
} from '@/lib/messages'
import { SurvivorDetail } from '@/lib/types'
import { ReactElement, useCallback, useState } from 'react'
import { toast } from 'sonner'

/**
 * Wanderer Card Properties
 */
interface WandererCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Wanderer Card Component
 *
 * Displays wanderer-specific attributes including disposition (always shown)
 * and state (shown only for Aenas). Wanderers are special survivors that
 * join the settlement through specific events.
 *
 * @param props Wanderer Card Properties
 * @returns Wanderer Card Component
 */
export function WandererCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: WandererCardProps): ReactElement {
  const [aenasState, setAenasState] = useState<string>(
    selectedSurvivor?.aenas_state ?? AenasState.HUNGRY
  )
  const [disposition, setDisposition] = useState<number>(
    selectedSurvivor?.disposition ?? 0
  )

  // Reset state when the selected survivor changes (render-time comparison
  // to avoid cascading renders from useEffect).
  const [prevSurvivorKey, setPrevSurvivorKey] = useState(
    () =>
      `${selectedSurvivor?.id}-${selectedSurvivor?.aenas_state}-${selectedSurvivor?.disposition}`
  )
  const currentSurvivorKey = `${selectedSurvivor?.id}-${selectedSurvivor?.aenas_state}-${selectedSurvivor?.disposition}`

  if (prevSurvivorKey !== currentSurvivorKey) {
    setPrevSurvivorKey(currentSurvivorKey)
    setAenasState(selectedSurvivor?.aenas_state ?? AenasState.HUNGRY)
    setDisposition(selectedSurvivor?.disposition ?? 0)
  }

  /**
   * Handles state selection changes (for Aenas).
   *
   * @param value Selected State Value
   */
  const handleStateChange = useCallback(
    (value: string) => {
      if (!selectedSurvivor?.id || selectedSurvivor?.survivor_name !== 'Aenas')
        return

      const oldState = aenasState
      const oldSurvivors = [...survivors]

      setAenasState(value)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, aenas_state: value as 'Content' | 'Hungry' }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, {
        aenas_state: value as 'Content' | 'Hungry'
      })
        .then(() =>
          toast.success(
            SURVIVOR_STATE_UPDATED_MESSAGE(
              selectedSurvivor?.survivor_name ?? 'Aenas',
              value
            )
          )
        )
        .catch((error) => {
          setAenasState(oldState)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Survivor State:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      aenasState,
      selectedSurvivor?.survivor_name,
      selectedSurvivor?.id,
      setSurvivors,
      survivors
    ]
  )

  /**
   * Handles disposition changes.
   *
   * @param value New Disposition Value
   */
  const handleDispositionChange = useCallback(
    (value: number) => {
      if (!selectedSurvivor?.id) return

      const oldDisposition = disposition
      const oldSurvivors = [...survivors]

      setDisposition(value)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, disposition: value } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { disposition: value })
        .then(() => toast.success(SURVIVOR_DISPOSITION_UPDATED_MESSAGE()))
        .catch((error) => {
          setDisposition(oldDisposition)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Survivor Disposition:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [disposition, selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0 gap-0">
      {/* Wanderer Attributes */}
      <CardContent className="flex flex-col gap-2 p-0">
        {/* Disposition (Always Shown) */}
        <div className="flex flex-row items-center gap-2 justify-between">
          <Label className="text-xs">Disposition</Label>
          <NumericInput
            label="Disposition"
            value={disposition}
            onChange={handleDispositionChange}
            className="w-20"
          />
        </div>

        {/* State (Aenas) */}
        {selectedSurvivor?.survivor_name === 'Aenas' && (
          <div className="flex flex-row items-center gap-2 justify-between">
            <Label className="text-xs">State</Label>
            <Select value={aenasState} onValueChange={handleStateChange}>
              <SelectTrigger id="state-select" name="state">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AenasState).map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
