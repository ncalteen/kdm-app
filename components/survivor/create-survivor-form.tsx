'use client'

import { SelectWanderer } from '@/components/menu/select-wanderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createSurvivor } from '@/lib/dal/survivor'
import { getWanderers } from '@/lib/dal/wanderer'
import { AenasState, DatabaseSurvivorType, Gender } from '@/lib/enums'
import { ERROR_MESSAGE, SURVIVOR_CREATED_MESSAGE } from '@/lib/messages'
import { sortWanderers } from '@/lib/settlement/wanderers'
import { SettlementDetail, SurvivorDetail, WandererDetail } from '@/lib/types'
import {
  NewSurvivorInput,
  NewSurvivorInputSchema
} from '@/schemas/new-survivor-input'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReactElement, useEffect, useState } from 'react'
import { Resolver, useForm } from 'react-hook-form'
import { toast } from 'sonner'

/**
 * Create Survivor Form Properties
 */
interface CreateSurvivorFormProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Is Creating New Survivor */
  setIsCreatingNewSurvivor: (isCreating: boolean) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivor: string | null) => void
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Create Survivor Form Component
 *
 * This component is responsible for rendering the form that allows users to
 * name and create a new survivor. It includes fields for selecting the
 * settlement, survivor name, and gender.
 *
 * The chosen settlement will determine the available options and defaults.
 *
 * @param props Create Survivor Form Properties
 * @returns Create Survivor Form
 */
export function CreateSurvivorForm({
  selectedSettlement,
  setIsCreatingNewSurvivor,
  setSelectedSurvivorId,
  setSurvivors,
  survivors
}: CreateSurvivorFormProps): ReactElement {
  const [activeTab, setActiveTab] = useState<'custom' | 'wanderer'>('custom')
  const [selectedWanderer, setSelectedWanderer] =
    useState<WandererDetail | null>(null)
  const [availableWanderers, setAvailableWanderers] = useState<{
    [key: string]: WandererDetail
  }>({})
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  // Track the previous settlement ID to reset state on settlement change.
  const [prevSettlementId, setPrevSettlementId] = useState<string | null>(
    selectedSettlement?.id ?? null
  )

  if (selectedSettlement?.id !== prevSettlementId) {
    setPrevSettlementId(selectedSettlement?.id ?? null)
    setAvailableWanderers({})
    setHasFetched(false)
  }

  /**
   * Fetch wanderers when the settlement changes.
   */
  useEffect(() => {
    if (!selectedSettlement?.id || hasFetched) return

    let cancelled = false

    Promise.all([getWanderers()])
      .then(([wanderers]) => {
        if (cancelled) return

        setAvailableWanderers(sortWanderers(wanderers))
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        console.error('Wanderers Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched])

  const form = useForm<NewSurvivorInput>({
    resolver: zodResolver(NewSurvivorInputSchema) as Resolver<NewSurvivorInput>,
    defaultValues: NewSurvivorInputSchema.parse({
      settlementId: selectedSettlement?.id
    })
  })

  // Set the form values when the component mounts
  useEffect(() => {
    console.debug('[CreateSurvivorForm] Initializing Form Values')

    if (!selectedSettlement?.id) return

    const updatedValues = {
      settlementId: selectedSettlement?.id,
      canDash: selectedSettlement?.can_dash ?? false,
      canFistPump: selectedSettlement?.can_fist_pump ?? false,
      canEncourage: selectedSettlement?.can_encourage ?? false,
      canEndure: selectedSettlement?.can_endure ?? false,
      canSurge: selectedSettlement?.can_surge ?? false,
      huntXPRankUp:
        selectedSettlement?.survivor_type !== DatabaseSurvivorType['Arc']
          ? [2, 6, 10, 15] // Core
          : [2], // Arc
      understanding: selectedSettlement?.survivors_born_with_understanding
        ? 1
        : 0
    }

    // Reset form with updated values while preserving user-entered fields
    form.reset({
      ...form.getValues(),
      ...updatedValues
    })
  }, [
    form,
    selectedSettlement?.id,
    selectedSettlement?.can_dash,
    selectedSettlement?.can_fist_pump,
    selectedSettlement?.can_encourage,
    selectedSettlement?.can_endure,
    selectedSettlement?.can_surge,
    selectedSettlement?.survivors_born_with_understanding,
    selectedSettlement?.survivor_type
  ])

  /**
   * Handle Tab Change
   *
   * Resets the form when switching tabs.
   *
   * @param value Tab value
   */
  function handleTabChange(value: string) {
    const tab = value as 'custom' | 'wanderer'
    setActiveTab(tab)

    // Reset form when switching to custom tab
    if (tab === 'custom' && selectedSettlement && selectedSettlement?.id) {
      setSelectedWanderer(null)
      form.reset({
        ...NewSurvivorInputSchema.parse({
          settlementId: selectedSettlement?.id
        }),
        canDash: selectedSettlement?.can_dash ?? false,
        canFistPump: selectedSettlement?.can_fist_pump ?? false,
        canEncourage: selectedSettlement?.can_encourage ?? false,
        canEndure: selectedSettlement?.can_endure ?? false,
        canSurge: selectedSettlement?.can_surge ?? false,
        huntXPRankUp:
          selectedSettlement.survivor_type !== DatabaseSurvivorType['Arc']
            ? [2, 6, 10, 15]
            : [2],
        understanding: selectedSettlement?.survivors_born_with_understanding
          ? 1
          : 0
      })
    }
  }

  /**
   * Handle Wanderer Selection
   *
   * When a wanderer is selected, their data is used to populate the form.
   *
   * @param wanderer Selected Wanderer
   */
  function handleWandererSelect(wanderer: WandererDetail | null) {
    if (!wanderer || !selectedSettlement?.id) return

    setSelectedWanderer(wanderer)

    const newSurvivor = {
      ...NewSurvivorInputSchema.parse({
        settlementId: selectedSettlement?.id
      }),
      canDash: selectedSettlement?.can_dash ?? false,
      canFistPump: selectedSettlement?.can_fist_pump ?? false,
      canEncourage: selectedSettlement?.can_encourage ?? false,
      canEndure: selectedSettlement?.can_endure ?? false,
      canSurge: selectedSettlement?.can_surge ?? false,

      // Wanderer-specific data
      abilitiesAndImpairments: wanderer.abilities_impairments,
      accuracy: wanderer.accuracy,
      courage: wanderer.courage,
      disposition: wanderer.disposition,
      evasion: wanderer.evasion,
      fightingArtIds: wanderer.fighting_art_ids,
      gender: Gender[wanderer.gender],
      huntXP: wanderer.hunt_xp,
      huntXPRankUp: wanderer.hunt_xp_rank_up,
      insanity: wanderer.insanity,
      luck: wanderer.luck,
      movement: wanderer.movement,
      survivorName: wanderer.wanderer_name,
      speed: wanderer.speed,
      strength: wanderer.strength,
      survival: wanderer.survival,
      understanding: wanderer.understanding,
      wanderer: true
    }

    // If this is an Arc settlement, set Arc-specific fields
    if (selectedSettlement?.survivor_type === DatabaseSurvivorType['Arc']) {
      newSurvivor.lumi = wanderer.lumi
      newSurvivor.systemicPressure = wanderer.systemic_pressure
      newSurvivor.torment = wanderer.torment
    }

    // If the wanderer has a permanent injury, set it (currently only Luck).
    // TODO: Expand this to handle other permanent injuries as they are added.
    for (const injury of wanderer.permanent_injuries)
      if (injury === 'headBlind') newSurvivor.headBlind = 1

    // If the wanderer is Goth and the settlement does **not** have the
    // Cannibalize death principle, gain an additional disposition.
    if (
      wanderer.wanderer_name === 'Goth' &&
      !selectedSettlement?.principles?.some(
        (p) =>
          (p.option_1_name === 'Cannibalize' && p.option_1_selected) ||
          (p.option_2_name === 'Cannibalize' && p.option_2_selected)
      )
    )
      newSurvivor.disposition = (newSurvivor.disposition ?? 0) + 1

    // If the wanderer is Aenas, set her initial state (default to Hungry)
    if (wanderer.wanderer_name === 'Aenas')
      newSurvivor.aenasState = AenasState.HUNGRY

    // Populate form with wanderer data
    form.reset(newSurvivor)
  }

  /**
   * Handle Form Submission
   *
   * @param values Form Values
   */
  function onSubmit(values: NewSurvivorInput) {
    const originalSurvivors = [...survivors]

    // Optimistic placeholder row (uses a temporary ID).
    const tempId = `temp-${crypto.randomUUID()}`
    const optimisticSurvivor: SurvivorDetail = {
      id: tempId,
      settlement_id: values.settlementId ?? '',
      survivor_name: values.survivorName ?? null,
      gender: values.gender === 'M' ? 'MALE' : 'FEMALE',
      hunt_xp: values.huntXP,
      dead: false,
      embarked: false
    } as SurvivorDetail

    setSurvivors([...survivors, optimisticSurvivor])

    createSurvivor(values)
      .then((survivor) => {
        // Replace the placeholder with the real row from the DB.
        setSurvivors([...originalSurvivors, survivor])

        toast.success(SURVIVOR_CREATED_MESSAGE())
        setSelectedSurvivorId(survivor.id)
        setIsCreatingNewSurvivor(false)
      })
      .catch((err: unknown) => {
        // Revert the optimistic insert.
        setSurvivors(originalSurvivors)

        console.error('Create Survivor Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, () => {
        toast.error(ERROR_MESSAGE())
      })}
      className="py-3 space-y-6">
      <Form {...form}>
        <Card className="max-w-[500px] mx-auto">
          <CardContent className="w-full space-y-2">
            {Object.keys(availableWanderers).length > 0 ? (
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="custom">New Survivor</TabsTrigger>
                  <TabsTrigger value="wanderer">Wanderer</TabsTrigger>
                </TabsList>

                <TabsContent value="custom" className="space-y-2 mt-4">
                  {/* Survivor Name */}
                  <FormField
                    control={form.control}
                    name="survivorName"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-left whitespace-nowrap min-w-[120px]">
                            Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Survivor name..."
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                form.setValue('survivorName', e.target.value)
                              }}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Survivor Gender */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-left whitespace-nowrap min-w-[120px]">
                            Gender
                          </FormLabel>
                          <div className="flex w-[75%] items-center gap-2">
                            <Checkbox
                              id="male-checkbox"
                              checked={field.value === Gender.MALE}
                              onCheckedChange={(checked) => {
                                if (checked)
                                  form.setValue('gender', Gender.MALE)
                              }}
                            />
                            <Label htmlFor="male-checkbox" className="text-sm">
                              M
                            </Label>
                            <Checkbox
                              id="female-checkbox"
                              checked={field.value === Gender.FEMALE}
                              onCheckedChange={(checked) => {
                                if (checked)
                                  form.setValue('gender', Gender.FEMALE)
                              }}
                            />
                            <Label
                              htmlFor="female-checkbox"
                              className="text-sm">
                              F
                            </Label>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <hr className="my-2" />

                  <div className="text-xs text-muted-foreground">
                    When you name your survivor, gain +1{' '}
                    <strong>survival</strong>.
                  </div>
                </TabsContent>

                <TabsContent value="wanderer" className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-left whitespace-nowrap min-w-[120px]">
                      Wanderer
                    </Label>
                    <SelectWanderer
                      wanderers={availableWanderers}
                      value={selectedWanderer?.wanderer_name ?? ''}
                      onChange={handleWandererSelect}
                    />
                  </div>

                  {selectedWanderer && (
                    <>
                      <hr className="my-2" />
                      <div className="text-xs text-muted-foreground">
                        <strong>{selectedWanderer.wanderer_name}</strong> will
                        join your settlement with their unique abilities and
                        stats.
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              /* No wanderers available - show standard form */
              <>
                {/* Survivor Name */}
                <FormField
                  control={form.control}
                  name="survivorName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-left whitespace-nowrap min-w-[120px]">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Survivor name..."
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              form.setValue('survivorName', e.target.value)
                            }}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Survivor Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-left whitespace-nowrap min-w-[120px]">
                          Gender
                        </FormLabel>
                        <div className="flex w-[75%] items-center gap-2">
                          <Checkbox
                            id="male-checkbox-no-wanderer"
                            checked={field.value === Gender.MALE}
                            onCheckedChange={(checked) => {
                              if (checked) form.setValue('gender', Gender.MALE)
                            }}
                          />
                          <Label
                            htmlFor="male-checkbox-no-wanderer"
                            className="text-sm">
                            M
                          </Label>
                          <Checkbox
                            id="female-checkbox-no-wanderer"
                            checked={field.value === Gender.FEMALE}
                            onCheckedChange={(checked) => {
                              if (checked)
                                form.setValue('gender', Gender.FEMALE)
                            }}
                          />
                          <Label
                            htmlFor="female-checkbox-no-wanderer"
                            className="text-sm">
                            F
                          </Label>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <hr className="my-2" />

                <div className="text-xs text-muted-foreground">
                  When you name your survivor, gain +1 <strong>survival</strong>
                  .
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Form>

      <div className="flex gap-2 justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsCreatingNewSurvivor(false)}>
          Cancel
        </Button>
        <Button type="submit">Create Survivor</Button>
      </div>
    </form>
  )
}
