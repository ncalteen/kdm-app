'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { updateHuntSurvivor } from '@/lib/dal/hunt-survivor'
import { updateShowdownSurvivor } from '@/lib/dal/showdown-survivor'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  DatabaseSurvivorType,
  SurvivorCardMode,
  SurvivorType
} from '@/lib/enums'
import {
  ERROR_MESSAGE,
  SURVIVOR_ACCURACY_UPDATED_MESSAGE,
  SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE,
  SURVIVOR_EVASION_UPDATED_MESSAGE,
  SURVIVOR_LUCK_UPDATED_MESSAGE,
  SURVIVOR_LUMI_UPDATED_MESSAGE,
  SURVIVOR_MOVEMENT_UPDATED_MESSAGE,
  SURVIVOR_SPEED_UPDATED_MESSAGE,
  SURVIVOR_STRENGTH_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  HuntDetail,
  SettlementDetail,
  ShowdownDetail,
  SurvivorDetail
} from '@/lib/types'
import { ReactElement, useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

/** Token name mapping from UI names to DB field names */
const TOKEN_FIELD_MAP: Record<string, string> = {
  movementTokens: 'movement_tokens',
  accuracyTokens: 'accuracy_tokens',
  strengthTokens: 'strength_tokens',
  evasionTokens: 'evasion_tokens',
  luckTokens: 'luck_tokens',
  speedTokens: 'speed_tokens'
}

/**
 * Attribute Card Properties
 */
interface AttributeCardProps {
  disabled?: boolean
  mode: SurvivorCardMode
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  selectedSettlement: SettlementDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Hunt (for optimistic token updates) */
  setSelectedHunt?: (hunt: HuntDetail | null) => void
  /** Set Selected Showdown (for optimistic token updates) */
  setSelectedShowdown?: (showdown: ShowdownDetail | null) => void
  setSurvivors: (survivors: SurvivorDetail[]) => void
  survivors: SurvivorDetail[]
}

/**
 * Survivor Attribute Card Component
 *
 * This component displays the survivor's core attributes (movement, accuracy,
 * strength, etc.) and allows them to be edited. For Arc survivors, it also
 * shows the Lumi attribute.
 *
 * @param props Attribute Card Properties
 * @returns Attribute Card Component
 */
export function AttributeCard({
  disabled = false,
  mode,
  selectedHunt,
  selectedSettlement,
  selectedShowdown,
  selectedSurvivor,
  setSelectedHunt,
  setSelectedShowdown,
  setSurvivors,
  survivors
}: AttributeCardProps): ReactElement {
  const survivorIdRef = useRef<string | null>(null)
  const [movement, setMovement] = useState(selectedSurvivor?.movement ?? 1)
  const [accuracy, setAccuracy] = useState(selectedSurvivor?.accuracy ?? 0)
  const [strength, setStrength] = useState(selectedSurvivor?.strength ?? 0)
  const [evasion, setEvasion] = useState(selectedSurvivor?.evasion ?? 0)
  const [luck, setLuck] = useState(selectedSurvivor?.luck ?? 0)
  const [speed, setSpeed] = useState(selectedSurvivor?.speed ?? 0)
  const [lumi, setLumi] = useState(selectedSurvivor?.lumi ?? 0)

  // Sync local state when the selected survivor changes
  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id ?? null
    setMovement(selectedSurvivor?.movement ?? 1)
    setAccuracy(selectedSurvivor?.accuracy ?? 0)
    setStrength(selectedSurvivor?.strength ?? 0)
    setEvasion(selectedSurvivor?.evasion ?? 0)
    setLuck(selectedSurvivor?.luck ?? 0)
    setSpeed(selectedSurvivor?.speed ?? 0)
    setLumi(selectedSurvivor?.lumi ?? 0)
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

  /**
   * Save Attribute Tokens
   *
   * Persists token changes to the hunt or showdown survivor table.
   *
   * @param tokenName Token Name (UI convention)
   * @param value New Token Value
   */
  const saveTokens = useCallback(
    (tokenName: string, value: number) => {
      if (!selectedSurvivor?.id) return

      const dbField = TOKEN_FIELD_MAP[tokenName]
      if (!dbField) return

      const displayName = tokenName
        .replace('Tokens', '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase()

      if (
        mode === SurvivorCardMode.HUNT_CARD &&
        huntSurvivorRecord &&
        selectedHunt?.hunt_survivors &&
        setSelectedHunt
      ) {
        const previousValue =
          huntSurvivorRecord[dbField as keyof typeof huntSurvivorRecord]
        const hsKey = Object.entries(selectedHunt.hunt_survivors).find(
          ([, hs]) => hs.id === huntSurvivorRecord.id
        )?.[0]
        if (!hsKey) return

        // Optimistic update
        setSelectedHunt({
          ...selectedHunt,
          hunt_survivors: {
            ...selectedHunt.hunt_survivors,
            [hsKey]: { ...huntSurvivorRecord, [dbField]: value }
          }
        })

        updateHuntSurvivor(huntSurvivorRecord.id, { [dbField]: value })
          .then(() =>
            toast.success(SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE(displayName))
          )
          .catch((error: unknown) => {
            // Rollback
            setSelectedHunt({
              ...selectedHunt,
              hunt_survivors: {
                ...selectedHunt.hunt_survivors,
                [hsKey]: { ...huntSurvivorRecord, [dbField]: previousValue }
              }
            })
            console.error(`${tokenName} Update Error:`, error)
            toast.error(ERROR_MESSAGE())
          })
      } else if (
        mode === SurvivorCardMode.SHOWDOWN_CARD &&
        showdownSurvivorRecord &&
        selectedShowdown?.showdown_survivors &&
        setSelectedShowdown
      ) {
        const previousValue =
          showdownSurvivorRecord[dbField as keyof typeof showdownSurvivorRecord]
        const ssKey = Object.entries(selectedShowdown.showdown_survivors).find(
          ([, ss]) => ss.id === showdownSurvivorRecord.id
        )?.[0]
        if (!ssKey) return

        // Optimistic update
        setSelectedShowdown({
          ...selectedShowdown,
          showdown_survivors: {
            ...selectedShowdown.showdown_survivors,
            [ssKey]: { ...showdownSurvivorRecord, [dbField]: value }
          }
        })

        updateShowdownSurvivor(showdownSurvivorRecord.id, { [dbField]: value })
          .then(() =>
            toast.success(SURVIVOR_ATTRIBUTE_TOKEN_UPDATED_MESSAGE(displayName))
          )
          .catch((error: unknown) => {
            // Rollback
            setSelectedShowdown({
              ...selectedShowdown,
              showdown_survivors: {
                ...selectedShowdown.showdown_survivors,
                [ssKey]: { ...showdownSurvivorRecord, [dbField]: previousValue }
              }
            })
            console.error(`${tokenName} Update Error:`, error)
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

  const columnCount =
    selectedSettlement?.survivor_type === DatabaseSurvivorType[SurvivorType.ARC]
      ? mode === SurvivorCardMode.SHOWDOWN_CARD ||
        mode === SurvivorCardMode.HUNT_CARD
        ? 'grid-cols-8'
        : 'grid-cols-7'
      : mode === SurvivorCardMode.SHOWDOWN_CARD ||
          mode === SurvivorCardMode.HUNT_CARD
        ? 'grid-cols-7'
        : 'grid-cols-6'

  /** Current token values derived from hunt/showdown survivor record */
  const tokenValues = {
    movementTokens:
      huntSurvivorRecord?.movement_tokens ??
      showdownSurvivorRecord?.movement_tokens ??
      0,
    accuracyTokens:
      huntSurvivorRecord?.accuracy_tokens ??
      showdownSurvivorRecord?.accuracy_tokens ??
      0,
    strengthTokens:
      huntSurvivorRecord?.strength_tokens ??
      showdownSurvivorRecord?.strength_tokens ??
      0,
    evasionTokens:
      huntSurvivorRecord?.evasion_tokens ??
      showdownSurvivorRecord?.evasion_tokens ??
      0,
    luckTokens:
      huntSurvivorRecord?.luck_tokens ??
      showdownSurvivorRecord?.luck_tokens ??
      0,
    speedTokens:
      huntSurvivorRecord?.speed_tokens ??
      showdownSurvivorRecord?.speed_tokens ??
      0
  }

  /**
   * Handle Survivor Attribute Update
   *
   * Optimistically updates the survivor attribute in the local state, then
   * persists the change to the database. Reverts on failure.
   *
   * @param field Survivor Field to Update
   * @param value New Value
   * @param successMessage Success Toast Message
   */
  const handleUpdate = useCallback(
    (
      field: keyof SurvivorDetail,
      value: number,
      successMessage: string,
      setLocal: (v: number) => void,
      oldLocal: number
    ) => {
      setLocal(value)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, [field]: value } : s
        )
      )
      updateSurvivor(selectedSurvivor?.id, { [field]: value })
        .then(() => toast.success(successMessage))
        .catch((error) => {
          console.error(`${String(field)} Update Error:`, error)
          setLocal(oldLocal)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, [field]: oldLocal } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0">
      <CardContent className={`grid ${columnCount} gap-2 p-0`}>
        {/* Label Row */}
        {(mode === SurvivorCardMode.SHOWDOWN_CARD ||
          mode === SurvivorCardMode.HUNT_CARD) && <div className="max-w-12" />}
        <div className="flex items-center justify-center">
          <Label className="text-xs">Movement</Label>
        </div>
        <div className="flex items-center justify-center">
          <Label className="text-xs">Accuracy</Label>
        </div>
        <div className="flex items-center justify-center">
          <Label className="text-xs">Strength</Label>
        </div>
        <div className="flex items-center justify-center">
          <Label className="text-xs">Evasion</Label>
        </div>
        <div className="flex items-center justify-center">
          <Label className="text-xs">Luck</Label>
        </div>
        <div className="flex items-center justify-center">
          <Label className="text-xs">Speed</Label>
        </div>
        {selectedSettlement?.survivor_type ===
          DatabaseSurvivorType[SurvivorType.ARC] && (
          <div className="flex items-center justify-center">
            <Label className="text-xs">Lumi</Label>
          </div>
        )}

        {(mode === SurvivorCardMode.SHOWDOWN_CARD ||
          mode === SurvivorCardMode.HUNT_CARD) && (
          <Label className="text-xs flex items-center justify-center max-w-12">
            Base
          </Label>
        )}

        {/* Movement */}
        <div className="flex flex-col items-center gap-1">
          <NumericInput
            label="Movement"
            value={movement}
            min={1}
            onChange={(value) =>
              handleUpdate(
                'movement',
                value,
                SURVIVOR_MOVEMENT_UPDATED_MESSAGE(),
                setMovement,
                movement
              )
            }
            className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
          />
        </div>

        {/* Accuracy */}
        <div className="flex flex-col items-center gap-1">
          <NumericInput
            label="Accuracy"
            value={accuracy}
            onChange={(value) =>
              handleUpdate(
                'accuracy',
                value,
                SURVIVOR_ACCURACY_UPDATED_MESSAGE(),
                setAccuracy,
                accuracy
              )
            }
            className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
          />
        </div>

        {/* Strength */}
        <div className="flex flex-col items-center gap-1">
          <NumericInput
            label="Strength"
            value={strength}
            onChange={(value) =>
              handleUpdate(
                'strength',
                value,
                SURVIVOR_STRENGTH_UPDATED_MESSAGE(),
                setStrength,
                strength
              )
            }
            className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
          />
        </div>

        {/* Evasion */}
        <div className="flex flex-col items-center gap-1">
          <NumericInput
            label="Evasion"
            value={evasion}
            onChange={(value) =>
              handleUpdate(
                'evasion',
                value,
                SURVIVOR_EVASION_UPDATED_MESSAGE(),
                setEvasion,
                evasion
              )
            }
            className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
          />
        </div>

        {/* Luck */}
        <div className="flex flex-col items-center gap-1">
          <NumericInput
            label="Luck"
            value={luck}
            onChange={(value) =>
              handleUpdate(
                'luck',
                value,
                SURVIVOR_LUCK_UPDATED_MESSAGE(),
                setLuck,
                luck
              )
            }
            className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
          />
        </div>

        {/* Speed */}
        <div className="flex flex-col items-center gap-1">
          <NumericInput
            label="Speed"
            value={speed}
            onChange={(value) =>
              handleUpdate(
                'speed',
                value,
                SURVIVOR_SPEED_UPDATED_MESSAGE(),
                setSpeed,
                speed
              )
            }
            className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
          />
        </div>

        {/* Lumi (Arc) */}
        {selectedSettlement?.survivor_type ===
          DatabaseSurvivorType[SurvivorType.ARC] && (
          <div className="flex flex-col items-center gap-1">
            <NumericInput
              label="Lumi"
              value={lumi}
              min={0}
              onChange={(value) =>
                handleUpdate(
                  'lumi',
                  value,
                  SURVIVOR_LUMI_UPDATED_MESSAGE(),
                  setLumi,
                  lumi
                )
              }
              className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={disabled}
            />
          </div>
        )}

        {(mode === SurvivorCardMode.SHOWDOWN_CARD ||
          mode === SurvivorCardMode.HUNT_CARD) && (
          <>
            <Label className="text-xs text-center flex items-center justify-center max-w-12">
              Tokens
            </Label>

            {/* Movement Tokens */}
            <div className="flex flex-col items-center gap-1">
              <NumericInput
                label="Movement Tokens"
                value={tokenValues.movementTokens}
                onChange={(value) => saveTokens('movementTokens', value)}
                className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted!"
                disabled={disabled}
              />
            </div>

            {/* Accuracy Tokens */}
            <div className="flex flex-col items-center gap-1">
              <NumericInput
                label="Accuracy Tokens"
                value={tokenValues.accuracyTokens}
                onChange={(value) => saveTokens('accuracyTokens', value)}
                className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted!"
                disabled={disabled}
              />
            </div>

            {/* Strength Tokens */}
            <div className="flex flex-col items-center gap-1">
              <NumericInput
                label="Strength Tokens"
                value={tokenValues.strengthTokens}
                onChange={(value) => saveTokens('strengthTokens', value)}
                className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted!"
                disabled={disabled}
              />
            </div>

            {/* Evasion Tokens */}
            <div className="flex flex-col items-center gap-1">
              <NumericInput
                label="Evasion Tokens"
                value={tokenValues.evasionTokens}
                onChange={(value) => saveTokens('evasionTokens', value)}
                className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted!"
                disabled={disabled}
              />
            </div>

            {/* Luck Tokens */}
            <div className="flex flex-col items-center gap-1">
              <NumericInput
                label="Luck Tokens"
                value={tokenValues.luckTokens}
                onChange={(value) => saveTokens('luckTokens', value)}
                className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted!"
                disabled={disabled}
              />
            </div>

            {/* Speed Tokens */}
            <div className="flex flex-col items-center gap-1">
              <NumericInput
                label="Speed Tokens"
                value={tokenValues.speedTokens}
                onChange={(value) => saveTokens('speedTokens', value)}
                className="w-12 h-12 text-xl sm:text-xl md:text-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted!"
                disabled={disabled}
              />
            </div>

            {/* Lumi (Arc) - No Tokens */}
            {selectedSettlement?.survivor_type ===
              DatabaseSurvivorType[SurvivorType.ARC] && <div />}
          </>
        )}
      </CardContent>
    </Card>
  )
}
