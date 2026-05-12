import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementMilestones,
  addSettlementMilestones,
  updateSettlementMilestone,
  removeSettlementMilestone
} = await import('@/lib/dal/settlement-milestone')

beforeEach(() => {
  vi.clearAllMocks()
  // Default: no settlement members surfaced (covers tests that don't
  // exercise author_username resolution). Individual tests override.
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
})

describe('getSettlementMilestones', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementMilestones(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementMilestones(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
  })

  it('returns mapped milestones', async () => {
    const rawItem = {
      complete: false,
      id: 'sm-1',
      milestone_id: 'mil-1',
      milestone: {
        custom: false,
        user_id: null,
        event_name: 'First Story',
        milestone_name: 'First Survivor Death',
        requirements: null,
        rules: null
      }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementMilestones('settlement-1')

    expect(result).toEqual([
      {
        complete: false,
        event_name: 'First Story',
        id: 'sm-1',
        milestone_id: 'mil-1',
        milestone_name: 'First Survivor Death',
        requirements: null,
        rules: null,
        custom: false,
        author_username: null
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_milestone')
  })

  it('returns empty array when no milestones exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementMilestones('settlement-1')

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

    await expect(getSettlementMilestones('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Milestones: DB error'
    )
  })
})

describe('addSettlementMilestones', () => {
  it('throws when settlementId is null', async () => {
    await expect(addSettlementMilestones(['mil-1'], null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when milestoneIds is empty', async () => {
    const result = await addSettlementMilestones([], 'settlement-1')

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts and returns ids', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'sm-1' }], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementMilestones(['mil-1'], 'settlement-1')

    expect(result).toEqual([{ id: 'sm-1' }])
    expect(mockInsert).toHaveBeenCalledWith([
      { complete: false, milestone_id: 'mil-1', settlement_id: 'settlement-1' }
    ])
  })

  it('throws when insert fails', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementMilestones(['mil-1'], 'settlement-1')
    ).rejects.toThrow('Error Adding Settlement Milestones: Insert failed')
  })
})

describe('updateSettlementMilestone', () => {
  it('updates a milestone successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementMilestone('sm-1', { complete: true })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_milestone')
    expect(mockUpdate).toHaveBeenCalledWith({ complete: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'sm-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementMilestone('sm-1', { complete: true })
    ).rejects.toThrow('Error Updating Settlement Milestone: Update failed')
  })
})

describe('removeSettlementMilestone', () => {
  it('removes a milestone successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementMilestone('sm-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_milestone')
    expect(mockEq).toHaveBeenCalledWith('id', 'sm-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSettlementMilestone('sm-1')).rejects.toThrow(
      'Error Removing Settlement Milestone: Delete failed'
    )
  })
})
