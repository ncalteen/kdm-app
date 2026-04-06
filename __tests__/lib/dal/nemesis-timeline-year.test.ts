import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CampaignType } from '@/lib/enums'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getNemesisTimelineYears,
  addNemesisTimelineYear,
  updateNemesisTimelineYear,
  removeNemesisTimelineYear
} = await import('@/lib/dal/nemesis-timeline-year')

beforeEach(() => {
  vi.clearAllMocks()
})

const mockTimelineYear = { id: 'ty1', entries: [], year_number: 1 }

describe('getNemesisTimelineYears', () => {
  it('throws when nemesisId is null', async () => {
    await expect(getNemesisTimelineYears(null)).rejects.toThrow(
      'Required: Nemesis ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when nemesisId is undefined', async () => {
    await expect(getNemesisTimelineYears(undefined)).rejects.toThrow(
      'Required: Nemesis ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns timeline years without campaignType filter', async () => {
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: [mockTimelineYear], error: null })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisTimelineYears('n1')

    expect(result).toEqual([mockTimelineYear])
    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_timeline_year')
  })

  it('returns timeline years with campaignType filter', async () => {
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: [mockTimelineYear], error: null })
    const mockContains = vi.fn().mockReturnValue({ order: mockOrder })
    const mockEq = vi.fn().mockReturnValue({ contains: mockContains })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisTimelineYears(
      'n1',
      CampaignType.PEOPLE_OF_THE_LANTERN
    )

    expect(result).toEqual([mockTimelineYear])
    expect(mockContains).toHaveBeenCalledWith('campaign_types', [
      'PEOPLE_OF_THE_LANTERN'
    ])
  })

  it('throws when query fails', async () => {
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisTimelineYears('n1')).rejects.toThrow(
      'Error Fetching Nemesis Timeline Years: DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisTimelineYears('n1')).rejects.toThrow(
      'Nemesis Timeline Year(s) Not Found'
    )
  })
})

describe('addNemesisTimelineYear', () => {
  it('inserts a nemesis timeline year and returns its id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'ty1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addNemesisTimelineYear({
      nemesis_id: 'n1',
      year_number: 1,
      entries: [],
      campaign_types: ['PEOPLE_OF_THE_LANTERN']
    })

    expect(result).toBe('ty1')
    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_timeline_year')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addNemesisTimelineYear({
        nemesis_id: 'n1',
        year_number: 1,
        entries: [],
        campaign_types: []
      })
    ).rejects.toThrow('Error Adding Nemesis Timeline Year: Insert failed')
  })
})

describe('updateNemesisTimelineYear', () => {
  it('updates a nemesis timeline year successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateNemesisTimelineYear('ty1', { year_number: 2 })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_timeline_year')
    expect(mockEq).toHaveBeenCalledWith('id', 'ty1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateNemesisTimelineYear('ty1', { year_number: 2 })
    ).rejects.toThrow('Error Updating Nemesis Timeline Year: Update failed')
  })
})

describe('removeNemesisTimelineYear', () => {
  it('removes a nemesis timeline year successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeNemesisTimelineYear('ty1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_timeline_year')
    expect(mockEq).toHaveBeenCalledWith('id', 'ty1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeNemesisTimelineYear('ty1')).rejects.toThrow(
      'Error Removing Nemesis Timeline Year: Delete failed'
    )
  })
})
