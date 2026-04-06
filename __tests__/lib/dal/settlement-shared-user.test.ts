import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSettlementSharedUsers,
  addSettlementSharedUsers,
  removeSettlementSharedUsers
} = await import('@/lib/dal/settlement-shared-user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSettlementSharedUsers', () => {
  it('returns mapped shared users on success', async () => {
    const mockEq = vi.fn().mockResolvedValue({
      data: [
        { shared_user_id: 'u-1', user_settings: { username: 'testuser' } }
      ],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSettlementSharedUsers('settlement-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_shared_user')
    expect(mockSelect).toHaveBeenCalledWith(
      'shared_user_id, user_settings!shared_user_id(username)'
    )
    expect(mockEq).toHaveBeenCalledWith('settlement_id', 'settlement-1')
    expect(result).toEqual([{ shared_user_id: 'u-1', username: 'testuser' }])
  })

  it('returns empty array when data is empty', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSettlementSharedUsers('settlement-1')

    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSettlementSharedUsers('settlement-1')

    expect(result).toEqual([])
  })

  it('throws on error', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

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
    const mockIn = vi.fn().mockResolvedValue({ error: null })
    const mockEq = vi.fn().mockReturnValue({ in: mockIn })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await removeSettlementSharedUsers('settlement-1', ['u-1', 'u-2'])

    expect(mockSupabase.from).toHaveBeenCalledWith('settlement_shared_user')
    expect(mockEq).toHaveBeenCalledWith('settlement_id', 'settlement-1')
    expect(mockIn).toHaveBeenCalledWith('shared_user_id', ['u-1', 'u-2'])
  })

  it('throws on error', async () => {
    const mockIn = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockEq = vi.fn().mockReturnValue({ in: mockIn })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(
      removeSettlementSharedUsers('settlement-1', ['u-1'])
    ).rejects.toThrow('Error Removing Settlement Shared Users: Delete failed')
  })
})
