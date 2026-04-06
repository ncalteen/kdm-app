import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementPatterns,
  addSettlementPatterns,
  updateSettlementPattern,
  removeSettlementPattern
} = await import('@/lib/dal/settlement-pattern')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSettlementPatterns', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementPatterns(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementPatterns(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns mapped patterns', async () => {
    const rawItem = {
      id: 'sp-1',
      pattern_id: 'pat-1',
      pattern: { pattern_name: 'Rawhide Headband' }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementPatterns('settlement-1')

    expect(result).toEqual([
      { id: 'sp-1', pattern_id: 'pat-1', pattern_name: 'Rawhide Headband' }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_pattern')
  })

  it('returns empty array when no patterns exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementPatterns('settlement-1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getSettlementPatterns('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Patterns: DB error'
    )
  })
})

describe('addSettlementPatterns', () => {
  it('throws when settlementId is null', async () => {
    await expect(addSettlementPatterns(['pat-1'], null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when patternIds is empty', async () => {
    const result = await addSettlementPatterns([], 'settlement-1')

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts and returns ids', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'sp-1' }], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementPatterns(['pat-1'], 'settlement-1')

    expect(result).toEqual([{ id: 'sp-1' }])
    expect(mockInsert).toHaveBeenCalledWith([
      { pattern_id: 'pat-1', settlement_id: 'settlement-1' }
    ])
  })

  it('throws when insert fails', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementPatterns(['pat-1'], 'settlement-1')
    ).rejects.toThrow('Error Adding Settlement Patterns: Insert failed')
  })
})

describe('updateSettlementPattern', () => {
  it('updates a pattern successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementPattern('sp-1', { pattern_id: 'pat-2' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_pattern')
    expect(mockUpdate).toHaveBeenCalledWith({ pattern_id: 'pat-2' })
    expect(mockEq).toHaveBeenCalledWith('id', 'sp-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementPattern('sp-1', { pattern_id: 'pat-2' })
    ).rejects.toThrow('Error Updating Settlement Pattern: Update failed')
  })
})

describe('removeSettlementPattern', () => {
  it('removes a pattern successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementPattern('sp-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_pattern')
    expect(mockEq).toHaveBeenCalledWith('id', 'sp-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementPattern('sp-1')).rejects.toThrow(
      'Error Removing Settlement Pattern: Delete failed'
    )
  })
})
