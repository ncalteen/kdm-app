'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { updateEncounterSurvivor } from '@/lib/dal/encounter-survivor'
import { updateHuntSurvivor } from '@/lib/dal/hunt-survivor'
import { updateShowdownSurvivor } from '@/lib/dal/showdown-survivor'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  DatabaseSurvivorType,
  SurvivorCardMode,
  SurvivorType
} from '@/lib/enums'
import {
  INSANITY_MINIMUM_ERROR_MESSAGE,
  TORMENT_MINIMUM_ERROR_MESSAGE
} from '@/lib/messages'
import {
  EncounterDetail,
  EncounterStateSetter,
  HuntDetail,
  HuntStateSetter,
  SettlementDetail,
  ShowdownDetail,
  ShowdownStateSetter,
  SurvivorDetail,
  SurvivorsStateSetter
} from '@/lib/types'
import { BrainIcon, Shield } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'
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
  /** Selected Encounter */
  selectedEncounter: EncounterDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Hunt (for optimistic token updates) */
  setSelectedHunt?: HuntStateSetter
  /** Set Selected Encounter (for optimistic token updates) */
  setSelectedEncounter?: EncounterStateSetter
  /** Set Selected Showdown (for optimistic token updates) */
  setSelectedShowdown?: ShowdownStateSetter
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
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
  selectedEncounter,
  selectedHunt,
  selectedSettlement,
  selectedShowdown,
  selectedSurvivor,
  setSelectedEncounter,
  setSelectedHunt,
  setSelectedShowdown,
  setSurvivors
}: SanityCardProps): ReactElement {
  const mutate = useOptimisticMutation()

  const [prevSurvivor, setPrevSurvivor] = useState(selectedSurvivor)
  const [insanity, setInsanity] = useState(selectedSurvivor?.insanity ?? 0)
  const [brainLightDamage, setBrainLightDamage] = useState(
    selectedSurvivor?.brain_light_damage ?? false
  )
  const [torment, setTorment] = useState(selectedSurvivor?.torment ?? 0)

  if (prevSurvivor !== selectedSurvivor) {
    setPrevSurvivor(selectedSurvivor)
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

  /** Encounter survivor record for the current survivor */
  const encounterSurvivorRecord = useMemo(() => {
    if (
      mode !== SurvivorCardMode.ENCOUNTER_CARD ||
      !selectedEncounter?.encounter_survivors
    )
      return undefined
    return Object.values(selectedEncounter.encounter_survivors).find(
      (es) => es.survivor_id === selectedSurvivor?.id
    )
  }, [mode, selectedEncounter, selectedSurvivor?.id])

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
    encounterSurvivorRecord?.insanity_tokens ??
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

        void mutate({
          context: 'Insanity Tokens Update',
          persist: () =>
            updateHuntSurvivor(huntSurvivorRecord.id, {
              insanity_tokens: value
            }),
          rollback: () => {
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
          }
        })
      } else if (
        mode === SurvivorCardMode.ENCOUNTER_CARD &&
        encounterSurvivorRecord &&
        selectedEncounter?.encounter_survivors &&
        setSelectedEncounter
      ) {
        const previousValue = encounterSurvivorRecord.insanity_tokens
        const esKey = Object.entries(
          selectedEncounter.encounter_survivors
        ).find(([, es]) => es.id === encounterSurvivorRecord.id)?.[0]
        if (!esKey) return

        // Optimistic update
        setSelectedEncounter({
          ...selectedEncounter,
          encounter_survivors: {
            ...selectedEncounter.encounter_survivors,
            [esKey]: { ...encounterSurvivorRecord, insanity_tokens: value }
          }
        })

        void mutate({
          context: 'Insanity Tokens Update',
          persist: () =>
            updateEncounterSurvivor(encounterSurvivorRecord.id, {
              insanity_tokens: value
            }),
          rollback: () => {
            setSelectedEncounter({
              ...selectedEncounter,
              encounter_survivors: {
                ...selectedEncounter.encounter_survivors,
                [esKey]: {
                  ...encounterSurvivorRecord,
                  insanity_tokens: previousValue
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

        void mutate({
          context: 'Insanity Tokens Update',
          persist: () =>
            updateShowdownSurvivor(showdownSurvivorRecord.id, {
              insanity_tokens: value
            }),
          rollback: () => {
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
          }
        })
      }
    },
    [
      mode,
      selectedSurvivor?.id,
      selectedEncounter,
      selectedHunt,
      selectedShowdown,
      encounterSurvivorRecord,
      huntSurvivorRecord,
      showdownSurvivorRecord,
      setSelectedEncounter,
      setSelectedHunt,
      setSelectedShowdown,
      mutate
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
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, insanity: value } : s
        )
      )

      void mutate({
        context: 'Insanity Update',
        persist: () =>
          updateSurvivor(selectedSurvivor?.id, { insanity: value }),
        rollback: () => {
          setInsanity(old)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, insanity: old } : s
            )
          )
        }
      })
    },
    [insanity, selectedSurvivor?.id, setSurvivors, mutate]
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
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, brain_light_damage: !!checked }
            : s
        )
      )

      void mutate({
        context: 'Brain Light Damage Update',
        persist: () =>
          updateSurvivor(selectedSurvivor?.id, {
            brain_light_damage: !!checked
          }),
        rollback: () => {
          setBrainLightDamage(old)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, brain_light_damage: old }
                : s
            )
          )
        }
      })
    },
    [brainLightDamage, selectedSurvivor?.id, setSurvivors, mutate]
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
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, torment: value } : s
        )
      )

      void mutate({
        context: 'Torment Update',
        persist: () => updateSurvivor(selectedSurvivor?.id, { torment: value }),
        rollback: () => {
          setTorment(old)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, torment: old } : s
            )
          )
        }
      })
    },
    [torment, selectedSurvivor?.id, setSurvivors, mutate]
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
                className="absolute top-[50%] left-7 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-xl sm:text-xl md:text-xl text-center p-0 bg-transparent! border-none no-spinners focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            {displayText && <Label className="text-xs">Insanity</Label>}
          </div>

          {/* Insanity Tokens */}
          {(mode === SurvivorCardMode.HUNT_CARD ||
            mode === SurvivorCardMode.ENCOUNTER_CARD ||
            mode === SurvivorCardMode.SHOWDOWN_CARD) && (
            <div className="flex flex-col items-center gap-2 pt-1">
              <NumericInput
                label="Insanity Tokens"
                value={insanityTokens}
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
          {selectedSettlement?.survivor_type ===
            DatabaseSurvivorType[SurvivorType.ARC] &&
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
