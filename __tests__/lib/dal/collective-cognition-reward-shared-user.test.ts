import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/user', () => ({
  getUserId: vi.fn()
}))

const {
  getCollectiveCognitionRewardSharedUsers,
  addCollectiveCognitionRewardSharedUsers,
  removeCollectiveCognitionRewardSharedUsers
} = await import('@/lib/dal/collective-cognition-reward-shared-user')
const { getUserId } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCollectiveCognitionRewardSharedUsers', () => {
  it('returns mapped shared users on success', async () => {
    const mockEq = vi.fn().mockResolvedValue({
      data: [
        { shared_user_id: 'u-1', user_settings: { username: 'testuser' } }
      ],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getCollectiveCognitionRewardSharedUsers(
      'collective_cognition_reward-1'
    )

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'collective_cognition_reward_shared_user'
    )
    expect(mockSelect).toHaveBeenCalledWith(
      'shared_user_id, user_settings!shared_user_id(username)'
    )
    expect(mockEq).toHaveBeenCalledWith(
      'collective_cognition_reward_id',
      'collective_cognition_reward-1'
    )
    expect(result).toEqual([{ shared_user_id: 'u-1', username: 'testuser' }])
  })

  it('returns empty array when data is empty', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getCollectiveCognitionRewardSharedUsers(
      'collective_cognition_reward-1'
    )

    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getCollectiveCognitionRewardSharedUsers(
      'collective_cognition_reward-1'
    )

    expect(result).toEqual([])
  })

  it('throws on error', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(
      getCollectiveCognitionRewardSharedUsers('collective_cognition_reward-1')
    ).rejects.toThrow(
      'Error Fetching Collective Cognition Reward Shared Users: DB error'
    )
  })
})

describe('addCollectiveCognitionRewardSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await addCollectiveCognitionRewardSharedUsers(
      'collective_cognition_reward-1',
      [],
      'user-1'
    )

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts shared users correctly', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await addCollectiveCognitionRewardSharedUsers(
      'collective_cognition_reward-1',
      ['u-1', 'u-2'],
      'user-1'
    )

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'collective_cognition_reward_shared_user'
    )
    expect(mockInsert).toHaveBeenCalledWith([
      {
        collective_cognition_reward_id: 'collective_cognition_reward-1',
        shared_user_id: 'u-1',
        user_id: 'user-1'
      },
      {
        collective_cognition_reward_id: 'collective_cognition_reward-1',
        shared_user_id: 'u-2',
        user_id: 'user-1'
      }
    ])
  })

  it('throws on error', async () => {
    const mockInsert = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Insert failed' } })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addCollectiveCognitionRewardSharedUsers(
        'collective_cognition_reward-1',
        ['u-1'],
        'user-1'
      )
    ).rejects.toThrow(
      'Error Adding Collective Cognition Reward Shared Users: Insert failed'
    )
  })
})

describe('removeCollectiveCognitionRewardSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await removeCollectiveCognitionRewardSharedUsers(
      'collective_cognition_reward-1',
      []
    )

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('deletes shared users correctly', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    const mockEqUser = vi.fn().mockResolvedValue({ error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEqUser })
    const mockEq = vi.fn().mockReturnValue({ in: mockIn })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await removeCollectiveCognitionRewardSharedUsers(
      'collective_cognition_reward-1',
      ['u-1', 'u-2']
    )

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'collective_cognition_reward_shared_user'
    )
    expect(mockEq).toHaveBeenCalledWith(
      'collective_cognition_reward_id',
      'collective_cognition_reward-1'
    )
    expect(mockIn).toHaveBeenCalledWith('shared_user_id', ['u-1', 'u-2'])
    expect(mockEqUser).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('throws on error', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    const mockEqUser = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEqUser })
    const mockEq = vi.fn().mockReturnValue({ in: mockIn })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeCollectiveCognitionRewardSharedUsers(
        'collective_cognition_reward-1',
        ['u-1']
      )
    ).rejects.toThrow(
      'Error Removing Collective Cognition Reward Shared Users: Delete failed'
    )
  })
})
