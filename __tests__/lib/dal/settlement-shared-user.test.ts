import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/user', () => ({
  getUserId: vi.fn()
}))

const {
  getSettlementSharedUsers,
  addSettlementSharedUsers,
  removeSettlementSharedUsers,
  getUnshareBlockers,
  getSettlementMemberUsernames
} = await import('@/lib/dal/settlement-shared-user')
const { getUserId } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSettlementSharedUsers', () => {
  it('calls the get_settlement_collaborators RPC and maps the rows', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: [
        {
          shared_user_id: 'u-1',
          username: 'testuser',
          avatar_url: 'https://example.test/avatar.png',
          created_at: '2026-04-25T00:00:00.000Z'
        }
      ],
      error: null
    })

    const result = await getSettlementSharedUsers('settlement-1')

    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'get_settlement_collaborators',
      { target_settlement: 'settlement-1' }
    )
    expect(result).toEqual([
      {
        shared_user_id: 'u-1',
        username: 'testuser',
        avatar_url: 'https://example.test/avatar.png',
        created_at: '2026-04-25T00:00:00.000Z'
      }
    ])
  })

  it('coerces null username/avatar to safe defaults', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: [
        {
          shared_user_id: 'u-2',
          username: null,
          avatar_url: null,
          created_at: '2026-04-26T00:00:00.000Z'
        }
      ],
      error: null
    })

    const result = await getSettlementSharedUsers('settlement-1')

    expect(result).toEqual([
      {
        shared_user_id: 'u-2',
        username: '',
        avatar_url: null,
        created_at: '2026-04-26T00:00:00.000Z'
      }
    ])
  })

  it('returns empty array when data is empty', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

    const result = await getSettlementSharedUsers('settlement-1')

    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

    const result = await getSettlementSharedUsers('settlement-1')

    expect(result).toEqual([])
  })

  it('throws on error', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'DB error' }
    })

    await expect(getSettlementSharedUsers('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Shared Users: DB error'
    )
  })
})

describe('addSettlementSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await addSettlementSharedUsers('settlement-1', [], 'user-1')

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts shared users correctly', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await addSettlementSharedUsers('settlement-1', ['u-1', 'u-2'], 'user-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_shared_user')
    expect(mockInsert).toHaveBeenCalledWith([
      {
        settlement_id: 'settlement-1',
        shared_user_id: 'u-1',
        user_id: 'user-1'
      },
      {
        settlement_id: 'settlement-1',
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
      addSettlementSharedUsers('settlement-1', ['u-1'], 'user-1')
    ).rejects.toThrow('Error Adding Settlement Shared Users: Insert failed')
  })
})

describe('removeSettlementSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await removeSettlementSharedUsers('settlement-1', [])

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('deletes shared users correctly', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    const mockEqUser = vi.fn().mockResolvedValue({ error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEqUser })
    const mockEq = vi.fn().mockReturnValue({ in: mockIn })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await removeSettlementSharedUsers('settlement-1', ['u-1', 'u-2'])

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_shared_user')
    expect(mockEq).toHaveBeenCalledWith('settlement_id', 'settlement-1')
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
      removeSettlementSharedUsers('settlement-1', ['u-1'])
    ).rejects.toThrow('Error Removing Settlement Shared Users: Delete failed')
  })
})

describe('getUnshareBlockers', () => {
  it('calls the get_unshare_blockers RPC and maps snake_case rows to camelCase', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: [
        {
          kind: 'knowledge',
          item_name: 'Custom Knowledge',
          item_id: 'k-1'
        },
        {
          kind: 'gear',
          item_name: 'Custom Gear',
          item_id: 'g-1'
        }
      ],
      error: null
    })

    const result = await getUnshareBlockers('settlement-1', 'user-2')

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_unshare_blockers', {
      p_settlement_id: 'settlement-1',
      p_shared_user_id: 'user-2'
    })
    expect(result).toEqual([
      { kind: 'knowledge', itemName: 'Custom Knowledge', itemId: 'k-1' },
      { kind: 'gear', itemName: 'Custom Gear', itemId: 'g-1' }
    ])
  })

  it('returns empty array when the RPC returns null data', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

    const result = await getUnshareBlockers('settlement-1', 'user-2')

    expect(result).toEqual([])
  })

  it('returns empty array when the RPC returns an empty list', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

    const result = await getUnshareBlockers('settlement-1', 'user-2')

    expect(result).toEqual([])
  })

  it('throws on RPC error', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'permission denied' }
    })

    await expect(getUnshareBlockers('settlement-1', 'user-2')).rejects.toThrow(
      'Error Fetching Unshare Blockers: permission denied'
    )
  })
})

describe('getSettlementMemberUsernames', () => {
  it('throws when settlementId is null', async () => {
    await expect(getSettlementMemberUsernames(null)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.rpc).not.toHaveBeenCalled()
  })

  it('throws when settlementId is undefined', async () => {
    await expect(getSettlementMemberUsernames(undefined)).rejects.toThrow(
      'Required: Settlement ID'
    )
    expect(mockSupabase.rpc).not.toHaveBeenCalled()
  })

  it('calls get_settlement_member_usernames and builds a user_id -> profile map', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: [
        { user_id: 'u-1', username: 'alpha', avatar_url: 'https://a/1.png' },
        { user_id: 'u-2', username: 'beta', avatar_url: null }
      ],
      error: null
    })

    const result = await getSettlementMemberUsernames('settlement-1')

    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'get_settlement_member_usernames',
      { target_settlement: 'settlement-1' }
    )
    expect(result).toBeInstanceOf(Map)
    expect(result.size).toBe(2)
    expect(result.get('u-1')).toEqual({
      username: 'alpha',
      avatar_url: 'https://a/1.png'
    })
    expect(result.get('u-2')).toEqual({
      username: 'beta',
      avatar_url: null
    })
  })

  it('returns an empty map when the RPC returns null data', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

    const result = await getSettlementMemberUsernames('settlement-1')

    expect(result).toBeInstanceOf(Map)
    expect(result.size).toBe(0)
  })

  it('returns an empty map when the RPC returns an empty list', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

    const result = await getSettlementMemberUsernames('settlement-1')

    expect(result.size).toBe(0)
  })

  it('skips rows with null user_id or null username', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: [
        { user_id: 'u-1', username: 'alpha', avatar_url: null },
        { user_id: null, username: 'orphan', avatar_url: null },
        { user_id: 'u-3', username: null, avatar_url: null }
      ],
      error: null
    })

    const result = await getSettlementMemberUsernames('settlement-1')

    expect(result.size).toBe(1)
    expect(result.get('u-1')).toEqual({ username: 'alpha', avatar_url: null })
  })

  it('throws on RPC error', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'permission denied' }
    })

    await expect(getSettlementMemberUsernames('settlement-1')).rejects.toThrow(
      'Error Fetching Settlement Member Usernames: permission denied'
    )
  })
})
