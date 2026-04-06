import { SettlementTimelineYearDetail } from '@/lib/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementTimelineYears,
  addSettlementTimelineYears,
  addSettlementTimelineYear,
  removeSettlementTimelineYearEntry,
  saveSettlementTimelineYearEntry,
  toggleSettlementYearCompletionStatus,
  updateSettlementTimelineYear,
  removeSettlementTimelineYear
} = await import('@/lib/dal/settlement-timeline-year')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSettlementTimelineYears', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementTimelineYears(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementTimelineYears(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns timeline years keyed by year_number', async () => {
    const mockData = [
      { id: 'sty1', year_number: 1, completed: false, entries: ['a'] },
      { id: 'sty2', year_number: 2, completed: true, entries: ['b', 'c'] }
    ]
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSettlementTimelineYears('settlement-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_timeline_year')
    expect(mockSelect).toHaveBeenCalledWith(
      'completed, entries, id, year_number'
    )
    expect(mockEq).toHaveBeenCalledWith('settlement_id', 'settlement-1')
    expect(result).toEqual({
      1: { completed: false, entries: ['a'], id: 'sty1' },
      2: { completed: true, entries: ['b', 'c'], id: 'sty2' }
    })
  })

  it('returns empty map when data is null', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSettlementTimelineYears('settlement-1')

    expect(result).toEqual({})
  })

  it('throws when query fails', async () => {
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getSettlementTimelineYears('settlement-1')).rejects.toThrow(
      'Error Fetching Timeline Years for Settlement: DB error'
    )
  })
})

describe('addSettlementTimelineYears', () => {
  it('returns early when array is empty without calling from()', async () => {
    await expect(addSettlementTimelineYears([])).resolves.toBeUndefined()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts array of timeline years', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const years = [
      { settlement_id: 's1', year_number: 1, completed: false, entries: [] },
      { settlement_id: 's1', year_number: 2, completed: false, entries: [] }
    ]

    await expect(addSettlementTimelineYears(years)).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_timeline_year')
    expect(mockInsert).toHaveBeenCalledWith(years)
  })

  it('throws when insert fails', async () => {
    const mockInsert = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Insert failed' } })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementTimelineYears([
        { settlement_id: 's1', year_number: 1 } as SettlementTimelineYearDetail
      ])
    ).rejects.toThrow(
      'Error Adding Timeline Years to Settlement: Insert failed'
    )
  })
})

describe('addSettlementTimelineYear', () => {
  it('throws when settlementId is null', async () => {
    await expect(addSettlementTimelineYear(null, 1)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts a single timeline year and returns the new id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'sty-new' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementTimelineYear('settlement-1', 3)

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_timeline_year')
    expect(mockInsert).toHaveBeenCalledWith({
      completed: false,
      entries: [],
      settlement_id: 'settlement-1',
      year_number: 3
    })
    expect(result).toBe('sty-new')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(addSettlementTimelineYear('settlement-1', 3)).rejects.toThrow(
      'Error Adding Settlement Timeline Year: Insert failed'
    )
  })
})

describe('removeSettlementTimelineYearEntry', () => {
  const buildMocks = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchResult: { data: any; error: any },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateResult: { error: any }
  ) => {
    const mockFirstSingle = vi.fn().mockResolvedValue(fetchResult)
    const mockFirstEq = vi.fn().mockReturnValue({ single: mockFirstSingle })
    const mockFirstSelect = vi.fn().mockReturnValue({ eq: mockFirstEq })

    const mockSecondEq = vi.fn().mockResolvedValue(updateResult)
    const mockSecondUpdate = vi.fn().mockReturnValue({ eq: mockSecondEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: mockFirstSelect })
      .mockReturnValueOnce({ update: mockSecondUpdate })

    return { mockFirstEq, mockFirstSelect, mockSecondEq, mockSecondUpdate }
  }

  it('throws when settlementTimelineYearId is null', async () => {
    await expect(removeSettlementTimelineYearEntry(null, 0)).rejects.toThrow(
      'Required: Settlement Timeline Year ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when first query errors', async () => {
    const mockFirstSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Fetch error' } })
    const mockFirstEq = vi.fn().mockReturnValue({ single: mockFirstSingle })
    const mockFirstSelect = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValueOnce({ select: mockFirstSelect })

    await expect(removeSettlementTimelineYearEntry('sty-1', 0)).rejects.toThrow(
      'Error Fetching Settlement Timeline Year for Entry Removal: Fetch error'
    )
  })

  it('throws when data is null (not found)', async () => {
    const mockFirstSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const mockFirstEq = vi.fn().mockReturnValue({ single: mockFirstSingle })
    const mockFirstSelect = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValueOnce({ select: mockFirstSelect })

    await expect(removeSettlementTimelineYearEntry('sty-1', 0)).rejects.toThrow(
      'Settlement Timeline Year Not Found for Entry Removal'
    )
  })

  it('throws when entryIndex is out of bounds (negative)', async () => {
    const mockFirstSingle = vi
      .fn()
      .mockResolvedValue({ data: { entries: ['a', 'b'] }, error: null })
    const mockFirstEq = vi.fn().mockReturnValue({ single: mockFirstSingle })
    const mockFirstSelect = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValueOnce({ select: mockFirstSelect })

    await expect(
      removeSettlementTimelineYearEntry('sty-1', -1)
    ).rejects.toThrow('Entry Index Out of Bounds for Removal')
  })

  it('throws when entryIndex is out of bounds (too large)', async () => {
    const mockFirstSingle = vi
      .fn()
      .mockResolvedValue({ data: { entries: ['a', 'b'] }, error: null })
    const mockFirstEq = vi.fn().mockReturnValue({ single: mockFirstSingle })
    const mockFirstSelect = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValueOnce({ select: mockFirstSelect })

    await expect(removeSettlementTimelineYearEntry('sty-1', 2)).rejects.toThrow(
      'Entry Index Out of Bounds for Removal'
    )
  })

  it('removes entry at index and returns updated entries', async () => {
    buildMocks(
      { data: { entries: ['a', 'b', 'c'] }, error: null },
      { error: null }
    )

    const result = await removeSettlementTimelineYearEntry('sty-1', 1)

    expect(result).toEqual(['a', 'c'])
  })

  it('removes first entry correctly', async () => {
    buildMocks(
      { data: { entries: ['a', 'b', 'c'] }, error: null },
      { error: null }
    )

    const result = await removeSettlementTimelineYearEntry('sty-1', 0)

    expect(result).toEqual(['b', 'c'])
  })

  it('removes last entry correctly', async () => {
    buildMocks(
      { data: { entries: ['a', 'b', 'c'] }, error: null },
      { error: null }
    )

    const result = await removeSettlementTimelineYearEntry('sty-1', 2)

    expect(result).toEqual(['a', 'b'])
  })

  it('throws when update errors', async () => {
    buildMocks(
      { data: { entries: ['a', 'b', 'c'] }, error: null },
      { error: { message: 'Update failed' } }
    )

    await expect(removeSettlementTimelineYearEntry('sty-1', 1)).rejects.toThrow(
      'Error Updating Settlement Timeline Year for Entry Removal: Update failed'
    )
  })
})

describe('saveSettlementTimelineYearEntry', () => {
  const buildMocks = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchResult: { data: any; error: any },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateResult: { error: any }
  ) => {
    const mockFirstSingle = vi.fn().mockResolvedValue(fetchResult)
    const mockFirstEq = vi.fn().mockReturnValue({ single: mockFirstSingle })
    const mockFirstSelect = vi.fn().mockReturnValue({ eq: mockFirstEq })

    const mockSecondEq = vi.fn().mockResolvedValue(updateResult)
    const mockSecondUpdate = vi.fn().mockReturnValue({ eq: mockSecondEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: mockFirstSelect })
      .mockReturnValueOnce({ update: mockSecondUpdate })

    return { mockSecondUpdate, mockSecondEq }
  }

  it('throws when settlementTimelineYearId is null', async () => {
    await expect(
      saveSettlementTimelineYearEntry(null, 'val', 0)
    ).rejects.toThrow('Required: Settlement Timeline Year ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when first query errors', async () => {
    const mockFirstSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Fetch error' } })
    const mockFirstEq = vi.fn().mockReturnValue({ single: mockFirstSingle })
    const mockFirstSelect = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValueOnce({ select: mockFirstSelect })

    await expect(
      saveSettlementTimelineYearEntry('sty-1', 'val', 0)
    ).rejects.toThrow(
      'Error Fetching Settlement Timeline Year for Entry Addition: Fetch error'
    )
  })

  it('throws when data is null (not found)', async () => {
    const mockFirstSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: null })
    const mockFirstEq = vi.fn().mockReturnValue({ single: mockFirstSingle })
    const mockFirstSelect = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValueOnce({ select: mockFirstSelect })

    await expect(
      saveSettlementTimelineYearEntry('sty-1', 'val', 0)
    ).rejects.toThrow('Settlement Timeline Year Not Found for Entry Addition')
  })

  it('throws when entryIndex is negative', async () => {
    const mockFirstSingle = vi
      .fn()
      .mockResolvedValue({ data: { entries: ['a', 'b'] }, error: null })
    const mockFirstEq = vi.fn().mockReturnValue({ single: mockFirstSingle })
    const mockFirstSelect = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValueOnce({ select: mockFirstSelect })

    await expect(
      saveSettlementTimelineYearEntry('sty-1', 'val', -1)
    ).rejects.toThrow('Entry Index Cannot Be Negative for Entry Addition')
  })

  it('appends to end when entryIndex equals entries length', async () => {
    const { mockSecondUpdate } = buildMocks(
      { data: { entries: ['a', 'b'] }, error: null },
      { error: null }
    )

    const result = await saveSettlementTimelineYearEntry('sty-1', 'new', 2)

    expect(result).toEqual(['a', 'b', 'new'])
    expect(mockSecondUpdate).toHaveBeenCalledWith({
      entries: ['a', 'b', 'new']
    })
  })

  it('appends to end when entryIndex exceeds entries length', async () => {
    buildMocks({ data: { entries: ['a'] }, error: null }, { error: null })

    const result = await saveSettlementTimelineYearEntry('sty-1', 'new', 5)

    expect(result).toEqual(['a', 'new'])
  })

  it('replaces entry at index when within bounds', async () => {
    const { mockSecondUpdate } = buildMocks(
      { data: { entries: ['a', 'b', 'c'] }, error: null },
      { error: null }
    )

    const result = await saveSettlementTimelineYearEntry('sty-1', 'updated', 1)

    expect(result).toEqual(['a', 'updated', 'c'])
    expect(mockSecondUpdate).toHaveBeenCalledWith({
      entries: ['a', 'updated', 'c']
    })
  })

  it('throws when update errors', async () => {
    buildMocks(
      { data: { entries: ['a', 'b'] }, error: null },
      { error: { message: 'Update failed' } }
    )

    await expect(
      saveSettlementTimelineYearEntry('sty-1', 'new', 0)
    ).rejects.toThrow(
      'Error Updating Settlement Timeline Year for Entry Addition: Update failed'
    )
  })
})

describe('toggleSettlementYearCompletionStatus', () => {
  it('throws when settlementTimelineYearId is null', async () => {
    await expect(
      toggleSettlementYearCompletionStatus(null, 0, true)
    ).rejects.toThrow('Required: Settlement Timeline Year ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('updates completion status to true', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      toggleSettlementYearCompletionStatus('sty-1', 1, true)
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_timeline_year')
    expect(mockUpdate).toHaveBeenCalledWith({ completed: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'sty-1')
  })

  it('updates completion status to false', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      toggleSettlementYearCompletionStatus('sty-1', 1, false)
    ).resolves.toBeUndefined()

    expect(mockUpdate).toHaveBeenCalledWith({ completed: false })
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      toggleSettlementYearCompletionStatus('sty-1', 1, true)
    ).rejects.toThrow(
      'Error Toggling Settlement Timeline Year Completion Status: Update failed'
    )
  })
})

describe('updateSettlementTimelineYear', () => {
  it('updates matching row', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementTimelineYear('sty-1', { completed: true })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_timeline_year')
    expect(mockUpdate).toHaveBeenCalledWith({ completed: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'sty-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementTimelineYear('sty-1', { completed: false })
    ).rejects.toThrow('Error Updating Settlement Timeline Year: Update failed')
  })
})

describe('removeSettlementTimelineYear', () => {
  it('deletes matching row', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementTimelineYear('sty-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_timeline_year')
    expect(mockEq).toHaveBeenCalledWith('id', 'sty-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementTimelineYear('sty-1')).rejects.toThrow(
      'Error Removing Settlement Timeline Year: Delete failed'
    )
  })
})
