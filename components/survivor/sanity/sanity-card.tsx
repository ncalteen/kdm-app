'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updateHuntSurvivor } from '@/lib/dal/hunt-survivor'
import { updateShowdownSurvivor } from '@/lib/dal/showdown-survivor'
import { updateSurvivor } from '@/lib/dal/survivor'
import { DatabaseSurvivorType, SurvivorCardMode } from '@/lib/enums'
import {
  ERROR_MESSAGE,
  INSANITY_MINIMUM_ERROR_MESSAGE,
  SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE,
  SURVIVOR_BRAIN_LIGHT_DAMAGE_UPDATED_MESSAGE,
  SURVIVOR_INSANITY_UPDATED_MESSAGE,
  SURVIVOR_TORMENT_UPDATED_MESSAGE,
  TORMENT_MINIMUM_ERROR_MESSAGE
} from '@/lib/messages'
import {
  HuntDetail,
  SettlementDetail,
  ShowdownDetail,
  SurvivorDetail
} from '@/lib/types'
import { BrainIcon, Shield } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Sanity Card Properties
 */
interface SanityCardProps {
  /** Display Text */
  displayText: boolean
  /** Display Torment Input */
  displayTormentInput: boolean
  /** Mode */
  mode: SurvivorCardMode
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Hunt (for optimistic token updates) */
  setSelectedHunt?: (hunt: HuntDetail | null) => void
  /** Set Selected Showdown (for optimistic token updates) */
  setSelectedShowdown?: (showdown: ShowdownDetail | null) => void
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Survivor Sanity Card Component
 *
 * This component displays the survivor's insanity level and brain state. It
 * includes an insanity counter and a checkbox for light brain damage. For Arc
 * survivors, it also shows the Torment attribute.
 *
 * @param props Sanity Card Properties
 * @returns Sanity Card Component
 */
export function SanityCard({
  displayText,
  displayTormentInput,
  mode,
  selectedHunt,
  selectedSettlement,
  selectedShowdown,
  selectedSurvivor,
  setSelectedHunt,
  setSelectedShowdown,
  setSurvivors,
  survivors
}: SanityCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [insanity, setInsanity] = useState(selectedSurvivor?.insanity ?? 0)
  const [brainLightDamage, setBrainLightDamage] = useState(
    selectedSurvivor?.brain_light_damage ?? false
  )
  const [torment, setTorment] = useState(selectedSurvivor?.torment ?? 0)

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id
    setInsanity(selectedSurvivor?.insanity ?? 0)
    setBrainLightDamage(selectedSurvivor?.brain_light_damage ?? false)
    setTorment(selectedSurvivor?.torment ?? 0)
  }

  /** Hunt survivor record for the current survivor */
  const huntSurvivorRecord = useMemo(() => {
    if (mode !== SurvivorCardMode.HUNT_CARD || !selectedHunt?.hunt_survivors)
      return undefined
    return Object.values(selectedHunt.hunt_survivors).find(
      (hs) => hs.survivor_id === selectedSurvivor?.id
    )
  }, [mode, selectedHunt, selectedSurvivor?.id])

  /** Showdown survivor record for the current survivor */
  const showdownSurvivorRecord = useMemo(() => {
    if (
      mode !== SurvivorCardMode.SHOWDOWN_CARD ||
      !selectedShowdown?.showdown_survivors
    )
      return undefined
    return Object.values(selectedShowdown.showdown_survivors).find(
      (ss) => ss.survivor_id === selectedSurvivor?.id
    )
  }, [mode, selectedShowdown, selectedSurvivor?.id])

  /** Current insanity tokens derived from hunt/showdown survivor record */
  const insanityTokens =
    huntSurvivorRecord?.insanity_tokens ??
    showdownSurvivorRecord?.insanity_tokens ??
    0

  /**
   * Save Insanity Tokens
   *
   * Persists insanity token changes to the hunt or showdown survivor table.
   *
   * @param value New Insanity Tokens Value
   */
  const saveInsanityTokens = useCallback(
    (value: number) => {
      if (!selectedSurvivor?.id) return

      if (
        mode === SurvivorCardMode.HUNT_CARD &&
        huntSurvivorRecord &&
        selectedHunt?.hunt_survivors &&
        setSelectedHunt
      ) {
        const previousValue = huntSurvivorRecord.insanity_tokens
        const hsKey = Object.entries(selectedHunt.hunt_survivors).find(
          ([, hs]) => hs.id === huntSurvivorRecord.id
        )?.[0]
        if (!hsKey) return

        // Optimistic update
        setSelectedHunt({
          ...selectedHunt,
          hunt_survivors: {
            ...selectedHunt.hunt_survivors,
            [hsKey]: { ...huntSurvivorRecord, insanity_tokens: value }
          }
        })

        updateHuntSurvivor(huntSurvivorRecord.id, { insanity_tokens: value })
          .then(() =>
            toast.success(SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE('insanity'))
          )
          .catch((error: unknown) => {
            // Rollback
            setSelectedHunt({
              ...selectedHunt,
              hunt_survivors: {
                ...selectedHunt.hunt_survivors,
                [hsKey]: {
                  ...huntSurvivorRecord,
                  insanity_tokens: previousValue
                }
              }
            })
            console.error('Insanity Tokens Update Error:', error)
            toast.error(ERROR_MESSAGE())
          })
      } else if (
        mode === SurvivorCardMode.SHOWDOWN_CARD &&
        showdownSurvivorRecord &&
        selectedShowdown?.showdown_survivors &&
        setSelectedShowdown
      ) {
        const previousValue = showdownSurvivorRecord.insanity_tokens
        const ssKey = Object.entries(selectedShowdown.showdown_survivors).find(
          ([, ss]) => ss.id === showdownSurvivorRecord.id
        )?.[0]
        if (!ssKey) return

        // Optimistic update
        setSelectedShowdown({
          ...selectedShowdown,
          showdown_survivors: {
            ...selectedShowdown.showdown_survivors,
            [ssKey]: { ...showdownSurvivorRecord, insanity_tokens: value }
          }
        })

        updateShowdownSurvivor(showdownSurvivorRecord.id, {
          insanity_tokens: value
        })
          .then(() =>
            toast.success(SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE('insanity'))
          )
          .catch((error: unknown) => {
            // Rollback
            setSelectedShowdown({
              ...selectedShowdown,
              showdown_survivors: {
                ...selectedShowdown.showdown_survivors,
                [ssKey]: {
                  ...showdownSurvivorRecord,
                  insanity_tokens: previousValue
                }
              }
            })
            console.error('Insanity Tokens Update Error:', error)
            toast.error(ERROR_MESSAGE())
          })
      }
    },
    [
      mode,
      selectedSurvivor?.id,
      selectedHunt,
      selectedShowdown,
      huntSurvivorRecord,
      showdownSurvivorRecord,
      setSelectedHunt,
      setSelectedShowdown
    ]
  )

  /**
   * Update Insanity
   *
   * @param value New Insanity Value
   */
  const updateInsanity = useCallback(
    (value: number) => {
      if (value < 0) return toast.error(INSANITY_MINIMUM_ERROR_MESSAGE())

      const old = insanity

      setInsanity(value)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, insanity: value } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { insanity: value })
        .then(() =>
          toast.success(SURVIVOR_INSANITY_UPDATED_MESSAGE(old, value))
        )
        .catch((error) => {
          console.error('Insanity Update Error:', error)
          setInsanity(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, insanity: old } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [insanity, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Update Brain Light Damage
   *
   * @param checked New Brain Light Damage State
   */
  const updateBrainLightDamage = useCallback(
    (checked: boolean) => {
      const old = brainLightDamage

      setBrainLightDamage(!!checked)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, brain_light_damage: !!checked }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { brain_light_damage: !!checked })
        .then(() =>
          toast.success(SURVIVOR_BRAIN_LIGHT_DAMAGE_UPDATED_MESSAGE(!!checked))
        )
        .catch((error) => {
          console.error('Brain Light Damage Update Error:', error)
          setBrainLightDamage(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, brain_light_damage: old }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [brainLightDamage, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Update Torment (Arc)
   *
   * @param value New Torment Value
   */
  const updateTorment = useCallback(
    (value: number) => {
      if (value < 0) return toast.error(TORMENT_MINIMUM_ERROR_MESSAGE())

      const old = torment

      setTorment(value)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, torment: value } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { torment: value })
        .then(() => toast.success(SURVIVOR_TORMENT_UPDATED_MESSAGE()))
        .catch((error) => {
          console.error('Torment Update Error:', error)
          setTorment(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, torment: old } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [torment, selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0">
      <CardContent className="p-0 h-19">
        <div className="flex flex-row">
          {/* Insanity */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative flex items-center">
              <Shield
                className="h-14 w-14 text-muted-foreground"
                strokeWidth={1}
              />
              <NumericInput
                label="Insanity"
                value={insanity}
                min={0}
                onChange={(value) => updateInsanity(value)}
                className="absolute top-[50%] left-7 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-xl sm:text-xl md:text-xl text-center p-0 !bg-transparent border-none no-spinners focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            {displayText && <Label className="text-xs">Insanity</Label>}
          </div>

          {/* Insanity Tokens (Showdown) */}
          {mode === SurvivorCardMode.SHOWDOWN_CARD && (
            <div className="flex flex-col items-center gap-2 pt-1">
              <NumericInput
                label="Insanity Tokens"
                value={
                  mode === SurvivorCardMode.SHOWDOWN_CARD
                    ? insanityTokens
                    : mode === SurvivorCardMode.HUNT_CARD
                      ? insanityTokens
                      : 0
                }
                min={0}
                onChange={(value) => saveInsanityTokens(value)}
                className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted!"
              />
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Tokens
              </Label>
            </div>
          )}

          <div className="mx-2 w-px bg-border h-19" />

          {/* Brain */}
          <div className="relative flex-1 flex flex-col justify-between">
            <div className="text-sm font-bold flex gap-1 items-center">
              <BrainIcon className="h-5 w-5" />
              Brain
            </div>
            <div className="absolute top-0 right-0 pr-2 flex items-center">
              <div className="space-y-0 flex flex-col items-center">
                <Checkbox
                  checked={brainLightDamage}
                  onCheckedChange={(checked) =>
                    updateBrainLightDamage(!!checked)
                  }
                  name="brain-light-damage"
                  id="brain-light-damage"
                />
                <Label className="text-xs mt-1">L</Label>
              </div>
            </div>
            {displayText && (
              <div className="text-xs text-muted-foreground">
                If your insanity is 3+, you are <strong>insane</strong>.
              </div>
            )}
          </div>

          {/* Torment (Arc) */}
          {selectedSettlement?.survivor_type === DatabaseSurvivorType['Arc'] &&
            displayTormentInput && (
              <div className="flex flex-col items-center gap-1">
                <Label className="text-xs">Torment</Label>
                <NumericInput
                  label="Torment"
                  value={torment}
                  min={0}
                  onChange={(value) => updateTorment(value)}
                  className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  )
}
