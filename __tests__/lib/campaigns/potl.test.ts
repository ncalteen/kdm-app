import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock all DAL functions used by POTL campaign template
vi.mock('@/lib/dal/collective-cognition-reward', () => ({
  getCollectiveCognitionRewardIds: vi.fn()
}))
vi.mock('@/lib/dal/innovation', () => ({
  getInnovationIds: vi.fn()
}))
vi.mock('@/lib/dal/location', () => ({
  getLocationIds: vi.fn()
}))
vi.mock('@/lib/dal/milestone', () => ({
  getMilestoneIds: vi.fn()
}))
vi.mock('@/lib/dal/nemesis', () => ({
  getNemesisIds: vi.fn()
}))
vi.mock('@/lib/dal/principle', () => ({
  getPrincipleIds: vi.fn()
}))
vi.mock('@/lib/dal/quarry', () => ({
  getQuarryIds: vi.fn()
}))

const { getCollectiveCognitionRewardIds } = await import(
  '@/lib/dal/collective-cognition-reward'
)
const { getInnovationIds } = await import('@/lib/dal/innovation')
const { getLocationIds } = await import('@/lib/dal/location')
const { getMilestoneIds } = await import('@/lib/dal/milestone')
const { getNemesisIds } = await import('@/lib/dal/nemesis')
const { getPrincipleIds } = await import('@/lib/dal/principle')
const { getQuarryIds } = await import('@/lib/dal/quarry')
const { getPeopleOfTheLanternTemplate } = await import(
  '@/lib/campaigns/potl'
)

describe('getPeopleOfTheLanternTemplate', () => {
  beforeEach(() => {
    vi.mocked(getCollectiveCognitionRewardIds).mockResolvedValue(['ccr-1'])
    vi.mocked(getInnovationIds).mockResolvedValue(['innovation-1'])
    vi.mocked(getLocationIds).mockResolvedValue([
      'loc-1',
      'loc-2',
      'loc-3',
      'loc-4',
      'loc-5',
      'loc-6',
      'loc-7',
      'loc-8',
      'loc-9',
      'loc-10'
    ])
    vi.mocked(getMilestoneIds).mockResolvedValue([
      'ms-1',
      'ms-2',
      'ms-3',
      'ms-4',
      'ms-5'
    ])
    vi.mocked(getNemesisIds).mockResolvedValue([
      'nem-1',
      'nem-2',
      'nem-3',
      'nem-4',
      'nem-5'
    ])
    vi.mocked(getPrincipleIds).mockResolvedValue([
      'prin-1',
      'prin-2',
      'prin-3',
      'prin-4'
    ])
    vi.mocked(getQuarryIds).mockResolvedValue(['quarry-1', 'quarry-2', 'quarry-3'])
  })

  it('returns a template with IDs from all DAL functions', async () => {
    const template = await getPeopleOfTheLanternTemplate()

    expect(template.collectiveCognitionRewardIds).toEqual(['ccr-1'])
    expect(template.innovationIds).toEqual(['innovation-1'])
    expect(template.locationIds).toEqual([
      'loc-1', 'loc-2', 'loc-3', 'loc-4', 'loc-5',
      'loc-6', 'loc-7', 'loc-8', 'loc-9', 'loc-10'
    ])
    expect(template.milestoneIds).toEqual([
      'ms-1', 'ms-2', 'ms-3', 'ms-4', 'ms-5'
    ])
    expect(template.nemesisIds).toEqual([
      'nem-1', 'nem-2', 'nem-3', 'nem-4', 'nem-5'
    ])
    expect(template.principleIds).toEqual([
      'prin-1', 'prin-2', 'prin-3', 'prin-4'
    ])
    expect(template.quarryIds).toEqual(['quarry-1', 'quarry-2', 'quarry-3'])
    expect(template.wandererIds).toEqual([])
  })

  it('calls DAL functions with correct parameters', async () => {
    await getPeopleOfTheLanternTemplate()

    expect(getCollectiveCognitionRewardIds).toHaveBeenCalledWith(
      expect.arrayContaining(['Pleasing Plating', 'Facets of Existence']),
      false
    )
    expect(getInnovationIds).toHaveBeenCalledWith(['Language'], false)
    expect(getLocationIds).toHaveBeenCalledWith(
      expect.arrayContaining(['Barber Surgeon', 'Lantern Hoard']),
      false
    )
    expect(getMilestoneIds).toHaveBeenCalledWith(
      expect.arrayContaining([
        'Population reaches 0',
        'First child is born',
        'Settlement has 5 innovations'
      ]),
      'People of the Lantern',
      false
    )
    expect(getNemesisIds).toHaveBeenCalledWith(
      expect.arrayContaining(['Butcher', 'Gold Smoke Knight']),
      false
    )
    expect(getPrincipleIds).toHaveBeenCalledWith(
      expect.arrayContaining(['New Life', 'Death', 'Society', 'Conviction']),
      'People of the Lantern',
      false
    )
    expect(getQuarryIds).toHaveBeenCalledWith(
      expect.arrayContaining(['White Lion', 'Screaming Antelope', 'Phoenix']),
      false
    )
  })

  it('returns a timeline with 41 years (0-40)', async () => {
    const template = await getPeopleOfTheLanternTemplate()

    expect(template.timeline).toHaveLength(41)
    expect(template.timeline[0].year_number).toBe(0)
    expect(template.timeline[40].year_number).toBe(40)
  })

  it('has correct entries for special timeline years', async () => {
    const template = await getPeopleOfTheLanternTemplate()

    expect(template.timeline[1].entries).toContain('First Day')
    expect(template.timeline[1].entries).toContain('Returning Survivors')
    expect(template.timeline[5].entries).toContain('Hands of Heat')
    expect(template.timeline[12].entries).toContain('Principle: Conviction')
  })
})
