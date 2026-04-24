import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementInnovations,
  addSettlementInnovations,
  updateSettlementInnovation,
  removeSettlementInnovation
} = await import('@/lib/dal/settlement-innovation')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSettlementInnovations', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementInnovations(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementInnovations(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns mapped innovations (innovation as object)', async () => {
    const rawItem = {
      id: 'si-1',
      innovation_id: 'i-1',
      innovation: { innovation_name: 'Cooking' }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementInnovations('settlement-1')

    expect(result).toEqual([
      {
        id: 'si-1',
        innovation_id: 'i-1',
        innovation_name: 'Cooking',
        rules: null,
        consequences: null,
        benefits: null
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_innovation')
  })

  it('returns mapped innovations (innovation as array)', async () => {
    const rawItem = {
      id: 'si-1',
      innovation_id: 'i-1',
      innovation: [{ innovation_name: 'Cooking' }]
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementInnovations('settlement-1')

    expect(result).toEqual([
      {
        id: 'si-1',
        innovation_id: 'i-1',
        innovation_name: 'Cooking',
        rules: null,
        consequences: null,
        benefits: null
      }
    ])
  })

  it('returns empty array when no innovations exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementInnovations('settlement-1')

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

    await expect(getSettlementInnovations('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Innovations: DB error'
    )
  })
})

describe('addSettlementInnovations', () => {
  it('throws when settlementId is null', async () => {
    await expect(addSettlementInnovations(['i-1'], null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when innovationIds is empty', async () => {
    const result = await addSettlementInnovations([], 'settlement-1')

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts and returns mapped innovations', async () => {
    const rawItem = {
      id: 'si-1',
      innovation_id: 'i-1',
      innovation: { innovation_name: 'Cooking' }
    }
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: [rawItem], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementInnovations(['i-1'], 'settlement-1')

    expect(result).toEqual([
      {
        id: 'si-1',
        innovation_id: 'i-1',
        innovation_name: 'Cooking',
        rules: null,
        consequences: null,
        benefits: null
      }
    ])
    expect(mockInsert).toHaveBeenCalledWith([
      { innovation_id: 'i-1', settlement_id: 'settlement-1' }
    ])
  })

  it('throws when insert fails', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementInnovations(['i-1'], 'settlement-1')
    ).rejects.toThrow('Error Adding Settlement Innovations: Insert failed')
  })
})

describe('updateSettlementInnovation', () => {
  it('updates an innovation successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementInnovation('si-1', { innovation_id: 'i-2' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_innovation')
    expect(mockUpdate).toHaveBeenCalledWith({ innovation_id: 'i-2' })
    expect(mockEq).toHaveBeenCalledWith('id', 'si-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementInnovation('si-1', { innovation_id: 'i-2' })
    ).rejects.toThrow('Error Updating Settlement Innovation: Update failed')
  })
})

describe('removeSettlementInnovation', () => {
  it('removes an innovation successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementInnovation('si-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_innovation')
    expect(mockEq).toHaveBeenCalledWith('id', 'si-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementInnovation('si-1')).rejects.toThrow(
      'Error Removing Settlement Innovation: Delete failed'
    )
  })
})
