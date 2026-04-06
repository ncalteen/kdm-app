import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getQuarryCollectiveCognitionRewardJunctionIds,
  getQuarryCollectiveCognitionRewardIds,
  getQuarryCollectiveCognitionRewards,
  addQuarryCollectiveCognitionReward,
  updateQuarryCollectiveCognitionReward,
  removeQuarryCollectiveCognitionReward
} = await import('@/lib/dal/quarry-collective-cognition-reward')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getQuarryCollectiveCognitionRewardJunctionIds', () => {
  it('returns junction row IDs for a quarry', async () => {
    const mockEq = vi.fn().mockResolvedValue({
      data: [{ id: 'jid1' }, { id: 'jid2' }],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryCollectiveCognitionRewardJunctionIds('q1')

    expect(result).toEqual(['jid1', 'jid2'])
    expect(mockSupabase.from).toHaveBeenCalledWith(
      'quarry_collective_cognition_reward'
    )
    expect(mockEq).toHaveBeenCalledWith('quarry_id', 'q1')
  })

  it('returns empty array when no junctions exist', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryCollectiveCognitionRewardJunctionIds('q1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(
      getQuarryCollectiveCognitionRewardJunctionIds('q1')
    ).rejects.toThrow('Error Fetching Quarry CC Reward Junction IDs: DB error')
  })
})

describe('getQuarryCollectiveCognitionRewardIds', () => {
  it('throws when quarryId is null', async () => {
    await expect(getQuarryCollectiveCognitionRewardIds(null)).rejects.toThrow(
      'Required: Quarry ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when quarryId is undefined', async () => {
    await expect(
      getQuarryCollectiveCognitionRewardIds(undefined)
    ).rejects.toThrow('Required: Quarry ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns reward IDs for a valid quarry', async () => {
    const mockEq = vi.fn().mockResolvedValue({
      data: [
        { collective_cognition_reward_id: 'r1' },
        { collective_cognition_reward_id: 'r2' }
      ],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryCollectiveCognitionRewardIds('q1')

    expect(result).toEqual(['r1', 'r2'])
  })

  it('throws when query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryCollectiveCognitionRewardIds('q1')).rejects.toThrow(
      'Error Fetching Quarry Collective Cognition Rewards: DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryCollectiveCognitionRewardIds('q1')).rejects.toThrow(
      'Quarry Collective Cognition Reward(s) Not Found'
    )
  })
})

describe('getQuarryCollectiveCognitionRewards', () => {
  it('throws when quarryId is null', async () => {
    await expect(getQuarryCollectiveCognitionRewards(null)).rejects.toThrow(
      'Required: Quarry ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when quarryId is undefined', async () => {
    await expect(
      getQuarryCollectiveCognitionRewards(undefined)
    ).rejects.toThrow('Required: Quarry ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns reward details for a valid quarry', async () => {
    const rewardRow = {
      collective_cognition_reward: {
        collective_cognition: 3,
        custom: false,
        id: 'r1',
        reward_name: 'Ammonia'
      }
    }
    const mockEq = vi.fn().mockResolvedValue({ data: [rewardRow], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryCollectiveCognitionRewards('q1')

    expect(result).toEqual([
      {
        collective_cognition: 3,
        custom: false,
        id: 'r1',
        reward_name: 'Ammonia'
      }
    ])
  })

  it('throws when query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryCollectiveCognitionRewards('q1')).rejects.toThrow(
      'Error Fetching Quarry Collective Cognition Rewards: DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryCollectiveCognitionRewards('q1')).rejects.toThrow(
      'Quarry Collective Cognition Reward(s) Not Found'
    )
  })
})

describe('addQuarryCollectiveCognitionReward', () => {
  it('inserts a quarry CC reward junction and returns its id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'qccr1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addQuarryCollectiveCognitionReward({
      quarry_id: 'q1',
      collective_cognition_reward_id: 'r1'
    })

    expect(result).toBe('qccr1')
    expect(mockSupabase.from).toHaveBeenCalledWith(
      'quarry_collective_cognition_reward'
    )
    expect(mockInsert).toHaveBeenCalledWith({
      quarry_id: 'q1',
      collective_cognition_reward_id: 'r1'
    })
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addQuarryCollectiveCognitionReward({
        quarry_id: 'q1',
        collective_cognition_reward_id: 'r1'
      })
    ).rejects.toThrow(
      'Error Adding Quarry Collective Cognition Reward: Insert failed'
    )
  })
})

describe('updateQuarryCollectiveCognitionReward', () => {
  it('updates a quarry CC reward junction successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateQuarryCollectiveCognitionReward('qccr1', {
        collective_cognition_reward_id: 'r2'
      })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'quarry_collective_cognition_reward'
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'qccr1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateQuarryCollectiveCognitionReward('qccr1', {
        collective_cognition_reward_id: 'r2'
      })
    ).rejects.toThrow(
      'Error Updating Quarry Collective Cognition Reward: Update failed'
    )
  })
})

describe('removeQuarryCollectiveCognitionReward', () => {
  it('removes a quarry CC reward junction successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeQuarryCollectiveCognitionReward('qccr1')
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'quarry_collective_cognition_reward'
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'qccr1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeQuarryCollectiveCognitionReward('qccr1')
    ).rejects.toThrow(
      'Error Removing Quarry Collective Cognition Reward: Delete failed'
    )
  })
})
