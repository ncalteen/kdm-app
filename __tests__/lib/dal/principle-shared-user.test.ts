import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const { getPrincipleSharedUsers, addPrincipleSharedUsers, removePrincipleSharedUsers } = await import(
  '@/lib/dal/principle-shared-user'
)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPrincipleSharedUsers', () => {
  it('returns mapped shared users on success', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({
        data: [{ shared_user_id: 'u-1', user_settings: { username: 'testuser' } }],
        error: null
      })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getPrincipleSharedUsers('principle-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('principle_shared_user')
    expect(mockSelect).toHaveBeenCalledWith(
      'shared_user_id, user_settings!shared_user_id(username)'
    )
    expect(mockEq).toHaveBeenCalledWith('principle_id', 'principle-1')
    expect(result).toEqual([{ shared_user_id: 'u-1', username: 'testuser' }])
  })

  it('returns empty array when data is empty', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getPrincipleSharedUsers('principle-1')

    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getPrincipleSharedUsers('principle-1')

    expect(result).toEqual([])
  })

  it('throws on error', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getPrincipleSharedUsers('principle-1')).rejects.toThrow(
      'Error Fetching Principle Shared Users: DB error'
    )
  })
})

describe('addPrincipleSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await addPrincipleSharedUsers('principle-1', [], 'user-1')

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('inserts shared users correctly', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await addPrincipleSharedUsers('principle-1', ['u-1', 'u-2'], 'user-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('principle_shared_user')
    expect(mockInsert).toHaveBeenCalledWith([
      { principle_id: 'principle-1', shared_user_id: 'u-1', user_id: 'user-1' },
      { principle_id: 'principle-1', shared_user_id: 'u-2', user_id: 'user-1' }
    ])
  })

  it('throws on error', async () => {
    const mockInsert = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Insert failed' } })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addPrincipleSharedUsers('principle-1', ['u-1'], 'user-1')
    ).rejects.toThrow('Error Adding Principle Shared Users: Insert failed')
  })
})

describe('removePrincipleSharedUsers', () => {
  it('returns early without calling from() when sharedUserIds is empty', async () => {
    await removePrincipleSharedUsers('principle-1', [])

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('deletes shared users correctly', async () => {
    const mockIn = vi.fn().mockResolvedValue({ error: null })
    const mockEq = vi.fn().mockReturnValue({ in: mockIn })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await removePrincipleSharedUsers('principle-1', ['u-1', 'u-2'])

    expect(mockSupabase.from).toHaveBeenCalledWith('principle_shared_user')
    expect(mockEq).toHaveBeenCalledWith('principle_id', 'principle-1')
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
      removePrincipleSharedUsers('principle-1', ['u-1'])
    ).rejects.toThrow('Error Removing Principle Shared Users: Delete failed')
  })
})
