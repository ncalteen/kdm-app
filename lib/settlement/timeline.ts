import { DatabaseCampaignType } from '@/lib/enums'

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
  campaignType: DatabaseCampaignType | null | undefined
): boolean {
  return [
    DatabaseCampaignType['Squires of the Citadel'],
    DatabaseCampaignType['People of the Stars'],
    DatabaseCampaignType['People of the Sun'],
    DatabaseCampaignType['Custom']
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
  campaignType: DatabaseCampaignType | null | undefined
): boolean {
  return [
    DatabaseCampaignType['People of the Lantern'],
    DatabaseCampaignType['People of the Dream Keeper'],
    DatabaseCampaignType['Custom']
  ].includes(campaignType as DatabaseCampaignType)
}
