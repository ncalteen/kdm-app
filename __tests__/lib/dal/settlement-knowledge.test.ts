import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementKnowledges,
  addSettlementKnowledges,
  updateSettlementKnowledge,
  removeSettlementKnowledge
} = await import('@/lib/dal/settlement-knowledge')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSettlementKnowledges', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementKnowledges(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementKnowledges(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns mapped knowledges', async () => {
    const rawItem = {
      id: 'sk-1',
      knowledge_id: 'k-1',
      knowledge: { knowledge_name: 'Hovel' }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementKnowledges('settlement-1')

    expect(result).toEqual([
      { id: 'sk-1', knowledge_id: 'k-1', knowledge_name: 'Hovel' }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_knowledge')
  })

  it('returns empty array when no knowledges exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementKnowledges('settlement-1')

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

    await expect(getSettlementKnowledges('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Knowledges: DB error'
    )
  })
})

describe('addSettlementKnowledges', () => {
  it('throws when settlementId is null', async () => {
    await expect(addSettlementKnowledges(['k-1'], null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when knowledgeIds is empty', async () => {
    const result = await addSettlementKnowledges([], 'settlement-1')

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts and returns ids', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'sk-1' }], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementKnowledges(['k-1'], 'settlement-1')

    expect(result).toEqual([{ id: 'sk-1' }])
    expect(mockInsert).toHaveBeenCalledWith([
      { knowledge_id: 'k-1', settlement_id: 'settlement-1' }
    ])
  })

  it('throws when insert fails', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementKnowledges(['k-1'], 'settlement-1')
    ).rejects.toThrow('Error Adding Settlement Knowledges: Insert failed')
  })
})

describe('updateSettlementKnowledge', () => {
  it('updates a knowledge successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementKnowledge('sk-1', { knowledge_id: 'k-2' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_knowledge')
    expect(mockUpdate).toHaveBeenCalledWith({ knowledge_id: 'k-2' })
    expect(mockEq).toHaveBeenCalledWith('id', 'sk-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementKnowledge('sk-1', { knowledge_id: 'k-2' })
    ).rejects.toThrow('Error Updating Settlement Knowledge: Update failed')
  })
})

describe('removeSettlementKnowledge', () => {
  it('removes a knowledge successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementKnowledge('sk-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_knowledge')
    expect(mockEq).toHaveBeenCalledWith('id', 'sk-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementKnowledge('sk-1')).rejects.toThrow(
      'Error Removing Settlement Knowledge: Delete failed'
    )
  })
})
