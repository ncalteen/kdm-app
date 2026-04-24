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
  getSecretFightingArtSharedUsers,
  addSecretFightingArtSharedUsers,
  removeSecretFightingArtSharedUsers
} = await import('@/lib/dal/secret-fighting-art-shared-user')
const { getUserId } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSecretFightingArtSharedUsers', () => {
  it('returns mapped shared users on success', async () => {
    const mockEq = vi.fn().mockResolvedValue({
      data: [
        { shared_user_id: 'u-1', user_settings: { username: 'testuser' } }
      ],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSecretFightingArtSharedUsers(
      'secret_fighting_art-1'
    )

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'secret_fighting_art_shared_user'
    )
    expect(mockSelect).toHaveBeenCalledWith(
      'shared_user_id, user_settings!shared_user_id(username)'
    )
    expect(mockEq).toHaveBeenCalledWith(
      'secret_fighting_art_id',
      'secret_fighting_art-1'
    )
    expect(result).toEqual([{ shared_user_id: 'u-1', username: 'testuser' }])
  })

  it('returns empty array when data is empty', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSecretFightingArtSharedUsers(
      'secret_fighting_art-1'
    )

    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSecretFightingArtSharedUsers(
      'secret_fighting_art-1'
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
      getSecretFightingArtSharedUsers('secret_fighting_art-1')
    ).rejects.toThrow(
      'Error Fetching Secret Fighting Art Shared Users: DB error'
    )
  })
})

describe('addSecretFightingArtSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await addSecretFightingArtSharedUsers('secret_fighting_art-1', [], 'user-1')

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts shared users correctly', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await addSecretFightingArtSharedUsers(
      'secret_fighting_art-1',
      ['u-1', 'u-2'],
      'user-1'
    )

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'secret_fighting_art_shared_user'
    )
    expect(mockInsert).toHaveBeenCalledWith([
      {
        secret_fighting_art_id: 'secret_fighting_art-1',
        shared_user_id: 'u-1',
        user_id: 'user-1'
      },
      {
        secret_fighting_art_id: 'secret_fighting_art-1',
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
      addSecretFightingArtSharedUsers(
        'secret_fighting_art-1',
        ['u-1'],
        'user-1'
      )
    ).rejects.toThrow(
      'Error Adding Secret Fighting Art Shared Users: Insert failed'
    )
  })
})

describe('removeSecretFightingArtSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await removeSecretFightingArtSharedUsers('secret_fighting_art-1', [])

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('deletes shared users correctly', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1')
    const mockEqUser = vi.fn().mockResolvedValue({ error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEqUser })
    const mockEq = vi.fn().mockReturnValue({ in: mockIn })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await removeSecretFightingArtSharedUsers('secret_fighting_art-1', [
      'u-1',
      'u-2'
    ])

    expect(mockSupabase.from).toHaveBeenCalledWith(
      'secret_fighting_art_shared_user'
    )
    expect(mockEq).toHaveBeenCalledWith(
      'secret_fighting_art_id',
      'secret_fighting_art-1'
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
      removeSecretFightingArtSharedUsers('secret_fighting_art-1', ['u-1'])
    ).rejects.toThrow(
      'Error Removing Secret Fighting Art Shared Users: Delete failed'
    )
  })
})
