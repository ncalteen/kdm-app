import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementSeedPatterns,
  addSettlementSeedPatterns,
  updateSettlementSeedPattern,
  removeSettlementSeedPattern
} = await import('@/lib/dal/settlement-seed-pattern')

beforeEach(() => {
  vi.clearAllMocks()
  // Default: no settlement members surfaced (covers tests that don't
  // exercise author_username resolution). Individual tests override.
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
})

describe('getSettlementSeedPatterns', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementSeedPatterns(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementSeedPatterns(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns mapped seed patterns', async () => {
    const rawItem = {
      id: 'ssp-1',
      seed_pattern_id: 'sp-1',
      seed_pattern: { seed_pattern_name: 'Skull Cap Helm' }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementSeedPatterns('settlement-1')

    expect(result).toEqual([
      {
        id: 'ssp-1',
        seed_pattern_id: 'sp-1',
        seed_pattern_name: 'Skull Cap Helm',
        author_username: null
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_seed_pattern')
  })

  it('returns empty array when no seed patterns exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementSeedPatterns('settlement-1')

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

    await expect(getSettlementSeedPatterns('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Seed Patterns: DB error'
    )
  })
})

describe('addSettlementSeedPatterns', () => {
  it('throws when settlementId is null', async () => {
    await expect(addSettlementSeedPatterns(['sp-1'], null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when seedPatternIds is empty', async () => {
    const result = await addSettlementSeedPatterns([], 'settlement-1')

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts and returns ids', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'ssp-1' }], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementSeedPatterns(['sp-1'], 'settlement-1')

    expect(result).toEqual([{ id: 'ssp-1' }])
    expect(mockInsert).toHaveBeenCalledWith([
      { seed_pattern_id: 'sp-1', settlement_id: 'settlement-1' }
    ])
  })

  it('throws when insert fails', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementSeedPatterns(['sp-1'], 'settlement-1')
    ).rejects.toThrow('Error Adding Settlement Seed Patterns: Insert failed')
  })
})

describe('updateSettlementSeedPattern', () => {
  it('updates a seed pattern successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementSeedPattern('ssp-1', { seed_pattern_id: 'sp-2' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_seed_pattern')
    expect(mockUpdate).toHaveBeenCalledWith({ seed_pattern_id: 'sp-2' })
    expect(mockEq).toHaveBeenCalledWith('id', 'ssp-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementSeedPattern('ssp-1', { seed_pattern_id: 'sp-2' })
    ).rejects.toThrow('Error Updating Settlement Seed Pattern: Update failed')
  })
})

describe('removeSettlementSeedPattern', () => {
  it('removes a seed pattern successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementSeedPattern('ssp-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_seed_pattern')
    expect(mockEq).toHaveBeenCalledWith('id', 'ssp-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementSeedPattern('ssp-1')).rejects.toThrow(
      'Error Removing Settlement Seed Pattern: Delete failed'
    )
  })
})
