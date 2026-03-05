'use client'

import { coreMilestones } from '@/lib/campaigns/common'
import { getMilestoneIds } from '@/lib/dal/milestone'
import { CampaignType } from '@/lib/enums'
import { CampaignTemplate } from '@/lib/types'

/**
 * Get Custom Campaign Template
 *
 * For a custom campaign, all arrays are empty except for milestones, which
 * includes the core milestones by default.
 */
export async function getCustomCampaignTemplate(): Promise<CampaignTemplate> {
  return {
    collectiveCognitionRewardIds: [],
    innovationIds: [],
    locationIds: [],
    milestoneIds: await getMilestoneIds(
      coreMilestones,
      CampaignType.CUSTOM,
      false
    ),
    nemesisIds: [],
    principleIds: [],
    quarryIds: [],
    timeline: [],
    wandererIds: []
  }
}
