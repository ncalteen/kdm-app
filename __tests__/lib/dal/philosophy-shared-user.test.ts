import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const { getPhilosophySharedUsers, addPhilosophySharedUsers, removePhilosophySharedUsers } = await import(
  '@/lib/dal/philosophy-shared-user'
)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPhilosophySharedUsers', () => {
  it('returns mapped shared users on success', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({
        data: [{ shared_user_id: 'u-1', user_settings: { username: 'testuser' } }],
        error: null
      })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getPhilosophySharedUsers('philosophy-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('philosophy_shared_user')
    expect(mockSelect).toHaveBeenCalledWith(
      'shared_user_id, user_settings!shared_user_id(username)'
    )
    expect(mockEq).toHaveBeenCalledWith('philosophy_id', 'philosophy-1')
    expect(result).toEqual([{ shared_user_id: 'u-1', username: 'testuser' }])
  })

  it('returns empty array when data is empty', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getPhilosophySharedUsers('philosophy-1')

    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getPhilosophySharedUsers('philosophy-1')

    expect(result).toEqual([])
  })

  it('throws on error', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getPhilosophySharedUsers('philosophy-1')).rejects.toThrow(
      'Error Fetching Philosophy Shared Users: DB error'
    )
  })
})

describe('addPhilosophySharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await addPhilosophySharedUsers('philosophy-1', [], 'user-1')

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts shared users correctly', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await addPhilosophySharedUsers('philosophy-1', ['u-1', 'u-2'], 'user-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('philosophy_shared_user')
    expect(mockInsert).toHaveBeenCalledWith([
      { philosophy_id: 'philosophy-1', shared_user_id: 'u-1', user_id: 'user-1' },
      { philosophy_id: 'philosophy-1', shared_user_id: 'u-2', user_id: 'user-1' }
    ])
  })

  it('throws on error', async () => {
    const mockInsert = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Insert failed' } })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addPhilosophySharedUsers('philosophy-1', ['u-1'], 'user-1')
    ).rejects.toThrow('Error Adding Philosophy Shared Users: Insert failed')
  })
})

describe('removePhilosophySharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await removePhilosophySharedUsers('philosophy-1', [])

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('deletes shared users correctly', async () => {
    const mockIn = vi.fn().mockResolvedValue({ error: null })
    const mockEq = vi.fn().mockReturnValue({ in: mockIn })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await removePhilosophySharedUsers('philosophy-1', ['u-1', 'u-2'])

    expect(mockSupabase.from).toHaveBeenCalledWith('philosophy_shared_user')
    expect(mockEq).toHaveBeenCalledWith('philosophy_id', 'philosophy-1')
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
      removePhilosophySharedUsers('philosophy-1', ['u-1'])
    ).rejects.toThrow('Error Removing Philosophy Shared Users: Delete failed')
  })
})
