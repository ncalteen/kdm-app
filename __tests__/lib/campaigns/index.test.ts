import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CampaignType } from '@/lib/enums'

// Mock all campaign template functions
vi.mock('@/lib/campaigns/custom', () => ({
  getCustomCampaignTemplate: vi.fn()
}))
vi.mock('@/lib/campaigns/potdk', () => ({
  getPeopleOfTheDreamKeeperTemplate: vi.fn()
}))
vi.mock('@/lib/campaigns/potl', () => ({
  getPeopleOfTheLanternTemplate: vi.fn()
}))
vi.mock('@/lib/campaigns/potstars', () => ({
  getPeopleOfTheStarsTemplate: vi.fn()
}))
vi.mock('@/lib/campaigns/potsun', () => ({
  getPeopleOfTheSunTemplate: vi.fn()
}))
vi.mock('@/lib/campaigns/squires', () => ({
  getSquiresOfTheCitadelTemplate: vi.fn()
}))

// Mock DAL functions used in the index
vi.mock('@/lib/dal/nemesis', () => ({
  getNemesisNodesById: vi.fn()
}))
vi.mock('@/lib/dal/quarry', () => ({
  getQuarryNodesById: vi.fn()
}))

const { getCustomCampaignTemplate } = await import('@/lib/campaigns/custom')
const { getPeopleOfTheDreamKeeperTemplate } = await import(
  '@/lib/campaigns/potdk'
)
const { getPeopleOfTheLanternTemplate } = await import('@/lib/campaigns/potl')
const { getPeopleOfTheStarsTemplate } = await import('@/lib/campaigns/potstars')
const { getPeopleOfTheSunTemplate } = await import('@/lib/campaigns/potsun')
const { getSquiresOfTheCitadelTemplate } = await import(
  '@/lib/campaigns/squires'
)
const { getNemesisNodesById } = await import('@/lib/dal/nemesis')
const { getQuarryNodesById } = await import('@/lib/dal/quarry')
const { fetchTemplate } = await import('@/lib/campaigns/index')

const mockTemplate = {
  collectiveCognitionRewardIds: ['ccr-1'],
  innovationIds: ['innovation-1'],
  locationIds: ['loc-1'],
  milestoneIds: ['ms-1'],
  nemesisIds: ['nem-1'],
  principleIds: ['prin-1'],
  quarryIds: ['quarry-1'],
  timeline: [],
  wandererIds: []
}

describe('fetchTemplate', () => {
  beforeEach(() => {
    vi.mocked(getCustomCampaignTemplate).mockResolvedValue(mockTemplate)
    vi.mocked(getPeopleOfTheDreamKeeperTemplate).mockResolvedValue(mockTemplate)
    vi.mocked(getPeopleOfTheLanternTemplate).mockResolvedValue(mockTemplate)
    vi.mocked(getPeopleOfTheStarsTemplate).mockResolvedValue(mockTemplate)
    vi.mocked(getPeopleOfTheSunTemplate).mockResolvedValue(mockTemplate)
    vi.mocked(getSquiresOfTheCitadelTemplate).mockResolvedValue(mockTemplate)
    vi.mocked(getQuarryNodesById).mockResolvedValue([])
    vi.mocked(getNemesisNodesById).mockResolvedValue([])
  })

  it('fetches CUSTOM campaign template', async () => {
    const result = await fetchTemplate(CampaignType.CUSTOM)

    expect(getCustomCampaignTemplate).toHaveBeenCalled()
    expect(result.template).toEqual(mockTemplate)
    expect(result.survivorType).toBe('Core')
  })

  it('fetches PEOPLE_OF_THE_LANTERN campaign template', async () => {
    const result = await fetchTemplate(CampaignType.PEOPLE_OF_THE_LANTERN)

    expect(getPeopleOfTheLanternTemplate).toHaveBeenCalled()
    expect(result.template).toEqual(mockTemplate)
    expect(result.survivorType).toBe('Core')
  })

  it('fetches PEOPLE_OF_THE_STARS campaign template', async () => {
    const result = await fetchTemplate(CampaignType.PEOPLE_OF_THE_STARS)

    expect(getPeopleOfTheStarsTemplate).toHaveBeenCalled()
    expect(result.template).toEqual(mockTemplate)
    expect(result.survivorType).toBe('Core')
  })

  it('fetches PEOPLE_OF_THE_SUN campaign template', async () => {
    const result = await fetchTemplate(CampaignType.PEOPLE_OF_THE_SUN)

    expect(getPeopleOfTheSunTemplate).toHaveBeenCalled()
    expect(result.template).toEqual(mockTemplate)
    expect(result.survivorType).toBe('Core')
  })

  it('fetches PEOPLE_OF_THE_DREAM_KEEPER campaign template', async () => {
    const result = await fetchTemplate(
      CampaignType.PEOPLE_OF_THE_DREAM_KEEPER
    )

    expect(getPeopleOfTheDreamKeeperTemplate).toHaveBeenCalled()
    expect(result.template).toEqual(mockTemplate)
    expect(result.survivorType).toBe('Arc')
  })

  it('fetches SQUIRES_OF_THE_CITADEL campaign template', async () => {
    const result = await fetchTemplate(CampaignType.SQUIRES_OF_THE_CITADEL)

    expect(getSquiresOfTheCitadelTemplate).toHaveBeenCalled()
    expect(result.template).toEqual(mockTemplate)
    expect(result.survivorType).toBe('Core')
  })

  it('throws error for unsupported campaign type', async () => {
    await expect(
      fetchTemplate('Unknown' as CampaignType)
    ).rejects.toThrow('Unsupported Campaign Type: Unknown')
  })

  it('PEOPLE_OF_THE_DREAM_KEEPER uses scouts', async () => {
    const result = await fetchTemplate(CampaignType.PEOPLE_OF_THE_DREAM_KEEPER)

    expect(result.usesScouts).toBe(true)
  })

  it('other campaign types do not use scouts', async () => {
    const result = await fetchTemplate(CampaignType.PEOPLE_OF_THE_LANTERN)

    expect(result.usesScouts).toBe(false)
  })

  it('groups quarry nodes by node key', async () => {
    vi.mocked(getQuarryNodesById).mockResolvedValue([
      { id: 'quarry-1', node: 'NQ1' },
      { id: 'quarry-2', node: 'NQ2' }
    ])

    const result = await fetchTemplate(CampaignType.PEOPLE_OF_THE_LANTERN)

    expect(result.monsters['NQ1']).toContain('quarry-1')
    expect(result.monsters['NQ2']).toContain('quarry-2')
  })

  it('groups nemesis nodes by node key', async () => {
    vi.mocked(getNemesisNodesById).mockResolvedValue([
      { id: 'nem-1', node: 'NN1' },
      { id: 'nem-2', node: 'CO' }
    ])

    const result = await fetchTemplate(CampaignType.PEOPLE_OF_THE_LANTERN)

    expect(result.monsters['NN1']).toContain('nem-1')
    expect(result.monsters['CO']).toContain('nem-2')
  })

  it('returns empty monsters object with standard keys when no nodes', async () => {
    const result = await fetchTemplate(CampaignType.CUSTOM)

    expect(result.monsters).toEqual({
      NQ1: [],
      NQ2: [],
      NQ3: [],
      NQ4: [],
      NN1: [],
      NN2: [],
      NN3: [],
      CO: [],
      FI: []
    })
  })

  it('ignores nodes with unknown keys', async () => {
    vi.mocked(getQuarryNodesById).mockResolvedValue([
      { id: 'quarry-99', node: 'UNKNOWN_NODE' }
    ])

    const result = await fetchTemplate(CampaignType.PEOPLE_OF_THE_LANTERN)

    // Unknown node should be ignored
    expect(result.monsters['UNKNOWN_NODE']).toBeUndefined()
  })
})
