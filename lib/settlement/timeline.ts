import { Tables } from '@/lib/database.types'
import { CampaignType, DatabaseCampaignType } from '@/lib/enums'

/**
 * Timeline Uses Normal Numbering
 *
 * Determines if the settlement timeline should use normal numbering (1, 2,
 * 3...) or Prologue style numbering based on the campaign type.
 *
 * Prologue is only used in the People of the Lantern and People of the Dream
 * Keeper campaigns (as well as custom campaigns).
 *
 * @param campaignType Campaign Type
 * @returns Timeline Uses Normal Numbering
 */
export function usesNormalNumbering(
  campaignType: Tables<'settlement'>['campaign_type'] | null | undefined
): boolean {
  if (!campaignType) return true

  return [
    DatabaseCampaignType[CampaignType.SQUIRES_OF_THE_CITADEL],
    DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_STARS],
    DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_SUN],
    DatabaseCampaignType[CampaignType.CUSTOM]
  ].includes(campaignType as DatabaseCampaignType)
}

/**
 * Timeline Uses Story Event Icon
 *
 * Determines if the settlement timeline should show the scroll icon to indicate
 * that a story event card should be drawn when updating the settlement's
 * timeline.
 *
 * @param campaignType Campaign Type
 * @returns Timeline Uses Story Event Icon
 */
export function showStoryEventIcon(
  campaignType: Tables<'settlement'>['campaign_type'] | null | undefined
): boolean {
  if (!campaignType) return true

  return [
    DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_LANTERN],
    DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_DREAM_KEEPER],
    DatabaseCampaignType[CampaignType.CUSTOM]
  ].includes(campaignType as DatabaseCampaignType)
}
