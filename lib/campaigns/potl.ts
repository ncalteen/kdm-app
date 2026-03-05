import {
  coreCollectiveCognitionRewards,
  coreMilestones,
  corePrinciples
} from '@/lib/campaigns/common'
import { getCollectiveCognitionRewardIds } from '@/lib/dal/collective-cognition-reward'
import { getInnovationIds } from '@/lib/dal/innovation'
import { getLocationIds } from '@/lib/dal/location'
import { getMilestoneIds } from '@/lib/dal/milestone'
import { getNemesisIds } from '@/lib/dal/nemesis'
import { getPrincipleIds } from '@/lib/dal/principle'
import { getQuarryIds } from '@/lib/dal/quarry'
import { CampaignType } from '@/lib/enums'
import { CampaignTemplate } from '@/lib/types'

/**
 * Get People of the Lantern Campaign Template
 */
export async function getPeopleOfTheLanternTemplate(): Promise<CampaignTemplate> {
  return {
    collectiveCognitionRewardIds: await getCollectiveCognitionRewardIds(
      [...coreCollectiveCognitionRewards, 'Facets of Existence'],
      false
    ),
    innovationIds: await getInnovationIds(['Language'], false),
    locationIds: await getLocationIds(
      [
        'Barber Surgeon',
        'Blacksmith',
        'Bone Smith',
        'Exhausted Lantern Hoard',
        'Lantern Hoard',
        'Leather Worker',
        'Mask Maker',
        'Organ Grinder',
        'Skinnery',
        'Weapon Crafter'
      ],
      false
    ),
    milestoneIds: await getMilestoneIds(
      [
        ...coreMilestones,
        'First child is born',
        'Settlement has 5 innovations'
      ],
      CampaignType.PEOPLE_OF_THE_LANTERN,
      false
    ),
    nemesisIds: await getNemesisIds(
      ['Butcher', 'The Hand', "King's Man", 'Watcher', 'Gold Smoke Knight'],
      false
    ),
    principleIds: await getPrincipleIds(
      corePrinciples,
      CampaignType.PEOPLE_OF_THE_LANTERN,

      false
    ),
    quarryIds: await getQuarryIds(
      ['White Lion', 'Screaming Antelope', 'Phoenix'],
      false
    ),
    timeline: [
      // Year 0 (Prologue)
      { year_number: 0, entries: [] },
      // Year 1
      { year_number: 1, entries: ['First Day', 'Returning Survivors'] },
      // Year 2
      { year_number: 2, entries: [] },
      // Year 3
      { year_number: 3, entries: [] },
      // Year 4
      { year_number: 4, entries: [] },
      // Year 5
      { year_number: 5, entries: ['Hands of Heat'] },
      // Year 6
      { year_number: 6, entries: [] },
      // Year 7
      { year_number: 7, entries: [] },
      // Year 8
      { year_number: 8, entries: [] },
      // Year 9
      { year_number: 9, entries: [] },
      // Year 10
      { year_number: 10, entries: [] },
      // Year 11
      { year_number: 11, entries: [] },
      // Year 12
      { year_number: 12, entries: ['Principle: Conviction'] },
      // Year 13
      { year_number: 13, entries: [] },
      // Year 14
      { year_number: 14, entries: [] },
      // Year 15
      { year_number: 15, entries: [] },
      // Year 16
      { year_number: 16, entries: [] },
      // Year 17
      { year_number: 17, entries: [] },
      // Year 18
      { year_number: 18, entries: [] },
      // Year 19
      { year_number: 19, entries: [] },
      // Year 20
      { year_number: 20, entries: [] },
      // Year 21
      { year_number: 21, entries: [] },
      // Year 22
      { year_number: 22, entries: [] },
      // Year 23
      { year_number: 23, entries: [] },
      // Year 24
      { year_number: 24, entries: [] },
      // Year 25
      { year_number: 25, entries: [] },
      // Year 26
      { year_number: 26, entries: [] },
      // Year 27
      { year_number: 27, entries: [] },
      // Year 28
      { year_number: 28, entries: [] },
      // Year 29
      { year_number: 29, entries: [] },
      // Year 30
      { year_number: 30, entries: [] },
      // Year 31
      { year_number: 31, entries: [] },
      // Year 32
      { year_number: 32, entries: [] },
      // Year 33
      { year_number: 33, entries: [] },
      // Year 34
      { year_number: 34, entries: [] },
      // Year 35
      { year_number: 35, entries: [] },
      // Year 36
      { year_number: 36, entries: [] },
      // Year 37
      { year_number: 37, entries: [] },
      // Year 38
      { year_number: 38, entries: [] },
      // Year 39
      { year_number: 39, entries: [] },
      // Year 40
      { year_number: 40, entries: [] }
    ],
    wandererIds: []
  }
}
