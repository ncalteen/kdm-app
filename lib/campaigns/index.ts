import { getCustomCampaignTemplate } from '@/lib/campaigns/custom'
import { getPeopleOfTheDreamKeeperTemplate } from '@/lib/campaigns/potdk'
import { getPeopleOfTheLanternTemplate } from '@/lib/campaigns/potl'
import { getPeopleOfTheStarsTemplate } from '@/lib/campaigns/potstars'
import { getPeopleOfTheSunTemplate } from '@/lib/campaigns/potsun'
import { getSquiresOfTheCitadelTemplate } from '@/lib/campaigns/squires'
import { getNemesisNodesById } from '@/lib/dal/nemesis'
import { getQuarryNodesById } from '@/lib/dal/quarry'
import { CampaignType, SurvivorType } from '@/lib/enums'
import { CampaignTemplate } from '@/lib/types'

/**
 * Fetch Campaign Template
 *
 * Fetches the campaign template for a given campaign type, including all
 * necessary data such as innovations, milestones, nemeses, principles, and
 * quarries.
 *
 * @param campaignType Campaign Type
 * @returns Campaign Template and Survivor Type
 */
export async function fetchTemplate(campaignType: CampaignType): Promise<{
  template: CampaignTemplate
  survivorType: SurvivorType
  monsters: Record<string, string[]>
  usesScouts: boolean
}> {
  const survivorType = [CampaignType.PEOPLE_OF_THE_DREAM_KEEPER].includes(
    campaignType
  )
    ? SurvivorType.ARC
    : SurvivorType.CORE

  const template =
    campaignType === CampaignType.CUSTOM
      ? await getCustomCampaignTemplate()
      : campaignType === CampaignType.PEOPLE_OF_THE_DREAM_KEEPER
        ? await getPeopleOfTheDreamKeeperTemplate()
        : campaignType === CampaignType.PEOPLE_OF_THE_LANTERN
          ? await getPeopleOfTheLanternTemplate()
          : campaignType === CampaignType.PEOPLE_OF_THE_STARS
            ? await getPeopleOfTheStarsTemplate()
            : campaignType === CampaignType.PEOPLE_OF_THE_SUN
              ? await getPeopleOfTheSunTemplate()
              : campaignType === CampaignType.SQUIRES_OF_THE_CITADEL
                ? await getSquiresOfTheCitadelTemplate()
                : null

  if (!template) throw new Error(`Unsupported Campaign Type: ${campaignType}`)

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

  const usesScouts = campaignType === CampaignType.PEOPLE_OF_THE_DREAM_KEEPER

  // Look up which node each quarry/nemesis belongs to
  const quarryNodes = await getQuarryNodesById(template.quarryIds)
  const nemesisNodes = await getNemesisNodesById(template.nemesisIds)

  // Group monster IDs by node
  for (const q of quarryNodes) if (monsters[q.node]) monsters[q.node].push(q.id)
  for (const n of nemesisNodes)
    if (monsters[n.node]) monsters[n.node].push(n.id)

  return { template, survivorType, monsters, usesScouts }
}
