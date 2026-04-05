import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock all DAL functions used by custom campaign template
vi.mock('@/lib/dal/milestone', () => ({
  getMilestoneIds: vi.fn()
}))

const { getMilestoneIds } = await import('@/lib/dal/milestone')
const { getCustomCampaignTemplate } = await import('@/lib/campaigns/custom')

describe('getCustomCampaignTemplate', () => {
  beforeEach(() => {
    vi.mocked(getMilestoneIds).mockResolvedValue(['milestone-1', 'milestone-2', 'milestone-3'])
  })

  it('returns a template with empty arrays for most fields', async () => {
    const template = await getCustomCampaignTemplate()

    expect(template.collectiveCognitionRewardIds).toEqual([])
    expect(template.innovationIds).toEqual([])
    expect(template.locationIds).toEqual([])
    expect(template.nemesisIds).toEqual([])
    expect(template.principleIds).toEqual([])
    expect(template.quarryIds).toEqual([])
    expect(template.timeline).toEqual([])
    expect(template.wandererIds).toEqual([])
  })

  it('calls getMilestoneIds with core milestones and CUSTOM campaign type', async () => {
    await getCustomCampaignTemplate()

    expect(getMilestoneIds).toHaveBeenCalledWith(
      expect.arrayContaining([
        'Population reaches 0',
        'Population reaches 15',
        'First time death count is updated'
      ]),
      'Custom',
      false
    )
  })

  it('returns milestone IDs from DAL', async () => {
    const template = await getCustomCampaignTemplate()

    expect(template.milestoneIds).toEqual([
      'milestone-1',
      'milestone-2',
      'milestone-3'
    ])
  })
})
