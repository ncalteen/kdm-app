'use client'

import { SelectCampaignType } from '@/components/menu/select-campaign-type'
import { SelectMonsterNode } from '@/components/menu/select-monster-node'
import { SelectSurvivorType } from '@/components/menu/select-survivor-type'
import { SelectWanderers } from '@/components/menu/select-wanderers'
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
import { Switch } from '@/components/ui/switch'
import { getCustomCampaignTemplate } from '@/lib/campaigns/custom'
import { getPeopleOfTheDreamKeeperTemplate } from '@/lib/campaigns/potdk'
import { getPeopleOfTheLanternTemplate } from '@/lib/campaigns/potl'
import { getPeopleOfTheStarsTemplate } from '@/lib/campaigns/potstars'
import { getPeopleOfTheSunTemplate } from '@/lib/campaigns/potsun'
import { getSquiresOfTheCitadelTemplate } from '@/lib/campaigns/squires'
import { getNemesisNodesById } from '@/lib/dal/nemesis'
import { getQuarryNodesById } from '@/lib/dal/quarry'
import { createSettlement } from '@/lib/dal/settlement'
import { CampaignType, MonsterNode, SurvivorType } from '@/lib/enums'
import { ERROR_MESSAGE, SETTLEMENT_CREATED_MESSAGE } from '@/lib/messages'
import { CampaignTemplate } from '@/lib/types'
import {
  NewSettlementInput,
  NewSettlementInputSchema
} from '@/schemas/new-settlement-input'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReactElement, useEffect } from 'react'
import { Resolver, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

/**
 * Create Settlement Card Properties
 */
interface CreateSettlementCardProps {
  /** Set Selected Hunt ID */
  setSelectedHuntId: (hunt: string | null) => void
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
  /** Set Selected Settlement ID */
  setSelectedSettlementId: (settlement: string | null) => void
  /** Set Selected Settlement Phase ID */
  setSelectedSettlementPhaseId: (settlementPhase: string | null) => void
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdown: string | null) => void
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivor: string | null) => void
}

/**
 * Create Settlement Card Component
 *
 * This component is responsible for rendering the form that allows users to
 * name and create a settlement. It includes fields for selecting the campaign
 * type, survivor type, and the settlement name.
 *
 * @param props Create Settlement Card Properties
 * @returns Create Settlement Card Component
 */
export function CreateSettlementCard({
  setSelectedHuntId,
  setSelectedHuntMonsterIndex,
  setSelectedSettlementId,
  setSelectedSettlementPhaseId,
  setSelectedShowdownId,
  setSelectedShowdownMonsterIndex,
  setSelectedSurvivorId
}: CreateSettlementCardProps): ReactElement {
  const form = useForm<NewSettlementInput>({
    resolver: zodResolver(
      NewSettlementInputSchema
    ) as Resolver<NewSettlementInput>,
    defaultValues: {
      campaignType: CampaignType.PEOPLE_OF_THE_LANTERN,
      settlementName: '',
      survivorType: SurvivorType.CORE,
      usesScouts: false,
      monsterIds: {
        NQ1: [],
        NQ2: [],
        NQ3: [],
        NQ4: [],
        NN1: [],
        NN2: [],
        NN3: [],
        CO: [],
        FI: []
      },
      wandererIds: []
    }
  })

  // Watch the form's campaign type and survivor type for reactive updates
  const campaignType = useWatch({ control: form.control, name: 'campaignType' })
  const survivorType = useWatch({ control: form.control, name: 'survivorType' })

  const disableMonsterSelection =
    campaignType === CampaignType.SQUIRES_OF_THE_CITADEL
  const disableScoutSelection =
    campaignType === CampaignType.PEOPLE_OF_THE_DREAM_KEEPER ||
    campaignType === CampaignType.SQUIRES_OF_THE_CITADEL
  const disableSurvivorTypeSelection =
    campaignType === CampaignType.PEOPLE_OF_THE_DREAM_KEEPER ||
    campaignType === CampaignType.SQUIRES_OF_THE_CITADEL

  useEffect(() => {
    /** Resolve the campaign template and survivor type for the selected type */
    const fetchTemplate = async (): Promise<{
      template: CampaignTemplate
      survivorType: SurvivorType
    }> => {
      switch (campaignType) {
        case CampaignType.CUSTOM:
          return {
            template: await getCustomCampaignTemplate(),
            survivorType: SurvivorType.CORE
          }
        case CampaignType.PEOPLE_OF_THE_DREAM_KEEPER:
          return {
            template: await getPeopleOfTheDreamKeeperTemplate(),
            survivorType: SurvivorType.ARC
          }
        case CampaignType.PEOPLE_OF_THE_LANTERN:
          return {
            template: await getPeopleOfTheLanternTemplate(),
            survivorType: SurvivorType.CORE
          }
        case CampaignType.PEOPLE_OF_THE_STARS:
          return {
            template: await getPeopleOfTheStarsTemplate(),
            survivorType: SurvivorType.CORE
          }
        case CampaignType.PEOPLE_OF_THE_SUN:
          return {
            template: await getPeopleOfTheSunTemplate(),
            survivorType: SurvivorType.CORE
          }
        case CampaignType.SQUIRES_OF_THE_CITADEL:
          return {
            template: await getSquiresOfTheCitadelTemplate(),
            survivorType: SurvivorType.CORE
          }
        default:
          throw new Error(`Unsupported Campaign Type: ${campaignType}`)
      }
    }

    fetchTemplate()
      .then(async ({ template: t, survivorType: st }) => {
        // Look up which node each quarry/nemesis belongs to
        const [quarryNodes, nemesisNodes] = await Promise.all([
          getQuarryNodesById(t.quarryIds),
          getNemesisNodesById(t.nemesisIds)
        ])

        // Group monster IDs by node
        const monsters: Record<string, string[]> = {
          NQ1: [],
          NQ2: [],
          NQ3: [],
          NQ4: [],
          NN1: [],
          NN2: [],
          NN3: [],
          CO: [],
          FI: []
        }

        for (const q of quarryNodes)
          if (monsters[q.node]) monsters[q.node].push(q.id)

        for (const n of nemesisNodes)
          if (monsters[n.node]) monsters[n.node].push(n.id)

        // Populate form fields from the template
        form.setValue('survivorType', st)
        form.setValue('wandererIds', t.wandererIds)

        // Set usesScouts based on campaign type
        if (campaignType === CampaignType.PEOPLE_OF_THE_DREAM_KEEPER)
          form.setValue('usesScouts', true)
        else if (campaignType === CampaignType.SQUIRES_OF_THE_CITADEL)
          form.setValue('usesScouts', false)

        form.setValue('monsterIds', {
          NQ1: monsters[MonsterNode.NQ1],
          NQ2: monsters[MonsterNode.NQ2],
          NQ3: monsters[MonsterNode.NQ3],
          NQ4: monsters[MonsterNode.NQ4],
          NN1: monsters[MonsterNode.NN1],
          NN2: monsters[MonsterNode.NN2],
          NN3: monsters[MonsterNode.NN3],
          CO: monsters[MonsterNode.CO],
          FI: monsters[MonsterNode.FI]
        })
      })
      .catch((err: unknown) =>
        console.error(`Error Fetching ${campaignType} Campaign Template:`, err)
      )
  }, [campaignType, form])

  /**
   * On Submit Handler
   *
   * @param values Form Values on Submit
   */
  function onSubmit(values: NewSettlementInput) {
    try {
      createSettlement(values).then((settlementId) => {
        setSelectedHuntId(null)
        setSelectedHuntMonsterIndex(0)
        setSelectedSettlementId(settlementId)
        setSelectedSettlementPhaseId(null)
        setSelectedShowdownId(null)
        setSelectedShowdownMonsterIndex(0)
        setSelectedSurvivorId(null)

        // Reset the form to initial default values
        form.reset({
          campaignType: CampaignType.PEOPLE_OF_THE_LANTERN,
          settlementName: '',
          survivorType: SurvivorType.CORE,
          usesScouts: false,
          monsterIds: {
            NQ1: [],
            NQ2: [],
            NQ3: [],
            NQ4: [],
            NN1: [],
            NN2: [],
            NN3: [],
            CO: [],
            FI: []
          },
          wandererIds: []
        })

        // Show success message
        toast.success(SETTLEMENT_CREATED_MESSAGE())
      })
    } catch (error) {
      console.error('Settlement Create Error:', error)
      toast.error(ERROR_MESSAGE())
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (e) => {
        for (const key of Object.keys(e)) {
          const error = e[key as keyof typeof e]
          if (error?.message) return toast.error(error.message)
        }
      })}
      className="space-y-6">
      <Form {...form}>
        <Card className="max-w-[500px] mt-10 mx-auto">
          <CardContent className="flex flex-col gap-2 w-full">
            {/* Settlement Name */}
            <FormField
              control={form.control}
              name="settlementName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-left whitespace-nowrap min-w-[120px]">
                      Settlement
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Settlement Name"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          form.setValue(field.name, e.target.value)
                        }
                        className="w-full max-w-[250px]"
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <hr className="my-0" />

            {/* Campaign Type */}
            <FormField
              control={form.control}
              name="campaignType"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-left whitespace-nowrap min-w-[120px]">
                      Campaign Type
                    </FormLabel>
                    <FormControl>
                      <SelectCampaignType
                        {...field}
                        value={
                          field.value ?? CampaignType.PEOPLE_OF_THE_LANTERN
                        }
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            {/* Survivor Type */}
            <FormField
              control={form.control}
              name="survivorType"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-left whitespace-nowrap min-w-[120px]">
                      Survivor Type
                    </FormLabel>
                    <FormControl>
                      <SelectSurvivorType
                        value={survivorType}
                        onChange={field.onChange}
                        disabled={disableSurvivorTypeSelection}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            {/* Uses Scouts */}
            <FormField
              control={form.control}
              name="usesScouts"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-left whitespace-nowrap min-w-[120px]">
                      Use Scouts
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={disableScoutSelection}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            {/* Wanderers */}
            <FormField
              control={form.control}
              name="wandererIds"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-left whitespace-nowrap min-w-[120px]">
                      Wanderers
                    </FormLabel>
                    <FormControl>
                      <SelectWanderers
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableMonsterSelection}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Monster Node Selection */}
        <Card className="max-w-[500px] mx-auto pt-0">
          <CardContent className="flex flex-col gap-6 w-full pt-6">
            {/* Quarry Nodes Row */}
            <div className="grid grid-cols-4 gap-2">
              <FormField
                control={form.control}
                name="monsterIds.NQ1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block mb-2">
                      N<sub>Q</sub>
                      <sup>1</sup>
                    </FormLabel>
                    <FormControl>
                      <SelectMonsterNode
                        nodeType={MonsterNode.NQ1}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableMonsterSelection}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monsterIds.NQ2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block mb-2">
                      N<sub>Q</sub>
                      <sup>2</sup>
                    </FormLabel>
                    <FormControl>
                      <SelectMonsterNode
                        nodeType={MonsterNode.NQ2}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableMonsterSelection}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monsterIds.NQ3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block mb-2">
                      N<sub>Q</sub>
                      <sup>3</sup>
                    </FormLabel>
                    <FormControl>
                      <SelectMonsterNode
                        nodeType={MonsterNode.NQ3}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableMonsterSelection}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monsterIds.NQ4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block mb-2">
                      N<sub>Q</sub>
                      <sup>4</sup>
                    </FormLabel>
                    <FormControl>
                      <SelectMonsterNode
                        nodeType={MonsterNode.NQ4}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableMonsterSelection}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Nemesis Nodes Row */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="monsterIds.NN1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block mb-2">
                      N<sub>N</sub>
                      <sup>1</sup>
                    </FormLabel>
                    <FormControl>
                      <SelectMonsterNode
                        nodeType={MonsterNode.NN1}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableMonsterSelection}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monsterIds.NN2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block mb-2">
                      N<sub>N</sub>
                      <sup>2</sup>
                    </FormLabel>
                    <FormControl>
                      <SelectMonsterNode
                        nodeType={MonsterNode.NN2}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableMonsterSelection}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monsterIds.NN3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block mb-2">
                      N<sub>N</sub>
                      <sup>3</sup>
                    </FormLabel>
                    <FormControl>
                      <SelectMonsterNode
                        nodeType={MonsterNode.NN3}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableMonsterSelection}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Core and Finale Nodes Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monsterIds.CO"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block mb-2">Co</FormLabel>
                    <FormControl>
                      <SelectMonsterNode
                        nodeType={MonsterNode.CO}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableMonsterSelection}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monsterIds.FI"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block mb-2">Fi</FormLabel>
                    <FormControl>
                      <SelectMonsterNode
                        nodeType={MonsterNode.FI}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={disableMonsterSelection}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </Form>

      <Button type="submit" className="mx-auto block">
        Create Settlement
      </Button>
    </form>
  )
}
