'use client'

import { SelectWanderer } from '@/components/menu/select-wanderer'
import { ParentSelectionDrawer } from '@/components/survivor/parent-selection/parent-selection-drawer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { LocalStateType } from '@/contexts/local-context'
import { useCatalogFetch } from '@/hooks/use-catalog-fetch'
import { useToast } from '@/hooks/use-toast'
import { createSurvivor } from '@/lib/dal/survivor'
import { getWanderers } from '@/lib/dal/wanderer'
import {
  AenasState,
  DatabaseSurvivorType,
  Gender,
  SurvivorType
} from '@/lib/enums'
import { ERROR_MESSAGE, SURVIVOR_CREATED_MESSAGE } from '@/lib/messages'
import { sortWanderers } from '@/lib/settlement/wanderers'
import {
  SettlementDetail,
  SurvivorDetail,
  SurvivorsStateSetter,
  WandererDetail
} from '@/lib/types'
import {
  canDash,
  canEncourage,
  canEndure,
  canFistPump,
  canSurge,
  survivorsBornWithUnderstanding
} from '@/lib/utils'
import {
  NewSurvivorInput,
  NewSurvivorInputSchema
} from '@/schemas/new-survivor-input'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { Resolver, useForm, useWatch } from 'react-hook-form'

/**
 * Create Survivor Form Properties
 */
interface CreateSurvivorFormProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Is Creating New Survivor */
  setIsCreatingNewSurvivor: (isCreating: boolean) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivor: string | null) => void
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
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
  local,
  selectedSettlement,
  setIsCreatingNewSurvivor,
  setSelectedSurvivorId,
  setSurvivors,
  survivors
}: CreateSurvivorFormProps): ReactElement {
  const { toast } = useToast(local)

  const [activeTab, setActiveTab] = useState<'custom' | 'wanderer'>('custom')
  const [selectedWanderer, setSelectedWanderer] =
    useState<WandererDetail | null>(null)

  const { data: availableWanderers } = useCatalogFetch<{
    [key: string]: WandererDetail
  }>(selectedSettlement?.id, async () => sortWanderers(await getWanderers()), {
    initial: {},
    errorContext: 'Wanderers Fetch Error',
    onError: () => toast.error(ERROR_MESSAGE())
  })

  const form = useForm<NewSurvivorInput>({
    resolver: zodResolver(NewSurvivorInputSchema) as Resolver<NewSurvivorInput>,
    defaultValues: NewSurvivorInputSchema.parse({
      settlementId: selectedSettlement?.id
    })
  })

  // Derive settlement-level survivor capability flags from the current
  // innovations. Computing client-side keeps these in sync with realtime
  // innovation updates without requiring a full settlement refetch.
  const survivorCapabilities = useMemo(() => {
    const innovations = selectedSettlement?.innovations ?? []
    return {
      canDash: canDash(innovations),
      canFistPump: canFistPump(innovations),
      canEncourage: canEncourage(innovations),
      canEndure: canEndure(innovations),
      canSurge: canSurge(innovations)
    }
  }, [selectedSettlement?.innovations])

  // Separate derivation so it doesn't leak into `form.reset` via spread.
  const bornWithUnderstanding = useMemo(
    () => survivorsBornWithUnderstanding(selectedSettlement?.innovations ?? []),
    [selectedSettlement?.innovations]
  )

  // Set the form values when the component mounts
  useEffect(() => {
    console.debug('[CreateSurvivorForm] Initializing Form Values')

    if (!selectedSettlement?.id) return

    const updatedValues = {
      settlementId: selectedSettlement?.id,
      ...survivorCapabilities,
      huntXPRankUp:
        selectedSettlement?.survivor_type !==
        DatabaseSurvivorType[SurvivorType.ARC]
          ? [1, 5, 9, 14] // Core
          : [1], // Arc
      understanding: bornWithUnderstanding ? 1 : 0
    }

    // Reset form with updated values while preserving user-entered fields
    form.reset({
      ...form.getValues(),
      ...updatedValues
    })
  }, [
    form,
    selectedSettlement?.id,
    survivorCapabilities,
    bornWithUnderstanding,
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
        ...survivorCapabilities,
        huntXPRankUp:
          selectedSettlement.survivor_type !==
          DatabaseSurvivorType[SurvivorType.ARC]
            ? [2, 6, 10, 15]
            : [2],
        understanding: bornWithUnderstanding ? 1 : 0
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
      ...survivorCapabilities,

      // Wanderers join the settlement on their own; they have no lineage in the
      // player's settlement, so any parent selection is discarded when
      // switching to the wanderer flow.
      parent1Id: undefined,
      parent2Id: undefined,

      // Wanderer-specific data
      abilityImpairmentIds: wanderer.abilities_impairments.map((ai) => ai.id),
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
      movement: wanderer.movement ?? 5,
      survivorName: wanderer.wanderer_name,
      speed: wanderer.speed,
      strength: wanderer.strength,
      survival: wanderer.survival,
      understanding: wanderer.understanding,
      wanderer: true
    }

    // If this is an Arc settlement, set Arc-specific fields
    if (
      selectedSettlement?.survivor_type ===
      DatabaseSurvivorType[SurvivorType.ARC]
    ) {
      newSurvivor.lumi = wanderer.lumi
      newSurvivor.systemicPressure = wanderer.systemic_pressure
      newSurvivor.torment = wanderer.torment
    }

    // If the wanderer has a permanent injury, set it (currently only Luck).
    // Expand this to handle other permanent injuries as they are added.
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
    console.log('Form Values:', values)
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

    console.log('Optimistic Survivor:', optimisticSurvivor)

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

  // Watch the current parent selections so each parent slot can exclude the
  // survivor already chosen for the other slot.
  const parent1Id = useWatch({ control: form.control, name: 'parent1Id' })
  const parent2Id = useWatch({ control: form.control, name: 'parent2Id' })

  /**
   * Render Parent Selection Fields
   *
   * Renders two single-select drawers that let the user optionally pick the new
   * survivor's parents from the existing settlement roster. The fields are
   * intentionally rendered only on the manual creation flows — wanderers arrive
   * without parents, so the wanderer tab omits this UI entirely.
   *
   * @returns Parent selection fields
   */
  function renderParentFields(): ReactElement {
    return (
      <>
        {/* Parent 1 */}
        <FormField
          control={form.control}
          name="parent1Id"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel className="text-left whitespace-nowrap min-w-[120px]">
                  Parent 1
                </FormLabel>
                <div className="w-[75%]">
                  <ParentSelectionDrawer
                    local={local}
                    title="Select Parent 1"
                    description="Choose a survivor from your settlement to record as a parent."
                    emptyLabel="No parent selected"
                    survivors={survivors}
                    selectedSurvivorId={field.value ?? null}
                    disabledSurvivorIds={parent2Id ? [parent2Id] : []}
                    onSelectionChange={(value) =>
                      form.setValue('parent1Id', value ?? undefined, {
                        shouldDirty: true,
                        shouldValidate: true
                      })
                    }
                  />
                </div>
              </div>
            </FormItem>
          )}
        />

        {/* Parent 2 */}
        <FormField
          control={form.control}
          name="parent2Id"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel className="text-left whitespace-nowrap min-w-[120px]">
                  Parent 2
                </FormLabel>
                <div className="w-[75%]">
                  <ParentSelectionDrawer
                    local={local}
                    title="Select Parent 2"
                    description="Choose a second survivor from your settlement to record as a parent."
                    emptyLabel="No parent selected"
                    survivors={survivors}
                    selectedSurvivorId={field.value ?? null}
                    disabledSurvivorIds={parent1Id ? [parent1Id] : []}
                    onSelectionChange={(value) =>
                      form.setValue('parent2Id', value ?? undefined, {
                        shouldDirty: true,
                        shouldValidate: true
                      })
                    }
                  />
                </div>
              </div>
            </FormItem>
          )}
        />
      </>
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        // Without logging the raw error bag, a wanderer-derived payload that
        // fails schema validation (e.g. a custom wanderer saved with
        // movement < 1) produces a generic toast with no indication of the
        // offending field. Logging keeps those cases debuggable.
        console.error('Create Survivor Validation Error:', errors)
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
                          <ToggleGroup
                            type="single"
                            variant="outline"
                            value={field.value ?? ''}
                            onValueChange={(value) => {
                              if (value)
                                form.setValue('gender', value as Gender)
                            }}
                            className="w-[75%]"
                            aria-label="Survivor gender">
                            <ToggleGroupItem
                              value={Gender.MALE}
                              aria-label="Male">
                              Male
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value={Gender.FEMALE}
                              aria-label="Female">
                              Female
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </FormItem>
                    )}
                  />

                  {renderParentFields()}

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
                      value={selectedWanderer?.id ?? ''}
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
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          value={field.value ?? ''}
                          onValueChange={(value) => {
                            if (value) form.setValue('gender', value as Gender)
                          }}
                          className="w-[75%]"
                          aria-label="Survivor gender">
                          <ToggleGroupItem
                            value={Gender.MALE}
                            aria-label="Male">
                            Male
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value={Gender.FEMALE}
                            aria-label="Female">
                            Female
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </FormItem>
                  )}
                />

                {renderParentFields()}

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
          onClick={() => setIsCreatingNewSurvivor(false)}
          disabled={form.formState.isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? 'Naming the unnamed...'
            : 'Raise your lantern'}
        </Button>
      </div>
    </form>
  )
}
