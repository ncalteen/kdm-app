'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { TraitsMoods } from '@/components/monster/traits-moods/traits-moods'
import { SurvivorCard } from '@/components/survivor/survivor-card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { removeEncounter, updateEncounter } from '@/lib/dal/encounter'
import { updateEncounterActiveMonster } from '@/lib/dal/encounter-active-monster'
import {
  getEncounterSurvivors,
  updateEncounterSurvivor
} from '@/lib/dal/encounter-survivor'
import { removeHunt } from '@/lib/dal/hunt'
import { updateHuntSurvivor } from '@/lib/dal/hunt-survivor'
import {
  syncMonsterMoods,
  syncMonsterTraits
} from '@/lib/dal/monster-trait-mood'
import { addSettlementPhase } from '@/lib/dal/settlement-phase'
import { SurvivorCardMode, TabType } from '@/lib/enums'
import { ERROR_MESSAGE } from '@/lib/messages'
import {
  EncounterActiveMonsterDetail,
  EncounterDetail,
  EncounterStateSetter,
  EncounterSurvivorDetail,
  HuntDetail,
  HuntStateSetter,
  HuntSurvivorDetail,
  SettlementDetail,
  SettlementPhaseDetail,
  SurvivorDetail,
  SurvivorsStateSetter,
  SurvivorStateSetter
} from '@/lib/types'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  HouseIcon,
  SkullIcon,
  UsersIcon,
  ZapIcon
} from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/** Active Encounter Card Properties */
interface ActiveEncounterCardProps {
  /** Selected Encounter */
  selectedEncounter: EncounterDetail
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Encounter */
  setSelectedEncounter: EncounterStateSetter
  /** Set Selected Hunt */
  setSelectedHunt: HuntStateSetter
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (
    settlementPhase: SettlementPhaseDetail | null
  ) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: SurvivorStateSetter
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Active Encounter Card Component
 *
 * Displays active encounter monster, turn, and survivor state. The encounter
 * can end by resuming the hunt or by ending the hunt and returning survivors
 * to settlement phase.
 *
 * @param props Active Encounter Card Properties
 * @returns Active Encounter Card Component
 */
export function ActiveEncounterCard({
  selectedEncounter,
  selectedHunt,
  selectedSettlement,
  selectedSettlementPhase,
  selectedSurvivor,
  setSelectedEncounter,
  setSelectedHunt,
  setSelectedHuntMonsterIndex,
  setSelectedSettlementPhase,
  setSelectedSurvivor,
  setSelectedTab,
  setSurvivors,
  survivors
}: ActiveEncounterCardProps): ReactElement {
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false)
  const [isSettlementDialogOpen, setIsSettlementDialogOpen] = useState(false)
  const [isEnding, setIsEnding] = useState(false)

  const [selectedEncounterMonsterIndex, setSelectedEncounterMonsterIndex] =
    useState(0)

  const monsterEntries = useMemo(
    () => Object.entries(selectedEncounter.encounter_monsters ?? {}),
    [selectedEncounter.encounter_monsters]
  )

  const currentMonsterEntry =
    monsterEntries[selectedEncounterMonsterIndex] ?? monsterEntries[0]
  const currentMonsterKey = currentMonsterEntry?.[0]
  const monster = currentMonsterEntry?.[1]

  const encounterSurvivorIds = useMemo(
    () =>
      Object.values(selectedEncounter.encounter_survivors ?? {}).map(
        (survivor) => survivor.survivor_id
      ),
    [selectedEncounter.encounter_survivors]
  )

  const filteredSurvivors = useMemo(
    () =>
      survivors.filter((survivor) =>
        encounterSurvivorIds.includes(survivor.id)
      ),
    [encounterSurvivorIds, survivors]
  )

  const [currentSurvivorIndex, setCurrentSurvivorIndex] = useState(0)
  const displayedSurvivor = filteredSurvivors[currentSurvivorIndex] ?? null

  useEffect(() => {
    if (displayedSurvivor && displayedSurvivor.id !== selectedSurvivor?.id)
      setSelectedSurvivor(displayedSurvivor)
  }, [displayedSurvivor, selectedSurvivor?.id, setSelectedSurvivor])

  const selectedEncounterSurvivor = useMemo(() => {
    if (!selectedEncounter.encounter_survivors || !displayedSurvivor)
      return null
    return (
      Object.values(selectedEncounter.encounter_survivors).find(
        (survivor) => survivor.survivor_id === displayedSurvivor.id
      ) ?? null
    )
  }, [displayedSurvivor, selectedEncounter.encounter_survivors])

  const [monsterNotesDraft, setMonsterNotesDraft] = useState(
    monster?.notes ?? ''
  )
  const [isMonsterNotesDirty, setIsMonsterNotesDirty] = useState(false)
  const [lastMonsterId, setLastMonsterId] = useState(monster?.id)
  const [lastMonsterNotes, setLastMonsterNotes] = useState(monster?.notes ?? '')

  if (
    lastMonsterId !== monster?.id ||
    lastMonsterNotes !== (monster?.notes ?? '')
  ) {
    setLastMonsterId(monster?.id)
    setLastMonsterNotes(monster?.notes ?? '')
    setMonsterNotesDraft(monster?.notes ?? '')
    setIsMonsterNotesDirty(false)
  }

  const [survivorNotesDraft, setSurvivorNotesDraft] = useState(
    selectedEncounterSurvivor?.notes ?? ''
  )
  const [isSurvivorNotesDirty, setIsSurvivorNotesDirty] = useState(false)
  const [lastSurvivorRecordId, setLastSurvivorRecordId] = useState(
    selectedEncounterSurvivor?.id
  )
  const [lastSurvivorNotes, setLastSurvivorNotes] = useState(
    selectedEncounterSurvivor?.notes ?? ''
  )

  if (
    lastSurvivorRecordId !== selectedEncounterSurvivor?.id ||
    lastSurvivorNotes !== (selectedEncounterSurvivor?.notes ?? '')
  ) {
    setLastSurvivorRecordId(selectedEncounterSurvivor?.id)
    setLastSurvivorNotes(selectedEncounterSurvivor?.notes ?? '')
    setSurvivorNotesDraft(selectedEncounterSurvivor?.notes ?? '')
    setIsSurvivorNotesDirty(false)
  }

  const saveMonsterData = useCallback(
    (updateData: Partial<EncounterActiveMonsterDetail>) => {
      if (!monster || !selectedEncounter.encounter_monsters) return

      const previousMonster = { ...monster }
      const monsterKey = currentMonsterKey
      if (!monsterKey) return

      setSelectedEncounter({
        ...selectedEncounter,
        encounter_monsters: {
          ...selectedEncounter.encounter_monsters,
          [monsterKey]: { ...monster, ...updateData }
        }
      })

      const { traits, moods, survivor_statuses, ...columnUpdates } = updateData
      const writes: Promise<unknown>[] = []
      if (Object.keys(columnUpdates).length > 0)
        writes.push(updateEncounterActiveMonster(monster.id, columnUpdates))
      if (traits !== undefined)
        writes.push(
          syncMonsterTraits(
            'encounter_active_monster_trait',
            monster.id,
            traits.map((trait) => trait.trait_name)
          )
        )
      if (moods !== undefined)
        writes.push(
          syncMonsterMoods(
            'encounter_active_monster_mood',
            monster.id,
            moods.map((mood) => mood.mood_name)
          )
        )
      void survivor_statuses

      Promise.all(writes).catch((err: unknown) => {
        setSelectedEncounter((prev) =>
          prev?.encounter_monsters
            ? {
                ...prev,
                encounter_monsters: {
                  ...prev.encounter_monsters,
                  [monsterKey]: previousMonster
                }
              }
            : prev
        )
        console.error('Encounter Monster Save Error:', err)
        toast.error(ERROR_MESSAGE())
      })
    },
    [currentMonsterKey, monster, selectedEncounter, setSelectedEncounter]
  )

  const handleSaveMonsterNotes = useCallback(() => {
    if (!monster) return
    setIsMonsterNotesDirty(false)
    saveMonsterData({ notes: monsterNotesDraft })
  }, [monster, monsterNotesDraft, saveMonsterData])

  const handleSaveSurvivorNotes = useCallback(() => {
    if (!selectedEncounterSurvivor || !selectedEncounter.encounter_survivors)
      return

    const previousNotes = selectedEncounterSurvivor.notes
    const survivorKey = Object.entries(
      selectedEncounter.encounter_survivors
    ).find(([, survivor]) => survivor.id === selectedEncounterSurvivor.id)?.[0]
    if (!survivorKey) return

    setSelectedEncounter({
      ...selectedEncounter,
      encounter_survivors: {
        ...selectedEncounter.encounter_survivors,
        [survivorKey]: {
          ...selectedEncounterSurvivor,
          notes: survivorNotesDraft
        }
      }
    })
    setIsSurvivorNotesDirty(false)

    updateEncounterSurvivor(selectedEncounterSurvivor.id, {
      notes: survivorNotesDraft
    }).catch((err: unknown) => {
      setSelectedEncounter((prev) =>
        prev?.encounter_survivors
          ? {
              ...prev,
              encounter_survivors: {
                ...prev.encounter_survivors,
                [survivorKey]: {
                  ...selectedEncounterSurvivor,
                  notes: previousNotes
                }
              }
            }
          : prev
      )
      setIsSurvivorNotesDirty(true)
      console.error('Encounter Survivor Notes Save Error:', err)
      toast.error(ERROR_MESSAGE())
    })
  }, [
    selectedEncounter,
    selectedEncounterSurvivor,
    setSelectedEncounter,
    survivorNotesDraft
  ])

  const switchTurn = useCallback(() => {
    const previousTurn = selectedEncounter.turn
    const nextTurn: 'MONSTER' | 'SURVIVOR' =
      previousTurn === 'MONSTER' ? 'SURVIVOR' : 'MONSTER'

    let updatedSurvivors = selectedEncounter.encounter_survivors
    if (nextTurn === 'SURVIVOR' && updatedSurvivors) {
      const reset: { [key: string]: EncounterSurvivorDetail } = {}
      for (const [key, survivor] of Object.entries(updatedSurvivors))
        reset[key] = {
          ...survivor,
          movement_used: false,
          activation_used: false
        }
      updatedSurvivors = reset
    }

    setSelectedEncounter({
      ...selectedEncounter,
      turn: nextTurn,
      encounter_survivors: updatedSurvivors
    })

    updateEncounter(selectedEncounter.id, { turn: nextTurn })
      .then(() => {
        if (nextTurn !== 'SURVIVOR' || !selectedEncounter.encounter_survivors)
          return

        Promise.all(
          Object.values(selectedEncounter.encounter_survivors).map((survivor) =>
            updateEncounterSurvivor(survivor.id, {
              movement_used: false,
              activation_used: false
            })
          )
        ).catch((err: unknown) =>
          console.error('Encounter Survivor Reset Error:', err)
        )
      })
      .catch((err: unknown) => {
        setSelectedEncounter((prev) =>
          prev ? { ...prev, turn: previousTurn } : prev
        )
        console.error('Encounter Turn Switch Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedEncounter, setSelectedEncounter])

  const updateSurvivorTurnState = useCallback(
    (
      survivorRecordId: string,
      updates: Partial<
        Pick<EncounterSurvivorDetail, 'movement_used' | 'activation_used'>
      >
    ) => {
      if (!selectedEncounter.encounter_survivors) return

      const survivorKey = Object.entries(
        selectedEncounter.encounter_survivors
      ).find(([, survivor]) => survivor.id === survivorRecordId)?.[0]
      if (!survivorKey) return

      const previous = selectedEncounter.encounter_survivors[survivorKey]

      setSelectedEncounter({
        ...selectedEncounter,
        encounter_survivors: {
          ...selectedEncounter.encounter_survivors,
          [survivorKey]: { ...previous, ...updates }
        }
      })

      updateEncounterSurvivor(survivorRecordId, updates).catch(
        (err: unknown) => {
          setSelectedEncounter((prev) =>
            prev?.encounter_survivors
              ? {
                  ...prev,
                  encounter_survivors: {
                    ...prev.encounter_survivors,
                    [survivorKey]: previous
                  }
                }
              : prev
          )
          console.error('Encounter Survivor Turn State Update Error:', err)
          toast.error(ERROR_MESSAGE())
        }
      )
    },
    [selectedEncounter, setSelectedEncounter]
  )

  const copyEncounterStateToHunt = useCallback(async () => {
    if (!selectedHunt?.hunt_survivors || !selectedEncounter.encounter_survivors)
      return null

    const latestEncounterSurvivors =
      (await getEncounterSurvivors(selectedEncounter.id)) ??
      selectedEncounter.encounter_survivors

    const updatedHuntSurvivors: { [key: string]: HuntSurvivorDetail } = {
      ...selectedHunt.hunt_survivors
    }

    for (const encounterSurvivor of Object.values(latestEncounterSurvivors)) {
      const huntEntry = Object.entries(updatedHuntSurvivors).find(
        ([, huntSurvivor]) =>
          huntSurvivor.survivor_id === encounterSurvivor.survivor_id
      )
      if (!huntEntry) continue

      const [huntKey, huntSurvivor] = huntEntry
      const updates = {
        accuracy_tokens: encounterSurvivor.accuracy_tokens,
        bleeding_tokens: encounterSurvivor.bleeding_tokens,
        evasion_tokens: encounterSurvivor.evasion_tokens,
        insanity_tokens: encounterSurvivor.insanity_tokens,
        luck_tokens: encounterSurvivor.luck_tokens,
        movement_tokens: encounterSurvivor.movement_tokens,
        notes: encounterSurvivor.notes,
        speed_tokens: encounterSurvivor.speed_tokens,
        strength_tokens: encounterSurvivor.strength_tokens,
        survival_tokens: encounterSurvivor.survival_tokens
      }

      await updateHuntSurvivor(huntSurvivor.id, updates)
      updatedHuntSurvivors[huntKey] = { ...huntSurvivor, ...updates }
    }

    return updatedHuntSurvivors
  }, [
    selectedEncounter.encounter_survivors,
    selectedEncounter.id,
    selectedHunt
  ])

  const handleResumeHunt = useCallback(async () => {
    if (!selectedHunt) return
    setIsEnding(true)

    try {
      const updatedHuntSurvivors = await copyEncounterStateToHunt()
      await updateEncounter(selectedEncounter.id, {
        turn: selectedEncounter.turn
      })

      await removeEncounter(selectedEncounter.id)

      setSelectedEncounter(null)
      setSelectedHunt({
        ...selectedHunt,
        hunt_survivors: updatedHuntSurvivors ?? selectedHunt.hunt_survivors
      })
      setSelectedTab(TabType.HUNT)
      setIsResumeDialogOpen(false)
    } catch (error: unknown) {
      console.error('Resume Hunt Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsEnding(false)
    }
  }, [
    copyEncounterStateToHunt,
    selectedEncounter.id,
    selectedEncounter.turn,
    selectedHunt,
    setSelectedEncounter,
    setSelectedHunt,
    setSelectedTab
  ])

  const handleReturnToSettlement = useCallback(async () => {
    if (
      !selectedHunt ||
      !selectedSettlement ||
      !selectedEncounter.encounter_survivors
    )
      return
    setIsEnding(true)

    try {
      await copyEncounterStateToHunt()

      const scoutSurvivor = Object.values(
        selectedEncounter.encounter_survivors
      ).find((survivor) => survivor.scout)
      const returningSurvivorIds = Object.values(
        selectedEncounter.encounter_survivors
      ).map((survivor) => survivor.survivor_id)

      const settlementPhaseId = await addSettlementPhase(
        {
          endeavors: selectedSettlementPhase?.endeavors ?? 0,
          returning_scout_id: scoutSurvivor?.survivor_id ?? null,
          settlement_id: selectedSettlement.id
        },
        returningSurvivorIds
      )

      await removeHunt(selectedHunt.id)

      setSelectedEncounter(null)
      setSelectedHunt(null)
      setSelectedHuntMonsterIndex(0)
      setSelectedSettlementPhase({
        id: settlementPhaseId,
        endeavors: selectedSettlementPhase?.endeavors ?? 0,
        returning_scout_id: scoutSurvivor?.survivor_id ?? null,
        settlement_id: selectedSettlement.id,
        step: 'SET_UP_SETTLEMENT',
        returning_survivor_ids: returningSurvivorIds
      })
      setSelectedTab(TabType.SETTLEMENT_PHASE)
      setIsSettlementDialogOpen(false)
    } catch (error: unknown) {
      console.error('Encounter Return Settlement Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsEnding(false)
    }
  }, [
    copyEncounterStateToHunt,
    selectedEncounter.encounter_survivors,
    selectedHunt,
    selectedSettlement,
    selectedSettlementPhase,
    setSelectedEncounter,
    setSelectedHunt,
    setSelectedHuntMonsterIndex,
    setSelectedSettlementPhase,
    setSelectedTab
  ])

  const handlePreviousSurvivor = () => {
    if (filteredSurvivors.length === 0) return
    setCurrentSurvivorIndex(
      (currentSurvivorIndex - 1 + filteredSurvivors.length) %
        filteredSurvivors.length
    )
  }

  const handleNextSurvivor = () => {
    if (filteredSurvivors.length === 0) return
    setCurrentSurvivorIndex(
      (currentSurvivorIndex + 1) % filteredSurvivors.length
    )
  }

  const handlePreviousMonster = () => {
    if (monsterEntries.length === 0) return
    setSelectedEncounterMonsterIndex(
      (selectedEncounterMonsterIndex - 1 + monsterEntries.length) %
        monsterEntries.length
    )
  }

  const handleNextMonster = () => {
    if (monsterEntries.length === 0) return
    setSelectedEncounterMonsterIndex(
      (selectedEncounterMonsterIndex + 1) % monsterEntries.length
    )
  }

  const handleMonsterDotClick = (index: number) => {
    if (!monsterEntries[index]) return
    setSelectedEncounterMonsterIndex(index)
  }

  if (!monster) return <></>

  const isMonsterTurn = selectedEncounter.turn === 'MONSTER'
  const survivorName =
    displayedSurvivor?.survivor_name ?? 'No Survivor Selected'

  return (
    <div className="flex flex-col gap-2 h-full relative">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between pointer-events-none">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSettlementDialogOpen(true)}
          className="pointer-events-auto w-full sm:w-auto"
          title="Return to Settlement">
          <HouseIcon className="size-4" />
          Return to Settlement
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsResumeDialogOpen(true)}
          className="pointer-events-auto w-full sm:w-auto"
          title="Resume Hunt">
          Resume Hunt <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      {monsterEntries.length > 1 && (
        <div className="monster_carousel_controls pb-2">
          <div className="monster_carousel_buttons">
            <Button
              className="h-8 w-8"
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonster}
              title="Previous encounter monster">
              <ArrowLeftIcon className="size-8" />
            </Button>
            <Button
              className="h-8 w-8"
              variant="ghost"
              size="icon"
              onClick={handleNextMonster}
              title="Next encounter monster">
              <ArrowRightIcon className="size-8" />
            </Button>
          </div>
          <div className="monster_carousel_dots">
            {monsterEntries.map(([monsterId], index) => {
              const isSelected = index === selectedEncounterMonsterIndex

              return (
                <Avatar
                  key={monsterId}
                  className={`monster_carousel_dot${isSelected ? ' monster_carousel_dot--selected' : ''} bg-red-500 items-center justify-center cursor-pointer`}
                  style={{
                    ['--dot-color' as string]: isSelected
                      ? 'hsl(var(--foreground))'
                      : 'transparent',
                    ['--dot-bg' as string]: 'hsl(var(--destructive))'
                  }}
                  onClick={() => handleMonsterDotClick(index)}>
                  <AvatarFallback className="bg-transparent">
                    <SkullIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-2">
        <Card className="w-full border-2 rounded-xl p-0 gap-0 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="flex p-3 border-b bg-red-100/50 dark:bg-red-950/30">
            <div className="flex items-center gap-3 w-full">
              <div className="h-12 w-12 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center">
                <SkullIcon className="h-6 w-6 text-red-700 dark:text-red-300" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">
                  {monster.monster_name}
                </div>
                <Badge variant="outline" className="text-xs">
                  Level {selectedEncounter.monster_level}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <Checkbox
                  id="encounter-knocked-down"
                  checked={monster.knocked_down}
                  onCheckedChange={(checked) =>
                    saveMonsterData({ knocked_down: !!checked })
                  }
                />
                <Label htmlFor="encounter-knocked-down" className="text-xs">
                  Knocked Down
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 py-0 mt-0">
            <div className="flex flex-col lg:flex-row lg:gap-2">
              <div className="flex flex-col flex-1 max-w-100">
                <div className="grid grid-cols-2">
                  <div className="bg-background/40 rounded-lg p-2 text-center">
                    <div className="text-xs text-muted-foreground pb-1">
                      Life
                    </div>
                    <NumericInput
                      label="Life"
                      value={monster.life}
                      min={0}
                      onChange={(value) => saveMonsterData({ life: value })}
                      className="border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="bg-background/40 rounded-lg p-2 text-center">
                    <div className="text-xs text-muted-foreground pb-1">
                      Toughness
                    </div>
                    <NumericInput
                      label="Toughness"
                      value={monster.toughness}
                      min={0}
                      onChange={(value) =>
                        saveMonsterData({ toughness: value })
                      }
                      className="border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                <Separator className="my-1" />

                <div className="p-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row items-center gap-2">
                      <div className="w-20" />
                      <Label className="text-xs w-24 justify-center">
                        Base
                      </Label>
                      <Label className="text-xs w-24 justify-center">
                        Tokens
                      </Label>
                      <Label className="text-xs w-24 justify-center">
                        Total
                      </Label>
                    </div>

                    {[
                      ['Damage', 'damage', 'damage_tokens'],
                      ['Movement', 'movement', 'movement_tokens'],
                      ['Accuracy', 'accuracy', 'accuracy_tokens'],
                      ['Evasion', 'evasion', 'evasion_tokens'],
                      ['Luck', 'luck', 'luck_tokens'],
                      ['Speed', 'speed', 'speed_tokens']
                    ].map(([label, baseKey, tokenKey], index) => {
                      const baseValue = monster[
                        baseKey as keyof typeof monster
                      ] as number
                      const tokenValue = monster[
                        tokenKey as keyof typeof monster
                      ] as number

                      return (
                        <div key={baseKey}>
                          {index === 1 && <Separator className="my-1" />}
                          <div className="flex flex-row items-center gap-2">
                            <Label className="text-xs w-20">{label}</Label>
                            <NumericInput
                              label={`${label} Base`}
                              value={baseValue}
                              onChange={(value) =>
                                saveMonsterData({ [baseKey]: value })
                              }
                              className="w-24 h-12 text-xl"
                            />
                            <NumericInput
                              label={`${label} Tokens`}
                              value={tokenValue}
                              onChange={(value) =>
                                saveMonsterData({ [tokenKey]: value })
                              }
                              className="w-24 h-12 text-xl bg-muted!"
                            />
                            <NumericInput
                              label={`${label} Total`}
                              value={baseValue + tokenValue}
                              className="w-24 h-12 text-xl"
                              disabled={true}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex lg:items-stretch">
                <Separator orientation="vertical" className="mx-2" />
              </div>
              <Separator className="my-2 lg:hidden" />
              <div className="flex flex-col flex-1">
                <TraitsMoods
                  monster={monster}
                  onTraitsChange={(traits) => saveMonsterData({ traits })}
                  onMoodsChange={(moods) => saveMonsterData({ moods })}
                  onSurvivorStatusesChange={() => null}
                  showSurvivorStatuses={false}
                />
                <Separator className="my-2" />
                <div className="flex flex-col gap-2 pb-2">
                  <Textarea
                    value={monsterNotesDraft}
                    name="encounter-monster-notes"
                    id="encounter-monster-notes"
                    onChange={(event) => {
                      setMonsterNotesDraft(event.target.value)
                      setIsMonsterNotesDirty(
                        event.target.value !== monster.notes
                      )
                    }}
                    placeholder="Add notes about the encounter monster..."
                    className="w-full resize-none"
                    style={{ minHeight: '125px' }}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleSaveMonsterNotes}
                      disabled={!isMonsterNotesDirty}
                      title="Save encounter monster notes">
                      <CheckIcon className="h-4 w-4" /> Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full min-w-75 border-2 rounded-xl pt-0 pb-2 gap-2 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="flex items-center gap-3 p-3 rounded-t-lg">
            <Avatar className="h-12 w-12 border-2 items-center justify-center">
              <AvatarFallback className="font-bold text-lg text-white bg-slate-500">
                {isMonsterTurn ? (
                  <SkullIcon className="h-5 w-5" />
                ) : (
                  <UsersIcon className="h-5 w-5" />
                )}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">
              {isMonsterTurn ? 'Monster Turn' : "Survivors' Turn"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="font-medium text-sm text-center h-6">
              {isMonsterTurn ? `Targeting: ${survivorName}` : survivorName}
              {selectedEncounterSurvivor?.scout && (
                <Badge variant="outline" className="ml-2">
                  Scout
                </Badge>
              )}
            </div>
            {!isMonsterTurn && selectedEncounterSurvivor && (
              <div className="grid grid-cols-2 gap-2">
                <Toggle
                  size="sm"
                  variant="outline"
                  pressed={selectedEncounterSurvivor.movement_used}
                  onPressedChange={(pressed) =>
                    updateSurvivorTurnState(selectedEncounterSurvivor.id, {
                      movement_used: !!pressed
                    })
                  }>
                  <CheckCircleIcon className="h-3 w-3" /> Move
                </Toggle>
                <Toggle
                  size="sm"
                  variant="outline"
                  pressed={selectedEncounterSurvivor.activation_used}
                  onPressedChange={(pressed) =>
                    updateSurvivorTurnState(selectedEncounterSurvivor.id, {
                      activation_used: !!pressed
                    })
                  }>
                  <CheckCircleIcon className="h-3 w-3" /> Activate
                </Toggle>
              </div>
            )}
          </CardContent>
          <div className="px-6 pb-4">
            <Button onClick={switchTurn} variant="secondary" className="w-full">
              {isMonsterTurn ? (
                <>
                  <UsersIcon className="h-4 w-4 mr-2" /> End Monster Turn
                </>
              ) : (
                <>
                  <ZapIcon className="h-4 w-4 mr-2" /> End Survivor Turn
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {filteredSurvivors.length > 0 && displayedSurvivor && (
        <div className="p-0">
          <div className="survivor_carousel_controls">
            <div className="survivor_carousel_buttons">
              <Button
                className="h-12 w-12"
                variant="ghost"
                size="icon"
                onClick={handlePreviousSurvivor}>
                <ArrowLeftIcon className="size-8" />
              </Button>
              <Button
                className="h-12 w-12"
                variant="ghost"
                size="icon"
                onClick={handleNextSurvivor}>
                <ArrowRightIcon className="size-8" />
              </Button>
            </div>
          </div>

          <SurvivorCard
            mode={SurvivorCardMode.ENCOUNTER_CARD}
            selectedEncounter={selectedEncounter}
            selectedHunt={selectedHunt}
            selectedSettlement={selectedSettlement}
            selectedShowdown={null}
            selectedSurvivor={displayedSurvivor}
            setSelectedEncounter={setSelectedEncounter}
            setSelectedHunt={setSelectedHunt}
            setSurvivors={setSurvivors}
            survivors={survivors}
          />

          <Card className="w-full border-0 p-0 mt-2">
            <CardContent className="px-2 flex flex-col gap-2">
              <Textarea
                value={survivorNotesDraft}
                name="encounter-survivor-notes"
                id={`encounter-survivor-notes-${displayedSurvivor.id}`}
                onChange={(event) => {
                  setSurvivorNotesDraft(event.target.value)
                  setIsSurvivorNotesDirty(
                    event.target.value !== selectedEncounterSurvivor?.notes
                  )
                }}
                placeholder="Add encounter notes..."
                className="w-full resize-none text-xs font-normal"
                style={{ minHeight: '125px' }}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSaveSurvivorNotes}
                  disabled={!isSurvivorNotesDirty}
                  title="Save encounter notes">
                  <CheckIcon className="h-4 w-4" /> Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog
        open={isResumeDialogOpen}
        onOpenChange={setIsResumeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume Hunt</AlertDialogTitle>
            <AlertDialogDescription>
              The encounter will end and the survivors will continue the hunt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleResumeHunt} disabled={isEnding}>
              {isEnding ? 'Resuming...' : 'Resume Hunt'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isSettlementDialogOpen}
        onOpenChange={setIsSettlementDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Return to Settlement</AlertDialogTitle>
            <AlertDialogDescription>
              The encounter and hunt will end. Survivors will proceed to the
              settlement phase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReturnToSettlement}
              disabled={isEnding}>
              {isEnding ? 'Returning...' : 'Return'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
