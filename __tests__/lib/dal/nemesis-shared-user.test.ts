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
  getNemesisSharedUsers,
  addNemesisSharedUsers,
  removeNemesisSharedUsers
} = await import('@/lib/dal/nemesis-shared-user')
const { getUserId } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getNemesisSharedUsers', () => {
  it('returns mapped shared users on success', async () => {
    const mockEq = vi.fn().mockResolvedValue({
      data: [
        { shared_user_id: 'u-1', user_settings: { username: 'testuser' } }
      ],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisSharedUsers('nemesis-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_shared_user')
    expect(mockSelect).toHaveBeenCalledWith(
      'shared_user_id, user_settings!shared_user_id(username)'
    )
    expect(mockEq).toHaveBeenCalledWith('nemesis_id', 'nemesis-1')
    expect(result).toEqual([{ shared_user_id: 'u-1', username: 'testuser' }])
  })

  it('returns empty array when data is empty', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisSharedUsers('nemesis-1')

    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisSharedUsers('nemesis-1')

    expect(result).toEqual([])
  })

  it('throws on error', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisSharedUsers('nemesis-1')).rejects.toThrow(
      'Error Fetching Nemesis Shared Users: DB error'
    )
  })
})

describe('addNemesisSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await addNemesisSharedUsers('nemesis-1', [], 'user-1')

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts shared users correctly', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await addNemesisSharedUsers('nemesis-1', ['u-1', 'u-2'], 'user-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_shared_user')
    expect(mockInsert).toHaveBeenCalledWith([
      { nemesis_id: 'nemesis-1', shared_user_id: 'u-1', user_id: 'user-1' },
      { nemesis_id: 'nemesis-1', shared_user_id: 'u-2', user_id: 'user-1' }
    ])
  })

  it('throws on error', async () => {
    const mockInsert = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Insert failed' } })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addNemesisSharedUsers('nemesis-1', ['u-1'], 'user-1')
    ).rejects.toThrow('Error Adding Nemesis Shared Users: Insert failed')
  })
})

describe('removeNemesisSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await removeNemesisSharedUsers('nemesis-1', [])

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('deletes shared users correctly', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    const mockEqUser = vi.fn().mockResolvedValue({ error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEqUser })
    const mockEq = vi.fn().mockReturnValue({ in: mockIn })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await removeNemesisSharedUsers('nemesis-1', ['u-1', 'u-2'])

    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_shared_user')
    expect(mockEq).toHaveBeenCalledWith('nemesis_id', 'nemesis-1')
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
      removeNemesisSharedUsers('nemesis-1', ['u-1'])
    ).rejects.toThrow('Error Removing Nemesis Shared Users: Delete failed')
  })
})
