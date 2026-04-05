import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getWandererTimelineYears,
  addWandererTimelineYear,
  updateWandererTimelineYear,
  removeWandererTimelineYear
} = await import('@/lib/dal/wanderer-timeline-year')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getWandererTimelineYears', () => {
  it('throws when wandererId is null', async () => {
    await expect(getWandererTimelineYears(null)).rejects.toThrow('Required: Wanderer ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when wandererId is undefined', async () => {
    await expect(getWandererTimelineYears(undefined)).rejects.toThrow('Required: Wanderer ID')
  })

  it('returns timeline years keyed by id', async () => {
    const mockData = [
      { id: 'wty1', wanderer_id: 'w1', entries: ['a'], year_number: 1 },
      { id: 'wty2', wanderer_id: 'w1', entries: ['b'], year_number: 2 }
    ]
    const mockEq = vi.fn().mockResolvedValue({ data: mockData, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getWandererTimelineYears('w1')

    expect(mockSupabase.from).toHaveBeenCalledWith('wanderer_timeline_year')
    expect(mockSelect).toHaveBeenCalledWith('id, wanderer_id, entries, year_number')
    expect(mockEq).toHaveBeenCalledWith('wanderer_id', 'w1')
    expect(result).toEqual({
      wty1: mockData[0],
      wty2: mockData[1]
    })
  })

  it('returns empty map when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getWandererTimelineYears('w1')

    expect(result).toEqual({})
  })

  it('throws when query fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getWandererTimelineYears('w1')).rejects.toThrow(
      'Error Fetching Wanderer Timeline Years: DB error'
    )
  })
})

describe('addWandererTimelineYear', () => {
  it('inserts and returns the new row id', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'wty-new' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addWandererTimelineYear({ wanderer_id: 'w1', year_number: 1, entries: [] })

    expect(mockSupabase.from).toHaveBeenCalledWith('wanderer_timeline_year')
    expect(mockInsert).toHaveBeenCalledWith({ wanderer_id: 'w1', year_number: 1, entries: [] })
    expect(result).toBe('wty-new')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addWandererTimelineYear({ wanderer_id: 'w1', year_number: 1, entries: [] })
    ).rejects.toThrow('Error Adding Wanderer Timeline Year: Insert failed')
  })
})

describe('updateWandererTimelineYear', () => {
  it('updates matching row', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateWandererTimelineYear('wty-1', { entries: ['updated'] })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('wanderer_timeline_year')
    expect(mockUpdate).toHaveBeenCalledWith({ entries: ['updated'] })
    expect(mockEq).toHaveBeenCalledWith('id', 'wty-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateWandererTimelineYear('wty-1', { entries: [] })).rejects.toThrow(
      'Error Updating Wanderer Timeline Year: Update failed'
    )
  })
})

describe('removeWandererTimelineYear', () => {
  it('deletes matching row', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeWandererTimelineYear('wty-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('wanderer_timeline_year')
    expect(mockEq).toHaveBeenCalledWith('id', 'wty-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeWandererTimelineYear('wty-1')).rejects.toThrow(
      'Error Removing Wanderer Timeline Year: Delete failed'
    )
  })
})
