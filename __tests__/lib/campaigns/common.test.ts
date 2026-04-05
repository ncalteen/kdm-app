import { describe, expect, it } from 'vitest'

import {
  coreCollectiveCognitionRewards,
  coreMilestones,
  corePrinciples,
  coreScoutLocations
} from '@/lib/campaigns/common'

describe('coreCollectiveCognitionRewards', () => {
  it('contains the expected reward names', () => {
    expect(coreCollectiveCognitionRewards).toContain('Pleasing Plating')
    expect(coreCollectiveCognitionRewards).toContain('Comprehensive Construction')
    expect(coreCollectiveCognitionRewards).toContain('Communal Larder')
    expect(coreCollectiveCognitionRewards).toContain('Sated Enlightenment')
    expect(coreCollectiveCognitionRewards).toContain('Metabolic Improvements')
    expect(coreCollectiveCognitionRewards).toContain('Shared Illumination')
    expect(coreCollectiveCognitionRewards).toContain('Culinary Ingenuity')
  })

  it('has 7 rewards', () => {
    expect(coreCollectiveCognitionRewards).toHaveLength(7)
  })
})

describe('coreMilestones', () => {
  it('contains the expected milestone names', () => {
    expect(coreMilestones).toContain('Population reaches 0')
    expect(coreMilestones).toContain('Population reaches 15')
    expect(coreMilestones).toContain('First time death count is updated')
  })

  it('has 3 milestones', () => {
    expect(coreMilestones).toHaveLength(3)
  })
})

describe('corePrinciples', () => {
  it('contains the expected principle names', () => {
    expect(corePrinciples).toContain('New Life')
    expect(corePrinciples).toContain('Death')
    expect(corePrinciples).toContain('Society')
    expect(corePrinciples).toContain('Conviction')
  })

  it('has 4 principles', () => {
    expect(corePrinciples).toHaveLength(4)
  })
})

describe('coreScoutLocations', () => {
  it('contains the expected scout locations', () => {
    expect(coreScoutLocations).toContain('Outskirts')
  })

  it('has 1 scout location', () => {
    expect(coreScoutLocations).toHaveLength(1)
  })
})
