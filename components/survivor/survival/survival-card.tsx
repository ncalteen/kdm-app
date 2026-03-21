'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { updateSurvivor } from '@/lib/dal/survivor'
import { DatabaseSurvivorType, SurvivorCardMode } from '@/lib/enums'
import {
  ERROR_MESSAGE,
  SURVIVAL_LIMIT_EXCEEDED_ERROR_MESSAGE,
  SURVIVAL_MINIMUM_ERROR_MESSAGE,
  SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE,
  SURVIVOR_CAN_DASH_UPDATED_MESSAGE,
  SURVIVOR_CAN_DODGE_UPDATED_MESSAGE,
  SURVIVOR_CAN_ENCOURAGE_UPDATED_MESSAGE,
  SURVIVOR_CAN_ENDURE_UPDATED_MESSAGE,
  SURVIVOR_CAN_FIST_PUMP_UPDATED_MESSAGE,
  SURVIVOR_CAN_SPEND_SURVIVAL_UPDATED_MESSAGE,
  SURVIVOR_CAN_SURGE_UPDATED_MESSAGE,
  SURVIVOR_SURVIVAL_UPDATED_MESSAGE,
  SURVIVOR_SYSTEMIC_PRESSURE_UPDATED_MESSAGE,
  SYSTEMIC_PRESSURE_MINIMUM_ERROR_MESSAGE
} from '@/lib/messages'
import { SettlementDetail, SurvivorDetail } from '@/lib/types'
import { LockIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Survival Card Properties
 */
interface SurvivalCardProps {
  /** Mode */
  mode: SurvivorCardMode
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Survivor Survival Card Component
 *
 * This component displays the survivor's survival points and available survival
 * actions. It includes a survival points counter, a "cannot spend survival"
 * checkbox, and  checkboxes for each available survival action. For Arc
 * survivors, it also shows  the Systemic Pressure attribute and Fist Pump
 * instead of Endure.
 *
 * @param props Survival Card Properties
 * @returns Survival Card Component
 */
export function SurvivalCard({
  mode,
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: SurvivalCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [survival, setSurvival] = useState(selectedSurvivor?.survival ?? 0)
  const [canSpendSurvival, setCanSpendSurvival] = useState(
    selectedSurvivor?.can_spend_survival ?? true
  )
  const [canDodge, setCanDodge] = useState(selectedSurvivor?.can_dodge ?? false)
  const [canEncourage, setCanEncourage] = useState(
    selectedSurvivor?.can_encourage ?? false
  )
  const [canSurge, setCanSurge] = useState(selectedSurvivor?.can_surge ?? false)
  const [canDash, setCanDash] = useState(selectedSurvivor?.can_dash ?? false)
  const [canFistPump, setCanFistPump] = useState(
    selectedSurvivor?.can_fist_pump ?? false
  )
  const [canEndure, setCanEndure] = useState(
    selectedSurvivor?.can_endure ?? false
  )
  const [survivalTokens, setSurvivalTokens] = useState<number>(0)
  const [systemicPressure, setSystemicPressure] = useState(
    selectedSurvivor?.systemic_pressure ?? 0
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id

    setSurvival(selectedSurvivor?.survival ?? 0)
    setCanSpendSurvival(selectedSurvivor?.can_spend_survival ?? true)
    setCanDodge(selectedSurvivor?.can_dodge ?? false)
    setCanEncourage(selectedSurvivor?.can_encourage ?? false)
    setCanSurge(selectedSurvivor?.can_surge ?? false)
    setCanDash(selectedSurvivor?.can_dash ?? false)
    setCanFistPump(selectedSurvivor?.can_fist_pump ?? false)
    setCanEndure(selectedSurvivor?.can_endure ?? false)
    setSystemicPressure(selectedSurvivor?.systemic_pressure ?? 0)
  }

  // Get survival tokens from the showdown or hunt survivor table based on mode
  useEffect(() => {
    if (!selectedSurvivor?.id) return

    const tokens = survivalTokens

    if (mode === SurvivorCardMode.HUNT_CARD)
      getHuntSurvivorSurvivalTokens(selectedSurvivor?.id).then(
        (fetchedTokens) => {
          if (tokens === fetchedTokens) return

          setSurvivalTokens(fetchedTokens ?? 0)
          SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE('survival')
        }
      )
    else if (mode === SurvivorCardMode.SHOWDOWN_CARD)
      getShowdownSurvivorSurvivalTokens(selectedSurvivor?.id).then(
        (fetchedTokens) => {
          if (tokens === fetchedTokens) return

          setSurvivalTokens(fetchedTokens ?? 0)
          SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE('survival')
        }
      )
  })

  /**
   * Save Survival Tokens
   *
   * Persists survival token changes to the hunt or showdown survivor table
   * based on the current mode.
   *
   * @param value New Survival Tokens Value
   */
  const saveSurvivalTokens = useCallback(
    (value: number) => {
      if (!selectedSurvivor?.id) return

      const old = survivalTokens

      setSurvivalTokens(value)

      const update =
        mode === SurvivorCardMode.HUNT_CARD
          ? updateHuntSurvivorSurvivalTokens
          : updateShowdownSurvivorSurvivalTokens

      update(selectedSurvivor?.id, value)
        .then(() =>
          toast.success(SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE('survival'))
        )
        .catch((error) => {
          console.error('Survival Tokens Update Error:', error)
          setSurvivalTokens(old)
          toast.error(ERROR_MESSAGE())
        })
    },
    [mode, selectedSurvivor?.id, survivalTokens]
  )

  /**
   * Update Survival
   *
   * @param value New Survival Value
   */
  const updateSurvival = useCallback(
    (value: number) => {
      // Enforce minimum value of 0
      if (value < 0) return toast.error(SURVIVAL_MINIMUM_ERROR_MESSAGE())

      // Enforce maximum value of survivalLimit
      if (value > (selectedSettlement?.survival_limit ?? 1))
        return toast.error(
          SURVIVAL_LIMIT_EXCEEDED_ERROR_MESSAGE(
            selectedSettlement?.survival_limit ?? 1
          )
        )

      const old = survival

      setSurvival(value)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, survival: value } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { survival: value })
        .then(() =>
          toast.success(SURVIVOR_SURVIVAL_UPDATED_MESSAGE(old, value))
        )
        .catch((error) => {
          console.error('Survival Update Error:', error)
          setSurvival(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, survival: old } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      selectedSettlement?.survival_limit,
      survival,
      selectedSurvivor?.id,
      setSurvivors,
      survivors
    ]
  )

  /**
   * Update Can Spend Survival Flag
   *
   * This is inverted logic because the checkbox is for "Cannot Spend Survival"
   * but the survivor model has "can_spend_survival"
   *
   * @param checked Checkbox Value
   */
  const updateCanSpendSurvival = useCallback(
    (checked: boolean) => {
      const old = canSpendSurvival

      setCanSpendSurvival(!checked)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, can_spend_survival: !checked }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { can_spend_survival: !checked })
        .then(() =>
          toast.success(SURVIVOR_CAN_SPEND_SURVIVAL_UPDATED_MESSAGE(!checked))
        )
        .catch((error) => {
          console.error('Can Spend Survival Update Error:', error)
          setCanSpendSurvival(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, can_spend_survival: old }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [canSpendSurvival, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Update Can Dodge Flag
   *
   * @param checked Checkbox Value
   */
  const updateCanDodge = useCallback(
    (checked: boolean) => {
      const old = canDodge

      setCanDodge(!!checked)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, can_dodge: !!checked } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { can_dodge: !!checked })
        .then(() =>
          toast.success(SURVIVOR_CAN_DODGE_UPDATED_MESSAGE(!!checked))
        )
        .catch((error) => {
          console.error('Can Dodge Update Error:', error)
          setCanDodge(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, can_dodge: old } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [canDodge, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Update Can Encourage Flag
   *
   * @param checked Checkbox Value
   */
  const updateCanEncourage = useCallback(
    (checked: boolean) => {
      const old = canEncourage

      setCanEncourage(!!checked)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, can_encourage: !!checked } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { can_encourage: !!checked })
        .then(() =>
          toast.success(SURVIVOR_CAN_ENCOURAGE_UPDATED_MESSAGE(!!checked))
        )
        .catch((error) => {
          console.error('Can Encourage Update Error:', error)
          setCanEncourage(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, can_encourage: old } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [canEncourage, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Update Can Surge Flag
   *
   * @param checked Checkbox Value
   */
  const updateCanSurge = useCallback(
    (checked: boolean) => {
      const old = canSurge

      setCanSurge(!!checked)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, can_surge: !!checked } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { can_surge: !!checked })
        .then(() =>
          toast.success(SURVIVOR_CAN_SURGE_UPDATED_MESSAGE(!!checked))
        )
        .catch((error) => {
          console.error('Can Surge Update Error:', error)
          setCanSurge(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, can_surge: old } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [canSurge, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Update Can Dash Flag
   *
   * @param checked Checkbox Value
   */
  const updateCanDash = useCallback(
    (checked: boolean) => {
      const old = canDash

      setCanDash(!!checked)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, can_dash: !!checked } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { can_dash: !!checked })
        .then(() => toast.success(SURVIVOR_CAN_DASH_UPDATED_MESSAGE(!!checked)))
        .catch((error) => {
          console.error('Can Dash Update Error:', error)
          setCanDash(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, can_dash: old } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [canDash, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Update Can Fist Pump Flag (Arc)
   *
   * @param checked Checkbox Value
   */
  const updateCanFistPump = useCallback(
    (checked: boolean) => {
      const old = canFistPump

      setCanFistPump(!!checked)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, can_fist_pump: !!checked } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { can_fist_pump: !!checked })
        .then(() =>
          toast.success(SURVIVOR_CAN_FIST_PUMP_UPDATED_MESSAGE(!!checked))
        )
        .catch((error) => {
          console.error('Can Fist Pump Update Error:', error)
          setCanFistPump(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, can_fist_pump: old } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [canFistPump, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Update Systemic Pressure (Arc)
   *
   * @param value New Systemic Pressure Value
   */
  const updateSystemicPressure = useCallback(
    (value: number) => {
      // Enforce minimum value of 0
      if (value < 0)
        return toast.error(SYSTEMIC_PRESSURE_MINIMUM_ERROR_MESSAGE())

      const old = systemicPressure

      setSystemicPressure(value)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, systemic_pressure: value } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { systemic_pressure: value })
        .then(() => toast.success(SURVIVOR_SYSTEMIC_PRESSURE_UPDATED_MESSAGE()))
        .catch((error) => {
          console.error('Systemic Pressure Update Error:', error)
          setSystemicPressure(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, systemic_pressure: old }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [systemicPressure, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Update Can Endure Flag
   *
   * @param checked Checkbox Value
   */
  const updateCanEndure = useCallback(
    (checked: boolean) => {
      const old = canEndure

      setCanEndure(!!checked)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, can_endure: !!checked } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { can_endure: !!checked })
        .then(() =>
          toast.success(SURVIVOR_CAN_ENDURE_UPDATED_MESSAGE(!!checked))
        )
        .catch((error) => {
          console.error('Can Endure Update Error:', error)
          setCanEndure(old)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, can_endure: old } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [canEndure, selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0">
      <CardContent className="p-0">
        <div className="flex">
          {/* Survival */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col">
              {/* Survival Base */}
              <Label className="font-bold pb-2">Survival</Label>
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  {(mode === SurvivorCardMode.SHOWDOWN_CARD ||
                    mode === SurvivorCardMode.HUNT_CARD) && (
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Base
                    </Label>
                  )}
                  <NumericInput
                    label="Survival"
                    value={survival}
                    min={0}
                    max={selectedSettlement?.survival_limit ?? 1}
                    onChange={(value) => updateSurvival(value)}
                    className="w-12 h-12 text-2xl sm:text-2xl md:text-2xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    disabled={!canSpendSurvival}
                  />
                </div>

                {/* Survival Tokens */}
                {(mode === SurvivorCardMode.SHOWDOWN_CARD ||
                  mode === SurvivorCardMode.HUNT_CARD) && (
                  <div className="flex flex-col items-center gap-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Tokens
                    </Label>
                    <NumericInput
                      label="Survival Tokens"
                      value={survivalTokens}
                      onChange={(value) => saveSurvivalTokens(value)}
                      className="w-12 h-12 text-2xl sm:text-2xl md:text-2xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted!"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Cannot Spend Survival */}
            <div className="flex gap-2 pt-2">
              <Checkbox
                checked={!canSpendSurvival}
                onCheckedChange={(checked) => updateCanSpendSurvival(!!checked)}
                name="cannot-spend-survival"
                id="cannot-spend-survival"
              />
              <Label
                className="text-xs font-medium leading-none flex items-center"
                htmlFor="cannot-spend-survival">
                <LockIcon className="inline h-3 w-3" /> Cannot Spend Survival
              </Label>
            </div>
          </div>

          {/* Survival Actions */}
          <div className="flex">
            <div className="flex flex-col gap-1 justify-evenly">
              {/* Dodge */}
              <div className="flex gap-2">
                <Checkbox
                  checked={canDodge}
                  onCheckedChange={(checked) => updateCanDodge(!!checked)}
                  name="can-dodge"
                  id="can-dodge"
                  disabled={!canSpendSurvival}
                />
                <Label className="text-xs" htmlFor="can-dodge">
                  Dodge
                </Label>
              </div>

              {/* Encourage */}
              <div className="flex gap-2">
                <Checkbox
                  checked={canEncourage}
                  onCheckedChange={(checked) => updateCanEncourage(!!checked)}
                  name="can-encourage"
                  id="can-encourage"
                  disabled={!canSpendSurvival}
                />
                <Label className="text-xs" htmlFor="can-encourage">
                  Encourage
                </Label>
              </div>

              {/* Surge */}
              <div className="flex gap-2">
                <Checkbox
                  checked={canSurge}
                  onCheckedChange={(checked) => updateCanSurge(!!checked)}
                  name="can-surge"
                  id="can-surge"
                  disabled={!canSpendSurvival}
                />
                <Label className="text-xs" htmlFor="can-surge">
                  Surge
                </Label>
              </div>

              {/* Dash */}
              <div className="flex gap-2">
                <Checkbox
                  checked={canDash}
                  onCheckedChange={(checked) => updateCanDash(!!checked)}
                  name="can-dash"
                  id="can-dash"
                  disabled={!canSpendSurvival}
                />
                <Label className="text-xs" htmlFor="can-dash">
                  Dash
                </Label>
              </div>

              {/* Conditional rendering for Arc-specific attributes */}
              {selectedSettlement?.survivor_type ===
              DatabaseSurvivorType['Arc'] ? (
                <div className="flex gap-2">
                  <Checkbox
                    checked={canFistPump}
                    onCheckedChange={(checked) => updateCanFistPump(!!checked)}
                    name="can-fist-pump"
                    id="can-fist-pump"
                    disabled={!canSpendSurvival}
                  />
                  <Label className="text-xs" htmlFor="can-fist-pump">
                    Fist Pump
                  </Label>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Checkbox
                    checked={canEndure}
                    onCheckedChange={(checked) => updateCanEndure(!!checked)}
                    name="can-endure"
                    id="can-endure"
                    disabled={!canSpendSurvival}
                  />
                  <Label className="text-xs" htmlFor="can-endure">
                    Endure
                  </Label>
                </div>
              )}
            </div>

            {/* Right - (Arc) Systemic pressure */}
            {selectedSettlement?.survivor_type ===
              DatabaseSurvivorType['Arc'] && (
              <>
                <Separator orientation="vertical" className="mx-2.5" />

                {/* Systemic Pressure */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <Label className="text-xs">
                    Systemic
                    <br />
                    Pressure
                  </Label>

                  <NumericInput
                    label="Systemic Pressure"
                    value={systemicPressure}
                    onChange={(value) => updateSystemicPressure(value)}
                    className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
