import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementCollectiveCognitionRewards,
  addSettlementCollectiveCognitionRewards,
  updateSettlementCollectiveCognitionReward,
  removeSettlementCollectiveCognitionReward
} = await import('@/lib/dal/settlement-collective-cognition-reward')

beforeEach(() => {
  vi.clearAllMocks()
  // Default: no settlement members surfaced (covers tests that don't
  // exercise author_username resolution). Individual tests override.
  mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
})

describe('getSettlementCollectiveCognitionRewards', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementCollectiveCognitionRewards(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(
      getSettlementCollectiveCognitionRewards(undefined)
    ).rejects.toThrow('Required: Settlement ID')
  })

  it('returns mapped rewards', async () => {
    const rawItem = {
      id: 'scr-1',
      collective_cognition_reward_id: 'cr-1',
      unlocked: false,
      collective_cognition_reward: {
        reward_name: 'Reward A',
        collective_cognition: 3
      }
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [rawItem], error: null })
      })
    })

    const result = await getSettlementCollectiveCognitionRewards('settlement-1')

    expect(result).toEqual([
      {
        collective_cognition_reward_id: 'cr-1',
        id: 'scr-1',
        unlocked: false,
        reward_name: 'Reward A',
        collective_cognition: 3,
        author_username: null
      }
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith(
      'settlement_collective_cognition_reward'
    )
  })

  it('returns empty array when no rewards exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getSettlementCollectiveCognitionRewards('settlement-1')

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

    await expect(
      getSettlementCollectiveCognitionRewards('settlement-1')
    ).rejects.toThrow(
      'Error Fetching Settlement Collective Cognition Rewards: DB error'
    )
  })
})

describe('addSettlementCollectiveCognitionRewards', () => {
  it('throws when settlementId is null', async () => {
    await expect(
      addSettlementCollectiveCognitionRewards(['cr-1'], null)
    ).rejects.toThrow('Required: Settlement ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty array when rewardIds is empty', async () => {
    const result = await addSettlementCollectiveCognitionRewards(
      [],
      'settlement-1'
    )

    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts and returns mapped rewards', async () => {
    const rawItem = {
      id: 'scr-1',
      collective_cognition_reward: {
        collective_cognition: 3,
        reward_name: 'Reward A'
      }
    }
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: [rawItem], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSettlementCollectiveCognitionRewards(
      ['cr-1'],
      'settlement-1'
    )

    expect(result).toEqual([
      { id: 'scr-1', collective_cognition: 3, reward_name: 'Reward A' }
    ])
    expect(mockInsert).toHaveBeenCalledWith([
      {
        collective_cognition_reward_id: 'cr-1',
        settlement_id: 'settlement-1',
        unlocked: false
      }
    ])
  })

  it('throws when insert fails', async () => {
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addSettlementCollectiveCognitionRewards(['cr-1'], 'settlement-1')
    ).rejects.toThrow(
      'Error Adding Collective Cognition Rewards to Settlement: Insert failed'
    )
  })
})

describe('updateSettlementCollectiveCognitionReward', () => {
  it('updates a reward successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementCollectiveCognitionReward('scr-1', { unlocked: true })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'settlement_collective_cognition_reward'
    )
    expect(mockUpdate).toHaveBeenCalledWith({ unlocked: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'scr-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSettlementCollectiveCognitionReward('scr-1', { unlocked: true })
    ).rejects.toThrow(
      'Error Updating Settlement Collective Cognition Reward: Update failed'
    )
  })
})

describe('removeSettlementCollectiveCognitionReward', () => {
  it('removes a reward successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeSettlementCollectiveCognitionReward('scr-1')
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'settlement_collective_cognition_reward'
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'scr-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeSettlementCollectiveCognitionReward('scr-1')
    ).rejects.toThrow(
      'Error Removing Settlement Collective Cognition Reward: Delete failed'
    )
  })
})
