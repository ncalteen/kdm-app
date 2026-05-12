import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementPhilosophies,
  addSettlementPhilosophies,
  updateSettlementPhilosophy,
  removeSettlementPhilosophy
} = await import('@/lib/dal/settlement-philosophy')

beforeEach(() => {
  vi.clearAllMocks()
  // Default: no settlement members surfaced (covers tests that don't
  // exercise author_username resolution). Individual tests override.
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
})

describe('getSettlementPhilosophies', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementPhilosophies(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementPhilosophies(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns mapped philosophies', async () => {
    const rawItem = {
      id: 'sph-1',
      philosophy_id: 'ph-1',
      philosophy: {
        custom: false,
        user_id: null,
        philosophy_name: 'Survival of the Fittest',
        hunt_xp_milestones: null,
        tenet_knowledge_id: null,
        tier: null,
        neurosis_id: null
      }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementPhilosophies('settlement-1')

    expect(result).toEqual([
      {
        id: 'sph-1',
        philosophy_id: 'ph-1',
        philosophy_name: 'Survival of the Fittest',
        hunt_xp_milestones: null,
        tenet_knowledge_id: null,
        tier: null,
        neurosis_id: null,
        custom: false,
        author_username: null
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_philosophy')
  })

  it('returns empty array when no philosophies exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementPhilosophies('settlement-1')

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

    await expect(getSettlementPhilosophies('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Philosophies: DB error'
    )
  })
})

describe('addSettlementPhilosophies', () => {
  it('throws when settlementId is null', async () => {
    await expect(addSettlementPhilosophies(['ph-1'], null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when philosophyIds is empty', async () => {
    const result = await addSettlementPhilosophies([], 'settlement-1')

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts and returns ids', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'sph-1' }], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementPhilosophies(['ph-1'], 'settlement-1')

    expect(result).toEqual([{ id: 'sph-1' }])
    expect(mockInsert).toHaveBeenCalledWith([
      { philosophy_id: 'ph-1', settlement_id: 'settlement-1' }
    ])
  })

  it('throws when insert fails', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementPhilosophies(['ph-1'], 'settlement-1')
    ).rejects.toThrow('Error Adding Settlement Philosophies: Insert failed')
  })
})

describe('updateSettlementPhilosophy', () => {
  it('updates a philosophy successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementPhilosophy('sph-1', { philosophy_id: 'ph-2' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_philosophy')
    expect(mockUpdate).toHaveBeenCalledWith({ philosophy_id: 'ph-2' })
    expect(mockEq).toHaveBeenCalledWith('id', 'sph-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementPhilosophy('sph-1', { philosophy_id: 'ph-2' })
    ).rejects.toThrow('Error Updating Settlement Philosophy: Update failed')
  })
})

describe('removeSettlementPhilosophy', () => {
  it('removes a philosophy successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementPhilosophy('sph-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_philosophy')
    expect(mockEq).toHaveBeenCalledWith('id', 'sph-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementPhilosophy('sph-1')).rejects.toThrow(
      'Error Removing Settlement Philosophy: Delete failed'
    )
  })
})
