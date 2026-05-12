import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
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
  // Default: no settlement members surfaced (covers tests that don't
  // exercise author_username resolution). Individual tests override.
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
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
      knowledge: {
        custom: false,
        user_id: null,
        knowledge_name: 'Hovel',
        philosophy_id: null,
        rules: null,
        observation_conditions: null,
        observation_rank_up_milestone: null
      }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementKnowledges('settlement-1')

    expect(result).toEqual([
      {
        id: 'sk-1',
        knowledge_id: 'k-1',
        knowledge_name: 'Hovel',
        philosophy_id: null,
        rules: null,
        observation_conditions: null,
        observation_rank_up_milestone: null,
        custom: false,
        author_username: null
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_knowledge')
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'get_settlement_member_usernames',
      { target_settlement: 'settlement-1' }
    )
  })

  it('returns author_username for custom rows authored by a settlement member', async () => {
    const rawItem = {
      id: 'sk-1',
      knowledge_id: 'k-1',
      knowledge: {
        custom: true,
        user_id: 'author-1',
        knowledge_name: 'Whispers',
        philosophy_id: null,
        rules: null,
        observation_conditions: null,
        observation_rank_up_milestone: null
      }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })
    mockSupabase.rpc.mockResolvedValue({
      data: [{ user_id: 'author-1', username: 'ashen.veil' }],
      error: null
    })

    const [result] = await getSettlementKnowledges('settlement-1')

    expect(result.custom).toBe(true)
    expect(result.author_username).toBe('ashen.veil')
  })

  it('returns null author_username for custom rows whose author left the settlement', async () => {
    const rawItem = {
      id: 'sk-1',
      knowledge_id: 'k-1',
      knowledge: {
        custom: true,
        user_id: 'ghost-1',
        knowledge_name: 'Echoes',
        philosophy_id: null,
        rules: null,
        observation_conditions: null,
        observation_rank_up_milestone: null
      }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })
    mockSupabase.rpc.mockResolvedValue({
      data: [{ user_id: 'someone-else', username: 'still.here' }],
      error: null
    })

    const [result] = await getSettlementKnowledges('settlement-1')

    expect(result.custom).toBe(true)
    expect(result.author_username).toBeNull()
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
