import { describe, expect, it } from 'vitest'

import {
  SquiresOfTheCitadelSurvivors,
  getSquiresOfTheCitadelTemplate
} from '@/lib/campaigns/squires'

describe('getSquiresOfTheCitadelTemplate', () => {
  it('returns a template with empty arrays for most fields', async () => {
    const template = await getSquiresOfTheCitadelTemplate()

    expect(template.collectiveCognitionRewardIds).toEqual([])
    expect(template.innovationIds).toEqual([])
    expect(template.locationIds).toEqual([])
    expect(template.milestoneIds).toEqual([])
    expect(template.nemesisIds).toEqual([])
    expect(template.principleIds).toEqual([])
    expect(template.quarryIds).toEqual([])
    expect(template.wandererIds).toEqual([])
  })

  it('returns the correct timeline', async () => {
    const template = await getSquiresOfTheCitadelTemplate()

    expect(template.timeline).toHaveLength(5)
    expect(template.timeline[0]).toEqual({
      year_number: 0,
      entries: ['The Feral Guardian']
    })
    expect(template.timeline[1]).toEqual({
      year_number: 1,
      entries: ['Mountain Lion']
    })
    expect(template.timeline[2]).toEqual({
      year_number: 2,
      entries: ['The Quest']
    })
    expect(template.timeline[3]).toEqual({
      year_number: 3,
      entries: ['Glimpse into the Future']
    })
    expect(template.timeline[4]).toEqual({
      year_number: 4,
      entries: ['Secrets, Secrets']
    })
  })
})

describe('SquiresOfTheCitadelSurvivors', () => {
  it('has the correct survivors', () => {
    expect(SquiresOfTheCitadelSurvivors).toHaveLength(4)
    expect(SquiresOfTheCitadelSurvivors).toContainEqual({
      name: 'Cain',
      gender: 'MALE'
    })
    expect(SquiresOfTheCitadelSurvivors).toContainEqual({
      name: 'Elle',
      gender: 'FEMALE'
    })
    expect(SquiresOfTheCitadelSurvivors).toContainEqual({
      name: 'Iola',
      gender: 'FEMALE'
    })
    expect(SquiresOfTheCitadelSurvivors).toContainEqual({
      name: 'Owen',
      gender: 'MALE'
    })
  })
})
