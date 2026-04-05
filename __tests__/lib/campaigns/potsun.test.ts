import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock all DAL functions used by People of the Sun campaign template
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
const { getPeopleOfTheSunTemplate } = await import('@/lib/campaigns/potsun')

describe('getPeopleOfTheSunTemplate', () => {
  beforeEach(() => {
    vi.mocked(getCollectiveCognitionRewardIds).mockResolvedValue(['ccr-1'])
    vi.mocked(getInnovationIds).mockResolvedValue(['innovation-1'])
    vi.mocked(getLocationIds).mockResolvedValue([
      'loc-1', 'loc-2', 'loc-3', 'loc-4', 'loc-5',
      'loc-6', 'loc-7', 'loc-8', 'loc-9', 'loc-10'
    ])
    vi.mocked(getMilestoneIds).mockResolvedValue([
      'ms-1', 'ms-2', 'ms-3', 'ms-4', 'ms-5'
    ])
    vi.mocked(getNemesisIds).mockResolvedValue([
      'nem-1', 'nem-2', 'nem-3', 'nem-4'
    ])
    vi.mocked(getPrincipleIds).mockResolvedValue([
      'prin-1', 'prin-2', 'prin-3', 'prin-4'
    ])
    vi.mocked(getQuarryIds).mockResolvedValue([
      'quarry-1', 'quarry-2', 'quarry-3'
    ])
  })

  it('returns a template with no wanderer IDs', async () => {
    const template = await getPeopleOfTheSunTemplate()

    expect(template.wandererIds).toEqual([])
  })

  it('returns IDs from all DAL functions', async () => {
    const template = await getPeopleOfTheSunTemplate()

    expect(template.collectiveCognitionRewardIds).toEqual(['ccr-1'])
    expect(template.innovationIds).toEqual(['innovation-1'])
    expect(template.locationIds).toHaveLength(10)
    expect(template.milestoneIds).toHaveLength(5)
    expect(template.nemesisIds).toHaveLength(4)
    expect(template.principleIds).toHaveLength(4)
    expect(template.quarryIds).toHaveLength(3)
  })

  it('calls DAL functions with correct parameters', async () => {
    await getPeopleOfTheSunTemplate()

    expect(getCollectiveCognitionRewardIds).toHaveBeenCalledWith(
      expect.arrayContaining(['Pleasing Plating', 'Facets of Existence']),
      false
    )
    expect(getInnovationIds).toHaveBeenCalledWith(['Language'], false)
    expect(getLocationIds).toHaveBeenCalledWith(
      expect.arrayContaining(['Barber Surgeon', 'Sacred Pool', 'The Sun']),
      false
    )
    expect(getMilestoneIds).toHaveBeenCalledWith(
      expect.arrayContaining([
        'Population reaches 0',
        'Settlement has 8 innovations',
        'Not Victorious against Nemesis'
      ]),
      'People of the Sun',
      false
    )
    expect(getNemesisIds).toHaveBeenCalledWith(
      expect.arrayContaining([
        'Butcher',
        'The Great Devourer (Sunstalker)',
        'The Hand',
        "King's Man"
      ]),
      false
    )
    expect(getPrincipleIds).toHaveBeenCalledWith(
      expect.arrayContaining(['New Life', 'Death', 'Society', 'Conviction']),
      'People of the Sun',
      false
    )
    expect(getQuarryIds).toHaveBeenCalledWith(
      expect.arrayContaining(['White Lion', 'Screaming Antelope', 'Phoenix']),
      false
    )
  })

  it('returns a timeline with 41 years (0-40)', async () => {
    const template = await getPeopleOfTheSunTemplate()

    expect(template.timeline).toHaveLength(41)
    expect(template.timeline[0].year_number).toBe(0)
    expect(template.timeline[40].year_number).toBe(40)
  })

  it('has correct entries for special timeline years', async () => {
    const template = await getPeopleOfTheSunTemplate()

    expect(template.timeline[1].entries).toContain('The Pool and the Sun')
    expect(template.timeline[4].entries).toContain('Sun Dipping')
    expect(template.timeline[5].entries).toContain('The Great Sky Gift')
    expect(template.timeline[10].entries).toContain('Birth of Color')
    expect(template.timeline[11].entries).toContain('Principle: Conviction')
    expect(template.timeline[20].entries).toContain('Final Gift')
  })
})
