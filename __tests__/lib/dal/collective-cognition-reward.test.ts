import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getCollectiveCognitionRewards,
  getCollectiveCognitionRewardIds,
  addCollectiveCognitionReward,
  updateCollectiveCognitionReward,
  removeCollectiveCognitionReward
} = await import('@/lib/dal/collective-cognition-reward')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCollectiveCognitionRewards', () => {
  const mockUser = { id: 'user-1' }
  const row1 = { id: 'r1', custom: false, name: 'Reward', threshold: 1, rules: null }
  const row2 = { id: 'r2', custom: true, name: 'Custom', threshold: 2, rules: null }

  it('returns every row surfaced by RLS', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({
        data: [row1, row2],
        error: null
      })
    })

    const result = await getCollectiveCognitionRewards()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('collective_cognition_reward')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getCollectiveCognitionRewards()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getCollectiveCognitionRewards()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when the query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    })

    await expect(getCollectiveCognitionRewards()).rejects.toThrow(
      'Error Fetching Collective Cognition Rewards: DB error'
    )
  })

  it('returns an empty map when the query returns no rows', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    })

    const result = await getCollectiveCognitionRewards()
    expect(result).toEqual({})
  })
})

describe('getCollectiveCognitionRewardIds', () => {
  it('fetches reward IDs without userId', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'r1' }, { id: 'r2' }], error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getCollectiveCognitionRewardIds(
      ['Ammonia', 'Cloth'],
      false
    )

    expect(result).toEqual(['r1', 'r2'])
    expect(mockSupabase.from).toHaveBeenCalledWith(
      'collective_cognition_reward'
    )
  })

  it('fetches reward IDs with userId', async () => {
    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'r3' }], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq1 })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getCollectiveCognitionRewardIds(
      ['My Reward'],
      true,
      'user-1'
    )

    expect(result).toEqual(['r3'])
  })

  it('throws when query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(
      getCollectiveCognitionRewardIds(['Ammonia'], false)
    ).rejects.toThrow(
      'Error Fetching Collective Cognition Reward ID(s): DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(
      getCollectiveCognitionRewardIds(['Ammonia'], false)
    ).rejects.toThrow('Collective Cognition Reward(s) Not Found')
  })
})

describe('addCollectiveCognitionReward', () => {
  const mockUser = { id: 'user-1' }
  const mockReward = {
    id: 'r1',
    custom: false,
    reward_name: 'Ammonia',
    collective_cognition: 3
  }

  it('inserts a non-custom reward without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockReward, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addCollectiveCognitionReward({
      reward_name: 'Ammonia',
      custom: false,
      collective_cognition: 3
    })

    expect(result).toEqual(mockReward)
    expect(mockInsert).toHaveBeenCalledWith({
      reward_name: 'Ammonia',
      custom: false,
      collective_cognition: 3
    })
  })

  it('inserts a custom reward with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customReward = {
      id: 'r2',
      custom: true,
      reward_name: 'My Reward',
      collective_cognition: 5
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customReward, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addCollectiveCognitionReward({
      reward_name: 'My Reward',
      custom: true,
      collective_cognition: 5
    })

    expect(result).toEqual(customReward)
    expect(mockInsert).toHaveBeenCalledWith({
      reward_name: 'My Reward',
      custom: true,
      collective_cognition: 5,
      user_id: mockUser.id
    })
  })

  it('throws when custom reward requires auth but user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(
      addCollectiveCognitionReward({
        reward_name: 'My Reward',
        custom: true,
        collective_cognition: 5
      })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addCollectiveCognitionReward({
        reward_name: 'Ammonia',
        custom: false,
        collective_cognition: 3
      })
    ).rejects.toThrow('Error Fetching User: Auth error')
  })

  it('throws when DB insert fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addCollectiveCognitionReward({
        reward_name: 'Ammonia',
        custom: false,
        collective_cognition: 3
      })
    ).rejects.toThrow('Error Adding Collective Cognition Reward: Insert failed')
  })
})

describe('updateCollectiveCognitionReward', () => {
  it('updates a reward successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateCollectiveCognitionReward('r1', { reward_name: 'Updated Ammonia' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'collective_cognition_reward'
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'r1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateCollectiveCognitionReward('r1', { reward_name: 'Ammonia' })
    ).rejects.toThrow(
      'Error Updating Collective Cognition Reward: Update failed'
    )
  })
})

describe('removeCollectiveCognitionReward', () => {
  it('removes a reward successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeCollectiveCognitionReward('r1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'collective_cognition_reward'
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'r1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeCollectiveCognitionReward('r1')).rejects.toThrow(
      'Error Removing Collective Cognition Reward: Delete failed'
    )
  })
})
