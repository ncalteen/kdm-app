import { describe, expect, it } from 'vitest'

import { CampaignType, DatabaseCampaignType } from '@/lib/enums'
import {
  showStoryEventIcon,
  usesNormalNumbering
} from '@/lib/settlement/timeline'

// ---------------------------------------------------------------------------
// usesNormalNumbering
// ---------------------------------------------------------------------------

describe('usesNormalNumbering', () => {
  it('returns true when campaignType is null', () => {
    expect(usesNormalNumbering(null)).toBe(true)
  })

  it('returns true when campaignType is undefined', () => {
    expect(usesNormalNumbering(undefined)).toBe(true)
  })

  it('returns true for Squires of the Citadel', () => {
    expect(
      usesNormalNumbering(
        DatabaseCampaignType[CampaignType.SQUIRES_OF_THE_CITADEL]
      )
    ).toBe(true)
  })

  it('returns true for People of the Stars', () => {
    expect(
      usesNormalNumbering(
        DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_STARS]
      )
    ).toBe(true)
  })

  it('returns true for People of the Sun', () => {
    expect(
      usesNormalNumbering(DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_SUN])
    ).toBe(true)
  })

  it('returns true for Custom', () => {
    expect(usesNormalNumbering(DatabaseCampaignType[CampaignType.CUSTOM])).toBe(
      true
    )
  })

  it('returns false for People of the Lantern', () => {
    expect(
      usesNormalNumbering(
        DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_LANTERN]
      )
    ).toBe(false)
  })

  it('returns false for People of the Dream Keeper', () => {
    expect(
      usesNormalNumbering(
        DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_DREAM_KEEPER]
      )
    ).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// showStoryEventIcon
// ---------------------------------------------------------------------------

describe('showStoryEventIcon', () => {
  it('returns true when campaignType is null', () => {
    expect(showStoryEventIcon(null)).toBe(true)
  })

  it('returns true when campaignType is undefined', () => {
    expect(showStoryEventIcon(undefined)).toBe(true)
  })

  it('returns true for People of the Lantern', () => {
    expect(
      showStoryEventIcon(
        DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_LANTERN]
      )
    ).toBe(true)
  })

  it('returns true for People of the Dream Keeper', () => {
    expect(
      showStoryEventIcon(
        DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_DREAM_KEEPER]
      )
    ).toBe(true)
  })

  it('returns true for Custom', () => {
    expect(showStoryEventIcon(DatabaseCampaignType[CampaignType.CUSTOM])).toBe(
      true
    )
  })

  it('returns false for People of the Stars', () => {
    expect(
      showStoryEventIcon(DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_STARS])
    ).toBe(false)
  })

  it('returns false for People of the Sun', () => {
    expect(
      showStoryEventIcon(DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_SUN])
    ).toBe(false)
  })

  it('returns false for Squires of the Citadel', () => {
    expect(
      showStoryEventIcon(
        DatabaseCampaignType[CampaignType.SQUIRES_OF_THE_CITADEL]
      )
    ).toBe(false)
  })
})
